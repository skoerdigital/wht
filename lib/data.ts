import type { WhtCase, Channel } from "./types";

const LIMIT = 2_000_000;

export const TENANT = {
  name: "ACME Polska Sp. z o.o.",
  nip: "PL 527-10-00-000",
  taxYear: 2025,
};

// ── Scenariusz C — flagowy: Pay & Refund (odsetki, DE, podmiot powiązany) ──
const caseC: WhtCase = {
  id: "WHT-2025-0142",
  scenario: "C",
  scenarioLabel: "Pay & Refund",
  title: "Muster Holding GmbH",
  subtitle: "Odsetki od pożyczki · 2 500 000 PLN",
  channel: "ERP",
  stage: "Decyzja",
  needsDecision: true,
  document: {
    kind: "Nota odsetkowa",
    number: "NO/2025/014",
    issueDate: "2025-05-12",
    paymentDate: "2025-05-28",
    paymentTitle: "Odsetki od pożyczki wewnątrzgrupowej",
    lineDescription: "Odsetki naliczone za okres 01.2025–05.2025 od pożyczki z 14.03.2022",
    grossAmount: 2_500_000,
    currency: "PLN",
    iban: "DE89 3704 0044 0532 0130 00",
  },
  vendor: {
    name: "Muster Holding GmbH",
    countryCode: "DE",
    countryName: "Niemcy",
    flag: "🇩🇪",
    taxId: "DE 811 569 869",
    isRelated: true,
    relationNote: "Spółka matka — udział 100% w kapitale ACME Polska.",
    residencyConfidence: 0.98,
    residencySignals: [
      "Numer identyfikacyjny VAT-UE z prefiksem DE",
      "Rachunek bankowy (IBAN) w Niemczech",
      "Adres siedziby zgodny z certyfikatem rezydencji",
    ],
  },
  classification: {
    category: "Odsetki",
    subjectToWht: true,
    statutoryRate: 0.2,
    legalBasis: "art. 21 ust. 1 pkt 1 ustawy o CIT",
    ruleMatch: 'Reguła: tytuł „odsetki" + kontrahent zagraniczny → kategoria „Odsetki" (pewność wysoka).',
    aiReasoning:
      "Płatność stanowi wynagrodzenie za udostępnienie kapitału w ramach pożyczki — kwalifikuje się jako odsetki w rozumieniu art. 21 ust. 1 pkt 1 ustawy o CIT. Wypłata na rzecz nierezydenta rodzi obowiązek poboru podatku u źródła wg stawki ustawowej 20%, z możliwością zastosowania preferencji z UPO PL-DE po spełnieniu warunków dokumentacyjnych.",
    citations: [
      { ref: "art. 21 ust. 1 pkt 1 ustawy o CIT", note: "Odsetki — stawka ustawowa 20%." },
      { ref: "art. 11 UPO Polska–Niemcy", note: "Odsetki — stawka preferencyjna 5%." },
      { ref: "art. 26 ust. 2e ustawy o CIT", note: "Mechanizm pay & refund powyżej 2 mln PLN." },
      { ref: "art. 28b ustawy o CIT", note: "Procedura zwrotu nadpłaconego podatku." },
    ],
    confidence: 0.97,
  },
  vault: [
    { type: "CFR", label: "Certyfikat rezydencji (CFR)", status: "valid", detail: "Ważny do 14.09.2026 (reguła 12 mies. od wydania)." },
    { type: "BO", label: "Oświadczenie beneficial owner (BO)", status: "valid", detail: "Złożone 02.01.2025 — odbiorca rzeczywisty potwierdzony." },
    { type: "OPINIA", label: "Opinia o stosowaniu preferencji", status: "missing", detail: "Brak — wymagana, by uniknąć poboru powyżej 2 mln." },
    { type: "WH-OSC", label: "Oświadczenie płatnika WH-OSC", status: "missing", detail: "Nie złożono — alternatywa dla opinii." },
  ],
  dueDiligence: [
    { item: "Weryfikacja statusu rzeczywistego właściciela (BO)", done: true },
    { item: "Sprawdzenie autentyczności certyfikatu rezydencji", done: true },
    { item: "Analiza substancji biznesowej odbiorcy", done: true },
    { item: "Weryfikacja charakteru transakcji (rzeczywista pożyczka)", done: true },
  ],
  treaty: {
    applicable: true,
    basis: "UPO Polska–Niemcy, art. 11 (odsetki)",
    preferentialRate: 0.05,
    conditionsMet: true,
    note: "Stawka 5% dostępna do progu 2 mln PLN. Powyżej progu — wymagana opinia lub WH-OSC.",
  },
  threshold: { active: true, priorYtd: 0, limit: LIMIT },
  outcome: "PAY_REFUND",
  decisionOptions: [
    {
      key: "hold",
      title: "Wstrzymaj płatność i uzyskaj opinię o stosowaniu preferencji",
      description: "Nie pobieraj WHT od nadwyżki — najpierw uzyskaj opinię (ważną 3 lata).",
      consequence: "Brak poboru ponad 2 mln. Zwłoka ~4–6 mies. na wydanie opinii.",
      tone: "hold",
    },
    {
      key: "wh-osc",
      title: "Zapłać i złóż oświadczenie WH-OSC",
      description: "Zastosuj 5% do całości na własną odpowiedzialność (posiadasz CFR + BO).",
      consequence: "Podatek 125 000 PLN. Odpowiedzialność zarządu za oświadczenie.",
      recommended: true,
      tone: "act",
    },
    {
      key: "pay-refund",
      title: "Zapłać i pobierz pełny WHT od nadwyżki",
      description: "Pobierz 20% od nadwyżki i wystąp o zwrot różnicy (art. 28b CIT).",
      consequence: "Podatek 200 000 PLN. Zamrożone 75 000 PLN do czasu zwrotu.",
      tone: "pay",
    },
  ],
  result: {
    appliedRateLabel: "5% (do 2 mln) + 20% (nadwyżka)",
    splitBelow: { base: 2_000_000, rate: 0.05, tax: 100_000 },
    splitAbove: { base: 500_000, rate: 0.2, tax: 100_000 },
    totalTax: 200_000,
    netTransfer: 2_300_000,
    refundPending: 75_000,
    flags: ["REFUND_PENDING", "PRÓG_2MLN_PRZEKROCZONY"],
  },
  declarations: [
    { type: "IFT-2R", description: "Roczna informacja o wypłatach na rzecz nierezydenta", status: "Gotowe" },
    { type: "CIT-10Z", description: "Roczna deklaracja o pobranym WHT", status: "Gotowe" },
    { type: "WH-WCZ", description: "Wniosek o zwrot — podatnik (odbiorca)", status: "Wersja robocza" },
    { type: "WH-WCP", description: "Wniosek o zwrot — płatnik (przy gross-up)", status: "Nie dotyczy" },
  ],
};

