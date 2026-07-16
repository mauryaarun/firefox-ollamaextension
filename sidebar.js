/* ============ DOM refs ============ */
const chatContainer     = document.getElementById("chat-container");
const userInput         = document.getElementById("user-input");
const sendBtn           = document.getElementById("send-btn");
const stopBtn           = document.getElementById("stop-btn");
const toggleSettingsBtn = document.getElementById("toggle-settings");
const settingsModal     = document.getElementById("settings-modal");
const closeSettings     = document.getElementById("close-settings");
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
const themeChips        = document.querySelectorAll(".theme-chip");
const statusDot         = document.getElementById("status-indicator");
const statusText        = document.getElementById("status-text");
const tokenCounter      = document.getElementById("token-counter");
const newConvBtn        = document.getElementById("new-conversation-btn");
const exportBtn         = document.getElementById("export-btn");
const exportMdBtn       = document.getElementById("export-md-btn");
const importBtn         = document.getElementById("import-btn");
const importFile        = document.getElementById("import-file");
const cfgOpenaiMode     = document.getElementById("cfg-openai-mode");
const cfgApiKey         = document.getElementById("cfg-api-key");
const apiKeyGroup       = document.getElementById("api-key-group");
const chatTitle         = document.getElementById("chat-title");
const chatMeta          = document.getElementById("chat-meta");
const emptyState        = document.getElementById("empty-state");
const voiceBtn          = document.getElementById("voice-btn");
const ttsToggleBtn      = document.getElementById("tts-toggle-btn");
const promptTemplates   = document.getElementById("prompt-templates");
const cfgShowThinking   = document.getElementById("cfg-show-thinking");
const cfgAutoTts        = document.getElementById("cfg-auto-tts");
const imageModal        = document.getElementById("image-modal");
const modalImage        = document.getElementById("modal-image");
const closeModal        = document.getElementById("close-modal");
const shortcutsModal    = document.getElementById("shortcuts-modal");
const closeShortcuts    = document.getElementById("close-shortcuts");
const toastContainer    = document.getElementById("toast-container");
const historyBtn        = document.getElementById("history-btn");
const historyModal      = document.getElementById("history-modal");
const historyList       = document.getElementById("history-list");
const closeHistory      = document.getElementById("close-history");
const searchInput       = document.getElementById("search-input");
const fontSizeBtns      = document.querySelectorAll(".font-size-btn");

/* ============ State ============ */
let currentImages = [];
let contextFileText = "";
let conversations = {};
let activeConvId = null;
let currentAbortController = null;
let isGenerating = false;
let recognition = null;
let isRecording = false;

