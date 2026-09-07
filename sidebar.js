/* ============ PDF.js Setup (Local) ============ */
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = browser.runtime.getURL('lib/pdfjs/pdf.worker.min.js');
}

/* ============ DOM refs ============ */
const getEl = (id) => document.getElementById(id);
const chatContainer     = getEl("chat-container");
const chatArena         = document.querySelector(".chat-arena");
let scrollBottomBtn     = null;
const userInput         = getEl("user-input");
const sendBtn           = getEl("send-btn");
const stopBtn           = getEl("stop-btn");
const toggleSettingsBtn = getEl("toggle-settings");
const settingsModal     = getEl("settings-modal");
const closeSettings     = getEl("close-settings");
const btnFetchModels    = getEl("btn-fetch-models");
const cfgUrl            = getEl("cfg-url");
const cfgModel          = getEl("cfg-model");
const quickModelSelect  = getEl("quick-model-select");
const cfgSystemPrompt   = getEl("cfg-system-prompt");
const cfgTemp           = getEl("cfg-temp");
const cfgCtx            = getEl("cfg-ctx");
const cfgStream         = getEl("cfg-stream");
const tempVal           = getEl("temp-val");
const currentModelTag   = getEl("current-model-tag");
const filePicker        = getEl("file-picker");
const attachBtn         = getEl("attach-btn");
const attachTabBtn      = getEl("attach-tab-btn");
const previewZone       = getEl("input-preview-zone");
const clearBtn          = getEl("clear-btn");
const clearInputBtn     = getEl("clear-input-btn");
const themeChips        = document.querySelectorAll(".theme-chip");
const statusDot         = getEl("status-indicator");
const statusText        = getEl("status-text");
const tokenCounter      = getEl("token-counter");
const messageCount      = getEl("message-count");
const contextMeterFill  = getEl("context-meter-fill");
const newChatBtnHeader  = getEl("new-chat-btn-header");
const exportBtn         = getEl("export-btn");
const exportMdBtn       = getEl("export-md-btn");
const exportHtmlBtn     = getEl("export-html-btn");
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
const helpBtn           = getEl("help-btn");
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
const ragDraftArea      = getEl("rag-draft-area");
const ragDraftInfo      = getEl("rag-draft-info");
const ragSaveDraftBtn   = getEl("rag-save-draft");

// Settings tabs & Model management
const settingsTabs      = document.querySelectorAll(".settings-tab");
const settingsTabContents = document.querySelectorAll(".settings-tab-content");
const cfgPresetPrompt   = getEl("cfg-preset-prompt");
const pullModelName     = getEl("pull-model-name");
const btnConfirmPull    = getEl("btn-confirm-pull");
const pullProgressBar   = getEl("pull-progress-bar");
const pullProgressBarContainer = getEl("pull-progress-bar-container");
const pullProgress      = getEl("pull-progress");
const installedModelsList = getEl("installed-models-list");
const newConvBtnHistory = getEl("new-conversation-btn-history");
const cfgReviewPrompts  = getEl("cfg-review-prompts");
const cfgFloatingMenu   = getEl("cfg-floating-menu");

/* ============ Icons (Modern SVG System) ============ */
const ICONS = {
    copy: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    check: `<svg class="icon icon-sm" viewBox="0 0 24 24" style="stroke:var(--success);"><polyline points="20 6 9 17 4 12"/></svg>`,
    edit: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
    fork: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
    regen: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
    read: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    del: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    pin: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
    pinFilled: `<svg class="icon icon-sm" viewBox="0 0 24 24" style="fill:currentColor;"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
    download: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    eye: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    close: `<svg class="icon icon-xs" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    mic: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    stopSquare: `<svg class="icon" viewBox="0 0 24 24"><rect width="12" height="12" x="6" y="6" rx="2"/></svg>`,
    file: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
};

/* ============ State ============ */
let currentImages = [];     // Array of { id, b64, type }
let attachedFiles = [];     // Array of { id, name, text, label, icon, processing }
let contextFileText = "";   // Legacy fallback support
let conversations = {};
let activeConvId = null;
let currentAbortController = null;
let isGenerating = false;
let recognition = null;
let isRecording = false;
let ragWorker = null;
try {
    ragWorker = new Worker(browser.runtime.getURL('rag-worker.js'));
} catch (e) {
    console.warn("[ChatAI] Web Worker initialization notice:", e);
}
let ragEnabled = false;
let isProcessingPrompt = false;

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

