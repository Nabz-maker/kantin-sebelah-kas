"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Receipt, BarChart3, Bell, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ToastHost";

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600";
const displayCls = { fontFamily: "var(--font-display), system-ui, sans-serif" };

const features = [
  { icon: Receipt, title: "Tagihan mingguan otomatis", desc: "Iuran tercatat rapi tiap minggu." },
  { icon: BarChart3, title: "Laporan selalu mutakhir", desc: "Dashboard segar tiap 5 detik." },
  { icon: Bell, title: "Notifikasi tagihan", desc: "Anggota tahu kapan harus bayar." },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ login: "", password: "", remember: true });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
    <form onSubmit={submit} className="animate-fade-in-up space-y-4">
      <div>
        <h2 style={displayCls} className="text-3xl font-extrabold tracking-tight text-slate-900">Masuk</h2>
        <p className="mt-1.5 text-sm text-slate-600">Selamat datang kembali — lanjutkan catatan kas organisasi Anda.</p>
      </div>

      {err && (
        <p role="alert" className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </p>
      )}

      <div>
        <label className={labelCls} htmlFor="login">Email atau Username</label>
        <input id="login" autoComplete="username" enterKeyHint="next" className={fieldCls} value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="email@contoh.com" />
      </div>

      <div>
        <label className={labelCls} htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" autoComplete="current-password" enterKeyHint="go" type={showPass ? "text" : "password"} className={fieldCls + " pr-11"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" /> Ingat saya
        </label>
        <Link href="/forgot-password" className="font-medium text-indigo-600 transition hover:text-indigo-500 hover:underline">Lupa Password?</Link>
      </div>

      <button disabled={loading} className="group w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60">
        <span className="flex items-center justify-center gap-2">
          {loading ? "Memproses…" : "Masuk"}
          {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
        </span>
      </button>

      <p className="pt-1 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-500 hover:underline">Daftar</Link>
      </p>
    </form>
  );
}

function BrandStage() {
  return (
    <div className="relative flex min-h-[40vh] flex-col justify-between overflow-hidden bg-slate-950 px-6 py-10 md:min-h-screen md:px-12 md:py-12">
      <div aria-hidden="true" className="glow-decor pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-3xl" />
      <div aria-hidden="true" className="glow-decor pointer-events-none absolute -bottom-48 -right-32 h-[26rem] w-[26rem] rounded-full bg-rose-600/20 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <img src="/logo.png" alt="Logo" width={40} height={40} decoding="async" className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-black/40" />
        <div>
          <p style={displayCls} className="text-lg font-extrabold tracking-tight text-white">Kantin Samping</p>
          <p className="text-xs font-medium text-slate-400">Kas digital organisasi</p>
        </div>
      </div>

      <div className="relative py-10 md:py-0">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Transparan untuk semua anggota
        </span>

        <h1 style={displayCls} className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
          <span className="block">Kas jelas,</span>
          <span className="block">token pun <span className="text-indigo-400">tenang.</span></span>
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
          Jangan lupa bayar kas, kalo lupa token berisik.
        </p>
      </div>

      <div className="relative hidden gap-3 md:grid md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/85 p-4">
            <Icon size={18} className="text-indigo-300" />
            <p className="mt-2.5 text-sm font-bold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-slate-300">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-white md:grid-cols-2">
      <BrandStage />
      <div className="flex items-center justify-center bg-white px-5 py-12 md:px-10">
        <div className="w-full max-w-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-8 text-center text-xs text-slate-500">Butuh bantuan? Hubungi admin organisasi Anda.</p>
        </div>
      </div>
    </div>
  );
}
