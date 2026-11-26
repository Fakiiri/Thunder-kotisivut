import { inspectPdf } from "@shared/pdf-manuscript";
self.onmessage = async event => {
  try {
    const { bytes, production } = event.data;
    const { sourcePages, billedPages, blankPages } = await inspectPdf(
      bytes,
      production
    );
    self.postMessage({ sourcePages, billedPages, blankPages });
  } catch (e) {
    self.postMessage({
      error: e instanceof Error ? e.message : "PDF:n lukeminen epäonnistui.",
    });
  }
};