const slashCommands = [
    { name: 'summarize', icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`, desc: 'Summarize text', prompt: 'Please summarize the following content concisely:\n\n' },
    { name: 'explain', icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`, desc: 'Explain concept', prompt: 'Explain the following concept in simple terms:\n\n' },
    { name: 'translate', icon: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, desc: 'Translate text', prompt: 'Translate the following text to English:\n\n' },
    { name: 'code-review', icon: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><path d="m8 11 2 2 4-4"/></svg>`, desc: 'Review code', prompt: 'Review this code for bugs and improvements:\n\n```\n\n```\n' },
    { name: 'brainstorm', icon: `<svg class="icon" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`, desc: 'Brainstorm ideas', prompt: 'Help me brainstorm ideas for: ' },
    { name: 'refactor', icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, desc: 'Refactor code', prompt: 'Refactor this code to improve readability:\n\n```\n\n```\n' }
];




/* ============ Token Estimation (more accurate than chars/4) ============ */
function estimateTokens(text) {
    if (!text) return 0;
    // Better heuristic: accounts for code, punctuation, CJK
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
    const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const punctuation = (text.match(/[^\w\s]/g) || []).length;

    // ~1.3 tokens per word for English, code blocks are denser, CJK is 1:1
    let tokens = words * 1.3 + codeBlocks * 50 + cjkChars * 0.9 + punctuation * 0.3;
    return Math.ceil(tokens);
}




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
    "autoTts", "fontSize", "ragModel", "ragTopk", "ragChunkSize", "presetPrompt", "ragEnabled",
    "reviewPrompts", "enableFloatingMenu"
]).then((res) => {
    console.log("[Init] Storage loaded");
    if (res.serverUrl && cfgUrl) cfgUrl.value = res.serverUrl;
    else if (cfgUrl) cfgUrl.value = "http://localhost:11434";
    
    if (res.theme) { applyTheme(res.theme); setActiveThemeChip(res.theme); }
    else { applyTheme("auto"); setActiveThemeChip("auto"); }
    
    if (res.systemPrompt && cfgSystemPrompt) cfgSystemPrompt.value = res.systemPrompt;
    if (res.temperature && cfgTemp) { 
        cfgTemp.value = res.temperature; 
        if (tempVal) tempVal.textContent = res.temperature; 
    }
    if (res.contextLength && cfgCtx) cfgCtx.value = res.contextLength;
    if (typeof res.stream === "boolean" && cfgStream) cfgStream.checked = res.stream;
    if (res.openaiMode) { 
        if (cfgOpenaiMode) cfgOpenaiMode.checked = res.openaiMode; 
        if (apiKeyGroup) apiKeyGroup.style.display = "block"; 
    }
    if (res.apiKey && cfgApiKey) cfgApiKey.value = res.apiKey;
    if (res.showThinking && cfgShowThinking) cfgShowThinking.checked = res.showThinking;
    if (res.autoTts && cfgAutoTts) cfgAutoTts.checked = res.autoTts;
    if (res.ragModel && cfgRagModel) cfgRagModel.value = res.ragModel;
    if (res.ragTopk && cfgRagTopk) cfgRagTopk.value = res.ragTopk;
    if (res.ragChunkSize && cfgRagChunkSize) cfgRagChunkSize.value = res.ragChunkSize;
    if (res.ragEnabled) { ragEnabled = res.ragEnabled; updateRagToggleUI(); }
    if (res.presetPrompt && cfgPresetPrompt) cfgPresetPrompt.value = res.presetPrompt;
    if (typeof res.reviewPrompts === "boolean" && cfgReviewPrompts) cfgReviewPrompts.checked = res.reviewPrompts;
    if (typeof res.enableFloatingMenu === "boolean" && cfgFloatingMenu) cfgFloatingMenu.checked = res.enableFloatingMenu;
    
    if (res.fontSize) {
        document.body.classList.add(`font-${res.fontSize}`);
        fontSizeBtns.forEach(b => b.classList.toggle("active", b.dataset.size === res.fontSize));
    }
    
    conversations = res.conversations || {};
    activeConvId = res.activeConvId || null;
    
    if (res.selectedModel) {
        if (currentModelTag) currentModelTag.innerText = res.selectedModel;
        if (cfgModel) {
            const opt = document.createElement("option");
            opt.value = res.selectedModel; opt.textContent = res.selectedModel;
            cfgModel.appendChild(opt); cfgModel.value = res.selectedModel;
        }
        if (quickModelSelect) {
            const opt = document.createElement("option");
            opt.value = res.selectedModel; opt.textContent = res.selectedModel;
            quickModelSelect.appendChild(opt); quickModelSelect.value = res.selectedModel;
        }
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
    loadRagDocuments();
    initSlashPalette();
    checkRagDraft();
});

/* ============ Slash Palette Definition ============ */
function initSlashPalette() {
    let slashPalette = document.querySelector('.slash-palette');
    const tray = document.querySelector('.footer-input-tray');
    if (!slashPalette && tray) {
        slashPalette = document.createElement('div');
        slashPalette.className = 'slash-palette';
        tray.appendChild(slashPalette);
    }
    if (!userInput || !slashPalette) return;

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
    
    userInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') slashPalette.classList.remove('active'); });
}

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
function enhanceCodeBlocks(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        if (!pre) return;
        
        pre.style.position = 'relative';
        const classes = block.className.split(' ');
        const langClass = classes.find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'text';
        pre.setAttribute('data-lang', lang);
        
        if (!pre.querySelector('.code-block-actions')) {
            const actions = document.createElement('div');
            actions.className = 'code-block-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-action-btn';
            copyBtn.innerHTML = `${ICONS.copy}<span>Copy</span>`;
            copyBtn.title = 'Copy code';
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(block.innerText);
                } catch {
                    const textarea = document.createElement("textarea");
                    textarea.value = block.innerText;
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }
                copyBtn.innerHTML = `${ICONS.check}<span>Copied!</span>`;
                setTimeout(() => copyBtn.innerHTML = `${ICONS.copy}<span>Copy</span>`, 1500);
            });
            actions.appendChild(copyBtn);
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'code-action-btn';
            downloadBtn.innerHTML = `${ICONS.download}<span>Download</span>`;
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
                downloadBtn.innerHTML = `${ICONS.check}<span>Saved!</span>`;
                setTimeout(() => downloadBtn.innerHTML = `${ICONS.download}<span>Download</span>`, 1500);
            });
            actions.appendChild(downloadBtn);
            
            const previewBtn = document.createElement('button');
            previewBtn.className = 'code-action-btn';
            previewBtn.innerHTML = `${ICONS.eye}<span>Preview</span>`;
            previewBtn.title = 'Preview code';
            previewBtn.addEventListener('click', () => {
                openCodePreview(block.innerText, lang);
            });
            actions.appendChild(previewBtn);
            
            pre.prepend(actions);
        }
        
        if (typeof hljs !== 'undefined') {
            if (!block.classList.contains('hljs')) {
                try { hljs.highlightElement(block); } catch (e) { console.warn("HLJS highlight failed:", e); }
            }
        }
    });
}

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

function openCodePreview(code, lang) {
    const previewId = "prev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    let modal = document.getElementById('code-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'code-preview-modal';
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content" style="max-width: 90vw; width: 90vw; height: 90vh;">
            <div class="modal-header">
                <h3>Code Preview</h3>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="action-btn" id="open-preview-tab-btn" title="Open preview in a full browser tab">↗️ New Tab</button>
                    <button class="modal-close-btn" id="close-preview-modal">✕</button>
                </div>
            </div>
            <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; height: calc(100% - 60px);">
                <iframe id="preview-iframe" style="flex: 1; border: none; background: #fff; border-radius: 0 0 16px 16px;"></iframe>
            </div>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById('close-preview-modal').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    }
    
    modal.querySelector('h3').textContent = `Code Preview (${lang || 'text'})`;
    const iframe = document.getElementById('preview-iframe');
    let content = '';
    const langLower = (lang || '').toLowerCase();
    
    if (['html', 'svg', 'xml'].includes(langLower)) content = code;
    else if (langLower === 'css') content = `<html><head><style>${code}</style></head><body style="font-family:sans-serif; padding:20px;"><h1>CSS Preview</h1><div class="preview-box" style="padding:20px; border:2px dashed #6366f1; border-radius:8px;">Styled Content Box</div></body></html>`;
    else if (['javascript', 'js', 'typescript', 'ts'].includes(langLower)) content = `<html><body><script>try { ${code} } catch(e) { document.body.innerHTML = '<pre style="color:red; font-family:monospace; padding:16px;">' + e.message + '</pre>'; } <\/script></body></html>`;
    else {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        content = `<html><head><style>body{font-family:monospace; padding:20px; background:#1e1e1e; color:#d4d4d4; white-space:pre-wrap; margin:0;} </style></head><body><pre>${escaped}</pre></body></html>`;
    }
    
    iframe.srcdoc = content;
    modal.classList.add('active');

    // Store in background and storage for opening in dedicated tab
    browser.runtime.sendMessage({ action: "store-preview-data", previewId, html: content }).catch(() => {});
    const storeObj = {};
    storeObj[`preview_data_${previewId}`] = content;
    storeObj[`preview_time_${previewId}`] = Date.now();
    browser.storage.local.set(storeObj).catch(() => {});

    const tabBtn = document.getElementById('open-preview-tab-btn');
    if (tabBtn) {
        tabBtn.onclick = () => {
            browser.tabs.create({ url: browser.runtime.getURL(`preview.html?id=${previewId}`) });
        };
    }
}

/* ============ Auto-Scroll Management ============ */
let isUserScrolledUp = false;
let scrollRafId = null;

function getScrollElement() {
    return chatArena || chatContainer;
}

function autoScrollChat(force = false) {
    const el = getScrollElement();
    if (!el) return;

    if (force) {
        isUserScrolledUp = false;
        el.scrollTop = el.scrollHeight;
        if (scrollBottomBtn) scrollBottomBtn.style.display = "none";
        return;
    }

    if (isUserScrolledUp) {
        if (scrollBottomBtn) scrollBottomBtn.style.display = "inline-flex";
        return;
    }

    if (scrollRafId) cancelAnimationFrame(scrollRafId);
    scrollRafId = requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        scrollRafId = null;
    });
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
    const searchTerm = (searchInput?.value || "").toLowerCase();
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
            <div class="history-item-title">${c.pinned ? `<span style="margin-right:4px;">${ICONS.pinFilled}</span>` : ''}${escapeHtml(c.title)}</div>
            <div class="history-item-actions">
                <button data-action="pin" title="${c.pinned ? 'Unpin' : 'Pin'}">${c.pinned ? ICONS.pinFilled : ICONS.pin}</button>
                <button data-action="rename" title="Rename">${ICONS.edit}</button>
                <button data-action="delete" title="Delete">${ICONS.del}</button>
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

