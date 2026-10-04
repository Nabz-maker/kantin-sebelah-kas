"use client";
import { useEffect, useState } from "react";
import { Spinner, inputCls, labelCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";

export default function Pengaturan() {
  const [form, setForm] = useState(null);

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

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, cashAmount: Number(form.cashAmount) }) });
    if (res.ok) { toast("Pengaturan berhasil disimpan."); window.dispatchEvent(new Event("theme-changed")); }
    else toast("Gagal menyimpan.", false);
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
        <p className="text-sm font-semibold text-slate-600">Notifikasi</p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notifTx} onChange={set("notifTx")} /> Notifikasi transaksi baru</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notifPayment} onChange={set("notifPayment")} /> Notifikasi pembayaran kas</label>
        <button className={btnPrimary}>Simpan Pengaturan</button>
      </form>
    </div>
  );
}