// ── Scenariusz A — Happy path: obniżona stawka UPO (licencja, IT, niepowiązany) ──
const caseA: WhtCase = {
  id: "WHT-2025-0138",
  scenario: "A",
  scenarioLabel: "Happy path",
  title: "Bellini Media S.r.l.",
  subtitle: "Należności licencyjne · 180 000 PLN",
  channel: "Upload",
  stage: "Rozliczono",
  needsDecision: false,
  document: {
    kind: "Faktura",
    number: "FV 2025/0788",
    issueDate: "2025-04-03",
    paymentDate: "2025-04-20",
    paymentTitle: "Licencja na materiały audiowizualne",
    lineDescription: "Opłata licencyjna za prawa do wykorzystania materiałów wideo (kampania Q2)",
    grossAmount: 180_000,
    currency: "PLN",
    iban: "IT60 X054 2811 1010 0000 0123 456",
  },
  vendor: {
    name: "Bellini Media S.r.l.",
    countryCode: "IT",
    countryName: "Włochy",
    flag: "🇮🇹",
    taxId: "IT 12345670158",
    isRelated: false,
    relationNote: "Podmiot niepowiązany — próg 2 mln nieaktywny.",
    residencyConfidence: 0.95,
    residencySignals: [
      "Numer VAT-UE z prefiksem IT",
      "Rachunek bankowy we Włoszech",
      "Certyfikat rezydencji z włoskiej administracji skarbowej",
    ],
  },
  classification: {
    category: "Należności licencyjne",
    subjectToWht: true,
    statutoryRate: 0.2,
    legalBasis: "art. 21 ust. 1 pkt 1 ustawy o CIT",
    ruleMatch: 'Reguła: „licencja / prawa autorskie" → kategoria „Należności licencyjne".',
    aiReasoning:
      "Opłata za prawo do korzystania z materiałów audiowizualnych stanowi należność licencyjną (art. 21 ust. 1 pkt 1 ustawy o CIT). Odbiorca jest rezydentem Włoch — zastosowanie ma obniżona stawka z UPO PL-IT po przedłożeniu certyfikatu rezydencji.",
    citations: [
      { ref: "art. 21 ust. 1 pkt 1 ustawy o CIT", note: "Należności licencyjne — stawka ustawowa 20%." },
      { ref: "art. 12 UPO Polska–Włochy", note: "Należności licencyjne — stawka 10%." },
    ],
    confidence: 0.93,
  },
  vault: [
    { type: "CFR", label: "Certyfikat rezydencji (CFR)", status: "expiring", detail: "Ważny do 22.06.2025 — wygasa za 23 dni." },
    { type: "BO", label: "Oświadczenie beneficial owner (BO)", status: "valid", detail: "Złożone 10.01.2025." },
  ],
  dueDiligence: [
    { item: "Weryfikacja statusu rzeczywistego właściciela (BO)", done: true },
    { item: "Sprawdzenie autentyczności certyfikatu rezydencji", done: true },
    { item: "Analiza charakteru należności (licencja)", done: true },
  ],
  treaty: {
    applicable: true,
    basis: "UPO Polska–Włochy, art. 12 (należności licencyjne)",
    preferentialRate: 0.1,
    conditionsMet: true,
    note: "Stawka 10% — komplet dokumentów, kwota poniżej progu 2 mln.",
  },
  threshold: { active: false, priorYtd: 540_000, limit: LIMIT },
  outcome: "UPO",
  decisionOptions: [
    {
      key: "approve",
      title: "Zatwierdź rozliczenie wg stawki UPO 10%",
      description: "Komplet dokumentów potwierdzony, próg nieaktywny.",
      consequence: "Podatek 18 000 PLN. Przelew netto 162 000 PLN.",
      recommended: true,
      tone: "act",
    },
  ],
  result: {
    appliedRateLabel: "10% (UPO PL-IT)",
    splitBelow: { base: 180_000, rate: 0.1, tax: 18_000 },
    totalTax: 18_000,
    netTransfer: 162_000,
    refundPending: 0,
    flags: [],
  },
  declarations: [
    { type: "IFT-2R", description: "Roczna informacja o wypłatach na rzecz nierezydenta", status: "Gotowe" },
    { type: "CIT-10Z", description: "Roczna deklaracja o pobranym WHT", status: "Gotowe" },
  ],
};

