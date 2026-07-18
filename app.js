/* ====================== ENERGOPOOL — logika konfiguratora ====================== */
(function () {
  "use strict";

  /* =================== META PIXEL + ZGODA (RODO) ===================
     Pixel laduje sie DOPIERO po zgodzie marketingowej (baner). Bez zgody nie
     wysylamy nic do Meta — landing i wycena dzialaja normalnie. */
  const META_PIXEL_ID = "1041475871607656";
  const CONSENT_KEY = "moderna_consent";
  const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } };
  const setConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} };
  const mktGranted = () => getConsent() === "granted";
  const getCookie = (n) => { const p = document.cookie.split("; ").find((r) => r.startsWith(n + "=")); return p ? p.split("=")[1] : null; };
  let _pixelLoaded = false;
  function loadPixel() {
    if (_pixelLoaded) return;
    _pixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }
  function initConsent() {
    const choice = getConsent();
    if (choice === "granted") { loadPixel(); return; }
    if (choice === "denied") return;
    const banner = document.getElementById("ccBanner");
    if (!banner) return;
    banner.hidden = false;
    const accept = document.getElementById("ccAccept");
    const deny = document.getElementById("ccDeny");
    if (accept) accept.addEventListener("click", () => { setConsent("granted"); loadPixel(); banner.hidden = true; });
    if (deny) deny.addEventListener("click", () => { setConsent("denied"); banner.hidden = true; });
  }

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
    autofill:       "assets/autofill.jpg",
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
    heatPedestal: false,
    electro: false,
    uv: false,
    autofill: false,
    cf: "none",
    iwash: false,
    niya35: false,
    niya55: false,
    slab: false,
    techRoom: false,
    slabTech: false,
    techRoomUnder: false,
    slabTechUnder: false,
    foil: "Vanity"
  };

  const $ = (s) => document.querySelector(s);

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
    $("#heatAddonGrid").innerHTML = addonCard("heatPedestal", "Postument pod pompę ciepła",
      "Betonowa płyta 120 × 80 × 10 cm — stabilne, równe podłoże pod jednostkę zewnętrzną.", state.heatPedestal);
    bindCheck("#heatAddonGrid");
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
        "Lampa UV niszczy bakterie i glony światłem, bez chemii. Woda jest krystalicznie czysta i zdrowsza — świetne uzupełnienie do elektrolizera."),
      checkCard("autofill", IMG.autofill, "Automatyczne uzupełnianie wody",
        "Czujnik poziomu + zawór · automatyczny dolew", FIXED.autofill, state.autofill,
        "System sam utrzymuje właściwy poziom wody w basenie — dolewa ją automatycznie, gdy odparuje. Koniec z ręcznym pilnowaniem poziomu i ryzykiem odsłonięcia skimmera.")
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
      addonCard("slabTech", "Płyta pod pomieszczenie techniczne",
        "Betonowa płyta 210 × 105 × 10 cm — wypoziomowane podłoże pod skrzynię techniczną.", state.slabTech),
      checkCard("techRoomUnder", IMG.techRoomUnder, "Pomieszczenie techniczne podziemne",
        "Podziemna komora na całą technikę basenu · z montażem", FIXED.techRoomUnder, state.techRoomUnder,
        "Podziemna komora tuż przy basenie mieszcząca pompy, filtrację i sterowanie — cała technika schowana pod ziemią, niewidoczna w ogrodzie, z wygodnym dostępem serwisowym.")
    ];
    // Płyta pod pomieszczenie podziemne — konieczna pod komorę, więc dołączana automatycznie
    // razem z pomieszczeniem podziemnym (nie do samodzielnego wyboru). Pokazujemy ją jako
    // zablokowaną tylko wtedy, gdy wybrano pomieszczenie podziemne.
    if (state.techRoomUnder) {
      cards.push(addonCard("slabTechUnder", "Płyta pod pomieszczenie techniczne podziemne",
        `Betonowa płyta ${String(s.wid).replace(".", ",")} × 2,5 m · ${String(s.wid * 2.5).replace(".", ",")} m² — konieczne podłoże, dodawana automatycznie do pomieszczenia podziemnego.`,
        true, true));
    }
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

  // Kompaktowa pod-opcja (dodatek do pozycji głównej) — mniejsza, bez zdjęcia.
  // locked = pozycja wymuszona (np. płyta pod pomieszczenie podziemne) — zawsze zaznaczona,
  // niereagująca na kliknięcie; sterowana wyłącznie przez pozycję nadrzędną.
  function addonCard(key, name, desc, active, locked) {
    return `
      <label class="opt opt-addon${active ? " active" : ""}${locked ? " opt-locked" : ""}" data-key="${key}"${locked ? " data-locked=\"1\"" : ""}>
        <div class="opt-body">
          <div class="opt-name">${name}${locked ? ` <span class="opt-auto">w komplecie</span>` : ""}</div>
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
        // Pozycja zablokowana (np. płyta pod podziemne) — sterowana tylko przez nadrzędną, klik ignoruj.
        if (el.dataset.locked) return;
        state[k] = !state[k];
        // Dwa pomieszczenia techniczne wykluczają się — wybór jednego odznacza drugie.
        // Pomieszczenie podziemne wymusza płytę pod nie (komory nie da się postawić bez płyty).
        if (k === "techRoom" || k === "techRoomUnder") {
          if (k === "techRoom" && state.techRoom) {
            state.techRoomUnder = false;
            state.slabTechUnder = false;
          }
          if (k === "techRoomUnder") {
            if (state.techRoomUnder) state.techRoom = false;
            state.slabTechUnder = state.techRoomUnder;
          }
          renderGround();
          recalc();
          return;
        }
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
    if (state.heatPedestal) items.push({ name: "Postument pod pompę ciepła (120 × 80 × 10 cm)", price: FIXED.heatPedestal });

    if (state.electro) items.push({ name: `Elektrolizer soli InverPure Pro (${s.electro.cap})`, price: s.electro.price });
    if (state.uv) items.push({ name: "Stacja UV Elecro Quantum Q-65", price: s.uv });
    if (state.autofill) items.push({ name: "Automatyczne uzupełnianie wody", price: FIXED.autofill });

    if (state.cf === "ext") items.push({ name: `Przeciwprąd zewnętrzny Swim Jet M (${s.cfExt.spec})`, price: s.cfExt.price });
    else if (state.cf === "in") items.push({ name: `Przeciwprąd do zabudowy Swim Jet F (${s.cfIn.spec})`, price: s.cfIn.price });

    if (state.iwash) items.push({ name: "Automatyczny zawór płukania iWASH", price: FIXED.iwash });
    if (state.niya35) items.push({ name: "Odkurzacz Dolphin Niya Tracker 35", price: FIXED.niya35 });
    if (state.niya55) items.push({ name: "Odkurzacz Dolphin Niya Tracker 55", price: FIXED.niya55 });

    if (state.slab) items.push({ name: "Płyta fundamentowa ENERGO STANDARD PLUS", price: s.slab });
    if (state.techRoom) items.push({ name: "Pomieszczenie techniczne wolnostojące", price: FIXED.techRoom });
    if (state.slabTech) items.push({ name: "Płyta pod pomieszczenie techniczne (210 × 105 × 10 cm)", price: FIXED.slabTech });
    if (state.techRoomUnder) items.push({ name: "Pomieszczenie techniczne podziemne", price: FIXED.techRoomUnder });
    if (state.slabTechUnder) items.push({ name: `Płyta pod pomieszczenie techniczne podziemne (${String(s.wid).replace(".", ",")} × 2,5 m)`, price: s.slabTechUnder });

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

  /* =================== ZAMÓWIENIE WYCENY (formularz na stronie) =================== */
  const gateConfigured = () => !!(LEADS && LEADS.endpoint);

  // Wywołanie backendu (application/x-www-form-urlencoded — bez preflightu CORS)
  function api(payload) {
    return fetch(LEADS.endpoint, {
      method: "POST",
      body: new URLSearchParams({ data: JSON.stringify(payload) })
    }).then((r) => r.json());
  }

  // Pogrupowane pozycje oferty (dla PDF w moderna-system).
  // Grupy do oferty PDF — 1:1 kolejność, numery i nazwy modułów jak w konfiguratorze.
  // Moduł bez wybranej pozycji jest pomijany (nie trafia do PDF). Wyjątek: moduł 1 —
  // w konfiguratorze to wybór rozmiaru, w ofercie „Pakiet podstawowy ENERGOPOOL".
  function offerGroupsData(s) {
    const G = [];
    // 1. Pakiet podstawowy (zawsze)
    G.push({ num: 1, label: "Pakiet podstawowy ENERGOPOOL", rows: [
      { nm: `Basen ENERGOPOOL ${s.label}`, sub: "Niecka bloczkowo-betonowa · folia · filtracja · instalacja PVC-U + elektryka", price: s.base, base: true }
    ] });
    // 2. Płyta i pomieszczenie techniczne
    const gr = [];
    if (state.slab) gr.push({ nm: "Płyta fundamentowa ENERGO STANDARD PLUS", price: s.slab });
    if (state.techRoom) gr.push({ nm: "Pomieszczenie techniczne wolnostojące", price: FIXED.techRoom });
    if (state.slabTech) gr.push({ nm: "Płyta pod pomieszczenie techniczne · 210 × 105 × 10 cm", price: FIXED.slabTech });
    if (state.techRoomUnder) gr.push({ nm: "Pomieszczenie techniczne podziemne", price: FIXED.techRoomUnder });
    if (state.slabTechUnder) gr.push({ nm: `Płyta pod pomieszczenie techniczne podziemne · ${String(s.wid).replace(".", ",")} × 2,5 m`, price: s.slabTechUnder });
    if (gr.length) G.push({ num: 2, label: "Płyta i pomieszczenie techniczne", rows: gr });
    // 3. Kolor folii (zawsze — domyślnie bez dopłaty)
    G.push({ num: 3, label: "Kolor folii basenowej", rows: [
      { nm: `Folia RENOLIT ALKORPLAN — ${state.foil}`, price: 0, free: true }
    ] });
    // 4. Schody (zawsze — domyślnie narożne w cenie)
    const st = [];
    if (state.stairs === "corner") st.push({ nm: "Schody narożne", price: 0, free: true });
    else if (state.stairs === "straight") st.push({ nm: "Schody proste", price: s.stairs.straight });
    else if (state.stairs === "shelf") st.push({ nm: "Schody proste z półką", price: s.stairs.shelf });
    if (st.length) G.push({ num: 4, label: "Schody basenowe", rows: st });
    // 5. Podgrzewanie wody — pompa ciepła
    const ht = [];
    if (state.heat === "std") ht.push({ nm: `Pompa ciepła Fairland INVER X13 · ${s.heatStd.kw}`, price: s.heatStd.price });
    else if (state.heat === "prem") ht.push({ nm: `Pompa ciepła Fairland INVER X20 · ${s.heatPrem.kw}`, price: s.heatPrem.price });
    if (state.heatPedestal) ht.push({ nm: "Postument pod pompę ciepła · 120 × 80 × 10 cm", price: FIXED.heatPedestal });
    if (ht.length) G.push({ num: 5, label: "Podgrzewanie wody — pompa ciepła", rows: ht });
    // 6. Automatyczne uzdatnianie wody
    const wt = [];
    if (state.electro) wt.push({ nm: `Elektrolizer soli InverPure Pro (${s.electro.cap})`, price: s.electro.price });
    if (state.uv) wt.push({ nm: "Stacja UV Elecro Quantum Q-65", price: s.uv });
    if (state.autofill) wt.push({ nm: "Automatyczne uzupełnianie wody", price: FIXED.autofill });
    if (wt.length) G.push({ num: 6, label: "Automatyczne uzdatnianie wody", rows: wt });
    // 7. Przeciwprąd basenowy
    const cf = [];
    if (state.cf === "ext") cf.push({ nm: `Przeciwprąd zewnętrzny Swim Jet M · ${s.cfExt.spec}`, price: s.cfExt.price });
    else if (state.cf === "in") cf.push({ nm: `Przeciwprąd do zabudowy Swim Jet F · ${s.cfIn.spec}`, price: s.cfIn.price });
    if (cf.length) G.push({ num: 7, label: "Przeciwprąd basenowy", rows: cf });
    // 8. Wyposażenie dodatkowe
    const ex = [];
    if (state.iwash) ex.push({ nm: "Automatyczny zawór płukania iWASH", price: FIXED.iwash });
    if (state.niya35) ex.push({ nm: "Odkurzacz Dolphin Niya Tracker 35", price: FIXED.niya35 });
    if (state.niya55) ex.push({ nm: "Odkurzacz Dolphin Niya Tracker 55", price: FIXED.niya55 });
    if (ex.length) G.push({ num: 8, label: "Wyposażenie dodatkowe", rows: ex });
    return G;
  }
  // Realne zdjęcia wybranego wyposażenia (folia + do 4 pozycji).
  function offerPicksData() {
    const out = [];
    const foil = (typeof FOILS !== "undefined") ? FOILS.find((f) => f.name === state.foil) : null;
    if (foil) out.push({ img: foil.img, cap: `Folia RENOLIT ${state.foil}`, fit: "cover" });
    if (state.heat === "std") out.push({ img: IMG.heatStd, cap: "Pompa ciepła INVER X13" });
    else if (state.heat === "prem") out.push({ img: IMG.heatPrem, cap: "Pompa ciepła INVER X20" });
    if (state.electro) out.push({ img: IMG.electro, cap: "Elektrolizer soli InverPure" });
    if (state.uv) out.push({ img: IMG.uv, cap: "Stacja UV Quantum Q-65" });
    if (state.autofill) out.push({ img: IMG.autofill, cap: "Automatyczne uzupełnianie wody" });
    if (state.cf === "ext") out.push({ img: IMG.cfExt, cap: "Przeciwprąd Swim Jet M" });
    else if (state.cf === "in") out.push({ img: IMG.cfIn, cap: "Przeciwprąd Swim Jet F" });
    if (state.iwash) out.push({ img: IMG.iwash, cap: "Zawór płukania iWASH" });
    if (state.niya35) out.push({ img: IMG.niya35, cap: "Odkurzacz Dolphin Niya 35" });
    if (state.niya55) out.push({ img: IMG.niya55, cap: "Odkurzacz Dolphin Niya 55" });
    return out.slice(0, 4);
  }
  function newExternalId() {
    try { return crypto.randomUUID(); } catch { return String(Date.now()) + Math.random().toString(36).slice(2); }
  }

  function orderPayload(lead) {
    const s = SIZES[state.size];
    const items = buildItems();
    const gross = items.reduce((a, b) => a + b.price, 0);
    const net = Math.round(gross / 1.23);
    const vat = gross - net;
    state._lastItems = items;
    state._lastTotal = gross;
    const client = { name: lead.name, email: lead.email, phone: lead.phone, location: lead.location };
    const payload = {
      action: "order",
      external_id: newExternalId(),
      name: lead.name, email: lead.email, phone: lead.phone, location: lead.location,
      size: s.label, foil: state.foil,
      total: fmt(gross), totalNum: gross, net, vat, gross,
      items: items.map((it) => ({ name: it.name, price: it.price })),
      config: quoteText(),
      offer: {
        sizeLabel: s.label,
        area: String(s.area).replace(".", ","),
        depth: String(s.depth).replace(".", ","),
        filter: s.filter, pump: s.pump,
        skimmer: s.skimmer, dysze: s.dysze, lampy: s.lampy,
        foil: state.foil,
        groups: offerGroupsData(s),
        picks: offerPicksData(),
        net, vat, gross,
        client
      }
    };

    // Meta: zgoda marketingowa + dedup Pixel<->CAPI (wspolny event_id).
    payload.mkt_consent = mktGranted();
    if (payload.mkt_consent) {
      const eventId = newExternalId();
      payload.event_id = eventId;
      payload.fbp = getCookie("_fbp");
      payload.fbc = getCookie("_fbc");
      if (window.fbq) window.fbq("track", "Lead",
        { value: gross, currency: "PLN", content_category: "basen", content_name: s.label },
        { eventID: eventId });
    }
    return payload;
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
    const btn = $("#ordSubmit");
    const t0 = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Wysyłanie…";
    const payload = orderPayload(lead);
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
    initConsent();
    hydrateIcons();
    renderAll();

    // Zawsze pusty formularz po wejściu/odświeżeniu — czyść wartości
    // przywrócone przez przeglądarkę (reload oraz powrót z bfcache).
    const clearOrderForm = () => {
      $("#orderForm").reset();
      ["ordName", "ordEmail", "ordPhone"].forEach((id) => $("#" + id).classList.remove("bad"));
      orderErr("");
    };
    clearOrderForm();
    window.addEventListener("pageshow", clearOrderForm);

    // formularz zamówienia wyceny
    $("#orderForm").addEventListener("submit", onOrderSubmit);
  });
})();
