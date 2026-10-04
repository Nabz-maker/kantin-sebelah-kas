"use client";
import { useEffect, useState, useCallback } from "react";
import Badge, { Spinner, EmptyState, inputCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";
import { rupiah, formatDate, bulanName } from "@/lib/utils";

export default function Pembayaran() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState(null);
  const now = new Date();
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), status: "semua", name: "" });
  const [gen, setGen] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), period: "bulanan", week: 1 });

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && v !== "semua" && qs.set(k, v));
    fetch(`/api/payments?${qs}`).then((r) => r.json()).then((d) => setItems(d.items || []));
  }, [filters]);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  useEffect(load, [load]);

  const isAdmin = user?.role === "admin";

  async function setStatus(id, status) {
    const res = await fetch("/api/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) { toast(status === "lunas" ? "Pembayaran kas berhasil dicatat." : "Status pembayaran diperbarui."); load(); }
    else toast("Gagal memperbarui.", false);
  }

  async function generate() {
    const payload = { month: gen.month, year: gen.year, week: gen.period === "mingguan" ? Number(gen.week) : 0 };
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!res.ok) return toast(d.error || "Gagal membuat tagihan.", false);
    toast(`Tagihan dibuat untuk ${d.created} anggota.`);
    load();
  }

  const statusBadge = (s) => s === "lunas" ? <Badge color="green">Sudah Bayar</Badge> : s === "terlambat" ? <Badge color="orange">Terlambat</Badge> : <Badge color="red">Belum Bayar</Badge>;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold tracking-tight">Pembayaran Kas</h1>

      {isAdmin && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Periode</label><select className={inputCls} value={gen.period} onChange={(e) => setGen({ ...gen, period: e.target.value })}><option value="bulanan">Bulanan</option><option value="mingguan">Mingguan</option></select></div>
          {gen.period === "mingguan" && <div><label className="mb-1 block text-xs font-semibold text-slate-500">Minggu ke-</label><input type="number" min="1" max="53" className={inputCls} value={gen.week} onChange={(e) => setGen({ ...gen, week: e.target.value })} /></div>}
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Bulan</label><input type="number" min="1" max="12" className={inputCls} value={gen.month} onChange={(e) => setGen({ ...gen, month: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Tahun</label><input type="number" className={inputCls} value={gen.year} onChange={(e) => setGen({ ...gen, year: e.target.value })} /></div>
          <button onClick={generate} className={btnPrimary}>Buat Tagihan</button>
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <select className={inputCls} value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{bulanName(i + 1)}</option>)}
        </select>
        <input type="number" className={inputCls} value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} placeholder="Tahun" />
        <select className={inputCls} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="semua">Semua Status</option><option value="lunas">Sudah Bayar</option><option value="belum">Belum Bayar</option><option value="terlambat">Terlambat</option>
        </select>
        {isAdmin && <input className={inputCls} placeholder="Cari nama anggota…" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />}
      </div>

      {items === null ? <Spinner /> : items.length === 0 ? <EmptyState text="Belum ada data pembayaran untuk periode ini." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Nama</th><th className="px-5 py-3">Bulan</th><th className="px-5 py-3">Nominal</th>
                <th className="px-5 py-3">Status</th><th className="px-5 py-3">Tanggal Bayar</th>{isAdmin && <th className="px-5 py-3">Aksi</th>}
              </tr></thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-slate-50">
                    <td className="px-5 py-3 font-medium">{p.user?.name}</td>
                    <td className="px-5 py-3 text-slate-500">{p.week ? `Minggu ke-${p.week}, ` : ""}{bulanName(p.month)} {p.year}</td>
                    <td className="px-5 py-3 font-semibold">{rupiah(p.amount)}</td>
                    <td className="px-5 py-3">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(p.paidAt)}</td>
                    {isAdmin && <td className="px-5 py-3">
                      {p.status !== "lunas" && <button onClick={() => setStatus(p.id, "lunas")} className="mr-2 text-sm font-semibold text-emerald-600">Tandai Lunas</button>}
                      {p.status === "belum" && <button onClick={() => setStatus(p.id, "terlambat")} className="text-sm font-semibold text-orange-600">Terlambat</button>}
                      {p.status !== "belum" && <button onClick={() => setStatus(p.id, "belum")} className="text-sm font-semibold text-slate-500">Reset</button>}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