// ── Scenariusz B — Brak dokumentów: blokada ulgi, pełna stawka ──
const caseB: WhtCase = {
  id: "WHT-2025-0140",
  scenario: "B",
  scenarioLabel: "Brak dokumentów",
  title: "Orion Data Services Ltd",
  subtitle: "Usługi przetwarzania danych · 240 000 PLN",
  channel: "ERP",
  stage: "Decyzja",
  needsDecision: true,
  document: {
    kind: "Faktura",
    number: "INV-2025-3391",
    issueDate: "2025-05-06",
    paymentDate: "2025-05-22",
    paymentTitle: "Usługi przetwarzania danych (SaaS)",
    lineDescription: "Data processing & analytics services — subscription Q2 2025",
    grossAmount: 240_000,
    currency: "PLN",
    iban: "GB29 NWBK 6016 1331 9268 19",
  },
  vendor: {
    name: "Orion Data Services Ltd",
    countryCode: "GB",
    countryName: "Wielka Brytania",
    flag: "🇬🇧",
    taxId: "GB 343 4567 65",
    isRelated: false,
    relationNote: "Podmiot niepowiązany — próg 2 mln nieaktywny.",
    residencyConfidence: 0.88,
    residencySignals: [
      "Numer rejestracyjny z prefiksem GB",
      "Rachunek bankowy w Wielkiej Brytanii",
      "Brak ważnego certyfikatu rezydencji w repozytorium",
    ],
  },
  classification: {
    category: "Usługi niematerialne",
    subjectToWht: true,
    statutoryRate: 0.2,
    legalBasis: "art. 21 ust. 1 pkt 2a ustawy o CIT",
    ruleMatch: 'Reguła: „przetwarzanie danych" → świadczenia o podobnym charakterze (art. 21 ust. 1 pkt 2a).',
    aiReasoning:
      "Usługi przetwarzania danych mieszczą się w katalogu świadczeń niematerialnych objętych WHT (art. 21 ust. 1 pkt 2a ustawy o CIT). Bez ważnego certyfikatu rezydencji nie można zastosować preferencji z UPO — należy pobrać podatek wg stawki ustawowej 20%.",
    citations: [
      { ref: "art. 21 ust. 1 pkt 2a ustawy o CIT", note: "Usługi niematerialne (m.in. przetwarzanie danych) — 20%." },
      { ref: "art. 26 ust. 1 ustawy o CIT", note: "Warunek: ważny certyfikat rezydencji dla preferencji." },
    ],
    confidence: 0.9,
  },
  vault: [
    { type: "CFR", label: "Certyfikat rezydencji (CFR)", status: "missing", detail: "BRAK — preferencja z UPO niedostępna." },
    { type: "BO", label: "Oświadczenie beneficial owner (BO)", status: "valid", detail: "Złożone 15.02.2025." },
  ],
  dueDiligence: [
    { item: "Weryfikacja statusu rzeczywistego właściciela (BO)", done: true },
    { item: "Sprawdzenie autentyczności certyfikatu rezydencji", done: false },
    { item: "Analiza charakteru świadczenia", done: true },
  ],
  treaty: {
    applicable: false,
    basis: "UPO Polska–Wielka Brytania (potencjalnie 0%)",
    preferentialRate: null,
    conditionsMet: false,
    note: "Preferencja zablokowana — brak ważnego certyfikatu rezydencji.",
  },
  threshold: { active: false, priorYtd: 120_000, limit: LIMIT },
  outcome: "PELNA_STAWKA",
  decisionOptions: [
    {
      key: "pay-full",
      title: "Pobierz podatek wg stawki ustawowej 20%",
      description: "Brak ważnego CFR — preferencja niedostępna.",
      consequence: "Podatek 48 000 PLN. Różnicę można odzyskać po uzupełnieniu CFR.",
      tone: "pay",
    },
    {
      key: "hold-cfr",
      title: "Wstrzymaj i pozyskaj certyfikat rezydencji",
      description: "Uzyskaj CFR od kontrahenta, aby zastosować stawkę UPO.",
      consequence: "Opóźnienie płatności. Brak ryzyka nadpłaty.",
      recommended: true,
      tone: "hold",
    },
  ],
  result: {
    appliedRateLabel: "20% (stawka ustawowa)",
    splitBelow: { base: 240_000, rate: 0.2, tax: 48_000 },
    totalTax: 48_000,
    netTransfer: 192_000,
    refundPending: 0,
    flags: ["BRAK_CFR"],
  },
  declarations: [
    { type: "IFT-2R", description: "Roczna informacja o wypłatach na rzecz nierezydenta", status: "Gotowe" },
    { type: "CIT-10Z", description: "Roczna deklaracja o pobranym WHT", status: "Gotowe" },
  ],
};

