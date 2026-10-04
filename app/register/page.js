"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ToastHost";
import { inputCls, labelCls, btnPrimary } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", confirmPassword: "", agree: false });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirmPassword) return setErr("Konfirmasi password tidak sama.");
    setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error);
    toast("Akun berhasil dibuat. Selamat datang!");
    router.push("/dashboard");
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">Daftar Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Buat akun Kantin Sebelah baru.</p>
        {err && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{err}</p>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className={labelCls}>Nama Lengkap</label><input className={inputCls} value={form.name} onChange={set("name")} placeholder="Nama lengkap" /></div>
          <div><label className={labelCls}>Username</label><input className={inputCls} value={form.username} onChange={set("username")} placeholder="username" /></div>
          <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="email@contoh.com" /></div>
          <div><label className={labelCls}>Nomor HP</label><input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="08xxxxxxxxxx" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Password</label><input type="password" className={inputCls} value={form.password} onChange={set("password")} placeholder="min. 6 karakter" /></div>
            <div><label className={labelCls}>Konfirmasi</label><input type="password" className={inputCls} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="ulangi password" /></div>
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.agree} onChange={set("agree")} className="mt-1 rounded border-slate-300" /> Saya menyetujui syarat penggunaan aplikasi.</label>
          <button disabled={loading} className={btnPrimary + " w-full"}>{loading ? "Memproses…" : "Daftar"}</button>
          <p className="text-center text-sm text-slate-500">Sudah punya akun? <Link href="/login" className="font-semibold text-indigo-600">Masuk</Link></p>
        </form>
      </div>
    </div>
  );
}