/* ============ Toast System ============ */
function toast(message, type = "info", duration = 3000) {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  setTimeout(() => {
    t.style.animation = "toastIn 0.3s ease reverse";
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* ============ Init ============ */
browser.storage.local.get([
  "serverUrl", "selectedModel", "theme", "systemPrompt",
  "temperature", "contextLength", "stream", "conversations",
  "activeConvId", "openaiMode", "apiKey", "showThinking",
  "autoTts", "fontSize"
]).then((res) => {
  if (res.serverUrl) cfgUrl.value = res.serverUrl;
  if (res.theme) { applyTheme(res.theme); setActiveThemeChip(res.theme); }
  else { applyTheme("auto"); setActiveThemeChip("auto"); }
  if (res.systemPrompt) cfgSystemPrompt.value = res.systemPrompt;
  if (res.temperature) { cfgTemp.value = res.temperature; tempVal.textContent = res.temperature; }
  if (res.contextLength) cfgCtx.value = res.contextLength;
  if (typeof res.stream === "boolean") cfgStream.checked = res.stream;
  if (res.openaiMode) { cfgOpenaiMode.checked = res.openaiMode; apiKeyGroup.style.display = "block"; }
  if (res.apiKey) cfgApiKey.value = res.apiKey;
  if (res.showThinking) cfgShowThinking.checked = res.showThinking;
  if (res.autoTts) cfgAutoTts.checked = res.autoTts;
  if (res.fontSize) {
    document.body.classList.add(`font-${res.fontSize}`);
    fontSizeBtns.forEach(b => b.classList.toggle("active", b.dataset.size === res.fontSize));
  } else {
    fontSizeBtns.forEach(b => b.classList.toggle("active", b.dataset.size === "14"));
  }

  conversations = res.conversations || {};
  activeConvId = res.activeConvId || null;
  if (res.selectedModel) {
    currentModelTag.innerText = res.selectedModel;
    const opt = document.createElement("option");
    opt.value = res.selectedModel; opt.textContent = res.selectedModel;
    cfgModel.appendChild(opt); cfgModel.value = res.selectedModel;
  }
  if (!activeConvId || !conversations[activeConvId]) {
    createConversation(true);
  } else {
    renderHistoryList();
    renderMessages();
  }
  fetchOllamaModels();
  checkServerStatus();
  setInterval(checkServerStatus, 30000);
  browser.storage.local.get("pendingPrompt").then(r => {
    if (r.pendingPrompt) {
      handleIncomingPrompt(r.pendingPrompt);
      browser.storage.local.remove("pendingPrompt");
    }
  });
  initVoiceRecognition();
});

/* ============ Theme Management ============ */
function applyTheme(theme) {
  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    document.body.setAttribute("data-theme", theme);
  }
}
function setActiveThemeChip(theme) {
  themeChips.forEach(c => c.classList.toggle("active", c.dataset.theme === theme));
}
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  const active = document.querySelector(".theme-chip.active");
  if (active && active.dataset.theme === "auto") applyTheme("auto");
});
themeChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const t = chip.dataset.theme;
    applyTheme(t);
    setActiveThemeChip(t);
    browser.storage.local.set({ theme: t });
  });
});

/* ============ Markdown Parser ============ */
function parseMarkdownToHtml(md) {
  const codeBlocks = [];
  let text = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const btnHtml = `<button class="copy-code-btn" onclick="window.copyCodeBlock(this)">📋 Copy</button>`;
    const langClass = lang ? `language-${lang}` : "language-text";
    codeBlocks.push(`<pre class="code-block" data-lang="${lang || 'text'}">${btnHtml}<code class="${langClass}">${escapeHtml(code.trim())}</code></pre>`);
    return `\u0000CB${codeBlocks.length - 1}\u0000`;
  });
  text = escapeHtml(text);
  text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  text = text.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  text = `<p>${text}</p>`;
  text = text.replace(/\u0000CB(\d+)\u0000/g, (_, i) => codeBlocks[+i]);
  return text;
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
window.copyCodeBlock = function(btn) {
  const code = btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = "✅ Copied!";
    toast("Code copied", "success", 1500);
    setTimeout(() => btn.textContent = "📋 Copy", 1500);
  });
};

