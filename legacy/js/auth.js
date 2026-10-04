// ─────────────────────────────────────────────────────────────
// auth.js — register, login, logout, profile, route guard
// ─────────────────────────────────────────────────────────────
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { enterApp, exitApp, setUserChip } from "./app.js";
import { $, toast } from "./ui.js";

// Firebase error codes → friendly Indonesian messages
const AUTH_ERRORS = {
  "auth/email-already-in-use": "Email sudah terdaftar. Silakan masuk.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/weak-password": "Password terlalu lemah (minimal 6 karakter).",
  "auth/missing-password": "Password wajib diisi.",
  "auth/user-not-found": "Email atau password salah.",
  "auth/wrong-password": "Email atau password salah.",
  "auth/invalid-credential": "Email atau password salah.",
  "auth/invalid-login-credentials": "Email atau password salah.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
  "auth/network-request-failed": "Koneksi bermasalah. Periksa internetmu.",
};

/* ── Route protection ──────────────────────────────────────── */
let currentRoute = null;

onAuthStateChanged(auth, (user) => {
  $("#loading-screen").classList.add("hidden");

  if (user && currentRoute !== "app") {
    currentRoute = "app";
    $("#auth-screen").classList.add("hidden");
    $("#app-screen").classList.remove("hidden");
    // Temporary chip (email prefix) until the profile doc loads
    setUserChip({ name: user.displayName || user.email.split("@")[0], email: user.email });
    enterApp(user);      // start real-time dashboard
    loadProfile(user);   // fetch display name from users/{uid}
  }

  if (!user && currentRoute !== "auth") {
    currentRoute = "auth";
    exitApp();           // stop listeners, clear sensitive UI
    $("#app-screen").classList.add("hidden");
    $("#auth-screen").classList.remove("hidden");
  }
});

async function loadProfile(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const { name, email } = snap.data();
      setUserChip({ name, email: email || user.email });
    }
  } catch { /* offline → keep fallback name */ }
}

/* ── Tabs: Login ⇄ Register ────────────────────────────────── */
function switchTab(tab) {
  const isLogin = tab === "login";
  $("#form-login").classList.toggle("hidden", !isLogin);
  $("#form-register").classList.toggle("hidden", isLogin);
  $("#tab-login").className = tabBtnClass(isLogin);
  $("#tab-register").className = tabBtnClass(!isLogin);
  $("#auth-error").classList.add("hidden");
}
const tabBtnClass = (active) =>
  `rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-700/90 text-white" : "text-slate-400 hover:text-slate-200"}`;

$("#tab-login").addEventListener("click", () => switchTab("login"));
$("#tab-register").addEventListener("click", () => switchTab("register"));
$("#go-register").addEventListener("click", () => switchTab("register"));
$("#go-login").addEventListener("click", () => switchTab("login"));

const showAuthError = (msg) => {
  const el = $("#auth-error");
  el.textContent = msg;
  el.classList.remove("hidden");
};

/* ── Register ──────────────────────────────────────────────── */
$("#form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#auth-error").classList.add("hidden");

  const name = $("#reg-name").value.trim();
  const email = $("#reg-email").value.trim();
  const password = $("#reg-password").value;
  const pass2 = $("#reg-confirm").value;
  const btn = $("#btn-register");

  if (name.length < 2) return showAuthError("⚠️ Nama minimal 2 huruf.");
  if (password.length < 6) return showAuthError("⚠️ Password minimal 6 karakter.");
  if (password !== pass2) return showAuthError("⚠️ Konfirmasi password tidak sama.");

  btn.disabled = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Profile doc = source of truth for the member's display name
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, createdAt: serverTimestamp(),
    });
    setUserChip({ name, email }); // fix race with onAuthStateChanged fallback
    toast(`Selamat bergabung di tongkrongan, ${name}! 🎉`);
  } catch (err) {
    showAuthError(AUTH_ERRORS[err.code] ?? `Gagal mendaftar: ${err.code}`);
  } finally {
    btn.disabled = false;
  }
});

/* ── Login ─────────────────────────────────────────────────── */
$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#auth-error").classList.add("hidden");
  const btn = $("#btn-login");
  btn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, $("#login-email").value.trim(), $("#login-password").value);
    // onAuthStateChanged takes over from here
  } catch (err) {
    showAuthError(AUTH_ERRORS[err.code] ?? "Gagal masuk. Coba lagi.");
  } finally {
    btn.disabled = false;
  }
});

/* ── Forgot password ───────────────────────────────────────── */
$("#btn-forgot").addEventListener("click", async () => {
  const email = $("#login-email").value.trim();
  if (!email) return showAuthError("⚠️ Isi email dulu, lalu klik 'Lupa password?'.");
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Email reset password terkirim. Cek inbox/spam 📬");
  } catch (err) {
    showAuthError(AUTH_ERRORS[err.code] ?? "Gagal mengirim email reset.");
  }
});

/* ── Logout ────────────────────────────────────────────────── */
$("#btn-logout").addEventListener("click", async () => {
  await signOut(auth);
  toast("Sampai jumpa di tongkrongan! 👋");
});
