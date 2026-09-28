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
    <header className="border-b border-surface-border bg-surface">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-[2.4375rem] leading-tight font-semibold tracking-tight text-foreground">
            {city.name} climate tracker
          </h1>
          <p className="mt-1 text-secondary">{city.tagline}</p>
        </div>
        <nav className="flex shrink-0 items-start gap-4 text-sm font-medium sm:mt-1">
          {NAV.map((item) => {
            const isActive = item.page === active;
            return (
              <Link
                key={item.page}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "whitespace-nowrap text-brand-strong underline decoration-2 underline-offset-4"
                    : "whitespace-nowrap text-secondary hover:text-brand-strong"
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