/* ============ Auto-Scroll ============ */
function autoScrollChat() {
  const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
  if (isNearBottom) chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ============ Conversation Management ============ */
function createConversation(switchTo = true) {
  const id = "conv_" + Date.now();
  conversations[id] = { id, title: "New Chat", messages: [], createdAt: Date.now(), pinned: false };
  if (switchTo) activeConvId = id;
  saveConversations();
  renderHistoryList();
  renderMessages();
  toast("New conversation created");
}
function switchConversation(id) {
  if (isGenerating) return;
  activeConvId = id;
  saveConversations();
  renderHistoryList();
  renderMessages();
}
function renameConversation(id, e) {
  e.stopPropagation();
  const conv = conversations[id];
  const newName = prompt("Rename conversation:", conv.title);
  if (newName && newName.trim()) {
    conv.title = newName.trim();
    saveConversations();
    renderHistoryList();
    if (id === activeConvId) chatTitle.textContent = conv.title;
    toast("Conversation renamed", "success");
  }
}
function pinConversation(id, e) {
  e.stopPropagation();
  const conv = conversations[id];
  conv.pinned = !conv.pinned;
  saveConversations();
  renderHistoryList();
  toast(conv.pinned ? "Conversation pinned 📌" : "Unpinned");
}
function deleteConversation(id, e) {
  e.stopPropagation();
  if (!confirm("Delete this conversation?")) return;
  delete conversations[id];
  if (activeConvId === id) {
    const keys = Object.keys(conversations);
    activeConvId = keys[0] || null;
    if (!activeConvId) createConversation(true);
    else { renderHistoryList(); renderMessages(); }
  }
  saveConversations();
  renderHistoryList();
  renderMessages();
  toast("Conversation deleted", "warning");
}
function saveConversations() { browser.storage.local.set({ conversations, activeConvId }); }

function renderHistoryList() {
  historyList.innerHTML = "";
  const allConvs = Object.values(conversations)
    .sort((a, b) => (b.pinned === a.pinned ? b.createdAt - a.createdAt : b.pinned ? 1 : -1));
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = allConvs.filter(c => {
    if (!searchTerm) return true;
    if (c.title.toLowerCase().includes(searchTerm)) return true;
    return c.messages.some(m => m.text.toLowerCase().includes(searchTerm));
  });
  if (filtered.length === 0) {
    historyList.innerHTML = `<div style="text-align:center; padding:30px 20px; color:var(--fg-muted); font-size: 13px;">No conversations found.</div>`;
    return;
  }
  filtered.forEach(c => {
    const item = document.createElement("div");
    item.className = "history-item" + (c.id === activeConvId ? " active" : "");
    item.innerHTML = `
      <div class="history-item-title">${c.pinned ? '📌 ' : ''}${escapeHtml(c.title)}</div>
      <div class="history-item-actions">
        <button data-action="pin" title="${c.pinned ? 'Unpin' : 'Pin'}">${c.pinned ? '📌' : '📍'}</button>
        <button data-action="rename" title="Rename">✏️</button>
        <button data-action="delete" title="Delete">🗑️</button>
      </div>`;
    item.onclick = (e) => {
      if (e.target.closest('.history-item-actions')) return;
      switchConversation(c.id);
      historyModal.classList.remove('active');
    };
    item.querySelector('[data-action="pin"]').onclick = (e) => { e.stopPropagation(); pinConversation(c.id, e); };
    item.querySelector('[data-action="rename"]').onclick = (e) => { e.stopPropagation(); renameConversation(c.id, e); };
    item.querySelector('[data-action="delete"]').onclick = (e) => { e.stopPropagation(); deleteConversation(c.id, e); };
    historyList.appendChild(item);
  });
}

newConvBtn.onclick = () => { createConversation(true); historyModal.classList.remove('active'); };
historyBtn.onclick = () => { renderHistoryList(); historyModal.classList.add('active'); };
closeHistory.onclick = () => historyModal.classList.remove('active');
searchInput.addEventListener("input", renderHistoryList);

/* ============ Rendering ============ */
function renderMessages() {
  chatContainer.innerHTML = "";
  const conv = conversations[activeConvId];
  if (!conv) return;
  chatTitle.textContent = conv.title;
  chatMeta.innerHTML = `${conv.messages.length} messages · <span>${tokenCounter.textContent || '~0 tokens'}</span>`;
  if (conv.messages.length === 0) {
    const empty = emptyState.cloneNode(true);
    empty.style.display = "flex";
    chatContainer.appendChild(empty);
    empty.querySelectorAll(".quick-btn").forEach(btn => {
      btn.onclick = () => { userInput.value = btn.dataset.prompt; userInput.focus(); autoResizeTextarea(); };
    });
    return;
  }
  conv.messages.forEach(m => appendMessage(m.text, m.sender, m.images, false, m.id, m.ts, m.thinking));
  updateTokenCounter();
  setTimeout(autoScrollChat, 50);
}

function appendMessage(text, sender, images = [], save = true, existingId = null, timestamp = null, thinking = null) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);
  const msgId = existingId || "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  wrapper.dataset.msgId = msgId;

  const msg = document.createElement("div");
  msg.classList.add("message");

  if (thinking && cfgShowThinking.checked) {
    const thinkBlock = document.createElement("details");
    thinkBlock.className = "thinking-block";
    thinkBlock.innerHTML = `<summary>💭 Thinking process</summary><div>${parseMarkdownToHtml(thinking)}</div>`;
    msg.appendChild(thinkBlock);
  }

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = sender === "user" ? escapeHtml(text).replace(/\n/g, "<br>") : parseMarkdownToHtml(text);
  msg.appendChild(contentDiv);
  wrapper.appendChild(msg);

  if (images && images.length > 0) {
    images.forEach(imgBase64 => {
      const imgEl = document.createElement("img");
      imgEl.src = `data:image/jpeg;base64,${imgBase64}`;
      imgEl.classList.add("thumb-preview");
      imgEl.style.maxWidth = "200px";
      imgEl.style.marginTop = "6px";
      imgEl.onclick = () => openImageModal(imgEl.src);
      msg.appendChild(imgEl);
    });
  }

  const time = document.createElement("div");
  time.className = "message-time";
  time.textContent = new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  wrapper.appendChild(time);

  const actions = document.createElement("div");
  actions.className = "bubble-actions";
  const copyBtn = mkBtn("📋 Copy", () => {
    navigator.clipboard.writeText(msg.innerText).then(() => toast("Copied!", "success", 1200));
  });
  actions.appendChild(copyBtn);
  if (sender === "user") {
    actions.appendChild(mkBtn("✏️ Edit", () => editAndResend(msgId)));
  } else {
    actions.appendChild(mkBtn("🔄 Regen", () => regenerate(msgId)));
    actions.appendChild(mkBtn("🔊 Read", () => speakText(text)));
  }
  wrapper.appendChild(actions);

  chatContainer.appendChild(wrapper);
  autoScrollChat();

  if (save) {
    const conv = conversations[activeConvId];
    conv.messages.push({ id: msgId, text, sender, images: images || [], ts: timestamp || Date.now(), thinking: thinking || null });
    if (sender === "user" && conv.messages.filter(m => m.sender === "user").length === 1) {
      conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      chatTitle.textContent = conv.title;
      renderHistoryList();
    }
    saveConversations();
    updateTokenCounter();
  }
  return wrapper;
}

