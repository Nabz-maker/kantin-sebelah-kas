// Utilitas QRIS (EMVCo) — memvalidasi string QRIS statis milik merchant
// dan menyisipkan nominal tagihan secara dinamis (tag 54) dengan CRC baru.

export function normalizeQris(raw) {
  // Hanya buang spasi/newline di tepi dan baris baru — spasi di dalam nama merchant itu valid.
  return String(raw || "").replace(/[\r\n\t]+/g, "").trim();
}

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)
export function crc16(input) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseTlv(payload) {
  const entries = [];
  let i = 0;
  while (i < payload.length) {
    if (i + 4 > payload.length) return { error: "Struktur QRIS terpotong." };
    const tag = payload.slice(i, i + 2);
    const lenStr = payload.slice(i + 2, i + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lenStr)) return { error: "Struktur QRIS tidak valid." };
    const len = Number(lenStr);
    const value = payload.slice(i + 4, i + 4 + len);
    if (value.length !== len) return { error: "Panjang data QRIS tidak sesuai." };
    entries.push({ tag, value });
    i += 4 + len;
  }
  return { entries };
}

function buildTlv({ tag, value }) {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

export function validateQris(raw) {
  const payload = normalizeQris(raw);
  if (!payload) return { ok: false, error: "String QRIS masih kosong." };
  if (payload.length < 60) return { ok: false, error: "String QRIS terlalu pendek — periksa kembali." };
  if (!payload.startsWith("000201")) return { ok: false, error: "Format bukan QRIS (harus diawali 000201)." };

  const parsed = parseTlv(payload);
  if (parsed.error) return { ok: false, error: parsed.error };

  const tags = Object.fromEntries(parsed.entries.map((e) => [e.tag, e.value]));
  if (!tags["58"]) return { ok: false, error: "Kode negara (tag 58) tidak ditemukan." };
  if (!tags["63"] || !/^[0-9a-f]{4}$/i.test(tags["63"])) return { ok: false, error: "CRC (tag 63) tidak ditemukan." };
  if (tags["55"]) return { ok: false, error: "QRIS ini memakai konfigurasi tip (tag 55) — nominal dinamis tidak didukung." };

  const withoutCrc = payload.slice(0, -4);
  if (!withoutCrc.endsWith("6304")) return { ok: false, error: "Struktur CRC QRIS tidak valid." };
  const expected = crc16(withoutCrc);
  if (tags["63"].toUpperCase() !== expected) {
    return { ok: false, error: `CRC QRIS tidak valid (terbaca ${tags["63"]}, seharusnya ${expected}). Pastikan string disalin utuh.` };
  }

  return {
    ok: true,
    payload,
    merchant: tags["59"] || null,
    city: tags["60"] || null,
  };
}

export function withNominal(raw, amount) {
  const check = validateQris(raw);
  if (!check.ok) throw new Error(check.error);

  const nominal = Math.round(Number(amount));
  if (!Number.isFinite(nominal) || nominal < 100) throw new Error("Nominal QRIS minimal Rp 100.");
  if (nominal > 9999999999) throw new Error("Nominal QRIS terlalu besar.");

  const { entries } = parseTlv(check.payload);
  const kept = entries.filter((e) => !["54", "63"].includes(e.tag));
  const amountEntry = { tag: "54", value: String(nominal) };
  const idx58 = kept.findIndex((e) => e.tag === "58");
  if (idx58 === -1) kept.push(amountEntry);
  else kept.splice(idx58, 0, amountEntry);

  let out = kept.map(buildTlv).join("") + "6304";
  out += crc16(out);
  return out;
}

export async function toQrDataUrl(payload) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 640,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
