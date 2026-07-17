/* ==========================================================================
   ENERGOPOOL — dane konfiguratora
   Źródło: oferty PDF "2026 Pakiet basenowy ENERGOPOOL" (Moderna Pool&Spa Sp. z o.o.)
   Wszystkie ceny w PLN brutto.
   Podwyżki (2026-07): schody proste/z półką +15%, wyposażenie techniczne
   (poza pakietem, bez odkurzaczy) +10%, płyta fundamentowa +20%.
   ========================================================================== */

const SIZES = {
  "3x6": {
    label: "3 × 6 m", len: 6, wid: 3, depth: 1.5, area: 18,
    base: 108500,
    filter: "ASTER 500 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO · 19,5 m³/h · 0,75 kW",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 4600, shelf: 3450 },
    electro: { cap: "do 40 m³", price: 12980 },
    uv: 10670,
    heatStd: { kw: "10 kW", price: 8690 },
    heatPrem: { kw: "11,5 kW", price: 11770 },
    cfExt: { spec: "120 m³/h · 0,5 kW", price: 12980 },
    cfIn: { spec: "120 m³/h · 0,5 kW", price: 20790 },
    slab: 17400
  },
  "3x7": {
    label: "3 × 7 m", len: 7, wid: 3, depth: 1.5, area: 21,
    base: 117000,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 4600, shelf: 3450 },
    electro: { cap: "do 40 m³", price: 12980 },
    uv: 10670,
    heatStd: { kw: "13,5 kW", price: 10670 },
    heatPrem: { kw: "14 kW", price: 14520 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 15180 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 22990 },
    slab: 19440
  },
  "3.5x7": {
    label: "3,5 × 7 m", len: 7, wid: 3.5, depth: 1.5, area: 24.5,
    base: 119500,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 1, dysze: 2, lampy: 2,
    stairs: { straight: 5175, shelf: 3450 },
    electro: { cap: "do 75 m³", price: 14080 },
    uv: 10670,
    heatStd: { kw: "13,5 kW", price: 10670 },
    heatPrem: { kw: "14 kW", price: 14520 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 15180 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 22990 },
    slab: 21120
  },
  "4x8": {
    label: "4 × 8 m", len: 8, wid: 4, depth: 1.5, area: 32,
    base: 128000,
    filter: "ASTER 600 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP25 · 1,05 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5750, shelf: 3450 },
    electro: { cap: "do 75 m³", price: 14080 },
    uv: 10670,
    heatStd: { kw: "13,5 kW", price: 10670 },
    heatPrem: { kw: "17,5 kW", price: 16280 },
    cfExt: { spec: "180 m³/h · 0,8 kW", price: 15180 },
    cfIn: { spec: "180 m³/h · 0,8 kW", price: 22990 },
    slab: 25200
  },
  "4x10": {
    label: "4 × 10 m", len: 10, wid: 4, depth: 1.5, area: 40,
    base: 142000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP30 · 1,4 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5750, shelf: 3450 },
    electro: { cap: "do 75 m³", price: 14080 },
    uv: 13750,
    heatStd: { kw: "17,5 kW", price: 17270 },
    heatPrem: { kw: "22 kW", price: 23320 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 17820 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 25190 },
    slab: 29760
  },
  "4x12": {
    label: "4 × 12 m", len: 12, wid: 4, depth: 1.5, area: 48,
    base: 154000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP40 · 1,75 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 5750, shelf: 3450 },
    electro: { cap: "do 75 m³", price: 14080 },
    uv: 13750,
    heatStd: { kw: "20 kW", price: 15950 },
    heatPrem: { kw: "26,5 kW", price: 27060 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 17820 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 25190 },
    slab: 37200
  },
  "5x10": {
    label: "5 × 10 m", len: 10, wid: 5, depth: 1.5, area: 50,
    base: 154000,
    filter: "ASTER 650 z zaworem bocznym",
    pump: "FAIRLAND INVERPRO IP40 · 1,75 kW · 230 V",
    skimmer: 2, dysze: 4, lampy: 3,
    stairs: { straight: 6900, shelf: 4600 },
    electro: { cap: "do 75 m³", price: 14080 },
    uv: 13750,
    heatStd: { kw: "20 kW", price: 15950 },
    heatPrem: { kw: "26,5 kW", price: 27060 },
    cfExt: { spec: "230 m³/h · 1,2 kW", price: 17820 },
    cfIn: { spec: "230 m³/h · 1,2 kW", price: 25190 },
    slab: 37200
  }
};

/* Ceny stałe (niezależne od rozmiaru) */
const FIXED = {
  iwash: 5940,          // Automatyczny zawór płukania FAIRLAND iWASH (z montażem) — +10%
  niya35: 2261,         // Odkurzacz DOLPHIN NIYA TRACKER 35 (bez zmian)
  niya55: 2673,         // Odkurzacz DOLPHIN NIYA TRACKER 55 (bez zmian)
  heatPedestal: 1450,   // Postument pod pompę ciepła — płyta 120×80×10 cm
  techRoom: 10500,      // Pomieszczenie techniczne wolnostojące 209×102×115 cm (z montażem)
  slabTech: 1700,       // Płyta pod pomieszczenie techniczne wolnostojące — 210×105×10 cm
  techRoomUnder: 14500  // Pomieszczenie techniczne podziemne (z montażem)
};

/* ==========================================================================
   Endpoint wyceny — backend w moderna-system (Next.js/VPS): zapis leada + oferta
   PDF na e-mail + szansa w CRM. Pusty endpoint = tryb demo (bez wysyłki).
   ========================================================================== */
const LEADS = {
  endpoint: "https://moderna-wellness.cloud/api/energopool/wycena"
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
