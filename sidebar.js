/* ============ DOM refs ============ */
const chatContainer     = document.getElementById("chat-container");
const userInput         = document.getElementById("user-input");
const sendBtn           = document.getElementById("send-btn");
const stopBtn           = document.getElementById("stop-btn");
const toggleSettingsBtn = document.getElementById("toggle-settings");
const settingsPane      = document.getElementById("settings-pane");
const btnFetchModels    = document.getElementById("btn-fetch-models");
const cfgUrl            = document.getElementById("cfg-url");
const cfgModel          = document.getElementById("cfg-model");
const cfgSystemPrompt   = document.getElementById("cfg-system-prompt");
const cfgTemp           = document.getElementById("cfg-temp");
const cfgCtx            = document.getElementById("cfg-ctx");
const cfgStream         = document.getElementById("cfg-stream");
const tempVal           = document.getElementById("temp-val");
const currentModelTag   = document.getElementById("current-model-tag");
const filePicker        = document.getElementById("file-picker");
const attachBtn         = document.getElementById("attach-btn");
const previewZone       = document.getElementById("input-preview-zone");
const clearBtn          = document.getElementById("clear-btn");
const themeMenu         = document.getElementById("theme-menu");
const statusDot         = document.getElementById("status-indicator");
const statusText        = document.getElementById("status-text");
const tokenCounter      = document.getElementById("token-counter");
const convTabs          = document.getElementById("conversation-tabs");
const newConvBtn        = document.getElementById("new-conversation-btn");

/* ============ State ============ */
let currentImages = [];
let contextFileText = "";
let conversations = {};      // { id: { title, messages: [], createdAt } }
let activeConvId = null;
let currentAbortController = null;
let isGenerating = false;

/* ============ Init ============ */
browser.storage.local.get([
  "serverUrl", "selectedModel", "theme", "systemPrompt",
  "temperature", "contextLength", "stream", "conversations", "activeConvId"
]).then((res) => {
  if (res.serverUrl) cfgUrl.value = res.serverUrl;
  if (res.theme) {
    document.body.setAttribute("data-theme", res.theme);
    themeMenu.value = res.theme;
  }
  if (res.systemPrompt) cfgSystemPrompt.value = res.systemPrompt;
  if (res.temperature) { cfgTemp.value = res.temperature; tempVal.textContent = res.temperature; }
  if (res.contextLength) cfgCtx.value = res.contextLength;
  if (typeof res.stream === "boolean") cfgStream.checked = res.stream;

  conversations = res.conversations || {};
  activeConvId = res.activeConvId || null;

  if (res.selectedModel) {
    currentModelTag.innerText = res.selectedModel;
    const opt = document.createElement("option");
    opt.value = res.selectedModel;
    opt.textContent = res.selectedModel;
    cfgModel.appendChild(opt);
    cfgModel.value = res.selectedModel;
  }

  if (!activeConvId || !conversations[activeConvId]) {
    createConversation(true);
  } else {
    renderConversationTabs();
    renderMessages();
  }

  fetchOllamaModels();
  checkServerStatus();
  setInterval(checkServerStatus, 30000);

  // Handle pending prompt from background
  browser.storage.local.get("pendingPrompt").then(r => {
    if (r.pendingPrompt) {
      handleIncomingPrompt(r.pendingPrompt);
      browser.storage.local.remove("pendingPrompt");
    }
  });
});

