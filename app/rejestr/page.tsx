"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, SectionTitle, Kpi } from "@/components/ui";
import { CASES } from "@/lib/data";
import { formatPLN, formatPct, formatDateShort } from "@/lib/format";
import { outcomeBadge } from "@/lib/labels";

export default function RegisterPage() {
  const [onlyRefund, setOnlyRefund] = useState(false);
  const rows = onlyRefund ? CASES.filter((c) => c.result.refundPending > 0) : CASES;

  const totalTax = CASES.reduce((s, c) => s + c.result.totalTax, 0);
  const totalRefund = CASES.reduce((s, c) => s + c.result.refundPending, 0);
  const totalBase = CASES.reduce((s, c) => s + c.document.grossAmount, 0);

  return (
    <div className="animate-fade-up">
      <SectionTitle
        eyebrow="Ewidencja"
        title="Rejestr WHT"
        description="Niemodyfikowalny zapis transakcji z pełnym śladem audytowym — podstawa do deklaracji i wniosków o zwrot."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Podstawa opodatkowania (suma)" value={formatPLN(totalBase)} />
        <Kpi label="Pobrany WHT (suma)" value={formatPLN(totalTax)} />
        <Kpi label="REFUND_PENDING (suma)" value={formatPLN(totalRefund)} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Transakcje WHT — 2025</CardTitle>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={onlyRefund}
              onChange={(e) => setOnlyRefund(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Tylko REFUND_PENDING
          </label>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
                <th className="px-5 py-2.5 font-medium">Transakcja</th>
                <th className="px-3 py-2.5 font-medium">Kontrahent</th>
                <th className="px-3 py-2.5 font-medium">Kategoria</th>
                <th className="px-3 py-2.5 text-right font-medium">Podstawa</th>
                <th className="px-3 py-2.5 text-right font-medium">Stawka</th>
                <th className="px-3 py-2.5 text-right font-medium">WHT</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => {
                const out = outcomeBadge(c.outcome);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{c.id}</div>
                      <div className="text-xs text-slate-400">{formatDateShort(c.document.paymentDate)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span>{c.vendor.flag}</span>
                        <span className="truncate">{c.vendor.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{c.classification.category}</td>
                    <td className="px-3 py-3 text-right tnum text-slate-700">{formatPLN(c.document.grossAmount)}</td>
                    <td className="px-3 py-3 text-right tnum text-slate-700">
                      {c.result.splitAbove
                        ? `${formatPct(c.result.splitBelow!.rate)} / ${formatPct(c.result.splitAbove.rate)}`
                        : formatPct(c.result.splitBelow?.rate ?? 0)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tnum text-slate-900">{formatPLN(c.result.totalTax)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge tone={out.tone}>{out.label}</Badge>
                        {c.result.refundPending > 0 && (
                          <span className="text-[11px] font-medium text-amber-600 tnum">
                            +{formatPLN(c.result.refundPending)} do zwrotu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/sprawa/${c.id}`} className="inline-flex text-slate-400 hover:text-brand-600">
                        <ExternalLink className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-emerald-500" />
          Każdy wpis zawiera niemodyfikowalny ślad: wersję reguły klasyfikacji, wersję stawki UPO, decyzję płatnika i znacznik czasu.
        </div>
      </Card>
    </div>
  );
}