// ── Scenariusz D — Zwolnienie UE: dyrektywa PS, 0% ──
const caseD: WhtCase = {
  id: "WHT-2025-0135",
  scenario: "D",
  scenarioLabel: "Zwolnienie UE",
  title: "Iberia Capital S.A.",
  subtitle: "Dywidenda · 1 500 000 PLN",
  channel: "ERP",
  stage: "Rozliczono",
  needsDecision: false,
  document: {
    kind: "Uchwała o wypłacie dywidendy",
    number: "DYW/2025/02",
    issueDate: "2025-03-30",
    paymentDate: "2025-04-15",
    paymentTitle: "Wypłata dywidendy za 2024 r.",
    lineDescription: "Dywidenda należna jedynemu wspólnikowi za rok obrotowy 2024",
    grossAmount: 1_500_000,
    currency: "PLN",
    iban: "ES91 2100 0418 4502 0005 1332",
  },
  vendor: {
    name: "Iberia Capital S.A.",
    countryCode: "ES",
    countryName: "Hiszpania",
    flag: "🇪🇸",
    taxId: "ES A12345674",
    isRelated: true,
    relationNote: "Spółka matka — udział 100% nieprzerwanie ponad 2 lata.",
    residencyConfidence: 0.99,
    residencySignals: [
      "Numer VAT-UE z prefiksem ES",
      "Rachunek bankowy w Hiszpanii",
      "Certyfikat rezydencji + oświadczenie o spełnieniu warunków dyrektywy",
    ],
  },
  classification: {
    category: "Dywidendy",
    subjectToWht: true,
    statutoryRate: 0.19,
    legalBasis: "art. 22 ust. 1 ustawy o CIT",
    ruleMatch: 'Reguła: „dywidenda" → kategoria „Dywidendy" (art. 22).',
    aiReasoning:
      "Wypłata dywidendy do spółki matki z UE. Spełnione warunki zwolnienia partycypacyjnego (udział ≥10% nieprzerwanie ponad 2 lata) z art. 22 ust. 4 ustawy o CIT, stanowiącego implementację dyrektywy Parent-Subsidiary — zastosowanie stawki 0%.",
    citations: [
      { ref: "art. 22 ust. 1 ustawy o CIT", note: "Dywidendy — stawka ustawowa 19%." },
      { ref: "art. 22 ust. 4 ustawy o CIT", note: "Zwolnienie partycypacyjne — stawka 0%." },
      { ref: "Dyrektywa 2011/96/UE (Parent-Subsidiary)", note: "Podstawa zwolnienia dywidend w UE." },
    ],
    confidence: 0.96,
  },
  vault: [
    { type: "CFR", label: "Certyfikat rezydencji (CFR)", status: "valid", detail: "Ważny do 31.12.2025." },
    { type: "BO", label: "Oświadczenie beneficial owner (BO)", status: "valid", detail: "Złożone 05.01.2025." },
    { type: "OPINIA", label: "Oświadczenie o warunkach dyrektywy", status: "valid", detail: "Udział 100% > 2 lata — potwierdzone." },
  ],
  dueDiligence: [
    { item: "Weryfikacja statusu rzeczywistego właściciela (BO)", done: true },
    { item: "Potwierdzenie udziału ≥10% przez ponad 2 lata", done: true },
    { item: "Sprawdzenie braku wyłączeń (klauzula GAAR / nadużycia)", done: true },
  ],
  treaty: {
    applicable: true,
    basis: "Dyrektywa Parent-Subsidiary (art. 22 ust. 4 CIT)",
    preferentialRate: 0,
    conditionsMet: true,
    note: "Zwolnienie 0% — warunki dyrektywy spełnione, podstawa zarchiwizowana.",
  },
  threshold: { active: true, priorYtd: 0, limit: LIMIT },
  outcome: "ZWOLNIENIE_UE",
  decisionOptions: [
    {
      key: "approve",
      title: "Zatwierdź zwolnienie 0% i zarchiwizuj podstawę",
      description: "Warunki dyrektywy PS spełnione i udokumentowane.",
      consequence: "Podatek 0 PLN. Przelew pełnej kwoty 1 500 000 PLN.",
      recommended: true,
      tone: "act",
    },
  ],
  result: {
    appliedRateLabel: "0% (zwolnienie UE)",
    splitBelow: { base: 1_500_000, rate: 0, tax: 0 },
    totalTax: 0,
    netTransfer: 1_500_000,
    refundPending: 0,
    flags: ["ZWOLNIENIE_UE"],
  },
  declarations: [
    { type: "IFT-2R", description: "Roczna informacja o wypłatach na rzecz nierezydenta", status: "Gotowe" },
    { type: "CIT-10Z", description: "Roczna deklaracja (wypłata zwolniona)", status: "Gotowe" },
  ],
};