/* ============ Markdown Parser (rewritten) ============ */
function parseMarkdownToHtml(md) {
  // 1. Extract code blocks first to protect them
  const codeBlocks = [];
  let text = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre class="code-block"><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);
    return `\u0000CB${codeBlocks.length - 1}\u0000`;
  });

  // 2. Escape HTML
  text = escapeHtml(text);

  // 3. Inline code
  text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Headers
  text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^## (.+)$/gm,  '<h3>$1</h3>');
  text = text.replace(/^# (.+)$/gm,   '<h2>$1</h2>');

  // 5. Bold & Italic (order matters)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*\n]+)\*/g,   '<em>$1</em>');

  // 6. Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
  '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // 7. Lists
  text = text.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

  // 8. Paragraphs / line breaks
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  text = `<p>${text}</p>`;

  // 9. Restore code blocks
  text = text.replace(/\u0000CB(\d+)\u0000/g, (_, i) => codeBlocks[+i]);

  return text;
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ============ Conversation Management ============ */
function createConversation(switchTo = true) {
  const id = "conv_" + Date.now();
  conversations[id] = {
    id,
    title: "New Chat",
    messages: [],
    createdAt: Date.now()
  };
  if (switchTo) activeConvId = id;
  saveConversations();
  renderConversationTabs();
  renderMessages();
}
function switchConversation(id) {
  if (isGenerating) return;
  activeConvId = id;
  saveConversations();
  renderConversationTabs();
  renderMessages();
}
function deleteConversation(id, e) {
  e.stopPropagation();
  if (!confirm("Delete this conversation?")) return;
  delete conversations[id];
  if (activeConvId === id) {
    const keys = Object.keys(conversations);
    activeConvId = keys[0] || null;
    if (!activeConvId) createConversation(true);
  }
  saveConversations();
  renderConversationTabs();
  renderMessages();
}
function saveConversations() {
  browser.storage.local.set({ conversations, activeConvId });
}
function renderConversationTabs() {
  convTabs.innerHTML = "";
  Object.values(conversations)
  .sort((a, b) => b.createdAt - a.createdAt)
  .forEach(c => {
    const tab = document.createElement("div");
    tab.className = "conv-tab" + (c.id === activeConvId ? " active" : "");
    tab.innerHTML = `<span>${escapeHtml(c.title)}</span><button class="del-conv">×</button>`;
    tab.onclick = () => switchConversation(c.id);
    tab.querySelector(".del-conv").onclick = (e) => deleteConversation(c.id, e);
    convTabs.appendChild(tab);
  });
}
newConvBtn.onclick = () => createConversation(true);

/* ============ Rendering ============ */
function renderMessages() {
  chatContainer.innerHTML = "";
  const conv = conversations[activeConvId];
  if (!conv) return;
  conv.messages.forEach(m => appendMessage(m.text, m.sender, m.images, false, m.id));
  updateTokenCounter();
}

function appendMessage(text, sender, images = [], save = true, existingId = null) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);
  const msgId = existingId || "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  wrapper.dataset.msgId = msgId;

  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.innerHTML = sender === "user" ? escapeHtml(text).replace(/\n/g, "<br>") : parseMarkdownToHtml(text);
  wrapper.appendChild(msg);

  if (images && images.length > 0) {
    images.forEach(imgBase64 => {
      const imgEl = document.createElement("img");
      imgEl.src = `data:image/jpeg;base64,${imgBase64}`;
      imgEl.classList.add("preview-box");
      msg.appendChild(imgEl);
    });
  }

  // Action buttons
  const actions = document.createElement("div");
  actions.className = "bubble-actions";

  const copyBtn = mkBtn("📋 Copy", () => {
    navigator.clipboard.writeText(msg.innerText).then(() => {
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => copyBtn.textContent = "📋 Copy", 1500);
    });
  });
  actions.appendChild(copyBtn);

  if (sender === "user") {
    const editBtn = mkBtn("✏️ Edit", () => editAndResend(msgId));
    actions.appendChild(editBtn);
  } else {
    const regenBtn = mkBtn("🔄 Regen", () => regenerate(msgId));
    actions.appendChild(regenBtn);
  }
  wrapper.appendChild(actions);

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (save) {
    const conv = conversations[activeConvId];
    conv.messages.push({ id: msgId, text, sender, images: images || [], ts: Date.now() });
    // Auto-title from first user message
    if (sender === "user" && conv.messages.filter(m => m.sender === "user").length === 1) {
      conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      renderConversationTabs();
    }
    saveConversations();
    updateTokenCounter();
  }
  return wrapper;
}
function mkBtn(label, handler) {
  const b = document.createElement("span");
  b.className = "action-link";
  b.textContent = label;
  b.onclick = handler;
  return b;
}

