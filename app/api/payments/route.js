import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: daftar pembayaran kas (admin: semua/filter, member: miliknya sendiri)
export async function GET(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const week = searchParams.get("week");
  const status = searchParams.get("status");
  const name = searchParams.get("name") || "";

  const where = {
    ...(month ? { month: Number(month) } : {}),
    ...(year ? { year: Number(year) } : {}),
    ...(week !== null && week !== "" ? { week: Number(week) } : {}),
    ...(status && status !== "semua" ? { status } : {}),
    ...(s.role !== "admin" ? { userId: s.uid } : {}),
    ...(name ? { user: { name: { contains: name } } } : {}),
  };
  const items = await prisma.cashPayment.findMany({
    where,
    include: { user: { select: { name: true, username: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }, { week: "asc" }, { user: { name: "asc" } }],
  });
  return NextResponse.json({ items });
}

// POST: admin generate tagihan bulan tertentu untuk semua member aktif
export async function POST(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { month, year, week, amount, description } = await req.json().catch(() => ({}));
  const m = Number(month), y = Number(year);
  const w = week === undefined || week === null || week === "" ? 0 : Number(week);
  if (!m || !y || (w < 0 || w > 53)) return NextResponse.json({ error: "Bulan, tahun, dan minggu wajib valid." }, { status: 400 });
  const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  const finalAmount = amount !== undefined && amount !== null && amount !== "" ? Number(amount) : (setting?.cashAmount ?? 50000);
  if (!finalAmount || finalAmount <= 0) return NextResponse.json({ error: "Nominal tagihan wajib lebih dari 0." }, { status: 400 });
  const members = await prisma.user.findMany({ where: { role: "member", status: "aktif" } });
  let created = 0;
  for (const u of members) {
    const exists = await prisma.cashPayment.findUnique({ where: { userId_month_year_week: { userId: u.id, month: m, year: y, week: w } } });
    if (!exists) { await prisma.cashPayment.create({ data: { userId: u.id, month: m, year: y, week: w, amount: finalAmount, description: description?.trim() || null } }); created++; }
  }
  return NextResponse.json({ ok: true, created });
}

// DELETE: admin hapus riwayat pembayaran (opsional ikut hapus transaksi terkait)
export async function DELETE(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
  try {
    const p = await prisma.cashPayment.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    await prisma.cashPayment.delete({ where: { id } });
    // Hapus juga transaksi pemasukan yang dibuat dari pembayaran ini (jika lunas)
    if (p.status === "lunas") {
      await prisma.transaction.deleteMany({
        where: {
          userId: s.uid,
          type: "pemasukan",
          category: { in: ["Iuran Kas", "Iuran Bulanan"] },
          amount: p.amount,
          description: p.week ? `Pembayaran kas minggu ke-${p.week} ${p.month}/${p.year}` : `Pembayaran kas ${p.month}/${p.year}`,
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 500 });
  }
}

// PATCH: admin tandai status pembayaran
export async function PATCH(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !["lunas", "belum", "terlambat"].includes(status)) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const p = await prisma.cashPayment.update({
    where: { id },
    data: { status, paidAt: status === "lunas" ? new Date() : null },
  });
  // Jika lunas → catat pemasukan otomatis; jika direset/ubah → hapus transaksi yang dulu dibuat
  const expectedDesc = p.week ? `Pembayaran kas minggu ke-${p.week} ${p.month}/${p.year}` : `Pembayaran kas ${p.month}/${p.year}`;
  if (status === "lunas") {
    const exists = await prisma.transaction.findFirst({
      where: { type: "pemasukan", category: { in: ["Iuran Kas", "Iuran Bulanan"] }, amount: p.amount, description: expectedDesc },
    });
    if (!exists) {
      await prisma.transaction.create({
        data: {
          userId: s.uid, type: "pemasukan", category: "Iuran Kas", amount: p.amount,
          description: expectedDesc, transactionDate: new Date(),
        },
      });
    }
  } else {
    await prisma.transaction.deleteMany({
      where: { type: "pemasukan", category: { in: ["Iuran Kas", "Iuran Bulanan"] }, amount: p.amount, description: expectedDesc },
    });
  }
  return NextResponse.json({ ok: true, p });
}
