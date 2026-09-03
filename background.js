// background.js — Rich context menu + content bridge

const M = {
  root: "chatai-root", ask: "chatai-ask", summarize: "chatai-summarize",
  translate: "chatai-translate", improve: "chatai-improve", explain: "chatai-explain",
  sep1: "chatai-sep1", page: "chatai-page", link: "chatai-link",
  sep2: "chatai-sep2", image: "chatai-image",
  sep3: "chatai-sep3", ragSel: "chatai-rag-sel", ragPage: "chatai-rag-page",
  sep4: "chatai-sep4", open: "chatai-open"
};

browser.runtime.onInstalled.addListener(buildMenus);
browser.runtime.onStartup.addListener(buildMenus);

function buildMenus() {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({ id: M.root, title: "🧠 ChatAI", contexts: ["all"] });

    // Selection intelligence
    browser.contextMenus.create({ id: M.ask,       parentId: M.root, title: "💬 Ask about selection",   contexts: ["selection"] });
    browser.contextMenus.create({ id: M.summarize, parentId: M.root, title: "📋 Summarize selection",   contexts: ["selection"] });
    browser.contextMenus.create({ id: M.translate, parentId: M.root, title: "🌐 Translate selection",   contexts: ["selection"] });
    browser.contextMenus.create({ id: M.improve,   parentId: M.root, title: "✍️ Improve writing",       contexts: ["selection"] });
    browser.contextMenus.create({ id: M.explain,   parentId: M.root, title: "🔍 Explain concept",       contexts: ["selection"] });

    browser.contextMenus.create({ id: M.sep1, parentId: M.root, type: "separator", contexts: ["all"] });

    // Page & link
    browser.contextMenus.create({ id: M.page, parentId: M.root, title: "📄 Summarize entire page", contexts: ["page"] });
    browser.contextMenus.create({ id: M.link, parentId: M.root, title: "🔗 Analyze linked page",  contexts: ["link"] });

    browser.contextMenus.create({ id: M.sep2, parentId: M.root, type: "separator", contexts: ["all"] });

    // Vision
    browser.contextMenus.create({ id: M.image, parentId: M.root, title: "🖼️ Describe this image", contexts: ["image"] });

    browser.contextMenus.create({ id: M.sep3, parentId: M.root, type: "separator", contexts: ["all"] });

    // Knowledge base (RAG)
    browser.contextMenus.create({ id: M.ragSel,  parentId: M.root, title: "📚 Add selection to Knowledge Base", contexts: ["selection"] });
    browser.contextMenus.create({ id: M.ragPage, parentId: M.root, title: "📚 Add page to Knowledge Base",      contexts: ["page"] });

    browser.contextMenus.create({ id: M.sep4, parentId: M.root, type: "separator", contexts: ["all"] });
    browser.contextMenus.create({ id: M.open, parentId: M.root, title: "⚡ Open ChatAI Sidebar", contexts: ["all"] });
  });
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    await openSidebar();
    switch (info.menuItemId) {
      case M.ask:       return prompt(`What would you like to know about this?\n\n"${info.selectionText}"`);
      case M.summarize: return prompt(`Summarize the following concisely:\n\n${info.selectionText}`);
      case M.translate: return prompt(`Translate this to English:\n\n${info.selectionText}`);
      case M.improve:   return prompt(`Rewrite this to be clearer and more polished:\n\n${info.selectionText}`);
      case M.explain:   return prompt(`Explain this in simple terms:\n\n${info.selectionText}`);
      case M.page:      return summarizePage(tab);
      case M.link:      return analyzeLink(info.linkUrl);
      case M.image:     return describeImage(info.srcUrl);
      case M.ragSel:    return toastMsg(`💡 Selection ready — open Settings → Knowledge Base to index it.`);
      case M.ragPage:   return indexPageToRAG(tab);
      case M.open:      return; // sidebar already opened
    }
  } catch (e) { console.error("[ChatAI]", e); toastMsg("Error: " + e.message, "error"); }
});

/* ---------- helpers ---------- */
async function openSidebar() {
  try { await browser.sidebarAction.open(); } catch { /* already open */ }
  await new Promise(r => setTimeout(r, 200));
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

async function analyzeLink(url) {
  if (!url) return;
  toastMsg("Fetching link…", "info");
  const lower = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(lower)) return describeImage(url);
  try {
    const text = await fetchUrlText(url);
    if (text && text.length > 30) return prompt(`Summarize this link (${url}):\n\n${text.slice(0, 40000)}`);
    throw new Error("empty");
  } catch {
    prompt(`Please analyze this link: ${url}\n\n(I couldn't fetch its content automatically.)`);
  }
}

async function describeImage(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const b64 = await blobToBase64(blob);
    sendToSidebar({
      action: "process-prompt",
      text: "Describe this image in detail:",
      images: [b64]
    });
  } catch (e) { toastMsg("Could not load image: " + e.message, "error"); }
}

async function indexPageToRAG(tab) {
  const text = await extractPageText(tab.id);
  if (!text) return toastMsg("Nothing to index.", "warning");
  // Signal sidebar to open RAG settings with page text preloaded
  browser.storage.local.set({ ragIndexDraft: { source: tab.title, text: text.slice(0, 60000) } });
  toastMsg("Page captured. Open Settings → Knowledge Base to finish indexing.", "success");
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

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej; r.readAsDataURL(blob);
  });
}

/* ---------- RAG indexing bridge for sidebar ---------- */
browser.runtime.onMessage.addListener((msg) => {
  if (msg?.action === "fetch-url-text") {
    return fetchUrlText(msg.url).then(text => ({ text })).catch(e => ({ error: e.message }));
  }
});