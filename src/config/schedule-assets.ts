/**
 * Schedule posters in `public/`. Paths are served from the site root (`/…`).
 * To swap files later, change `src` and `downloadFileName` (keep extensions in sync).
 */
export type ScheduleLang = "bg" | "en";

export const SCHEDULE_BY_LANG: Record<
  ScheduleLang,
  { src: string; downloadFileName: string; imageAlt: string }
> = {
  bg: {
    src: "/plan-bg.jpg",
    downloadFileName: "moto-rock-fest-plan-bg.jpg",
    imageAlt:
      "Програма Moto Rock Fest „Проходът на рока – Петрохан“, 24–26 юли 2026, с. Бързия",
  },
  en: {
    src: "/plan-en.jpg",
    downloadFileName: "moto-rock-fest-plan-en.jpg",
    imageAlt:
      "Moto Rock Fest program The Pass of Rock – Petrohan, 24–26 July 2026, Barzia village",
  },
};
