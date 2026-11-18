import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withNominal, toQrDataUrl } from "@/lib/qris";

// GET: QRIS dinamis (nominal otomatis) untuk satu tagihan
export async function GET(_req, { params }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const payment = await prisma.cashPayment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
  if (s.role !== "admin" && payment.userId !== s.uid) {
    return NextResponse.json({ error: "Tidak boleh mengakses tagihan ini." }, { status: 403 });
  }
  if (payment.status === "lunas") {
    return NextResponse.json({ error: "Tagihan ini sudah lunas." }, { status: 400 });
  }

  const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!setting?.qrisEnabled || !setting?.qrisString) {
    return NextResponse.json({ error: "Pembayaran QRIS belum diaktifkan admin." }, { status: 400 });
  }

  try {
    const payload = withNominal(setting.qrisString, payment.amount);
    const qrDataUrl = await toQrDataUrl(payload);
    return NextResponse.json(
      {
        amount: payment.amount,
        merchant: setting.qrisMerchant || setting.organizationName,
        qrDataUrl,
        payment: { id: payment.id, month: payment.month, year: payment.year, week: payment.week, description: payment.description },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message || "Gagal membuat QRIS." }, { status: 400 });
  }
}
