"use client";

import { useMemo, useState } from "react";
import type { Action } from "@/lib/types";
import ActionCard from "./ActionCard";

export default function ActionBrowser({
  actions,
  categories,
}: {
  actions: Action[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions.filter((a) => {
      const matchesCategory = category === "All" || a.category === category;
      const matchesQuery =
        q === "" || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [actions, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions..."
          className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full px-3 py-1 text-sm font-semibold capitalize transition-colors ${
                category === c
                  ? "bg-brand text-white"
                  : "bg-brand-bg text-brand-strong hover:bg-brand-bg-hover"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtered.length} of {actions.length} actions
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted">No actions match that search.</p>
        )}
      </div>
    </div>
  );
}
