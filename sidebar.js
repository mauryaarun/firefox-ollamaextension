/* ============ PDF.js Setup (Local) ============ */
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = browser.runtime.getURL('lib/pdfjs/pdf.worker.min.js');
}

/* ============ DOM refs (FIXED: No trailing spaces) ============ */
const getEl = (id) => document.getElementById(id);

const chatContainer     = getEl("chat-container");
const userInput         = getEl("user-input");
const sendBtn           = getEl("send-btn");
const stopBtn           = getEl("stop-btn");
const toggleSettingsBtn = getEl("toggle-settings");
const settingsModal     = getEl("settings-modal");
const closeSettings     = getEl("close-settings");
const btnFetchModels    = getEl("btn-fetch-models");
const cfgUrl            = getEl("cfg-url");
const cfgModel          = getEl("cfg-model");
const cfgSystemPrompt   = getEl("cfg-system-prompt");
const cfgTemp           = getEl("cfg-temp");
const cfgCtx            = getEl("cfg-ctx");
const cfgStream         = getEl("cfg-stream");
const tempVal           = getEl("temp-val");
const currentModelTag   = getEl("current-model-tag");
const filePicker        = getEl("file-picker");
const attachBtn         = getEl("attach-btn");
const previewZone       = getEl("input-preview-zone");
const clearBtn          = getEl("clear-btn");
const themeChips        = document.querySelectorAll(".theme-chip");
const statusDot         = getEl("status-indicator");
const statusText        = getEl("status-text");
const tokenCounter      = getEl("token-counter");
const messageCount      = getEl("message-count");
const newConvBtn        = getEl("new-conversation-btn");
const exportBtn         = getEl("export-btn");
const exportMdBtn       = getEl("export-md-btn");
const importBtn         = getEl("import-btn");
const importFile        = getEl("import-file");
const cfgOpenaiMode     = getEl("cfg-openai-mode");
const cfgApiKey         = getEl("cfg-api-key");
const apiKeyGroup       = getEl("api-key-group");
const chatTitle         = getEl("chat-title");
const chatMeta          = getEl("chat-meta");
const emptyState        = getEl("empty-state");
const voiceBtn          = getEl("voice-btn");
const ttsToggleBtn      = getEl("tts-toggle-btn");
const promptTemplates   = getEl("prompt-templates");
const cfgShowThinking   = getEl("cfg-show-thinking");
const cfgAutoTts        = getEl("cfg-auto-tts");
const imageModal        = getEl("image-modal");
const modalImage        = getEl("modal-image");
const closeModal        = getEl("close-modal");
const shortcutsModal    = getEl("shortcuts-modal");
const closeShortcuts    = getEl("close-shortcuts");
const toastContainer    = getEl("toast-container");
const historyBtn        = getEl("history-btn");
const historyModal      = getEl("history-modal");
const historyList       = getEl("history-list");
const closeHistory      = getEl("close-history");
const searchInput       = getEl("search-input");
const fontSizeBtns      = document.querySelectorAll(".font-size-btn");

// RAG DOM refs
const cfgRagModel       = getEl("cfg-rag-model");
const cfgRagTopk        = getEl("cfg-rag-topk");
const cfgRagChunkSize   = getEl("cfg-rag-chunk-size");
const ragUrlInput       = getEl("rag-url-input");
const ragIndexUrlBtn    = getEl("rag-index-url");
const ragFileInput      = getEl("rag-file-input");
const ragIndexFileBtn   = getEl("rag-index-file");
const ragIndexStatus    = getEl("rag-index-status");
const ragDocList        = getEl("rag-doc-list");
const ragClearAllBtn    = getEl("rag-clear-all");
const ragToggleBtn      = getEl("rag-toggle-btn");
const ragStatus         = getEl("rag-status");

// Settings tabs
const settingsTabs      = document.querySelectorAll(".settings-tab");
const settingsTabContents = document.querySelectorAll(".settings-tab-content");
const cfgPresetPrompt   = getEl("cfg-preset-prompt");
const pullModelName     = getEl("pull-model-name");
const btnConfirmPull    = getEl("btn-confirm-pull");
const pullProgress      = getEl("pull-progress");
const newConvBtnHistory = getEl("new-conversation-btn-history");

/* ============ State ============ */
let currentImages = [];
let contextFileText = "";
let conversations = {};
let activeConvId = null;
let currentAbortController = null;
let isGenerating = false;
let recognition = null;
let isRecording = false;
let ragEnabled = false;

const DB_NAME = 'LocalAIRAG';
const DB_VERSION = 2;
const STORE_NAME = 'chunks';
const DOCS_STORE = 'documents';

const predefinedPrompts = {
    "default": "",
    "coder": "You are an expert software engineer. Provide clean, efficient, and well-documented code. Explain your reasoning.",
    "translator": "You are a professional translator. Translate the following text accurately, preserving the tone and context.",
    "creative": "You are a creative writing assistant. Help brainstorm ideas, write stories, and improve prose.",
    "summarizer": "You are a summarization expert. Provide concise, accurate summaries of the provided text.",
    "tutor": "You are a patient and knowledgeable tutor. Explain concepts clearly with examples."
};

/* ============ Toast System ============ */
function toast(message, type = "info", duration = 3000) {
    if (!toastContainer) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    toastContainer.appendChild(t);
    setTimeout(() => {
        t.style.animation = "toastIn 0.3s ease reverse";
        setTimeout(() => t.remove(), 300);
    }, duration);
}

/* ============ Settings Tabs ============ */
settingsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;
        settingsTabs.forEach(t => t.classList.remove("active"));
        settingsTabContents.forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
        if (targetContent) targetContent.classList.add("active");
    });
});

