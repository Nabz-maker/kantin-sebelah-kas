"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "@/components/ToastHost";
import { inputCls, labelCls, btnPrimary } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ login: "", password: "", remember: true });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!form.login || !form.password) return setErr("Email/username dan password wajib diisi.");
    setLoading(true);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Gagal masuk.");
    toast(`Selamat datang, ${data.user.name}!`);
    router.push(params.get("next") || "/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Selamat Datang Kembali</h1>
      <p className="text-sm text-slate-500">Masuk untuk mengelola kas organisasi Anda.</p>
      {err && <p className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{err}</p>}
      <div>
        <label className={labelCls}>Email atau Username</label>
        <input className={inputCls} value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="email@contoh.com" />
      </div>
      <div>
        <label className={labelCls}>Password</label>
        <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="rounded border-slate-300" /> Ingat saya</label>
        <Link href="/forgot-password" className="font-medium text-indigo-600 hover:underline">Lupa Password?</Link>
      </div>
      <button disabled={loading} className={btnPrimary + " w-full transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"}>{loading ? "Memproses…" : "Login"}</button>
      <p className="text-center text-sm text-slate-500">Belum punya akun? <Link href="/register" className="font-semibold text-indigo-600">Daftar</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-50 via-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-extrabold"><img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm" /> Kantin Samping</Link>
        <Suspense fallback={null}><LoginForm /></Suspense>
      </div>
    </div>
  );
}
