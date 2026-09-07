// ChatAI In-Page Floating Quick Action Menu (Touch & Desktop)
(() => {
  let floatingBtn = null;
  let floatingMenu = null;
  let currentSelection = "";

  // Check if enabled in settings
  async function isEnabled() {
    try {
      const res = await browser.storage.local.get({ enableFloatingMenu: true });
      return res.enableFloatingMenu;
    } catch {
      return true;
    }
  }

  function removeFloatingElements() {
    if (floatingBtn) {
      floatingBtn.remove();
      floatingBtn = null;
    }
    if (floatingMenu) {
      floatingMenu.remove();
      floatingMenu = null;
    }
  }

  function handleSelection(e) {
    // If clicking on our own floating elements, do nothing
    if (e.target && (e.target.closest(".chatai-floating-btn") || e.target.closest(".chatai-floating-menu"))) {
      return;
    }

    setTimeout(async () => {
      const enabled = await isEnabled();
      if (!enabled) {
        removeFloatingElements();
        return;
      }

      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : "";

      if (!text || text.length < 3) {
        removeFloatingElements();
        return;
      }

      currentSelection = text;

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          removeFloatingElements();
          return;
        }

        removeFloatingElements();

        floatingBtn = document.createElement("div");
        floatingBtn.className = "chatai-floating-btn";
        floatingBtn.innerHTML = `<span class="chatai-icon">🧠</span><span>Ask AI</span>`;

        // Calculate absolute position
        const pageX = window.scrollX + rect.right;
        const pageY = window.scrollY + rect.bottom + 6;

        floatingBtn.style.left = `${Math.min(pageX, window.scrollX + window.innerWidth - 100)}px`;
        floatingBtn.style.top = `${pageY}px`;

        floatingBtn.addEventListener("mousedown", (ev) => ev.preventDefault());
        floatingBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          showFloatingMenu(floatingBtn);
        });

        document.body.appendChild(floatingBtn);
      } catch {
        removeFloatingElements();
      }
    }, 100);
  }

  function showFloatingMenu(anchor) {
    if (floatingMenu) {
      floatingMenu.remove();
      floatingMenu = null;
    }

    floatingMenu = document.createElement("div");
    floatingMenu.className = "chatai-floating-menu";

    const actions = [
      { id: "ask", label: "💬 Ask about this", prefix: "What would you like to know about this?\n\n" },
      { id: "summarize", label: "📋 Summarize", prefix: "Summarize the following concisely:\n\n" },
      { id: "explain", label: "🔍 Explain concept", prefix: "Explain this in simple terms:\n\n" },
      { id: "improve", label: "✍️ Improve writing", prefix: "Rewrite this to be clearer, more engaging, and well-structured:\n\n" },
      { id: "grammar", label: "✅ Fix grammar", prefix: "Fix all spelling, grammar, and punctuation mistakes without changing the meaning:\n\n" },
      { id: "code", label: "💻 Explain / Fix code", prefix: "Analyze this code, explain how it works, and fix any bugs or issues:\n\n```\n" },
      { id: "translate", label: "🌐 Translate to English", prefix: "Translate this to English:\n\n" }
    ];

    actions.forEach(act => {
      const btn = document.createElement("button");
      btn.className = "chatai-menu-item";
      btn.textContent = act.label;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        let promptText = "";
        if (act.id === "code") {
          promptText = `${act.prefix}${currentSelection}\n\`\`\``;
        } else {
          promptText = `${act.prefix}"${currentSelection}"`;
        }

        browser.runtime.sendMessage({
          action: "open-with-prompt",
          text: promptText
        }).catch(() => {});

        removeFloatingElements();
      });
      floatingMenu.appendChild(btn);
    });

    const rect = anchor.getBoundingClientRect();
    let left = window.scrollX + rect.left;
    let top = window.scrollY + rect.bottom + 4;

    // Viewport bounds check
    if (left + 190 > window.scrollX + window.innerWidth) {
      left = window.scrollX + window.innerWidth - 195;
    }

    floatingMenu.style.left = `${Math.max(10, left)}px`;
    floatingMenu.style.top = `${top}px`;

    document.body.appendChild(floatingMenu);
  }

  // Event listeners for desktop mouseup and mobile touchend
  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("touchend", handleSelection);

  document.addEventListener("mousedown", (e) => {
    if (e.target && !e.target.closest(".chatai-floating-btn") && !e.target.closest(".chatai-floating-menu")) {
      removeFloatingElements();
    }
  });

  document.addEventListener("touchstart", (e) => {
    if (e.target && !e.target.closest(".chatai-floating-btn") && !e.target.closest(".chatai-floating-menu")) {
      removeFloatingElements();
    }
  }, { passive: true });
})();
