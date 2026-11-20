import { statusLabel } from "@/lib/format";
import type { ConfirmationStatus } from "@/lib/types";

const SHORT_LABELS: Record<ConfirmationStatus, string> = {
  official: "OFICIAL",
  "official-material": "MATERIAL OFICIAL",
  "press-reported": "PRENSA",
  trailer: "TRÁILER",
  rumor: "NO VERIFICADO",
};

export function ConfirmBadge({
  status,
  compact = false,
}: {
  status: ConfirmationStatus;
  compact?: boolean;
}) {
  return (
    <span
      className={`confirm-badge confirm-badge--${status}`}
      title={statusLabel(status)}
    >
      <span className="confirm-badge__dot" aria-hidden="true" />
      {compact ? SHORT_LABELS[status].split(" ")[0] : SHORT_LABELS[status]}
    </span>
  );
}
