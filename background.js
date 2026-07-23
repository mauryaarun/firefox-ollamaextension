// background.js

// 1. Create context menus when installed
browser.runtime.onInstalled.addListener(() => {
  // Text Selection Menus
  browser.contextMenus.create({
    id: "ask-local-ai",
    title: "Ask Local AI about selection",
    contexts: ["selection"]
  });
  
  browser.contextMenus.create({
    id: "summarize-selection",
    title: "Summarize selection",
    contexts: ["selection"]
  });
  
  browser.contextMenus.create({
    id: "explain-selection",
    title: "Explain selection",
    contexts: ["selection"]
  });

  // Page/Image Menus
  browser.contextMenus.create({
    id: "summarize-page",
    title: "Summarize this page",
    contexts: ["page"]
  });

  browser.contextMenus.create({
    id: "explain-image",
    title: "Explain this image",
    contexts: ["image"]
  });
});

// 2. Handle menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let prompt = "";
  let images = [];
  let shouldOpenSidebar = true;

  // --- IMPORTANT: Open Sidebar IMMEDIATELY to satisfy User Gesture Requirement ---
  // We do this before any async operations like executeScript
  try {
    if (browser.sidebarAction && browser.sidebarAction.open) {
      await browser.sidebarAction.open();
    }
  } catch (e) {
    console.warn("Could not open sidebar automatically:", e);
    shouldOpenSidebar = false;
  }

  switch (info.menuItemId) {
    case "ask-local-ai":
      prompt = info.selectionText;
      break;
      
    case "summarize-selection":
      prompt = `Please summarize the following text concisely:\n\n${info.selectionText}`;
      break;
      
    case "explain-selection":
      prompt = `Explain the following concept in simple terms:\n\n${info.selectionText}`;
      break;

    case "summarize-page":
      // Note: executeScript is async and might take time. 
      // The sidebar is already opening above.
      try {
        const results = await browser.tabs.executeScript(tab.id, {
          code: "document.body.innerText"
        });
        const pageText = results[0];
        if (pageText && pageText.length > 0) {
          const truncated = pageText.length > 5000 ? pageText.substring(0, 5000) + "..." : pageText;
          prompt = `Please provide a high-level summary of this webpage content:\n\n${truncated}`;
        } else {
          prompt = "I couldn't extract any text from this page.";
        }
      } catch (e) {
        console.error("Failed to extract page text", e);
        prompt = "Error: Could not access page content. This might be a protected page.";
      }
      break;

    case "explain-image":
      prompt = "Describe this image in detail. What do you see?";
      images = [info.srcUrl];
      break;
  }

  if (!prompt && images.length === 0) return;

  // 3. Send data to sidebar
  await browser.storage.local.set({
    pendingPrompt: { 
      action: "process-prompt", 
      text: prompt,
      images: images 
    }
  });
});

// 4. Handle URL fetching for RAG (Existing logic)
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
  
  if (msg.action === "pull-model") {
    const baseUrl = msg.baseUrl;
    const modelName = msg.modelName;
    fetch(`${baseUrl}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName, stream: true })
    }).then(async res => {
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
            browser.runtime.sendMessage({
              action: "pull-progress",
              data: { status: data.status, total: data.total, completed: data.completed }
            });
          } catch {}
        }
      }
      browser.runtime.sendMessage({ action: "pull-complete" });
    }).catch(err => {
      browser.runtime.sendMessage({ action: "pull-error", error: err.message });
    });
  }
});