/* ============ Init ============ */
browser.storage.local.get([
    "serverUrl", "selectedModel", "theme", "systemPrompt", "temperature", "contextLength",
    "stream", "conversations", "activeConvId", "openaiMode", "apiKey", "showThinking",
    "autoTts", "fontSize", "ragModel", "ragTopk", "ragChunkSize", "presetPrompt", "ragEnabled"
]).then((res) => {
    console.log("[Init] Storage loaded");
    
    if (res.serverUrl && cfgUrl) cfgUrl.value = res.serverUrl;
    else if (cfgUrl) cfgUrl.value = "http://localhost:11434";

    if (res.theme) { applyTheme(res.theme); setActiveThemeChip(res.theme); }
    else { applyTheme("auto"); setActiveThemeChip("auto"); }

    if (res.systemPrompt && cfgSystemPrompt) cfgSystemPrompt.value = res.systemPrompt;
    if (res.temperature && cfgTemp) { 
        cfgTemp.value = res.temperature; 
        if(tempVal) tempVal.textContent = res.temperature; 
    }
    if (res.contextLength && cfgCtx) cfgCtx.value = res.contextLength;
    if (typeof res.stream === "boolean" && cfgStream) cfgStream.checked = res.stream;
    if (res.openaiMode) { 
        if(cfgOpenaiMode) cfgOpenaiMode.checked = res.openaiMode; 
        if(apiKeyGroup) apiKeyGroup.style.display = "block"; 
    }
    if (res.apiKey && cfgApiKey) cfgApiKey.value = res.apiKey;
    if (res.showThinking && cfgShowThinking) cfgShowThinking.checked = res.showThinking;
    if (res.autoTts && cfgAutoTts) cfgAutoTts.checked = res.autoTts;
    if (res.ragModel && cfgRagModel) cfgRagModel.value = res.ragModel;
    if (res.ragTopk && cfgRagTopk) cfgRagTopk.value = res.ragTopk;
    if (res.ragChunkSize && cfgRagChunkSize) cfgRagChunkSize.value = res.ragChunkSize;
    if (res.ragEnabled) { ragEnabled = res.ragEnabled; updateRagToggleUI(); }
    if (res.presetPrompt && cfgPresetPrompt) cfgPresetPrompt.value = res.presetPrompt;

    if (res.fontSize) {
        document.body.classList.add(`font-${res.fontSize}`);
        fontSizeBtns.forEach(b => b.classList.toggle("active", b.dataset.size === res.fontSize));
    }

    conversations = res.conversations || {};
    activeConvId = res.activeConvId || null;

    if (res.selectedModel && cfgModel) {
        if(currentModelTag) currentModelTag.innerText = res.selectedModel;
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

    // Check for pending prompts from context menu
    browser.storage.local.get("pendingPrompt").then(r => {
        if (r.pendingPrompt) {
            handleIncomingPrompt(r.pendingPrompt);
            browser.storage.local.remove("pendingPrompt");
        }
    });

    initVoiceRecognition();
    loadRagDocuments();
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

/* ============ RAG Toggle ============ */
if (ragToggleBtn) {
    ragToggleBtn.addEventListener("click", () => {
        ragEnabled = !ragEnabled;
        browser.storage.local.set({ ragEnabled });
        updateRagToggleUI();
        toast(ragEnabled ? "RAG enabled" : "RAG disabled", "info", 1500);
    });
}
function updateRagToggleUI() {
    if (!ragToggleBtn || !ragStatus) return;
    ragToggleBtn.classList.toggle("active", ragEnabled);
    ragToggleBtn.title = ragEnabled ? "RAG Enabled (click to disable)" : "RAG Disabled (click to enable)";
    ragStatus.style.display = ragEnabled ? "inline" : "none";
}

/* ============ Markdown Parser ============ */
function parseMarkdownToHtml(md) {
    if (typeof marked === 'undefined') {
        return md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
    }
    marked.setOptions({ breaks: true, gfm: true });
    let html = marked.parse(md);
    if (typeof DOMPurify !== 'undefined') {
        html = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel', 'class'] });
    }
    return html;
}
function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ============ Code Block Enhancements ============ */
/* ============ Code Block Enhancements ============ */
function enhanceCodeBlocks(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        if (!pre) return;

        // Ensure pre has relative positioning for absolute buttons
        pre.style.position = 'relative';

        const classes = block.className.split(' ');
        const langClass = classes.find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'text';
        pre.setAttribute('data-lang', lang);

        if (!pre.querySelector('.code-block-actions')) {
            const actions = document.createElement('div');
            actions.className = 'code-block-actions';

            // 1. Copy Button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-action-btn';
            copyBtn.innerHTML = '📋 Copy';
            copyBtn.title = 'Copy code';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.innerText).then(() => {
                    copyBtn.innerHTML = "✅ Copied!";
                    setTimeout(() => copyBtn.innerHTML = "📋 Copy", 1500);
                }).catch(() => {
                    // Fallback for older browsers or non-HTTPS contexts
                    const textarea = document.createElement('textarea');
                    textarea.value = block.innerText;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    copyBtn.innerHTML = "✅ Copied!";
                    setTimeout(() => copyBtn.innerHTML = "📋 Copy", 1500);
                });
            });
            actions.appendChild(copyBtn);

            // 2. Download Button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'code-action-btn';
            downloadBtn.innerHTML = '💾 Download';
            downloadBtn.title = 'Download code';
            downloadBtn.addEventListener('click', () => {
                const ext = getExtensionForLang(lang);
                const blob = new Blob([block.innerText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `code_${Date.now()}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                downloadBtn.innerHTML = "✅ Saved!";
                setTimeout(() => downloadBtn.innerHTML = "💾 Download", 1500);
            });
            actions.appendChild(downloadBtn);

            // 3. Preview Button
            const previewBtn = document.createElement('button');
            previewBtn.className = 'code-action-btn';
            previewBtn.innerHTML = '👁️ Preview';
            previewBtn.title = 'Preview code';
            previewBtn.addEventListener('click', () => {
                openCodePreview(block.innerText, lang);
            });
            actions.appendChild(previewBtn);

            pre.prepend(actions);
        }

        // Highlighting with safety check
        if (typeof hljs !== 'undefined') {
            if (!block.classList.contains('hljs')) {
                try {
                    hljs.highlightElement(block);
                } catch (e) {
                    console.warn("HLJS highlight failed:", e);
                }
            }
        }
    });
}

// Maps language names to file extensions for downloading
function getExtensionForLang(lang) {
    const map = {
        'javascript': 'js', 'js': 'js', 'typescript': 'ts', 'ts': 'ts',
        'python': 'py', 'py': 'py', 'ruby': 'rb', 'rb': 'rb',
        'java': 'java', 'c': 'c', 'cpp': 'cpp', 'c++': 'cpp', 'csharp': 'cs', 'cs': 'cs',
        'go': 'go', 'rust': 'rs', 'php': 'php', 'html': 'html', 'css': 'css',
        'scss': 'scss', 'sass': 'sass', 'less': 'less', 'json': 'json',
        'xml': 'xml', 'svg': 'svg', 'sql': 'sql', 'bash': 'sh', 'sh': 'sh',
        'shell': 'sh', 'yaml': 'yaml', 'yml': 'yml', 'markdown': 'md', 'md': 'md',
        'dockerfile': 'dockerfile', 'makefile': 'makefile'
    };
    return map[lang.toLowerCase()] || 'txt';
}

// Opens a modal with a sandboxed iframe to preview the code
function openCodePreview(code, lang) {
    let modal = document.getElementById('code-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'code-preview-modal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; width: 90vw; height: 90vh;">
        <div class="modal-header">
        <h3>Code Preview</h3>
        <button class="modal-close-btn" id="close-preview-modal">✕</button>
        </div>
        <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; height: calc(100% - 60px);">
        <iframe id="preview-iframe" style="flex: 1; border: none; background: #fff; border-radius: 0 0 16px 16px;"></iframe>
        </div>
        </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-preview-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    modal.querySelector('h3').textContent = `Code Preview (${lang})`;
    const iframe = document.getElementById('preview-iframe');

    let content = '';
    const langLower = lang.toLowerCase();

    if (['html', 'svg', 'xml'].includes(langLower)) {
        content = code; // Render directly
    } else if (langLower === 'css') {
        content = `<html><head><style>${code}</style></head><body style="font-family:sans-serif; padding:20px;"><h1>CSS Preview</h1><div class="preview-box">Styled Content</div></body></html>`;
    } else if (['javascript', 'js', 'typescript', 'ts'].includes(langLower)) {
        content = `<html><body><script>try { ${code} } catch(e) { document.body.innerHTML = '<pre style="color:red; font-family:monospace;">' + e.message + '</pre>'; } </script></body></html>`;
    } else {
        // Fallback: show as formatted dark-mode text
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        content = `<html><head><style>body{font-family:monospace; padding:20px; background:#1e1e1e; color:#d4d4d4; white-space:pre-wrap; margin:0;} </style></head><body><pre>${escaped}</pre></body></html>`;
    }

    iframe.srcdoc = content;
    modal.classList.add('active');
}

/* ============ Auto-Scroll ============ */
function autoScrollChat() {
    if (!chatContainer) return;
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
    if (e) e.stopPropagation();
    const conv = conversations[id];
    const newName = prompt("Rename conversation:", conv.title);
    if (newName && newName.trim()) {
        conv.title = newName.trim();
        saveConversations();
        renderHistoryList();
        if (id === activeConvId && chatTitle) chatTitle.textContent = conv.title;
        toast("Conversation renamed", "success");
    }
}

function pinConversation(id, e) {
    if (e) e.stopPropagation();
    const conv = conversations[id];
    conv.pinned = !conv.pinned;
    saveConversations();
    renderHistoryList();
    toast(conv.pinned ? "Conversation pinned 📌" : "Unpinned");
}

function deleteConversation(id, e) {
    if (e) e.stopPropagation();
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
    if (!historyList) return;
    historyList.innerHTML = "";
    const allConvs = Object.values(conversations).sort((a, b) => (b.pinned === a.pinned ? b.createdAt - a.createdAt : b.pinned ? 1 : -1));
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
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
        item.addEventListener("click", (e) => {
            if (e.target.closest('.history-item-actions')) return;
            switchConversation(c.id);
            if (historyModal) historyModal.classList.remove('active');
        });
        item.querySelector('[data-action="pin"]').addEventListener("click", (e) => { e.stopPropagation(); pinConversation(c.id, e); });
        item.querySelector('[data-action="rename"]').addEventListener("click", (e) => { e.stopPropagation(); renameConversation(c.id, e); });
        item.querySelector('[data-action="delete"]').addEventListener("click", (e) => { e.stopPropagation(); deleteConversation(c.id, e); });
        historyList.appendChild(item);
    });
}

if (newConvBtn) newConvBtn.addEventListener("click", () => { createConversation(true); if (historyModal) historyModal.classList.remove('active'); });
if (newConvBtnHistory) newConvBtnHistory.addEventListener("click", () => { createConversation(true); if (historyModal) historyModal.classList.remove('active'); });
if (historyBtn) historyBtn.addEventListener("click", () => { renderHistoryList(); if (historyModal) historyModal.classList.add('active'); });
if (closeHistory) closeHistory.addEventListener("click", () => { if (historyModal) historyModal.classList.remove('active'); });
if (searchInput) searchInput.addEventListener("input", renderHistoryList);

/* ============ Rendering ============ */
function renderMessages() {
    if (!chatContainer) return;
    chatContainer.innerHTML = "";
    const conv = conversations[activeConvId];
    if (!conv) return;

    if (chatTitle) chatTitle.textContent = conv.title;
    if (messageCount) messageCount.textContent = `${conv.messages.length} messages`;

    if (conv.messages.length === 0) {
        if (emptyState) {
            const empty = emptyState.cloneNode(true);
            empty.style.display = "flex";
            chatContainer.appendChild(empty);
            empty.querySelectorAll(".quick-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    if(userInput) userInput.value = btn.dataset.prompt;
                    if(userInput) userInput.focus();
                    autoResizeTextarea();
                });
            });
        }
        return;
    }

    conv.messages.forEach(m => appendMessage(m.text, m.sender, m.images, false, m.id, m.ts, m.thinking, m.ragSources));
    updateTokenCounter();
    setTimeout(autoScrollChat, 50);
}

