"use client";
import { useEffect } from "react";

export default function ThemeSync() {
  useEffect(() => {
    async function apply() {
      try {
        const r = await fetch("/api/settings");
        const d = await r.json();
        document.documentElement.classList.toggle("dark", d.setting?.theme === "dark");
      } catch {}
    }
    apply();
    window.addEventListener("theme-changed", apply);
    window.addEventListener("focus", apply);
    return () => { window.removeEventListener("theme-changed", apply); window.removeEventListener("focus", apply); };
  }, []);
  return null;
}
