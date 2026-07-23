// preview.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const previewId = params.get('id');

  if (!previewId) {
    document.body.innerHTML = '<p style="padding:20px; font-family:sans-serif; color:#333;">No preview ID provided.</p>';
    return;
  }

  try {
    // Try storage first (small previews)
    const result = await browser.storage.local.get([
      `preview_data_${previewId}`,
      `preview_time_${previewId}`
    ]);
    let htmlContent = result[`preview_data_${previewId}`];
    const timestamp = result[`preview_time_${previewId}`];

    // Clean up storage
    await browser.storage.local.remove([
      `preview_data_${previewId}`,
      `preview_time_${previewId}`
    ]);

    // If not in storage, request from background via message
    if (!htmlContent) {
      const response = await browser.runtime.sendMessage({
        action: 'get-preview-data',
        previewId
      });
      if (response && response.html) {
        htmlContent = response.html;
      }
    }

    if (htmlContent && timestamp && (Date.now() - timestamp < 60000)) {
      // Inject CSP meta tag for safety
      const safeHtml = htmlContent.replace(
        /<head([^>]*)>/i,
        '<head$1><meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\' data: blob:;">'
      );
      document.getElementById('preview-frame').srcdoc = safeHtml;
    } else {
      document.body.innerHTML = '<p style="padding:20px; font-family:sans-serif; color:#333;">Preview data expired or not found. Please try clicking Preview again.</p>';
    }
  } catch (e) {
    document.body.innerHTML = `<p style="padding:20px; font-family:sans-serif; color:#333;">Error loading preview: ${e.message}</p>`;
  }
});