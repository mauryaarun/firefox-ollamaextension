// Context menus
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({
      id: "ai-menu-parent",
      title: "🤖 AI Assistant",
      contexts: ["all"]
    });
    browser.contextMenus.create({
      id: "sum-text", title: "📝 Summarize Selection", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "exp-text", title: "💡 Explain Selection", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "translate-text", title: "🌐 Translate Selection", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "fix-code", title: "🔧 Fix/Review Code", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "improve-writing", title: "✍️ Improve Writing", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "separator-1", type: "separator", contexts: ["selection"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "page-ctx", title: "📄 Analyze Page Context", contexts: ["page"], parentId: "ai-menu-parent"
    });
    browser.contextMenus.create({
      id: "img-multimodal", title: "🖼️ Send Image to LLM", contexts: ["image"], parentId: "ai-menu-parent"
    });
  });
});

// Toolbar button toggles sidebar
browser.action.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let payload = { action: "process-prompt", text: "", images: [] };
  
  try {
    switch (info.menuItemId) {
      case "sum-text":
        payload.text = `Summarize this text concisely:\n\n"${info.selectionText}"`;
        break;
      case "exp-text":
        payload.text = `Explain this concept deeply:\n\n"${info.selectionText}"`;
        break;
      case "translate-text":
        payload.text = `Translate the following text to English (detect source language automatically):\n\n"${info.selectionText}"`;
        break;
      case "fix-code":
        payload.text = `Review and fix this code. Explain any bugs you find:\n\n\`\`\`\n${info.selectionText}\n\`\`\``;
        break;
      case "improve-writing":
        payload.text = `Improve the writing quality of this text while preserving its meaning:\n\n"${info.selectionText}"`;
        break;
      case "page-ctx": {
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText || document.documentElement.textContent
        });
        const pageText = results[0]?.result || "";
        payload.text = `Analyze the context of this web page:\n\n${pageText.substring(0, 12000)}`;
        break;
      }
      case "img-multimodal": {
        payload.text = "Analyze this image and describe what you see.";
        try {
          // Try to extract image directly from the page (no network request needed)
          const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: (srcUrl) => {
              // Find the image element on the page
              const img = document.querySelector(`img[src="${srcUrl}"]`) || 
                          Array.from(document.images).find(i => i.src === srcUrl);
              
              if (!img) return null;
              
              // Try to draw to canvas and extract base64
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                return dataUrl.split(',')[1];
              } catch (e) {
                // CORS error - image is cross-origin and can't be read
                console.warn('Canvas CORS error:', e.message);
                return null;
              }
            },
            args: [info.srcUrl]
          });
          
          let base64Img = results[0]?.result;
          
          // If canvas extraction failed (CORS), try fetching the URL
          if (!base64Img) {
            try {
              base64Img = await convertImgToBase64(info.srcUrl);
            } catch (fetchErr) {
              throw new Error(`Could not extract image: ${fetchErr.message}`);
            }
          }
          
          payload.images.push(base64Img);
        } catch (e) {
          payload.text = `Failed to process image: ${info.srcUrl}\n${e.message}`;
        }
        break;
      }
    }
  } catch (err) {
    payload.text = `Context menu error: ${err.message}`;
  }
  
  browser.runtime.sendMessage(payload).catch(() => {
    browser.storage.local.set({ pendingPrompt: payload });
  });
});

async function convertImgToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}