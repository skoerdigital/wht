// Domain model for the WHT prototype — mirrors technical-spec.md modules.

export type ScenarioId = "A" | "B" | "C" | "D";

export type Channel = "KSeF" | "ERP" | "Upload";

export type WhtCategory =
  | "Odsetki"
  | "Należności licencyjne"
  | "Usługi niematerialne"
  | "Dywidendy";

export type Outcome =
  | "UPO" // obniżona stawka traktatowa
  | "PELNA_STAWKA" // brak preferencji, stawka ustawowa
  | "PAY_REFUND" // część objęta mechanizmem pay & refund
  | "ZWOLNIENIE_UE"; // 0% na podstawie dyrektywy

export type VaultStatus = "valid" | "expiring" | "missing";

export type CaseStage =
  | "Dokument"
  | "Klasyfikacja"
  | "Należyta staranność"
  | "Decyzja"
  | "Rozliczono";

export interface VaultDoc {
  type: "CFR" | "BO" | "OPINIA" | "WH-OSC";
  label: string;
  status: VaultStatus;
  detail: string;
}

export interface Citation {
  ref: string;
  note: string;
}

export interface DeclarationRef {
  type: "IFT-2R" | "CIT-10Z" | "WH-WCZ" | "WH-WCP";
  description: string;
  status: "Gotowe" | "Wersja robocza" | "Nie dotyczy";
}

export interface DecisionOption {
  key: string;
  title: string;
  description: string;
  consequence: string;
  recommended?: boolean;
  tone: "hold" | "act" | "pay";
}

export interface WhtCase {
  id: string;
  scenario: ScenarioId;
  scenarioLabel: string;
  title: string;
  subtitle: string;
  channel: Channel;
  stage: CaseStage;
  needsDecision: boolean;

  document: {
    kind: string; // "Nota odsetkowa", "Faktura"
    number: string;
    issueDate: string;
    paymentDate: string;
    paymentTitle: string;
    lineDescription: string;
    grossAmount: number;
    currency: string;
    iban: string;
  };

  vendor: {
    name: string;
    countryCode: string;
    countryName: string;
    flag: string;
    taxId: string;
    isRelated: boolean;
    relationNote: string;
    residencyConfidence: number; // 0..1
    residencySignals: string[];
  };

  classification: {
    category: WhtCategory;
    subjectToWht: boolean;
    statutoryRate: number;
    legalBasis: string;
    ruleMatch: string;
    aiReasoning: string;
    citations: Citation[];
    confidence: number; // 0..1
  };

  vault: VaultDoc[];
  dueDiligence: { item: string; done: boolean }[];

  treaty: {
    applicable: boolean;
    basis: string; // "UPO PL-DE, art. 11" / "Dyrektywa PS"
    preferentialRate: number | null; // 0.05, 0, lub null gdy zablokowana
    conditionsMet: boolean;
    note: string;
  };

  threshold: {
    active: boolean;
    priorYtd: number; // wcześniejsze wypłaty w roku
    limit: number; // 2 000 000
  };

  outcome: Outcome;
  decisionOptions: DecisionOption[];

  result: {
    appliedRateLabel: string;
    splitBelow?: { base: number; rate: number; tax: number };
    splitAbove?: { base: number; rate: number; tax: number };
    totalTax: number;
    netTransfer: number;
    refundPending: number;
    flags: string[];
  };

  declarations: DeclarationRef[];
}
