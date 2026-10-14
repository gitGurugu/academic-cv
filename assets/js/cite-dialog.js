// Cite dialog: clicking a "Cite" button opens a dialog showing the BibTeX with Copy / Download.
// The theme's own handler only copies to the clipboard and listens in the bubble phase;
// this listener runs in the capture phase and stops the event before it gets there.
(() => {
  if (window.__citeDialogReady) return;
  window.__citeDialogReady = true;

  const cache = new Map();
  let dialog = null;
  let codeEl = null;
  let copyBtn = null;
  let downloadBtn = null;
  let current = { text: "", filename: "cite.bib" };
  let openCount = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, onClick, className = "") {
    const node = el("button", `cite-dialog-btn ${className}`.trim(), label);
    node.type = "button";
    node.dataset.label = label;
    node.addEventListener("click", onClick);
    return node;
  }

  function flash(node, text) {
    node.textContent = text;
    setTimeout(() => {
      node.textContent = node.dataset.label;
    }, 1500);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.text);
    } catch {
      // Clipboard API unavailable (e.g. insecure context): fall back to a hidden textarea.
      const area = el("textarea");
      area.value = current.text;
      area.style.cssText = "position:fixed;opacity:0";
      dialog.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      if (!ok) return flash(copyBtn, "Copy failed");
    }
    flash(copyBtn, "Copied!");
  }

  function download() {
    const url = URL.createObjectURL(new Blob([current.text], { type: "text/plain;charset=utf-8" }));
    const link = el("a");
    link.href = url;
    link.download = current.filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function build() {
    dialog = el("dialog", "cite-dialog");
    dialog.setAttribute("aria-labelledby", "cite-dialog-title");

    const header = el("div", "cite-dialog-header");
    const title = el("h2", "cite-dialog-title", "Cite");
    title.id = "cite-dialog-title";
    const close = button("×", () => dialog.close(), "cite-dialog-close");
    close.setAttribute("aria-label", "Close");
    header.append(title, close);

    codeEl = el("pre", "cite-dialog-code");
    codeEl.tabIndex = 0; // lets keyboard users scroll long entries

    const actions = el("div", "cite-dialog-actions");
    copyBtn = button("Copy", copy);
    downloadBtn = button("Download", download);
    actions.append(copyBtn, downloadBtn);

    const body = el("div", "cite-dialog-body");
    body.append(header, codeEl, actions);
    dialog.append(body);
    // The body fills the dialog, so a click that lands on the dialog itself is on the backdrop.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.body.append(dialog);
  }

  async function load(url) {
    if (cache.has(url)) return cache.get(url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = (await response.text()).trim();
    cache.set(url, text);
    return text;
  }

  // Download name comes from the publication folder: /publications/<folder>/cite.bib -> <folder>.bib
  function filenameFor(url) {
    const parts = new URL(url, location.href).pathname.split("/").filter(Boolean);
    return `${parts.length > 1 ? parts[parts.length - 2] : "citation"}.bib`;
  }

  document.addEventListener(
    "click",
    async (event) => {
      const trigger = event.target.closest(".js-cite-clipboard");
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!dialog) build();
      const url = trigger.getAttribute("data-filename");
      const ticket = ++openCount;
      current = { text: "", filename: url ? filenameFor(url) : "cite.bib" };
      codeEl.textContent = "Loading…";
      copyBtn.disabled = downloadBtn.disabled = true;
      dialog.showModal();

      try {
        if (!url) throw new Error("no citation file");
        const text = await load(url);
        if (ticket !== openCount) return; // a newer click replaced this one
        current.text = text;
        codeEl.textContent = text;
        copyBtn.disabled = downloadBtn.disabled = false;
      } catch {
        if (ticket === openCount) codeEl.textContent = "Citation file not found.";
      }
    },
    true,
  );
})();
