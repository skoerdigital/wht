import type { Outcome, CaseStage } from "./types";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

export function outcomeBadge(o: Outcome): { tone: Tone; label: string } {
  switch (o) {
    case "UPO":
      return { tone: "success", label: "Stawka UPO" };
    case "PELNA_STAWKA":
      return { tone: "danger", label: "Stawka ustawowa" };
    case "PAY_REFUND":
      return { tone: "warning", label: "Pay & Refund" };
    case "ZWOLNIENIE_UE":
      return { tone: "brand", label: "Zwolnienie UE 0%" };
  }
}

export function stageBadge(s: CaseStage): { tone: Tone; label: string } {
  switch (s) {
    case "Dokument":
      return { tone: "neutral", label: "Dokument" };
    case "Klasyfikacja":
      return { tone: "info", label: "Klasyfikacja" };
    case "Należyta staranność":
      return { tone: "info", label: "Należyta staranność" };
    case "Decyzja":
      return { tone: "warning", label: "Decyzja" };
    case "Rozliczono":
      return { tone: "success", label: "Rozliczono" };
  }
}

export function vaultStatusBadge(s: "valid" | "expiring" | "missing"): {
  tone: Tone;
  label: string;
} {
  switch (s) {
    case "valid":
      return { tone: "success", label: "Ważny" };
    case "expiring":
      return { tone: "warning", label: "Wygasa" };
    case "missing":
      return { tone: "danger", label: "Brak" };
  }
}
