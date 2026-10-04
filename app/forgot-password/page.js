"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/components/ToastHost";
import { inputCls, labelCls, btnPrimary } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast(data.error, false);
    toast("Jika email terdaftar, link reset telah dikirim.");
    if (data.devLink) setDevLink(data.devLink);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">Lupa Password</h1>
        <p className="mt-1 text-sm text-slate-500">Masukkan email untuk menerima link reset password.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" /></div>
          <button disabled={loading} className={btnPrimary + " w-full"}>{loading ? "Mengirim…" : "Kirim Link Reset"}</button>
        </form>
        {devLink && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
            Mode demo — link reset: <Link className="font-semibold underline" href={devLink}>{devLink}</Link>
          </p>
        )}
        <p className="mt-4 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-indigo-600">Kembali ke Login</Link></p>
      </div>
    </div>
  );
}
