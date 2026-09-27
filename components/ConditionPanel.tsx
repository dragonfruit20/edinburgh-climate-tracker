import type { ReactNode } from "react";
import type { Level, Panel } from "@/lib/conditions";

export const LEVEL_CLASSES: Record<Level, string> = {
  good: "bg-level-good-bg text-level-good-text border-level-good-border",
  moderate: "bg-level-moderate-bg text-level-moderate-text border-level-moderate-border",
  high: "bg-level-high-bg text-level-high-text border-level-high-border",
  extreme: "bg-level-extreme-bg text-level-extreme-text border-level-extreme-border",
  unknown: "bg-level-unknown-bg text-level-unknown-text border-level-unknown-border",
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
    <div className={`rounded-2xl border p-6 shadow-sm ${LEVEL_CLASSES[panel.level]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{panel.label}</p>
        <span aria-hidden="true" className="opacity-70">
          {ICONS[panel.key]}
        </span>
      </div>
      <p className="mt-2 text-4xl font-semibold tabular-nums">
        {panel.value}
        <span className="ml-1 text-lg font-normal opacity-80">{panel.unit}</span>
      </p>
      <p className="mt-3 text-base font-semibold">{panel.headline}</p>
      <p className="mt-1 text-sm opacity-80">{panel.detail}</p>
      <p className="mt-4 text-xs opacity-70">{formatTime(panel.observedAt)}</p>
    </div>
  );
}
