import type { ReactNode } from "react";
import type { Level, Panel } from "@/lib/conditions";

/** Fill + text for the small status pill only — the card itself stays neutral. */
export const LEVEL_PILL_CLASSES: Record<Level, string> = {
  good: "bg-level-good-bg text-level-good-text",
  moderate: "bg-level-moderate-bg text-level-moderate-text",
  high: "bg-level-high-bg text-level-high-text",
  extreme: "bg-level-extreme-bg text-level-extreme-text",
  unknown: "bg-level-unknown-bg text-level-unknown-text",
};

const ICONS: Record<Panel["key"], ReactNode> = {
  heat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <circle cx="12" cy="12" r="4.5" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"
      />
    </svg>
  ),
  air: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path strokeLinecap="round" d="M3 8h10.5a3 3 0 1 0-2.8-4" />
      <path strokeLinecap="round" d="M3 12.5h14.5a3 3 0 1 1-2.8 4" />
      <path strokeLinecap="round" d="M3 17h8.5a3 3 0 1 0-2.8 4" />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M6.5 15a4.5 4.5 0 0 1 .6-8.96A6 6 0 0 1 18.5 8.5 4 4 0 0 1 17.5 16.5h-11z" />
      <path strokeLinecap="round" d="M8 18.5 7 21M12 18.5l-1 2.5M16 18.5l-1 2.5" />
    </svg>
  ),
};

export function formatTime(iso: string | null): string {
  if (!iso) return "No reading yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `Read at ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ConditionPanel({ panel }: { panel: Panel }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{panel.label}</p>
        <span aria-hidden="true" className="text-muted">
          {ICONS[panel.key]}
        </span>
      </div>
      <p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">
        {panel.value}
        <span className="ml-1 text-lg font-normal text-muted">{panel.unit}</span>
      </p>
      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${LEVEL_PILL_CLASSES[panel.level]}`}
      >
        {panel.headline}
      </span>
      <p className="mt-3 text-sm text-secondary">{panel.detail}</p>
      <p className="mt-4 text-xs text-muted">{formatTime(panel.observedAt)}</p>
    </div>
  );
}