function appendMessage(text, sender, images = [], save = true, existingId = null, timestamp = null, thinking = null, ragSources = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", sender);
    const msgId = existingId || "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    wrapper.dataset.msgId = msgId;

    const msg = document.createElement("div");
    msg.classList.add("message");

    if (thinking && cfgShowThinking && cfgShowThinking.checked) {
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
            imgEl.addEventListener("click", () => openImageModal(imgEl.src));
            msg.appendChild(imgEl);
        });
    }

    if (ragSources && ragSources.length > 0) {
        const sourcesDiv = document.createElement("div");
        sourcesDiv.className = "rag-sources";
        sourcesDiv.innerHTML = `<span class="rag-sources-title">📚 Sources:</span>`;
        const uniqueSources = [...new Set(ragSources)];
        uniqueSources.forEach(src => {
            const pill = document.createElement("span");
            pill.className = "rag-source-pill";
            pill.textContent = src;
            sourcesDiv.appendChild(pill);
        });
        wrapper.appendChild(sourcesDiv);
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
    enhanceCodeBlocks(msg);
    autoScrollChat();

    if (save) {
        const conv = conversations[activeConvId];
        conv.messages.push({
            id: msgId, text, sender,
            images: images || [],
            ts: timestamp || Date.now(),
            thinking: thinking || null,
            ragSources: ragSources || null
        });
        if (sender === "user" && conv.messages.filter(m => m.sender === "user").length === 1) {
            conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
            if (chatTitle) chatTitle.textContent = conv.title;
            renderHistoryList();
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
    b.addEventListener("click", handler);
    return b;
}

async function editAndResend(msgId) {
    const conv = conversations[activeConvId];
    const idx = conv.messages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    const original = conv.messages[idx];
    const newText = prompt("Edit message:", original.text);
    if (newText === null || newText.trim() === "") return;
    conv.messages = conv.messages.slice(0, idx);
    saveConversations();
    renderMessages();
    if(userInput) userInput.value = newText;
    if(sendBtn) sendBtn.click();
}

function regenerate(msgId) {
    const conv = conversations[activeConvId];
    const idx = conv.messages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    conv.messages = conv.messages.slice(0, idx);
    saveConversations();
    renderMessages();
    const lastUser = [...conv.messages].reverse().find(m => m.sender === "user");
    if (lastUser) askOllama(lastUser.text, lastUser.images);
}

/* ============ Export / Import ============ */
if (exportBtn) exportBtn.addEventListener("click", () => {
    const conv = conversations[activeConvId];
    if (!conv || conv.messages.length === 0) return toast("No messages to export", "warning");
    const dataStr = JSON.stringify(conv, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    downloadBlob(blob, `${sanitizeFilename(conv.title)}_backup.json`);
    toast("Exported as JSON", "success");
});

if (exportMdBtn) exportMdBtn.addEventListener("click", () => {
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
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
function sanitizeFilename(name) { return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50); }

if (importBtn) importBtn.addEventListener("click", () => importFile.click());
if (importFile) importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
        let importedData;
        if (file.name.endsWith(".md")) {
            importedData = { id: "conv" + Date.now(), title: file.name.replace(".md", ""), messages: [{ id: "msg_1", text, sender: "assistant", images: [], ts: Date.now() }], createdAt: Date.now() };
        } else {
            importedData = JSON.parse(text);
            if (!importedData.messages) throw new Error("Invalid");
        }
        importedData.id = "conv" + Date.now();
        conversations[importedData.id] = importedData;
        saveConversations();
        switchConversation(importedData.id);
        toast("Chat imported successfully!", "success");
    } catch (err) {
        toast("Failed to import: " + err.message, "error");
    }
    e.target.value = "";
});

/* ============ Event Listeners ============ */
if (clearBtn) clearBtn.addEventListener("click", () => {
    if (!confirm("Clear current chat?")) return;
    conversations[activeConvId].messages = [];
    conversations[activeConvId].title = "New Chat";
    saveConversations();
    renderMessages();
    renderHistoryList();
    toast("Chat cleared");
});

if (toggleSettingsBtn) toggleSettingsBtn.addEventListener("click", () => { if (settingsModal) settingsModal.classList.add('active'); });
if (closeSettings) closeSettings.addEventListener("click", () => { if (settingsModal) settingsModal.classList.remove('active'); });
if (settingsModal) settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.classList.remove('active'); });

