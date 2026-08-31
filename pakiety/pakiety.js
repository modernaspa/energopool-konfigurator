/* ==========================================================================
   Konfigurator pakietów basenowych — BASIC / STANDARD / PREMIUM
   Moderna Pool&Spa

   RÓŻNICA WOBEC ../app.js: tamten ma cały cennik u siebie (data.js) i liczy ceny
   w przeglądarce. Tutaj przeglądarka NIE DOSTAJE cennika, bo są w nim nasze ceny
   zakupu i marża. Strona wysyła konfigurację, serwer odsyła same ceny.

   Skutek uboczny, który jest zaletą: nie ma czego rozjechać. Stary konfigurator
   wymaga testu parytetu pilnującego, czy data.js zgadza się z bazą — tu cennik
   jest jeden, po stronie serwera.

   API (CORS ograniczony do modernaspa.github.io):
     GET  /api/pakiety/katalog   → etykiety opcji (standardy, folie, kolory)
     POST /api/pakiety/wycena    → ceny brutto per grupa dla przysłanej konfiguracji
     POST /api/pakiety/zapytanie → zgłoszenie + double opt-in mailem
   ========================================================================== */

// Podczas pracy lokalnej strona gada z lokalnym CRM-em — inaczej każdy test wymagałby
// wrzucania zmian na GitHub Pages, bo CORS produkcyjnego API dopuszcza tylko ten origin.
const API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
  ? "http://localhost:3000"
  : "https://moderna-wellness.cloud";

const zl = (n) => n.toLocaleString("pl-PL") + " zł";
const lp = (n) => String(n).replace(".", ",");
const mm = (n) => n.toFixed(1).replace(".", ",");
const el = (id) => document.getElementById(id);

/** Rozmiary, o które klienci pytają najczęściej — skrót zamiast wpisywania wymiarów. */
const SZYBKIE = [[6, 3], [7, 3], [7, 3.5], [8, 4], [10, 4], [12, 4], [10, 5]];

let KATALOG = null;
let KATALOG_ZDJEC = "/pakiety";
let cfg = {
  dlugosc: 8, szerokosc: 4, glebokosc: 1.5,
  standard: "standard", kolorOsprzetu: "antracyt", typSkimmera: "szeroki",
  foliaKod: "", schody: "narozne",
  plyta: true, praceZiemne: false, drenaz: false,
  pompaCiepla: true, uv: false, elektrolizer: false, przeciwprad: false,
  drabina: false, regulatorPoziomu: false, pomieszczenieTechniczne: "brak",
  plytaPodPomieszczenie: false, postument: false, iwash: false, odkurzacz: "brak",
};
let wycena = null;

/* ---------- ikony ----------
   Cienkie SVG dziedziczące currentColor, wstrzykiwane w <span class="ico" data-icon="...">.
   ŚWIADOMA KOPIA z app.js starego konfiguratora ENERGOPOOL: tamten plik obsługuje reklamowany
   ruch i nie ruszamy go bez potrzeby. Zestaw ograniczony do ikon używanych na tej stronie —
   dodając nową w HTML, dopisz ją tutaj, inaczej zostanie pusty kwadrat. */