/* ============ Edit / Regenerate ============ */
function editAndResend(msgId) {
  const conv = conversations[activeConvId];
  const idx = conv.messages.findIndex(m => m.id === msgId);
  if (idx < 0) return;
  const original = conv.messages[idx];
  const newText = prompt("Edit message:", original.text);
  if (newText === null || newText.trim() === "") return;
  // Remove this message and everything after it
  conv.messages = conv.messages.slice(0, idx);
  saveConversations();
  renderMessages();
  userInput.value = newText;
  sendBtn.click();
}
function regenerate(msgId) {
  const conv = conversations[activeConvId];
  const idx = conv.messages.findIndex(m => m.id === msgId);
  if (idx < 0) return;
  // Remove assistant message
  conv.messages = conv.messages.slice(0, idx);
  saveConversations();
  renderMessages();
  // Resend last user message
  const lastUser = [...conv.messages].reverse().find(m => m.sender === "user");
  if (lastUser) askOllama(lastUser.text, lastUser.images);
}

/* ============ Event Listeners ============ */
themeMenu.addEventListener("change", e => {
  const t = e.target.value;
  document.body.setAttribute("data-theme", t);
  browser.storage.local.set({ theme: t });
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear current chat?")) return;
  conversations[activeConvId].messages = [];
  conversations[activeConvId].title = "New Chat";
  saveConversations();
  renderMessages();
  renderConversationTabs();
});

toggleSettingsBtn.addEventListener("click", () => {
  settingsPane.style.display = settingsPane.style.display === "block" ? "none" : "block";
});

btnFetchModels.addEventListener("click", fetchOllamaModels);
cfgModel.addEventListener("change", () => {
  browser.storage.local.set({ selectedModel: cfgModel.value });
  currentModelTag.innerText = cfgModel.value;
});
cfgUrl.addEventListener("change", () => browser.storage.local.set({ serverUrl: cfgUrl.value }));
cfgSystemPrompt.addEventListener("change", () => browser.storage.local.set({ systemPrompt: cfgSystemPrompt.value }));
cfgTemp.addEventListener("input", () => {
  tempVal.textContent = cfgTemp.value;
  browser.storage.local.set({ temperature: parseFloat(cfgTemp.value) });
});
cfgCtx.addEventListener("change", () => browser.storage.local.set({ contextLength: parseInt(cfgCtx.value) }));
cfgStream.addEventListener("change", () => browser.storage.local.set({ stream: cfgStream.checked }));

attachBtn.addEventListener("click", () => filePicker.click());
filePicker.addEventListener("change", async e => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const b64 = await fileToBase64(file);
      currentImages.push(b64);
      const thumb = document.createElement("img");
      thumb.src = `data:${file.type};base64,${b64}`;
      thumb.className = "thumb-preview";
      previewZone.appendChild(thumb);
    } else {
      const txt = await file.text();
      contextFileText += `\n\n[Context from ${file.name}]:\n${txt}`;
      const pill = document.createElement("span");
      pill.className = "file-pill";
      pill.textContent = `📄 ${file.name}`;
      previewZone.appendChild(pill);
    }
  }
  filePicker.value = "";
});
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ============ Incoming prompts from background ============ */
browser.runtime.onMessage.addListener(handleIncomingPrompt);
function handleIncomingPrompt(msg) {
  if (msg?.action !== "process-prompt") return;
  currentImages = msg.images || [];
  userInput.value = msg.text || "";
  sendBtn.click();
}

/* ============ Send ============ */
sendBtn.addEventListener("click", () => {
  let text = userInput.value.trim();
  if (!text && currentImages.length === 0 && !contextFileText) return;
  if (contextFileText) text = `${text}\n${contextFileText}`.trim();
  userInput.value = "";
  previewZone.innerHTML = "";
  const imgs = [...currentImages];
  currentImages = [];
  contextFileText = "";
  askOllama(text, imgs);
});
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

/* ============ Stop generation ============ */
stopBtn.addEventListener("click", () => {
  if (currentAbortController) currentAbortController.abort();
});