function mkBtn(label, handler) {
  const b = document.createElement("span");
  b.className = "action-link"; b.textContent = label; b.onclick = handler;
  return b;
}
function editAndResend(msgId) {
  const conv = conversations[activeConvId];
  const idx = conv.messages.findIndex(m => m.id === msgId);
  if (idx < 0) return;
  const original = conv.messages[idx];
  const newText = prompt("Edit message:", original.text);
  if (newText === null || newText.trim() === "") return;
  conv.messages = conv.messages.slice(0, idx);
  saveConversations(); renderMessages();
  userInput.value = newText; sendBtn.click();
}
function regenerate(msgId) {
  const conv = conversations[activeConvId];
  const idx = conv.messages.findIndex(m => m.id === msgId);
  if (idx < 0) return;
  conv.messages = conv.messages.slice(0, idx);
  saveConversations(); renderMessages();
  const lastUser = [...conv.messages].reverse().find(m => m.sender === "user");
  if (lastUser) askOllama(lastUser.text, lastUser.images);
}

/* ============ Export / Import ============ */
exportBtn.addEventListener("click", () => {
  const conv = conversations[activeConvId];
  if (!conv || conv.messages.length === 0) return toast("No messages to export", "warning");
  const dataStr = JSON.stringify(conv, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  downloadBlob(blob, `${sanitizeFilename(conv.title)}_backup.json`);
  toast("Exported as JSON", "success");
});
exportMdBtn.addEventListener("click", () => {
  const conv = conversations[activeConvId];
  if (!conv || conv.messages.length === 0) return toast("No messages to export", "warning");
  let md = `# ${conv.title}\n\n*Exported: ${new Date().toLocaleString()}*\n\n---\n\n`;
  conv.messages.forEach(m => {
    const author = m.sender === "user" ? "You" : "AI";
    const time = new Date(m.ts).toLocaleTimeString();
    md += `### ${author} _${time}_\n\n${m.text}\n\n`;
  });
  const blob = new Blob([md], { type: "text/markdown" });
  downloadBlob(blob, `${sanitizeFilename(conv.title)}.md`);
  toast("Exported as Markdown", "success");
});
function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
function sanitizeFilename(name) { return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50); }
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    let importedData;
    if (file.name.endsWith(".md")) {
      importedData = { id: "conv_" + Date.now(), title: file.name.replace(".md", ""), messages: [{ id: "msg_1", text, sender: "assistant", images: [], ts: Date.now() }], createdAt: Date.now() };
    } else {
      importedData = JSON.parse(text);
      if (!importedData.messages) throw new Error("Invalid");
    }
    importedData.id = "conv_" + Date.now();
    conversations[importedData.id] = importedData;
    saveConversations(); switchConversation(importedData.id);
    toast("Chat imported successfully!", "success");
  } catch (err) { toast("Failed to import: " + err.message, "error"); }
  e.target.value = "";
});

