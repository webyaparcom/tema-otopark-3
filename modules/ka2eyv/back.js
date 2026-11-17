/* otopark-sure-cetveli — Otopark Süre Cetveli — orantılı tarife dilimleri cetveli ve süre sürgüsü (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Saat çentikli yatay bir cetvel: her tarife dilimi süresiyle orantılı bir bölüm (dilim adı, fiyat, bitiş saati). Altında park süresi sürgüsü; sürgü hangi dilime düşüyorsa o bölüm kalkar, süre ve dilim fiyatı büyük gösterilir. Bitiş saati olmayan kayıtlar (aylık abonelik, gece tarifesi) cetvelin altında ek tarife kartları. Kayıt alanları: `bitis` (saat) · `fiyat`. JS yokken cetvel ve ek kartlar tam; sürgü gizli.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-otopark-sure-cetveli";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: otopark-sure-cetveli --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const sy = (i, ks) => {
      const v = ilk(R[i] || {}, ks);
      if (typeof v === "number") return v;
      let t = pick(v).replace(/[^\d.,]/g, "");
      t = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
      const n = t ? Number(t) : NaN;
      return Number.isFinite(n) ? n : NaN;
    };
    const PB = /^[A-Za-z]{3}$/.test(metinAl(des, ["paraBirimi"])) ? metinAl(des, ["paraBirimi"]).toUpperCase() : "";
    const para = (v) => { try { return new Intl.NumberFormat(dil || undefined, PB ? { style: "currency", currency: PB, maximumFractionDigits: v % 1 ? 2 : 0 } : { maximumFractionDigits: 2 }).format(v); } catch (e) { return String(v); } };
    const SA = metinAl(des, ["saatAd"]);
    const ara = (t) => esc(t).replace(/\d+(?:[.,]\d+)?\s*[–-]\s*\d+(?:[.,]\d+)?/g, (m) => `<bdi dir="ltr">${m}</bdi>`);
    const T = A.map((k, i) => ({ k, b: sy(i, ["bitis", "saat", "until"]), f: sy(i, ["fiyat", "price"]) }));
    const D = T.filter((t) => Number.isFinite(t.b) && t.b > 0).sort((a, b) => a.b - b.b);
    const E = T.filter((t) => !(Number.isFinite(t.b) && t.b > 0));
    const MX = D.length ? D[D.length - 1].b : 0;
    const cet = D.length > 1;
    const G = D.map((t, j) => Math.max(0.25, t.b - (j ? D[j - 1].b : 0)));
    const bolum = (t, j) => { const g = G[j]; return `<li class="${P}-dilim" style="--fb-g: ${g}" data-bitis="${t.b}"${Number.isFinite(t.f) ? ` data-fiyat="${t.f}"` : ""} data-ad="${esc(t.k.baslik)}"><span class="${P}-dad">${ara(t.k.baslik)}</span>${Number.isFinite(t.f) ? `<strong class="${P}-dfiyat"><bdi>${esc(para(t.f))}</bdi></strong>` : ""}<span class="${P}-dbit" aria-hidden="true"><bdi>${sayiBicim(t.b, t.b % 1 ? 1 : 0)}</bdi></span></li>`; };
    const BS = Number(pick(des.baslangicSure));
    const ilkS = Math.min(MX, Math.max(0.5, Number.isFinite(BS) && BS > 0 ? BS : 1));
    const cetvel = cet ? `<div class="${P}-cetvel-kap"><ol class="${P}-cetvel" role="list" style="--fb-sutun: ${G.map((g) => `minmax(var(--fb-en, 52px), ${g}fr)`).join(" ")}">${D.map(bolum).join("")}<li class="${P}-sifir" aria-hidden="true"><bdi>0</bdi></li></ol><div class="${P}-skap" data-skap hidden><label class="${P}-setiket" for="${P}-{{id}}-r">${esc(metinAl(des, ["sureAd"]) || B.baslik)}</label><input class="${P}-surgu" id="${P}-{{id}}-r" type="range" min="0.5" max="${MX}" step="0.5" value="${ilkS}" data-sure data-para="${PB}" data-birim="${esc(SA)}" /><div class="${P}-sonuc"><p class="${P}-sure" data-scikti></p><p class="${P}-sdil" data-sdilim></p><p class="${P}-tutar"><span>${esc(metinAl(des, ["sonucAd"]) || "@total@")}</span><strong data-stutar aria-live="polite">—</strong></p></div></div></div>` : "";
    const ek = (cet ? E : T).map((t) => `<li class="${P}-ek">${ikonH(t.k.ikon || "local_parking", `${P}-ekik`)}<div class="${P}-ekyazi"><h3 class="${P}-ekad">${ara(t.k.baslik)}</h3>${t.k.metin ? `<p class="${P}-ekmetin">${ara(t.k.metin)}</p>` : ""}</div>${Number.isFinite(t.f) ? `<strong class="${P}-ekfiyat"><bdi>${esc(para(t.f))}</bdi></strong>` : ""}</li>`).join("");
    return `<div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div>${cetvel}${ek ? `<ul class="${P}-ekler" role="list">${ek}</ul>` : ""}${ctaHtml()}`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