if (newConvBtnHistory) newConvBtnHistory.addEventListener("click", () => { createConversation(true); if (historyModal) historyModal.classList.remove('active'); });
if (newChatBtnHeader) newChatBtnHeader.addEventListener("click", () => { createConversation(true); });
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
                    if (userInput) userInput.value = btn.dataset.prompt;
                    if (userInput) userInput.focus();
                    autoResizeTextarea();
                });
            });
        }
        return;
    }
    
    conv.messages.forEach(m => appendMessage(m.text, m.sender, m.images, false, m.id, m.ts, m.thinking, m.ragSources));
    updateTokenCounter();
    setTimeout(() => autoScrollChat(true), 50);
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
            if (!imgBase64 || typeof imgBase64 !== "string") return;
            const imgEl = document.createElement("img");
            imgEl.src = imgBase64.startsWith("data:") ? imgBase64 : `data:image/jpeg;base64,${imgBase64}`;
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
    
    const copyBtn = document.createElement("span");
    copyBtn.className = "action-link";
    copyBtn.innerHTML = `${ICONS.copy}<span>Copy</span>`;
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(msg.innerText).then(() => {
            copyBtn.innerHTML = `${ICONS.check}<span>Copied!</span>`;
            setTimeout(() => { copyBtn.innerHTML = `${ICONS.copy}<span>Copy</span>`; }, 1500);
            toast("Copied!", "success", 1200);
        });
    });
    actions.appendChild(copyBtn);
    
    if (sender === "user") {
        const editBtn = document.createElement("span");
        editBtn.className = "action-link";
        editBtn.innerHTML = `${ICONS.edit}<span>Edit</span>`;
        editBtn.addEventListener("click", () => editAndResend(msgId));
        actions.appendChild(editBtn);
        
        const forkBtn = document.createElement("span");
        forkBtn.className = "action-link";
        forkBtn.innerHTML = `${ICONS.fork}<span>Fork</span>`;
        forkBtn.addEventListener("click", () => forkConversation(msgId));
        actions.appendChild(forkBtn);
    } else {
        const regenBtn = document.createElement("span");
        regenBtn.className = "action-link";
        regenBtn.innerHTML = `${ICONS.regen}<span>Regen</span>`;
        regenBtn.addEventListener("click", () => regenerate(msgId));
        actions.appendChild(regenBtn);
        
        const readBtn = document.createElement("span");
        readBtn.className = "action-link";
        readBtn.innerHTML = `${ICONS.read}<span>Read</span>`;
        readBtn.addEventListener("click", () => speakText(text));
        actions.appendChild(readBtn);
    }
    
    const delMsgBtn = document.createElement("span");
    delMsgBtn.className = "action-link danger-link";
    delMsgBtn.innerHTML = `${ICONS.del}<span>Del</span>`;
    delMsgBtn.title = "Delete this message";
    delMsgBtn.addEventListener("click", () => {
        if (!confirm("Delete this message?")) return;
        const conv = conversations[activeConvId];
        if (conv) {
            conv.messages = conv.messages.filter(m => m.id !== msgId);
            saveConversations();
            updateTokenCounter();
        }
        wrapper.remove();
        toast("Message deleted", "info", 1200);
    });
    actions.appendChild(delMsgBtn);
    
    wrapper.appendChild(actions);
    chatContainer.appendChild(wrapper);
    enhanceCodeBlocks(msg);
    autoScrollChat(true);
    
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

function forkConversation(msgId) {
    const conv = conversations[activeConvId];
    const idx = conv.messages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    const newId = "conv_" + Date.now();
    const forkedMessages = conv.messages.slice(0, idx + 1);
    conversations[newId] = { id: newId, title: conv.title + " (Fork)", messages: forkedMessages, createdAt: Date.now(), pinned: false };
    saveConversations();
    switchConversation(newId);
    toast("Conversation forked 🔀", "success");
}

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
        if (userInput) userInput.value = newText;
        if (sendBtn) sendBtn.click();
    });
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

if (exportHtmlBtn) exportHtmlBtn.addEventListener("click", () => {
    const conv = conversations[activeConvId];
    if (!conv || conv.messages.length === 0) return toast("No messages to export", "warning");
    const title = conv.title || "Chat Transcript";
    let bodyHtml = "";
    conv.messages.forEach(m => {
        const author = m.sender === "user" ? "You" : "AI";
        const time = new Date(m.ts).toLocaleTimeString();
        const content = m.sender === "user" ? escapeHtml(m.text).replace(/\n/g, "<br>") : parseMarkdownToHtml(m.text);
        bodyHtml += `<div class="msg ${m.sender}" style="margin-bottom:18px; padding:14px 18px; border-radius:12px; ${m.sender === 'user' ? 'background:#4f46e5; color:#fff; margin-left:15%;' : 'background:#17171c; border:1px solid #2c2c34; color:#ececf1; margin-right:15%;'}"><div style="font-size:11px; opacity:0.75; margin-bottom:6px;"><strong>${author}</strong> · ${time}</div><div>${content}</div></div>`;
    });
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:#0f0f13; color:#ececf1; padding:24px; max-width:800px; margin:0 auto; line-height:1.6;} pre{background:#0d1117; color:#e6edf3; padding:12px; border-radius:8px; overflow-x:auto;} code{font-family:monospace;}</style></head><body><h1>🧠 ${escapeHtml(title)}</h1><hr style="border:0; border-top:1px solid #2c2c34; margin:16px 0 24px;">${bodyHtml}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    downloadBlob(blob, `${sanitizeFilename(conv.title)}.html`);
    toast("Exported as HTML transcript", "success");
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
if (cfgReviewPrompts) cfgReviewPrompts.addEventListener("change", () => browser.storage.local.set({ reviewPrompts: cfgReviewPrompts.checked }));
if (cfgFloatingMenu) cfgFloatingMenu.addEventListener("change", () => browser.storage.local.set({ enableFloatingMenu: cfgFloatingMenu.checked }));

if (btnFetchModels) btnFetchModels.addEventListener("click", fetchOllamaModels);
if (cfgModel) cfgModel.addEventListener("change", () => {
    browser.storage.local.set({ selectedModel: cfgModel.value });
    if (quickModelSelect) quickModelSelect.value = cfgModel.value;
    if (currentModelTag) currentModelTag.innerText = cfgModel.value;
});
if (quickModelSelect) quickModelSelect.addEventListener("change", () => {
    const chosen = quickModelSelect.value;
    if (cfgModel) cfgModel.value = chosen;
    browser.storage.local.set({ selectedModel: chosen });
    if (currentModelTag) currentModelTag.innerText = chosen;
    toast(`Model: ${chosen}`, "info", 1500);
});
if (cfgUrl) cfgUrl.addEventListener("change", () => browser.storage.local.set({ serverUrl: cfgUrl.value }));
if (cfgSystemPrompt) cfgSystemPrompt.addEventListener("change", () => browser.storage.local.set({ systemPrompt: cfgSystemPrompt.value }));
if (cfgTemp) cfgTemp.addEventListener("input", () => {
    if (tempVal) tempVal.textContent = cfgTemp.value;
    browser.storage.local.set({ temperature: parseFloat(cfgTemp.value) });
});
if (cfgCtx) cfgCtx.addEventListener("change", () => browser.storage.local.set({ contextLength: parseInt(cfgCtx.value) }));
if (cfgStream) cfgStream.addEventListener("change", () => browser.storage.local.set({ stream: cfgStream.checked }));

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

if (btnConfirmPull) btnConfirmPull.addEventListener("click", async () => {
    const modelName = pullModelName ? pullModelName.value.trim() : "";
    if (!modelName) return toast("Enter a model name", "warning");
    if (btnConfirmPull) btnConfirmPull.disabled = true;
    if (pullProgress) pullProgress.textContent = "Starting pull...";
    if (pullProgressBarContainer) pullProgressBarContainer.style.display = "block";
    if (pullProgressBar) pullProgressBar.style.width = "0%";
    browser.runtime.sendMessage({ action: "pull-model", baseUrl: cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "", modelName });
});

browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === "pull-progress") {
        if (msg.data.status && pullProgress) pullProgress.textContent = msg.data.status;
        if (msg.data.total && msg.data.completed && pullProgress) {
            const pct = Math.min(((msg.data.completed / msg.data.total) * 100), 100).toFixed(1);
            pullProgress.textContent = `${msg.data.status || 'Downloading'} (${pct}%)`;
            if (pullProgressBar) pullProgressBar.style.width = `${pct}%`;
        }
    } else if (msg.action === "pull-complete") {
        if (pullProgress) pullProgress.textContent = "✅ Pull complete! Fetching models...";
        if (pullProgressBar) pullProgressBar.style.width = "100%";
        if (btnConfirmPull) btnConfirmPull.disabled = false;
        fetchOllamaModels();
        setTimeout(() => {
            if (pullProgress) pullProgress.textContent = "";
            if (pullProgressBarContainer) pullProgressBarContainer.style.display = "none";
        }, 3000);
    } else if (msg.action === "pull-error") {
        if (pullProgress) pullProgress.textContent = `❌ Error: ${msg.error}`;
        if (pullProgressBarContainer) pullProgressBarContainer.style.display = "none";
        if (btnConfirmPull) btnConfirmPull.disabled = false;
    } else if (msg.action === "rag-stage-draft") {
        checkRagDraft();
    }
});