if (cfgOpenaiMode) cfgOpenaiMode.addEventListener("change", () => {
    if (apiKeyGroup) apiKeyGroup.style.display = cfgOpenaiMode.checked ? "block" : "none";
    browser.storage.local.set({ openaiMode: cfgOpenaiMode.checked });
});
if (cfgApiKey) cfgApiKey.addEventListener("change", () => browser.storage.local.set({ apiKey: cfgApiKey.value }));
if (cfgShowThinking) cfgShowThinking.addEventListener("change", () => browser.storage.local.set({ showThinking: cfgShowThinking.checked }));
if (cfgAutoTts) cfgAutoTts.addEventListener("change", () => browser.storage.local.set({ autoTts: cfgAutoTts.checked }));

if (btnFetchModels) btnFetchModels.addEventListener("click", fetchOllamaModels);
if (cfgModel) cfgModel.addEventListener("change", () => {
    browser.storage.local.set({ selectedModel: cfgModel.value });
    if (currentModelTag) currentModelTag.innerText = cfgModel.value;
});
if (cfgUrl) cfgUrl.addEventListener("change", () => browser.storage.local.set({ serverUrl: cfgUrl.value }));
if (cfgSystemPrompt) cfgSystemPrompt.addEventListener("change", () => browser.storage.local.set({ systemPrompt: cfgSystemPrompt.value }));
if (cfgTemp) cfgTemp.addEventListener("input", () => {
    if (tempVal) tempVal.textContent = cfgTemp.value;
    browser.storage.local.set({ temperature: parseFloat(cfgTemp.value) });
});
if (cfgCtx) cfgCtx.addEventListener("change", () => browser.storage.local.set({ contextLength: parseInt(cfgCtx.value) }));
if (cfgStream) cfgStream.addEventListener("change", () => browser.storage.local.set({ stream: cfgStream.checked }));

// RAG Settings
if (cfgRagModel) cfgRagModel.addEventListener("change", () => browser.storage.local.set({ ragModel: cfgRagModel.value }));
if (cfgRagTopk) cfgRagTopk.addEventListener("change", () => browser.storage.local.set({ ragTopk: parseInt(cfgRagTopk.value) }));
if (cfgRagChunkSize) cfgRagChunkSize.addEventListener("change", () => browser.storage.local.set({ ragChunkSize: parseInt(cfgRagChunkSize.value) }));

if (cfgPresetPrompt) cfgPresetPrompt.addEventListener("change", () => {
    const val = cfgPresetPrompt.value;
    browser.storage.local.set({ presetPrompt: val });
    if (predefinedPrompts[val] !== undefined && cfgSystemPrompt) {
        cfgSystemPrompt.value = predefinedPrompts[val];
        browser.storage.local.set({ systemPrompt: cfgSystemPrompt.value });
    }
});

// Pull Model
if (btnConfirmPull) btnConfirmPull.addEventListener("click", async () => {
    const modelName = pullModelName ? pullModelName.value.trim() : "";
    if (!modelName) return toast("Enter a model name", "warning");
    if (btnConfirmPull) btnConfirmPull.disabled = true;
    if (pullProgress) pullProgress.textContent = "Starting pull...";
    browser.runtime.sendMessage({
        action: "pull-model",
        baseUrl: cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "",
        modelName
    });
});

browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === "pull-progress") {
        if (msg.data.status && pullProgress) pullProgress.textContent = msg.data.status;
        if (msg.data.total && msg.data.completed && pullProgress) {
            const pct = ((msg.data.completed / msg.data.total) * 100).toFixed(1);
            pullProgress.textContent += ` (${pct}%)`;
        }
    } else if (msg.action === "pull-complete") {
        if (pullProgress) pullProgress.textContent = "✅ Pull complete! Fetching models...";
        if (btnConfirmPull) btnConfirmPull.disabled = false;
        fetchOllamaModels();
        setTimeout(() => { if (pullProgress) pullProgress.textContent = ""; }, 2000);
    } else if (msg.action === "pull-error") {
        if (pullProgress) pullProgress.textContent = `❌ Error: ${msg.error}`;
        if (btnConfirmPull) btnConfirmPull.disabled = false;
    }
});

// RAG Indexing
if (ragIndexUrlBtn) ragIndexUrlBtn.addEventListener("click", async () => {
    const url = ragUrlInput ? ragUrlInput.value.trim() : "";
    if (!url) return toast("Enter a URL", "warning");
    if (ragIndexStatus) ragIndexStatus.textContent = "Fetching URL...";
    try {
        const res = await browser.runtime.sendMessage({ action: "fetch-url-text", url });
        if (res.error) throw new Error(res.error);
        if (!res.text || res.text.length < 50) throw new Error("No text content found");
        if (ragIndexStatus) ragIndexStatus.textContent = "Indexing content...";
        await indexContent(url, res.text);
        if (ragIndexStatus) ragIndexStatus.textContent = `✅ Indexed ${url}`;
        if (ragUrlInput) ragUrlInput.value = "";
        toast("URL indexed successfully!", "success");
        loadRagDocuments();
    } catch (e) {
        if (ragIndexStatus) ragIndexStatus.textContent = `❌ ${e.message}`;
        toast("Indexing failed: " + e.message, "error");
    }
});

if (ragIndexFileBtn) ragIndexFileBtn.addEventListener("click", async () => {
    const files = ragFileInput ? Array.from(ragFileInput.files) : [];
    if (files.length === 0) return toast("Select files", "warning");
    if (ragIndexStatus) ragIndexStatus.textContent = "Processing files...";
    try {
        for (const file of files) {
            if (ragIndexStatus) ragIndexStatus.textContent = `Processing ${file.name}...`;
            let text = "";
            if (file.type === "application/pdf") {
                text = await extractTextFromPDF(file);
            } else if (file.type.startsWith("audio/")) {
                text = await transcribeAudio(file);
            } else {
                text = await file.text();
            }
            if (!text || text.length < 50) throw new Error(`No extractable text from ${file.name}`);
            await indexContent(file.name, text);
        }
        if (ragIndexStatus) ragIndexStatus.textContent = `✅ Indexed ${files.length} file(s)`;
        if (ragFileInput) ragFileInput.value = "";
        toast("Files indexed successfully!", "success");
        loadRagDocuments();
    } catch (e) {
        if (ragIndexStatus) ragIndexStatus.textContent = `❌ ${e.message}`;
        toast("Indexing failed: " + e.message, "error");
    }
});

