"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Users, Wallet, Plus } from "lucide-react";

const displayCls = { fontFamily: "var(--font-display)" };
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const features = [
  [BarChart3, "Laporan Jelas", "Grafik pemasukan dan pengeluaran yang mudah dibaca."],
  [Users, "Kelola Anggota", "Pantau status pembayaran setiap anggota secara real-time."],
  [Wallet, "Kas Rutin", "Tagih dan catat iuran mingguan tanpa ribet."],
  [ShieldCheck, "Aman & Transparan", "Riwayat transaksi tercatat dan bisa dipertanggungjawabkan."],
];

const bars = [42, 66, 52, 80, 62, 96, 72];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1.5 }}
      animate={{ opacity: 1, y: [0, -12, 0], rotate: -1.5 }}
      transition={{ opacity: { duration: 0.6, delay: 0.35 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.9 } }}
      className="relative mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-5 shadow-2xl shadow-black/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Ringkasan Kas</p>
          <p style={displayCls} className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">Rp 1.250.000</p>
        </div>
        <span className="text-xs font-semibold text-indigo-300">Oktober</span>
      </div>

      <div className="mt-5 flex h-28 items-end gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={days[i]}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: "easeOut" }}
            className={`flex-1 rounded-md ${i === 5 ? "bg-indigo-500" : "bg-slate-700"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {days.map((d) => (
          <span key={d} className="flex-1 text-center text-[11px] font-medium text-slate-400">{d}</span>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
        {[
          ["Andi Pratama", "Lunas", "emerald"],
          ["Sari Wulandari", "Belum", "rose"],
        ].map(([name, status, tone]) => (
          <div key={name} className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{name}</span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${tone === "emerald" ? "text-emerald-300" : "text-rose-300"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tone === "emerald" ? "bg-emerald-400" : "bg-rose-400"}`} />
              {status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-black/40" />
            <p style={displayCls} className="text-lg font-extrabold tracking-tight text-white">Kantin Samping</p>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#fitur" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Fitur</a>
            <a href="#cara-kerja" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Cara Kerja</a>
            <a href="#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Login</Link>
            <Link href="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Mulai Sekarang</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 -right-40 h-[28rem] w-[28rem] rounded-full bg-rose-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-indigo-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Transparan untuk semua anggota
            </motion.span>

            <h1 style={displayCls} className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="block">
                Kas jelas,
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="block">
                token pun <span className="text-indigo-400">tenang.</span>
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-5 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
              Catat pemasukan dan pengeluaran, tagih iuran mingguan otomatis, dan bagikan laporan — semua anggota melihat angka yang sama.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:bg-indigo-500 active:scale-[0.98]">
                Mulai Gratis <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#cara-kerja" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Lihat cara kerja
              </a>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> Gratis untuk organisasi</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> Admin & anggota</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> Bisa dipasang di HP (PWA)</span>
            </motion.p>
          </div>

          <DashboardMock />
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="bg-white">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600">FITUR</motion.p>
          <motion.h2 variants={fadeUp} style={displayCls} className="mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Semua yang dibutuhkan kas organisasi
          </motion.h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([Icon, title, desc]) => (
              <motion.div key={title} variants={fadeUp} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Icon size={22} className="text-indigo-600" />
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="bg-[#F8FAFC]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600">CARA KERJA</motion.p>
          <motion.h2 variants={fadeUp} style={displayCls} className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Tiga langkah, kas rapi
          </motion.h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Daftar dan buat akun organisasi", "Undang anggota dan tentukan siapa yang jadi admin."],
              ["Catat pemasukan & pengeluaran kas", "Transaksi masuk-keluar tercatat lengkap dengan keterangan."],
              ["Lihat saldo, laporan, dan status iuran kapan saja", "Dashboard segar tiap 5 detik, laporan siap dibagikan."],
            ].map(([t, d], i) => (
              <motion.div key={t} variants={fadeUp} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span style={displayCls} className="block text-4xl font-extrabold leading-none tracking-tight text-indigo-500">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="mx-auto max-w-3xl px-4 py-16 md:py-24">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600">FAQ</motion.p>
          <motion.h2 variants={fadeUp} style={displayCls} className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Pertanyaan yang sering muncul
          </motion.h2>

          <div className="mt-8 space-y-3">
            {[
              ["Apakah Kantin Samping gratis?", "Ya, Kantin Samping dapat digunakan gratis untuk mengelola kas organisasi Anda."],
              ["Siapa yang bisa melihat data kas?", "Semua anggota dapat melihat saldo dan riwayat transaksi, namun hanya admin yang dapat menambah, mengubah, atau menghapus data."],
              ["Bagaimana cara mencatat iuran?", "Admin membuat tagihan mingguan di menu Pembayaran Kas, lalu menandai anggota yang sudah membayar."],
            ].map(([q, a]) => (
              <motion.details key={q} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                  {q}
                  <Plus size={18} className="shrink-0 text-indigo-600 transition duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{a}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center md:px-12"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl" />
            <div className="relative">
              <h2 style={displayCls} className="mx-auto max-w-xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Siap membuat kas organisasi transparan?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
                Buat akun sekarang dan catat transaksi pertama Anda hari ini juga.
              </p>
              <Link href="/register" className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:bg-indigo-500 active:scale-[0.98]">
                Mulai Gratis <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
          <span>© 2026 Kantin Samping. Semua hak dilindungi.</span>
          <span className="flex items-center gap-4">
            <a href="#fitur" className="transition hover:text-indigo-600">Fitur</a>
            <a href="#cara-kerja" className="transition hover:text-indigo-600">Cara Kerja</a>
            <a href="#faq" className="transition hover:text-indigo-600">FAQ</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
