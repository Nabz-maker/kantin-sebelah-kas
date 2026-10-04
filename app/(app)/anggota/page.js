"use client";
import { useEffect, useState, useCallback } from "react";
import Badge, { Spinner, ConfirmModal, EmptyState, inputCls, labelCls, btnPrimary } from "@/components/ui";
import { toast } from "@/components/ToastHost";
import { formatDate } from "@/lib/utils";

export default function Anggota() {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState({ q: "", role: "semua", status: "semua" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  const isAdmin = user?.role === "admin";

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && v !== "semua" && qs.set(k, v));
    fetch(`/api/members?${qs}`).then((r) => r.json()).then((d) => setItems(d.items || []));
  }, [filters]);
  useEffect(load, [load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("refresh-data", h);
    return () => window.removeEventListener("refresh-data", h);
  }, [load]);

  async function save(values) {
    const url = editing ? `/api/members/${editing.id}` : "/api/members";
    const payload = editing
      ? { ...values, newPassword: values.password || undefined }
      : { ...values };
    if (editing) delete payload.password;
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!res.ok) return toast(d.error, false);
    toast(editing ? "Data anggota berhasil diperbarui." : "Anggota berhasil ditambahkan.");
    setShowForm(false); setEditing(null); load();
  }

  async function del(id) {
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    toast(res.ok ? "Anggota berhasil dihapus." : "Gagal menghapus.", res.ok);
    setConfirmDel(null); load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Manajemen Anggota</h1>
        {isAdmin && <button onClick={() => { setEditing(null); setShowForm(true); }} className={btnPrimary}>+ Tambah Anggota</button>}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <input className={inputCls} placeholder="Cari nama/email/username…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select className={inputCls} value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="semua">Semua Role</option><option value="admin">Admin</option><option value="member">Member</option>
        </select>
        <select className={inputCls} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="semua">Semua Status</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {items === null ? <Spinner /> : items.length === 0 ? <EmptyState text="Tidak ada anggota." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <div key={u.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                  {u.avatar ? <img src={u.avatar} alt="" className="h-11 w-11 rounded-xl object-cover" /> : u.name[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{u.name}</p>
                  <p className="truncate text-xs text-slate-400">{u.email || u.role}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge color={u.role === "admin" ? "indigo" : "slate"}>{u.role}</Badge>
                <Badge color={u.status === "aktif" ? "green" : "red"}>{u.status}</Badge>
              </div>
              <p className="mt-3 text-xs text-slate-400">Bergabung {formatDate(u.createdAt)}</p>
              <div className="mt-4 flex gap-2 text-sm">
                {isAdmin && <button onClick={() => setDetail(u)} className="font-semibold text-slate-500">Detail</button>}
                {isAdmin && <button onClick={() => { setEditing(u); setShowForm(true); }} className="font-semibold text-indigo-600">Edit</button>}
                {isAdmin && <button onClick={() => setConfirmDel(u)} className="font-semibold text-rose-600">Hapus</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">{detail.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {[["Username", detail.username], ["Email", detail.email], ["No. HP", detail.phone || "-"], ["Role", detail.role], ["Status", detail.status], ["Tanggal Bergabung", formatDate(detail.createdAt)]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-50 pb-2"><dt className="text-slate-400">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            <button onClick={() => setDetail(null)} className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold">Tutup</button>
          </div>
        </div>
      )}

      {showForm && <MemberForm initial={editing} onSave={save} onClose={() => { setShowForm(false); setEditing(null); }} />}
      <ConfirmModal open={!!confirmDel} title="Hapus Anggota" text={`Yakin ingin menghapus ${confirmDel?.name}? Semua data terkait akan ikut terhapus.`} onCancel={() => setConfirmDel(null)} onConfirm={() => del(confirmDel.id)} />
    </div>
  );
}

function MemberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { name: initial.name, email: initial.email, phone: initial.phone || "", role: initial.role, status: initial.status, username: initial.username, password: "" } : { name: "", username: "", email: "", phone: "", role: "member", status: "aktif", password: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast("Nama dan email wajib.", false);
    if (!initial && (!form.username.trim() || form.password.length < 6)) return toast("Username wajib dan password minimal 6 karakter.", false);
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold">{initial ? "Edit Anggota" : "Tambah Anggota"}</h2>
        <div><label className={labelCls}>Nama</label><input className={inputCls} value={form.name} onChange={set("name")} /></div>
        {!initial && <div><label className={labelCls}>Username</label><input className={inputCls} value={form.username} onChange={set("username")} /></div>}
        <div><label className={labelCls}>Email</label><input className={inputCls} value={form.email} onChange={set("email")} /></div>
        <div><label className={labelCls}>Nomor HP</label><input className={inputCls} value={form.phone} onChange={set("phone")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Role</label>
            <select className={inputCls} value={form.role} onChange={set("role")}><option value="member">Member</option><option value="admin">Admin</option></select>
          </div>
          <div><label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={set("status")}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select>
          </div>
        </div>
        <div><label className={labelCls}>{initial ? "Password Baru (opsional)" : "Password"}</label><input type="password" className={inputCls} value={form.password ?? ""} onChange={set("password")} placeholder="min. 6 karakter" /></div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Batal</button>
          <button className={btnPrimary}>Simpan</button>
        </div>
      </form>
    </div>
  );
}