async function extractTextFromPDF(file) {
    if (typeof pdfjsLib === 'undefined') throw new Error("PDF.js library is missing.");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text;
}
async function transcribeAudio(file) {
    return `[Audio file: ${file.name} - Transcription requires whisper model]`;
}

if (chatTitle) {
    chatTitle.addEventListener("blur", () => {
        const conv = conversations[activeConvId];
        if (conv) {
            conv.title = chatTitle.textContent.trim() || "New Chat";
            saveConversations();
            renderHistoryList();
        }
    });
    chatTitle.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); chatTitle.blur(); }
    });
}

fontSizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.body.classList.remove("font-sm", "font-md", "font-lg");
        const size = btn.dataset.size;
        const cls = size === '12' ? 'sm' : size === '14' ? 'md' : 'lg';
        document.body.classList.add(`font-${cls}`);
        browser.storage.local.set({ fontSize: cls });
        fontSizeBtns.forEach(b => b.classList.toggle("active", b === btn));
    });
});

/* ============ File Attach ============ */
if (attachBtn) attachBtn.addEventListener("click", () => { if (filePicker) filePicker.click(); });
if (filePicker) filePicker.addEventListener("change", async e => {
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
            thumb.addEventListener("click", () => openImageModal(thumb.src));
            if (previewZone) previewZone.appendChild(thumb);
        } else {
            const txt = await file.text();
            contextFileText += `\n\n[Context from ${file.name}]:\n${txt}`;
            const pill = document.createElement("span");
            pill.className = "file-pill";
            pill.textContent = `📄 ${file.name}`;
            if (previewZone) previewZone.appendChild(pill);
        }
    }
}
function fileToBase64(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

/* ============ Image Modal ============ */
function openImageModal(src) {
    if (!imageModal || !modalImage) return;
    modalImage.src = src;
    imageModal.classList.add("active");
}
if (closeModal) closeModal.addEventListener("click", () => { if (imageModal) imageModal.classList.remove("active"); });
if (imageModal) imageModal.addEventListener("click", (e) => { if (e.target === imageModal) imageModal.classList.remove("active"); });

/* ============ Voice Input ============ */
function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { if (voiceBtn) voiceBtn.style.display = "none"; return; }
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join(" ");
        if (userInput) {
            userInput.value = transcript;
            autoResizeTextarea();
        }
    };
    recognition.onend = () => {
        isRecording = false;
        if (voiceBtn) {
            voiceBtn.classList.remove("recording");
            voiceBtn.textContent = "🎤";
        }
    };
    recognition.onerror = (e) => {
        toast("Voice error: " + e.error, "error");
        isRecording = false;
        if (voiceBtn) {
            voiceBtn.classList.remove("recording");
            voiceBtn.textContent = "🎤";
        }
    };
}
if (voiceBtn) voiceBtn.addEventListener("click", () => {
    if (!recognition) return toast("Voice not supported", "error");
    if (isRecording) { recognition.stop(); }
    else {
        recognition.start();
        isRecording = true;
        voiceBtn.classList.add("recording");
        voiceBtn.textContent = "⏹";
        toast("Listening...", "info", 1500);
    }
});

/* ============ Text-to-Speech ============ */
function speakText(text) {
    if (!window.speechSynthesis) return toast("TTS not supported", "error");
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const clean = text.replace(/`[\s\S]*?`/g, " ").replace(/[#*`]/g, " ");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.speak(utter);
}
if (ttsToggleBtn) ttsToggleBtn.addEventListener("click", () => {
    const conv = conversations[activeConvId];
    if (!conv) return;
    const lastAssistant = [...conv.messages].reverse().find(m => m.sender === "assistant");
    if (lastAssistant) speakText(lastAssistant.text);
    else toast("No assistant message to read", "warning");
});

/* ============ Prompt Templates ============ */
if (promptTemplates) promptTemplates.addEventListener("change", (e) => {
    const templates = {
        summarize: "Please summarize the following content concisely:\n\n",
        explain: "Explain the following concept in simple terms:\n\n",
        translate: "Translate the following text to English:\n\n",
        "code-review": "Review this code for bugs, improvements, and best practices:\n\n```\n\n```\n",
        brainstorm: "Help me brainstorm ideas for: ",
        refactor: "Refactor this code to improve readability and performance:\n\n```\n\n```\n"
    };
    const val = e.target.value;
    if (templates[val] && userInput) {
        userInput.value = templates[val];
        userInput.focus();
        autoResizeTextarea();
    }
    e.target.value = "";
});

/* ============ Incoming prompts (CONTEXT MENU HANDLER) ============ */
browser.runtime.onMessage.addListener(handleIncomingPrompt);

function handleIncomingPrompt(msg) {
    console.log("[Sidebar] Received pending prompt:", msg);
    
    if (msg?.action !== "process-prompt") return;

    // Clear previous state
    currentImages = [];
    if (previewZone) previewZone.innerHTML = "";

    // Handle Images (if any were passed, e.g., from "Explain Image")
    if (msg.images && msg.images.length > 0) {
        msg.images.forEach(imgUrl => {
            const pill = document.createElement("span");
            pill.className = "file-pill";
            pill.textContent = `🖼️ Image`;
            if (previewZone) previewZone.appendChild(pill);
            currentImages.push(imgUrl);
        });
    }

    // Set Text
    if (userInput) {
        userInput.value = msg.text || "";
        autoResizeTextarea();
        userInput.focus();
    }

    // Auto-send if there is content
    if ((msg.text && msg.text.trim().length > 0) || currentImages.length > 0) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
            if (sendBtn) {
                console.log("[Sidebar] Triggering send button click");
                sendBtn.click();
            } else {
                console.error("[Sidebar] sendBtn is null!");
            }
        }, 100);
    }
}

/* ============ Send ============ */
if (sendBtn) sendBtn.addEventListener("click", () => {
    let text = userInput ? userInput.value.trim() : "";
    if (!text && currentImages.length === 0 && !contextFileText) return;
    if (contextFileText) text = `${text}\n${contextFileText}`.trim();
    if (userInput) userInput.value = "";
    if (previewZone) previewZone.innerHTML = "";
    const imgs = [...currentImages];
    currentImages = [];
    contextFileText = "";
    autoResizeTextarea();
    askOllama(text, imgs);
});

if (userInput) {
    userInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (sendBtn) sendBtn.click();
        }
    });
    userInput.addEventListener("input", autoResizeTextarea);
}

function autoResizeTextarea() {
    if (!userInput) return;
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
}

/* ============ Stop ============ */
if (stopBtn) stopBtn.addEventListener("click", () => {
    if (currentAbortController) currentAbortController.abort();
    if (speechSynthesis.speaking) speechSynthesis.cancel();
});

