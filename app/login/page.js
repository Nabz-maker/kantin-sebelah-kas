"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, BarChart3, Bell, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ToastHost";

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600";
const displayCls = { fontFamily: "var(--font-display)" };

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
    <form onSubmit={submit} className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={displayCls} className="text-3xl font-extrabold tracking-tight text-slate-900">Masuk</h2>
        <p className="mt-1.5 text-sm text-slate-600">Selamat datang kembali — lanjutkan catatan kas organisasi Anda.</p>
      </motion.div>

      {err && (
        <p role="alert" className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </p>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
        <label className={labelCls} htmlFor="login">Email atau Username</label>
        <input id="login" autoComplete="username" className={fieldCls} value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="email@contoh.com" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
        <label className={labelCls} htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" autoComplete="current-password" type={showPass ? "text" : "password"} className={fieldCls + " pr-11"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }} className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" /> Ingat saya
        </label>
        <Link href="/forgot-password" className="font-medium text-indigo-600 transition hover:text-indigo-500 hover:underline">Lupa Password?</Link>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} disabled={loading} className="group w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-60">
        <span className="flex items-center justify-center gap-2">
          {loading ? "Memproses…" : "Masuk"}
          {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
        </span>
      </motion.button>

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
      {/* Glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[26rem] w-[26rem] rounded-full bg-rose-600/20 blur-3xl" />

      {/* Brand */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative flex items-center gap-2.5">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-black/40" />
        <div>
          <p style={displayCls} className="text-lg font-extrabold tracking-tight text-white">Kantin Samping</p>
          <p className="text-xs font-medium text-slate-400">Kas digital organisasi</p>
        </div>
      </motion.div>

      {/* Headline */}
      <div className="relative py-10 md:py-0">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Transparan untuk semua anggota
        </motion.span>

        <h1 style={displayCls} className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="block">
            Kas jelas,
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="block">
            token pun{" "}
            <span className="text-indigo-400">tenang.</span>
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }} className="mt-5 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
          Jangan lupa bayar kas, kalo lupa token berisik.
        </motion.p>
      </div>

      {/* Kartu fitur melayang */}
      <div className="relative hidden gap-3 md:grid md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.5, delay: 0.5 + i * 0.12 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 } }}
            className="rounded-2xl border border-white/10 bg-slate-900/85 p-4"
          >
            <Icon size={18} className="text-indigo-300" />
            <p className="mt-2.5 text-sm font-bold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-slate-300">{desc}</p>
          </motion.div>
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