/* ============ Event Listeners ============ */
clearBtn.addEventListener("click", () => {
  if (!confirm("Clear current chat?")) return;
  conversations[activeConvId].messages = [];
  conversations[activeConvId].title = "New Chat";
  saveConversations(); renderMessages(); renderHistoryList();
  toast("Chat cleared");
  settingsModal.classList.remove('active');
});

// Settings modal open/close
toggleSettingsBtn.addEventListener("click", () => settingsModal.classList.add('active'));
closeSettings.addEventListener("click", () => settingsModal.classList.remove('active'));
settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.classList.remove('active'); });

cfgOpenaiMode.addEventListener("change", () => {
  apiKeyGroup.style.display = cfgOpenaiMode.checked ? "block" : "none";
  browser.storage.local.set({ openaiMode: cfgOpenaiMode.checked });
});
cfgApiKey.addEventListener("change", () => browser.storage.local.set({ apiKey: cfgApiKey.value }));
cfgShowThinking.addEventListener("change", () => browser.storage.local.set({ showThinking: cfgShowThinking.checked }));
cfgAutoTts.addEventListener("change", () => browser.storage.local.set({ autoTts: cfgAutoTts.checked }));
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

chatTitle.addEventListener("blur", () => {
  const conv = conversations[activeConvId];
  if (conv) {
    conv.title = chatTitle.textContent.trim() || "New Chat";
    saveConversations(); renderHistoryList();
  }
});
chatTitle.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); chatTitle.blur(); }
});

fontSizeBtns.forEach(btn => {
  btn.onclick = () => {
    document.body.classList.remove("font-sm", "font-md", "font-lg");
    const size = btn.dataset.size;
    const cls = size === '12' ? 'sm' : size === '14' ? 'md' : 'lg';
    document.body.classList.add(`font-${cls}`);
    browser.storage.local.set({ fontSize: cls });
    fontSizeBtns.forEach(b => b.classList.toggle("active", b === btn));
  };
});

attachBtn.addEventListener("click", () => filePicker.click());
filePicker.addEventListener("change", async e => {
  await handleFiles(Array.from(e.target.files));
  filePicker.value = "";
});
async function handleFiles(files) {
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const b64 = await fileToBase64(file);
      currentImages.push(b64);
      const thumb = document.createElement("img");
      thumb.src = `data:${file.type};base64,${b64}`;
      thumb.className = "thumb-preview";
      thumb.onclick = () => openImageModal(thumb.src);
      previewZone.appendChild(thumb);
    } else {
      const txt = await file.text();
      contextFileText += `\n\n[Context from ${file.name}]:\n${txt}`;
      const pill = document.createElement("span");
      pill.className = "file-pill"; pill.textContent = `📄 ${file.name}`;
      previewZone.appendChild(pill);
    }
  }
}
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej; r.readAsDataURL(file);
  });
}

