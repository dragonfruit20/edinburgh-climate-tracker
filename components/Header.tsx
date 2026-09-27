import Link from "next/link";
import type { City } from "@/lib/types";

type Page = "today" | "actions" | "how-its-checked";

const NAV: { href: string; label: string; page: Page }[] = [
  { href: "/", label: "Today", page: "today" },
  { href: "/actions", label: "All actions", page: "actions" },
  { href: "/how-its-checked", label: "How it's checked", page: "how-its-checked" },
];

export default function Header({ city, active }: { city: City; active: Page }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-start justify-between px-6 py-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">
            {city.name} climate tracker
          </h1>
          <p className="mt-1 text-zinc-600">{city.tagline}</p>
        </div>
        <nav className="mt-1 flex items-start gap-4 text-sm font-medium">
          {NAV.map((item) => {
            const isActive = item.page === active;
            return (
              <Link
                key={item.page}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "border-b-2 border-brand text-brand-strong"
                    : "border-b-2 border-transparent text-zinc-600 hover:text-brand-strong"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
