"use client";

// Ringan untuk Android: tanpa framer-motion.
// Transisi hanya CSS opacity 1x per navigasi, tidak ada JS animation loop.
export default function PageTransition({ children }) {
  return <div className="animate-fade-in">{children}</div>;
}
