import Link from "next/link";
import { ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Users, Wallet } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
            <p className="text-lg font-extrabold tracking-tight">Kantin Samping</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Login</Link>
            <Link href="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Mulai Sekarang</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Kelola Uang Kas Lebih Mudah dan Transparan</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">Catat pemasukan, pengeluaran, dan pembayaran kas dalam satu platform yang sederhana.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">Mulai Sekarang <ArrowRight size={16} /></Link>
          <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Login</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [BarChart3, "Laporan Jelas", "Grafik pemasukan dan pengeluaran yang mudah dibaca."],
          [Users, "Kelola Anggota", "Pantau status pembayaran setiap anggota secara real-time."],
          [Wallet, "Kas Rutin", "Tagih dan catat iuran bulanan tanpa ribet."],
          [ShieldCheck, "Aman & Transparan", "Riwayat transaksi tercatat dan bisa dipertanggungjawabkan."],
        ].map(([Icon, title, desc]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={20} /></div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-extrabold tracking-tight">Cara Kerja</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Daftar dan buat akun organisasi", "Catat pemasukan & pengeluaran kas", "Lihat saldo, laporan, dan status iuran kapan saja"].map((t, i) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{i + 1}</span>
                <p className="text-sm text-slate-600">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-extrabold tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {[
            ["Apakah Kantin Samping gratis?", "Ya, Kantin Samping dapat digunakan gratis untuk mengelola kas organisasi Anda."],
            ["Siapa yang bisa melihat data kas?", "Semua anggota dapat melihat saldo dan riwayat transaksi, namun hanya admin yang dapat menambah, mengubah, atau menghapus data."],
            ["Bagaimana cara mencatat iuran?", "Admin membuat tagihan bulanan di menu Pembayaran Kas, lalu menandai anggota yang sudah membayar."],
          ].map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-slate-500">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">© 2026 Kantin Samping. Semua hak dilindungi.</footer>
    </div>
  );
}
