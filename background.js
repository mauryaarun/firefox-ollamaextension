// Context menus
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({ id: "ai-menu-parent", title: "🤖 AI Assistant", contexts: ["all"] });
    browser.contextMenus.create({ id: "sum-text", title: "📝 Summarize Selection", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "exp-text", title: "💡 Explain Selection", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "translate-text", title: "🌐 Translate Selection", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "fix-code", title: "🔧 Fix/Review Code", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "improve-writing", title: "✍️ Improve Writing", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "separator-1", type: "separator", contexts: ["selection"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "page-ctx", title: "📄 Analyze Page Context", contexts: ["page"], parentId: "ai-menu-parent" });
    browser.contextMenus.create({ id: "img-multimodal", title: "🖼️ Send Image to LLM", contexts: ["image"], parentId: "ai-menu-parent" });
  });
});

browser.action.onClicked.addListener(() => browser.sidebarAction.toggle());

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let payload = { action: "process-prompt", text: "", images: [] };
  try {
    switch (info.menuItemId) {
      case "sum-text": payload.text = `Summarize this text concisely:\n\n"${info.selectionText}"`; break;
      case "exp-text": payload.text = `Explain this concept deeply:\n\n"${info.selectionText}"`; break;
      case "translate-text": payload.text = `Translate the following text to English (detect source language automatically):\n\n"${info.selectionText}"`; break;
      case "fix-code": payload.text = `Review and fix this code. Explain any bugs you find:\n\n\`\`\`\n${info.selectionText}\n\`\`\``; break;
      case "improve-writing": payload.text = `Improve the writing quality of this text while preserving its meaning:\n\n"${info.selectionText}"`; break;
      case "page-ctx": {
        const results = await browser.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.body.innerText || document.documentElement.textContent });
        payload.text = `Analyze the context of this web page:\n\n${(results[0]?.result || "").substring(0, 12000)}`;
        break;
      }
      case "img-multimodal": {
        payload.text = "Analyze this image and describe what you see.";
        try {
          const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: (srcUrl) => {
              const img = document.querySelector(`img[src="${srcUrl}"]`) || Array.from(document.images).find(i => i.src === srcUrl || i.currentSrc === srcUrl);
              if (!img) return null;
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
              } catch (e) { return null; }
            },
            args: [info.srcUrl]
          });
          let base64Img = results[0]?.result;
          if (!base64Img) base64Img = await convertImgToBase64(info.srcUrl);
          payload.images.push(base64Img);
        } catch (e) { payload.text = `Failed to process image: ${info.srcUrl}\n${e.message}`; }
        break;
      }
    }
  } catch (err) { payload.text = `Context menu error: ${err.message}`; }
  
  browser.runtime.sendMessage(payload).catch(() => browser.storage.local.set({ pendingPrompt: payload }));
});

async function convertImgToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Handle RAG URL fetching and Model Pulling
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fetch-url-text") {
    fetch(msg.url)
      .then(res => res.text())
      .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        doc.querySelectorAll("script, style, nav, header, footer, aside").forEach(el => el.remove());
        sendResponse({ text: doc.body.innerText || doc.body.textContent || "" });
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  
  if (msg.action === "pull-model") {
    fetch(`${msg.baseUrl}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: msg.modelName, stream: true })
    }).then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              browser.runtime.sendMessage({ action: "pull-progress", data: json });
            } catch (e) {}
          }
        }
      }
      browser.runtime.sendMessage({ action: "pull-complete" });
    }).catch(err => browser.runtime.sendMessage({ action: "pull-error", error: err.message }));
    return true;
  }
});