export const CASES: WhtCase[] = [caseC, caseB, caseA, caseD];

export function getCase(id: string): WhtCase | undefined {
  return CASES.find((c) => c.id === id);
}

export function getCaseByScenario(s: string): WhtCase | undefined {
  return CASES.find((c) => c.scenario === s);
}

// ── Dokumenty w skrzynce wykraczające poza 4 sprawy (realizm + kanał KSeF) ──
export interface InboxExtra {
  id: string;
  channel: Channel;
  vendor: string;
  flag: string;
  title: string;
  amount: number;
  date: string;
  verdict: "Nie podlega WHT" | "W analizie";
  reason: string;
}

export const INBOX_EXTRA: InboxExtra[] = [
  {
    id: "DOC-KSEF-88213",
    channel: "KSeF",
    vendor: "Stalmar Sp. z o.o.",
    flag: "🇵🇱",
    title: "Dostawa towarów (stal konstrukcyjna)",
    amount: 96_400,
    date: "2025-05-27",
    verdict: "Nie podlega WHT",
    reason: "Kontrahent krajowy, dostawa towarów — poza zakresem WHT.",
  },
  {
    id: "DOC-KSEF-88251",
    channel: "KSeF",
    vendor: "BiuroServ S.A.",
    flag: "🇵🇱",
    title: "Najem powierzchni biurowej",
    amount: 32_000,
    date: "2025-05-26",
    verdict: "Nie podlega WHT",
    reason: "Usługa krajowa między rezydentami — brak obowiązku WHT.",
  },
  {
    id: "DOC-ERP-55190",
    channel: "ERP",
    vendor: "Nordic Freight AS",
    flag: "🇳🇴",
    title: "Usługi transportu morskiego",
    amount: 410_000,
    date: "2025-05-25",
    verdict: "W analizie",
    reason: "Możliwa stawka 10% (żegluga) — trwa weryfikacja UPO.",
  },
];

