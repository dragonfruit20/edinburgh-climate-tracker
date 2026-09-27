import cityData from "@/data/city.json";
import { fetchAir, fetchCarbon, fetchCarbonForecast, fetchFlood, fetchWeather } from "@/lib/feeds";
import { activeConditions, airPanel, carbonPanel, heatPanel, rainPanel } from "@/lib/conditions";
import { todayActions, verifiedActions } from "@/lib/actions";
import type { City } from "@/lib/types";
import Header from "@/components/Header";
import ConditionPanel from "@/components/ConditionPanel";
import CarbonPanel from "@/components/CarbonPanel";
import ActionCard from "@/components/ActionCard";

const city = cityData as City;

export default async function Home() {
  const [weather, air, flood, carbonReading, carbonForecast] = await Promise.all([
    fetchWeather(city),
    fetchAir(city),
    fetchFlood(city),
    fetchCarbon(city),
    fetchCarbonForecast(city),
  ]);

  const panels = [heatPanel(weather), airPanel(air), rainPanel(weather, flood)];
  const active = activeConditions(panels);
  const today = todayActions(verifiedActions, active);
  const carbon = carbonPanel(carbonReading, carbonForecast, city);

  return (
    <div className="flex min-h-full flex-col">
      <Header city={city} active="today" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-3">
          {panels.map((panel) => (
            <ConditionPanel key={panel.key} panel={panel} />
          ))}
          <CarbonPanel panel={carbon} />
        </div>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-zinc-900">What to do today</h2>
          {today.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">
              Nothing urgent right now — conditions are calm. Browse everything on the{" "}
              <a href="/actions" className="text-brand-strong underline hover:text-brand">
                All actions
              </a>{" "}
              page.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {today.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  matched={action.when.filter((w) => w !== "any" && active.includes(w))}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
