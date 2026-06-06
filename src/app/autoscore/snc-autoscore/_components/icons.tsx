/* icons.tsx — line icons (1.6 stroke, currentColor) + inline SNC brand shield.
   Ported from components.jsx Icon(). No emoji — discrete line icons only. */
import type { CSSProperties, ReactNode } from "react";

export type IconName =
  | "grid"
  | "search"
  | "shield"
  | "doc"
  | "clock"
  | "gear"
  | "bell"
  | "car"
  | "chevron"
  | "arrowUp"
  | "arrowDown"
  | "bolt"
  | "coins"
  | "alert"
  | "gavel"
  | "pin"
  | "refresh"
  | "download"
  | "check"
  | "x"
  | "swap";

const PATHS: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <line x1="10" y1="13" x2="16" y2="13" />
      <line x1="10" y1="17" x2="16" y2="17" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  car: (
    <>
      <path d="M5 12l1.5-4.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12" />
      <path d="M3 12h18v5H3z" />
      <circle cx="7.5" cy="17" r="1.4" />
      <circle cx="16.5" cy="17" r="1.4" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
  arrowUp: (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="6 11 12 5 18 11" />
    </>
  ),
  arrowDown: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6 13 12 19 18 13" />
    </>
  ),
  bolt: <polygon points="13 2 4 14 11 14 10 22 19 9 12 9 13 2" />,
  coins: (
    <>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3" />
      <path d="M9 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <ellipse cx="15" cy="12" rx="6" ry="3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l9 16H3z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </>
  ),
  gavel: (
    <>
      <path d="M14 4l6 6-3 3-6-6z" />
      <line x1="9" y1="9" x2="4" y2="14" />
      <line x1="3" y1="21" x2="13" y2="21" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-1 5" />
      <polyline points="20 4 20 11 13 11" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <polyline points="7 11 12 16 17 11" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </>
  ),
  check: <polyline points="4 12 9 17 20 6" />,
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  swap: (
    <>
      <polyline points="17 4 21 8 17 12" />
      <line x1="21" y1="8" x2="9" y2="8" />
      <polyline points="7 12 3 16 7 20" />
      <line x1="3" y1="16" x2="15" y2="16" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  stroke = 1.6,
  style,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}

/* Inline brand mark — gold shield with check, matches the Icon "shield" glyph.
   Replaces the prototype's assets/snc-shield.png (not shipped in the bundle). */
export function SncShield({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }}
    >
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"
        fill="color-mix(in srgb, var(--accent) 16%, transparent)"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
