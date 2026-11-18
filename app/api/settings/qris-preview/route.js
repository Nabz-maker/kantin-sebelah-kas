import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateQris, withNominal, toQrDataUrl } from "@/lib/qris";

// POST: validasi string QRIS + pratinjau QR dengan nominal contoh
export async function POST(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

  const { qrisString } = await req.json().catch(() => ({}));
  const check = validateQris(qrisString);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  try {
    const payload = withNominal(check.payload, 1000);
    const qrDataUrl = await toQrDataUrl(payload);
    return NextResponse.json({ ok: true, merchant: check.merchant, city: check.city, qrDataUrl });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Gagal membuat pratinjau QRIS." }, { status: 400 });
  }
}