/* ============ RAG Engine ============ */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('source', 'source', { unique: false });
            }
            if (!db.objectStoreNames.contains(DOCS_STORE)) {
                db.createObjectStore(DOCS_STORE, { keyPath: 'name' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getEmbedding(text, model) {
    const baseUrl = cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "";
    const res = await fetch(`${baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text })
    });
    if (!res.ok) throw new Error('Embedding API failed');
    const data = await res.json();
    return data.embedding;
}

function chunkTextBySentences(text, chunkSize = 1000, overlap = 200) {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks = [];
    let currentChunk = "";
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            const overlapText = currentChunk.slice(-overlap);
            currentChunk = overlapText + sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
    return chunks;
}

async function indexContent(source, text) {
    const db = await openDB();
    const embeddingModel = cfgRagModel ? cfgRagModel.value : "nomic-embed-text";
    const chunkSize = cfgRagChunkSize ? parseInt(cfgRagChunkSize.value) : 1000;
    const chunks = chunkTextBySentences(text, chunkSize, 200);
    const embeddings = [];
    for (const chunk of chunks) {
        const embedding = await getEmbedding(chunk, embeddingModel);
        embeddings.push({ source, text: chunk, embedding, timestamp: Date.now() });
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const item of embeddings) store.add(item);
    const docsTx = db.transaction(DOCS_STORE, 'readwrite');
    docsTx.objectStore(DOCS_STORE).put({ name: source, chunks: chunks.length, timestamp: Date.now() });
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
    });
}

async function queryRAG(prompt) {
    const db = await openDB();
    const embeddingModel = cfgRagModel ? cfgRagModel.value : "nomic-embed-text";
    const topK = cfgRagTopk ? parseInt(cfgRagTopk.value) : 3;
    const queryEmbedding = await getEmbedding(prompt, embeddingModel);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
        request.onsuccess = () => {
            const allChunks = request.result;
            if (allChunks.length === 0) {
                resolve({ context: "", sources: [] });
                return;
            }
            const scored = allChunks.map(chunk => ({
                ...chunk,
                score: cosineSimilarity(queryEmbedding, chunk.embedding)
            }));
            scored.sort((a, b) => b.score - a.score);
            const topChunks = scored.slice(0, topK);
            const context = topChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n---\n\n');
            const sources = topChunks.map(c => c.source);
            resolve({ context, sources });
        };
    });
}

function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

async function loadRagDocuments() {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readonly');
    const store = tx.objectStore(DOCS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
        const docs = request.result;
        if (!ragDocList) return;
        if (docs.length === 0) {
            ragDocList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted); font-size:12px;">No documents indexed yet</div>`;
            return;
        }
        ragDocList.innerHTML = "";
        docs.forEach(doc => {
            const item = document.createElement("div");
            item.className = "rag-doc-item";
            item.innerHTML = `
        <div class="rag-doc-info">
          <div class="rag-doc-name">${escapeHtml(doc.name)}</div>
          <div class="rag-doc-meta">${doc.chunks} chunks · ${new Date(doc.timestamp).toLocaleDateString()}</div>
        </div>
        <button class="rag-doc-delete" data-name="${escapeHtml(doc.name)}" title="Delete">🗑️</button>`;
            ragDocList.appendChild(item);
        });
        ragDocList.querySelectorAll('.rag-doc-delete').forEach(btn => {
            btn.addEventListener("click", async () => {
                const name = btn.dataset.name;
                if (confirm(`Delete "${name}" from knowledge base?`)) {
                    await deleteRagDocument(name);
                    loadRagDocuments();
                    toast("Document deleted", "success");
                }
            });
        });
    };
}

async function deleteRagDocument(name) {
    const db = await openDB();
    const chunksTx = db.transaction(STORE_NAME, 'readwrite');
    const chunksStore = chunksTx.objectStore(STORE_NAME);
    const index = chunksStore.index('source');
    const request = index.openCursor(IDBKeyRange.only(name));
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) { cursor.delete(); cursor.continue(); }
    };
    const docsTx = db.transaction(DOCS_STORE, 'readwrite');
    docsTx.objectStore(DOCS_STORE).delete(name);
    return new Promise((resolve) => { chunksTx.oncomplete = () => resolve(); });
}

if (ragClearAllBtn) ragClearAllBtn.addEventListener("click", async () => {
    if (!confirm("Delete ALL documents from knowledge base?")) return;
    const db = await openDB();
    const chunksTx = db.transaction(STORE_NAME, 'readwrite');
    chunksTx.objectStore(STORE_NAME).clear();
    const docsTx = db.transaction(DOCS_STORE, 'readwrite');
    docsTx.objectStore(DOCS_STORE).clear();
    chunksTx.oncomplete = () => {
        loadRagDocuments();
        toast("All documents cleared", "success");
    };
});

