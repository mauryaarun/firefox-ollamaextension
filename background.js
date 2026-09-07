// background.js — Rich context menu + content bridge

const M = {
  root: "chatai-root",
  // Selection
  ask: "chatai-ask", summarize: "chatai-summarize", takeaways: "chatai-takeaways",
  improve: "chatai-improve", grammar: "chatai-grammar", explain: "chatai-explain",
  extract: "chatai-extract",
  // Code submenu
  codeRoot: "chatai-code-root",
  codeExplain: "chatai-code-explain", codeFix: "chatai-code-fix", codeOptimize: "chatai-code-optimize",
  // Translation submenu
  transRoot: "chatai-trans-root",
  transEn: "chatai-trans-en", transEs: "chatai-trans-es", transFr: "chatai-trans-fr",
  transDe: "chatai-trans-de", transHi: "chatai-trans-hi", transZh: "chatai-trans-zh", transJa: "chatai-trans-ja",
  sep1: "chatai-sep1",
  // Page
  pageSum: "chatai-page-sum", pageFaq: "chatai-page-faq", pageCritique: "chatai-page-critique",
  link: "chatai-link",
  sep2: "chatai-sep2",
  // Vision
  imageDescribe: "chatai-image-describe", imageOcr: "chatai-image-ocr",
  sep3: "chatai-sep3",
  // Knowledge Base
  ragSel: "chatai-rag-sel", ragPage: "chatai-rag-page",
  sep4: "chatai-sep4",
  open: "chatai-open"
};

browser.runtime.onInstalled.addListener(buildMenus);
browser.runtime.onStartup.addListener(buildMenus);

function buildMenus() {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({ id: M.root, title: "🧠 ChatAI", contexts: ["all"] });

    // Selection actions
    browser.contextMenus.create({ id: M.ask, parentId: M.root, title: "💬 Ask about selection", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.summarize, parentId: M.root, title: "📋 Summarize selection", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.takeaways, parentId: M.root, title: "📌 Key takeaways / TL;DR", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.improve, parentId: M.root, title: "✍️ Polish & improve writing", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.grammar, parentId: M.root, title: "✅ Fix grammar & spelling", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.explain, parentId: M.root, title: "🔍 Explain concept simply", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.extract, parentId: M.root, title: "📊 Extract action items & tables", contexts: ["selection"] });

    // Code submenu
    browser.contextMenus.create({ id: M.codeRoot, parentId: M.root, title: "💻 Code Assistant", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.codeExplain, parentId: M.codeRoot, title: "🔍 Explain this code", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.codeFix, parentId: M.codeRoot, title: "🐛 Find bugs & fix code", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.codeOptimize, parentId: M.codeRoot, title: "⚡ Optimize performance", contexts: ["selection"] });

    // Translation submenu
    browser.contextMenus.create({ id: M.transRoot, parentId: M.root, title: "🌐 Translate to...", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transEn, parentId: M.transRoot, title: "🇺🇸 English", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transEs, parentId: M.transRoot, title: "🇪🇸 Spanish", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transFr, parentId: M.transRoot, title: "🇫🇷 French", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transDe, parentId: M.transRoot, title: "🇩🇪 German", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transHi, parentId: M.transRoot, title: "🇮🇳 Hindi", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transZh, parentId: M.transRoot, title: "🇨🇳 Chinese", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.transJa, parentId: M.transRoot, title: "🇯🇵 Japanese", contexts: ["selection"] });

    browser.contextMenus.create({ id: M.sep1, parentId: M.root, type: "separator", contexts: ["all"] });

    // Page actions
    browser.contextMenus.create({ id: M.pageSum, parentId: M.root, title: "📄 Summarize entire page", contexts: ["page"] });
    browser.contextMenus.create({ id: M.pageFaq, parentId: M.root, title: "❓ Generate FAQ / Study Guide", contexts: ["page"] });
    browser.contextMenus.create({ id: M.pageCritique, parentId: M.root, title: "🔍 Critical review & fact-check", contexts: ["page"] });
    browser.contextMenus.create({ id: M.link, parentId: M.root, title: "🔗 Analyze linked page", contexts: ["link"] });

    browser.contextMenus.create({ id: M.sep2, parentId: M.root, type: "separator", contexts: ["all"] });

    // Vision
    browser.contextMenus.create({ id: M.imageDescribe, parentId: M.root, title: "🖼️ Describe this image", contexts: ["image"] });
    browser.contextMenus.create({ id: M.imageOcr, parentId: M.root, title: "📝 Extract text (OCR) from image", contexts: ["image"] });

    browser.contextMenus.create({ id: M.sep3, parentId: M.root, type: "separator", contexts: ["all"] });

    // Knowledge base (RAG)
    browser.contextMenus.create({ id: M.ragSel, parentId: M.root, title: "📚 Add selection to Knowledge Base", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.ragPage, parentId: M.root, title: "📚 Add page to Knowledge Base", contexts: ["page"] });

    browser.contextMenus.create({ id: M.sep4, parentId: M.root, type: "separator", contexts: ["all"] });
    browser.contextMenus.create({ id: M.open, parentId: M.root, title: "⚡ Open ChatAI Workspace", contexts: ["all"] });
  });
}

