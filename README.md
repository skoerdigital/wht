# WHT Compliance — prototyp prezentacyjny

Klikalny mockup systemu identyfikacji i rozliczania podatku u źródła (WHT). Pokazuje kompletny
proces end-to-end dla inwestorów. **To nie jest aplikacja produkcyjna** — wszystkie dane są
zaszyte na potrzeby demonstracji, brak backendu i realnych integracji.

Spójny z `../business-spec.md` i `../technical-spec.md`.

## Uruchomienie

```bash
npm install      # jeśli jeszcze nie zainstalowano
npm run dev      # http://localhost:3000
```

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · Recharts. Styl: Clean SaaS (akcent indygo).

## Ekrany
- **Kokpit** (`/`) — KPI, licznik progu 2 mln, alerty, kolejka spraw.
- **Skrzynka dokumentów** (`/skrzynka`) — 3 kanały ingestion (Upload / ERP / KSeF), wykrywanie WHT, „Nowy dokument".
- **Sprawa** (`/sprawa/[id]`) — kreator E2E (8 kroków): Dokument → Kontrahent → Klasyfikacja (reguły + AI) → Należyta staranność → Stawka/UPO → Próg 2 mln → Decyzja → Podsumowanie.
- **Rejestr WHT** (`/rejestr`) — ewidencja transakcji + filtr REFUND_PENDING.
- **Deklaracje i wnioski** (`/deklaracje`) — IFT-2R / CIT-10Z / WH-WCZ z podglądem XML i walidacją schemy.
- **Kontrahenci** (`/kontrahenci`) — karty nierezydentów z akumulatorem i dokumentacją.

## Scenariusz demo (4 ścieżki)
Przełącznik „Scenariusze demo" w górnym pasku prowadzi do każdej sprawy:

| Scenariusz | Sprawa | Wynik |
|---|---|---|
| **A — Happy path** | Bellini Media (IT, licencja 180 tys.) | Obniżona stawka UPO 10% |
| **B — Brak dokumentów** | Orion Data (GB, usługi 240 tys.) | Blokada ulgi → stawka ustawowa 20% |
| **C — Pay & Refund** (flagowy) | Muster Holding (DE, odsetki 2,5 mln) | Split 2,0M×5% + 0,5M×20% = 200k, REFUND_PENDING 75k |
| **D — Zwolnienie UE** | Iberia Capital (ES, dywidenda 1,5 mln) | Dyrektywa PS → 0% |

**Wskazówka prezentacyjna:** do kroku kreatora można dolinkować bezpośrednio przez parametr
`?krok=N` (1–8), np. `/sprawa/WHT-2025-0142?krok=6` otwiera od razu ekran progu 2 mln / Pay & Refund.

## Rekomendowana ścieżka pokazu
1. **Kokpit** — pokaż próg przekroczony i alert REFUND_PENDING.
2. **Skrzynka** — zwróć uwagę, że KSeF (faktury krajowe) jest poprawnie odrzucany jako „Nie podlega WHT".
3. **Sprawa C** — przeklikaj 8 kroków; kulminacja na kroku 6 (split kwoty) i 7 (3 opcje decyzji).
4. **Deklaracje** — gotowe XML IFT-2R/CIT-10Z + wniosek WH-WCZ.
5. (Opcjonalnie) Scenariusze A / B / D dla pokazania szerokości logiki.
