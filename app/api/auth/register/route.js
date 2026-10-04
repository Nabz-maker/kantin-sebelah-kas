import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { name, username, email, phone, password, confirmPassword, agree } = body;

  if (!agree) return NextResponse.json({ error: "Anda harus menyetujui syarat penggunaan." }, { status: 400 });
  if (!name || name.trim().length < 2) return NextResponse.json({ error: "Nama lengkap minimal 2 karakter." }, { status: 400 });
  if (!username || username.trim().length < 3) return NextResponse.json({ error: "Username minimal 3 karakter." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: "Konfirmasi password tidak sama." }, { status: 400 });

  const dupe = await prisma.user.findFirst({ where: { OR: [{ email: email.trim().toLowerCase() }, { username: username.trim().toLowerCase() }] } });
  if (dupe) return NextResponse.json({ error: "Email atau username sudah terdaftar." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      passwordHash: await bcrypt.hash(password, 10),
      role: "member",
    },
  });
  await createSession(user);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}
