"use client";

import { useState } from "react";
import { Download, FileCheck2, CircleCheckBig, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, Button, SectionTitle } from "@/components/ui";
import { CASES, TENANT } from "@/lib/data";
import { formatPLN } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DecRow {
  uid: string;
  type: "IFT-2R" | "CIT-10Z" | "WH-WCZ" | "WH-WCP";
  description: string;
  status: "Gotowe" | "Wersja robocza" | "Nie dotyczy";
  caseId: string;
  vendor: string;
  flag: string;
  amount: number;
  tax: number;
}

const decs: DecRow[] = CASES.flatMap((c) =>
  c.declarations
    .filter((d) => d.status !== "Nie dotyczy")
    .map((d) => ({
      uid: `${c.id}-${d.type}`,
      type: d.type,
      description: d.description,
      status: d.status,
      caseId: c.id,
      vendor: c.vendor.name,
      flag: c.vendor.flag,
      amount: c.document.grossAmount,
      tax: c.result.totalTax,
    })),
);

function mockXml(d: DecRow): string {
  const root = d.type.replace(/-/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<Deklaracja schema="${d.type}_v1" xmlns="http://crd.gov.pl/wzor/2025/...">
  <Naglowek>
    <KodFormularza>${d.type}</KodFormularza>
    <RokPodatkowy>${TENANT.taxYear}</RokPodatkowy>
  </Naglowek>
  <Platnik>
    <PelnaNazwa>${TENANT.name}</PelnaNazwa>
    <NIP>${TENANT.nip.replace(/\D/g, "")}</NIP>
  </Platnik>
  <Podatnik>
    <Nazwa>${d.vendor}</Nazwa>
    <KrajRezydencji>${d.flag}</KrajRezydencji>
  </Podatnik>
  <Naleznosc>
    <Podstawa>${d.amount}.00</Podstawa>
    <PobranyPodatek>${d.tax}.00</PobranyPodatek>
  </Naleznosc>
</${"Deklaracja"}>`;
}

const typeTone: Record<DecRow["type"], "brand" | "info" | "warning"> = {
  "IFT-2R": "info",
  "CIT-10Z": "brand",
  "WH-WCZ": "warning",
  "WH-WCP": "warning",
};

export default function DeclarationsPage() {
  const [sel, setSel] = useState<DecRow>(decs[0]);

  return (
    <div className="animate-fade-up">
      <SectionTitle
        eyebrow="Raportowanie"
        title="Deklaracje i wnioski"
        description="Pliki XML generowane automatycznie ze schem Ministerstwa Finansów na podstawie rejestru WHT — gotowe do wysyłki."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Lista */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Wygenerowane dokumenty</CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {decs.map((d) => (
              <button
                key={d.uid}
                onClick={() => setSel(d)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors",
                  sel.uid === d.uid ? "bg-brand-50" : "hover:bg-slate-50",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{d.type}</span>
                    <Badge tone={typeTone[d.type]}>{d.flag}</Badge>
                  </div>
                  <div className="truncate text-xs text-slate-500">{d.vendor}</div>
                </div>
                <Badge tone={d.status === "Gotowe" ? "success" : "warning"}>{d.status}</Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Podgląd */}
        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>{sel.type}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">{sel.description}</p>
            </div>
            <Button size="sm" variant="outline">
              <Download className="size-4" /> Pobierz XML
            </Button>
          </CardHeader>

          <div className="px-5 pb-5">
            <div className="mb-3 flex flex-wrap gap-3">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-[11px] text-slate-400">Kontrahent</div>
                <div className="text-sm font-medium text-slate-800">
                  {sel.flag} {sel.vendor}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-[11px] text-slate-400">Podstawa</div>
                <div className="text-sm font-medium text-slate-800 tnum">{formatPLN(sel.amount)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-[11px] text-slate-400">Pobrany WHT</div>
                <div className="text-sm font-medium text-slate-800 tnum">{formatPLN(sel.tax)}</div>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <CircleCheckBig className="size-4" />
              Walidacja względem schemy MF ({sel.type}) — <span className="font-semibold">poprawna</span>.
            </div>

            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
              <code>{mockXml(sel)}</code>
            </pre>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <FileCheck2 className="size-4" />
              {sel.type.startsWith("WH-")
                ? "Wniosek o zwrot nadpłaconego podatku (art. 28b CIT) — z checklistą załączników: CFR, potwierdzenia przelewów, oświadczenie o rzeczywistej działalności."
                : "Plik gotowy do wysyłki przez bramkę e-Deklaracje."}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
