"use client";
import { useEffect, useState, useCallback, Fragment } from "react";
import Badge, { Spinner, EmptyState, inputCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";
import { rupiah, formatDate, bulanName } from "@/lib/utils";

export default function Pembayaran() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState(null);
  const now = new Date();
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), status: "semua", name: "" });
  const [gen, setGen] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), period: "bulanan", week: 1, amount: "", description: "" });
  const [payTarget, setPayTarget] = useState(null);
  const [viewProof, setViewProof] = useState(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && v !== "semua" && qs.set(k, v));
    fetch(`/api/payments?${qs}`).then((r) => r.json()).then((d) => setItems(d.items || []));
  }, [filters]);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  useEffect(load, [load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("refresh-data", h);
    return () => window.removeEventListener("refresh-data", h);
  }, [load]);

  const isAdmin = user?.role === "admin";

  async function setStatus(id, status) {
    const res = await fetch("/api/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) {
      toast(
        status === "lunas" ? "Pembayaran kas berhasil diverifikasi." : status === "belum" ? "Pembayaran dikembalikan ke belum bayar." : "Status pembayaran diperbarui."
      );
      load();
    } else toast("Gagal memperbarui.", false);
  }

  async function generate() {
    const payload = { month: gen.month, year: gen.year, week: gen.period === "mingguan" ? Number(gen.week) : 0, amount: gen.amount, description: gen.description };
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!res.ok) return toast(d.error || "Gagal membuat tagihan.", false);
    toast(`Tagihan dibuat untuk ${d.created} anggota.`);
    load();
  }

  async function removePayment(id) {
    if (!confirm("Hapus riwayat pembayaran ini?")) return;
    const res = await fetch("/api/payments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { toast("Riwayat pembayaran dihapus."); load(); }
    else { const d = await res.json(); toast(d.error || "Gagal menghapus.", false); }
  }

  const statusBadge = (s) =>
    s === "lunas" ? <Badge color="green">Sudah Bayar</Badge>
      : s === "menunggu" ? <Badge color="indigo">Menunggu Verifikasi</Badge>
        : s === "terlambat" ? <Badge color="orange">Terlambat</Badge>
          : <Badge color="red">Belum Bayar</Badge>;

  // Kelompokkan tagihan per periode agar tampilan admin tidak menumpuk
  const groups = Object.values(
    (items || []).reduce((acc, p) => {
      const key = `${p.year}-${p.month}-${p.week || 0}-${p.description || ""}`;
      acc[key] = acc[key] || { key, year: p.year, month: p.month, week: p.week, description: p.description, amount: p.amount, rows: [] };
      acc[key].rows.push(p);
      return acc;
    }, {})
  );
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = (key) => setOpenGroups((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold tracking-tight">Pembayaran Kas</h1>

      {isAdmin && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Periode</label><select className={inputCls} value={gen.period} onChange={(e) => setGen({ ...gen, period: e.target.value })}><option value="bulanan">Bulanan</option><option value="mingguan">Mingguan</option></select></div>
          {gen.period === "mingguan" && <div><label className="mb-1 block text-xs font-semibold text-slate-500">Minggu ke-</label><input type="number" min="1" max="53" className={inputCls} value={gen.week} onChange={(e) => setGen({ ...gen, week: e.target.value })} /></div>}
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Bulan</label><input type="number" min="1" max="12" className={inputCls} value={gen.month} onChange={(e) => setGen({ ...gen, month: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Tahun</label><input type="number" className={inputCls} value={gen.year} onChange={(e) => setGen({ ...gen, year: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Nominal (Rp)</label><input type="number" min="1" className={inputCls} value={gen.amount} onChange={(e) => setGen({ ...gen, amount: e.target.value })} placeholder="kosong = nominal setting" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-500">Deskripsi</label><input className={inputCls} value={gen.description} onChange={(e) => setGen({ ...gen, description: e.target.value })} placeholder="cth: Iuran kebersihan bulan ini" /></div>
          <button onClick={generate} className={btnPrimary}>Buat Tagihan</button>
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <select className={inputCls} value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{bulanName(i + 1)}</option>)}
        </select>
        <input type="number" className={inputCls} value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} placeholder="Tahun" />
        <select className={inputCls} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="semua">Semua Status</option><option value="lunas">Sudah Bayar</option><option value="menunggu">Menunggu Verifikasi</option><option value="belum">Belum Bayar</option><option value="terlambat">Terlambat</option>
        </select>
        {isAdmin && <input className={inputCls} placeholder="Cari nama anggota…" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />}
      </div>

      {items === null ? <Spinner /> : items.length === 0 ? <EmptyState text="Belum ada data pembayaran untuk periode ini." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Nama</th><th className="px-5 py-3">Bulan</th><th className="px-5 py-3">Nominal</th><th className="px-5 py-3">Deskripsi</th>
                <th className="px-5 py-3">Status</th><th className="px-5 py-3">Tanggal Bayar</th><th className="px-5 py-3">Aksi</th>
              </tr></thead>
              <tbody>
                {isAdmin ? groups.map((g) => {
                  const lunas = g.rows.filter((r) => r.status === "lunas").length;
                  const menunggu = g.rows.filter((r) => r.status === "menunggu").length;
                  return (
                    <Fragment key={g.key}>
                      <tr className="cursor-pointer border-t border-slate-50 hover:bg-slate-50" onClick={() => toggleGroup(g.key)}>
                        <td className="px-5 py-3 font-medium">{g.rows.length} anggota</td>
                        <td className="px-5 py-3 text-slate-500">{g.week ? `Minggu ke-${g.week}, ` : ""}{bulanName(g.month)} {g.year}</td>
                        <td className="px-5 py-3 font-semibold">{rupiah(g.amount)}</td>
                        <td className="px-5 py-3 text-slate-500">{g.description || "-"}</td>
                        <td className="px-5 py-3">
                          <Badge color={lunas === g.rows.length ? "green" : "red"}>{lunas}/{g.rows.length} lunas</Badge>
                          {menunggu > 0 && <span className="ml-2"><Badge color="indigo">{menunggu} menunggu</Badge></span>}
                        </td>
                        <td className="px-5 py-3 text-slate-400">{openGroups[g.key] ? "▲" : "▼"}</td>
                        <td className="px-5 py-3"></td>
                      </tr>
                      {openGroups[g.key] && g.rows.map((p) => (
                        <tr key={p.id} className="border-t border-slate-50 bg-slate-50/50">
                          <td className="px-5 py-3 pl-10 font-medium">{p.user?.name}</td>
                          <td className="px-5 py-3 text-slate-500">{p.week ? `Minggu ke-${p.week}, ` : ""}{bulanName(p.month)} {p.year}</td>
                          <td className="px-5 py-3 font-semibold">{rupiah(p.amount)}</td>
                          <td className="px-5 py-3 text-slate-500">{p.description || "-"}</td>
                          <td className="px-5 py-3">{statusBadge(p.status)}</td>
                          <td className="px-5 py-3 text-slate-500">{formatDate(p.paidAt)}</td>
                          <td className="whitespace-nowrap px-5 py-3">
                            {p.proof && p.status !== "belum" && <button onClick={() => setViewProof(p)} className="mr-2 text-sm font-semibold text-indigo-600">Lihat bukti</button>}
                            {p.status === "menunggu" ? (
                              <>
                                <button onClick={() => setStatus(p.id, "lunas")} className="mr-2 text-sm font-semibold text-emerald-600">Setujui</button>
                                <button onClick={() => setStatus(p.id, "belum")} className="mr-2 text-sm font-semibold text-orange-600">Tolak</button>
                              </>
                            ) : (
                              <>
                                {p.status !== "lunas" && <button onClick={() => setStatus(p.id, "lunas")} className="mr-2 text-sm font-semibold text-emerald-600">Tandai Lunas</button>}
                                {p.status === "belum" && <button onClick={() => setStatus(p.id, "terlambat")} className="mr-2 text-sm font-semibold text-orange-600">Terlambat</button>}
                                {p.status !== "belum" && <button onClick={() => setStatus(p.id, "belum")} className="mr-2 text-sm font-semibold text-slate-500">Reset</button>}
                              </>
                            )}
                            <button onClick={() => removePayment(p.id)} className="text-sm font-semibold text-rose-600">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                }) : items.map((p) => (
                  <tr key={p.id} className="border-t border-slate-50">
                    <td className="px-5 py-3 font-medium">{p.user?.name}</td>
                    <td className="px-5 py-3 text-slate-500">{p.week ? `Minggu ke-${p.week}, ` : ""}{bulanName(p.month)} {p.year}</td>
                    <td className="px-5 py-3 font-semibold">{rupiah(p.amount)}</td>
                    <td className="px-5 py-3 text-slate-500">{p.description || "-"}</td>
                    <td className="px-5 py-3">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(p.paidAt)}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {p.status === "menunggu"
                        ? <span className="text-xs font-semibold text-indigo-600">Menunggu verifikasi admin</span>
                        : p.status !== "lunas" && <button onClick={() => setPayTarget(p)} className={btnPrimary}>Bayar QRIS</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payTarget && <PayModal payment={payTarget} onClose={() => setPayTarget(null)} onDone={() => { setPayTarget(null); load(); }} />}
      {viewProof && <ProofModal payment={viewProof} onClose={() => setViewProof(null)} />}
    </div>
  );
}

function PayModal({ payment, onClose, onDone }) {
  const [qris, setQris] = useState({ loading: true, data: null, error: "" });
  const [proof, setProof] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/payments/${payment.id}/qris`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok) setQris({ loading: false, data: null, error: d.error || "Gagal memuat QRIS." });
        else setQris({ loading: false, data: d, error: "" });
      })
      .catch(() => alive && setQris({ loading: false, data: null, error: "Gagal memuat QRIS." }));
    return () => { alive = false; };
  }, [payment.id]);

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Bukti harus berupa gambar.", false);
    if (f.size > 2 * 1024 * 1024) return toast("Ukuran gambar maksimal 2MB.", false);
    const reader = new FileReader();
    reader.onload = () => setProof(reader.result);
    reader.readAsDataURL(f);
  }

  async function submit() {
    setSending(true);
    try {
      const res = await fetch(`/api/payments/${payment.id}/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: proof || undefined, submitNote: note }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast(d.error || "Gagal mengirim pembayaran.", false);
      toast("Pembayaran terkirim. Menunggu verifikasi admin.");
      onDone();
    } finally { setSending(false); }
  }

  const periode = payment.week ? `Minggu ke-${payment.week}, ${bulanName(payment.month)} ${payment.year}` : `${bulanName(payment.month)} ${payment.year}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-lg font-bold">Bayar dengan QRIS</h2>
          <p className="text-sm text-slate-500">{periode} · {rupiah(payment.amount)}</p>
        </div>

        {qris.loading ? <Spinner /> : qris.error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{qris.error}</div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <img src={qris.data.qrDataUrl} alt="QRIS" className="h-64 w-64 rounded-lg bg-white" />
              <p className="text-center text-xs text-slate-500">
                {qris.data.merchant} · Nominal <b className="text-slate-700">{rupiah(qris.data.amount)}</b><br />
                Pastikan nominal di aplikasi pembayaran sama dengan tagihan.
              </p>
              <a href={qris.data.qrDataUrl} download={`qris-${periode.replace(/[^\w]+/g, "-")}.png`} className="text-sm font-semibold text-indigo-600">Unduh QR</a>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Bukti bayar (opsional)</label>
              <input type="file" accept="image/*" onChange={onFile} className="text-sm" />
              {proof && <p className="mt-1 text-xs text-emerald-600">✓ Bukti terlampir</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Catatan (opsional)</label>
              <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: dibayar dari DANA atas nama …" />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Tutup</button>
          <button onClick={submit} disabled={sending || qris.loading || !!qris.error} className={btnPrimary}>
            {sending ? "Mengirim…" : "Saya sudah bayar"}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400">Status akan berubah setelah admin memverifikasi.</p>
      </div>
    </div>
  );
}

function ProofModal({ payment, onClose }) {
  const periode = payment.week ? `Minggu ke-${payment.week}, ${bulanName(payment.month)} ${payment.year}` : `${bulanName(payment.month)} ${payment.year}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold">Bukti Pembayaran</h3>
        <p className="text-sm text-slate-500">{payment.user?.name} · {periode} · {rupiah(payment.amount)}</p>
        <img src={payment.proof} alt="Bukti pembayaran" className="max-h-[60vh] w-full rounded-xl border border-slate-200 object-contain" />
        {payment.submitNote && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Catatan anggota: {payment.submitNote}</p>}
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Tutup</button>
        </div>
      </div>
    </div>
  );
}
