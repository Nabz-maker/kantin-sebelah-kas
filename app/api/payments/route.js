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
  const status = searchParams.get("status");
  const name = searchParams.get("name") || "";

  const where = {
    ...(month ? { month: Number(month) } : {}),
    ...(year ? { year: Number(year) } : {}),
    ...(status && status !== "semua" ? { status } : {}),
    ...(s.role !== "admin" ? { userId: s.uid } : {}),
    ...(name ? { user: { name: { contains: name } } } : {}),
  };
  const items = await prisma.cashPayment.findMany({
    where,
    include: { user: { select: { name: true, username: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }, { user: { name: "asc" } }],
  });
  return NextResponse.json({ items });
}

// POST: admin generate tagihan bulan tertentu untuk semua member aktif
export async function POST(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { month, year } = await req.json().catch(() => ({}));
  const m = Number(month), y = Number(year);
  if (!m || !y) return NextResponse.json({ error: "Bulan dan tahun wajib." }, { status: 400 });
  const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  const amount = setting?.cashAmount ?? 50000;
  const members = await prisma.user.findMany({ where: { role: "member", status: "aktif" } });
  let created = 0;
  for (const u of members) {
    const exists = await prisma.cashPayment.findUnique({ where: { userId_month_year: { userId: u.id, month: m, year: y } } });
    if (!exists) { await prisma.cashPayment.create({ data: { userId: u.id, month: m, year: y, amount } }); created++; }
  }
  return NextResponse.json({ ok: true, created });
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
  // Jika lunas → catat pemasukan otomatis
  if (status === "lunas") {
    await prisma.transaction.create({
      data: {
        userId: s.uid, type: "pemasukan", category: "Iuran Bulanan", amount: p.amount,
        description: `Pembayaran kas ${p.month}/${p.year}`, transactionDate: new Date(),
      },
    });
  }
  return NextResponse.json({ ok: true, p });
}
