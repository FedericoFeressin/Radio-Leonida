import type { GlyphName } from "@/lib/types";

interface GlyphProps {
  name: GlyphName;
  className?: string;
}

/** Marcas originales dibujadas en SVG. No reproducen logos de Rockstar. */
export function Glyph({ name, className = "" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === "wave" && (
        <path d="M4 32c5-14 10 14 15 0s10 14 15 0 10 14 15 0 8 10 11 2" />
      )}
      {name === "sun" && (
        <>
          <circle cx="32" cy="32" r="11" />
          <path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M50.4 13.6l-5.7 5.7M19.3 44.7l-5.7 5.7" />
        </>
      )}
      {name === "pulse" && (
        <path d="M4 34h12l6-14 8 26 7-18 5 6h18" />
      )}
      {name === "bolt" && (
        <path d="M36 4 14 36h16l-4 24 24-34H33l3-22Z" />
      )}
      {name === "disc" && (
        <>
          <circle cx="32" cy="32" r="22" />
          <circle cx="32" cy="32" r="8" />
          <path d="M32 10c8 6 8 38 0 44" />
        </>
      )}
      {name === "star" && (
        <path d="M32 4c2.5 14 9.5 21.5 28 28-18.5 6.5-25.5 14-28 28-2.5-14-9.5-21.5-28-28C22.5 25.5 29.5 18 32 4Z" />
      )}
      {name === "orbit" && (
        <>
          <circle cx="32" cy="32" r="9" />
          <ellipse cx="32" cy="32" rx="27" ry="13" transform="rotate(-28 32 32)" />
          <circle cx="53" cy="22" r="3" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
