import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  if (b.amount !== undefined && Number(b.amount) <= 0) return NextResponse.json({ error: "Nominal tidak valid." }, { status: 400 });
  try {
    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        type: b.type, category: b.category, amount: b.amount !== undefined ? Math.round(Number(b.amount)) : undefined,
        description: b.description, transactionDate: b.transactionDate ? new Date(b.transactionDate) : undefined,
        proof: b.proof, notes: b.notes,
      },
    });
    return NextResponse.json({ ok: true, tx });
  } catch {
    return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  }
}

export async function DELETE(req, { params }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  }
}