/* ============ API Call ============ */
async function askOllama(promptText, images = []) {
    appendMessage(promptText, "user", images);
    const wrapper = appendMessage("", "assistant");
    const msgDiv = wrapper.querySelector(".message");
    msgDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    if (sendBtn) sendBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
    isGenerating = true;
    currentAbortController = new AbortController();

    let accumulated = "";
    let thinkingContent = "";
    let finalPrompt = promptText;
    let ragSources = [];

    if (ragEnabled) {
        try {
            toast("Searching knowledge base...", "info", 1500);
            const { context, sources } = await queryRAG(promptText);
            if (context) {
                ragSources = sources;
                finalPrompt = `Use the following context to answer the question. If the answer is not in the context, say you don't know.\n\nContext:\n${context}\n\nQuestion: ${promptText}`;
            }
        } catch (e) {
            console.error("RAG error", e);
            toast("RAG search failed: " + e.message, "error");
        }
    }

    const baseUrl = cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "";
    const isOpenAIMode = cfgOpenaiMode ? cfgOpenaiMode.checked : false;
    const apiKey = cfgApiKey ? cfgApiKey.value : "";
    const conv = conversations[activeConvId];

    const messages = [];
    if (cfgSystemPrompt && cfgSystemPrompt.value.trim()) messages.push({ role: "system", content: cfgSystemPrompt.value.trim() });
    const history = conv.messages.slice(0, -1).slice(-10);
    history.forEach(m => {
        if (m.sender === "user" || m.sender === "assistant") messages.push({ role: m.sender, content: m.text });
    });
    messages.push({ role: "user", content: finalPrompt, images: images.length ? images : undefined });

    let fetchUrl, fetchBody, fetchHeaders = { "Content-Type": "application/json" };
    if (isOpenAIMode) {
        fetchUrl = `${baseUrl}/v1/chat/completions`;
        if (apiKey) fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
        fetchBody = { model: cfgModel ? cfgModel.value : "gpt-3.5-turbo", messages, temperature: cfgTemp ? parseFloat(cfgTemp.value) : 0.7, stream: cfgStream ? cfgStream.checked : true };
    } else {
        fetchUrl = `${baseUrl}/api/chat`;
        fetchBody = { model: cfgModel ? cfgModel.value : "gemma4", messages, stream: cfgStream ? cfgStream.checked : true, options: { temperature: cfgTemp ? parseFloat(cfgTemp.value) : 0.7, num_ctx: cfgCtx ? parseInt(cfgCtx.value) : 4096 } };
    }

    try {
        const res = await fetch(fetchUrl, {
            method: "POST",
            headers: fetchHeaders,
            signal: currentAbortController.signal,
            body: JSON.stringify(fetchBody)
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        if (cfgStream ? cfgStream.checked : true) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        if (isOpenAIMode) {
                            if (line.startsWith("data: ")) {
                                const jsonStr = line.substring(6);
                                if (jsonStr === "[DONE]") break;
                                const parsed = JSON.parse(jsonStr);
                                const delta = parsed.choices?.[0]?.delta?.content;
                                if (delta) {
                                    accumulated += delta;
                                    updateStreamingMessage(msgDiv, accumulated, thinkingContent);
                                }
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

        conv.messages[conv.messages.length - 1] = {
            id: wrapper.dataset.msgId,
            text: accumulated,
            sender: "assistant",
            images: [],
            ts: Date.now(),
            thinking: thinkingContent || null,
            ragSources: ragSources.length > 0 ? ragSources : null
        };
        saveConversations();
        updateTokenCounter();
        if (cfgAutoTts && cfgAutoTts.checked && accumulated) speakText(accumulated);

        if (ragSources.length > 0) {
            const sourcesDiv = document.createElement("div");
            sourcesDiv.className = "rag-sources";
            sourcesDiv.innerHTML = `<span class="rag-sources-title">📚 Sources:</span>`;
            const uniqueSources = [...new Set(ragSources)];
            uniqueSources.forEach(src => {
                const pill = document.createElement("span");
                pill.className = "rag-source-pill";
                pill.textContent = src;
                sourcesDiv.appendChild(pill);
            });
            wrapper.appendChild(sourcesDiv);
        }
    } catch (err) {
        if (err.name === "AbortError") {
            msgDiv.innerHTML = parseMarkdownToHtml(accumulated + "\n\n*[stopped]*");
            conv.messages[conv.messages.length - 1] = {
                id: wrapper.dataset.msgId,
                text: accumulated,
                sender: "assistant",
                images: [],
                ts: Date.now(),
                thinking: thinkingContent || null
            };
            saveConversations();
            toast("Generation stopped", "warning");
        } else {
            msgDiv.innerHTML = `<span style="color:var(--error);">⚠️ ${escapeHtml(err.message)}</span>`;
            toast("Error: " + err.message, "error");
        }
    } finally {
        if (sendBtn) sendBtn.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";
        isGenerating = false;
        currentAbortController = null;
        currentImages = [];
    }
}

function updateStreamingMessage(msgDiv, content, thinking, final = false) {
    let html = "";
    if (thinking && cfgShowThinking && cfgShowThinking.checked) {
        html += `<details class="thinking-block" ${final ? "" : "open"}><summary>💭 Thinking...</summary><div>${parseMarkdownToHtml(thinking)}</div></details>`;
    }
    html += `<div class="message-content">${content ? parseMarkdownToHtml(content) : '<div class="typing-indicator"><span></span><span></span><span></span></div>'}</div>`;
    msgDiv.innerHTML = html;
    enhanceCodeBlocks(msgDiv);
    autoScrollChat();
}

/* ============ Model fetching ============ */
async function fetchOllamaModels() {
    try {
        let baseUrl = cfgUrl ? cfgUrl.value.trim() : "";
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (!baseUrl) { toast("Please enter a valid Server URL first.", "warning"); return; }

        const url = `${baseUrl}/api/tags`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();

        if (cfgModel) cfgModel.innerHTML = "";
        if (cfgRagModel) cfgRagModel.innerHTML = "";

        const defaultEmbed = "nomic-embed-text";
        let hasDefaultEmbed = false;

        if (data.models && data.models.length > 0) {
            data.models.forEach(m => {
                if (cfgModel) {
                    const o = document.createElement("option");
                    o.value = m.name; o.textContent = m.name;
                    cfgModel.appendChild(o);
                }
                if (cfgRagModel) {
                    const ragOpt = document.createElement("option");
                    ragOpt.value = m.name; ragOpt.textContent = m.name;
                    cfgRagModel.appendChild(ragOpt);
                }
                if (m.name === defaultEmbed) hasDefaultEmbed = true;
            });

            if (!hasDefaultEmbed && cfgRagModel) {
                const ragOpt = document.createElement("option");
                ragOpt.value = defaultEmbed;
                ragOpt.textContent = `${defaultEmbed} (not installed)`;
                cfgRagModel.prepend(ragOpt);
            }

            browser.storage.local.get(["selectedModel", "ragModel"]).then(res => {
                if (res.selectedModel && cfgModel) cfgModel.value = res.selectedModel;
                if (res.ragModel && cfgRagModel) cfgRagModel.value = res.ragModel;
                else if (cfgRagModel) cfgRagModel.value = defaultEmbed;
                if (currentModelTag && cfgModel) currentModelTag.innerText = cfgModel.value;
            });

            toast(`Loaded ${data.models.length} models`, "success");
        } else {
            toast("No models found. Click 'Pull' to download one.", "warning");
        }
    } catch (e) {
        toast(`Could not fetch models: ${e.message}`, "error");
    }
}

/* ============ Server status ============ */
async function checkServerStatus() {
    try {
        let baseUrl = cfgUrl ? cfgUrl.value.trim() : "";
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (!baseUrl) return;

        const res = await fetch(`${baseUrl}/api/tags`);
        if (res.ok) {
            if (statusDot) statusDot.className = "status-dot online";
            if (statusText) statusText.textContent = "Server online";
        } else throw new Error();
    } catch {
        if (statusDot) statusDot.className = "status-dot offline";
        if (statusText) statusText.textContent = "Server offline";
    }
}

/* ============ Token Counter ============ */
function updateTokenCounter() {
    if (!tokenCounter) return;
    const conv = conversations[activeConvId];
    if (!conv || !conv.messages) {
        tokenCounter.textContent = "~0 tokens";
        if (messageCount) messageCount.textContent = "0 messages";
        return;
    }
    let totalChars = 0;
    conv.messages.forEach(m => { if (m.text) totalChars += m.text.length; });
    const estimatedTokens = Math.round(totalChars / 4);
    tokenCounter.textContent = `~${estimatedTokens} tokens`;
    if (messageCount) messageCount.textContent = `${conv.messages.length} messages`;
}

/* ============ Keyboard Shortcuts ============ */
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === "n" || e.key === "N") { e.preventDefault(); createConversation(true); }
        else if (e.key === "k" || e.key === "K") { e.preventDefault(); if (historyBtn) historyBtn.click(); }
        else if (e.key === "e" || e.key === "E") { e.preventDefault(); if (exportBtn) exportBtn.click(); }
        else if (e.key === ",") { e.preventDefault(); if (toggleSettingsBtn) toggleSettingsBtn.click(); }
        else if (e.key === "/" || e.key === "?") { e.preventDefault(); if (shortcutsModal) shortcutsModal.classList.toggle("active"); }
        else if (e.key === "r" || e.key === "R") { e.preventDefault(); if (ragToggleBtn) ragToggleBtn.click(); }
    }
    if (e.key === "Escape") {
        if (imageModal) imageModal.classList.remove("active");
        if (shortcutsModal) shortcutsModal.classList.remove("active");
        if (historyModal) historyModal.classList.remove("active");
        if (settingsModal) settingsModal.classList.remove("active");
        if (isGenerating && currentAbortController) currentAbortController.abort();
    }
});

