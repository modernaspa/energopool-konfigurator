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
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z"/>')
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
    robotInverbot:  "assets/img_049.jpeg",
    robotK60:       "assets/img_050.png",
    slab:           "assets/img_053.jpeg",
    techRoom:       "assets/img_051.png"
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
    robotInverbot: false,
    robotK60: false,
    slab: false,
    techRoom: false,
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
        <div class="st-price">od ${fmt(s.base)}</div>
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
      { id: "corner",   img: IMG.stairsCorner,   name: "Schody narożne", desc: "Oszczędność miejsca w narożniku", price: 0, free: true },
      { id: "straight", img: IMG.stairsStraight, name: "Schody proste", desc: "Na całą szerokość basenu", price: s.stairs.straight },
      { id: "shelf",    img: IMG.stairsShelf,    name: "Proste z półką", desc: "Z praktyczną półką do odpoczynku", price: s.stairs.shelf }
    ];
    $("#stairsGrid").innerHTML = opts.map((o) => optCard("stairs", o, state.stairs === o.id)).join("");
    bindRadio("#stairsGrid", "stairs");
  }

  /* =================== KROK 3: POMPA CIEPŁA =================== */
  function renderHeat() {
    const s = SIZES[state.size];
    const opts = [
      { id: "std",  img: IMG.heatStd,  name: "Standard — Fairland INVER X13", desc: "Full-Inverter · " + s.heatStd.kw + " · Wi-Fi", price: s.heatStd.price },
      { id: "prem", img: IMG.heatPrem, name: "Premium — Fairland INVER X20", desc: "Turbo Boost + chłodzenie · " + s.heatPrem.kw, price: s.heatPrem.price }
    ];
    $("#heatGrid").innerHTML = opts.map((o) => optCard("heat", o, state.heat === o.id)).join("");
    bindRadio("#heatGrid", "heat", true);
  }

  /* =================== KROK 4: UZDATNIANIE WODY =================== */
  function renderWater() {
    const s = SIZES[state.size];
    const cards = [
      checkCard("electro", IMG.electro, "Elektrolizer soli Fairland InverPure Pro",
        "Zasolenie tylko 1 g/l · tryb Turbo 120% · " + s.electro.cap, s.electro.price, state.electro),
      checkCard("uv", IMG.uv, "Stacja UV Elecro Quantum Q-65",
        "Technologia Nano Crystal · woda o diamentowym połysku", s.uv, state.uv)
    ];
    $("#waterGrid").innerHTML = cards.join("");
    bindCheck("#waterGrid");
  }

  /* =================== KROK 5: PRZECIWPRĄD =================== */
  function renderCf() {
    const s = SIZES[state.size];
    const opts = [
      { id: "ext",  img: IMG.cfExt, name: "Fairland Swim Jet M — zewnętrzny", desc: "Plug & Play · " + s.cfExt.spec, price: s.cfExt.price },
      { id: "in",   img: IMG.cfIn,  name: "Fairland Swim Jet F — do zabudowy", desc: "Płynna regulacja mocy (InverTurbo) · " + s.cfIn.spec, price: s.cfIn.price }
    ];
    $("#cfGrid").innerHTML = opts.map((o) => optCard("cf", o, state.cf === o.id)).join("");
    bindRadio("#cfGrid", "cf", true);
  }

  /* =================== KROK 6: DODATKI =================== */
  function renderExtras() {
    const cards = [
      checkCard("iwash", IMG.iwash, "Automatyczny zawór płukania iWASH",
        "Dotykowe sterowanie · InverClear Tech · gwarancja 5 lat", FIXED.iwash, state.iwash),
      checkCard("robotInverbot", IMG.robotInverbot, "Odkurzacz Fairland Inverbot 60",
        "Bezprzewodowy · AI · czyści baseny do 120 m²", FIXED.robotInverbot, state.robotInverbot),
      checkCard("robotK60", IMG.robotK60, "Odkurzacz Fairland K60",
        "Bateria 7500 mAh · do 6 h pracy · tryb Turbo 200%", FIXED.robotK60, state.robotK60)
    ];
    $("#extrasGrid").innerHTML = cards.join("");
    bindCheck("#extrasGrid");
  }

  /* =================== KROK 7: PRACE ZIEMNE =================== */
  function renderGround() {
    const s = SIZES[state.size];
    const cards = [
      checkCard("slab", IMG.slab, "Płyta fundamentowa ENERGO STANDARD PLUS",
        "Zbrojona, 20 cm, beton C30/37 W10 · materiał i robocizna", s.slab, state.slab),
      checkCard("techRoom", IMG.techRoom, "Pomieszczenie techniczne wolnostojące",
        "209 × 102 × 115 cm · płyta warstwowa 40 mm · z montażem", FIXED.techRoom, state.techRoom)
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
    const price = o.free
      ? `<div class="opt-price free">${o.price ? fmt(o.price) : "W cenie"}</div>`
      : `<div class="opt-price">+ ${fmt(o.price)}</div>`;
    return `
      <label class="opt${active ? " active" : ""}" data-val="${o.id}">
        ${img}
        <div class="opt-body">
          <div class="opt-name">${o.name}</div>
          ${o.desc ? `<div class="opt-desc">${o.desc}</div>` : ""}
        </div>
        ${price}
        <span class="opt-check"></span>
      </label>`;
  }

  function checkCard(key, img, name, desc, price, active) {
    return `
      <label class="opt${active ? " active" : ""}" data-key="${key}">
        <img class="opt-img" src="${img}" alt="" loading="lazy">
        <div class="opt-body">
          <div class="opt-name">${name}</div>
          <div class="opt-desc">${desc}</div>
        </div>
        <div class="opt-price">+ ${fmt(price)}</div>
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
    if (state.robotInverbot) items.push({ name: "Odkurzacz Fairland Inverbot 60", price: FIXED.robotInverbot });
    if (state.robotK60) items.push({ name: "Odkurzacz Fairland K60", price: FIXED.robotK60 });

    if (state.slab) items.push({ name: "Płyta fundamentowa ENERGO STANDARD PLUS", price: s.slab });
    if (state.techRoom) items.push({ name: "Pomieszczenie techniczne wolnostojące", price: FIXED.techRoom });

    return items;
  }

  function recalc() {
    const s = SIZES[state.size];
    const items = buildItems();
    const total = items.reduce((a, b) => a + b.price, 0);

    $("#summarySize").textContent = "Basen " + s.label + "  ·  folia " + state.foil;
    $("#summaryItems").innerHTML = items.map((it) => `
      <li${it.base ? ' class="base"' : ""}>
        <span class="si-name">${it.name}</span>
        <span class="si-price">${fmt(it.price)}</span>
      </li>`).join("");
    $("#summaryTotal").textContent = fmt(total);
    state._lastTotal = total;
    state._lastItems = items;
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

  /* =================== PODSUMOWANIE: E-MAIL + WYDRUK =================== */
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

  function sendEmail() {
    const s = SIZES[state.size];
    const subject = `Zapytanie ofertowe — basen ENERGOPOOL ${s.label} (${fmt(state._lastTotal)})`;
    let body = `Dzień dobry,\n\nproszę o kontakt w sprawie wyceny basenu ENERGOPOOL w poniższej konfiguracji:\n\n`;
    body += quoteText();
    body += `\nMoje dane kontaktowe:\nImię i nazwisko: \nTelefon: \nLokalizacja inwestycji: \n\nPozdrawiam`;
    window.location.href = `mailto:biuro@moderna-spa.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function renderPrintable() {
    const s = SIZES[state.size];
    const items = buildItems();
    const rows = items.map((it) => `
      <tr${it.base ? ' class="qt-base"' : ""}><td>${it.name}</td><td>${fmt(it.price)}</td></tr>`).join("");
    $("#quotePrintable").innerHTML = `
      <h2 class="quote-h">Twój basen ENERGOPOOL — ${s.label}</h2>
      <p class="quote-sub">Moderna Pool&Spa Sp. z o.o. · konfiguracja indywidualna</p>
      <div class="quote-spec">
        <b>Powierzchnia:</b> ${String(s.area).replace(".", ",")} m² · <b>Głębokość:</b> ${String(s.depth).replace(".", ",")} m · <b>Folia:</b> ${state.foil}<br>
        <b>W pakiecie:</b> filtr ${s.filter}, pompa ${s.pump}, ${s.skimmer} skimmer / ${s.dysze} dysze / ${s.lampy} lampy RGB-LED, złoże AFM, instalacja PVC-U + elektryka.
      </div>
      <table class="quote-table">
        ${rows}
        <tr class="qt-total"><td>Cena całkowita brutto</td><td>${fmt(state._lastTotal)}</td></tr>
      </table>
      <p class="quote-contact">
        <b>MODERNA POOL&Spa Sp. z o.o.</b><br>
        ul. św. Teresy od Dzieciątka Jezus 91, 91-341 Łódź<br>
        biuro@moderna-spa.pl · +48 500 560 245 · +48 500 560 246<br>
        moderna-baseny.pl · moderna-spa.pl<br><br>
        <small>Cena ma charakter informacyjny i nie stanowi oferty w rozumieniu art. 66 §1 Kodeksu cywilnego.</small>
      </p>`;
  }

  function openModal() { renderPrintable(); $("#quoteModal").classList.add("open"); $("#quoteModal").setAttribute("aria-hidden", "false"); }
  function closeModal() { $("#quoteModal").classList.remove("open"); $("#quoteModal").setAttribute("aria-hidden", "true"); }

  /* =================== INIT =================== */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = "2026";
    hydrateIcons();
    renderAll();

    $("#btnEmail").addEventListener("click", openModal);
    $("#btnPrint").addEventListener("click", () => { openModal(); setTimeout(() => window.print(), 350); });
    $("#btnEmailModal").addEventListener("click", sendEmail);
    $("#btnPrintModal").addEventListener("click", () => window.print());
    document.querySelectorAll("#quoteModal [data-close]").forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  });
})();
