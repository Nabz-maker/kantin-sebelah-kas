import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Batas ukuran bukti bayar (data URL base64 ±2MB gambar)
const MAX_PROOF_CHARS = 3_000_000;

// POST: anggota melaporkan pembayaran QRIS (bukti opsional) → status menunggu
export async function POST(req, { params }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const payment = await prisma.cashPayment.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
  if (s.role !== "admin" && payment.userId !== s.uid) {
    return NextResponse.json({ error: "Tidak boleh mengakses tagihan ini." }, { status: 403 });
  }
  if (payment.status === "lunas") return NextResponse.json({ error: "Tagihan ini sudah lunas." }, { status: 400 });
  if (payment.status === "menunggu") {
    return NextResponse.json({ error: "Pembayaran sudah dikirim dan sedang menunggu verifikasi admin." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const proof = typeof body.proof === "string" && body.proof ? body.proof : null;
  const note = typeof body.submitNote === "string" ? body.submitNote.trim().slice(0, 300) : "";

  if (proof) {
    if (!/^data:image\//.test(proof)) return NextResponse.json({ error: "Bukti harus berupa gambar." }, { status: 400 });
    if (proof.length > MAX_PROOF_CHARS) return NextResponse.json({ error: "Ukuran bukti maksimal ±2MB." }, { status: 400 });
  }

  const updated = await prisma.cashPayment.update({
    where: { id },
    data: { status: "menunggu", submittedAt: new Date(), proof, submitNote: note || null },
  });

  const periode = payment.week
    ? `minggu ke-${payment.week} ${payment.month}/${payment.year}`
    : `${payment.month}/${payment.year}`;
  const admins = await prisma.user.findMany({ where: { role: "admin", status: "aktif" } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        text: `${payment.user?.name || "Anggota"} mengirim pembayaran kas ${periode} sebesar Rp ${payment.amount.toLocaleString("id-ID")} — menunggu verifikasi.`,
      })),
    });
  }

  return NextResponse.json({ ok: true, payment: updated });
}
