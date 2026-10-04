import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (s.role !== "admin" && s.uid !== id) return NextResponse.json({ error: "Dilarang." }, { status: 403 });
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const { passwordHash, ...safe } = u;
  return NextResponse.json({ user: safe });
}

export async function PUT(req, { params }) {
  const s = await getSession();
  const { id } = await params;
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isSelf = s.uid === id;
  const isAdmin = s.role === "admin";
  if (!isSelf && !isAdmin) return NextResponse.json({ error: "Dilarang." }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });

  const data = { ...(b.name ? { name: b.name.trim() } : {}), ...(b.email ? { email: b.email.trim().toLowerCase() } : {}), ...(b.phone !== undefined ? { phone: b.phone } : {}), ...(b.avatar !== undefined ? { avatar: b.avatar } : {}) };
  if (isAdmin) {
    if (b.role) data.role = b.role === "admin" ? "admin" : "member";
    if (b.status) data.status = b.status === "nonaktif" ? "nonaktif" : "aktif";
  }
  if (b.newPassword) {
    if (b.newPassword.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    if (!isAdmin) {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!(await bcrypt.compare(b.currentPassword || "", u.passwordHash))) return NextResponse.json({ error: "Password lama salah." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(b.newPassword, 10);
  }
  try {
    const u = await prisma.user.update({ where: { id }, data });
    const { passwordHash, ...safe } = u;
    return NextResponse.json({ ok: true, user: safe });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui (email/username mungkin duplikat)." }, { status: 409 });
  }
}

export async function DELETE(req, { params }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const { id } = await params;
  if (id === s.uid) return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri." }, { status: 400 });
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 404 });
  }
}