// Toolbar icon click to toggle/open sidebar (with Android tab fallback)
if (browser.action && browser.action.onClicked) {
  browser.action.onClicked.addListener(async () => {
    try {
      if (browser.sidebarAction && typeof browser.sidebarAction.toggle === "function") {
        await browser.sidebarAction.toggle();
      } else if (browser.sidebarAction && typeof browser.sidebarAction.open === "function") {
        await browser.sidebarAction.open();
      } else {
        await openAssistantTab();
      }
    } catch (e) {
      console.warn("[ChatAI] Sidebar open error, fallback to tab:", e);
      await openAssistantTab();
    }
  });
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    await openSidebar();
    const sel = (info.selectionText || "").trim();
    switch (info.menuItemId) {
      case M.ask:          return prompt(`What would you like to know about this?\n\n"${sel}"`);
      case M.summarize:    return prompt(`Summarize the following concisely:\n\n"${sel}"`);
      case M.takeaways:    return prompt(`Extract the key takeaways, core bullet points, and main highlights from this text:\n\n"${sel}"`);
      case M.improve:      return prompt(`Rewrite this to be clearer, more engaging, and well-structured:\n\n"${sel}"`);
      case M.grammar:      return prompt(`Fix all grammar, spelling, and punctuation errors in the following text, keeping the original tone intact:\n\n"${sel}"`);
      case M.explain:      return prompt(`Explain this concept in simple, easy-to-understand terms:\n\n"${sel}"`);
      case M.extract:      return prompt(`Extract all actionable tasks, key deadlines, and tabular data from this text formatted in clean Markdown:\n\n"${sel}"`);

      // Code
      case M.codeExplain:  return prompt(`Explain step-by-step how this code works, its purpose, and any notable patterns or potential edge cases:\n\n\`\`\`\n${sel}\n\`\`\``);
      case M.codeFix:      return prompt(`Review this code for bugs, errors, security risks, or performance issues, and provide the fully corrected code with explanations:\n\n\`\`\`\n${sel}\n\`\`\``);
      case M.codeOptimize: return prompt(`Analyze this code and refactor it for optimal performance, memory efficiency, and readability:\n\n\`\`\`\n${sel}\n\`\`\``);

      // Translations
      case M.transEn:      return prompt(`Translate this text into natural, fluent English:\n\n"${sel}"`);
      case M.transEs:      return prompt(`Translate this text into Spanish (Español):\n\n"${sel}"`);
      case M.transFr:      return prompt(`Translate this text into French (Français):\n\n"${sel}"`);
      case M.transDe:      return prompt(`Translate this text into German (Deutsch):\n\n"${sel}"`);
      case M.transHi:      return prompt(`Translate this text into Hindi (हिन्दी):\n\n"${sel}"`);
      case M.transZh:      return prompt(`Translate this text into Simplified Chinese (中文):\n\n"${sel}"`);
      case M.transJa:      return prompt(`Translate this text into Japanese (日本語):\n\n"${sel}"`);

      // Page
      case M.pageSum:      return summarizePage(tab);
      case M.pageFaq:      return generatePageFaq(tab);
      case M.pageCritique: return critiquePage(tab);
      case M.link:         return analyzeLink(info.linkUrl, tab);

      // Vision
      case M.imageDescribe: return describeImage(info.srcUrl, tab, "Describe this image in detail:");
      case M.imageOcr:      return describeImage(info.srcUrl, tab, "Extract all visible text from this image verbatim, followed by a brief summary of what the image depicts:");

      // RAG
      case M.ragSel:       return indexSelectionToRAG(info.selectionText, tab);
      case M.ragPage:      return indexPageToRAG(tab);
      case M.open:         return;
    }
  } catch (e) { console.error("[ChatAI]", e); toastMsg("Error: " + e.message, "error"); }
});