browser.runtime.onMessage.addListener((msg) => {
    if (msg?.action === "request-file-picker") {
        // Trigger the hidden file input filtered by kind
        if (filePicker) {
            const kind = msg.kind || "pdf";
            const acceptMap = {
                audio: "audio/*",
                video: "video/*",
                pdf:   "application/pdf,.pdf"
            };
            filePicker.setAttribute("accept", acceptMap[kind] || "*/*");
            filePicker.click();
            // Reset accept afterwards
            setTimeout(() => filePicker.removeAttribute("accept"), 500);
        }
        return;
    }
    if (msg?.action === "toast") {
        toast(msg.message, msg.type || "info");
        return;
    }
    if (msg?.attachment) {
        // Non-image attachment from context menu (audio/video/pdf data URL)
        const { name, kind, dataUrl } = msg.attachment;
        const pill = document.createElement("span");
        pill.className = "file-pill";
        const icon = kind === "audio" ? "🎵" : kind === "video" ? "🎬" : "📕";
        pill.textContent = `${icon} ${name} (from page)`;
        if (previewZone) previewZone.appendChild(pill);
        contextFileText += `\n\n[${kind.toUpperCase()} attachment: ${name}]`;
        // Open sidebar if closed
        if (settingsModal) settingsModal.classList.remove("active");
    }
});






/* ============ RAG Indexing ============ */
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
            if (file.type === "application/pdf") text = await extractTextFromPDF(file);
            else if (file.type.startsWith("audio/")) text = await transcribeAudio(file);
            else text = await file.text();
            
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
    if (typeof pdfjsLib === 'undefined') {
        throw new Error("PDF.js library is missing. Check that lib/pdfjs/pdf.min.js is loaded.");
    }

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
    const baseUrl = cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "";
    // Try Ollama whisper-compatible endpoint (if user has whisper model)
    try {
        const b64 = await fileToBase64(file);
        const res = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "whisper",
                prompt: "",
                images: [b64]
            })
        });
        if (res.ok) {
            const j = await res.json();
            if (j.response) return j.response;
        }
    } catch (_) {}
    // Fallback placeholder
    return `[Audio file: ${file.name} — size ${Math.round(file.size/1024)}KB. Install a whisper model in Ollama to enable transcription.]`;
}




if (chatTitle) {
    chatTitle.addEventListener("blur", () => {
        const conv = conversations[activeConvId];
        if (conv) { conv.title = chatTitle.textContent.trim() || "New Chat"; saveConversations(); renderHistoryList(); }
    });
    chatTitle.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); chatTitle.blur(); } });
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

/* ============ File Attach, Tab Capture & Clipboard Paste ============ */
if (attachBtn) attachBtn.addEventListener("click", () => { if (filePicker) filePicker.click(); });
if (filePicker) filePicker.addEventListener("change", async e => {
    await handleFiles(Array.from(e.target.files));
    filePicker.value = "";
});

if (attachTabBtn) {
    attachTabBtn.addEventListener("click", async () => {
        toast("Capturing active webpage...", "info", 1500);
        try {
            const res = await browser.runtime.sendMessage({ action: "get-active-tab-content" });
            if (!res || res.error) throw new Error(res?.error || "Could not access tab");
            if (!res.text || res.text.length < 20) throw new Error("No readable text found on page");
            
            const tabId = "tab_" + Date.now();
            const charCountK = Math.round(res.text.length / 1000);
            attachedFiles.push({
                id: tabId,
                name: res.title,
                icon: "📄",
                label: `📄 ${res.title.slice(0, 20)}… (${charCountK}k)`,
                title: `${res.title} (${res.url}) - ${res.text.length} chars`,
                text: `[Content from Web Page "${res.title}" (${res.url})]:\n${res.text}`
            });
            renderPreviewZone();
            toast(`Attached: "${res.title.slice(0, 25)}…"`, "success");
        } catch (e) {
            toast("Tab capture failed: " + e.message, "error");
        }
    });
}

function renderPreviewZone() {
    if (!previewZone) return;
    previewZone.innerHTML = "";

    // Render image thumbnails with remove badges
    currentImages.forEach((img, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "thumb-preview-wrapper";
        const thumb = document.createElement("img");
        thumb.src = `data:${img.type || 'image/jpeg'};base64,${img.b64}`;
        thumb.className = "thumb-preview";
        thumb.addEventListener("click", () => openImageModal(thumb.src));
        wrap.appendChild(thumb);

        const remBtn = document.createElement("button");
        remBtn.className = "thumb-remove-btn";
        remBtn.innerHTML = ICONS.close;
        remBtn.title = "Remove image";
        remBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            currentImages.splice(idx, 1);
            renderPreviewZone();
        });
        wrap.appendChild(remBtn);
        previewZone.appendChild(wrap);
    });

    // Render file & page pills with remove buttons
    attachedFiles.forEach((f, idx) => {
        const pill = document.createElement("span");
        pill.className = "file-pill" + (f.processing ? " processing" : "");
        if (f.title) pill.title = f.title;

        const lbl = document.createElement("span");
        lbl.style.display = "inline-flex";
        lbl.style.alignItems = "center";
        lbl.style.gap = "4px";
        lbl.innerHTML = `${ICONS.file}<span>${escapeHtml(f.name || f.label)}</span>`;
        pill.appendChild(lbl);

        const remBtn = document.createElement("button");
        remBtn.className = "file-pill-remove";
        remBtn.innerHTML = ICONS.close;
        remBtn.title = "Remove attachment";
        remBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            attachedFiles.splice(idx, 1);
            renderPreviewZone();
        });
        pill.appendChild(remBtn);
        previewZone.appendChild(pill);
    });
}

