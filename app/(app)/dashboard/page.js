"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { ArrowRight, BellRing } from "lucide-react";
import Badge, { Spinner, EmptyState } from "@/components/ui";
import { rupiah, formatDate } from "@/lib/utils";

const display = { fontFamily: "var(--font-display)" };

const RANGES = [["week", "Minggu"], ["month", "Bulan"], ["year", "Tahun"]];
const RANGE_COPY = {
  week: "7 hari terakhir",
  month: "30 hari terakhir",
  year: "12 bulan terakhir",
};

const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const axisTick = { fontSize: 11, fill: "#64748B" };

function rupiahAxis(v) {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1).replace(".0", "")}jt`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}rb`;
  return v;
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-1 flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color || p.stroke || "#4F46E5" }} />
          <span className="capitalize text-slate-300">{p.dataKey}</span>
          <span className="ml-2 font-semibold tabular-nums text-white">{rupiah(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState("month");
  const [data, setData] = useState(null);
  const [unpaid, setUnpaid] = useState([]);

  useEffect(() => {
    const refresh = () => {
      fetch(`/api/dashboard?range=${range}`).then((r) => r.json()).then(setData);
      const now = new Date();
      fetch(`/api/payments?month=${now.getMonth() + 1}&year=${now.getFullYear()}`).then((r) => r.json()).then((d) => setUnpaid((d.items || []).filter((p) => p.status !== "lunas")));
    };
    setData(null);
    refresh();
    window.addEventListener("refresh-data", refresh);
    return () => window.removeEventListener("refresh-data", refresh);
  }, [range]);

  if (!data) return <Spinner />;
  const { stats, chart, trend, recent } = data;

  const bulanIni = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const cells = [
    { label: "Pemasukan", value: rupiah(stats.pemasukan), tone: "text-emerald-600", edge: "" },
    { label: "Pengeluaran", value: rupiah(stats.pengeluaran), tone: "text-rose-600", edge: "border-l" },
    { label: "Anggota aktif", value: `${stats.anggota}`, tone: "text-slate-900", edge: "" },
    { label: `Kas ${bulanIni}`, value: rupiah(stats.kasBulanIni), tone: "text-orange-600", edge: "border-l" },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {unpaid.length > 0 && (
        <motion.div variants={rise} className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <BellRing size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <div className="text-sm">
            <p className="font-bold text-amber-900">Pengingat Pembayaran Kas</p>
            <p className="mt-0.5 text-amber-800">
              Anda masih memiliki {unpaid.length} tagihan kas bulan {bulanIni} yang belum lunas. Silakan lakukan pembayaran.
            </p>
          </div>
        </motion.div>
      )}

      {/* Judul + pemilih periode */}
      <motion.div variants={rise} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 style={display} className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Ringkasan kas &amp; iuran · grafik {RANGE_COPY[range]} · data diperbarui otomatis</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {RANGES.map(([k, v]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${range === k ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              {range === k && (
                <motion.span
                  layoutId="range-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                />
              )}
              <span className="relative">{v}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Struk kas */}
      <motion.section variants={rise} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Saldo kas</p>
            <p style={display} className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums text-white">
              {rupiah(stats.saldo)}
            </p>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400">
              Akumulasi seluruh transaksi
            </p>
          </div>
          {cells.map((c) => (
            <div key={c.label} className={`border-t border-slate-100 p-6 lg:border-l lg:border-t-0 ${c.edge}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{c.label}</p>
              <p style={display} className={`mt-2 text-2xl font-extrabold tracking-tight tabular-nums ${c.tone}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Grafik */}
      <motion.section variants={rise} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="p-5 lg:border-r lg:border-slate-100">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-slate-900">Pemasukan vs Pengeluaran</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Pemasukan</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500" />Pengeluaran</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#94A3B8" strokeOpacity={0.25} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickFormatter={rupiahAxis} />
                  <Tooltip cursor={{ fill: "#94A3B8", fillOpacity: 0.12 }} content={<ChartTip />} />
                  <Bar dataKey="pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-slate-100 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-slate-900">Perkembangan Saldo</h2>
              <span className="text-xs text-slate-500">Saldo berjalan</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#94A3B8" strokeOpacity={0.25} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickFormatter={rupiahAxis} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="saldo" stroke="none" fill="url(#saldoFill)" />
                  <Line type="monotone" dataKey="saldo" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Transaksi terbaru */}
      <motion.section variants={rise} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">Transaksi Terbaru</h2>
          <Link href="/transaksi" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
            Semua transaksi <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState text="Belum ada transaksi." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Keterangan</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Jenis</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                  <th className="px-5 py-3">User</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(t.transactionDate)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{t.description}</td>
                    <td className="px-5 py-3 text-slate-500">{t.category}</td>
                    <td className="px-5 py-3"><Badge color={t.type === "pemasukan" ? "green" : "red"}>{t.type}</Badge></td>
                    <td className={`px-5 py-3 text-right font-bold tabular-nums ${t.type === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>{rupiah(t.amount)}</td>
                    <td className="px-5 py-3 text-slate-500">{t.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