/* ---------- helpers ---------- */
async function openAssistantTab() {
  const extUrl = browser.runtime.getURL("sidebar.html");
  const tabs = await browser.tabs.query({ url: extUrl });
  if (tabs && tabs.length > 0) {
    await browser.tabs.update(tabs[0].id, { active: true });
    if (tabs[0].windowId) {
      try { await browser.windows.update(tabs[0].windowId, { focused: true }); } catch {}
    }
  } else {
    await browser.tabs.create({ url: extUrl });
  }
}

async function openSidebar() {
  if (browser.sidebarAction && typeof browser.sidebarAction.open === "function") {
    try {
      await browser.sidebarAction.open();
      await new Promise(r => setTimeout(r, 200));
      return;
    } catch { /* unsupported or already open */ }
  }
  // Android & Tab fallback
  await openAssistantTab();
  await new Promise(r => setTimeout(r, 300));
}

function prompt(text) { sendToSidebar({ action: "process-prompt", text }); }

function toastMsg(message, type = "info") {
  browser.runtime.sendMessage({ action: "toast", message, type }).catch(() => {});
}

function sendToSidebar(payload) {
  browser.storage.local.set({ pendingPrompt: payload });
  browser.runtime.sendMessage(payload).catch(() => {});
}

async function summarizePage(tab) {
  const text = await extractPageText(tab.id);
  if (!text || text.length < 30) return toastMsg("No readable content on page.", "warning");
  prompt(`Summarize this page titled "${tab.title}":\n\n${text.slice(0, 40000)}`);
}

async function generatePageFaq(tab) {
  const text = await extractPageText(tab.id);
  if (!text || text.length < 30) return toastMsg("No readable content on page.", "warning");
  prompt(`Create a comprehensive FAQ (frequently asked questions and answers) and study guide based on this page titled "${tab.title}":\n\n${text.slice(0, 40000)}`);
}

async function critiquePage(tab) {
  const text = await extractPageText(tab.id);
  if (!text || text.length < 30) return toastMsg("No readable content on page.", "warning");
  prompt(`Provide a critical review and fact-check of the arguments, assertions, and evidence presented on this page titled "${tab.title}". Highlight logical strengths, weaknesses, and unverified assumptions:\n\n${text.slice(0, 40000)}`);
}

async function analyzeLink(url, tab) {
  if (!url) return;
  toastMsg("Fetching link…", "info");
  const lower = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(lower)) return describeImage(url, tab);
  try {
    const text = await fetchUrlText(url);
    if (text && text.length > 30) return prompt(`Summarize this link (${url}):\n\n${text.slice(0, 40000)}`);
    throw new Error("empty");
  } catch {
    prompt(`Please analyze this link: ${url}\n\n(I couldn't fetch its content automatically.)`);
  }
}

async function describeImage(url, tab, promptText = "Describe this image in detail:") {
  if (!url) return toastMsg("No image URL found.", "warning");
  try {
    toastMsg("Loading image for analysis...", "info");
    let b64 = null;

    // 1. If it's already a data URI, extract raw base64 directly
    if (url.startsWith("data:")) {
      const parts = url.split(",");
      if (parts.length > 1) {
        b64 = parts[1].trim();
      }
    }

    // 2. Direct background fetch (if not a blob URL)
    if (!b64 && !url.startsWith("blob:")) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const ct = (res.headers.get("content-type") || "").toLowerCase();
          // Ensure it's an image and not an HTML/JSON error page
          if (ct.startsWith("image/") || (!ct.includes("html") && !ct.includes("json"))) {
            const blob = await res.blob();
            if (blob && blob.size > 0) {
              b64 = await convertBlobToJpegBase64(blob);
            }
          }
        }
      } catch (e) {
        console.warn("[ChatAI] Background direct image fetch failed:", e);
      }
    }

    // 3. Fallback: in-tab DOM extraction / in-page fetch (handles blob:, CORS, credentials, Referer, canvas)
    if (!b64 && tab?.id) {
      try {
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractImageFromTab,
          args: [url]
        });
        b64 = results?.[0]?.result || null;
      } catch (err) {
        console.warn("[ChatAI] In-tab image extraction failed:", err);
      }
    }

    if (b64 && b64.length > 20) {
      sendToSidebar({
        action: "process-prompt",
        text: promptText,
        images: [b64]
      });
    } else {
      toastMsg("Could not load image. Source may be protected or inaccessible.", "error");
    }
  } catch (e) {
    console.error("[ChatAI] describeImage error:", e);
    toastMsg("Could not load image: " + e.message, "error");
  }
}

