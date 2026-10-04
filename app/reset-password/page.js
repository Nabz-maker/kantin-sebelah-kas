"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "@/components/ToastHost";
import { inputCls, labelCls, btnPrimary } from "@/components/ui";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirmPassword) return setErr("Konfirmasi password tidak sama.");
    setLoading(true);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), ...form }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error);
    toast("Password berhasil diubah. Silakan masuk.");
    router.push("/login");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
      {err && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{err}</p>}
      <div><label className={labelCls}>Password Baru</label><input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
      <div><label className={labelCls}>Konfirmasi Password Baru</label><input type="password" className={inputCls} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></div>
      <button disabled={loading} className={btnPrimary + " w-full"}>{loading ? "Menyimpan…" : "Ubah Password"}</button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense fallback={null}><ResetForm /></Suspense>
        <p className="mt-4 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-indigo-600">Kembali ke Login</Link></p>
      </div>
    </div>
  );
}
