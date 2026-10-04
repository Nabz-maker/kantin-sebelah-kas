// ─────────────────────────────────────────────────────────────
// app.js — dashboard: saldo, kas masuk/keluar, riwayat (real-time)
// ─────────────────────────────────────────────────────────────
import {
  collection, addDoc, onSnapshot, query, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { $, toast, rupiah, escapeHtml, todayStr } from "./ui.js";

let unsubscribe = null;
let currentFilter = "all";
let currentUser = null;
let cache = []; // latest transactions snapshot

/* ── User chip ─────────────────────────────────────────────── */
export function setUserChip({ name, email }) {
  $("#user-name").textContent = name || "…";
  $("#user-email").textContent = email || "";
  $("#user-avatar").textContent = (name || "?").trim().charAt(0).toUpperCase();
}

/* ── Enter / exit app ──────────────────────────────────────── */
export function enterApp(user) {
  currentUser = user;
  $("#in-date").value = $("#in-date").value || todayStr();
  $("#out-date").value = $("#out-date").value || todayStr();

  const q = query(collection(db, "transactions"));
  unsubscribe = onSnapshot(q, (snap) => {
    cache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => {
    console.error(err);
    toast("Gagal memuat transaksi: " + err.code, false);
  });
}

export function exitApp() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  currentUser = null;
  cache = [];
  $("#log-tbody").innerHTML = "";
  $("#log-cards").innerHTML = "";
  $("#stat-balance").textContent = rupiah(0);
  $("#stat-in").textContent = rupiah(0);
  $("#stat-out").textContent = rupiah(0);
  $("#stat-count").textContent = "0 transaksi tercatat";
}

/* ── Add transaction ───────────────────────────────────────── */
async function addTx(type) {
  const isIn = type === "in";
  const amount = Number($(isIn ? "#in-amount" : "#out-amount").value);
  const description = $(isIn ? "#in-desc" : "#out-desc").value.trim();
  const date = $(isIn ? "#in-date" : "#out-date").value;

  if (!amount || amount <= 0) return toast("Jumlah harus lebih dari 0.", false);
  if (!description) return toast("Keterangan wajib diisi.", false);
  if (!date) return toast("Tanggal wajib diisi.", false);

  try {
    await addDoc(collection(db, "transactions"), {
      type, amount, description, date,
      by: currentUser?.displayName || currentUser?.email?.split("@")[0] || "-",
      uid: currentUser?.uid || null,
      createdAt: serverTimestamp(),
    });
    $(isIn ? "#form-cash-in" : "#form-cash-out").reset();
    $(isIn ? "#in-date" : "#out-date").value = todayStr();
    toast(isIn ? "Kas masuk disimpan ✅" : "Kas keluar disimpan ✅");
  } catch (err) {
    console.error(err);
    toast("Gagal menyimpan: " + err.code, false);
  }
}

$("#form-cash-in").addEventListener("submit", (e) => { e.preventDefault(); addTx("in"); });
$("#form-cash-out").addEventListener("submit", (e) => { e.preventDefault(); addTx("out"); });

/* ── Filter chips ──────────────────────────────────────────── */
function paintFilters() {
  document.querySelectorAll("#filter-group button").forEach((b) => {
    b.className = `rounded-lg px-3 py-1.5 transition ${
      b.dataset.filter === currentFilter ? "bg-slate-700/90 text-white" : "text-slate-400 hover:text-slate-200"
    }`;
  });
}
document.querySelectorAll("#filter-group button").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    paintFilters();
    render();
  });
});
paintFilters();

/* ── Render ────────────────────────────────────────────────── */
function render() {
  const all = [...cache].sort((a, b) => {
    const da = a.date || "";
    const dbb = b.date || "";
    if (da !== dbb) return dbb.localeCompare(da);
    const ca = a.createdAt?.toMillis?.() ?? 0;
    const cb = b.createdAt?.toMillis?.() ?? 0;
    return cb - ca;
  });

  const totalIn = all.filter((t) => t.type === "in").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = all.filter((t) => t.type === "out").reduce((s, t) => s + Number(t.amount), 0);

  $("#stat-balance").textContent = rupiah(totalIn - totalOut);
  $("#stat-in").textContent = rupiah(totalIn);
  $("#stat-out").textContent = rupiah(totalOut);
  $("#stat-count").textContent = `${all.length} transaksi tercatat`;

  const list = all.filter((t) => currentFilter === "all" || t.type === currentFilter);

  $("#log-tbody").innerHTML = list.length
    ? list.map((t) => `
      <tr class="border-b border-slate-800/60 last:border-0">
        <td class="px-4 py-3 text-slate-400">${escapeHtml(t.date)}</td>
        <td class="px-4 py-3">${
          t.type === "in"
            ? '<span class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">Masuk</span>'
            : '<span class="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400">Keluar</span>'
        }</td>
        <td class="px-4 py-3 text-slate-200">${escapeHtml(t.description)}</td>
        <td class="px-4 py-3 text-slate-400">${escapeHtml(t.by || "-")}</td>
        <td class="px-4 py-3 text-right font-bold ${t.type === "in" ? "text-emerald-400" : "text-rose-400"}">
          ${t.type === "in" ? "+" : "−"} ${rupiah(t.amount)}
        </td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="px-4 py-10 text-center text-slate-500">Belum ada transaksi 📭</td></tr>`;

  $("#log-cards").innerHTML = list.length
    ? list.map((t) => `
      <div class="p-4">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-white">${escapeHtml(t.description)}</p>
          <p class="text-sm font-bold ${t.type === "in" ? "text-emerald-400" : "text-rose-400"}">
            ${t.type === "in" ? "+" : "−"} ${rupiah(t.amount)}
          </p>
        </div>
        <div class="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>${escapeHtml(t.date)} · ${escapeHtml(t.by || "-")}</span>
          <span>${t.type === "in" ? "Masuk" : "Keluar"}</span>
        </div>
      </div>`).join("")
    : `<p class="p-10 text-center text-slate-500">Belum ada transaksi 📭</p>`;
}