async function indexPageToRAG(tab) {
  const text = await extractPageText(tab.id);
  if (!text) return toastMsg("Nothing to index.", "warning");
  // Signal sidebar to open RAG settings with page text preloaded
  browser.storage.local.set({ ragIndexDraft: { source: tab.title, text: text.slice(0, 60000) } });
  toastMsg("Page captured. Open Settings → Knowledge Base to finish indexing.", "success");
}

async function indexSelectionToRAG(selectedText, tab) {
  const text = (selectedText || "").trim();
  if (!text || text.length < 5) return toastMsg("Selection is too short to index.", "warning");
  const sourceName = tab?.title ? `Selection from: ${tab.title}` : `Selection (${new Date().toLocaleTimeString()})`;
  browser.storage.local.set({ ragIndexDraft: { source: sourceName, text: text.slice(0, 60000) } });
  sendToSidebar({ action: "rag-stage-draft", source: sourceName, text: text.slice(0, 60000) });
  toastMsg("Selection captured. Open Settings → Knowledge Base to index.", "success");
}

/* ---------- Active Tab Tracking for Android & Full-Tab Mode ---------- */
let lastWebTab = null;
async function updateLastWebTab(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    if (tab?.url && !tab.url.startsWith("moz-extension://") && !tab.url.startsWith("about:")) {
      lastWebTab = { id: tab.id, title: tab.title || "Webpage", url: tab.url };
    }
  } catch {}
}
browser.tabs.onActivated.addListener((info) => updateLastWebTab(info.tabId));
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab?.active && tab?.url && !tab.url.startsWith("moz-extension://") && !tab.url.startsWith("about:")) {
    lastWebTab = { id: tab.id, title: tab.title || "Webpage", url: tab.url };
  }
});

async function getActiveTabContent() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  let targetTab = (tabs && tabs.length > 0) ? tabs[0] : null;

  // If current tab is extension page (e.g. ChatAI running in tab on Android), use lastWebTab
  if (targetTab && (targetTab.url.startsWith("moz-extension://") || targetTab.url.startsWith("about:"))) {
    if (lastWebTab) {
      try {
        targetTab = await browser.tabs.get(lastWebTab.id);
      } catch {
        targetTab = lastWebTab;
      }
    }
  }

  if (!targetTab || !targetTab.id) throw new Error("No active webpage found in browser");
  const text = await extractPageText(targetTab.id);
  return {
    title: targetTab.title || "Untitled Tab",
    url: targetTab.url || "",
    text: text ? text.slice(0, 50000) : ""
  };
}

/* ---------- Preview In-Memory Cache ---------- */
const previewCache = new Map();
function cleanPreviewCache() {
  const now = Date.now();
  for (const [id, item] of previewCache.entries()) {
    if (now - item.timestamp > 180000) {
      previewCache.delete(id);
    }
  }
}
setInterval(cleanPreviewCache, 60000);

/* ---------- Ollama Model Pulling Stream Handler ---------- */
async function handlePullModel({ baseUrl, modelName }) {
  const cleanBase = (baseUrl || "http://localhost:11434").replace(/\/$/, "");
  const url = `${cleanBase}/api/pull`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName, stream: true })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }

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
          const data = JSON.parse(line);
          browser.runtime.sendMessage({ action: "pull-progress", data }).catch(() => {});
          if (data.status === "success") {
            browser.runtime.sendMessage({ action: "pull-complete" }).catch(() => {});
            return;
          }
        } catch { /* ignore partial JSON */ }
      }
    }
    browser.runtime.sendMessage({ action: "pull-complete" }).catch(() => {});
  } catch (err) {
    browser.runtime.sendMessage({ action: "pull-error", error: err.message }).catch(() => {});
  }
}

