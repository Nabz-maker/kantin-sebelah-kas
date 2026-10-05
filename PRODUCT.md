# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dua peran dalam satu organisasi:

- **Admin organisasi** — mengelola kas: mencatat transaksi pemasukan/pengeluaran, membuat tagihan iuran mingguan, mengelola anggota, melihat laporan dan log aktivitas login.
- **Anggota organisasi** — melihat tagihan iuran kas mereka, melakukan pembayaran, dan melihat daftar anggota.

## Product Purpose

Mengelola dan melaporkan keuangan kas organisasi: mencatat transaksi, menagih iuran kas mingguan, dan menghasilkan laporan keuangan yang transparan. Sukses berarti kas tercatat rapi dan anggota percaya pada akurasinya.

## Positioning

Kas organisasi yang transparan bagi anggota: bukan sekadar pencatatan oleh admin, tetapi setiap anggota bisa langsung melihat tagihan dan kondisi kas — dilengkapi notifikasi dan riwayat aktivitas yang menjaga akuntabilitas.

## Operating Context

- Aplikasi web (Next.js) yang diakses lewat browser desktop dan HP; sudah terpasang sebagai PWA.
- Alur utama: admin membuat tagihan mingguan → anggota membayar → transaksi tercatat → laporan dilihat bersama.
- Dideploy di Vercel dengan database Postgres (Neon) via Prisma; sesi login bertahan sampai 1 tahun.
- Data auto-refresh tiap 5 detik agar tampilan selalu mutakhir.

## Capabilities and Constraints

- Peran admin & member; endpoint dan kontrol admin dibatasi role.
- Fitur: dashboard statistik, transaksi, pembayaran/tagihan mingguan, laporan, manajemen anggota, log aktivitas login (admin), notifikasi tagihan, tema gelap/terang, PWA installable.
- Bahasa antarmuka: Indonesia.
- Rencana platform native (Android/iOS) belum diputuskan — saat ini web.

## Brand Commitments

- Nama tampil: **"Kantin Samping"** (halaman login).
- Logo di `public/logo.png` (aset dari pengguna) — dipakai di ikon PWA dan halaman login.
- Tema gelap sebagai default; pengguna bisa beralih lewat Pengaturan.

## Evidence on Hand

- Kode aplikasi dan antarmuka yang sudah berjalan (repo ini).
- Aset logo: `public/logo.png`, `public/pwa-192.png`, `public/pwa-512.png`.
- Tidak ada testimoni, studi kasus, atau liputan pers — jangan mengarang klaim semacam itu.

## Product Principles

1. **Transparansi** — anggota selalu bisa melihat kondisi kas dan tagihannya sendiri.
2. **Cepat dicatat** — admin menyelesaikan pencatatan kas dalam beberapa langkah singkat.
3. **Akuntabilitas** — log aktivitas dan notifikasi membuat perubahan terlacak.
4. **Selalu mutakhir** — data segar tanpa refresh manual.
