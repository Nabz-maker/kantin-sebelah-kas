import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: s.uid } });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  const { passwordHash, ...safe } = user;
  return NextResponse.json({ user: safe });
}
