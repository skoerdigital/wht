"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CloudDownload,
  FileUp,
  Network,
  Plus,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, Button, ChannelPill, SectionTitle } from "@/components/ui";
import { CASES, INBOX_EXTRA } from "@/lib/data";
import type { Channel } from "@/lib/types";
import { formatPLN, formatDateShort } from "@/lib/format";
import { outcomeBadge } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  channel: Channel;
  flag: string;
  vendor: string;
  title: string;
  amount: number;
  date: string;
  href?: string;
  badge: { tone: "neutral" | "brand" | "success" | "warning" | "danger" | "info"; label: string };
};

const rows: Row[] = [
  ...CASES.map((c) => ({
    id: c.id,
    channel: c.channel,
    flag: c.vendor.flag,
    vendor: c.vendor.name,
    title: `${c.document.kind} · ${c.document.paymentTitle}`,
    amount: c.document.grossAmount,
    date: c.document.issueDate,
    href: `/sprawa/${c.id}`,
    badge: c.needsDecision
      ? { tone: "warning" as const, label: "Wymaga decyzji" }
      : outcomeBadge(c.outcome),
  })),
  ...INBOX_EXTRA.map((e) => ({
    id: e.id,
    channel: e.channel,
    flag: e.flag,
    vendor: e.vendor,
    title: e.title,
    amount: e.amount,
    date: e.date,
    badge:
      e.verdict === "Nie podlega WHT"
        ? { tone: "neutral" as const, label: "Nie podlega WHT" }
        : { tone: "info" as const, label: "W analizie" },
  })),
].sort((a, b) => +new Date(b.date) - +new Date(a.date));

const filters: { key: Channel | "all"; label: string }[] = [
  { key: "all", label: "Wszystkie" },
  { key: "ERP", label: "ERP" },
  { key: "KSeF", label: "KSeF" },
  { key: "Upload", label: "Upload" },
];

const channels: { key: Channel; icon: typeof FileUp; title: string; desc: string }[] = [
  { key: "Upload", icon: FileUp, title: "Prześlij plik", desc: "PDF, XML lub wyciąg CSV/XLSX z systemu księgowego" },
  { key: "ERP", icon: CloudDownload, title: "Pobierz z ERP", desc: "Synchronizacja faktur zakupowych z systemu księgowego" },
  { key: "KSeF", icon: Network, title: "Synchronizuj KSeF", desc: "Pobranie faktur ustrukturyzowanych z KSeF (FA(3))" },
];

export default function InboxPage() {
  const router = useRouter();
  const [active, setActive] = useState<Channel | "all">("all");
  const [modal, setModal] = useState(false);
  const [ingesting, setIngesting] = useState<Channel | null>(null);
  const [done, setDone] = useState(false);

  const visible = active === "all" ? rows : rows.filter((r) => r.channel === active);

  function runIngest(ch: Channel) {
    setIngesting(ch);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        setModal(false);
        setIngesting(null);
        setDone(false);
        router.push("/sprawa/WHT-2025-0142");
      }, 900);
    }, 1500);
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        eyebrow="Ingestion"
        title="Skrzynka dokumentów"
        description="Dokumenty wpływają trzema kanałami. System automatycznie wykrywa płatności podlegające WHT i pomija pozostałe."
        right={
          <Button onClick={() => setModal(true)}>
            <Plus className="size-4" />
            Nowy dokument
          </Button>
        }
      />

      <div className="mb-4 flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active === f.key ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Dokumenty przychodzące</CardTitle>
          <span className="text-xs text-slate-400">{visible.length} pozycji</span>
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {visible.map((r) => {
            const inner = (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                  {r.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{r.vendor}</div>
                  <div className="truncate text-xs text-slate-500">{r.title}</div>
                </div>
                <div className="hidden sm:block">
                  <ChannelPill channel={r.channel} />
                </div>
                <div className="hidden w-32 text-right text-xs text-slate-400 md:block">
                  {formatDateShort(r.date)}
                </div>
                <div className="hidden w-40 text-right lg:block">
                  <Badge tone={r.badge.tone}>{r.badge.label}</Badge>
                </div>
                <div className="w-28 text-right text-sm font-semibold text-slate-900 tnum">{formatPLN(r.amount)}</div>
                <ChevronRight className={cn("size-4 shrink-0", r.href ? "text-slate-300" : "text-transparent")} />
              </div>
            );
            return r.href ? (
              <a key={r.id} href={r.href} className="block transition-colors hover:bg-slate-50">
                {inner}
              </a>
            ) : (
              <div key={r.id} className="opacity-70">
                {inner}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal: nowy dokument */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !ingesting && setModal(false)} />
          <Card className="relative z-10 w-full max-w-lg animate-fade-up p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <CardTitle>Dodaj dokument</CardTitle>
              {!ingesting && (
                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-5" />
                </button>
              )}
            </div>

            <div className="p-5">
              {ingesting ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  {done ? (
                    <>
                      <CheckCircle2 className="size-10 text-emerald-500" />
                      <div className="text-sm font-medium text-slate-800">Dokument pobrany i sklasyfikowany</div>
                      <div className="text-xs text-slate-500">Wykryto płatność podlegającą WHT — otwieram sprawę…</div>
                    </>
                  ) : (
                    <>
                      <Loader2 className="size-10 animate-spin text-brand-500" />
                      <div className="text-sm font-medium text-slate-800">
                        {ingesting === "ERP" && "Pobieranie z systemu księgowego…"}
                        {ingesting === "KSeF" && "Synchronizacja z KSeF…"}
                        {ingesting === "Upload" && "Przetwarzanie pliku…"}
                      </div>
                      <div className="text-xs text-slate-500">Ekstrakcja danych i wstępna klasyfikacja</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {channels.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.key}
                        onClick={() => runIngest(c.key)}
                        className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.desc}</div>
                        </div>
                        <ChevronRight className="size-4 text-slate-300" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
