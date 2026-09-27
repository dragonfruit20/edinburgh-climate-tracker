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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "bg-brand text-white"
                  : "bg-brand/10 text-brand-strong hover:bg-brand/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {filtered.length} of {actions.length} actions
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-zinc-500">No actions match that search.</p>
        )}
      </div>
    </div>
  );
}
