import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { token, password, confirmPassword } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: "Konfirmasi password tidak sama." }, { status: 400 });

  const rt = await prisma.resetToken.findUnique({ where: { token } });
  if (!rt || rt.used || rt.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link reset tidak valid atau sudah kedaluwarsa." }, { status: 400 });
  }
  await prisma.user.update({ where: { id: rt.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await prisma.resetToken.update({ where: { id: rt.id }, data: { used: true } });
  return NextResponse.json({ ok: true });
}
