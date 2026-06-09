# Konfigurator basenu ENERGOPOOL — Moderna Pool&Spa

Interaktywny konfigurator pakietu basenowego **ENERGOPOOL** (basen bloczkowo-betonowy)
z wyceną online. Użytkownik wybiera rozmiar niecki i wyposażenie opcjonalne (pompa ciepła,
elektrolizer soli, stacja UV, przeciwprąd, automatyka, schody, płyta fundamentowa, folia),
a cena aktualizuje się na bieżąco. Na koniec może zamówić wycenę e-mailem lub wydrukować
podsumowanie / zapisać je do PDF.

Dane cen i specyfikacji pochodzą z ofert „2026 Pakiet basenowy ENERGOPOOL"
(Moderna Pool&Spa Sp. z o.o.).

## Technologia

Statyczna strona — czysty **HTML + CSS + JavaScript** (bez frameworków i kroku budowania).
Czcionki (Montserrat, Poppins) osadzone lokalnie — strona działa w pełni offline.

```
index.html      – struktura strony i konfiguratora
styles.css      – style (jasny, elegancki, geometryczny motyw; responsywny)
data.js         – dane: ceny i specyfikacje wg rozmiaru basenu (źródło prawdy)
app.js          – logika konfiguratora, kalkulacja ceny, e-mail i wydruk
assets/         – zdjęcia produktów, banery, render konstrukcji, czcionki
```

## Uruchomienie lokalne

Wystarczy otworzyć `index.html` w przeglądarce. Dla pełnej zgodności (ścieżki względne)
można uruchomić prosty serwer:

```bash
python3 -m http.server 8000
# następnie: http://localhost:8000
```

## Edycja cen

Wszystkie ceny i parametry są w pliku [`data.js`](data.js) (`SIZES`, `FIXED`, `FOILS`).
Zmiana ceny = edycja jednej wartości w tym pliku.

---

© Moderna Pool&Spa Sp. z o.o. — ul. św. Teresy od Dzieciątka Jezus 91, 91-341 Łódź ·
[moderna-baseny.pl](https://moderna-baseny.pl) · [moderna-spa.pl](https://moderna-spa.pl)
