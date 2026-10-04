import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!setting) setting = await prisma.setting.create({ data: { id: "singleton" } });
  return NextResponse.json({ setting });
}

export async function PUT(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {
      organizationName: b.organizationName, cashName: b.cashName,
      cashAmount: b.cashAmount !== undefined ? Math.max(0, Number(b.cashAmount) || 0) : undefined,
      logo: b.logo, currency: b.currency, theme: b.theme,
      notifTx: b.notifTx, notifPayment: b.notifPayment,
    },
    create: { id: "singleton" },
  });
  return NextResponse.json({ ok: true, setting });
}
