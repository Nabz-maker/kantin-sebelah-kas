"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Badge, { Spinner, ConfirmModal, EmptyState, inputCls, labelCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";
import { rupiah, formatDate } from "@/lib/utils";

function Transaksi() {
  const params = useSearchParams();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({ q: params.get("q") || "", type: "semua", category: "semua", from: "", to: "", page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));
    fetch(`/api/transactions?${qs}`).then((r) => r.json()).then(setData);
  }, [filters]);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then((d) => setCats(d.items || [])); }, []);
  useEffect(load, [load]);

  const isAdmin = user?.role === "admin";

  async function save(values) {
    const url = editing ? `/api/transactions/${editing.id}` : "/api/transactions";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const d = await res.json();
    if (!res.ok) return toast(d.error, false);
    toast(editing ? "Transaksi berhasil diperbarui." : values.type === "pemasukan" ? "Pemasukan berhasil ditambahkan." : "Pengeluaran berhasil ditambahkan.");
    setShowForm(false); setEditing(null); load();
  }

  async function del(id) {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Transaksi berhasil dihapus."); setConfirmDel(null); load(); } else toast("Gagal menghapus.", false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Riwayat Transaksi</h1>
        {isAdmin && <button onClick={() => { setEditing(null); setShowForm(true); }} className={btnPrimary}>+ Tambah Transaksi</button>}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input className={inputCls} placeholder="Cari keterangan…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
        <select className={inputCls} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}>
          <option value="semua">Semua Jenis</option><option value="pemasukan">Pemasukan</option><option value="pengeluaran">Pengeluaran</option>
        </select>
        <select className={inputCls} value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
          <option value="semua">Semua Kategori</option>
          {cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input type="date" className={inputCls} value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })} />
        <input type="date" className={inputCls} value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })} />
      </div>

      {!data ? <Spinner /> : data.items.length === 0 ? <EmptyState text="Tidak ada transaksi ditemukan." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Keterangan</th><th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Jenis</th><th className="px-5 py-3 text-right">Jumlah</th><th className="px-5 py-3">User</th>
                {isAdmin && <th className="px-5 py-3">Aksi</th>}
              </tr></thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} className="border-t border-slate-50">
                    <td className="px-5 py-3 text-slate-500">{formatDate(t.transactionDate)}</td>
                    <td className="px-5 py-3 font-medium">{t.description}</td>
                    <td className="px-5 py-3 text-slate-500">{t.category}</td>
                    <td className="px-5 py-3"><Badge color={t.type === "pemasukan" ? "green" : "red"}>{t.type}</Badge></td>
                    <td className={`px-5 py-3 text-right font-bold ${t.type === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>{rupiah(t.amount)}</td>
                    <td className="px-5 py-3 text-slate-500">{t.user?.name}</td>
                    {isAdmin && <td className="px-5 py-3">
                      <button onClick={() => { setEditing(t); setShowForm(true); }} className="mr-2 text-sm font-semibold text-indigo-600">Edit</button>
                      <button onClick={() => setConfirmDel(t)} className="text-sm font-semibold text-rose-600">Hapus</button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>Halaman {data.page} dari {data.pages || 1} · {data.total} data</span>
            <div className="flex gap-1">
              <button disabled={data.page <= 1} onClick={() => setFilters({ ...filters, page: data.page - 1 })} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Prev</button>
              <button disabled={data.page >= data.pages} onClick={() => setFilters({ ...filters, page: data.page + 1 })} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}

      {showForm && <TxForm cats={cats} initial={editing} onSave={save} onClose={() => { setShowForm(false); setEditing(null); }} />}
      <ConfirmModal open={!!confirmDel} title="Hapus Transaksi" text={`Yakin ingin menghapus "${confirmDel?.description}"?`} onCancel={() => setConfirmDel(null)} onConfirm={() => del(confirmDel.id)} />
    </div>
  );
}

function TxForm({ cats, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    type: initial.type, category: initial.category, amount: initial.amount, description: initial.description,
    transactionDate: initial.transactionDate?.slice(0, 10), notes: initial.notes || "", proof: initial.proof || "",
  } : { type: "pemasukan", category: "", amount: "", description: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "", proof: "" });

  const filteredCats = cats.filter((c) => c.type === form.type);

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("File harus berupa gambar.", false);
    if (f.size > 2 * 1024 * 1024) return toast("Ukuran gambar maksimal 2MB.", false);
    const reader = new FileReader();
    reader.onload = () => setForm((cur) => ({ ...cur, proof: reader.result }));
    reader.readAsDataURL(f);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.category) return toast("Pilih kategori.", false);
    if (!form.amount || Number(form.amount) <= 0) return toast("Nominal harus lebih dari 0.", false);
    if (!form.description.trim()) return toast("Keterangan wajib diisi.", false);
    onSave({ ...form, amount: Number(form.amount) });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold">{initial ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
        <div className="grid grid-cols-2 gap-2">
          {["pemasukan", "pengeluaran"].map((t) => (
            <button type="button" key={t} onClick={() => setForm({ ...form, type: t, category: "" })} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize ${form.type === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{t}</button>
          ))}
        </div>
        <div><label className={labelCls}>Tanggal</label><input type="date" className={inputCls} value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} /></div>
        <div><label className={labelCls}>{form.type === "pemasukan" ? "Sumber Dana" : "Tujuan Pengeluaran"} (Keterangan)</label><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="cth: Iuran bulan Oktober" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Kategori</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Pilih…</option>{filteredCats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Nominal (Rp)</label><input type="number" min="1" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
        </div>
        <div><label className={labelCls}>Bukti Pembayaran (opsional)</label><input type="file" accept="image/*" onChange={onFile} className="text-sm" />{form.proof && <p className="mt-1 text-xs text-emerald-600">✓ Bukti terlampir</p>}</div>
        <div><label className={labelCls}>Catatan</label><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Batal</button>
          <button className={btnPrimary}>Simpan</button>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<Spinner />}><Transaksi /></Suspense>;
}
