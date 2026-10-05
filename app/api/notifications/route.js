import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.notification.findMany({ where: { userId: s.uid }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ items });
}

export async function PATCH() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.notification.deleteMany({ where: { userId: s.uid } });
  return NextResponse.json({ ok: true });
}
