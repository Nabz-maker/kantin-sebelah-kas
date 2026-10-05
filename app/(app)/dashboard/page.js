"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import Badge, { Spinner } from "@/components/ui";
import { rupiah, formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      {unpaid.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-bold">Pengingat Pembayaran Kas</p>
          <p className="mt-1">Anda masih memiliki {unpaid.length} tagihan kas bulan {bulanIni} yang belum lunas. Silakan lakukan pembayaran.</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Dashboard</h1>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          {[["week", "Minggu"], ["month", "Bulan"], ["year", "Tahun"]].map(([k, v]) => (
            <button key={k} onClick={() => setRange(k)} className={`rounded-lg px-3 py-1.5 ${range === k ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ["Total Saldo Kas", rupiah(stats.saldo), "text-indigo-600"],
          ["Total Pemasukan", rupiah(stats.pemasukan), "text-emerald-600"],
          ["Total Pengeluaran", rupiah(stats.pengeluaran), "text-rose-600"],
          ["Jumlah Anggota", stats.anggota, "text-slate-800"],
          ["Kas Bulan Ini", rupiah(stats.kasBulanIni), "text-orange-600"],
        ].map(([label, value, cls], i) => (
          <div key={label} className="hover-lift animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-xl font-extrabold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="hover-lift animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Pemasukan vs Pengeluaran</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => rupiah(v)} />
                <Legend />
                <Bar dataKey="pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="hover-lift animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Perkembangan Saldo</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => rupiah(v)} />
                <Line type="monotone" dataKey="saldo" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><h2 className="font-bold">Transaksi Terbaru</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Keterangan</th><th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Jenis</th><th className="px-5 py-3 text-right">Jumlah</th><th className="px-5 py-3">User</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-t border-slate-50">
                  <td className="px-5 py-3 text-slate-500">{formatDate(t.transactionDate)}</td>
                  <td className="px-5 py-3 font-medium">{t.description}</td>
                  <td className="px-5 py-3 text-slate-500">{t.category}</td>
                  <td className="px-5 py-3"><Badge color={t.type === "pemasukan" ? "green" : "red"}>{t.type}</Badge></td>
                  <td className={`px-5 py-3 text-right font-bold ${t.type === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>{rupiah(t.amount)}</td>
                  <td className="px-5 py-3 text-slate-500">{t.user?.name}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
