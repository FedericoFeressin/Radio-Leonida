import type { Source } from "@/lib/types";

export function SourceButton({ source }: { source: Source }) {
  return (
    <a
      className="source-button"
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.label}
    >
      <span className="source-button__kind">
        {source.kind === "youtube"
          ? "▶"
          : source.kind === "spotify"
            ? "◎"
            : source.kind === "rockstar-preview"
              ? "R★"
              : "↗"}
      </span>
      <span>{source.label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
