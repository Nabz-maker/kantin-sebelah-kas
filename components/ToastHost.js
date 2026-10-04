"use client";
import { useEffect, useState } from "react";

export function toast(msg, ok = true) {
  window.dispatchEvent(new CustomEvent("kaskita:toast", { detail: { msg, ok, id: Date.now() + Math.random() } }));
}

export default function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const h = (e) => {
      setItems((cur) => [...cur, e.detail]);
      setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== e.detail.id)), 3500);
    };
    window.addEventListener("kaskita:toast", h);
    return () => window.removeEventListener("kaskita:toast", h);
  }, []);
  return (
    <div className="fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {items.map((i) => (
        <div key={i.id} className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${i.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {i.msg}
        </div>
      ))}
    </div>
  );
}
