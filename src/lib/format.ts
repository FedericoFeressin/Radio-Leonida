import type { ConfirmationStatus } from "./types";

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const STATUS_LABELS: Record<ConfirmationStatus, string> = {
  official: "Confirmado por Rockstar",
  "official-material": "Visto en material oficial",
  "press-reported": "Reportado por prensa",
  trailer: "Del tráiler · emisora desconocida",
  rumor: "No verificado",
};

export function statusLabel(status: ConfirmationStatus): string {
  return STATUS_LABELS[status];
}

export function accentVar(token: string): string {
  return `var(--${token})`;
}
