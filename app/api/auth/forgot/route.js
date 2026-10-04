import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  // Selalu respond sukses agar email tidak bisa ditebak
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    await prisma.resetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // Simulasi pengiriman email (tampilkan di respons & server log)
    console.log(`[RESET PASSWORD] Link: /reset-password?token=${token}`);
    return NextResponse.json({ ok: true, devLink: `/reset-password?token=${token}` });
  }
  return NextResponse.json({ ok: true });
}
