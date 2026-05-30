import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gauge,
  Info,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Kpi,
  Badge,
  Progress,
  ChannelPill,
  SectionTitle,
} from "@/components/ui";
import { WhtDonut } from "@/components/charts/wht-donut";
import { CASES, ALERTS, DASHBOARD } from "@/lib/data";
import { formatPLN } from "@/lib/format";
import { outcomeBadge } from "@/lib/labels";

const donutData = [
  { name: "Odsetki", value: 200_000, color: "#4f46e5" },
  { name: "Usługi niematerialne", value: 48_000, color: "#0ea5e9" },
  { name: "Należności licencyjne", value: 18_000, color: "#10b981" },
];

const alertIcon = { danger: AlertTriangle, warning: Clock3, info: Info } as const;
const alertTone = { danger: "text-red-500", warning: "text-amber-500", info: "text-sky-500" } as const;

export default function DashboardPage() {
  return (
    <div className="animate-fade-up">
      <SectionTitle
        eyebrow="Przegląd"
        title="Kokpit WHT"
        description="Bieżący obraz zobowiązań z tytułu podatku u źródła — sprawy do decyzji, próg 2 mln PLN i ryzyka dokumentacyjne."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Sprawy do decyzji"
          value={DASHBOARD.casesToDecide}
          hint="wymagają działania płatnika"
          tone="brand"
          icon={<Bell className="size-4" />}
        />
        <Kpi
          label="Pobrany WHT (YTD)"
          value={formatPLN(DASHBOARD.whtYtd)}
          hint="narastająco w 2025 r."
          icon={<CircleDollarSign className="size-4" />}
        />
        <Kpi
          label="Do odzyskania (Refund)"
          value={formatPLN(DASHBOARD.refundPending)}
          hint="oznaczone REFUND_PENDING"
          tone="warning"
          icon={<TrendingUp className="size-4" />}
        />
        <Kpi
          label="Kontrahenci przy progu"
          value={DASHBOARD.nearThreshold}
          hint="≥ 90% progu 2 mln PLN"
          tone="danger"
          icon={<Gauge className="size-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Kolejka spraw</CardTitle>
              <Link href="/skrzynka" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Skrzynka dokumentów →
              </Link>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {CASES.map((c) => {
                const out = outcomeBadge(c.outcome);
                return (
                  <Link
                    key={c.id}
                    href={`/sprawa/${c.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                      {c.vendor.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{c.title}</span>
                        {c.needsDecision && <Badge tone="warning">Wymaga decyzji</Badge>}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {c.document.kind} · {c.subtitle}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <ChannelPill channel={c.channel} />
                    </div>
                    <div className="hidden w-36 text-right md:block">
                      <Badge tone={out.tone}>{out.label}</Badge>
                    </div>
                    <div className="w-28 text-right text-sm font-semibold text-slate-900 tnum">
                      {formatPLN(c.document.grossAmount)}
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próg 2 mln PLN — licznik wypłat (podmioty powiązane)</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {CASES.filter((c) => c.threshold.active).map((c) => {
                const sum = c.document.grossAmount + c.threshold.priorYtd;
                const pct = (sum / c.threshold.limit) * 100;
                const over = sum > c.threshold.limit;
                return (
                  <div key={c.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        {c.vendor.flag} {c.title}
                      </span>
                      <span className="tnum text-slate-500">
                        {formatPLN(sum)} / {formatPLN(c.threshold.limit)}
                      </span>
                    </div>
                    <Progress value={pct} tone={over ? "danger" : pct > 75 ? "warning" : "brand"} />
                    {over && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        Przekroczono o {formatPLN(sum - c.threshold.limit)} — aktywny mechanizm Pay & Refund.
                      </div>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Struktura pobranego WHT</CardTitle>
            </CardHeader>
            <CardBody className="flex items-center gap-5">
              <WhtDonut data={donutData} total={DASHBOARD.whtYtd} />
              <ul className="flex-1 space-y-2 text-xs">
                {donutData
                  .filter((d) => d.value > 1)
                  .map((d) => (
                    <li key={d.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-medium text-slate-900 tnum">{formatPLN(d.value)}</span>
                    </li>
                  ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerty i terminy</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {ALERTS.map((a) => {
                const Icon = alertIcon[a.tone];
                const inner = (
                  <div className="flex gap-3 px-5 py-3.5">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${alertTone[a.tone]}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{a.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{a.detail}</div>
                    </div>
                  </div>
                );
                return a.caseId ? (
                  <Link
                    key={a.id}
                    href={`/sprawa/${a.caseId}`}
                    className="block transition-colors hover:bg-slate-50"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={a.id}>{inner}</div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
