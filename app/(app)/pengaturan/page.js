"use client";
import { useEffect, useState } from "react";
import { Spinner, inputCls, labelCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";

export default function Pengaturan() {
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => { fetch("/api/settings").then((r) => r.json()).then((d) => setForm(d.setting)); }, []);

  if (!form) return <Spinner />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  function onLogo(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("File harus gambar.", false);
    const reader = new FileReader();
    reader.onload = () => setForm((c) => ({ ...c, logo: reader.result }));
    reader.readAsDataURL(f);
  }

  async function checkQris() {
    if (!form.qrisString || form.qrisString === "••••") return toast("Tempel string QRIS terlebih dahulu.", false);
    setChecking(true);
    try {
      const res = await fetch("/api/settings/qris-preview", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrisString: form.qrisString }),
      });
      const d = await res.json();
      if (!res.ok) { setPreview(null); return toast(d.error || "QRIS tidak valid.", false); }
      setPreview(d);
      toast(`QRIS valid${d.merchant ? ` — ${d.merchant}` : ""}.`);
    } finally { setChecking(false); }
  }

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, cashAmount: Number(form.cashAmount) }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      toast("Pengaturan berhasil disimpan.");
      setForm(d.setting || form);
      setPreview(null);
      window.dispatchEvent(new Event("theme-changed"));
    } else toast(d.error || "Gagal menyimpan.", false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-extrabold tracking-tight">Pengaturan</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div><label className={labelCls}>Nama Organisasi</label><input className={inputCls} value={form.organizationName || ""} onChange={set("organizationName")} /></div>
        <div><label className={labelCls}>Nama Kas</label><input className={inputCls} value={form.cashName || ""} onChange={set("cashName")} /></div>
        <div><label className={labelCls}>Nominal Kas Bulanan (Rp)</label><input type="number" className={inputCls} value={form.cashAmount} onChange={set("cashAmount")} /></div>
        <div><label className={labelCls}>Logo Organisasi</label><input type="file" accept="image/*" onChange={onLogo} className="text-sm" />{form.logo && <img src={form.logo} alt="logo" className="mt-2 h-14 w-14 rounded-xl object-cover" />}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Mata Uang</label>
            <select className={inputCls} value={form.currency} onChange={set("currency")}><option value="IDR">IDR (Rp)</option><option value="USD">USD ($)</option></select>
          </div>
          <div><label className={labelCls}>Tema Aplikasi</label>
            <select className={inputCls} value={form.theme} onChange={set("theme")}><option value="light">Terang</option><option value="dark">Gelap</option></select>
          </div>
        </div>

        <hr className="border-slate-100" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-600">Pembayaran QRIS</p>
          <p className="text-xs text-slate-400">
            Tempel <b>string QRIS</b> milik organisasi (bukan gambar). Ambil dari hasil scan QRIS sendiri
            memakai aplikasi pembaca QR yang menampilkan isi teksnya. Nominal tagihan akan diisi otomatis.
          </p>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={5}
            placeholder="00020101021126…6304ABCD"
            value={form.qrisString && form.qrisString !== "••••" ? form.qrisString : ""}
            onChange={set("qrisString")}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={checkQris} disabled={checking} className="rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">
              {checking ? "Memeriksa…" : "Validasi & Pratinjau"}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.qrisEnabled} onChange={set("qrisEnabled")} /> Aktifkan pembayaran QRIS
            </label>
          </div>
          {form.qrisMerchant && <p className="text-xs text-emerald-600">Merchant tersimpan: {form.qrisMerchant}</p>}
          {preview && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <img src={preview.qrDataUrl} alt="Pratinjau QRIS" className="h-52 w-52 rounded-lg bg-white" />
              <p className="text-xs text-slate-500">{preview.merchant || "Merchant"}{preview.city ? ` · ${preview.city}` : ""} · contoh nominal Rp 1.000</p>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />
        <p className="text-sm font-semibold text-slate-600">Notifikasi</p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notifTx} onChange={set("notifTx")} /> Notifikasi transaksi baru</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notifPayment} onChange={set("notifPayment")} /> Notifikasi pembayaran kas</label>
        <button className={btnPrimary}>Simpan Pengaturan</button>
      </form>
    </div>
  );
}
