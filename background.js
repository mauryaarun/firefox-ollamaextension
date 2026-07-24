// background.js
browser.contextMenus.create({
  id: "chatai-explain",
  title: "ChatAI: Explain Selection",
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "chatai-summarize",
  title: "ChatAI: Summarize Selection",
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "chatai-translate",
  title: "ChatAI: Translate Selection",
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "chatai-code-review",
  title: "ChatAI: Review Code",
  contexts: ["selection"]
});
browser.contextMenus.create({
  id: "chatai-image-explain",
  title: "ChatAI: Explain Image",
  contexts: ["image"]
});

browser.action.onClicked.addListener((tab) => {
  browser.tabs.create({
    url: browser.runtime.getURL("sidebar.html")
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let text = info.selectionText || "";
  let images = [];
  
  // Handle Image Context
  if (info.menuItemId === "chatai-image-explain" && info.srcUrl) {
    try {
      const response = await fetch(info.srcUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        images.push(base64);
        await sendPromptToSidebar("Explain this image in detail.", images);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error("Failed to fetch image", e);
      await sendPromptToSidebar("Explain this image.", []);
    }
    return;
  }

  // Handle Text Context
  let promptText = "";
  if (info.menuItemId === "chatai-explain") {
    promptText = `Explain the following text in simple terms:\n\n${text}`;
  } else if (info.menuItemId === "chatai-summarize") {
    promptText = `Summarize the following text concisely:\n\n${text}`;
  } else if (info.menuItemId === "chatai-translate") {
    promptText = `Translate the following text to English:\n\n${text}`;
  } else if (info.menuItemId === "chatai-code-review") {
    promptText = `Review this code for bugs, improvements, and best practices:\n\n\`\`\`\n${text}\n\`\`\``;
  }

  await sendPromptToSidebar(promptText, images);
});

async function sendPromptToSidebar(text, images) {
  const payload = { action: "process-prompt", text, images };
  
  // 1. Save to storage as a reliable fallback (works even if sidebar is closed)
  await browser.storage.local.set({ pendingPrompt: payload });
  
  // 2. Try sending message directly if sidebar is already open and listening
  try {
    await browser.runtime.sendMessage(payload);
  } catch (e) {
    console.log("Sidebar not active, relying on storage listener.");
  }
}
