"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  {
    title: "Overview",
    items: [
      { label: "Getting Started", href: "/docs" },
      { label: "Authentication", href: "/docs/authentication" },
      { label: "Errors", href: "/docs/errors" },
    ],
  },
  {
    title: "Endpoints",
    items: [
      { label: "Departures", href: "/docs/endpoints/departures" },
      { label: "Nearby Stops", href: "/docs/endpoints/nearby" },
      { label: "Stop Search", href: "/docs/endpoints/stops" },
      { label: "Transit Score", href: "/docs/endpoints/score" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Why TransitKit?", href: "/docs/why-transitkit" },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-8">
      {nav.map((section) => (
        <div key={section.title}>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            {section.title}
          </h4>
          <ul className="flex flex-col gap-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile docs nav toggle */}
      <div className="sticky top-16 z-40 border-b border-border bg-background px-6 py-3 lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Documentation Menu
        </button>
        {open && (
          <div className="mt-4 pb-2">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-border p-6 lg:block">
        <SidebarNav />
      </aside>
    </>
  );
}