async function handleFiles(files) {
    const MAX_CHARS = 60000;

    for (const file of files) {
        const name = file.name.toLowerCase();
        const type = file.type;

        /* ---------- Images ---------- */
        if (type.startsWith("image/")) {
            const b64 = await fileToBase64(file);
            currentImages.push({
                id: "img_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
                b64,
                type: file.type
            });
            renderPreviewZone();
            continue;
        }

        /* ---------- PDFs ---------- */
        if (type === "application/pdf" || name.endsWith(".pdf")) {
            const fileId = "pdf_" + Date.now();
            const fileItem = {
                id: fileId,
                name: file.name,
                icon: "📕",
                label: `📕 ${file.name} (extracting...)`,
                processing: true,
                text: ""
            };
            attachedFiles.push(fileItem);
            renderPreviewZone();

            try {
                let text = await extractTextFromPDF(file);
                if (!text || text.length < 20) throw new Error("No extractable text found");
                const originalLength = text.length;
                let truncated = false;

                if (text.length > MAX_CHARS) {
                    const halfMax = Math.floor(MAX_CHARS / 2);
                    text = `${text.slice(0, halfMax)}\n\n[... ${Math.round((originalLength - MAX_CHARS) / 1000)}k chars truncated ...]\n\n${text.slice(-halfMax)}`;
                    truncated = true;
                    toast(`📕 PDF truncated: ${Math.round(originalLength/1000)}k → ${Math.round(MAX_CHARS/1000)}k chars`, "warning", 4000);
                } else {
                    toast(`📕 PDF extracted: ${Math.round(text.length/1000)}k chars`, "success");
                }

                fileItem.text = `[Content from PDF "${file.name}"${truncated ? " (truncated)" : ""}]:\n${text}`;
                fileItem.label = `📕 ${file.name} (${Math.round(text.length/1000)}k)${truncated ? ' ⚠️' : ''}`;
                fileItem.processing = false;
                fileItem.title = truncated ? `Original: ${Math.round(originalLength/1000)}k chars (truncated)` : `Full PDF extracted (${Math.round(text.length/1000)}k chars)`;
                renderPreviewZone();
            } catch (e) {
                console.error("[PDF]", e);
                fileItem.label = `📕 ${file.name} ❌`;
                fileItem.processing = false;
                renderPreviewZone();
                toast(`PDF failed: ${e.message}`, "error");
            }
            continue;
        }

        /* ---------- Audio ---------- */
        if (type.startsWith("audio/")) {
            attachedFiles.push({
                id: "aud_" + Date.now(),
                name: file.name,
                icon: "🎵",
                label: `🎵 ${file.name}`,
                text: `[Audio: ${file.name}]`
            });
            renderPreviewZone();
            continue;
        }

        /* ---------- Video ---------- */
        if (type.startsWith("video/")) {
            attachedFiles.push({
                id: "vid_" + Date.now(),
                name: file.name,
                icon: "🎬",
                label: `🎬 ${file.name}`,
                text: `[Video: ${file.name}]`
            });
            renderPreviewZone();
            continue;
        }

        /* ---------- Plain text / Markdown / Source code ---------- */
        try {
            let txt = await file.text();
            if (txt.length > MAX_CHARS) {
                txt = txt.slice(0, MAX_CHARS) + `\n\n[... truncated ${Math.round((txt.length - MAX_CHARS)/1000)}k chars ...]`;
            }
            attachedFiles.push({
                id: "txt_" + Date.now(),
                name: file.name,
                icon: "📄",
                label: `📄 ${file.name} (${Math.round(txt.length/1000)}k)`,
                text: `[Context from ${file.name}]:\n${txt}`
            });
            renderPreviewZone();
        } catch (e) {
            toast(`Could not read ${file.name}`, "error");
        }
    }
}










function updateFilePill(fileName, newText) {
    if (!previewZone) return;
    const pills = previewZone.querySelectorAll(".file-pill");
    for (const p of pills) {
        if (p.textContent.includes(fileName) || p.dataset.fileName === fileName) {
            p.textContent = newText;
            p.classList.remove("processing");
            return;
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

if (userInput) {
    userInput.addEventListener('paste', async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                await handleFiles([blob]);
                toast("Image pasted from clipboard 📋", "success", 1500);
            }
        }
    });
}

if (clearInputBtn) {
    clearInputBtn.addEventListener("click", () => {
        if (userInput) {
            userInput.value = "";
            autoResizeTextarea();
            updateClearButtonVisibility();
            userInput.focus();
        }
    });
}

if (userInput) {
    userInput.addEventListener("input", () => {
        autoResizeTextarea();
        updateClearButtonVisibility();
    });
}

function updateClearButtonVisibility() {
    if (!clearInputBtn || !userInput) return;
    if (userInput.value.trim().length > 0) clearInputBtn.classList.add("visible");
    else clearInputBtn.classList.remove("visible");
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
        if (userInput) { userInput.value = transcript; autoResizeTextarea(); }
    };
    recognition.onend = () => {
        isRecording = false;
        if (voiceBtn) { voiceBtn.classList.remove("recording"); voiceBtn.innerHTML = ICONS.mic; }
    };
    recognition.onerror = (e) => {
        toast("Voice error: " + e.error, "error");
        isRecording = false;
        if (voiceBtn) { voiceBtn.classList.remove("recording"); voiceBtn.innerHTML = ICONS.mic; }
    };
}

if (voiceBtn) voiceBtn.addEventListener("click", () => {
    if (!recognition) return toast("Voice not supported", "error");
    if (isRecording) { recognition.stop(); }
    else {
        recognition.start();
        isRecording = true;
        voiceBtn.classList.add("recording");
        voiceBtn.innerHTML = ICONS.stopSquare;
        toast("Listening...", "info", 1500);
    }
});

