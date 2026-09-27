import type { Action, Condition } from "@/lib/types";
import { CONDITION_LABELS } from "@/lib/conditions";

export default function ActionCard({
  action,
  matched = [],
}: {
  action: Action;
  matched?: Condition[];
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-strong capitalize">
          {action.category}
        </span>
        {matched.map((c) => (
          <span
            key={c}
            className="rounded-full bg-level-high-bg px-2.5 py-0.5 text-xs font-medium text-level-high-text"
          >
            Matches: {CONDITION_LABELS[c]}
          </span>
        ))}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{action.title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{action.summary}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
        {action.details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {action.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 underline hover:text-brand-strong"
          >
            {s.title}
          </a>
        ))}
      </div>
    </div>
  );
}
