import { Inter } from "next/font/google";
import "./globals.css";
import ToastHost from "@/components/ToastHost";
import ThemeSync from "@/components/ThemeSync";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = { title: "Kantin Sebelah — Kelola Uang Kas Digital", description: "Catat pemasukan, pengeluaran, dan pembayaran kas organisasi." };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <ToastHost />
        <ThemeSync />
      </body>
    </html>
  );
}
