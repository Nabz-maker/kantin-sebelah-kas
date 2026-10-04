import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = 10;

  const where = {
    ...(type && type !== "semua" ? { type } : {}),
    ...(category && category !== "semua" ? { category } : {}),
    ...(from || to ? { transactionDate: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to + "T23:59:59") } : {}) } } : {}),
    ...(q ? { description: { contains: q } } : {}),
  };

  if (s.role !== "admin") where.userId = s.uid; // member hanya lihat transaksi kas umum yang dibuat admin? -> member boleh lihat semua transaksi kas organisasi (read-only)
  delete where.userId;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { transactionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.type || !["pemasukan", "pengeluaran"].includes(b.type)) return NextResponse.json({ error: "Jenis tidak valid." }, { status: 400 });
  if (!b.amount || Number(b.amount) <= 0) return NextResponse.json({ error: "Nominal harus lebih dari 0." }, { status: 400 });
  if (!b.category) return NextResponse.json({ error: "Kategori wajib." }, { status: 400 });
  if (!b.description?.trim()) return NextResponse.json({ error: "Keterangan wajib." }, { status: 400 });
  if (!b.transactionDate) return NextResponse.json({ error: "Tanggal wajib." }, { status: 400 });

  const tx = await prisma.transaction.create({
    data: {
      userId: s.uid,
      type: b.type,
      category: b.category,
      amount: Math.round(Number(b.amount)),
      description: b.description.trim(),
      transactionDate: new Date(b.transactionDate),
      proof: b.proof || null,
      notes: b.notes?.trim() || null,
    },
  });
  return NextResponse.json({ ok: true, tx });
}
