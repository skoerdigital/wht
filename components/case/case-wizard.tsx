"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Building2,
  BrainCircuit,
  FolderCheck,
  Scale,
  Gauge,
  GitBranch,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Quote,
} from "lucide-react";
import { Card, Badge, Button, Confidence, Progress, Dot } from "@/components/ui";
import type { WhtCase, DecisionOption } from "@/lib/types";
import { formatPLN, formatPct, formatDate } from "@/lib/format";
import { outcomeBadge, vaultStatusBadge } from "@/lib/labels";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "doc", label: "Dokument", icon: FileText },
  { key: "vendor", label: "Kontrahent", icon: Building2 },
  { key: "class", label: "Klasyfikacja", icon: BrainCircuit },
  { key: "vault", label: "Należyta staranność", icon: FolderCheck },
  { key: "rate", label: "Stawka i UPO", icon: Scale },
  { key: "threshold", label: "Próg 2 mln", icon: Gauge },
  { key: "decision", label: "Decyzja", icon: GitBranch },
  { key: "summary", label: "Podsumowanie", icon: CheckCircle2 },
] as const;

export function CaseWizard({ data }: { data: WhtCase }) {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [selected, setSelected] = useState<string>(
    data.decisionOptions.find((o) => o.recommended)?.key ?? data.decisionOptions[0]?.key ?? "",
  );
  const [confirmed, setConfirmed] = useState(false);

  // Deep-link do konkretnego kroku (?krok=1..8) — przydatne w prowadzonym demo.
  useEffect(() => {
    const k = Number(new URLSearchParams(window.location.search).get("krok"));
    if (k >= 1 && k <= STEPS.length) {
      setStep(k - 1);
      setMaxReached(k - 1);
    }
  }, []);

  const out = outcomeBadge(data.outcome);

  function go(n: number) {
    const next = Math.max(0, Math.min(STEPS.length - 1, n));
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  }

  return (
    <div className="animate-fade-up">
      {/* Back + header */}
      <Link href="/skrzynka" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Skrzynka dokumentów
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
            {data.vendor.flag}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{data.title}</h1>
            <div className="text-sm text-slate-500">
              {data.id} · {data.document.kind} · {formatPLN(data.document.grossAmount)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="brand">Scenariusz {data.scenario} · {data.scenarioLabel}</Badge>
          <Badge tone={out.tone}>{out.label}</Badge>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Stepper */}
        <ol className="hidden lg:block">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const state = i === step ? "active" : i < step || i <= maxReached ? "done" : "todo";
            return (
              <li key={s.key} className="relative pb-1">
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-[calc(100%-16px)] w-px",
                      i < step ? "bg-brand-300" : "bg-slate-200",
                    )}
                  />
                )}
                <button
                  onClick={() => i <= maxReached && go(i)}
                  disabled={i > maxReached}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    state === "active" ? "bg-brand-50" : "hover:bg-slate-50",
                    i > maxReached && "cursor-not-allowed opacity-50 hover:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      state === "active" && "border-brand-600 bg-brand-600 text-white",
                      state === "done" && "border-brand-300 bg-white text-brand-600",
                      state === "todo" && "border-slate-200 bg-white text-slate-400",
                    )}
                  >
                    {i < step || (i <= maxReached && i !== step) ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      state === "active" ? "text-brand-700" : state === "done" ? "text-slate-700" : "text-slate-400",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Content */}
        <div>
          <Card className="min-h-[420px] p-6">
            <div key={step} className="animate-fade-up">
              <StepHeader index={step} />
              <div className="mt-5">
                {step === 0 && <StepDoc data={data} />}
                {step === 1 && <StepVendor data={data} />}
                {step === 2 && <StepClass data={data} />}
                {step === 3 && <StepVault data={data} />}
                {step === 4 && <StepRate data={data} />}
                {step === 5 && <StepThreshold data={data} />}
                {step === 6 && (
                  <StepDecision
                    data={data}
                    selected={selected}
                    setSelected={setSelected}
                    confirmed={confirmed}
                    setConfirmed={setConfirmed}
                  />
                )}
                {step === 7 && <StepSummary data={data} />}
              </div>
            </div>
          </Card>

          {/* Footer nav */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => go(step - 1)} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Wstecz
            </Button>
            <span className="text-xs text-slate-400">
              Krok {step + 1} z {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => go(step + 1)}>
                Dalej <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Link href="/deklaracje">
                <Button variant="secondary">
                  Przejdź do deklaracji <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────── */