/* ============ Text-to-Speech ============ */
function speakText(text) {
    if (!window.speechSynthesis) return toast("TTS not supported", "error");
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const clean = text.replace(/`[\s\S]*?`/g, " ").replace(/[#*`]/g, " ");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1; utter.pitch = 1;
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

/* ============ Incoming Prompts ============ */
browser.runtime.onMessage.addListener(handleIncomingPrompt);









function handleIncomingPrompt(msg) {
    if (isProcessingPrompt) return;
    isProcessingPrompt = true;
    if (msg?.action !== "process-prompt") { isProcessingPrompt = false; return; }

    browser.storage.local.remove("pendingPrompt");
    currentImages = [];
    if (previewZone) previewZone.innerHTML = "";

    // Images (vision)
    if (msg.images && msg.images.length > 0) {
        msg.images.forEach(imgBase64 => {
            if (!imgBase64 || typeof imgBase64 !== "string") return;
            const cleanB64 = imgBase64.replace(/^data:image\/[^;]+;base64,/, "").trim();
            if (!cleanB64) return;
            currentImages.push({
                id: "img_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
                b64: cleanB64,
                type: "image/jpeg"
            });
        });
        renderPreviewZone();
    }

    // Non-image attachment pill
    if (msg.attachment) {
        const { name, kind } = msg.attachment;
        const icon = kind === "audio" ? "🎵" : kind === "video" ? "🎬" : "📕";
        const pill = document.createElement("span");
        pill.className = "file-pill";
        pill.textContent = `${icon} ${name} (from page)`;
        if (previewZone) previewZone.appendChild(pill);
        contextFileText += `\n\n[${kind.toUpperCase()} attachment: ${name}]`;
    }

    if (userInput) {
        userInput.value = msg.text || "";
        autoResizeTextarea();
        userInput.focus();
    }

    const reviewMode = cfgReviewPrompts ? cfgReviewPrompts.checked : false;
    const hasContent = (msg.text && msg.text.trim().length > 0) ||
    currentImages.length > 0 ||
    msg.attachment;

    if (!reviewMode && hasContent) {
        setTimeout(() => {
            if (sendBtn) sendBtn.click();
            isProcessingPrompt = false;
        }, 150);
    } else {
        toast("Prompt loaded. Press Enter to send.", "info");
        isProcessingPrompt = false;
    }
}






/* ============ Send ============ */
if (sendBtn) sendBtn.addEventListener("click", () => {
    let text = userInput ? userInput.value.trim() : "";
    const attachedTexts = attachedFiles.map(f => f.text).filter(Boolean);
    if (contextFileText) attachedTexts.unshift(contextFileText);
    const combinedFileText = attachedTexts.join("\n\n");
    if (!text && currentImages.length === 0 && !combinedFileText) return;
    if (combinedFileText) text = text ? `${text}\n\n${combinedFileText}` : combinedFileText;

    if (userInput) userInput.value = "";
    const imgs = currentImages
        .map(img => (typeof img === "string" ? img : img?.b64))
        .filter(Boolean)
        .map(b64 => b64.replace(/^data:image\/[^;]+;base64,/, "").trim())
        .filter(b64 => b64.length > 0);
    currentImages = [];
    attachedFiles = [];
    contextFileText = "";
    renderPreviewZone();
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
    try {
        const res = await fetch(`${baseUrl}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt: text })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.embedding) return data.embedding;
        }
    } catch (e) {
        console.warn("[RAG] /api/embeddings failed, attempting /api/embed fallback...", e);
    }

    // Fallback to Ollama v0.1.34+ /api/embed endpoint
    const embedRes = await fetch(`${baseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, input: text })
    });
    if (!embedRes.ok) throw new Error(`Embedding API failed with HTTP ${embedRes.status}`);
    const embedData = await embedRes.json();
    return embedData.embeddings ? embedData.embeddings[0] : embedData.embedding;
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
            if (allChunks.length === 0) { resolve({ context: "", sources: [] }); return; }

            const fallbackCosine = () => {
                const scored = allChunks.map(chunk => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }));
                scored.sort((a, b) => b.score - a.score);
                const topChunks = scored.slice(0, topK);
                const context = topChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n---\n\n');
                const sources = topChunks.map(c => c.source);
                resolve({ context, sources });
            };

            if (ragWorker) {
                const handler = (e) => {
                    if (e.data.action === 'search-results') {
                        ragWorker.removeEventListener('message', handler);
                        const topChunks = e.data.data?.results || [];
                        const context = topChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n---\n\n');
                        const sources = topChunks.map(c => c.source);
                        resolve({ context, sources });
                    } else if (e.data.action === 'search-error') {
                        ragWorker.removeEventListener('message', handler);
                        console.warn('[RAG] Worker hybrid search failed, falling back to cosine:', e.data.data?.error);
                        fallbackCosine();
                    }
                };
                ragWorker.addEventListener('message', handler);
                ragWorker.postMessage({
                    action: 'hybrid-search',
                    data: { query: prompt, chunks: allChunks, queryEmbedding, topK }
                });
                return;
            }

            fallbackCosine();
        };
        request.onerror = () => resolve({ context: "", sources: [] });
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
                <button class="rag-doc-delete" data-name="${escapeHtml(doc.name)}" title="Delete">${ICONS.del}</button>`;
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
    chunksTx.oncomplete = () => { loadRagDocuments(); toast("All documents cleared", "success"); };
});

/* ============ Staged RAG Selection Draft ============ */
async function checkRagDraft() {
    if (!ragDraftArea) return;
    try {
        const res = await browser.storage.local.get("ragIndexDraft");
        if (res.ragIndexDraft && res.ragIndexDraft.text) {
            ragDraftArea.style.display = "block";
            const previewText = res.ragIndexDraft.text.slice(0, 200).replace(/\n+/g, ' ');
            const src = res.ragIndexDraft.source || "Web Selection";
            if (ragDraftInfo) {
                ragDraftInfo.textContent = `"${previewText}..." — Source: ${src}`;
            }
        } else {
            ragDraftArea.style.display = "none";
        }
    } catch (e) {
        console.warn("[RAG] checkRagDraft error:", e);
    }
}

const ragDiscardDraftBtn = getEl("rag-discard-draft");
if (ragDiscardDraftBtn) {
    ragDiscardDraftBtn.addEventListener("click", async () => {
        await browser.storage.local.remove("ragIndexDraft");
        if (ragDraftArea) ragDraftArea.style.display = "none";
        toast("Staged text discarded", "info", 1500);
    });
}

if (ragSaveDraftBtn) {
    ragSaveDraftBtn.addEventListener("click", async () => {
        try {
            const res = await browser.storage.local.get("ragIndexDraft");
            if (!res.ragIndexDraft || !res.ragIndexDraft.text) {
                if (ragDraftArea) ragDraftArea.style.display = "none";
                return;
            }
            ragSaveDraftBtn.disabled = true;
            ragSaveDraftBtn.textContent = "⏳ Indexing...";
            await indexContent(res.ragIndexDraft.source || "Web Selection", res.ragIndexDraft.text);
            await browser.storage.local.remove("ragIndexDraft");
            if (ragDraftArea) ragDraftArea.style.display = "none";
            loadRagDocuments();
            toast("Selection indexed into Knowledge Base!", "success");
        } catch (err) {
            toast(`Failed to index: ${err.message}`, "error");
        } finally {
            if (ragSaveDraftBtn) {
                ragSaveDraftBtn.disabled = false;
                ragSaveDraftBtn.textContent = "📥 Index Selection Now";
            }
        }
    });
}

/* ============ API Call ============ */




async function askOllama(promptText, images = []) {
    const cleanImages = (images || [])
        .map(img => (typeof img === "string" ? img : img?.b64))
        .filter(Boolean)
        .map(b64 => b64.replace(/^data:image\/[^;]+;base64,/, "").trim())
        .filter(b64 => b64.length > 0);

    appendMessage(promptText, "user", cleanImages);
    const wrapper = appendMessage("", "assistant");
    const msgDiv = wrapper.querySelector(".message");
    msgDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    autoScrollChat(true);

    if (sendBtn) sendBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
    isGenerating = true;
    currentAbortController = new AbortController();

    let accumulated = "";
    let thinkingContent = "";
    let finalPrompt = promptText;
    let ragSources = [];

    // RAG processing
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
    if (cfgSystemPrompt && cfgSystemPrompt.value.trim()) {
        messages.push({ role: "system", content: cfgSystemPrompt.value.trim() });
    }

    const history = conv.messages.slice(0, -1).slice(-10);
    history.forEach(m => {
        if (m.sender === "user" || m.sender === "assistant") {
            messages.push({ role: m.sender, content: m.text, images: m.images || undefined });
        }
    });
    messages.push({
        role: "user",
        content: finalPrompt,
        images: cleanImages.length ? cleanImages : undefined
    });

    // ═══════════════ DYNAMIC CONTEXT WINDOW ═══════════════
    // Calculate total prompt size and auto-expand context if needed
    const totalChars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const estimatedTokens = Math.ceil(totalChars / 4); // Rough token estimate

    const userCtxLimit = cfgCtx ? parseInt(cfgCtx.value) : 4096;
    const MAX_SAFE_CONTEXT = 32768; // Safety limit to prevent OOM

    let dynamicCtx = userCtxLimit;

    if (estimatedTokens > userCtxLimit * 0.8) {
        // Prompt is >80% of context window, expand it
        dynamicCtx = Math.min(
            Math.ceil(estimatedTokens * 1.3), // Add 30% headroom
                              MAX_SAFE_CONTEXT
        );

        if (dynamicCtx > userCtxLimit) {
            toast(`Large prompt detected. Expanding context to ${dynamicCtx} tokens`, "info", 2500);
            console.log(`[Context Auto-Expand] ${estimatedTokens} est. tokens → ${dynamicCtx} num_ctx`);
        }

        if (estimatedTokens > MAX_SAFE_CONTEXT * 0.9) {
            toast(`⚠️ Prompt is very large (${estimatedTokens} tokens). Response may be slow or truncated.`, "warning", 4000);
        }
    }
    // ═══════════════════════════════════════════════════════

    let fetchUrl, fetchBody, fetchHeaders = { "Content-Type": "application/json" };

    if (isOpenAIMode) {
        fetchUrl = `${baseUrl}/v1/chat/completions`;
        if (apiKey) fetchHeaders["Authorization"] = `Bearer ${apiKey}`;

        // Format messages for OpenAI Vision API specification
        const openAIMessages = messages.map((m, idx) => {
            const isLatestUser = (idx === messages.length - 1);
            const msgImgs = isLatestUser ? cleanImages : (m.images || []);
            if (msgImgs && msgImgs.length > 0) {
                const contentParts = [{ type: "text", text: m.content || "" }];
                msgImgs.forEach(b64 => {
                    const clean = (typeof b64 === "string" ? b64 : b64?.b64 || "")
                        .replace(/^data:image\/[^;]+;base64,/, "").trim();
                    if (clean) {
                        contentParts.push({
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${clean}`
                            }
                        });
                    }
                });
                return { role: m.role, content: contentParts };
            }
            return { role: m.role, content: m.content || "" };
        });

        fetchBody = {
            model: cfgModel ? cfgModel.value : "gpt-3.5-turbo",
            messages: openAIMessages,
            temperature: cfgTemp ? parseFloat(cfgTemp.value) : 0.7,
            stream: cfgStream ? cfgStream.checked : true
        };
    } else {
        fetchUrl = `${baseUrl}/api/chat`;
        fetchBody = {
            model: cfgModel ? cfgModel.value : "gemma3",
            messages,
            stream: cfgStream ? cfgStream.checked : true,
            options: {
                temperature: cfgTemp ? parseFloat(cfgTemp.value) : 0.7,
                num_ctx: dynamicCtx  // ✅ Use dynamic context instead of fixed
            }
        };
    }

    try {
        const res = await fetch(fetchUrl, {
            method: "POST",
            headers: fetchHeaders,
            signal: currentAbortController.signal,
            body: JSON.stringify(fetchBody)
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => "");
            let errorMsg = `Server returned ${res.status}`;

            // Provide helpful error messages
            if (res.status === 400) {
                let detailedMsg = "";
                try {
                    const parsed = JSON.parse(errorText);
                    if (typeof parsed.error === "string") {
                        try {
                            const nested = JSON.parse(parsed.error);
                            detailedMsg = nested?.message || nested?.error?.message || parsed.error;
                        } catch {
                            detailedMsg = parsed.error;
                        }
                    } else if (parsed?.error?.message) {
                        detailedMsg = parsed.error.message;
                    } else if (parsed?.message) {
                        detailedMsg = parsed.message;
                    }
                } catch {}

                if (errorText.includes("context") || errorText.includes("token")) {
                    errorMsg = `Context window exceeded. Try: (1) Using a model with larger context, (2) Reducing PDF size, or (3) Increasing context window in Settings.`;
                } else if (errorText.toLowerCase().includes("failed to load image") || (detailedMsg && detailedMsg.toLowerCase().includes("image"))) {
                    errorMsg = `Vision error: ${detailedMsg || "Failed to load image"}. Please ensure your selected model supports vision (e.g. llava, llama3.2-vision, qwen2.5-vl, gemma3).`;
                } else {
                    errorMsg = `Bad request: ${detailedMsg || errorText.slice(0, 200)}`;
                }
            } else if (res.status === 413) {
                errorMsg = "Request too large. The PDF or prompt exceeds server limits.";
            } else if (res.status === 500) {
                errorMsg = `Server error: ${errorText.slice(0, 200)}`;
            }

            throw new Error(errorMsg);
        }

        // Streaming response handling (unchanged)
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
            if (isOpenAIMode) {
                accumulated = data.choices?.[0]?.message?.content || "";
            } else {
                accumulated = data.message?.content || "";
                thinkingContent = data.message?.thinking || "";
            }
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
            toast("Error: " + err.message, "error", 5000);
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
    autoScrollChat(final);
}

