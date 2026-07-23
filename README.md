##ChatAI🧠 Assistant: Local AI Multimodal Sidebar
**Version:** 3.2.5  
**Description:** A modern, privacy-focused Firefox sidebar extension that brings local Large Language Models (LLMs), vision, voice, and Retrieval-Augmented Generation (RAG) directly to your browser.

---

## 🌟 Overview
This extension transforms your Firefox sidebar into a powerful AI workspace. By connecting to a local Ollama instance (or any OpenAI-compatible API), it allows you to chat, analyze documents, write code, and generate text without sending your private data to third-party cloud servers.

---

## ✨ Key Features

### 🧠 Local & Private AI
- **Ollama Integration:** Seamlessly connects to `http://localhost:11434` by default.
- **OpenAI Compatible Mode:** Toggle to use external OpenAI-compatible endpoints with API key support.
- **Streaming Responses:** Real-time token-by-token generation with optional "Thinking Process" visibility.

### 📚 Advanced RAG (Retrieval-Augmented Generation)
- **Local Knowledge Base:** Index URLs, PDFs, TXT, and Markdown files directly into your browser's IndexedDB.
- **Smart Chunking:** Sentence-aware text chunking with configurable overlap for higher-quality context retrieval.
- **Source Citations:** The AI displays clickable source pills under its responses, showing exactly which documents were used.
- **Custom Embeddings:** Supports local embedding models (e.g., `nomic-embed-text`).

### 💻 Developer-Friendly Code Blocks
- **Syntax Highlighting:** Powered by Highlight.js for clean, readable code.
- **Action Toolbar:** Every code block includes:
  - 📋 **Copy:** One-click clipboard copy.
  - ✏️ **Edit:** Inline modal editor that updates the conversation history.
  - ⬇️ **Download:** Saves the code block as a file with the correct extension.
  - 👁️ **Preview:** Opens HTML/SVG code blocks in a secure, isolated new tab.

### 🎙️ Voice & Multimodal
- **Voice-to-Text:** Built-in Web Speech API support for hands-free prompting.
- **Text-to-Speech (TTS):** Read AI responses aloud with a single click or auto-read toggle.
- **Vision Support:** Attach images directly to your prompts for visual analysis (requires a vision-capable local model like `gemma4` or `qwen3.6`).

### 🎨 Customizable UI/UX
- **Themes:** Auto, Dark, Light, and Cyberpunk modes.
- **Typography:** Adjustable font sizes (Small, Medium, Large).
- **Chat Management:** Pin, rename, search, and delete conversations.
- **Data Portability:** Export and import chats as JSON or Markdown files.

---

## 🛠️ Prerequisites

1. **Ollama:** Install Ollama on your machine from [ollama.com](https://ollama.com).
2. **Required Models:** Pull at least one chat model and one embedding model:
   ```bash
   ollama pull gemma4          # Or llama3.2-vision, qwen3.6, etc.
   ollama pull nomic-embed-text # Required for RAG features
   ```
3. **PDF.js (Optional but Recommended):** For PDF indexing to work, ensure the `lib/pdfjs/` folder in the extension directory contains `pdf.min.js` and `pdf.worker.min.js`.

---

## 📦 Installation (Firefox)

1. Download or clone this extension repository to your local machine.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."**.
4. Select the `manifest.json` file from the extension folder.
5. The extension icon will appear in your toolbar. Click it or press `Alt+Shift+A` to open the sidebar.

*(Note: For permanent installation, you will need to package the extension as an `.xpi` file and sign it via Mozilla Add-ons, or use Firefox Developer Edition with `xpinstall.signatures.required` set to `false` in `about:config`.)*

---

## ⚙️ Configuration Guide

Open the sidebar and click the **⚙️ Settings** button (or press `Ctrl + ,`).

- **General Tab:** Set your Server URL, select your Chat Model, configure the System Prompt, Temperature, and Context Window.
- **RAG Tab:** 
  - Select your Embedding Model.
  - Adjust Top K Chunks and Chunk Size.
  - Use "Index URL" or "Upload Files" to add documents to your local knowledge base.
- **Appearance Tab:** Switch themes and adjust the UI font size.

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
| :--- | :--- |
| New Conversation | `Ctrl` + `N` |
| Search Chats | `Ctrl` + `K` |
| Export Chat | `Ctrl` + `E` |
| Toggle Settings | `Ctrl` + `,` |
| Show Shortcuts | `Ctrl` + `/` |
| Toggle RAG | `Ctrl` + `R` |
| Send Message | `Enter` |
| New Line | `Shift` + `Enter` |
| Stop Generation | `Esc` |

---

## 🔧 Troubleshooting

- **"Server offline" indicator:** Ensure Ollama is running (`ollama serve`) and the Server URL in settings matches your Ollama instance (default: `http://localhost:11434`).
- **PDF Indexing Fails:** Verify that `lib/pdfjs/pdf.min.js` and `lib/pdfjs/pdf.worker.min.js` exist in the extension directory.
- **Preview Button Not Working:** The extension uses a dedicated `preview.html` and `preview.js` to bypass Firefox's strict Content Security Policy (CSP) for `data:` URIs. Ensure both files are present in the root directory.
- **RAG "No text content found":** Some websites block scraping. Try downloading the page as a `.txt` or `.md` file and uploading it directly via the RAG tab.

---

## 📚 Libraries & Credits

This extension leverages the following open-source libraries:
- **Marked.js:** Markdown parsing.
- **DOMPurify:** HTML sanitization for secure rendering.
- **Highlight.js:** Syntax highlighting for code blocks.
- **PDF.js (Mozilla):** Client-side PDF text extraction.

---

## 📄 License
This project is provided as-is for educational and personal productivity use. Respect the licenses of the underlying AI models you choose to run.

*Built for privacy, performance, and power users.*