const IKONY = (() => {
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  return {
    bolt: svg('<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l1-8z"/>'),
    shield: svg('<path d="M12 3 5 5.8V11c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V5.8L12 3z"/>'),
    sliders: svg('<path d="M4 21v-6M4 11V3M12 21v-8M12 9V3M20 21v-5M20 12V3M1.5 15h5M9.5 9h5M17.5 16h5"/>'),
    droplet: svg('<path d="M12 3.2 6.8 9.5a7 7 0 1 0 10.4 0L12 3.2z"/>'),
    smartphone: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'),
    cpu: svg('<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2"/>'),
    phone: svg('<path d="M6.5 3.5h3l1.3 4-2 1.3a12 12 0 0 0 5.1 5.1l1.3-2 4 1.3v3a1.8 1.8 0 0 1-2 1.8A16.5 16.5 0 0 1 4.7 7.5a1.8 1.8 0 0 1 1.8-2z"/>'),
    mail: svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    pin: svg('<path d="M12 21s6.5-5 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 16 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z"/>'),
  };
})();
// Kroki konfiguratora dokłada JS po pobraniu katalogu, więc uzupełniamy też po każdym renderze.
function wstawIkony(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((e) => {
    const n = e.getAttribute("data-icon");
    if (IKONY[n] && !e.dataset.iconDone) { e.innerHTML = IKONY[n]; e.dataset.iconDone = "1"; }
    else if (!IKONY[n]) console.warn(`[ikony] brak ikony „${n}" — sprawdź IKONY w pakiety.js`);
  });
}
document.addEventListener("DOMContentLoaded", () => wstawIkony());

/* ---------- pomocnicze do budowy DOM (bez innerHTML z danymi) ---------- */
function h(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}
function krok(nr, tytul, opis, banerKlucz) {
  const s = h("div", "step");
  const head = h("div", "step-head");
  head.append(h("span", "step-num", String(nr)), h("h3", null, tytul));
  s.append(head);
  if (opis) s.append(h("p", "step-sub", opis));
  const b = banerKlucz && KATALOG.banery && KATALOG.banery[banerKlucz];
  if (b) {
    const im = h("img", "step-banner");
    im.src = `${API}${KATALOG_ZDJEC}/${b.plik}`; im.alt = b.alt; im.loading = "lazy";
    s.append(im);
  }
  return s;
}
/** Kafelek wyboru. `aktywny` steruje klasą .active, którą stylują wspólne style konfiguratora. */
function kafel(tytul, podpis, aktywny, onClick, wylaczony, zdjecie) {
  const b = h("button", "opt pk-opt" + (aktywny ? " active" : "") + (wylaczony ? " pk-off" : ""));
  b.type = "button";
  if (zdjecie) {
    // Zdjęcia leżą przy API, nie w tym repo — jeden komplet plików dla CRM, landingu i PDF.
    const im = h("img", "pk-foto");
    im.src = `${API}${KATALOG_ZDJEC}/${zdjecie}`;
    im.alt = ""; im.loading = "lazy";
    b.append(im);
  }
  const body = h("div", "opt-body");
  body.append(h("strong", null, tytul));
  if (podpis) body.append(h("span", "pk-sub", podpis));
  b.append(body);
  if (wylaczony) b.disabled = true;
  else b.addEventListener("click", onClick);
  return b;
}

/* ---------- wycena ---------- */
let ostatnieZadanie = 0;
let debounce = null;

function przeliczPozniej() {
  clearTimeout(debounce);
  debounce = setTimeout(przelicz, 250);
}

async function przelicz() {
  const moje = ++ostatnieZadanie;
  el("sumBrutto").classList.add("pk-czeka");
  try {
    const r = await fetch(API + "/api/pakiety/wycena", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg),
    });
    const j = await r.json();
    if (moje !== ostatnieZadanie) return; // wyścig — przyszła starsza odpowiedź
    if (!r.ok) { bladWyceny(j.error || "Nie udało się policzyć wyceny."); return; }
    wycena = j;
    bladWyceny(null); // udane przeliczenie kasuje poprzedni komunikat
    // Serwer normalizuje konfigurację (kolor niedostępny w BASIC, folia spoza serii)
    // — przyjmujemy JEGO wersję, żeby ekran nie pokazywał wyboru, którego wycena nie objęła.
    Object.assign(cfg, j.wybor);
    render();
    odswiezPodsumowanie();
  } catch (e) {
    if (moje === ostatnieZadanie) bladWyceny("Nie udało się policzyć wyceny — sprawdź połączenie i spróbuj ponownie.");
  } finally {
    if (moje === ostatnieZadanie) el("sumBrutto").classList.remove("pk-czeka");
  }
}