/* ============ Model Fetching ============ */
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

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
        if (quickModelSelect) quickModelSelect.innerHTML = "";
        if (cfgRagModel) cfgRagModel.innerHTML = "";
        if (installedModelsList) installedModelsList.innerHTML = "";
        
        const defaultEmbed = "nomic-embed-text";
        let hasDefaultEmbed = false;
        
        if (data.models && data.models.length > 0) {
            data.models.forEach(m => {
                if (cfgModel) { const o = document.createElement("option"); o.value = m.name; o.textContent = m.name; cfgModel.appendChild(o); }
                if (quickModelSelect) { const qo = document.createElement("option"); qo.value = m.name; qo.textContent = m.name; quickModelSelect.appendChild(qo); }
                if (cfgRagModel) { const ragOpt = document.createElement("option"); ragOpt.value = m.name; ragOpt.textContent = m.name; cfgRagModel.appendChild(ragOpt); }
                if (m.name === defaultEmbed) hasDefaultEmbed = true;

                // Render into installedModelsList
                if (installedModelsList) {
                    const card = document.createElement("div");
                    card.className = "installed-model-card";
                    const sizeStr = formatBytes(m.size);
                    const paramStr = m.details?.parameter_size ? ` · ${m.details.parameter_size}` : "";
                    const quantStr = m.details?.quantization_level ? ` · ${m.details.quantization_level}` : "";
                    card.innerHTML = `
                        <div class="installed-model-info">
                            <div class="installed-model-name">${escapeHtml(m.name)}</div>
                            <div class="installed-model-meta">${sizeStr}${paramStr}${quantStr}</div>
                        </div>
                        <div class="installed-model-actions">
                            <button class="installed-model-delete-btn" data-model="${escapeHtml(m.name)}" title="Delete model">${ICONS.del}</button>
                        </div>
                    `;
                    installedModelsList.appendChild(card);
                }
            });

            // Wire up model delete buttons
            if (installedModelsList) {
                installedModelsList.querySelectorAll(".installed-model-delete-btn").forEach(delBtn => {
                    delBtn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        const modelName = delBtn.dataset.model;
                        if (!confirm(`Are you sure you want to delete model "${modelName}" from Ollama storage?`)) return;
                        delBtn.disabled = true;
                        delBtn.textContent = "⏳";
                        try {
                            const resp = await browser.runtime.sendMessage({
                                action: "delete-model",
                                baseUrl: cfgUrl ? cfgUrl.value.trim().replace(/\/$/, "") : "",
                                modelName
                            });
                            if (resp && resp.success) {
                                toast(`Deleted model ${modelName}`, "success");
                                fetchOllamaModels();
                            } else {
                                toast(`Failed to delete: ${resp?.error || 'Unknown error'}`, "error");
                                delBtn.disabled = false;
                                delBtn.innerHTML = ICONS.del;
                            }
                        } catch (err) {
                            toast(`Failed: ${err.message}`, "error");
                            delBtn.disabled = false;
                            delBtn.innerHTML = ICONS.del;
                        }
                    });
                });
            }
            
            if (!hasDefaultEmbed && cfgRagModel) {
                const ragOpt = document.createElement("option");
                ragOpt.value = defaultEmbed; ragOpt.textContent = `${defaultEmbed} (not installed)`;
                cfgRagModel.prepend(ragOpt);
            }
            
            browser.storage.local.get(["selectedModel", "ragModel"]).then(res => {
                if (res.selectedModel) {
                    if (cfgModel) cfgModel.value = res.selectedModel;
                    if (quickModelSelect) quickModelSelect.value = res.selectedModel;
                }
                if (res.ragModel && cfgRagModel) cfgRagModel.value = res.ragModel;
                else if (cfgRagModel) cfgRagModel.value = defaultEmbed;
                if (currentModelTag && cfgModel) currentModelTag.innerText = cfgModel.value;
            });
            toast(`Loaded ${data.models.length} models`, "success");
        } else {
            if (installedModelsList) {
                installedModelsList.innerHTML = `<div style="text-align:center; padding:12px; color:var(--fg-muted); font-size:12px;">No models installed</div>`;
            }
            toast("No models found. Click 'Pull' to download one.", "warning");
        }
    } catch (e) {
        if (installedModelsList) {
            installedModelsList.innerHTML = `<div style="text-align:center; padding:12px; color:var(--error); font-size:12px;">Failed to connect to Ollama</div>`;
        }
        toast(`Could not fetch models: ${e.message}`, "error");
    }
}