/* ============ Image Modal ============ */
function openImageModal(src) { modalImage.src = src; imageModal.classList.add("active"); }
closeModal.onclick = () => imageModal.classList.remove("active");
imageModal.onclick = (e) => { if (e.target === imageModal) imageModal.classList.remove("active"); };

/* ============ Voice Input ============ */
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { voiceBtn.style.display = "none"; return; }
  recognition = new SpeechRecognition();
  recognition.continuous = false; recognition.interimResults = true; recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map(r => r[0].transcript).join(" ");
    userInput.value = transcript; autoResizeTextarea();
  };
  recognition.onend = () => {
    isRecording = false; voiceBtn.classList.remove("recording"); voiceBtn.textContent = "🎤";
  };
  recognition.onerror = (e) => {
    toast("Voice error: " + e.error, "error");
    isRecording = false; voiceBtn.classList.remove("recording"); voiceBtn.textContent = "🎤";
  };
}
voiceBtn.onclick = () => {
  if (!recognition) return toast("Voice not supported", "error");
  if (isRecording) { recognition.stop(); }
  else { recognition.start(); isRecording = true; voiceBtn.classList.add("recording"); voiceBtn.textContent = "⏹"; toast("Listening...", "info", 1500); }
};

/* ============ Text-to-Speech ============ */
function speakText(text) {
  if (!window.speechSynthesis) return toast("TTS not supported", "error");
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
  const clean = text.replace(/```[\s\S]*?```/g, "  ").replace(/[#*`]/g, " ");
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 1; utter.pitch = 1;
  speechSynthesis.speak(utter);
}
ttsToggleBtn.onclick = () => {
  const conv = conversations[activeConvId];
  if (!conv) return;
  const lastAssistant = [...conv.messages].reverse().find(m => m.sender === "assistant");
  if (lastAssistant) speakText(lastAssistant.text);
  else toast("No assistant message to read", "warning");
};

/* ============ Prompt Templates ============ */
promptTemplates.addEventListener("change", (e) => {
  const templates = {
    summarize: "Please summarize the following content concisely:\n\n",
    explain: "Explain the following concept in simple terms:\n\n",
    translate: "Translate the following text to English:\n\n",
    "code-review": "Review this code for bugs, improvements, and best practices:\n\n```\n\n```\n",
    brainstorm: "Help me brainstorm ideas for: ",
    refactor: "Refactor this code to improve readability and performance:\n\n```\n\n```\n"
  };
  const val = e.target.value;
  if (templates[val]) { userInput.value = templates[val]; userInput.focus(); autoResizeTextarea(); }
  e.target.value = "";
});

/* ============ Incoming prompts ============ */
browser.runtime.onMessage.addListener(handleIncomingPrompt);
function handleIncomingPrompt(msg) {
  if (msg?.action !== "process-prompt") return;
  currentImages = msg.images || [];
  userInput.value = msg.text || "";
  autoResizeTextarea(); sendBtn.click();
}

/* ============ Send ============ */
sendBtn.addEventListener("click", () => {
  let text = userInput.value.trim();
  if (!text && currentImages.length === 0 && !contextFileText) return;
  if (contextFileText) text = `${text}\n${contextFileText}`.trim();
  userInput.value = ""; previewZone.innerHTML = "";
  const imgs = [...currentImages]; currentImages = []; contextFileText = "";
  autoResizeTextarea(); askOllama(text, imgs);
});
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendBtn.click(); }
});
userInput.addEventListener("input", autoResizeTextarea);
function autoResizeTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
}

/* ============ Stop ============ */
stopBtn.addEventListener("click", () => {
  if (currentAbortController) currentAbortController.abort();
  if (speechSynthesis.speaking) speechSynthesis.cancel();
});