// ── Agregaty do kokpitu ──
export const DASHBOARD = {
  casesToDecide: CASES.filter((c) => c.needsDecision).length,
  whtYtd: CASES.reduce((s, c) => s + c.result.totalTax, 0),
  refundPending: CASES.reduce((s, c) => s + c.result.refundPending, 0),
  nearThreshold: CASES.filter((c) => c.threshold.active && c.document.grossAmount + c.threshold.priorYtd >= c.threshold.limit * 0.9).length,
};

export interface AlertItem {
  id: string;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  caseId?: string;
}

export const ALERTS: AlertItem[] = [
  {
    id: "al-1",
    tone: "danger",
    title: "Próg 2 mln PLN przekroczony — Muster Holding GmbH",
    detail: "Łączna wypłata 2 500 000 PLN. Aktywowano mechanizm Pay & Refund dla nadwyżki 500 000 PLN.",
    caseId: "WHT-2025-0142",
  },
  {
    id: "al-2",
    tone: "danger",
    title: "Brak certyfikatu rezydencji — Orion Data Services Ltd",
    detail: "Zastosowano stawkę ustawową 20%. Uzupełnij CFR, aby odzyskać różnicę.",
    caseId: "WHT-2025-0140",
  },
  {
    id: "al-3",
    tone: "warning",
    title: "Certyfikat rezydencji wygasa za 23 dni — Bellini Media S.r.l.",
    detail: "Ważność do 22.06.2025. Pozyskaj nowy certyfikat przed kolejną wypłatą.",
    caseId: "WHT-2025-0138",
  },
  {
    id: "al-4",
    tone: "info",
    title: "Termin oświadczenia następczego WH-OSC",
    detail: "Do 31.01.2026 — jeśli po oświadczeniu pierwotnym wystąpią kolejne wypłaty.",
  },
];
