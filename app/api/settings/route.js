import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateQris } from "@/lib/qris";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!setting) setting = await prisma.setting.create({ data: { id: "singleton" } });
  // String QRIS hanya boleh dibaca admin; anggota cukup tahu fiturnya aktif.
  const safe = s.role === "admin" ? setting : { ...setting, qrisString: setting.qrisString ? "••••" : null };
  return NextResponse.json({ setting: safe });
}

export async function PUT(req) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  const b = await req.json().catch(() => ({}));

  const data = {
    organizationName: b.organizationName,
    cashName: b.cashName,
    cashAmount: b.cashAmount !== undefined ? Math.max(0, Number(b.cashAmount) || 0) : undefined,
    logo: b.logo, currency: b.currency, theme: b.theme,
    notifTx: b.notifTx, notifPayment: b.notifPayment,
    qrisEnabled: b.qrisEnabled !== undefined ? !!b.qrisEnabled : undefined,
  };

  if (b.qrisString !== undefined) {
    const raw = String(b.qrisString || "").trim();
    if (!raw) {
      data.qrisString = null;
      data.qrisMerchant = null;
      data.qrisEnabled = false;
    } else {
      const check = validateQris(raw);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      data.qrisString = check.payload;
      data.qrisMerchant = check.merchant;
    }
  }

  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  return NextResponse.json({ ok: true, setting });
}
