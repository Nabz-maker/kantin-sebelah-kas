"use client";
// Semua komponen recharts diimpor di sini secara STATIS, lalu modul ini
// yang di-lazy-load lewat next/dynamic. Membungkus <Bar>, <XAxis>, dll.
// satu-satu dengan dynamic() membuat identitasnya berbeda, dan recharts
// tidak mengenalinya lagi — akibatnya grafik kosong.
import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { rupiah, formatDate } from "@/lib/utils";

const axisTick = { fontSize: 11, fill: "#64748B" };

function rupiahAxis(v) {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1).replace(".0", "")}jt`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}rb`;
  return v;
}

function shortTick(iso, range) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (range === "year") return d.toLocaleDateString("id-ID", { month: "short" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function tipDate(iso, range) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (range === "year") return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  return formatDate(iso);
}

function ChartTip({ active, payload, label, range }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-white">{tipDate(label, range)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-1 flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color || p.stroke || "#4F46E5" }} />
          <span className="capitalize text-slate-300">{p.dataKey}</span>
          <span className="ml-2 font-semibold tabular-nums text-white">{rupiah(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function BarPanel({ data, range, legend }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-slate-900">Pemasukan vs Pengeluaran</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Pemasukan</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500" />Pengeluaran</span>
        </div>
      </div>
      <div className="h-64">
        {!data.length ? (
          <EmptyChart text="Belum ada transaksi pada periode ini." />
        ) : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#94A3B8" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={10} tickFormatter={(v) => shortTick(v, range)} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickFormatter={rupiahAxis} />
              <Tooltip cursor={{ fill: "#94A3B8", fillOpacity: 0.12 }} content={<ChartTip range={range} />} />
              <Bar dataKey="pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default function Charts({ variant = "split", data = [], trend = [], range = "month" }) {
  if (variant === "cashflow") {
    return <BarPanel data={data} range={range} />;
  }

  return (
    <div className="grid lg:grid-cols-2">
      <div className="p-5 lg:border-r lg:border-slate-100">
        <BarPanel data={data} range={range} />
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-slate-900">Perkembangan Saldo</h2>
          <span className="text-xs text-slate-500">Saldo berjalan</span>
        </div>
        <div className="h-64">
          {!trend.length ? (
            <EmptyChart text="Belum ada riwayat saldo pada periode ini." />
          ) : (
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#94A3B8" strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} minTickGap={16} tickFormatter={(v) => shortTick(v, range)} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickFormatter={rupiahAxis} />
                <Tooltip content={<ChartTip range={range} />} />
                <Area type="monotone" dataKey="saldo" stroke="none" fill="url(#saldoFill)" />
                <Line type="monotone" dataKey="saldo" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
