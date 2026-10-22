type Pixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Pixel;
  loaded: boolean;
  version: string;
};
export function updateMetaConsent(allowed: boolean) {
  const target = window as Window & {
    fbq?: Pixel;
    _fbq?: Pixel;
    thunderPixelInitialized?: boolean;
  };
  if (!allowed) {
    target.fbq?.("consent", "revoke");
    return;
  }
  if (!target.fbq) {
    const pixel = ((...args: unknown[]) => {
      if (pixel.callMethod) pixel.callMethod(...args);
      else pixel.queue.push(args);
    }) as Pixel;
    pixel.queue = [];
    pixel.loaded = true;
    pixel.version = "2.0";
    pixel.push = pixel;
    target.fbq = pixel;
    target._fbq = pixel;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  target.fbq("consent", "grant");
  if (!target.thunderPixelInitialized) {
    target.fbq("init", "1203339451883726");
    target.fbq("track", "PageView");
    target.thunderPixelInitialized = true;
  }
}
