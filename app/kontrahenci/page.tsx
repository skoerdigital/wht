import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, Badge, Progress, SectionTitle } from "@/components/ui";
import { CASES } from "@/lib/data";
import { formatPLN } from "@/lib/format";
import { vaultStatusBadge } from "@/lib/labels";

export default function VendorsPage() {
  return (
    <div className="animate-fade-up">
      <SectionTitle
        eyebrow="Baza podmiotów"
        title="Kontrahenci"
        description="Nierezydenci, którym wypłacane są należności objęte WHT — wraz z licznikiem progu 2 mln i kompletem dokumentów."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {CASES.map((c) => {
          const v = c.vendor;
          const sum = c.document.grossAmount + c.threshold.priorYtd;
          const pct = (sum / c.threshold.limit) * 100;
          const over = sum > c.threshold.limit;
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    {v.flag}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">
                      {v.countryName} · {v.taxId}
                    </div>
                  </div>
                </div>
                <Badge tone={v.isRelated ? "warning" : "neutral"}>
                  {v.isRelated ? "Powiązany" : "Niepowiązany"}
                </Badge>
              </div>

              {/* Akumulator */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    {c.threshold.active ? "Licznik progu 2 mln PLN" : "Próg nieaktywny (niepowiązany)"}
                  </span>
                  <span className="tnum text-slate-500">
                    {formatPLN(sum)} / {formatPLN(c.threshold.limit)}
                  </span>
                </div>
                <Progress
                  value={pct}
                  tone={!c.threshold.active ? "neutral" : over ? "danger" : pct > 75 ? "warning" : "brand"}
                />
              </div>

              {/* Dokumenty */}
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium text-slate-500">Dokumentacja</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.vault.map((doc) => {
                    const b = vaultStatusBadge(doc.status);
                    return (
                      <Badge key={doc.type} tone={b.tone}>
                        {doc.type}: {b.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">{c.classification.category}</span>
                <Link
                  href={`/sprawa/${c.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Otwórz sprawę <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
