/**
 * Detects embedded browsers (Facebook, Instagram, Messenger, etc.) that often
 * block programmatic downloads (blob URLs, window.open) or show a broken page.
 * User-Agent checks are heuristic; see https://stackoverflow.com/questions/31504098
 */
export function isRestrictedSocialWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  return (
    /\bFB[\w_]+\//i.test(ua) ||
    /\bFBAN\b/i.test(ua) ||
    /\bFBAV\b/i.test(ua) ||
    /\bFBIOS\b/i.test(ua) ||
    /\bFB_IAB\b/i.test(ua) ||
    /\bInstagram\b/i.test(ua) ||
    /\bLine\//i.test(ua) ||
    /\bLinkedInApp\b/i.test(ua)
  );
}

/**
 * Same-origin file download without blob: works in more in-app browsers than
 * fetch + createObjectURL + window.open.
 */
export function triggerSameOriginDownload(
  absoluteUrl: string,
  downloadFileName: string,
): void {
  const anchor = document.createElement("a");
  anchor.href = absoluteUrl;
  anchor.download = downloadFileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