/* ---------- Ollama Model Deletion Handler ---------- */
async function handleDeleteModel({ baseUrl, modelName }) {
  const cleanBase = (baseUrl || "http://localhost:11434").replace(/\/$/, "");
  const url = `${cleanBase}/api/delete`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Failed to delete model ${modelName}: HTTP ${res.status} ${errText}`);
  }
  return { success: true };
}

async function extractPageText(tabId) {
  const results = await browser.scripting.executeScript({ target: { tabId }, func: readableText });
  return results?.[0]?.result || "";
}

function readableText() {
  const clone = document.cloneNode(true);
  clone.querySelectorAll("script,style,noscript,svg,nav,footer,header,aside,iframe")
       .forEach(n => n.remove());
  const root = clone.querySelector("article") || clone.querySelector("main") || clone.body;
  return (root?.innerText || "").replace(/\s+\n/g, "\n").trim();
}

async function fetchUrlText(url) {
  try {
    const res = await fetch(url, { credentials: "omit", headers: { Accept: "text/html,*/*" } });
    if (!res.ok) throw 0;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const body = await res.text();
    if (ct.includes("html")) {
      const doc = new DOMParser().parseFromString(body, "text/html");
      doc.querySelectorAll("script,style,nav,footer,header,aside").forEach(n => n.remove());
      return (doc.body?.innerText || "").trim();
    }
    return body;
  } catch {
    // Fallback: render in a hidden tab (bypasses CORS)
    const t = await browser.tabs.create({ url, active: false });
    await new Promise(r => setTimeout(r, 1500));
    const text = await extractPageText(t.id);
    await browser.tabs.remove(t.id);
    return text;
  }
}

async function convertBlobToJpegBase64(blob) {
  try {
    if (typeof createImageBitmap === "function" && typeof OffscreenCanvas === "function") {
      const bmp = await createImageBitmap(blob);
      let width = bmp.width;
      let height = bmp.height;
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bmp, 0, 0, width, height);
      const jpegBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
      return await blobToBase64(jpegBlob);
    }
  } catch (e) {
    console.warn("[ChatAI] OffscreenCanvas conversion skipped:", e);
  }
  return await blobToBase64(blob);
}

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const str = String(r.result || "");
      res(str.includes(",") ? str.split(",")[1] : str);
    };
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

// Function injected into tab to extract images (runs in page execution context)
async function extractImageFromTab(targetUrl) {
  // Strategy 1: Find matching DOM element and render to canvas
  try {
    const selector = "img, picture img, svg, canvas, [style*='background-image']";
    const elements = Array.from(document.querySelectorAll(selector));
    const match = elements.find(el => {
      if (el.src === targetUrl || el.currentSrc === targetUrl || el.getAttribute("src") === targetUrl) return true;
      if (el.dataset?.src === targetUrl || el.dataset?.original === targetUrl) return true;
      const bg = el.style?.backgroundImage || "";
      if (bg.includes(targetUrl)) return true;
      return false;
    });

    if (match) {
      if (match.tagName === "CANVAS") {
        const dataUrl = match.toDataURL("image/jpeg", 0.92);
        return dataUrl.split(",")[1];
      }

      const w = match.naturalWidth || match.width || match.clientWidth || 0;
      const h = match.naturalHeight || match.height || match.clientHeight || 0;
      if (w > 0 && h > 0) {
        const canvas = document.createElement("canvas");
        const maxDim = 2048;
        let nw = w, nh = h;
        if (nw > maxDim || nh > maxDim) {
          if (nw > nh) { nh = Math.round((nh * maxDim) / nw); nw = maxDim; }
          else { nw = Math.round((nw * maxDim) / nh); nh = maxDim; }
        }
        canvas.width = nw;
        canvas.height = nh;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, nw, nh);
        ctx.drawImage(match, 0, 0, nw, nh);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const b64 = dataUrl.split(",")[1];
        if (b64 && b64.length > 50) return b64;
      }
    }
  } catch (e) {
    // Tainted canvas or cross-origin restrictions
  }

  // Strategy 2: In-page fetch (carries same-origin cookies, referer, session)
  try {
    const res = await fetch(targetUrl, { credentials: "include" });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const str = String(reader.result || "");
          resolve(str.split(",")[1] || null);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {}

  return null;
}

/* ---------- Runtime Message Bridge ---------- */
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.action === "fetch-url-text") {
    return fetchUrlText(msg.url).then(text => ({ text })).catch(e => ({ error: e.message }));
  }
  if (msg?.action === "get-active-tab-content") {
    return getActiveTabContent().then(res => res).catch(e => ({ error: e.message }));
  }
  if (msg?.action === "pull-model") {
    handlePullModel(msg);
    return Promise.resolve({ started: true });
  }
  if (msg?.action === "delete-model") {
    return handleDeleteModel(msg).then(res => res).catch(e => ({ error: e.message }));
  }
  if (msg?.action === "store-preview-data") {
    previewCache.set(msg.previewId, { html: msg.html, timestamp: Date.now() });
    return Promise.resolve({ ok: true });
  }
  if (msg?.action === "get-preview-data") {
    const cached = previewCache.get(msg.previewId);
    if (cached) {
      return Promise.resolve({ html: cached.html });
    }
    return Promise.resolve({ html: null });
  }
  if (msg?.action === "open-with-prompt") {
    openSidebar().then(() => {
      prompt(msg.text);
    });
    return Promise.resolve({ ok: true });
  }
});