function StepHeader({ index }: { index: number }) {
  const titles = [
    ["Dokument źródłowy", "Dane wyekstrahowane z dokumentu i kanał pochodzenia."],
    ["Kontrahent i rezydencja", "Status nierezydenta oraz powiązania kapitałowe."],
    ["Klasyfikacja płatności", "Hybryda reguł i analizy AI z podstawą prawną."],
    ["Należyta staranność i dokumenty", "Weryfikacja dokumentów warunkujących preferencje."],
    ["Stawka i umowa o unikaniu (UPO)", "Dobór najkorzystniejszej dopuszczalnej stawki."],
    ["Próg 2 mln PLN — Pay & Refund", "Licznik wypłat i mechanizm obowiązkowego poboru."],
    ["Decyzja płatnika", "Wybór ścieżki postępowania i zatwierdzenie."],
    ["Podsumowanie i rozliczenie", "Wynik operacji, rejestr WHT i wygenerowane dokumenty."],
  ];
  const [t, d] = titles[index];
  const Icon = STEPS[index].icon;
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{t}</h2>
        <p className="text-sm text-slate-500">{d}</p>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className={cn("mt-0.5 text-sm text-slate-800", mono && "tnum")}>{value}</dd>
    </div>
  );
}

function InfoRow({ tone, children }: { tone: "info" | "success" | "warning" | "danger" | "brand"; children: React.ReactNode }) {
  const map = {
    info: "bg-sky-50 text-sky-800 ring-sky-200",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    warning: "bg-amber-50 text-amber-800 ring-amber-200",
    danger: "bg-red-50 text-red-800 ring-red-200",
    brand: "bg-brand-50 text-brand-800 ring-brand-200",
  };
  return (
    <div className={cn("rounded-lg px-4 py-3 text-sm ring-1 ring-inset", map[tone])}>{children}</div>
  );
}

