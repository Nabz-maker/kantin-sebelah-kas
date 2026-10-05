"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner, btnPrimary } from "@/components/ui";
import { rupiah, formatDate } from "@/lib/utils";
import { toast } from "@/components/ToastHost";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

export default function Laporan() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const refresh = () => fetch("/api/dashboard?range=month").then((r) => r.json()).then(setData);
    refresh();
    window.addEventListener("refresh-data", refresh);
    return () => window.removeEventListener("refresh-data", refresh);
  }, []);

  if (!data) return <Spinner />;

  // Untuk laporan, ambil transaksi semua halaman (sederhana: gunakan data dashboard + transaksi terbaru)
  function exportCsv() {
    const rows = [["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah", "User"]];
    data.recent.forEach((t) => rows.push([formatDate(t.transactionDate), t.description, t.category, t.type, t.amount, t.user?.name || "-"]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "laporan-kantin-sebelah.csv";
    a.click();
    toast("File Excel (CSV) berhasil diunduh.");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="no-print flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Laporan Keuangan</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Export Excel</button>
          <button onClick={() => window.print()} className={btnPrimary}>Print / PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Total Pemasukan", rupiah(data.stats.pemasukan), "text-emerald-600"], ["Total Pengeluaran", rupiah(data.stats.pengeluaran), "text-rose-600"], ["Saldo Akhir", rupiah(data.stats.saldo), "text-indigo-600"], ["Jumlah Anggota", data.stats.anggota, "text-slate-800"]].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{l}</p>
            <p className={`mt-2 text-xl font-extrabold tabular-nums ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Grafik Bulanan</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => rupiah(v)} />
              <Legend />
              <Bar dataKey="pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><h2 className="font-bold">Tabel Transaksi</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Keterangan</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Jenis</th><th className="px-5 py-3 text-right">Jumlah</th>
            </tr></thead>
            <tbody>
              {data.recent.map((t) => (
                <tr key={t.id} className="border-t border-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(t.transactionDate)}</td>
                  <td className="px-5 py-3 font-medium">{t.description}</td>
                  <td className="px-5 py-3 text-slate-500">{t.category}</td>
                  <td className="px-5 py-3">{t.type}</td>
                  <td className={`px-5 py-3 text-right font-bold tabular-nums ${t.type === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>{rupiah(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
