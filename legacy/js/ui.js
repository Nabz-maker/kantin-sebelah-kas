// ─────────────────────────────────────────────────────────────
// ui.js — tiny DOM + toast helpers
// ─────────────────────────────────────────────────────────────
export const $ = (sel) => document.querySelector(sel);

let toastTimer;
export function toast(msg, ok = true) {
  const el = $("#toast");
  el.textContent = msg;
  el.className = `pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 translate-y-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-2xl transition-all duration-300 ${
    ok ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
  }`;
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translate(-50%, 0)";
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translate(-50%, 0.5rem)";
  }, 2600);
}

export const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const todayStr = () => new Date().toISOString().slice(0, 10);