/* ── Step 1: Document ─────────────────────────────────────────────── */
function StepDoc({ data }: { data: WhtCase }) {
  const d = data.document;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="neutral">{d.kind}</Badge>
          <Badge tone="brand">
            <Dot tone="brand" /> Kanał: {data.channel}
          </Badge>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Numer dokumentu" value={d.number} />
          <Field label="Data wystawienia" value={formatDate(d.issueDate)} />
          <Field label="Data płatności" value={formatDate(d.paymentDate)} />
          <Field label="Waluta" value={d.currency} />
          <div className="col-span-2">
            <Field label="Tytuł płatności" value={d.paymentTitle} />
          </div>
          <div className="col-span-2">
            <Field label="Opis pozycji" value={d.lineDescription} />
          </div>
          <Field label="Rachunek odbiorcy (IBAN)" value={d.iban} mono />
        </dl>
      </div>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">
        <div className="text-xs font-medium text-slate-400">Kwota dokumentu (brutto)</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 tnum">
          {formatPLN(d.grossAmount)}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="size-4 text-emerald-500" />
          Dane zweryfikowane automatycznie po ingest.
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <FileText className="size-4 text-slate-400" />
          Oryginał zarchiwizowany (hash dokumentu zapisany).
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Vendor ───────────────────────────────────────────────── */
function StepVendor({ data }: { data: WhtCase }) {
  const v = data.vendor;
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Nazwa" value={v.name} />
          <Field label="Kraj rezydencji" value={`${v.flag} ${v.countryName}`} />
          <Field label="Identyfikator podatkowy" value={v.taxId} mono />
          <Field
            label="Podmiot powiązany"
            value={v.isRelated ? <Badge tone="warning">Tak</Badge> : <Badge tone="neutral">Nie</Badge>}
          />
        </dl>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 text-xs font-medium text-slate-400">Pewność wykrycia rezydencji</div>
          <Confidence value={v.residencyConfidence} />
          <ul className="mt-3 space-y-1.5">
            {v.residencySignals.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <InfoRow tone={v.isRelated ? "warning" : "info"}>
        <span className="font-medium">{v.relationNote}</span>{" "}
        {v.isRelated
          ? "Mechanizm Pay & Refund (próg 2 mln PLN) jest aktywny."
          : "Próg 2 mln PLN nie ma zastosowania."}
      </InfoRow>
    </div>
  );
}

/* ── Step 3: Classification (hybrid rules + AI) ───────────────────── */
function StepClass({ data }: { data: WhtCase }) {
  const c = data.classification;
  const [aiRun, setAiRun] = useState(false);
  const [loading, setLoading] = useState(false);

  function run() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAiRun(true);
    }, 1200);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400">Kategoria</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{c.category}</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400">Stawka ustawowa</div>
          <div className="mt-1 text-sm font-semibold text-slate-900 tnum">{formatPct(c.statutoryRate)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400">Podlega WHT</div>
          <div className="mt-1">
            <Badge tone={c.subjectToWht ? "warning" : "neutral"}>{c.subjectToWht ? "Tak" : "Nie"}</Badge>
          </div>
        </div>
      </div>

      {/* Warstwa reguł */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="flex size-5 items-center justify-center rounded bg-slate-100 text-[10px]">1</span>
          Warstwa reguł deterministycznych
        </div>
        <p className="text-sm text-slate-700">{c.ruleMatch}</p>
      </div>

      {/* Warstwa AI */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <Sparkles className="size-4" /> Warstwa AI · interpretacja kontekstowa
          </div>
          {aiRun && <Confidence value={c.confidence} />}
        </div>

        {!aiRun ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Uruchom analizę AI, aby uzyskać uzasadnienie i podstawę prawną dla spraw nieoczywistych.
            </p>
            <Button size="sm" onClick={run} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analizuję…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Uruchom analizę
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="animate-fade-up space-y-3">
            <p className="text-sm leading-relaxed text-slate-700">{c.aiReasoning}</p>
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500">Cytowana podstawa prawna</div>
              <ul className="space-y-1.5">
                {c.citations.map((cit) => (
                  <li key={cit.ref} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-inset ring-slate-200">
                    <Quote className="mt-0.5 size-3.5 shrink-0 text-brand-400" />
                    <span className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">{cit.ref}</span> — {cit.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 4: Vault / due diligence ────────────────────────────────── */
function StepVault({ data }: { data: WhtCase }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {data.vault.map((doc) => {
          const b = vaultStatusBadge(doc.status);
          return (
            <div
              key={doc.type}
              className={cn(
                "rounded-xl border p-4",
                doc.status === "missing" ? "border-red-200 bg-red-50/40" : "border-slate-200",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{doc.label}</span>
                <Badge tone={b.tone}>{b.label}</Badge>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{doc.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Należyta staranność (zawsze wymagana)
        </div>
        <ul className="space-y-2">
          {data.dueDiligence.map((dd) => (
            <li key={dd.item} className="flex items-center gap-2 text-sm">
              {dd.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              )}
              <span className={dd.done ? "text-slate-700" : "text-amber-700"}>{dd.item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Step 5: Rate / treaty ────────────────────────────────────────── */
function StepRate({ data }: { data: WhtCase }) {
  const t = data.treaty;
  const c = data.classification;
  const blocked = t.preferentialRate === null;
  return (
    <div className="space-y-5">
      <div className="flex items-stretch gap-3">
        <div className="flex-1 rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-xs font-medium text-slate-400">Stawka ustawowa</div>
          <div className="mt-1 text-2xl font-semibold text-slate-400 line-through tnum">{formatPct(c.statutoryRate)}</div>
        </div>
        <div className="flex items-center text-slate-300">
          <ArrowRight className="size-5" />
        </div>
        <div
          className={cn(
            "flex-1 rounded-xl border-2 p-4 text-center",
            blocked ? "border-red-300 bg-red-50/40" : "border-emerald-300 bg-emerald-50/40",
          )}
        >
          <div className="text-xs font-medium text-slate-500">
            {blocked ? "Preferencja zablokowana" : "Stawka po preferencji"}
          </div>
          <div className={cn("mt-1 text-2xl font-semibold tnum", blocked ? "text-red-600" : "text-emerald-600")}>
            {blocked ? formatPct(c.statutoryRate) : formatPct(t.preferentialRate ?? 0)}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="Podstawa preferencji" value={t.basis} />
        <Field
          label="Warunki spełnione"
          value={t.conditionsMet ? <Badge tone="success">Tak</Badge> : <Badge tone="danger">Nie</Badge>}
        />
      </dl>

      <InfoRow tone={blocked ? "danger" : "success"}>{t.note}</InfoRow>
    </div>
  );
}

/* ── Step 6: Threshold / Pay & Refund ─────────────────────────────── */
function StepThreshold({ data }: { data: WhtCase }) {
  const th = data.threshold;
  const r = data.result;
  const sum = data.document.grossAmount + th.priorYtd;
  const pct = (sum / th.limit) * 100;
  const crossed = th.active && sum > th.limit;

  if (!th.active) {
    return (
      <div className="space-y-5">
        <InfoRow tone="info">
          Próg 2 mln PLN <span className="font-semibold">nieaktywny</span> — {data.vendor.relationNote.toLowerCase()}
        </InfoRow>
        <CalcPanel data={data} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Licznik */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Roczny licznik wypłat — {data.title}</span>
          <span className="tnum text-slate-500">
            {formatPLN(sum)} / {formatPLN(th.limit)}
          </span>
        </div>
        <Progress value={pct} tone={crossed ? "danger" : pct > 75 ? "warning" : "brand"} />
        {crossed ? (
          <div className="mt-2 text-xs font-medium text-red-600">
            Przekroczenie o {formatPLN(sum - th.limit)} — nadwyżka objęta obowiązkowym poborem (Pay & Refund).
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-500">Poniżej progu — preferencja stosowana do całości.</div>
        )}
      </div>

      {crossed && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Podział kwoty</div>
          <div className="flex h-10 overflow-hidden rounded-lg">
            <div
              className="flex items-center justify-center bg-brand-600 text-xs font-medium text-white"
              style={{ width: `${(r.splitBelow!.base / data.document.grossAmount) * 100}%` }}
            >
              do 2 mln
            </div>
            <div
              className="flex items-center justify-center bg-amber-500 text-xs font-medium text-white"
              style={{ width: `${(r.splitAbove!.base / data.document.grossAmount) * 100}%` }}
            >
              nadwyżka
            </div>
          </div>
        </div>
      )}

      <CalcPanel data={data} />
    </div>
  );
}

function CalcPanel({ data }: { data: WhtCase }) {
  const r = data.result;
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Kalkulacja podatku
      </div>
      <div className="divide-y divide-slate-100">
        {r.splitBelow && (
          <CalcRow
            label={data.threshold.active && r.splitAbove ? "Część do 2 mln PLN" : "Podstawa"}
            base={r.splitBelow.base}
            rate={r.splitBelow.rate}
            tax={r.splitBelow.tax}
            tone="brand"
          />
        )}
        {r.splitAbove && (
          <CalcRow label="Nadwyżka ponad 2 mln PLN" base={r.splitAbove.base} rate={r.splitAbove.rate} tax={r.splitAbove.tax} tone="warning" />
        )}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">Podatek łącznie</span>
          <span className="text-base font-semibold text-slate-900 tnum">{formatPLN(r.totalTax)}</span>
        </div>
      </div>
      {r.refundPending > 0 && (
        <div className="flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <AlertTriangle className="size-4" />
          <span>
            <span className="font-semibold">REFUND_PENDING:</span> {formatPLN(r.refundPending)} do odzyskania (różnica stawek od
            nadwyżki).
          </span>
        </div>
      )}
    </div>
  );
}

function CalcRow({
  label,
  base,
  rate,
  tax,
  tone,
}: {
  label: string;
  base: number;
  rate: number;
  tax: number;
  tone: "brand" | "warning";
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <Dot tone={tone} />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-3 text-sm tnum">
        <span className="text-slate-500">{formatPLN(base)}</span>
        <span className="text-slate-300">×</span>
        <span className="font-medium text-slate-700">{formatPct(rate)}</span>
        <span className="text-slate-300">=</span>
        <span className="w-24 text-right font-semibold text-slate-900">{formatPLN(tax)}</span>
      </div>
    </div>
  );
}

/* ── Step 7: Decision ─────────────────────────────────────────────── */
function StepDecision({
  data,
  selected,
  setSelected,
  confirmed,
  setConfirmed,
}: {
  data: WhtCase;
  selected: string;
  setSelected: (k: string) => void;
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
}) {
  const toneRing = {
    hold: "border-sky-300 bg-sky-50/40",
    act: "border-emerald-300 bg-emerald-50/40",
    pay: "border-amber-300 bg-amber-50/40",
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {data.decisionOptions.length > 1
          ? "Wybierz ścieżkę postępowania. System przygotuje odpowiednie dokumenty i zapisy."
          : "Potwierdź rozliczenie. System zapisze decyzję i przygotuje dokumenty."}
      </p>

      <div className="space-y-2.5">
        {data.decisionOptions.map((o: DecisionOption) => {
          const active = selected === o.key;
          return (
            <button
              key={o.key}
              onClick={() => {
                setSelected(o.key);
                setConfirmed(false);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                active ? toneRing[o.tone] : "border-slate-200 hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  active ? "border-brand-600 bg-brand-600" : "border-slate-300",
                )}
              >
                {active && <Check className="size-3 text-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{o.title}</span>
                  {o.recommended && <Badge tone="success">Rekomendacja</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{o.description}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">→ {o.consequence}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ShieldCheck className="size-4 text-brand-500" />
          Zatwierdzenie wymaga akceptacji drugiej osoby (zasada 4 oczu).
        </div>
        {confirmed ? (
          <Badge tone="success">
            <Check className="size-3.5" /> Zatwierdzono
          </Badge>
        ) : (
          <Button size="sm" onClick={() => setConfirmed(true)}>
            Zatwierdź decyzję
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Step 8: Summary ──────────────────────────────────────────────── */
function StepSummary({ data }: { data: WhtCase }) {
  const r = data.result;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400">Zastosowana stawka</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{r.appliedRateLabel}</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400">Pobrany WHT</div>
          <div className="mt-1 text-sm font-semibold text-slate-900 tnum">{formatPLN(r.totalTax)}</div>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4">
          <div className="text-xs font-medium text-emerald-700">Przelew netto do kontrahenta</div>
          <div className="mt-1 text-lg font-semibold text-emerald-700 tnum">{formatPLN(r.netTransfer)}</div>
        </div>
      </div>

      {r.flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {r.flags.map((f) => (
            <Badge key={f} tone={f.includes("REFUND") || f.includes("PRÓG") || f.includes("BRAK") ? "warning" : "brand"}>
              {f}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Zapis w rejestrze WHT
        </div>
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600">
          <CheckCircle2 className="size-4 text-emerald-500" />
          Transakcja {data.id} zapisana ze śladem audytowym (podstawa prawna, wersja stawki, decyzja, znacznik czasu).
        </div>
      </div>

      <div className="rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Wygenerowane dokumenty
        </div>
        <div className="divide-y divide-slate-100">
          {data.declarations.map((dec) => (
            <div key={dec.type} className="flex items-center gap-3 px-4 py-3">
              <FileText className="size-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-slate-900">{dec.type}</span>
                <span className="ml-2 text-xs text-slate-500">{dec.description}</span>
              </div>
              <Badge tone={dec.status === "Gotowe" ? "success" : dec.status === "Wersja robocza" ? "warning" : "neutral"}>
                {dec.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
