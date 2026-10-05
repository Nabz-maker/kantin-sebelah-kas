"use client";
import { useEffect, useState, useCallback } from "react";
import { Spinner, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const formatWaktu = (d) => new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function Aktivitas() {
  const [items, setItems] = useState(null);

  const load = useCallback(() => {
    fetch("/api/activity").then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);

  useEffect(load, [load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("refresh-data", h);
    return () => window.removeEventListener("refresh-data", h);
  }, [load]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold tracking-tight">Log Login User</h1>
      {items === null ? <Spinner /> : items.length === 0 ? <EmptyState text="Belum ada riwayat login." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">IP</th><th className="px-5 py-3">Waktu</th>
              </tr></thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-t border-slate-50">
                    <td className="px-5 py-3 font-medium">{l.name}</td>
                    <td className="px-5 py-3 text-slate-500">{l.email || "-"}</td>
                    <td className="px-5 py-3 text-slate-500">{l.ip || "-"}</td>
                    <td className="px-5 py-3 text-slate-500">{formatWaktu(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
