import cityData from "@/data/city.json";
import { actionIssues, flaggedActions, verifiedActions } from "@/lib/actions";
import type { City } from "@/lib/types";
import Header from "@/components/Header";

const city = cityData as City;

const CHECKS = [
  {
    name: "Schema check",
    description:
      "Does the entry have every required field, in the right shape — an id, category, summary, details, which conditions it applies to, at least one source, and a verification record?",
  },
  {
    name: "Spot check",
    description:
      "Does the linked source actually say what the entry claims — the right price, phone number, address or eligibility rule?",
  },
  {
    name: "Freshness check",
    description:
      "Is the information still current, or has the page changed, gone quiet, or become impossible to confirm since it was last checked?",
  },
];

const FEEDS = [
  {
    panel: "Heat",
    source: "Open-Meteo forecast API",
    detail: "Current and feels-like temperature, today's peak.",
  },
  {
    panel: "Air",
    source: "Open-Meteo air quality API",
    detail: "US AQI and PM2.5 from a global model.",
  },
  {
    panel: "Rain and flood",
    source: "Open-Meteo forecast API and flood API",
    detail: "Today's rain, plus river discharge vs. the long-term normal (GloFAS model).",
  },
  {
    panel: "Carbon emissions",
    source: "UK Carbon Intensity API (National Energy System Operator)",
    detail: "Edinburgh and GB carbon intensity, generation mix, and the next 24 hours forecast.",
  },
];

export default function HowItsChecked() {
  const total = verifiedActions.length + flaggedActions.length;

  return (
    <div className="flex min-h-full flex-col">
      <Header city={city} active="how-its-checked" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h2 className="font-heading text-2xl font-semibold text-zinc-900">How it&apos;s checked</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Every local action shown on this site was researched by AI, then checked against three
          rules before it went live. Nothing here is checked by AI at the moment you visit — the
          checks happen once, when the action is added.
        </p>

        <section className="mt-8">
          <h3 className="text-base font-semibold text-zinc-900">Results</h3>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Passed all checks" value={verifiedActions.length} tone="good" />
            <Stat label="Flagged" value={flaggedActions.length} tone="high" />
            <Stat label="Total researched" value={total} tone="unknown" />
          </div>
          {actionIssues.length > 0 && (
            <p className="mt-3 text-sm text-level-high-text">
              {actionIssues.length} entr{actionIssues.length === 1 ? "y" : "ies"} in the data files
              didn&apos;t match the required format and were left out — see the site&apos;s
              CLAUDE.md for the schema.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h3 className="text-base font-semibold text-zinc-900">The three checks</h3>
          <div className="mt-3 space-y-3">
            {CHECKS.map((c) => (
              <div key={c.name} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-zinc-900">{c.name}</p>
                <p className="mt-1 text-sm text-zinc-600">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-base font-semibold text-zinc-900">Where the live data comes from</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Panel</th>
                  <th className="px-4 py-2 font-medium">Source</th>
                  <th className="px-4 py-2 font-medium">What it gives us</th>
                </tr>
              </thead>
              <tbody>
                {FEEDS.map((f) => (
                  <tr key={f.panel} className="border-t border-zinc-200">
                    <td className="px-4 py-2 font-medium text-zinc-900">{f.panel}</td>
                    <td className="px-4 py-2 text-zinc-700">{f.source}</td>
                    <td className="px-4 py-2 text-zinc-600">{f.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            All four are free and need no sign-up. Readings are cached on the server (an hour for
            weather and air, six hours for the river signal, thirty minutes for carbon emissions)
            so the site stays fast.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-base font-semibold text-zinc-900">Flagged entries</h3>
          <p className="mt-2 text-sm text-zinc-600">
            These didn&apos;t pass every check, so they&apos;re listed here for transparency —
            never shown as advice on the main page.
          </p>
          <div className="mt-3 space-y-3">
            {flaggedActions.map((a) => (
              <div key={a.id} className="rounded-xl border border-level-high-border bg-level-high-bg p-4 shadow-sm">
                <p className="font-medium text-level-high-text">{a.title}</p>
                <p className="mt-1 text-sm text-zinc-700">{a.summary}</p>
                <p className="mt-2 text-sm font-medium text-level-high-text">Why it was flagged:</p>
                <p className="text-sm text-zinc-700">{a.verification.flag_reason}</p>
              </div>
            ))}
            {flaggedActions.length === 0 && (
              <p className="text-sm text-zinc-500">Nothing is currently flagged.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "good" | "high" | "unknown" }) {
  const classes = {
    good: "bg-level-good-bg text-level-good-text border-level-good-border",
    high: "bg-level-high-bg text-level-high-text border-level-high-border",
    unknown: "bg-level-unknown-bg text-level-unknown-text border-level-unknown-border",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${classes}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
