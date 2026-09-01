// background.js

browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll().then(createContextMenus);
});

function createContextMenus() {
    browser.contextMenus.create({ id: "chatai-root", title: "ChatAI 🧠", contexts: ["page", "selection", "image", "link"] });

    browser.contextMenus.create({ id: "chatai-page-root", parentId: "chatai-root", title: "📄 This Page", contexts: ["page"] });
    browser.contextMenus.create({ id: "chatai-summarize-page", parentId: "chatai-page-root", title: "📋 Summarize Page", contexts: ["page"] });
    browser.contextMenus.create({ id: "chatai-extract-text", parentId: "chatai-page-root", title: "📝 Extract All Text", contexts: ["page"] });
    browser.contextMenus.create({ id: "chatai-translate-page", parentId: "chatai-page-root", title: "🌐 Translate Page", contexts: ["page"] });
    browser.contextMenus.create({ id: "chatai-analyze-page", parentId: "chatai-page-root", title: "🔍 Analyze Content", contexts: ["page"] });
    browser.contextMenus.create({ id: "chatai-key-points", parentId: "chatai-page-root", title: "💡 Extract Key Points", contexts: ["page"] });

    browser.contextMenus.create({ id: "chatai-text-root", parentId: "chatai-root", title: "💬 Text Actions", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-explain", parentId: "chatai-text-root", title: "💡 Explain", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-summarize", parentId: "chatai-text-root", title: "📋 Summarize", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-translate", parentId: "chatai-text-root", title: "🌐 Translate to English", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-simplify", parentId: "chatai-text-root", title: "✨ Simplify Language", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-expand", parentId: "chatai-text-root", title: "📖 Expand & Elaborate", contexts: ["selection"] });

    browser.contextMenus.create({ id: "chatai-tone", parentId: "chatai-text-root", title: "🎭 Rewrite Tone", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-tone-pro", parentId: "chatai-tone", title: "💼 Professional", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-tone-eli5", parentId: "chatai-tone", title: "👶 ELI5 (Simple)", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-tone-concise", parentId: "chatai-tone", title: "⚡ Concise / TL;DR", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-tone-formal", parentId: "chatai-tone", title: "🎩 Formal / Academic", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-tone-casual", parentId: "chatai-tone", title: "😊 Casual / Friendly", contexts: ["selection"] });

    browser.contextMenus.create({ id: "chatai-code-root", parentId: "chatai-root", title: "💻 Code Actions", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-code-review", parentId: "chatai-code-root", title: "🔍 Review & Debug", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-unit-test", parentId: "chatai-code-root", title: "🧪 Generate Unit Tests", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-refactor", parentId: "chatai-code-root", title: "🛠️ Refactor & Optimize", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-security", parentId: "chatai-code-root", title: "🛡️ Security Audit", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-document-code", parentId: "chatai-code-root", title: "📝 Add Documentation", contexts: ["selection"] });
    browser.contextMenus.create({ id: "chatai-explain-code", parentId: "chatai-code-root", title: "💡 Explain Code", contexts: ["selection"] });

    browser.contextMenus.create({ id: "chatai-image-root", parentId: "chatai-root", title: "🖼️ Image Actions", contexts: ["image"] });
    browser.contextMenus.create({ id: "chatai-image-explain", parentId: "chatai-image-root", title: "🔍 Explain Image", contexts: ["image"] });
    browser.contextMenus.create({ id: "chatai-image-ocr", parentId: "chatai-image-root", title: "📝 Extract Text (OCR)", contexts: ["image"] });
    browser.contextMenus.create({ id: "chatai-image-alt", parentId: "chatai-image-root", title: "♿ Generate Alt-Text", contexts: ["image"] });
    browser.contextMenus.create({ id: "chatai-image-describe", parentId: "chatai-image-root", title: "📖 Detailed Description", contexts: ["image"] });
    browser.contextMenus.create({ id: "chatai-image-objects", parentId: "chatai-image-root", title: "🎯 Identify Objects", contexts: ["image"] });

    browser.contextMenus.create({ id: "chatai-link-root", parentId: "chatai-root", title: "🔗 Link Actions", contexts: ["link"] });
    browser.contextMenus.create({ id: "chatai-link-summarize", parentId: "chatai-link-root", title: "📋 Summarize Link Content", contexts: ["link"] });
    browser.contextMenus.create({ id: "chatai-link-analyze", parentId: "chatai-link-root", title: "🔍 Analyze Link", contexts: ["link"] });

    browser.contextMenus.create({ id: "chatai-quick-ask", parentId: "chatai-root", title: "❓ Ask ChatAI", contexts: ["page", "selection"] });
    browser.contextMenus.create({ id: "chatai-quick-brainstorm", parentId: "chatai-root", title: "🎨 Brainstorm Ideas", contexts: ["page", "selection"] });
}

async function extractPageText(tabId) {
    try {
        const results = await browser.scripting.executeScript({
            target: { tabId },
            func: () => {
                const clone = document.body.cloneNode(true);
                clone.querySelectorAll('script, style, nav, footer, header, aside, noscript').forEach(el => el.remove());
                return clone.innerText.substring(0, 15000);
            }
        });
        return results[0]?.result || "";
    } catch (e) {
        console.error("Failed to extract page text:", e);
        return "";
    }
}

async function fetchUrlText(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 15000);
        return text;
    } catch (e) {
        console.error("Failed to fetch URL:", e);
        return "";
    }
}

// Fetch image via background script to bypass web page CORS
async function fetchImageAsBase64(imageUrl) {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to fetch image via background script:", e);
        return null;
    }
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const text = info.selectionText || "";
    let images = [];
    let promptText = "";
    let pageContent = "";

    console.log("[ChatAI] Menu clicked:", info.menuItemId, "tab:", tab?.id);

    const pageActions = ["chatai-summarize-page", "chatai-extract-text", "chatai-translate-page", "chatai-analyze-page", "chatai-key-points"];
    if (pageActions.includes(info.menuItemId) && tab?.id) {
        pageContent = await extractPageText(tab.id);
        if (!pageContent || pageContent.length < 50) {
            await sendPromptToSidebar("⚠️ Could not extract meaningful content from this page.", []);
            return;
        }
    }

    const linkActions = ["chatai-link-summarize", "chatai-link-analyze"];
    if (linkActions.includes(info.menuItemId) && info.linkUrl) {
        pageContent = await fetchUrlText(info.linkUrl);
        if (!pageContent || pageContent.length < 50) {
            await sendPromptToSidebar(`⚠️ Could not fetch content from: ${info.linkUrl}`, []);
            return;
        }
    }

    const imageActions = ["chatai-image-explain", "chatai-image-ocr", "chatai-image-alt", "chatai-image-describe", "chatai-image-objects"];
    if (imageActions.includes(info.menuItemId) && info.srcUrl) {
        const imgMap = {
            "chatai-image-explain": "Explain this image in detail.",
            "chatai-image-ocr": "Extract all visible text from this image exactly as it appears (OCR).",
            "chatai-image-alt": "Generate a concise, accessible alt-text description for this image.",
            "chatai-image-describe": "Provide a detailed, comprehensive description of this image, including composition, colors, mood, and notable details.",
            "chatai-image-objects": "Identify and list all objects, people, and elements visible in this image."
        };
        
        const base64 = await fetchImageAsBase64(info.srcUrl);
        if (base64) {
            await sendPromptToSidebar(imgMap[info.menuItemId], [base64]);
        } else {
            await sendPromptToSidebar(`⚠️ Could not fetch this image directly. You can copy the image and paste it directly into the chat.`, []);
        }
        return;
    }

    switch (info.menuItemId) {
        case "chatai-summarize-page": promptText = `Summarize the following webpage content concisely:\n\n${pageContent}`; break;
        case "chatai-extract-text": promptText = `Extract and format the main text content from this page cleanly:\n\n${pageContent}`; break;
        case "chatai-translate-page": promptText = `Translate the following webpage content to English:\n\n${pageContent}`; break;
        case "chatai-analyze-page": promptText = `Analyze this webpage. Identify the main topic, key arguments, and overall purpose:\n\n${pageContent}`; break;
        case "chatai-key-points": promptText = `Extract the key points and main takeaways as a bulleted list:\n\n${pageContent}`; break;
        case "chatai-link-summarize": promptText = `Summarize the content from this link:\n\n${pageContent}`; break;
        case "chatai-link-analyze": promptText = `Analyze this content. What is the main message, target audience, and key insights?\n\n${pageContent}`; break;
        case "chatai-explain": promptText = `Explain the following in simple terms:\n\n${text}`; break;
        case "chatai-summarize": promptText = `Summarize concisely:\n\n${text}`; break;
        case "chatai-translate": promptText = `Translate to English:\n\n${text}`; break;
        case "chatai-simplify": promptText = `Simplify this language to make it easier to understand:\n\n${text}`; break;
        case "chatai-expand": promptText = `Expand on this text, adding more details, examples, and context:\n\n${text}`; break;
        case "chatai-tone-pro": promptText = `Rewrite to sound professional and formal:\n\n${text}`; break;
        case "chatai-tone-eli5": promptText = `Explain this like I'm 5 years old:\n\n${text}`; break;
        case "chatai-tone-concise": promptText = `Make this as concise as possible without losing meaning:\n\n${text}`; break;
        case "chatai-tone-formal": promptText = `Rewrite in formal, academic language:\n\n${text}`; break;
        case "chatai-tone-casual": promptText = `Rewrite in a casual, friendly tone:\n\n${text}`; break;
        case "chatai-code-review": promptText = `Review this code for bugs, logic errors, and best practices:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-unit-test": promptText = `Generate comprehensive unit tests for this code, including edge cases:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-refactor": promptText = `Refactor this code for performance, readability, and modern best practices:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-security": promptText = `Perform a security audit on this code. Highlight vulnerabilities:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-document-code": promptText = `Add comprehensive documentation, comments, and docstrings to this code:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-explain-code": promptText = `Explain what this code does, line by line:\n\n\`\`\`\n${text}\n\`\`\``; break;
        case "chatai-quick-ask": promptText = text ? `Answer this question:\n\n${text}` : "What would you like to ask?"; break;
        case "chatai-quick-brainstorm": promptText = text ? `Brainstorm ideas related to:\n\n${text}` : "Let's brainstorm! What topic would you like to explore?"; break;
    }

    if (promptText) await sendPromptToSidebar(promptText, images);
});

async function sendPromptToSidebar(text, images) {
    const payload = { action: "process-prompt", text, images };
    await browser.storage.local.set({ pendingPrompt: payload });
    
    try {
        if (browser.sidebarAction?.open) await browser.sidebarAction.open();
    } catch (e) {
        console.log("[ChatAI] Sidebar auto-open skipped:", e.message);
    }
    
    try {
        await browser.runtime.sendMessage(payload);
        console.log("[ChatAI] Prompt sent directly to sidebar");
    } catch (e) {
        console.log("[ChatAI] Sidebar not active yet — prompt saved to storage.");
    }
}

browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === "fetch-url-text") {
        return fetchUrlText(msg.url).then(text => ({ text }));
    }
    if (msg.action === "pull-model") {
        pullModel(msg.baseUrl, msg.modelName);
        return Promise.resolve({ started: true });
    }
});

async function pullModel(baseUrl, modelName) {
    try {
        const res = await fetch(`${baseUrl}/api/pull`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: modelName, stream: true })
        });
        if (!res.ok) throw new Error(`Pull failed: HTTP ${res.status}`);

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
                    browser.runtime.sendMessage({ action: "pull-progress", data });
                    if (data.status && data.status.includes("success")) {
                        browser.runtime.sendMessage({ action: "pull-complete" });
                        return;
                    }
                } catch {}
            }
        }
        browser.runtime.sendMessage({ action: "pull-complete" });
    } catch (e) {
        console.error("Pull model error:", e);
        browser.runtime.sendMessage({ action: "pull-error", error: e.message });
    }
}