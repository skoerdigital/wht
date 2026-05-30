"use client";

import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { CASES, TENANT } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div>
        <div className="text-sm font-semibold text-slate-900">{TENANT.name}</div>
        <div className="text-xs text-slate-400">
          Płatnik · NIP {TENANT.nip} · rok {TENANT.taxYear}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Scenario quick-jump */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="size-4 text-brand-500" />
            Scenariusze demo
            <ChevronDown className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1.5 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {CASES.map((c) => (
                <Link
                  key={c.id}
                  href={`/sprawa/${c.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-brand-700">
                    {c.scenario}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">{c.scenarioLabel}</span>
                    <span className="block truncate text-xs text-slate-400">{c.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <span className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          Demo
        </span>

        <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          AK
        </div>
      </div>
    </header>
  );
}
