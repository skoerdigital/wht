"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ScrollText,
  FileCheck2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Kokpit", icon: LayoutDashboard },
  { href: "/skrzynka", label: "Skrzynka dokumentów", icon: Inbox },
  { href: "/rejestr", label: "Rejestr WHT", icon: ScrollText },
  { href: "/deklaracje", label: "Deklaracje i wnioski", icon: FileCheck2 },
  { href: "/kontrahenci", label: "Kontrahenci", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-900">WHT Compliance</div>
          <div className="text-[11px] text-slate-400">Podatek u źródła</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-brand-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-700">Rok podatkowy 2025</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Dane demonstracyjne</div>
        </div>
      </div>
    </aside>
  );
}