if (closeShortcuts) closeShortcuts.addEventListener("click", () => { if (shortcutsModal) shortcutsModal.classList.remove("active"); });
if (shortcutsModal) shortcutsModal.addEventListener("click", (e) => { if (e.target === shortcutsModal) shortcutsModal.classList.remove("active"); });
if (historyModal) historyModal.addEventListener("click", (e) => { if (e.target === historyModal) historyModal.classList.remove("active"); });


/* ============ UI/UX ENHANCEMENTS ============ */

// 1. Context Menu Storage Listener (Fixes Context Not Sending when sidebar is already open)
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.pendingPrompt && changes.pendingPrompt.newValue) {
        handleIncomingPrompt(changes.pendingPrompt.newValue);
        browser.storage.local.remove("pendingPrompt");
    }
});

// 2. Scroll to Bottom Button
const scrollBottomBtn = document.createElement('button');
scrollBottomBtn.id = 'scroll-bottom-btn';
scrollBottomBtn.className = 'icon-btn';
scrollBottomBtn.innerHTML = '⬇️';
scrollBottomBtn.title = 'Scroll to bottom';
const chatArena = document.querySelector('.chat-arena');
if (chatArena) {
    chatArena.appendChild(scrollBottomBtn);

    chatContainer.addEventListener('scroll', () => {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
        scrollBottomBtn.style.display = isNearBottom ? 'none' : 'inline-flex';
    });

    scrollBottomBtn.addEventListener('click', () => {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    });
}

// 3. Drag and Drop Support
let dragOverlay = document.querySelector('.drag-overlay');
if (!dragOverlay && chatArena) {
    dragOverlay = document.createElement('div');
    dragOverlay.className = 'drag-overlay';
    dragOverlay.innerHTML = `<div class="drag-overlay-content"><div class="drag-icon">📎</div><div class="drag-text">Drop files to attach</div></div>`;
    chatArena.appendChild(dragOverlay);
}

if (chatArena && dragOverlay) {
    let dragCounter = 0;

    chatArena.addEventListener('dragenter', (e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
            dragCounter++;
            dragOverlay.classList.add('active');
        }
    });

    chatArena.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) dragOverlay.classList.remove('active');
    });

        chatArena.addEventListener('dragover', (e) => e.preventDefault());

        chatArena.addEventListener('drop', async (e) => {
            e.preventDefault();
            dragCounter = 0;
            dragOverlay.classList.remove('active');
            if (e.dataTransfer.files.length > 0) {
                await handleFiles(Array.from(e.dataTransfer.files));
            }
        });
}

// 4. Slash Commands Palette
let slashPalette = document.querySelector('.slash-palette');
if (!slashPalette && document.querySelector('.footer-input-tray')) {
    slashPalette = document.createElement('div');
    slashPalette.className = 'slash-palette';
    document.querySelector('.footer-input-tray').appendChild(slashPalette);
}

const slashCommands = [
    { name: 'summarize', icon: '📋', desc: 'Summarize text', prompt: 'Please summarize the following content concisely:\n\n' },
{ name: 'explain', icon: '💡', desc: 'Explain concept', prompt: 'Explain the following concept in simple terms:\n\n' },
{ name: 'translate', icon: '🌐', desc: 'Translate text', prompt: 'Translate the following text to English:\n\n' },
{ name: 'code-review', icon: '🔍', desc: 'Review code', prompt: 'Review this code for bugs and improvements:\n\n```\n\n```\n' },
{ name: 'brainstorm', icon: '🎨', desc: 'Brainstorm ideas', prompt: 'Help me brainstorm ideas for: ' },
{ name: 'refactor', icon: '🛠️', desc: 'Refactor code', prompt: 'Refactor this code to improve readability:\n\n```\n\n```\n' }
];

if (userInput && slashPalette) {
    let html = '<div class="slash-palette-header">Commands</div><div class="slash-palette-list">';
    slashCommands.forEach(cmd => {
        html += `<div class="slash-command" data-prompt="${cmd.prompt.replace(/"/g, '&quot;')}">
        <div class="slash-command-icon">${cmd.icon}</div>
        <div class="slash-command-info">
        <div class="slash-command-name">/${cmd.name}</div>
        <div class="slash-command-desc">${cmd.desc}</div>
        </div>
        </div>`;
    });
    html += '</div>';
    slashPalette.innerHTML = html;

    userInput.addEventListener('input', () => {
        if (userInput.value.startsWith('/')) {
            slashPalette.classList.add('active');
            const filter = userInput.value.slice(1).toLowerCase();
            slashPalette.querySelectorAll('.slash-command').forEach(el => {
                const name = el.querySelector('.slash-command-name').textContent.toLowerCase();
                el.style.display = name.includes(filter) ? 'flex' : 'none';
            });
        } else {
            slashPalette.classList.remove('active');
        }
    });

    slashPalette.addEventListener('click', (e) => {
        const cmd = e.target.closest('.slash-command');
        if (cmd) {
            userInput.value = cmd.dataset.prompt;
            slashPalette.classList.remove('active');
            userInput.focus();
            autoResizeTextarea();
        }
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') slashPalette.classList.remove('active');
    });
}

// 5. Inline Edit Modal (Replaces ugly native prompt)
function showEditModal(originalText, onSave) {
    let modal = document.querySelector('.inline-edit-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal inline-edit-modal';
        modal.innerHTML = `
        <div class="modal-content inline-edit-content">
        <div class="modal-header">
        <h3>Edit Message</h3>
        <button class="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
        <textarea class="inline-edit-textarea" style="width:100%; min-height:120px; padding:12px; background:var(--bg-surface); color:var(--fg); border:1px solid var(--border); border-radius:8px; font-family:inherit; font-size:14px; line-height:1.5; resize:vertical;"></textarea>
        </div>
        <div class="modal-footer">
        <button class="action-btn cancel-edit">Cancel</button>
        <button class="action-btn primary save-edit">Save & Resend</button>
        </div>
        </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));
        modal.querySelector('.cancel-edit').addEventListener('click', () => modal.classList.remove('active'));
        modal.querySelector('.save-edit').addEventListener('click', () => {
            const newText = modal.querySelector('.inline-edit-textarea').value;
            modal.classList.remove('active');
            onSave(newText);
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    }

    modal.querySelector('.inline-edit-textarea').value = originalText;
    modal.classList.add('active');
    setTimeout(() => modal.querySelector('.inline-edit-textarea').focus(), 100);
}

// Override the original editAndResend to use the new modal
async function editAndResend(msgId) {
    const conv = conversations[activeConvId];
    const idx = conv.messages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    const original = conv.messages[idx];

    showEditModal(original.text, (newText) => {
        if (!newText || !newText.trim()) return;
        conv.messages = conv.messages.slice(0, idx);
        saveConversations();
        renderMessages();
        if(userInput) userInput.value = newText;
        if(sendBtn) sendBtn.click();
    });
}

