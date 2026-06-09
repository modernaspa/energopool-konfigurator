# Moderna Pool&Spa — System operacyjny (MVP)
### Jednostronicowy zakres i plan · v1 · 2026-06-09

## Cel
Wewnętrzny system do prowadzenia sprzedaży i realizacji w jednym miejscu, wdrożony w **~1 miesiąc**
jako działające MVP. Jednocześnie stanowi **wspólny rdzeń** docelowej platformy (CRM/ERP, panel klienta,
integracje) — rozwijany dalej bez przepisywania.

**Zasada przewodnia:** jeden silnik ofert nad jednym katalogiem z kategoriami (basen / SPA / rolety /
zadaszenia) — **nie** cztery osobne systemy. Wewnętrzny kreator ofert ≠ publiczny konfigurator
(publiczny konfigurator basenów zostaje jako narzędzie marketingowe).

## Zakres MVP (6 modułów)

| # | Moduł | Zakres w v1 |
|---|---|---|
| 1 | **Prosty CRM** | Klienci (osoba/firma, NIP, adres), statusy lead→oferta→umowa→realizacja, notatki, karta klienta z powiązaniami |
| 2 | **Baza produktów** | Kategorie (basen/SPA/rolety/zadaszenia), produkty + atrybuty + ceny + zdjęcia; edytowalna |
| 3 | **Tworzenie ofert (4 kategorie)** | Jeden silnik: klient + kategoria + pozycje z katalogu (ilość/opcje/rabaty) → auto-suma → wersjonowanie → **PDF oferty** |
| 4 | **Umowy + załączniki** | Szablon umowy z polami scalanymi (klient, zakres, kwota, harmonogram 50/25/10/10/5, terminy) → PDF + dołączanie załączników |
| 5 | **Project management (lekki)** | Z umowy → projekt: etapy/kamienie milowe, zadania/checklisty, terminy, przypisanie ekipy, lista/tablica |
| 6 | **Protokoły odbioru** | Szablon protokołu (dane projektu, lista kontrolna, miejsce na podpisy) → PDF, generowany z projektu |

**Ścieżka danych:** Klient → Oferta → Umowa → Projekt → Protokół odbioru (jedno źródło prawdy).

## Poza zakresem MVP (etap 2, na tym samym fundamencie)
Integracja Fakturownia (API) · panel klienta online z historią · płatności online · e-podpis ·
serwis/zgłoszenia · sklep online · raporty/analityka · aplikacja mobilna ekip · publiczne konfiguratory
SPA/rolet/zadaszeń.

## Architektura / stack
- **Frontend + API:** Next.js + TypeScript (modułowy monolit, nie mikroserwisy).
- **Dane:** Supabase = PostgreSQL + logowanie + storage (pliki/zdjęcia) + gotowe API + edytor tabel (tymczasowy panel admina).
- **Dokumenty:** szablony HTML → PDF (oferty, umowy, protokoły).
- **Hosting/CI:** Vercel + GitHub (deploy z brancha, podgląd PR).
- **Bezpieczeństwo:** role (zarząd / handlowiec / kierownik montażu), RLS, backupy, RODO-minimum od startu.

## Harmonogram (4 tygodnie)
- **T1 — fundament:** projekt, logowanie/role, schemat bazy (klienci, produkty, oferty, umowy, projekty, protokoły), migracja danych basenów, CRUD katalogu + CRM.
- **T2 — oferty:** silnik ofert dla 4 kategorii + PDF oferty + wersjonowanie.
- **T3 — dokumenty:** generator umów (szablon + scalanie + załączniki) + protokoły odbioru + harmonogram płatności.
- **T4 — projekty + spięcie:** moduł projektów (etapy/zadania/kalendarz), połączenie pełnej ścieżki, testy, wdrożenie, szkolenie + bufor.

## Warunki dotrzymania terminu (uczciwie)
1. **Wąskie gardło to treści, nie kod** — potrzebne sprawnie w T1: wzór umowy, wzór protokołu odbioru, listy produktów z cenami dla SPA/rolet/zadaszeń (baseny już mamy).
2. **Dyscyplina zakresu** — zmiany dokładane do MVP przesuwają termin; resztę zapisujemy na etap 2.
3. **„Działające" ≠ „dopieszczone"** — ekrany wewnętrzne użytkowe, szlif po wdrożeniu; ładne tam, gdzie ważne (dokumenty).
4. **Krytyczność** — wbudowane podstawy bezpieczeństwa; rekomendowany przegląd przez developera-człowieka przed pełną produkcją.

## Koszty
- Infrastruktura: **0–~150 zł/mc** (Supabase, Vercel). Fakturownia dopiero w etapie 2.
- Główny koszt to czas budowy.

## Potrzebne wkłady od Moderna Pool&Spa (do startu)
1. Akceptacja zakresu MVP (powyżej).
2. Wzór **umowy** + wzór **protokołu odbioru** (Word/PDF).
3. **Produkty + ceny**: SPA, rolety, zadaszenia (Excel/PDF/zdjęcia).
4. **Użytkownicy i role** (kto, jakie uprawnienia).

## Status
- [ ] Zakres MVP zaakceptowany
- [ ] Materiały (umowa, protokół, cenniki) dostarczone
- [ ] Start Tygodnia 1

---
*Dokument roboczy — aktualizowany w trakcie. Repozytorium docelowe systemu może być osobne od repo konfiguratora.*
