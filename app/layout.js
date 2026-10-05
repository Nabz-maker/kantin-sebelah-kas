import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ToastHost from "@/components/ToastHost";
import ThemeSync from "@/components/ThemeSync";

// Inter: font utama, preload agar FCP cepat di Android.
// Bricolage: hanya untuk heading — tidak di-preload, display swap, biar tidak blokir render HP.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: true, fallback: ["system-ui", "sans-serif"] });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });

export const metadata = { title: "Kantin Samping — Kelola Uang Kas Digital", description: "Catat pemasukan, pengeluaran, dan pembayaran kas organisasi.", manifest: "/manifest.json", icons: { icon: "/pwa-192.png", apple: "/pwa-192.png" } };

// Viewport ringan untuk Android: cegah zoom font otomatis & hemat repaint.
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#4F46E5" };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <ToastHost />
        <ThemeSync />
      </body>
    </html>
  );
}
