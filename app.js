/* ====================== ENERGOPOOL — logika konfiguratora ====================== */
(function () {
  "use strict";

  // ---- format ceny ----
  const PLN = new Intl.NumberFormat("pl-PL");
  // spacje niełamiące ( ), aby cena nigdy nie dzieliła się między wiersze
  const fmt = (n) => PLN.format(n).replace(/\s/g, " ") + " zł";

  // ---- ikony (cienkie, monochromatyczne, dziedziczą currentColor) ----
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICONS = {
    bolt: svg('<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l1-8z"/>'),
    shield: svg('<path d="M12 3 5 5.8V11c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V5.8L12 3z"/>'),
    sliders: svg('<path d="M4 21v-6M4 11V3M12 21v-8M12 9V3M20 21v-5M20 12V3M1.5 15h5M9.5 9h5M17.5 16h5"/>'),
    droplet: svg('<path d="M12 3.2 6.8 9.5a7 7 0 1 0 10.4 0L12 3.2z"/>'),
    smartphone: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'),
    cpu: svg('<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2"/>'),
    phone: svg('<path d="M6.5 3.5h3l1.3 4-2 1.3a12 12 0 0 0 5.1 5.1l1.3-2 4 1.3v3a1.8 1.8 0 0 1-2 1.8A16.5 16.5 0 0 1 4.7 7.5a1.8 1.8 0 0 1 1.8-2z"/>'),
    mail: svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    printer: svg('<path d="M7 8V3h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/>'),
    spark: svg('<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M12 8.5 13 11l2.5 1-2.5 1-1 2.5-1-2.5L8.5 12 11 11z"/>'),
    pin: svg('<path d="M12 21s6.5-5 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 16 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z"/>'),
    lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>')
  };
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (ICONS[name] && !el.dataset.iconDone) { el.innerHTML = ICONS[name]; el.dataset.iconDone = "1"; }
    });
  }

  // ---- obrazy opcji ----
  const IMG = {
    stairsStraight: "assets/img_033.png",
    stairsCorner:   "assets/img_032.png",
    stairsShelf:    "assets/img_034.png",
    heatStd:        "assets/img_040.png",
    heatPrem:       "assets/img_041.jpeg",
    electro:        "assets/img_037.png",
    uv:             "assets/img_036.png",
    cfNone:         "assets/img_043.jpeg",
    cfExt:          "assets/img_042.png",
    cfIn:           "assets/img_046.png",
    iwash:          "assets/img_047.png",
    niya35:         "assets/niya35.png",
    niya55:         "assets/niya55.png",
    slab:           "assets/img_053.jpeg",
    techRoom:       "assets/img_051.png",
    techRoomUnder:  "assets/techroom-underground.jpg"
  };

  // ---- stan ----
  const state = {
    size: "3x6",
    stairs: "corner",
    heat: "none",
    electro: false,
    uv: false,
    cf: "none",
    iwash: false,
    niya35: false,
    niya55: false,
    slab: false,
    techRoom: false,
    techRoomUnder: false,
    foil: "Vanity"
  };

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* =================== BRAMKA WYCENY (lead gate) =================== */
  const LEAD_KEY = "ep_lead_v1";
  function getLead() {
    try { return JSON.parse(localStorage.getItem(LEAD_KEY)); } catch { return null; }
  }
  function isUnlocked() { return !!getLead(); }
  function saveLead(l) { localStorage.setItem(LEAD_KEY, JSON.stringify(l)); }
  // pomoc przy testach: window.epReset() czyści odblokowanie
  window.epReset = function () { localStorage.removeItem(LEAD_KEY); location.reload(); };

  /* =================== KROK 1: ROZMIAR =================== */
  function renderSizes() {
    const grid = $("#sizeGrid");
    grid.innerHTML = Object.entries(SIZES).map(([key, s]) => `
      <div class="size-tile${key === state.size ? " active" : ""}" data-size="${key}">
        <div class="st-dim">${s.label}</div>
        <div class="st-area">${String(s.area).replace(".", ",")} m² wody</div>
      </div>`).join("");
    grid.querySelectorAll(".size-tile").forEach((t) =>
      t.addEventListener("click", () => { state.size = t.dataset.size; renderAll(); }));
  }

  function renderSpec() {
    const s = SIZES[state.size];
    const dep = String(s.depth).replace(".", ",");
    const area = String(s.area).replace(".", ",");
    const rows = [
      ["Wymiary niecki", s.label + " × " + dep + " m"],
      ["Powierzchnia wody", area + " m²"],
      ["Filtr piaskowy", s.filter],
      ["Pompa cyrkulacyjna", s.pump],
      ["Złoże filtracyjne", "Aktywne AFM (szkło)"],
      ["Skimmery ASTRALPOOL", s.skimmer + " szt."],
      ["Dysze napływowe", s.dysze + " szt."],
      ["Lampy RGB-LED LUMIPLUS", s.lampy + " szt."],
      ["Folia zgrzewana RENOLIT", "2,0 mm"],
      ["Instalacja PVC-U + elektryka", "w cenie"]
    ];
    $("#specPanel").innerHTML =
      `<div class="sp-title">W cenie pakietu podstawowego ${s.label}</div>` +
      `<div class="spec-grid">` +
      rows.map(([a, b]) => `<div class="spec-item"><span class="sl">${a}</span><span class="sv">${b}</span></div>`).join("") +
      `</div>`;
  }

  /* =================== KROK 2: SCHODY =================== */
  function renderStairs() {
    const s = SIZES[state.size];
    const opts = [
      { id: "corner",   img: IMG.stairsCorner,   name: "Schody narożne", hint: "Wygodne wejście schowane w rogu basenu — nie zabiera miejsca do pływania. Wersja w cenie pakietu.", desc: "Wbudowane w narożnik · w cenie", price: 0, free: true },
      { id: "straight", img: IMG.stairsStraight, name: "Schody proste", hint: "Szerokie schody na całą ścianę basenu — najłatwiejsze i najbezpieczniejsze zejście, także dla dzieci i seniorów.", desc: "Na całą szerokość ściany", price: s.stairs.straight },
      { id: "shelf",    img: IMG.stairsShelf,    name: "Proste z półką", hint: "Schody z szeroką półką (ławeczką) tuż pod lustrem wody — miejsce do siedzenia, relaksu i bezpiecznej zabawy dzieci.", desc: "Z półką do siedzenia i relaksu", price: s.stairs.shelf }
    ];
    $("#stairsGrid").innerHTML = opts.map((o) => optCard("stairs", o, state.stairs === o.id)).join("");
    bindRadio("#stairsGrid", "stairs");
  }

  /* =================== KROK 3: POMPA CIEPŁA =================== */
  function renderHeat() {
    const s = SIZES[state.size];
    const opts = [
      { id: "std",  img: IMG.heatStd,  name: "Standard — Fairland INVER X13", hint: "Ogrzewa wodę, żeby pływać już od wiosny aż do jesieni. Cicha i oszczędna (technologia Full-Inverter), sterowana z telefonu przez Wi-Fi.", desc: "Full-Inverter · " + s.heatStd.kw + " · Wi-Fi", price: s.heatStd.price },
      { id: "prem", img: IMG.heatPrem, name: "Premium — Fairland INVER X20", hint: "Mocniejsza i najoszczędniejsza pompa — szybciej nagrzewa wodę, a w upały potrafi ją też schłodzić. Najdłuższy komfortowy sezon kąpielowy.", desc: "Grzanie + chłodzenie · Turbo · " + s.heatPrem.kw, price: s.heatPrem.price }
    ];
    $("#heatGrid").innerHTML = opts.map((o) => optCard("heat", o, state.heat === o.id)).join("");
    bindRadio("#heatGrid", "heat", true);
  }

  /* =================== KROK 4: UZDATNIANIE WODY =================== */
  function renderWater() {
    const s = SIZES[state.size];
    const cards = [
      checkCard("electro", IMG.electro, "Elektrolizer soli Fairland InverPure Pro",
        "Zasolenie tylko 1 g/l · tryb Turbo 120% · " + s.electro.cap, s.electro.price, state.electro,
        "Sam wytwarza środek do dezynfekcji ze zwykłej soli — koniec z kupowaniem i dozowaniem chloru. Woda miękka, bezzapachowa i przyjazna dla skóry i oczu."),
      checkCard("uv", IMG.uv, "Stacja UV Elecro Quantum Q-65",
        "Technologia Nano Crystal · woda o diamentowym połysku", s.uv, state.uv,
        "Lampa UV niszczy bakterie i glony światłem, bez chemii. Woda jest krystalicznie czysta i zdrowsza — świetne uzupełnienie do elektrolizera.")
    ];
    $("#waterGrid").innerHTML = cards.join("");
    bindCheck("#waterGrid");
  }

  /* =================== KROK 5: PRZECIWPRĄD =================== */
  function renderCf() {
    const s = SIZES[state.size];
    const opts = [
      { id: "ext",  img: IMG.cfExt, name: "Fairland Swim Jet M — zewnętrzny", hint: "Tworzy silny strumień wody, w którym pływasz w miejscu — trening bez końca nawet w krótkim basenie. Montowany na krawędzi, bez przeróbek niecki (Plug & Play).", desc: "Zawieszany na ścianie · " + s.cfExt.spec, price: s.cfExt.price },
      { id: "in",   img: IMG.cfIn,  name: "Fairland Swim Jet F — do zabudowy", hint: "To samo pływanie pod prąd, ale dysza ukryta w ścianie basenu — efektowny, zabudowany wygląd i płynna regulacja siły strumienia.", desc: "Wbudowany w ścianę · " + s.cfIn.spec, price: s.cfIn.price }
    ];
    $("#cfGrid").innerHTML = opts.map((o) => optCard("cf", o, state.cf === o.id)).join("");
    bindRadio("#cfGrid", "cf", true);
  }

  /* =================== KROK 6: DODATKI =================== */
  function renderExtras() {
    const cards = [
      checkCard("iwash", IMG.iwash, "Automatyczny zawór płukania iWASH",
        "Dotykowe sterowanie · InverClear Tech · gwarancja 5 lat", FIXED.iwash, state.iwash,
        "Automatycznie płucze filtr — czynność, którą normalnie trzeba robić ręcznie co tydzień. Mniej obsługi, czystsza woda, wszystko sterowane dotykowo."),
      checkCard("niya35", IMG.niya35, "Odkurzacz Dolphin Niya Tracker 35",
        "Bezprzewodowy · 2 szczotki · dno i ściany · cykl 2,5 h · kosz 150 µm · app · gw. 24 mies.", FIXED.niya35, state.niya35,
        "Najnowszy bezprzewodowy robot Maytronics (Dolphin) do basenów do 12 m. Sam czyści dno i ściany, tryby ECO/Standard, program ustawiasz w aplikacji Niya — wrzucasz do wody i odzyskujesz wolny czas."),
      checkCard("niya55", IMG.niya55, "Odkurzacz Dolphin Niya Tracker 55",
        "Bezprzewodowy · 2 szczotki · dno i ściany · cykl 2,5 h · kosz 150 µm · app · gw. 24 mies.", FIXED.niya55, state.niya55,
        "Topowy model serii Niya — mocniejszy odpowiednik „35” dla wymagających. Kompleksowe czyszczenie dna i ścian, pełna personalizacja programów w aplikacji, filtr 150 µm, gwarancja 24 miesiące.")
    ];
    $("#extrasGrid").innerHTML = cards.join("");
    bindCheck("#extrasGrid");
  }

  /* =================== KROK 7: PRACE ZIEMNE =================== */
  function renderGround() {
    const s = SIZES[state.size];
    const cards = [
      checkCard("slab", IMG.slab, "Płyta fundamentowa ENERGO STANDARD PLUS",
        "Zbrojona, 20 cm, beton C30/37 W10 · materiał i robocizna", s.slab, state.slab,
        "Solidny betonowy fundament, na którym stanie basen — podstawa trwałej i stabilnej konstrukcji na lata. Cena obejmuje materiał i robociznę."),
      checkCard("techRoom", IMG.techRoom, "Pomieszczenie techniczne wolnostojące",
        "209 × 102 × 115 cm · płyta warstwowa 40 mm · z montażem", FIXED.techRoom, state.techRoom,
        "Gotowy, zamykany domek obok basenu na pompę, filtr i sterowanie — chroni urządzenia przed pogodą i ukrywa całą technikę. Dostarczany z montażem."),
      checkCard("techRoomUnder", IMG.techRoomUnder, "Pomieszczenie techniczne podziemne",
        "Podziemna komora na całą technikę basenu · z montażem", FIXED.techRoomUnder, state.techRoomUnder,
        "Podziemna komora tuż przy basenie mieszcząca pompy, filtrację i sterowanie — cała technika schowana pod ziemią, niewidoczna w ogrodzie, z wygodnym dostępem serwisowym.")
    ];
    $("#groundGrid").innerHTML = cards.join("");
    bindCheck("#groundGrid");
  }

  /* =================== KROK 8: FOLIA =================== */
  function renderFoil() {
    $("#foilGrid").innerHTML = FOILS.map((f) => `
      <div class="foil${f.name === state.foil ? " active" : ""}" data-foil="${f.name}">
        <img src="${f.img}" alt="Folia ${f.name}" loading="lazy">
        <span>${f.name}</span>
      </div>`).join("");
    $("#foilGrid").querySelectorAll(".foil").forEach((el) =>
      el.addEventListener("click", () => { state.foil = el.dataset.foil; renderFoil(); recalc(); }));
  }

  /* =================== KOMPONENTY KART =================== */
  function optCard(group, o, active) {
    const img = o.noimg
      ? `<div class="opt-img opt-img-empty">✦</div>`
      : `<img class="opt-img" src="${o.img}" alt="" loading="lazy">`;
    return `
      <label class="opt${active ? " active" : ""}" data-val="${o.id}">
        ${img}
        <div class="opt-body">
          <div class="opt-name">${o.name}</div>
          ${o.hint ? `<div class="opt-hint">${o.hint}</div>` : ""}
          ${o.desc ? `<div class="opt-desc">${o.desc}</div>` : ""}
        </div>
        <span class="opt-check"></span>
      </label>`;
  }

  // price param zachowany dla zgodności wywołań; ceny nie są pokazywane na stronie
  function checkCard(key, img, name, desc, price, active, hint) {
    return `
      <label class="opt${active ? " active" : ""}" data-key="${key}">
        <img class="opt-img" src="${img}" alt="" loading="lazy">
        <div class="opt-body">
          <div class="opt-name">${name}</div>
          ${hint ? `<div class="opt-hint">${hint}</div>` : ""}
          <div class="opt-desc">${desc}</div>
        </div>
        <span class="opt-check"></span>
      </label>`;
  }

  function bindRadio(sel, group, deselectable) {
    document.querySelectorAll(sel + " .opt").forEach((el) =>
      el.addEventListener("click", () => {
        state[group] = (deselectable && state[group] === el.dataset.val) ? "none" : el.dataset.val;
        rerenderGroup(group);
        recalc();
      }));
  }
  function bindCheck(sel) {
    document.querySelectorAll(sel + " .opt").forEach((el) =>
      el.addEventListener("click", () => {
        const k = el.dataset.key;
        state[k] = !state[k];
        el.classList.toggle("active", state[k]);
        recalc();
      }));
  }
  function rerenderGroup(group) {
    if (group === "stairs") renderStairs();
    else if (group === "heat") renderHeat();
    else if (group === "cf") renderCf();
  }

  /* =================== KALKULACJA + PODSUMOWANIE =================== */
  function buildItems() {
    const s = SIZES[state.size];
    const items = [];
    items.push({ name: `Pakiet podstawowy ENERGOPOOL ${s.label}`, price: s.base, base: true });

    if (state.stairs === "straight") items.push({ name: "Schody proste", price: s.stairs.straight });
    else if (state.stairs === "shelf") items.push({ name: "Schody proste z półką", price: s.stairs.shelf });

    if (state.heat === "std") items.push({ name: `Pompa ciepła Fairland INVER X13 (${s.heatStd.kw})`, price: s.heatStd.price });
    else if (state.heat === "prem") items.push({ name: `Pompa ciepła Fairland INVER X20 (${s.heatPrem.kw})`, price: s.heatPrem.price });

    if (state.electro) items.push({ name: `Elektrolizer soli InverPure Pro (${s.electro.cap})`, price: s.electro.price });
    if (state.uv) items.push({ name: "Stacja UV Elecro Quantum Q-65", price: s.uv });

    if (state.cf === "ext") items.push({ name: `Przeciwprąd zewnętrzny Swim Jet M (${s.cfExt.spec})`, price: s.cfExt.price });
    else if (state.cf === "in") items.push({ name: `Przeciwprąd do zabudowy Swim Jet F (${s.cfIn.spec})`, price: s.cfIn.price });

    if (state.iwash) items.push({ name: "Automatyczny zawór płukania iWASH", price: FIXED.iwash });
    if (state.niya35) items.push({ name: "Odkurzacz Dolphin Niya Tracker 35", price: FIXED.niya35 });
    if (state.niya55) items.push({ name: "Odkurzacz Dolphin Niya Tracker 55", price: FIXED.niya55 });

    if (state.slab) items.push({ name: "Płyta fundamentowa ENERGO STANDARD PLUS", price: s.slab });
    if (state.techRoom) items.push({ name: "Pomieszczenie techniczne wolnostojące", price: FIXED.techRoom });
    if (state.techRoomUnder) items.push({ name: "Pomieszczenie techniczne podziemne", price: FIXED.techRoomUnder });

    return items;
  }

  // Ceny nie są pokazywane na stronie — przeliczamy tylko do zgłoszenia/oferty.
  function recalc() {
    const items = buildItems();
    state._lastItems = items;
    state._lastTotal = items.reduce((a, b) => a + b.price, 0);
  }

  function renderAll() {
    renderSizes();
    renderSpec();
    renderStairs();
    renderHeat();
    renderWater();
    renderCf();
    renderExtras();
    renderGround();
    renderFoil();
    recalc();
  }

  /* =================== TEKST KONFIGURACJI (do zgłoszenia i oferty) =================== */
  function quoteText() {
    const s = SIZES[state.size];
    const items = buildItems();
    let t = `KONFIGURACJA BASENU ENERGOPOOL\n`;
    t += `Moderna Pool&Spa Sp. z o.o.\n`;
    t += `==============================\n\n`;
    t += `Rozmiar: ${s.label} (${String(s.area).replace(".", ",")} m² wody, gł. ${String(s.depth).replace(".", ",")} m)\n`;
    t += `Kolor folii RENOLIT: ${state.foil}\n\n`;
    t += `WYBRANE ELEMENTY:\n`;
    items.forEach((it) => { t += `  • ${it.name}: ${fmt(it.price)}\n`; });
    t += `\nCENA CAŁKOWITA BRUTTO: ${fmt(state._lastTotal)}\n\n`;
    t += `Wyposażenie w pakiecie podstawowym: filtr ${s.filter}, pompa ${s.pump}, `;
    t += `${s.skimmer} skimmer(y), ${s.dysze} dysze, ${s.lampy} lampy RGB-LED, złoże AFM, instalacja PVC-U.\n\n`;
    t += `Cena informacyjna, nie stanowi oferty w rozumieniu art. 66 §1 K.C.\n`;
    return t;
  }

  /* =================== OFERTA PDF (szablon A4 — referencja do portu w moderna-system) ===================
     Podgląd/wydruk po stronie klienta usunięty (ceny nie mogą być widoczne w przeglądarce).
     buildOffer() zachowany jako wzorzec układu oferty dla backendu, który generuje PDF. */
  const COMPANY = {
    addr1: "ul. św. Teresy od Dzieciątka Jezus 91",
    addr2: "91-341 Łódź",
    phone: "+48 500 560 245",
    email: "biuro@moderna-spa.pl",
    web: "moderna-baseny.pl",
    web2: "moderna-spa.pl",
    hours: "Pon–Pt 10:00–17:00 · Sob 10:00–14:00"
  };
  const OA = {
    hero: "assets/img_001.jpeg",     // okładka — basen infinity
    band: "assets/konstrukcja.jpg",  // „dlaczego" — render konstrukcji
    photo: "assets/img_027.jpeg",    // specyfikacja — realizacja
    logo: "assets/img_002.png",      // logo (wersja jasna, na granat)
    real: ["assets/img_003.jpeg", "assets/img_019.jpeg", "assets/img_034.png"]
  };
  const CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4 4 10-10.5"/></svg>';
  const pad2 = (n) => String(n).padStart(2, "0");
  const plDate = (d) => d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

  function offerGroups(s) {
    const G = [];
    G.push({ label: "Pakiet podstawowy", rows: [
      { nm: `Basen ENERGOPOOL ${s.label}`, sub: "Niecka bloczkowo-betonowa · folia · filtracja · instalacja PVC-U + elektryka", price: s.base, base: true }
    ] });
    const fin = [];
    if (state.stairs === "corner") fin.push({ nm: "Schody narożne", price: 0, free: true });
    else if (state.stairs === "straight") fin.push({ nm: "Schody proste", price: s.stairs.straight });
    else if (state.stairs === "shelf") fin.push({ nm: "Schody proste z półką", price: s.stairs.shelf });
    fin.push({ nm: `Folia RENOLIT ALKORPLAN — ${state.foil}`, price: 0, free: true });
    G.push({ label: "Wykończenie i schody", rows: fin });
    const tech = [];
    if (state.heat === "std") tech.push({ nm: `Pompa ciepła Fairland INVER X13 · ${s.heatStd.kw}`, price: s.heatStd.price });
    else if (state.heat === "prem") tech.push({ nm: `Pompa ciepła Fairland INVER X20 · ${s.heatPrem.kw}`, price: s.heatPrem.price });
    if (state.electro) tech.push({ nm: `Elektrolizer soli InverPure Pro (${s.electro.cap})`, price: s.electro.price });
    if (state.uv) tech.push({ nm: "Stacja UV Elecro Quantum Q-65", price: s.uv });
    if (state.cf === "ext") tech.push({ nm: `Przeciwprąd zewnętrzny Swim Jet M · ${s.cfExt.spec}`, price: s.cfExt.price });
    else if (state.cf === "in") tech.push({ nm: `Przeciwprąd do zabudowy Swim Jet F · ${s.cfIn.spec}`, price: s.cfIn.price });
    if (state.iwash) tech.push({ nm: "Automatyczny zawór płukania iWASH", price: FIXED.iwash });
    if (state.niya35) tech.push({ nm: "Odkurzacz Dolphin Niya Tracker 35", price: FIXED.niya35 });
    if (state.niya55) tech.push({ nm: "Odkurzacz Dolphin Niya Tracker 55", price: FIXED.niya55 });
    if (tech.length) G.push({ label: "Technika i wyposażenie", rows: tech });
    const gr = [];
    if (state.slab) gr.push({ nm: "Płyta fundamentowa ENERGO STANDARD PLUS", price: s.slab });
    if (state.techRoom) gr.push({ nm: "Pomieszczenie techniczne wolnostojące", price: FIXED.techRoom });
    if (state.techRoomUnder) gr.push({ nm: "Pomieszczenie techniczne podziemne", price: FIXED.techRoomUnder });
    if (gr.length) G.push({ label: "Prace ziemne i budowlane", rows: gr });
    return G;
  }

  function offerRow(r) {
    const price = r.free ? `<div class="pr free">W cenie</div>` : `<div class="pr">${fmt(r.price)}</div>`;
    const sub = (r.base && r.sub) ? `<div class="sub">${r.sub}</div>` : ""; // opis tylko przy pakiecie bazowym
    return `<div class="row"><div><div class="nm">${r.nm}</div>${sub}</div>
      <div class="rt"><span class="qty">1×</span>${price}</div></div>`;
  }

  // Realne zdjęcia tego, co jest w ofercie (folia + wybrane wyposażenie).
  function offerSelected() {
    const out = [];
    const foil = (typeof FOILS !== "undefined") ? FOILS.find((f) => f.name === state.foil) : null;
    if (foil) out.push({ img: foil.img, cap: `Folia RENOLIT ${state.foil}`, fit: "cover" });
    if (state.heat === "std") out.push({ img: IMG.heatStd, cap: "Pompa ciepła INVER X13" });
    else if (state.heat === "prem") out.push({ img: IMG.heatPrem, cap: "Pompa ciepła INVER X20" });
    if (state.electro) out.push({ img: IMG.electro, cap: "Elektrolizer soli InverPure" });
    if (state.uv) out.push({ img: IMG.uv, cap: "Stacja UV Quantum Q-65" });
    if (state.cf === "ext") out.push({ img: IMG.cfExt, cap: "Przeciwprąd Swim Jet M" });
    else if (state.cf === "in") out.push({ img: IMG.cfIn, cap: "Przeciwprąd Swim Jet F" });
    if (state.iwash) out.push({ img: IMG.iwash, cap: "Zawór płukania iWASH" });
    if (state.niya35) out.push({ img: IMG.niya35, cap: "Odkurzacz Dolphin Niya 35" });
    if (state.niya55) out.push({ img: IMG.niya55, cap: "Odkurzacz Dolphin Niya 55" });
    return out.slice(0, 4);
  }

  function buildOffer() {
    const s = SIZES[state.size];
    const area = String(s.area).replace(".", ",");
    const depth = String(s.depth).replace(".", ",");
    const gross = state._lastTotal;
    const net = Math.round(gross / 1.23);
    const vat = gross - net;
    const today = new Date();
    const valid = new Date(today.getTime() + 30 * 864e5);
    const num = `EP/${today.getFullYear()}/${pad2(today.getMonth() + 1)}${pad2(today.getDate())}`;

    const cover4 = [
      { v: s.label, l: "Wymiary niecki" },
      { v: area + " m²", l: "Powierzchnia wody" },
      { v: depth + " m", l: "Głębokość" },
      { v: state.foil, l: "Kolor folii" }
    ];
    const spec6 = [
      { l: "Wymiary niecki", v: s.label },
      { l: "Powierzchnia wody", v: area + " m²" },
      { l: "Głębokość", v: depth + " m" },
      { l: "Filtracja", v: s.filter },
      { l: "Pompa cyrkulacyjna", v: s.pump },
      { l: "Oświetlenie", v: `${s.lampy}× RGB-LED LUMIPLUS` }
    ];
    const included = [
      "Niecka bloczkowo-betonowa · ściany 25 cm, beton C30/37 W8",
      `Filtr piaskowy ${s.filter}`,
      "Aktywne złoże filtracyjne AFM (szkło)",
      `Pompa cyrkulacyjna ${s.pump}`,
      `${s.skimmer}× skimmer ASTRALPOOL · ${s.dysze}× dysza napływowa`,
      `${s.lampy}× lampa RGB-LED LUMIPLUS 22 W`,
      "Folia zgrzewana RENOLIT ALKORPLAN 2,0 mm",
      "Instalacja ciśnieniowa PVC-U + podstawowa elektryka"
    ];
    const pillars = [
      { icon: "bolt", t: "Ekstremalnie energooszczędny", x: "Pompy i urządzenia Full-Inverter — niskie koszty eksploatacji przez cały sezon." },
      { icon: "shield", t: "Wyjątkowo trwały", x: "Beton C30/37 W8 i folia RENOLIT 2,0 mm — najmocniejsza wykładzina basenowa." },
      { icon: "sliders", t: "W pełni konfigurowalny", x: "Pompa ciepła, elektrolizer, UV, przeciwprąd, automatyka — dobierasz dokładnie to, czego chcesz." },
      { icon: "cpu", t: "Nowoczesny i zautomatyzowany", x: "Sterowanie przez Wi-Fi i aplikację — pełna kontrola nad basenem z telefonu." }
    ];
    const warranty = [
      "2 lata gwarancji Wykonawcy na prace budowlane i montażowe",
      "2 lata na wykonane elementy instalacji elektrycznej",
      "Wyposażenie basenu — gwarancja producenta lub dystrybutora",
      "Serwis, części i wsparcie techniczne w Łodzi"
    ];
    const pay = [
      ["I — 50%", "po zaakceptowaniu oferty i podpisaniu umowy"],
      ["II — 25%", "po ukończeniu konstrukcji basenu"],
      ["III — 10%", "po ukończeniu montażu folii basenowej"],
      ["IV — 10%", "po montażu techniki i instalacji w pom. technicznym"],
      ["V — 5%", "po ukończeniu i uruchomieniu basenu"]
    ];
    const groups = offerGroups(s);

    return `
      <table class="osheet">
        <tfoot><tr><td><div class="foot-space"></div></td></tr></tfoot>
        <tbody>
          <tr><td>
            <section class="cover pagebody">
              <div class="cover-hero" style="background-image:url('${OA.hero}')">
                <div class="cover-hero-grad"></div>
                <div class="cover-top">
                  <img class="cover-logo" src="${OA.logo}" alt="Moderna Pool&Spa">
                  <div class="cover-date">Oferta przygotowana<b>${plDate(today)}</b></div>
                </div>
              </div>
              <div class="cover-body">
                <div class="kicker">ENERGOPOOL · Basen bloczkowo-betonowy</div>
                <h1 class="cover-title">ENERGOPOOL ${s.label}</h1>
                <p class="cover-slogan">Ekstremalnie energooszczędny, wyjątkowo trwały i w pełni konfigurowalny basen — zbudowany dokładnie pod Twoje potrzeby.</p>
                <div class="spec-row">${cover4.map((c) => `<div><div class="v">${c.v}</div><div class="l">${c.l}</div></div>`).join("")}</div>
                <div class="cover-meta">
                  ${(() => { const kl = getLead(); return kl
                    ? `<div><div class="ml">Klient</div><div class="mv">${esc(kl.name)}</div><div class="mx">${esc(kl.phone)} · ${esc(kl.email)}</div></div>`
                    : `<div><div class="ml">Klient</div><div class="mv"><span class="fill"></span></div><div class="mx"><span class="fill"></span></div></div>`; })()}
                  <div><div class="ml">Doradca handlowy</div><div class="mv">Moderna Pool&Spa</div><div class="mx">${COMPANY.phone} · ${COMPANY.email}</div></div>
                </div>
                <div class="cover-note">Oferta nr ${num} · ważna do ${plDate(valid)}</div>
              </div>
            </section>
          </td></tr>

          <tr><td>
            <section class="page">
              <div class="eyebrow">Dlaczego ENERGOPOOL</div>
              <h2 class="h-sec">Basen, który buduje się raz — i służy pokoleniom</h2>
              <p class="lead">Technologia bloczkowo-betonowa łączy trwałość konstrukcji żelbetowej z pełną swobodą konfiguracji wyposażenia. Projektujemy, budujemy i serwisujemy kompleksowo — od pomiaru po uruchomienie.</p>
              <div class="band" style="background-image:url('${OA.band}')"></div>
              <div class="pillars">${pillars.map((p) => `<div class="pillar"><div class="pill-ic">${ICONS[p.icon]}</div><div class="pill-t">${p.t}</div><div class="pill-x">${p.x}</div></div>`).join("")}</div>
            </section>
          </td></tr>

          <tr class="brk"><td>
            <section class="page">
              <div class="eyebrow">Specyfikacja techniczna</div>
              <h2 class="h-sec">ENERGOPOOL ${s.label}</h2>
              <p class="lead" style="margin-top:2mm">Technologia bloczkowo-betonowa · w ofercie ${num}</p>
              <div class="spec-duo">
                <div class="spec-photo" style="background-image:url('${OA.photo}')"></div>
                <div class="spec-cards">${spec6.map((c) => `<div class="spec-card"><div class="l">${c.l}</div><div class="v">${c.v}</div></div>`).join("")}</div>
              </div>
              <div class="eyebrow" style="margin-top:6mm">W cenie — wyposażenie podstawowe</div>
              <div class="checks">${included.map((x) => `<div class="chk">${CHK}<span>${x}</span></div>`).join("")}</div>
              ${(() => { const picks = offerSelected(); return picks.length ? `<div class="eyebrow" style="margin-top:6mm">W tej ofercie</div>
              <div class="picks" style="grid-template-columns:repeat(${picks.length},1fr)">${picks.map((p) => `<div class="pick"><div class="pim" style="background-image:url('${p.img}');background-size:${p.fit === "cover" ? "cover" : "contain"}"></div><div class="pcap">${p.cap}</div></div>`).join("")}</div>` : ""; })()}
              <p class="disc">Dane techniczne mają charakter poglądowy; konfiguracja z opcjami może zmieniać parametry. Nie stanowi oferty handlowej w rozumieniu art. 66 §1 Kodeksu cywilnego.</p>
            </section>
          </td></tr>

          <tr class="brk"><td>
            <section class="page">
              <div class="sum-head">
                <div><div class="eyebrow">Twoja konfiguracja</div><h2 class="h-sec">Zestawienie oferty</h2></div>
                <div class="meta">ENERGOPOOL ${s.label} · nr ${num}<br>ceny brutto (PLN) · VAT 23%</div>
              </div>
              ${groups.map((g) => `<div class="group"><div class="group-t"><span>${g.label}</span><span class="rule"></span></div>${g.rows.map(offerRow).join("")}</div>`).join("")}
              <div class="totals avoid">
                <div class="sumline"><span class="l">Wartość netto</span><span>${fmt(net)}</span></div>
                <div class="sumline"><span class="l">VAT 23%</span><span>${fmt(vat)}</span></div>
                <div class="grossbox"><span class="l">Do zapłaty (brutto)</span><span class="v">${fmt(gross)}</span></div>
              </div>
            </section>
          </td></tr>

          <tr class="brk"><td>
            <section class="page">
              <div class="eyebrow">Płatności i współpraca</div>
              <h2 class="h-sec">Realizacja krok po kroku</h2>
              <p class="lead" style="margin-top:3mm">Przejrzysty harmonogram płatności rozłożony na etapy budowy — płacisz za faktycznie wykonane prace.</p>
              <div style="margin-top:10mm">
                <div class="eyebrow">Gwarancja spokoju</div>
                <div class="warr2">${warranty.map((w) => `<div class="chk">${CHK}<span>${w}</span></div>`).join("")}</div>
              </div>
              <div class="pay" style="margin-top:11mm">
                <div class="eyebrow">Harmonogram płatności (transze)</div>
                <div class="pay-rows">${pay.map((p) => `<div class="pay-row"><b>${p[0]}</b><span>${p[1]}</span></div>`).join("")}</div>
              </div>
              <div class="terms" style="margin-top:13mm">
                <div><div class="th">Warunki oferty</div>Oferta ważna do ${plDate(valid)}. Ceny zawierają podatek VAT. Realizacja po potwierdzeniu zamówienia i podpisaniu umowy. Ceny mają charakter informacyjny i nie stanowią oferty w rozumieniu art. 66 §1 K.C.</div>
                <div class="signs"><div class="sign">Podpis klienta</div><div class="sign">Podpis doradcy</div></div>
              </div>
              <div class="cta" style="margin-top:16mm">
                <div><div class="t">Umów konsultację i pomiar</div><div class="s">Showroom w Łodzi · ${COMPANY.hours}</div></div>
                <div class="ph"><div class="k">Dział handlowy</div>${COMPANY.phone}</div>
              </div>
            </section>
          </td></tr>
        </tbody>
      </table>
      <footer class="running-foot">
        <div class="foot">
          <div class="f1"><div class="ft">Showroom / Salon sprzedaży</div><div class="fa">${COMPANY.addr1}<br>${COMPANY.addr2}</div></div>
          <div class="sep"></div>
          <div class="col2"><div class="fl">Kontakt</div><div class="fv">${COMPANY.phone}</div><div class="fv" style="opacity:.6">${COMPANY.email}</div></div>
          <div class="col3"><div class="fl">Portfolio</div><div class="fv">${COMPANY.web}</div><div class="fv">${COMPANY.web2}</div></div>
        </div>
      </footer>`;
  }

  /* =================== ZAMÓWIENIE WYCENY (formularz na stronie) =================== */
  const gateConfigured = () => !!(LEADS && LEADS.endpoint);

  // Wywołanie backendu (application/x-www-form-urlencoded — bez preflightu CORS)
  function api(payload) {
    return fetch(LEADS.endpoint, {
      method: "POST",
      body: new URLSearchParams({ data: JSON.stringify(payload) })
    }).then((r) => r.json());
  }

  function orderPayload() {
    const s = SIZES[state.size];
    const items = buildItems();
    const total = items.reduce((a, b) => a + b.price, 0);
    state._lastItems = items;
    state._lastTotal = total;
    return {
      action: "order",
      size: s.label,
      foil: state.foil,
      total: fmt(total),
      totalNum: total,
      items: items.map((it) => ({ name: it.name, price: it.price })),
      config: quoteText()
    };
  }

  function validOrder() {
    const name = $("#ordName").value.trim();
    const email = $("#ordEmail").value.trim();
    const phone = $("#ordPhone").value.trim();
    const loc = $("#ordLoc").value.trim();
    const rodo = $("#ordRodo").checked;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const phoneOk = /^(\+48)?\d{9}$/.test(phone.replace(/[\s-]/g, ""));
    $("#ordName").classList.toggle("bad", name.length < 3);
    $("#ordEmail").classList.toggle("bad", !emailOk);
    $("#ordPhone").classList.toggle("bad", !phoneOk);
    if (name.length < 3) return { err: "Podaj imię i nazwisko." };
    if (!emailOk) return { err: "Podaj poprawny adres e-mail." };
    if (!phoneOk) return { err: "Podaj poprawny numer telefonu (9 cyfr, opcjonalnie +48)." };
    if (!rodo) return { err: "Zaznacz zgodę na przetwarzanie danych osobowych." };
    return { lead: { name, email, phone, location: loc } };
  }

  function orderErr(msg) {
    const el = $("#ordErr");
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function showOrderDone(email, real) {
    $("#orderForm").hidden = true;
    $("#orderDone").hidden = false;
    $("#orderDoneMsg").textContent = real
      ? `Ofertę PDF z pełną wyceną Twojej konfiguracji wyślemy na adres ${email} w ciągu kilku minut. Sprawdź też folder SPAM.`
      : `Twoja konfiguracja została zapisana. Ofertę PDF na adres ${email} wyślemy po uruchomieniu automatycznej wysyłki wycen.`;
    $("#orderDone").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function onOrderSubmit(e) {
    if (e) e.preventDefault();
    orderErr("");
    const v = validOrder();
    if (v.err) return orderErr(v.err);
    const lead = v.lead;
    saveLead({ ...lead, ts: Date.now() });
    const btn = $("#ordSubmit");
    const t0 = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Wysyłanie…";
    const payload = { ...orderPayload(), ...lead };
    try {
      if (gateConfigured()) {
        const res = await api(payload);
        if (!res || !res.ok) throw new Error(res && res.error);
      } else {
        console.log("[ENERGOPOOL] Zgłoszenie wyceny (tryb demo — brak endpointu):", payload);
      }
      showOrderDone(lead.email, gateConfigured());
    } catch {
      orderErr("Nie udało się wysłać zgłoszenia. Sprawdź dane i spróbuj ponownie.");
      btn.disabled = false;
      btn.innerHTML = t0;
    }
  }

  /* =================== INIT =================== */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = "2026";
    hydrateIcons();
    renderAll();

    // Prefill formularza danymi z poprzedniej wizyty
    const kl = getLead();
    if (kl) {
      if (kl.name) $("#ordName").value = kl.name;
      if (kl.email) $("#ordEmail").value = kl.email;
      if (kl.phone) $("#ordPhone").value = kl.phone;
      if (kl.location) $("#ordLoc").value = kl.location;
    }

    // formularz zamówienia wyceny
    $("#orderForm").addEventListener("submit", onOrderSubmit);
  });
})();
