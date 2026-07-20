// pdf-setup.js
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = browser.runtime.getURL('lib/pdfjs/pdf.worker.min.js');
}
