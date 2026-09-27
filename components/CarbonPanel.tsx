import type { CarbonPanelData } from "@/lib/conditions";
import { formatTime, LEVEL_PILL_CLASSES } from "./ConditionPanel";

export default function CarbonPanel({ panel }: { panel: CarbonPanelData }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:col-span-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{panel.label}</p>
        <span aria-hidden="true" className="text-zinc-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </span>
      </div>
      <p className="mt-2 text-4xl font-semibold tabular-nums text-zinc-900">
        {panel.value}
        {panel.unit && <span className="ml-1 text-lg font-normal text-zinc-500">{panel.unit}</span>}
      </p>

      {panel.mix.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-700">
          {panel.mix.map((m) => (
            <li key={m.fuel}>
              <span className="font-semibold tabular-nums text-zinc-900">{Math.round(m.percent)}%</span> {m.fuel}
            </li>
          ))}
        </ul>
      )}

      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${LEVEL_PILL_CLASSES[panel.level]}`}
      >
        {panel.headline}
      </span>
      <p className="mt-3 text-sm text-zinc-600">{panel.explainer}</p>
      {panel.note && <p className="mt-1 text-sm text-zinc-600">{panel.note}</p>}
      {panel.cleanest && <p className="mt-3 text-sm font-semibold text-zinc-700">{panel.cleanest}</p>}

      <p className="mt-4 text-xs text-zinc-400">{formatTime(panel.observedAt)}</p>
    </div>
  );
}
