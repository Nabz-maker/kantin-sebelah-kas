import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  const { login, password, remember } = await req.json().catch(() => ({}));
  if (!login || !password) return NextResponse.json({ error: "Email/username dan password wajib diisi." }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: login.trim().toLowerCase() }, { username: login.trim().toLowerCase() }] },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email/username atau password salah." }, { status: 401 });
  }
  if (user.status !== "aktif") return NextResponse.json({ error: "Akun Anda dinonaktifkan." }, { status: 403 });

  await createSession(user, true);
  await prisma.loginLog.create({
    data: {
      userId: user.id,
      name: user.name,
      email: user.email,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null,
    },
  });
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}