/* ============ API Call ============ */
async function askOllama(promptText, images = []) {
  appendMessage(promptText, "user", images);
  const wrapper = appendMessage("", "assistant");
  const msgDiv = wrapper.querySelector(".message");
  msgDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
  sendBtn.style.display = "none"; stopBtn.style.display = "inline-flex";
  isGenerating = true; currentAbortController = new AbortController();
  let accumulated = ""; let thinkingContent = "";

  const baseUrl = cfgUrl.value.trim().replace(/\/$/, "");
  const isOpenAIMode = cfgOpenaiMode.checked;
  const apiKey = cfgApiKey.value;
  const conv = conversations[activeConvId];
  const messages = [];
  if (cfgSystemPrompt.value.trim()) messages.push({ role: "system", content: cfgSystemPrompt.value.trim() });
  const history = conv.messages.slice(0, -1).slice(-10);
  history.forEach(m => {
    if (m.sender === "user" || m.sender === "assistant") messages.push({ role: m.sender, content: m.text });
  });
  messages.push({ role: "user", content: promptText, images: images.length ? images : undefined });

  let fetchUrl, fetchBody, fetchHeaders = { "Content-Type": "application/json" };
  if (isOpenAIMode) {
    fetchUrl = `${baseUrl}/v1/chat/completions`;
    if (apiKey) fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
    fetchBody = { model: cfgModel.value || "gpt-3.5-turbo", messages: messages, temperature: parseFloat(cfgTemp.value), stream: cfgStream.checked };
  } else {
    fetchUrl = `${baseUrl}/api/chat`;
    fetchBody = { model: cfgModel.value || "gemma3", messages: messages, stream: cfgStream.checked, options: { temperature: parseFloat(cfgTemp.value), num_ctx: parseInt(cfgCtx.value) } };
  }

  try {
    const res = await fetch(fetchUrl, { method: "POST", headers: fetchHeaders, signal: currentAbortController.signal, body: JSON.stringify(fetchBody) });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    if (cfgStream.checked) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            if (isOpenAIMode) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.substring(6);
                if (jsonStr === "[DONE]") break;
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) { accumulated += delta; updateStreamingMessage(msgDiv, accumulated, thinkingContent); }
              }
            } else {
              const parsed = JSON.parse(line);
              if (parsed.message?.thinking) thinkingContent += parsed.message.thinking;
              if (parsed.message?.content) accumulated += parsed.message.content;
              updateStreamingMessage(msgDiv, accumulated, thinkingContent);
              if (parsed.done) break;
            }
          } catch { /* ignore partial JSON */ }
        }
      }
    } else {
      const data = await res.json();
      if (isOpenAIMode) { accumulated = data.choices?.[0]?.message?.content || ""; }
      else { accumulated = data.message?.content || ""; thinkingContent = data.message?.thinking || ""; }
      updateStreamingMessage(msgDiv, accumulated, thinkingContent, true);
    }
    conv.messages[conv.messages.length - 1] = { id: wrapper.dataset.msgId, text: accumulated, sender: "assistant", images: [], ts: Date.now(), thinking: thinkingContent || null };
    saveConversations(); updateTokenCounter();
    if (cfgAutoTts.checked && accumulated) speakText(accumulated);
  } catch (err) {
    if (err.name === "AbortError") {
      msgDiv.innerHTML = parseMarkdownToHtml(accumulated + "\n\n*[stopped]*");
      conv.messages[conv.messages.length - 1] = { id: wrapper.dataset.msgId, text: accumulated, sender: "assistant", images: [], ts: Date.now(), thinking: thinkingContent || null };
      saveConversations(); toast("Generation stopped", "warning");
    } else {
      msgDiv.innerHTML = `<span style="color:var(--error);">⚠️ ${escapeHtml(err.message)}</span>`;
      toast("Error: " + err.message, "error");
    }
  } finally {
    sendBtn.style.display = "inline-flex"; stopBtn.style.display = "none";
    isGenerating = false; currentAbortController = null; currentImages = [];
  }
}