/* ============ Server Status ============ */
async function checkServerStatus() {
    try {
        let baseUrl = cfgUrl ? cfgUrl.value.trim() : "";
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (!baseUrl) return;
        const res = await fetch(`${baseUrl}/api/tags`);
        if (res.ok) {
            if (statusDot) statusDot.className = "status-dot online";
            if (statusText) statusText.textContent = "";
        } else throw new Error();
    } catch {
        if (statusDot) statusDot.className = "status-dot offline";
        if (statusText) statusText.textContent = "";
    }
}

/* ============ Token Counter ============ */
function updateTokenCounter() {
    if (!tokenCounter) return;
    const conv = conversations[activeConvId];
    if (!conv || !conv.messages) {
        tokenCounter.textContent = "~0 tokens";
        if (messageCount) messageCount.textContent = "0 messages";
        if (contextMeterFill) {
            contextMeterFill.style.width = "0%";
            contextMeterFill.classList.remove("warning", "danger");
        }
        return;
    }
    let totalChars = 0;
    conv.messages.forEach(m => { if (m.text) totalChars += m.text.length; });
    const estimatedTokens = Math.round(totalChars / 4);
    const ctxLimit = cfgCtx ? parseInt(cfgCtx.value) : 4096;
    const percentage = Math.min((estimatedTokens / ctxLimit) * 100, 100);
    
    let color = 'var(--fg-muted)';
    if (percentage > 80) color = 'var(--warning)';
    if (percentage > 95) color = 'var(--error)';
    
    tokenCounter.innerHTML = `<span style="color:${color}">~${estimatedTokens}</span> / ${ctxLimit} tokens`;
    if (messageCount) messageCount.textContent = `${conv.messages.length} messages`;
    if (contextMeterFill) {
        contextMeterFill.style.width = `${percentage}%`;
        contextMeterFill.classList.toggle("warning", percentage > 70 && percentage <= 90);
        contextMeterFill.classList.toggle("danger", percentage > 90);
    }
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
    if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        if (attachTabBtn) attachTabBtn.click();
    }
    if (e.key === "Escape") {
        if (imageModal) imageModal.classList.remove("active");
        if (shortcutsModal) shortcutsModal.classList.remove("active");
        if (historyModal) historyModal.classList.remove("active");
        if (settingsModal) settingsModal.classList.remove("active");
        if (isGenerating && currentAbortController) currentAbortController.abort();
    }
});

if (helpBtn) helpBtn.addEventListener("click", () => { if (shortcutsModal) shortcutsModal.classList.add("active"); });
if (closeShortcuts) closeShortcuts.addEventListener("click", () => { if (shortcutsModal) shortcutsModal.classList.remove("active"); });
if (shortcutsModal) shortcutsModal.addEventListener("click", (e) => { if (e.target === shortcutsModal) shortcutsModal.classList.remove("active"); });
if (historyModal) historyModal.addEventListener("click", (e) => { if (e.target === historyModal) historyModal.classList.remove("active"); });

/* ============ UI/UX Enhancements ============ */
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.pendingPrompt && changes.pendingPrompt.newValue) {
        handleIncomingPrompt(changes.pendingPrompt.newValue);
    }
});

scrollBottomBtn = document.createElement('button');
scrollBottomBtn.id = 'scroll-bottom-btn';
scrollBottomBtn.className = 'icon-btn';
scrollBottomBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`;
scrollBottomBtn.title = 'Scroll to bottom';

const arenaEl = getScrollElement();
if (arenaEl) {
    arenaEl.appendChild(scrollBottomBtn);
    arenaEl.addEventListener('scroll', () => {
        const threshold = 90;
        const distFromBottom = arenaEl.scrollHeight - arenaEl.scrollTop - arenaEl.clientHeight;
        const nearBottom = distFromBottom <= threshold;
        isUserScrolledUp = !nearBottom;
        scrollBottomBtn.style.display = nearBottom ? 'none' : 'inline-flex';
    }, { passive: true });
    scrollBottomBtn.addEventListener('click', () => {
        isUserScrolledUp = false;
        arenaEl.scrollTo({ top: arenaEl.scrollHeight, behavior: 'smooth' });
        scrollBottomBtn.style.display = 'none';
    });
}

let dragOverlay = document.querySelector('.drag-overlay');
if (!dragOverlay && chatArena) {
    dragOverlay = document.createElement('div');
    dragOverlay.className = 'drag-overlay';
    dragOverlay.innerHTML = `<div class="drag-overlay-content"><div class="drag-icon"><svg class="icon" style="width:36px;height:36px;" viewBox="0 0 24 24"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></div><div class="drag-text">Drop files to attach</div></div>`;
    chatArena.appendChild(dragOverlay);
}

if (chatArena && dragOverlay) {
    let dragCounter = 0;
    chatArena.addEventListener('dragenter', (e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) { dragCounter++; dragOverlay.classList.add('active'); }
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
        if (e.dataTransfer.files.length > 0) await handleFiles(Array.from(e.dataTransfer.files));
    });
}

function showEditModal(originalText, onSave) {
    let modal = document.querySelector('.inline-edit-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal inline-edit-modal';
        modal.innerHTML = `<div class="modal-content inline-edit-content">
            <div class="modal-header"><h3>Edit Message</h3><button class="modal-close-btn">✕</button></div>
            <div class="modal-body">
                <textarea class="inline-edit-textarea" style="width:100%; min-height:120px; padding:12px; background:var(--bg-surface); color:var(--fg); border:1px solid var(--border); border-radius:8px; font-family:inherit; font-size:14px; line-height:1.5; resize:vertical;"></textarea>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel-edit">Cancel</button>
                <button class="action-btn primary save-edit">Save & Resend</button>
            </div>
        </div>`;
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
