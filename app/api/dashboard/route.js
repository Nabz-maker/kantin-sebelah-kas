import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "month"; // week | month | year

  const now = new Date();
  let since = new Date(now);
  if (range === "week") since.setDate(now.getDate() - 7);
  else if (range === "year") since.setFullYear(now.getFullYear() - 1);
  else since.setMonth(now.getMonth() - 1);

  const [txs, monthTxs, memberCount, recent] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { transactionDate: "asc" } }),
    prisma.transaction.findMany({ where: { transactionDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
    prisma.user.count({ where: { role: "member", status: "aktif" } }),
    prisma.transaction.findMany({ include: { user: { select: { name: true } } }, orderBy: { transactionDate: "desc" }, take: 8 }),
  ]);

  const sum = (arr, type) => arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const pemasukan = sum(txs, "pemasukan");
  const pengeluaran = sum(txs, "pengeluaran");

  const inRange = txs.filter((t) => new Date(t.transactionDate) >= since);
  // Group per day/month
  const buckets = {};
  for (const t of inRange) {
    const d = new Date(t.transactionDate);
    const key = range === "year" ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : d.toISOString().slice(0, 10);
    buckets[key] = buckets[key] || { label: key, pemasukan: 0, pengeluaran: 0 };
    buckets[key][t.type] += t.amount;
  }
  // Balance trend
  let running = 0;
  const allOrdered = [...txs].sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
  const trendMap = {};
  for (const t of allOrdered) {
    running += t.type === "pemasukan" ? t.amount : -t.amount;
    trendMap[t.transactionDate.toISOString().slice(0, 10)] = running;
  }
  const trend = Object.entries(trendMap).filter(([d]) => new Date(d) >= since).map(([date, saldo]) => ({ date, saldo }));

  return NextResponse.json({
    stats: {
      saldo: pemasukan - pengeluaran,
      pemasukan,
      pengeluaran,
      anggota: memberCount,
      kasBulanIni: sum(monthTxs, "pemasukan") - sum(monthTxs, "pengeluaran"),
    },
    chart: Object.values(buckets),
    trend,
    recent,
  });
}
