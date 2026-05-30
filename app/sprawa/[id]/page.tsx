import Link from "next/link";
import { getCase } from "@/lib/data";
import { CaseWizard } from "@/components/case/case-wizard";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getCase(id);
  if (!data) {
    return (
      <div className="animate-fade-up">
        <Link href="/skrzynka" className="text-sm text-brand-600 hover:text-brand-700">
          ← Skrzynka dokumentów
        </Link>
        <div className="mt-6 text-sm text-slate-500">Nie znaleziono sprawy „{id}".</div>
      </div>
    );
  }
  return <CaseWizard data={data} />;
}
