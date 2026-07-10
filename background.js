// Context menus
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "sum-text", title: "AI: Summarize Selection", contexts: ["selection"]
  });
  browser.contextMenus.create({
    id: "exp-text", title: "AI: Explain Selection", contexts: ["selection"]
  });
  browser.contextMenus.create({
    id: "page-ctx", title: "AI: Use Page Context", contexts: ["page"]
  });
  browser.contextMenus.create({
    id: "img-multimodal", title: "AI: Send Image to LLM", contexts: ["image"]
  });
  browser.contextMenus.create({
    id: "translate-text", title: "AI: Translate Selection", contexts: ["selection"]
  });
  browser.contextMenus.create({
    id: "fix-code", title: "AI: Fix/Review Code", contexts: ["selection"]
  });
});

// Toolbar button toggles sidebar
browser.action.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let payload = { action: "process-prompt", text: "", images: [] };

  try {
    if (info.menuItemId === "sum-text") {
      payload.text = `Summarize this text concisely:\n\n"${info.selectionText}"`;
    } else if (info.menuItemId === "exp-text") {
      payload.text = `Explain this concept deeply:\n\n"${info.selectionText}"`;
    } else if (info.menuItemId === "translate-text") {
      payload.text = `Translate the following text to English (detect source language automatically):\n\n"${info.selectionText}"`;
    } else if (info.menuItemId === "fix-code") {
      payload.text = `Review and fix this code. Explain any bugs you find:\n\n\`\`\`\n${info.selectionText}\n\`\`\``;
    } else if (info.menuItemId === "page-ctx") {
      const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText || document.documentElement.textContent
      });
      const pageText = results[0]?.result || "";
      payload.text = `Analyze the context of this web page:\n\n${pageText.substring(0, 12000)}`;
    } else if (info.menuItemId === "img-multimodal") {
      payload.text = "Analyze this image and describe what you see.";
      try {
        const base64Img = await convertImgToBase64(info.srcUrl);
        payload.images.push(base64Img);
      } catch (e) {
        payload.text = `Failed to process image: ${info.srcUrl}\n${e.message}`;
      }
    }
  } catch (err) {
    payload.text = `Context menu error: ${err.message}`;
  }

  // Send to sidebar (it will be opened by user via shortcut/button)
  browser.runtime.sendMessage(payload).catch(() => {
    // Sidebar not open yet — queue it
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
