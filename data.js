/* ==========================================================================
   ENERGOPOOL — dane konfiguratora
   Źródło: oferty PDF "2026 Pakiet basenowy ENERGOPOOL" (Moderna Pool&Spa Sp. z o.o.)
   Wszystkie ceny w PLN brutto.
   ========================================================================== */

const SIZES = {
  "3x6": {
    label: "3 × 6 m", len: 6, wid: 3, depth: 1.5, area: 18,
    base: 108500,
    filter: "ASTER 500 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO · 19,5 m³/h · 0,75 kW",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 4000, shelf: 3000 },
    electro: { cap: "do 40 m³", price: 11800 },
    uv: 9700,
    heatStd: { kw: "10 kW", price: 7900 },
    heatPrem: { kw: "11,5 kW", price: 10700 },
    cfExt: { spec: "120 m³/h · 0,5 kW", price: 11800 },
    cfIn: { spec: "120 m³/h · 0,5 kW", price: 18900 },
    slab: 14500
  },
  "3x7": {
    label: "3 × 7 m", len: 7, wid: 3, depth: 1.5, area: 21,
    base: 117000,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 4000, shelf: 3000 },
    electro: { cap: "do 40 m³", price: 11800 },
    uv: 9700,
    heatStd: { kw: "13,5 kW", price: 9700 },
    heatPrem: { kw: "14 kW", price: 13200 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 13800 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 20900 },
    slab: 16200
  },
  "3.5x7": {
    label: "3,5 × 7 m", len: 7, wid: 3.5, depth: 1.5, area: 24.5,
    base: 119500,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 4500, shelf: 3000 },
    electro: { cap: "do 75 m³", price: 12800 },
    uv: 9700,
    heatStd: { kw: "13,5 kW", price: 9700 },
    heatPrem: { kw: "14 kW", price: 13200 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 13800 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 20900 },
    slab: 17600
  },
  "4x8": {
    label: "4 × 8 m", len: 8, wid: 4, depth: 1.5, area: 32,
    base: 128000,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5000, shelf: 3000 },
    electro: { cap: "do 75 m³", price: 12800 },
    uv: 9700,
    heatStd: { kw: "13,5 kW", price: 9700 },
    heatPrem: { kw: "17,5 kW", price: 14800 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 13800 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 20900 },
    slab: 21000
  },
  "4x10": {
    label: "4 × 10 m", len: 10, wid: 4, depth: 1.5, area: 40,
    base: 142000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP30 · 1,4 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5000, shelf: 3000 },
    electro: { cap: "do 75 m³", price: 12800 },
    uv: 12500,
    heatStd: { kw: "17,5 kW", price: 15700 },
    heatPrem: { kw: "22 kW", price: 21200 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 16200 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 22900 },
    slab: 24800
  },
  "4x12": {
    label: "4 × 12 m", len: 12, wid: 4, depth: 1.5, area: 48,
    base: 154000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP40 · 1,75 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5000, shelf: 3000 },
    electro: { cap: "do 75 m³", price: 12800 },
    uv: 12500,
    heatStd: { kw: "20 kW", price: 14500 },
    heatPrem: { kw: "26,5 kW", price: 24600 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 16200 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 22900 },
    slab: 31000
  },
  "5x10": {
    label: "5 × 10 m", len: 10, wid: 5, depth: 1.5, area: 50,
    base: 154000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP40 · 1,75 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 6000, shelf: 4000 },
    electro: { cap: "do 75 m³", price: 12800 },
    uv: 12500,
    heatStd: { kw: "20 kW", price: 14500 },
    heatPrem: { kw: "26,5 kW", price: 24600 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 16200 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 22900 },
    slab: 31000
  }
};

/* Ceny stałe (niezależne od rozmiaru) */
const FIXED = {
  iwash: 5400,          // Automatyczny zawór płukania FAIRLAND iWASH (z montażem)
  niya35: 2261,         // Odkurzacz DOLPHIN NIYA TRACKER 35 (553,50 € brutto − 5% × kurs 4,30)
  niya55: 2673,         // Odkurzacz DOLPHIN NIYA TRACKER 55 (654,36 € brutto − 5% × kurs 4,30)
  techRoom: 8600,       // Pomieszczenie techniczne wolnostojące 209×102×115 cm (z montażem)
  techRoomUnder: 12000  // Pomieszczenie techniczne podziemne (z montażem)
};

/* ==========================================================================
   Bramka wyceny (lead gate) — Google Apps Script + Arkusz Google.
   Po wdrożeniu skryptu (apps-script/Kod.gs) wklej tu adres Web App (/exec).
   Pusty endpoint = tryb uproszczony: walidacja formatu danych bez wysyłki
   kodu i bez zapisu leada (strona nie jest zepsuta — po prostu odblokowuje
   od razu po poprawnym wypełnieniu formularza).
   ========================================================================== */
const LEADS = {
  endpoint: ""
};

/* Kolory folii RENOLIT ALKORPLAN TOUCH / VOGUE (2,0 mm) — wybór bez dopłaty */
const FOILS = [
  { name: "Vanity",    img: "assets/img_021.jpeg" },
  { name: "Prestige",  img: "assets/img_022.jpeg" },
  { name: "Elegance",  img: "assets/img_023.jpeg" },
  { name: "Tropical",  img: "assets/img_024.jpeg" },
  { name: "Vintage",   img: "assets/img_025.jpeg" },
  { name: "Relax",     img: "assets/img_026.jpeg" },
  { name: "Sublime",   img: "assets/img_028.jpeg" },
  { name: "Authentic", img: "assets/img_029.jpeg" },
  { name: "Urban",     img: "assets/img_030.jpeg" },
  { name: "Summer",    img: "assets/img_031.jpeg" }
];
