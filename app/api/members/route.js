import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const where = {
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { username: { contains: q } }] } : {}),
    ...(role && role !== "semua" ? { role } : {}),
    ...(status && status !== "semua" ? { status } : {}),
  };
  const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items: users.map(({ passwordHash, ...u }) => u) });
}

export async function POST(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.name?.trim() || !b.username?.trim() || !b.email?.trim()) return NextResponse.json({ error: "Nama, username, email wajib." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  if (!b.password || b.password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  const dupe = await prisma.user.findFirst({ where: { OR: [{ email: b.email.trim().toLowerCase() }, { username: b.username.trim().toLowerCase() }] } });
  if (dupe) return NextResponse.json({ error: "Email/username sudah dipakai." }, { status: 409 });
  const u = await prisma.user.create({
    data: {
      name: b.name.trim(), username: b.username.trim().toLowerCase(), email: b.email.trim().toLowerCase(),
      phone: b.phone?.trim() || null, passwordHash: await bcrypt.hash(b.password, 10),
      role: b.role === "admin" ? "admin" : "member", status: b.status === "nonaktif" ? "nonaktif" : "aktif", avatar: b.avatar || null,
    },
  });
  const { passwordHash, ...safe } = u;
  return NextResponse.json({ ok: true, user: safe });
}
