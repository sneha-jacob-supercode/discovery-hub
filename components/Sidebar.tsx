"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Clients", icon: Users, match: (path: string) => path === "/" },
  {
    href: "/questionnaires",
    label: "Questionnaires",
    icon: FileText,
    match: (path: string) => path.startsWith("/questionnaires"),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col bg-surface px-4 py-6 md:sticky md:top-0 md:flex md:h-dvh md:w-56">
      <p className="px-3 text-sm font-semibold tracking-tight text-ink">Client Intake</p>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-line text-ink" : "text-ink-muted hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
