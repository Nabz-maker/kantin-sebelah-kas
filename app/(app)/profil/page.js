"use client";
import { useEffect, useState } from "react";
import { Spinner, inputCls, labelCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";
import { formatDate } from "@/lib/utils";

export default function Profil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", currentPassword: "", newPassword: "" });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { setUser(d.user); setForm((f) => ({ ...f, name: d.user.name, email: d.user.email, phone: d.user.phone || "", avatar: d.user.avatar || null })); });
  }, []);

  if (!user) return <Spinner />;

  function onAvatar(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("File harus gambar.", false);
    if (f.size > 1024 * 1024) return toast("Maksimal 1MB.", false);
    const reader = new FileReader();
    reader.onload = () => setForm((cur) => ({ ...cur, avatar: reader.result }));
    reader.readAsDataURL(f);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, phone: form.phone };
    if (form.avatar) payload.avatar = form.avatar;
    if (form.newPassword) { payload.newPassword = form.newPassword; payload.currentPassword = form.currentPassword; }
    const res = await fetch(`/api/members/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!res.ok) return toast(d.error, false);
    toast("Profil berhasil diperbarui.");
    setUser(d.user);
    setForm((f) => ({ ...f, currentPassword: "", newPassword: "", avatar: d.user.avatar || null }));
    window.dispatchEvent(new Event("user-updated"));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-extrabold tracking-tight">Profil Saya</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
            {form.avatar || user.avatar ? <img src={form.avatar || user.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : user.name[0].toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">Bergabung {formatDate(user.createdAt)} · {user.role}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div><label className={labelCls}>Foto Profil</label><input type="file" accept="image/*" onChange={onAvatar} className="text-sm" />{form.avatar && <p className="mt-1 text-xs text-slate-400">Foto baru terpilih — klik Simpan Perubahan untuk menyimpan.</p>}</div>
        <div><label className={labelCls}>Nama</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className={labelCls}>Nomor HP</label><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <hr className="border-slate-100" />
        <p className="text-sm font-semibold text-slate-600">Ubah Password (opsional)</p>
        <div><label className={labelCls}>Password Lama</label><input type="password" className={inputCls} value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
        <div><label className={labelCls}>Password Baru</label><input type="password" className={inputCls} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="min. 6 karakter" /></div>
        <button className={btnPrimary}>Simpan Perubahan</button>
      </form>
    </div>
  );
}