/** Błąd wyceny — przy cenie. */
function bladWyceny(tekst) {
  const box = el("sumErr");
  if (!box) return;
  box.textContent = tekst || "";
  box.hidden = !tekst;
}
/** Błąd formularza — przy formularzu. */
function bladFormularza(tekst) {
  const box = el("ordErr");
  box.textContent = tekst || "";
  box.hidden = !tekst;
}

function odswiezPodsumowanie() {
  if (!wycena) return;
  const pak = KATALOG.pakiety.find((p) => p.klucz === cfg.standard);
  el("sumStandard").textContent = pak.label;
  el("sumWymiar").textContent = `${lp(cfg.szerokosc)} × ${cfg.dlugosc} m · gł. ${lp(cfg.glebokosc)} m`;

  el("sumBrutto").textContent = zl(wycena.brutto);
  el("pasekCeny").hidden = false;

  el("ordPodsumowanie").textContent =
    `${pak.label} · ${lp(cfg.szerokosc)} × ${cfg.dlugosc} m · ${zl(wycena.brutto)} — prześlemy pełne zestawienie z opisem każdej pozycji.`;
}

/* ---------- render kroków ---------- */
function render() {
  const K = KATALOG;
  const pak = K.pakiety.find((p) => p.klucz === cfg.standard);
  const root = el("kroki");
  root.textContent = "";

  /* 1 — wymiary */
  {
    const s = krok(1, "Wymiary basenu", "Budujemy w dowolnym wymiarze — wpisz swój albo wybierz jeden z popularnych.");
    const g = h("div", "pk-wymiary");
    for (const [id, etykieta, krokWart, min, max] of [
      ["dlugosc", "Długość (m)", 0.5, 2, 20],
      ["szerokosc", "Szerokość (m)", 0.5, 2, 10],
    ]) {
      const lab = h("label", null, etykieta);
      const inp = h("input");
      Object.assign(inp, { type: "number", step: krokWart, min, max, value: cfg[id] });
      inp.addEventListener("input", () => { cfg[id] = Number(inp.value); przeliczPozniej(); });
      lab.append(inp);
      g.append(lab);
    }
    // Głębokość to wybór z dwóch wartości, nie pole liczbowe — bloczki dostawia się warstwami.
    {
      const lab = h("label", null, "Głębokość (m)");
      const box = h("div", "pk-glebokosci");
      for (const gl of K.glebokosci) {
        const b = h("button", "pk-glebokosc" + (cfg.glebokosc === gl ? " active" : ""), `${lp(gl)} m`);
        b.type = "button";
        b.addEventListener("click", () => { cfg.glebokosc = gl; przelicz(); });
        box.append(b);
      }
      lab.append(box);
      g.append(lab);
    }
    s.append(g);

    // Gotowe rozmiary jako duże kafelki na całą szerokość — większość klientów wybiera stąd,
    // a pola wyżej zostają dla wymiarów nietypowych.
    const szyb = h("div", "size-grid");
    for (const [L, W] of SZYBKIE) {
      const b = h("button", "size-tile" + (cfg.dlugosc === L && cfg.szerokosc === W ? " active" : ""));
      b.type = "button";
      b.append(h("div", "st-dim", `${lp(W)} × ${L} m`));
      b.append(h("div", "st-area", `${lp(L * W)} m² / ${lp(Math.round(L * W * cfg.glebokosc * 10) / 10)} m³ wody`));
      b.addEventListener("click", () => { cfg.dlugosc = L; cfg.szerokosc = W; przelicz(); });
      szyb.append(b);
    }
    s.append(szyb);

    if (wycena) {
      const sp = wycena.spec;
      s.append(h("p", "pk-spec",
        `${lp(sp.area)} m² lustra wody · ${lp(sp.objetosc)} m³ wody · ${sp.skimmery} skimmer${sp.skimmery > 1 ? "y" : ""}, ` +
        `${sp.dysze} dysze, ${sp.lampy} lampy LED · płyta ${lp(sp.plyta.sz)} × ${lp(sp.plyta.dl)} m`));
    }
    root.append(s);
  }

  /* 2 — standard */
  {
    const s = krok(2, "Standard wykonania", "Ten sam sposób budowy niecki w każdym pakiecie. Różni się folia, osprzęt, filtracja i płyta.");
    s.id = "standardy";
    const g = h("div", "pk-pakiety");
    for (const p of K.pakiety) {
      const b = h("button", "pk-pakiet" + (cfg.standard === p.klucz ? " active" : ""));
      b.type = "button";
      b.append(h("span", "pk-pakiet-nazwa", p.label.replace("ENERGOPOOL ", "")));
      b.append(h("span", "pk-pakiet-cena", wycena ? zl(wycena.standardy[p.klucz]) : "—"));
      b.append(h("span", "pk-pakiet-haslo", p.haslo));
      const ul = h("ul", "pk-pakiet-lista");
      for (const w of p.wyroznienia) ul.append(h("li", null, w));
      b.append(ul);
      b.addEventListener("click", () => { cfg.standard = p.klucz; przelicz(); });
      g.append(b);
    }
    s.append(g);
    s.append(h("p", "pk-spec",
      "Na kartach widzisz, ile kosztowałaby Twoja obecna konfiguracja w każdym standardzie — łącznie z wybranym wyposażeniem. " +
      "Opcje niedostępne w danym pakiecie (np. prace ziemne poza PREMIUM) nie są w tej kwocie liczone."));
    root.append(s);
  }

  /* 3 — system urządzeń */
  {
    const s = krok(3, "System urządzeń",
      `${K.systemyHaslo} ${pak.systemDoWyboru
        ? "Spójny zestaw urządzeń jednej klasy — wybierasz raz, zamiast składać sprzęt po sztuce."
        : "W tym pakiecie system jest narzucony."}`, "system");
    const g = h("div", "pk-siatka pk-siatka-2 pk-siatka-opis");
    for (const sys of K.systemy) {
      g.append(kafel(sys.label, sys.opis, cfg.system === sys.klucz,
        () => { cfg.system = sys.klucz; przelicz(); },
        !pak.systemDoWyboru && cfg.system !== sys.klucz, sys.zdjecie));
    }
    s.append(g);
    root.append(s);
  }

  /* 4 — folia */
  {
    const seria = pak.foliaSeria;
    const s = krok(4, "Kolor folii basenowej",
      `${seria.label} — ${mm(seria.gruboscMm)} mm, zgrzewana ${seria.zgrzewanie}. ${K.foliaOpisSerii[pak.foliaSeriaKlucz] || ""}`, "folia");
    const g = h("div", "pk-siatka");
    const kolory = K.folie[pak.foliaSeriaKlucz] || [];
    for (const f of kolory) {
      g.append(kafel(f.nazwa, null, cfg.foliaKod === f.kod, () => { cfg.foliaKod = f.kod; przelicz(); }, false, f.zdjecie));
    }
    s.append(g);
    root.append(s);
  }

  /* 5 — osprzęt */
  {
    const s = krok(5, "Osprzęt niecki", "Skimmery, dysze i lampy Tebas — cały komplet w jednym kolorze.");
    const g = h("div", "pk-siatka pk-siatka-opis");
    for (const c of K.koloryOsprzetu) {
      const dostepny = pak.koloryWCenie.includes(c.klucz);
      g.append(kafel(c.label, dostepny ? [c.ral, c.opis].filter(Boolean).join(" · ") : "tylko w wyższym pakiecie",
        cfg.kolorOsprzetu === c.klucz, () => { cfg.kolorOsprzetu = c.klucz; przelicz(); }, !dostepny,
        K.osprzetZdjecia && K.osprzetZdjecia[cfg.typSkimmera === "slim" ? "skimmer_slim" : "skimmer_szeroki"]));
    }
    s.append(g);
    s.append(h("h4", "pk-podtytul", "Typ skimmera"));
    const g2 = h("div", "pk-siatka pk-siatka-2 pk-siatka-opis");
    for (const t of K.typySkimmera) {
      g2.append(kafel(t.label, t.opis, cfg.typSkimmera === t.klucz,
        () => { cfg.typSkimmera = t.klucz; przelicz(); }, false, t.zdjecie));
    }
    s.append(g2);
    root.append(s);
  }

  /* 6 — schody */
  {
    const s = krok(6, "Schody", "Konstrukcja z bloczków zalewanych betonem, wykończona tą samą folią co niecka.");
    const g = h("div", "pk-siatka pk-siatka-3 pk-siatka-opis");
    for (const x of K.schody) {
      g.append(kafel(x.label, [x.opis, x.wCenie ? "w standardzie" : "dopłata"].filter(Boolean).join(" · "),
        cfg.schody === x.klucz, () => { cfg.schody = x.klucz; przelicz(); }, false, x.zdjecie));
    }
    s.append(g);
    root.append(s);
  }

  /* 7 — zakres robót */
  {
    const s = krok(7, "Zakres robót", null, "roboty");
    const g = h("div", "pk-siatka pk-siatka-2");
    g.append(kafel("Płyta fundamentowa",
      "O 50 cm szersza od lustra wody z każdej strony" + (pak.plytaXps ? " · ocieplona styrodurem XPS 300" : ""),
      cfg.plyta, () => { cfg.plyta = !cfg.plyta; przelicz(); }));
    g.append(kafel("Prace ziemne — „Pod klucz”",
      "Wykop, przygotowanie podłoża i obsypanie niecki po naszej stronie. Domyślnie wyłączone — koparkowy z okolicy zwykle wychodzi taniej.",
      cfg.praceZiemne, () => { cfg.praceZiemne = !cfg.praceZiemne; przelicz(); }));
    s.append(g);
    // Drenaż ma sens wyłącznie razem z naszym wykopem — bez prac ziemnych kafelek się nie pokazuje.
    if (cfg.praceZiemne) {
      const gd = h("div", "pk-siatka pk-siatka-2");
      gd.append(kafel(K.drenaz.label, K.drenaz.opis, cfg.drenaz,
        () => { cfg.drenaz = !cfg.drenaz; przelicz(); }));
      s.append(gd);
    }
    root.append(s);
  }

  /* 8 — pomieszczenie techniczne */
  {
    const s = krok(8, "Pomieszczenie techniczne",
      "Miejsce na filtrację, pompę i automatykę. Jeśli masz garaż lub budynek gospodarczy w pobliżu, nie potrzebujesz osobnego.");
    const g = h("div", "pk-siatka pk-siatka-3 pk-siatka-opis");
    for (const d of K.pomieszczenieTechniczne) {
      g.append(kafel(d.label, d.opis, cfg.pomieszczenieTechniczne === d.klucz,
        () => { cfg.pomieszczenieTechniczne = d.klucz; przelicz(); }, false, d.zdjecie));
    }
    s.append(g);
    root.append(s);
  }

  /* 9 — wyposażenie */
  {
    const s = krok(9, "Wyposażenie i automatyka", null, "wyposazenie");
    const g = h("div", "pk-siatka pk-siatka-2");
    // Opcje ograniczone pakietem zostają WIDOCZNE, tylko wyszarzone — klient ma wiedzieć,
    // co dostanie po przejściu wyżej, zamiast szukać znikającego kafelka.
    const sys = K.systemy.find((x) => x.klucz === cfg.system) || K.systemy[0];
    const niedostepne = {
      postument: !cfg.pompaCiepla,
      // Zawór iWASH sterują wyłącznie pompy Fairland/Aquagem.
      iwash: !sys.iwash,
      // Przeciwprąd Swim Jet istnieje tylko w systemie Fairland.
      przeciwprad: !sys.przeciwprad,
    };
    const POWOD = { postument: "Tylko razem z pompą ciepła" };
    for (const o of K.wyposazenie) {
      const off = !!niedostepne[o.klucz];
      const podpis = off ? (POWOD[o.klucz] || o.opisNiedostepny || "Dostępne w wyższym pakiecie") : o.opis;
      g.append(kafel(o.label, podpis, !!cfg[o.klucz],
        () => { cfg[o.klucz] = !cfg[o.klucz]; przelicz(); }, off, o.zdjecie));
    }
    s.append(g);

    if (pak.pompyCiepla && pak.pompyCiepla.length > 1) {
      s.append(h("h4", "pk-podtytul", "Linia pompy ciepła"));
      const gp = h("div", "pk-siatka pk-siatka-2 pk-siatka-opis");
      for (const l of pak.pompyCiepla) {
        gp.append(kafel(l.label, cfg.pompaCiepla ? l.opis : "Najpierw zaznacz pompę ciepła",
          cfg.liniaPompyCiepla === l.klucz, () => { cfg.liniaPompyCiepla = l.klucz; przelicz(); },
          !cfg.pompaCiepla, "pompa-ciepla-fairland.jpg"));
      }
      s.append(gp);
    }

    s.append(h("h4", "pk-podtytul", "Odkurzacz automatyczny"));
    const g2 = h("div", "pk-siatka pk-siatka-3");
    for (const o of K.odkurzacze) {
      g2.append(kafel(o.label, o.opis, cfg.odkurzacz === o.klucz,
        () => { cfg.odkurzacz = o.klucz; przelicz(); }, false, o.zdjecie));
    }
    s.append(g2);
    root.append(s);
  }

  wstawIkony(root);
}

