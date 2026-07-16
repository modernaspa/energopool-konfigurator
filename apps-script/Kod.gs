/**
 * ENERGOPOOL — mini-backend leadów (Google Apps Script)
 * Wysyła 6-cyfrowy kod z Waszej poczty (MailApp), weryfikuje go po stronie
 * serwera i zapisuje zweryfikowanego leada do Arkusza Google + powiadamia biuro.
 *
 * WDROŻENIE (raz, ~10 min):
 *  1. Utwórz nowy Arkusz Google (to będzie baza leadów).
 *  2. Rozszerzenia → Apps Script. Wklej ten plik (zastąp całą zawartość).
 *  3. Ustaw NOTIFY_TO poniżej na swój adres (domyślnie biuro@moderna-spa.pl).
 *  4. Wdróż → Nowe wdrożenie → typ: „Aplikacja internetowa”.
 *       - Wykonaj jako: Ja
 *       - Kto ma dostęp: Wszyscy
 *     Zatwierdź uprawnienia (wysyłka maili + arkusz).
 *  5. Skopiuj adres URL kończący się na /exec i wklej go do data.js → LEADS.endpoint.
 */

const SHEET_NAME = "Leady";
const NOTIFY_TO = "biuro@moderna-spa.pl"; // gdzie mają przychodzić powiadomienia o leadach
const FROM_NAME = "Moderna Pool&Spa";
const CODE_TTL_MIN = 10;

function doPost(e) {
  try {
    const raw = (e && e.parameter && e.parameter.data) || (e && e.postData && e.postData.contents) || "{}";
    const p = JSON.parse(raw);
    if (p.action === "send") return json(sendCode(p));
    if (p.action === "verify") return json(verifyCode(p));
    return json({ ok: false, error: "unknown-action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Test w przeglądarce (GET) — powinien zwrócić {"ok":true,...}
function doGet() {
  return json({ ok: true, service: "ENERGOPOOL lead endpoint" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s || ""); }

function sendCode(p) {
  if (!p.name || String(p.name).trim().length < 3) return { ok: false, error: "name" };
  if (!validEmail(p.email)) return { ok: false, error: "email" };
  const code = String(Math.floor(100000 + Math.random() * 900000));
  CacheService.getScriptCache().put("code_" + String(p.email).toLowerCase(), code, CODE_TTL_MIN * 60);
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0C2330;max-width:480px">' +
      '<p>Dzień dobry ' + escapeHtml(p.name) + ',</p>' +
      '<p>Twój kod odblokowujący wycenę basenu <b>ENERGOPOOL</b>:</p>' +
      '<p style="font-size:28px;font-weight:bold;letter-spacing:8px;color:#0E84A6">' + code + '</p>' +
      '<p style="color:#5A707A">Kod jest ważny ' + CODE_TTL_MIN + ' minut. Jeśli to nie Ty prosiłeś o wycenę — zignoruj tę wiadomość.</p>' +
      '<hr style="border:none;border-top:1px solid #E4EAEC">' +
      '<p style="color:#93A3AB;font-size:12px">Moderna Pool&Spa · +48 500 560 245 · moderna-baseny.pl</p>' +
    '</div>';
  MailApp.sendEmail({ to: p.email, subject: "Twój kod do wyceny — Moderna Pool&Spa", htmlBody: html, name: FROM_NAME });
  return { ok: true };
}

function verifyCode(p) {
  const key = "code_" + String(p.email || "").toLowerCase();
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (!cached) return { ok: false, error: "expired" };
  if (String(p.code) !== cached) return { ok: false, error: "bad-code" };
  cache.remove(key);

  // zapis leada do arkusza
  const sh = getSheet();
  sh.appendRow([new Date(), p.name || "", p.email || "", p.phone || "", p.size || "", p.total || "", p.config || ""]);

  // powiadomienie do biura
  const body =
    "Nowy lead z konfiguratora ENERGOPOOL\n\n" +
    "Imię i nazwisko: " + (p.name || "") + "\n" +
    "E-mail: " + (p.email || "") + "\n" +
    "Telefon: " + (p.phone || "") + "\n" +
    "Basen: " + (p.size || "") + "\n" +
    "Suma: " + (p.total || "") + "\n\n" +
    "Konfiguracja:\n" + (p.config || "");
  try {
    MailApp.sendEmail({ to: NOTIFY_TO, subject: "Nowy lead: " + (p.name || "") + " (" + (p.size || "") + ")", body: body, name: FROM_NAME });
  } catch (err) { /* powiadomienie nie może blokować odblokowania */ }

  return { ok: true };
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["Data", "Imię i nazwisko", "E-mail", "Telefon", "Basen", "Suma", "Konfiguracja"]);
    sh.getRange("A1:G1").setFontWeight("bold");
  }
  return sh;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}
