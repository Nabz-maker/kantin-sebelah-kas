"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Grafik di-lazy-load agar bundle awal ringan di Android — yang dibungkus
// seluruh modul grafiknya, bukan komponen recharts satu per satu.
const Charts = dynamic(() => import("@/components/charts"), { ssr: false });
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

function VideoIntro() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("dashboardIntroShown");
  });

  const handleVideoEnd = () => {
    localStorage.setItem("dashboardIntroShown", "true");
    setShow(false);
  };

  return show ? (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
    >
      <video
        autoPlay
        muted
        onEnded={handleVideoEnd}
        className="w-full h-full object-contain"
      >
        <source src="/animasi.webm" type="video/webm" />
      </video>
    </motion.div>
  ) : null;
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
    <>
      <VideoIntro />
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
        <Charts variant="split" data={chart} trend={trend} range={range} />
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
    </>
  );
}
