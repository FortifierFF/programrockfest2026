"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  SCHEDULE_BY_LANG,
  type ScheduleLang,
} from "@/config/schedule-assets";
import {
  isRestrictedSocialWebView,
  triggerSameOriginDownload,
} from "@/lib/inAppBrowser";

/**
 * Single-page schedule viewer: pick BG or EN image, optional download.
 * Uses plain `img` so any aspect ratio from your uploads works without layout props.
 */
export function ScheduleViewer() {
  const [lang, setLang] = useState<ScheduleLang>("bg");
  const [socialHintDismissed, setSocialHintDismissed] = useState(false);
  const active = SCHEDULE_BY_LANG[lang];

  // No subscribe needed — UA does not change during the session; server snapshot is false.
  const socialWebView = useSyncExternalStore(
    () => () => {},
    () => isRestrictedSocialWebView(),
    () => false,
  );

  /**
   * Save the current poster. In Facebook's WebView, use a direct same-origin link
   * instead of fetch+blob or window.open (those often show "Page can't be loaded").
   */
  const handleDownload = useCallback(async () => {
    const path = active.src;
    const name = active.downloadFileName;
    const absoluteUrl = new URL(path, window.location.origin).href;

    // Read UA here (not only from state) so the first tap works before useEffect runs.
    if (isRestrictedSocialWebView()) {
      triggerSameOriginDownload(absoluteUrl, name);
      return;
    }

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = name;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Avoid window.open here — same fallback as in-app: direct anchor (same origin).
      triggerSameOriginDownload(absoluteUrl, name);
    }
  }, [active.downloadFileName, active.src]);

  return (
    // Fill the page shell (h-dvh on parent) and keep scroll inside <main> so wheel + scrollbar match.
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Sticky bar: language + download stay visible while scrolling long posters */}
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 py-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        {socialWebView && !socialHintDismissed ? (
          <div
            role="status"
            className="mx-auto mb-3 flex max-w-full items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 sm:px-7 lg:max-w-[1400px] dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="min-w-0 flex-1 leading-snug">
              <span className="font-semibold">Facebook / Instagram:</span> вграденият
              браузър често блокира изтегляне. Ползвайте менюто{" "}
              <span className="whitespace-nowrap font-mono">⋯</span> или{" "}
              <span className="whitespace-nowrap font-mono">⋮</span> →{" "}
              <span className="font-semibold">Отвори в браузър</span> /{" "}
              <span className="font-semibold">Open in browser</span>, после бутона за
              изтегляне. Алтернатива:{" "}
              <button
                type="button"
                className="font-semibold text-amber-900 underline decoration-amber-700 underline-offset-2 hover:text-amber-950 dark:text-amber-50 dark:hover:text-white"
                onClick={() => {
                  window.location.href = new URL(
                    active.src,
                    window.location.origin,
                  ).href;
                }}
              >
                отвори изображението на цял екран
              </button>{" "}
              и задръж за запис / open full-screen image, then long-press to save.
            </p>
            <button
              type="button"
              onClick={() => setSocialHintDismissed(true)}
              className="shrink-0 rounded p-1 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/50"
              aria-label="Затвори подсказката"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="mx-auto flex w-full max-w-full flex-wrap items-center justify-center gap-3 px-4 sm:px-7 lg:max-w-[1400px] sm:justify-between">
          <div
            className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900"
            role="group"
            aria-label="Език / Language"
          >
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                lang === "bg"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              aria-pressed={lang === "bg"}
              onClick={() => setLang("bg")}
            >
              БГ
            </button>
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                lang === "en"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <DownloadIcon className="h-4 w-4 shrink-0" aria-hidden />
            Изтегли / Download
          </button>
        </div>
      </header>

      {/*
        Mobile: full width with horizontal padding. Desktop (lg): content column capped at 1400px, centered.
      */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-full px-4 py-3 sm:px-7 sm:py-4 lg:max-w-[1400px]">
          <div className="flex w-full min-w-0 items-start justify-center">
            {/*
              Two posters stacked in one grid cell: crossfade on language change.
              Both stay mounted so images stay decoded and switching is smooth (no remount flash).
            */}
            <div className="grid w-full min-w-0 justify-items-stretch">
              {/* eslint-disable-next-line @next/next/no-img-element -- Posters are user-sized; native img keeps correct aspect without fixed dimensions */}
              <img
                src={SCHEDULE_BY_LANG.bg.src}
                alt={SCHEDULE_BY_LANG.bg.imageAlt}
                aria-hidden={lang !== "bg"}
                decoding="async"
                fetchPriority="high"
                className={posterImgClass(lang === "bg")}
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- same as BG layer */}
              <img
                src={SCHEDULE_BY_LANG.en.src}
                alt={SCHEDULE_BY_LANG.en.imageAlt}
                aria-hidden={lang !== "en"}
                decoding="async"
                fetchPriority="low"
                className={posterImgClass(lang === "en")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Shared layout + crossfade: inactive layer fades out and ignores pointer events. */
function posterImgClass(isActive: boolean) {
  return [
    // block + w-full h-auto: scale by width only so the image spans the screen edge-to-edge.
    "col-start-1 row-start-1 block h-auto w-full max-w-none rounded-none shadow-none ring-0",
    "transition-[opacity,transform] duration-500 ease-in-out motion-reduce:transition-none",
    // Slight scale on the incoming side feels less “hard cut” than opacity alone (skipped if reduced motion).
    isActive
      ? "z-[1] opacity-100 motion-reduce:scale-100 scale-100"
      : "z-0 opacity-0 pointer-events-none motion-reduce:scale-100 scale-[0.99]",
  ].join(" ");
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
