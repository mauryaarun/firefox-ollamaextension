// preview.js
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get the unique preview ID from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const previewId = params.get('id');

    if (previewId) {
        try {
            // 2. Fetch the HTML content and timestamp from extension storage
            const result = await browser.storage.local.get([
                `preview_data_${previewId}`,
                `preview_time_${previewId}`
            ]);

            const htmlContent = result[`preview_data_${previewId}`];
            const timestamp = result[`preview_time_${previewId}`];

            // 3. Clean up storage immediately to prevent memory leaks
            await browser.storage.local.remove([
                `preview_data_${previewId}`,
                `preview_time_${previewId}`
            ]);

            // 4. Validate and inject (allow 30 seconds for the tab to load)
            if (htmlContent && (Date.now() - timestamp < 30000)) {
                document.getElementById('preview-frame').srcdoc = htmlContent;
            } else {
                document.body.innerHTML = '<p style="padding:20px; font-family:sans-serif; color:#333;">Preview data expired or not found. Please try clicking Preview again.</p>';
            }
        } catch (e) {
            document.body.innerHTML = `<p style="padding:20px; font-family:sans-serif; color:#333;">Error loading preview: ${e.message}</p>`;
        }
    } else {
        document.body.innerHTML = '<p style="padding:20px; font-family:sans-serif; color:#333;">No preview ID provided.</p>';
    }
});
