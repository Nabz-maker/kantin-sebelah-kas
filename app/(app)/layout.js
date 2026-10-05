"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Users, FileBarChart, UserCircle, Settings, LogOut, Search, Bell, Menu, X, ScrollText } from "lucide-react";
import { toast } from "@/components/ToastHost";
import AutoRefresh from "@/components/AutoRefresh";
import PageTransition from "@/components/PageTransition";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const load = () => { fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (!d.user) router.push("/login"); else { setUser(d.user); fetch("/api/notifications").then((r) => r.json()).then((x) => setNotifs(x.items || [])); } }); };
    load();
    window.addEventListener("user-updated", load);
    return () => window.removeEventListener("user-updated", load);
  }, [router]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, []);

  const isAdmin = user?.role === "admin";
  const menus = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
    { href: "/pembayaran", label: "Pembayaran Kas", icon: Wallet },
    { href: "/anggota", label: "Anggota", icon: Users },
    { href: "/aktivitas", label: "Log Login", icon: ScrollText, admin: true },
    { href: "/laporan", label: "Laporan", icon: FileBarChart },
    { href: "/profil", label: "Profil", icon: UserCircle },
    { href: "/pengaturan", label: "Pengaturan", icon: Settings, admin: true },
  ].filter((m) => !m.admin || isAdmin);

  async function logout() {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Anda telah keluar. Sampai jumpa!");
    router.push("/login");
  }

  function submitSearch(e) {
    e.preventDefault();
    router.push(`/transaksi?q=${encodeURIComponent(search)}`);
  }

  return (
    <div className="min-h-screen md:pl-60">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
          <img src="/logo.png" alt="Logo" width={36} height={36} loading="lazy" decoding="async" className="h-9 w-9 rounded-xl object-cover" />
          <p className="text-lg font-extrabold tracking-tight text-slate-800">Kantin Samping</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {menus.map((m) => (
            <Link key={m.href} href={m.href} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${pathname.startsWith(m.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <m.icon size={18} /> {m.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar mobile — tanpa animasi JS, murni CSS */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSideOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/40" />
          <aside className="animate-fade-in absolute inset-y-0 left-0 w-64 bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2 pt-1">
              <p className="text-lg font-extrabold">Kantin Samping</p>
              <button onClick={() => setSideOpen(false)} aria-label="Tutup"><X size={20} /></button>
            </div>
            {menus.map((m) => (
              <Link key={m.href} href={m.href} onClick={() => setSideOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${pathname.startsWith(m.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600"}`}>
                <m.icon size={18} /> {m.label}
              </Link>
            ))}
          </aside>
        </div>
      )}

      {/* Header — backdrop-blur dihapus di HP via CSS */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 md:px-8">
          <button className="md:hidden" onClick={() => setSideOpen(true)} aria-label="Menu"><Menu size={22} /></button>
          <form onSubmit={submitSearch} className="hidden flex-1 max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi…" enterKeyHint="search" className="w-full bg-transparent text-sm outline-none" />
          </form>
          <div className="flex-1 md:hidden" />
          <div className="relative">
            <button className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" onClick={() => { setNotifOpen((v) => !v); fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifs(d.items || [])); setNotifs((x) => x.map((n) => ({ ...n, read: true }))); fetch("/api/notifications", { method: "PATCH" }); }} aria-label="Notifikasi">
              <Bell size={18} />
              {notifs.some((n) => !n.read) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
            </button>
            {notifOpen && (
              <div className="animate-fade-in absolute right-0 z-50 mt-2 max-h-[60vh] w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1 text-xs font-bold text-slate-400">Notifikasi</p>
                {notifs.length === 0 ? <p className="px-2 py-3 text-sm text-slate-400">Belum ada notifikasi.</p> : notifs.map((n) => (
                  <div key={n.id} className={`rounded-lg px-2 py-2 text-sm ${n.read ? "text-slate-500" : "bg-indigo-50 text-slate-700"}`}>{n.text}</div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 hover:bg-slate-50">
              <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                {user?.avatar ? <img src={user.avatar} alt="" width={28} height={28} loading="lazy" decoding="async" className="h-7 w-7 rounded-lg object-cover" /> : (user?.name?.[0] || "?").toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">{user?.name || "…"}</span>
            </button>
            {menuOpen && (
              <div className="animate-fade-in absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <Link href="/profil" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Profil Saya</Link>
                {isAdmin && <Link href="/pengaturan" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Pengaturan</Link>}
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><LogOut size={16} /> Keluar</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-6 md:px-8 md:pb-10"><PageTransition>{children}</PageTransition></main>
      <AutoRefresh />


      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
        {menus.slice(0, 5).map((m) => (
          <Link key={m.href} href={m.href} className={`flex flex-col items-center gap-0.5 px-3 text-[10px] font-medium ${pathname.startsWith(m.href) ? "text-indigo-600" : "text-slate-500"}`}>
            <m.icon size={20} /> {m.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