/* ---------- formularz ---------- */
function podepnijFormularz() {
  el("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    bladFormularza(null);

    const dane = {
      imie: el("ordName").value.trim(),
      email: el("ordEmail").value.trim(),
      telefon: el("ordPhone").value.trim(),
      miasto: el("ordLoc").value.trim(),
      rodo: el("ordRodo").checked,
      firma: el("ordFirma").value,
    };
    if (!dane.imie || !dane.email) { bladFormularza("Podaj imię i adres e-mail."); return; }
    if (!dane.rodo) { bladFormularza("Potrzebujemy zgody na kontakt, żeby odesłać wycenę."); return; }

    const btn = el("ordSubmit");
    btn.disabled = true;
    btn.textContent = "Wysyłam…";
    try {
      const r = await fetch(API + "/api/pakiety/zapytanie", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({}, dane, { konfiguracja: cfg, brutto: wycena ? wycena.brutto : null })),
      });
      const j = await r.json();
      if (!r.ok) { bladFormularza(j.error || "Nie udało się wysłać zgłoszenia."); return; }
      el("orderForm").hidden = true;
      el("orderDone").hidden = false;
    } catch (e2) {
      bladFormularza("Brak połączenia — spróbuj ponownie za chwilę.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Wyślij i odbierz wycenę";
    }
  });
}

/* ---------- start ---------- */
(async function start() {
  el("year").textContent = new Date().getFullYear();
  podepnijFormularz();
  try {
    const r = await fetch(API + "/api/pakiety/katalog");
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "brak katalogu");
    KATALOG = j.katalog;
    KATALOG_ZDJEC = KATALOG.zdjeciaKatalog || "/pakiety";
    el("ladowanie").remove();
    await przelicz();
  } catch (e) {
    el("ladowanie").textContent = "";
    el("ladowanie").append(h("p", "step-sub",
      "Konfigurator jest chwilowo niedostępny. Zadzwoń: +48 500 560 245 — policzymy wycenę od ręki."));
  }
})();
