import cityData from "@/data/city.json";
import { categoriesOf, verifiedActions } from "@/lib/actions";
import type { City } from "@/lib/types";
import Header from "@/components/Header";
import ActionBrowser from "@/components/ActionBrowser";

const city = cityData as City;

export default function AllActions() {
  const categories = categoriesOf(verifiedActions);

  return (
    <div className="flex min-h-full flex-col">
      <Header city={city} active="actions" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h2 className="font-heading text-2xl font-semibold text-zinc-900">All actions</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Every verified local climate action for {city.name}, searchable and filterable by
          category.
        </p>
        <div className="mt-6">
          <ActionBrowser actions={verifiedActions} categories={categories} />
        </div>
      </main>
    </div>
  );
}
