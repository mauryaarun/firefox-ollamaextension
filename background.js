// background.js (Updated for Firefox Sidebar)
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "ask-local-ai",
    title: "Ask Local AI",
    contexts: ["selection"]
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText || "";
  if (!text) return;

  let prompt = "";
  if (info.menuItemId === "ask-local-ai") prompt = text;
  
  // Store the prompt so the sidebar picks it up when opened
  await browser.storage.local.set({
    pendingPrompt: { action: "process-prompt", text: prompt }
  });
  
  // Note: In Firefox, sidebar_action doesn't have a programmatic 'open' 
  // in all versions. The user may need to click the sidebar icon manually 
  // after selecting text, or you can try browser.sidebarAction.open() 
  // if your Firefox version supports it (v128+).
  if (browser.sidebarAction && browser.sidebarAction.open) {
    browser.sidebarAction.open();
  }
});

// Handle URL fetching for RAG
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fetch-url-text") {
    fetch(msg.url)
      .then(r => r.text())
      .then(text => {
        const clean = text.replace(/<script[\s\S]*?<\/script>/gi, "")
                         .replace(/<style[\s\S]*?<\/style>/gi, "")
                         .replace(/<[^>]+>/g, " ")
                         .replace(/\s+/g, " ")
                         .trim();
        sendResponse({ text: clean });
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});