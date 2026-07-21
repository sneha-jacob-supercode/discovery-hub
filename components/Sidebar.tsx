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
      <div className="flex items-center gap-2 px-3">
        <svg width="20" height="18" viewBox="0 0 48 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-ink" aria-hidden="true">
          <path d="M0.376683 19.6428L11.6525 0.820318C11.7265 0.695786 11.9239 0.747558 11.9239 0.890279V41.1098C11.9239 41.2525 11.7265 41.3043 11.6525 41.1797L0.376683 22.3559C-0.125561 21.5163 -0.125561 20.4823 0.376683 19.6428Z" fill="currentColor" />
          <path d="M34.4956 42H12.8118C12.6694 41.9986 12.6178 41.8026 12.742 41.7291L47.4878 21.0201C47.612 20.9466 47.7502 21.0892 47.679 21.2175L36.8392 40.6038C36.3562 41.4683 35.4629 42 34.4956 42Z" fill="currentColor" />
          <path d="M36.8387 1.39492L47.679 20.7826C47.7502 20.9108 47.612 21.0535 47.4878 20.98L12.742 0.269476C12.6178 0.195983 12.6694 2.9215e-06 12.8118 2.9215e-06H34.4965C35.4638 -0.00143811 36.3572 0.530302 36.8401 1.39492H36.8387Z" fill="currentColor" />
        </svg>
        <p className="text-sm font-semibold tracking-tight text-ink">Questionnaire</p>
      </div>

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