/* ============ Ollama API call ============ */
async function askOllama(promptText, images = []) {
  appendMessage(promptText, "user", images);
  const wrapper = appendMessage("Thinking…", "assistant");
  const msgDiv = wrapper.querySelector(".message");
  const msgId = wrapper.dataset.msgId;

  sendBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
  isGenerating = true;
  currentAbortController = new AbortController();

  let accumulated = "";
  const url = `${cfgUrl.value.replace(/\/$/, "")}/api/generate`;

  // Build full prompt with system + history (simple last-N approach)
  const conv = conversations[activeConvId];
  const history = conv.messages.slice(-10); // last 10 messages for context
  let fullPrompt = "";
  if (cfgSystemPrompt.value.trim()) {
    fullPrompt += `System: ${cfgSystemPrompt.value.trim()}\n\n`;
  }
  history.forEach(m => {
    if (m.sender === "user") fullPrompt += `User: ${m.text}\n\n`;
    else fullPrompt += `Assistant: ${m.text}\n\n`;
  });
  fullPrompt += `User: ${promptText}\n\nAssistant:`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: currentAbortController.signal,
      body: JSON.stringify({
        model: cfgModel.value || "gemma3",
        prompt: fullPrompt,
        images: images.length ? images : undefined,
        stream: cfgStream.checked,
        options: {
          temperature: parseFloat(cfgTemp.value),
                           num_ctx: parseInt(cfgCtx.value)
        }
      })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    msgDiv.innerHTML = "";

    if (cfgStream.checked) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              accumulated += parsed.response;
              msgDiv.innerHTML = parseMarkdownToHtml(accumulated);
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            if (parsed.done) break;
          } catch { /* partial JSON, ignore */ }
        }
      }
    } else {
      const data = await res.json();
      accumulated = data.response || "";
      msgDiv.innerHTML = parseMarkdownToHtml(accumulated);
    }

    // Save assistant message
    conv.messages.push({
      id: msgId, text: accumulated, sender: "assistant", images: [], ts: Date.now()
    });
    saveConversations();
    updateTokenCounter();

  } catch (err) {
    if (err.name === "AbortError") {
      msgDiv.innerHTML = parseMarkdownToHtml(accumulated + "\n\n*[stopped]*");
      conv.messages.push({ id: msgId, text: accumulated, sender: "assistant", images: [], ts: Date.now() });
      saveConversations();
    } else {
      msgDiv.innerHTML = `<span class="error">⚠️ ${escapeHtml(err.message)}</span>`;
    }
  } finally {
    sendBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
    isGenerating = false;
    currentAbortController = null;
    currentImages = [];
  }
}

/* ============ Model fetching ============ */
async function fetchOllamaModels() {
  try {
    const url = `${cfgUrl.value.replace(/\/$/, "")}/api/tags`;
    const res = await fetch(url);
    const data = await res.json();
    cfgModel.innerHTML = "";
    if (data.models?.length) {
      data.models.forEach(m => {
        const o = document.createElement("option");
        o.value = m.name; o.textContent = m.name;
        cfgModel.appendChild(o);
      });
      if (!cfgModel.value) {
        cfgModel.selectedIndex = 0;
        browser.storage.local.set({ selectedModel: cfgModel.value });
        currentModelTag.innerText = cfgModel.value;
      }
    }
  } catch (e) {
    console.error("Could not fetch models:", e);
  }
}

/* ============ Server status ============ */
async function checkServerStatus() {
  try {
    const res = await fetch(`${cfgUrl.value.replace(/\/$/, "")}/api/tags`);
    if (res.ok) {
      statusDot.className = "status-dot online";
      statusText.textContent = "Ollama online";
    } else throw new Error();
  } catch {
    statusDot.className = "status-dot offline";
    statusText.textContent = "Ollama offline";
  }
}

/* ============ Token counter (rough) ============ */
function updateTokenCounter() {
  const conv = conversations[activeConvId];
  if (!conv) return;
  const totalChars = conv.messages.reduce((s, m) => s + (m.text?.length || 0), 0);
  const tokens = Math.round(totalChars / 4); // rough estimate
  tokenCounter.textContent = `~${tokens} tokens`;
}
