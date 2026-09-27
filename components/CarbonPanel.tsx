import type { CarbonPanelData } from "@/lib/conditions";
import { formatTime, LEVEL_CLASSES } from "./ConditionPanel";

export default function CarbonPanel({ panel }: { panel: CarbonPanelData }) {
  return (
    <div className={`rounded-2xl border p-6 shadow-sm sm:col-span-3 ${LEVEL_CLASSES[panel.level]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{panel.label}</p>
        <span aria-hidden="true" className="opacity-70">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </span>
      </div>
      <p className="mt-2 text-4xl font-semibold tabular-nums">
        {panel.value}
        {panel.unit && <span className="ml-1 text-lg font-normal opacity-80">{panel.unit}</span>}
      </p>

      {panel.mix.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {panel.mix.map((m) => (
            <li key={m.fuel}>
              <span className="font-semibold tabular-nums">{Math.round(m.percent)}%</span> {m.fuel}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-base font-semibold">{panel.headline}</p>
      <p className="mt-1 text-sm opacity-80">{panel.explainer}</p>
      {panel.note && <p className="mt-1 text-sm opacity-80">{panel.note}</p>}
      {panel.cleanest && <p className="mt-3 text-sm font-semibold">{panel.cleanest}</p>}

      <p className="mt-4 text-xs opacity-70">{formatTime(panel.observedAt)}</p>
    </div>
  );
}