function updateStreamingMessage(msgDiv, content, thinking, final = false) {
  let html = "";
  if (thinking && cfgShowThinking.checked) {
    html += `<details class="thinking-block" ${final ? "" : "open"}><summary>💭 Thinking...</summary><div>${parseMarkdownToHtml(thinking)}</div></details>`;
  }
  html += `<div class="message-content">${content ? parseMarkdownToHtml(content) : '<div class="typing-indicator"><span></span><span></span><span></span></div>'}</div>`;
  msgDiv.innerHTML = html;
  autoScrollChat();
}

/* ============ Model fetching ============ */
async function fetchOllamaModels() {
  try {
    const baseUrl = cfgUrl.value.trim().replace(/\/$/, "");
    if (!baseUrl) { toast("Please enter a valid Server URL first.", "warning"); return; }
    const url = `${baseUrl}/api/tags`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    cfgModel.innerHTML = "";
    if (data.models && data.models.length > 0) {
      data.models.forEach(m => {
        const o = document.createElement("option");
        o.value = m.name; o.textContent = m.name; cfgModel.appendChild(o);
      });
      if (!cfgModel.value) {
        cfgModel.selectedIndex = 0;
        browser.storage.local.set({ selectedModel: cfgModel.value });
        currentModelTag.innerText = cfgModel.value;
      }
      toast(`Loaded ${data.models.length} models`, "success");
    } else {
      toast("No models found. Run 'ollama pull gemma3' in terminal.", "warning");
    }
  } catch (e) {
    toast(`Could not fetch models: ${e.message}`, "error");
  }
}

/* ============ Server status ============ */
async function checkServerStatus() {
  try {
    const baseUrl = cfgUrl.value.trim().replace(/\/$/, "");
    if (!baseUrl) return;
    const res = await fetch(`${baseUrl}/api/tags`);
    if (res.ok) { statusDot.className = "status-dot online"; statusText.textContent = "Server online"; }
    else throw new Error();
  } catch { statusDot.className = "status-dot offline"; statusText.textContent = "Server offline"; }
}

/* ============ Token Counter ============ */
function updateTokenCounter() {
  if (!tokenCounter) return;
  const conv = conversations[activeConvId];
  if (!conv || !conv.messages) { tokenCounter.textContent = "~0 tokens"; return; }
  let totalChars = 0;
  conv.messages.forEach(m => { if (m.text) totalChars += m.text.length; });
  const estimatedTokens = Math.round(totalChars / 4);
  tokenCounter.textContent = `~${estimatedTokens} tokens`;
  chatMeta.innerHTML = `${conv.messages.length} messages · <span>${tokenCounter.textContent}</span>`;
}

/* ============ Keyboard Shortcuts ============ */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "n" || e.key === "N") { e.preventDefault(); createConversation(true); }
    else if (e.key === "k" || e.key === "K") { e.preventDefault(); historyBtn.click(); }
    else if (e.key === "e" || e.key === "E") { e.preventDefault(); exportBtn.click(); }
    else if (e.key === ",") { e.preventDefault(); toggleSettingsBtn.click(); }
    else if (e.key === "/" || e.key === "?") { e.preventDefault(); shortcutsModal.classList.toggle("active"); }
  }
  if (e.key === "Escape") {
    imageModal.classList.remove("active");
    shortcutsModal.classList.remove("active");
    historyModal.classList.remove("active");
    settingsModal.classList.remove("active");
    if (isGenerating && currentAbortController) currentAbortController.abort();
  }
});
closeShortcuts.onclick = () => shortcutsModal.classList.remove("active");
shortcutsModal.addEventListener("click", (e) => { if (e.target === shortcutsModal) shortcutsModal.classList.remove("active"); });
historyModal.addEventListener("click", (e) => { if (e.target === historyModal) historyModal.classList.remove("active"); });