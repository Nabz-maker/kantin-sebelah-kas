---
name: Kantin Samping
description: "Sistem desain aplikasi kas organisasi — tenang, terpercaya, ramah."
colors:
  primary: "#4F46E5"
  primary-hover: "#6366F1"
  primary-deep: "#4338CA"
  primary-soft: "#E0E7FF"
  neutral-bg: "#F8FAFC"
  neutral-surface: "#FFFFFF"
  neutral-border: "#E2E8F0"
  neutral-text: "#1E293B"
  neutral-text-muted: "#475569"
  neutral-text-subtle: "#64748B"
  success: "#047857"
  success-soft: "#ECFDF5"
  danger: "#E11D48"
  danger-soft: "#FFF1F2"
  warning: "#C2410C"
  warning-soft: "#FFF7ED"
  dark-bg: "#0F172A"
  dark-surface: "#1E293B"
  dark-border: "#334155"
  dark-text: "#E2E8F0"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  gutter-desktop: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text-muted}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-muted}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
    typography: "{typography.label}"
  nav-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
---

# Design System: Kantin Samping

## Overview

**Creative North Star: "Kantin Ramah (The Friendly Counter)"**

Sistem ini memperlakukan aplikasi kas seperti kantin yang ramah: semua yang dibutuhkan tersaji jelas di depan, tanpa antrian berliku, tanpa hal tersembunyi. Suasana visualnya **tenang dan terpercaya** — permukaan putih/abu-abu muda yang bersih, satu aksen indigo yang tegas hanya muncul saat ada aksi, dan warna status yang langsung terbaca. Bukan aplikasi keuangan yang kaku dan seram, bukan pula mainan yang terlalu ceria: ini alat kerja sehari-hari organisasi yang enak dipakai setiap hari.

Kepadatannya sedang: informasi cukup rapat untuk efisien di layar HP, tapi tetap punya ruang napas di desktop. Sudut selalu membulat besar dan kontrol terasa "ramah" — sementara hierarki, kontras, dan warna aksen dibuat "tegas" supaya tidak ada ambiguitas mana tombol utama dan mana status.

**Key Characteristics:**
- Satu aksen indigo yang tenang, dipakai hemat hanya untuk aksi utama, fokus, dan navigasi aktif.
- Permukaan datar dengan border tipis; bayangan hanya untuk lapisan yang mengambang.
- Sudut membulat besar dan konsisten: 12px untuk kontrol, 16px untuk kartu.
- Status selalu berpasangan: background lembut + teks pekat + border tipis.
- Mode gelap adalah default, dibangun dari netral slate gelap yang sama.

## Colors

Paletnya tenang dan hemat: satu aksen biru-ungu di atas netral slate kalem, ditambah tiga warna semantik yang muncul hanya untuk status.

### Primary
- **Biru-Slate Tenang** (#4F46E5): warna aksen tunggal. Hanya untuk tombol utama, link/fokus aktif, item navigasi aktif, dan sorotan data kas. Tidak pernah jadi permukaan besar.
- **Primary Hover** (#6366F1): state hover semua kontrol indigo.
- **Primary Deep** (#4338CA): teks indigo di atas background lembut (mis. judul menu aktif).
- **Primary Soft** (#E0E7FF): background lembut untuk menu aktif dan ring fokus.

### Neutral
- **Kertas Abu Terang** (#F8FAFC): background halaman mode terang.
- **Permukaan Putih** (#FFFFFF): kartu, modal, dropdown, header.
- **Border Halus** (#E2E8F0): semua garis pemisah 1px.
- **Teks Utama** (#1E293B): judul, angka, isi penting.
- **Teks Redup** (#475569): label, menu, teks sekunder.
- **Teks Redup Lanjut** (#64748B): placeholder, ikon, teks tersier — bukan untuk informasi penting.

### Semantic
- **Hijau Sukses** (#047857) di atas **Sukses Lembut** (#ECFDF5): status lunas/berhasil.
- **Merah Bahaya** (#E11D48) di atas **Bahaya Lembut** (#FFF1F2): hapus, gagal, tunggakan.
- **Oranye Peringatan** (#C2410C) di atas **Peringatan Lembut** (#FFF7ED): status menunggu.

### Dark Theme (default)
- **Malam Slate** (#0F172A): background halaman.
- **Permukaan Gelap** (#1E293B): kartu & kontrol (peta otomatis dari `bg-white`).
- **Border Gelap** (#334155): semua garis pemisah mode gelap.
- **Teks Terang** (#E2E8F0): teks utama mode gelap.

### Named Rules
**The Calm Accent Rule.** Indigo hanya boleh menyentuh kurang dari 10% layar: aksi utama, fokus, menu aktif. Permukaan indigo besar (hero, kartu penuh) dilarang — kelangkaannya membuat aksi terlihat.
**The Soft-Status Rule.** Setiap status selalu tiga lapis: background 50-an, teks 70-an, border 20-an dari hue yang sama. Tidak pernah teks berwarna telanjang di atas putih.

## Typography

**Display Font:** Inter (dengan `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Inter (dengan `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** — tidak ada font terpisah.

**Character:** Satu keluarga sans-serif geometris-netral dipakai untuk semuanya. Kombinasi berat 800 untuk judul dan 400 untuk isi memberi rasanya "ramah tapi tegas": ringan dibaca, tegas di hierarki.

### Hierarchy
- **Display** (800, 24px/1.5rem, line-height 1.25, tracking -0.025em): judul halaman besar dan judul halaman login.
- **Headline** (800, 18px/1.125rem, line-height 1.3, tracking -0.02em): nama brand di sidebar, nilai statistik besar, judul section.
- **Title** (700, 16px/1rem, line-height 1.4): judul kartu, judul modal, judul dropdown.
- **Body** (400, 14px/0.875rem, line-height 1.5): seluruh isi, tabel, deskripsi. Lebar baca 65–75ch di desktop.
- **Label** (500, 14px/0.875rem, line-height 1.5): label input, menu sidebar, tombol.
- **Badge** (600, 12px): teks chip status — satu-satunya ukuran di bawah body.

### Named Rules
**The Single-Family Rule.** Hanya Inter. Tidak ada display font kedua, tidak ada italic dekoratif, tidak ada uppercase lebar — judul dibedakan dengan berat (800) dan tracking negatif, bukan dengan font lain.

## Layout

Shell desktop memakai sidebar tetap selebar **240px** di kiri (border-right 1px), dengan konten utama menggeser sejauh itu. Header setinggi **64px** menempel di atas (sticky) dengan background putih 80% + backdrop-blur dan border bawah 1px — memberi rasa berlapis tanpa bayangan.

Gutter konten **16px** di mobile dan **32px** di desktop; padding bawah **96px** di mobile (ada bottom nav) dan 40px di desktop. Jarak antar bagian memakai ritme kelipatan 8px; kartu berpadu 20px, modal 24px, nav berjarak space-y-1 (4px).

Responsif:
- **< 768px (mobile):** sidebar diganti tombol hamburger yang membuka drawer slide-in selebar 256px + overlay gelap; navigasi utama pindah ke bottom bar ikon yang menempel di bawah layar.
- **≥ 768px (desktop):** sidebar selalu terlihat, bottom bar hilang, grid kartu melebar jadi beberapa kolom.

### Named Rules
**The One-Gutter Rule.** Semua konten memakai gutter yang sama (16/32px); tidak ada section yang masuk lebih dalam atau lebih keluar dari yang lain.

## Elevation & Depth

Sistem ini hibrida: **permukaan datar diistirahatkan dengan border**, bayangan hanya muncul sebagai respons terhadap lapisan yang mengambang atau state. Di mode gelap, kedalaman justru ditangani oleh **tonal layering** (background #0F172A vs permukaan #1E293B), bukan bayangan lebih tebal.

### Shadow Vocabulary
- **Rest Ringan** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): kartu & input saat diam — nyaris tak terlihat.
- **Mengambang** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): dropdown profil, dropdown notifikasi.
- **Overlay** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): modal konfirmasi.
- **Angkat Hover** (`box-shadow: 0 10px 25px -10px rgb(0 0 0 / 0.12)`): kartu statistik saat di-hover (bersama translateY -3px).

### Named Rules
**The Border-First Rule.** Pemisah utama adalah border 1px slate-200, bukan bayangan. Kartu tidak pernah diberi bayangan tebal; bayangan hanya layak untuk lapisan yang benar-benar terangkat di atas konten.

## Shapes

Bahasa bentuknya membulat besar dan konsisten — tidak ada sudut tajam di seluruh aplikasi:

- **8px (`rounded-lg`):** item menu dropdown, tombol kecil di modal, tombol aksi sekunder.
- **12px (`rounded-xl`):** semua kontrol — input, tombol utama, pencarian, chip header, item nav sidebar.
- **16px (`rounded-2xl`):** semua wadah besar — kartu, modal, panel kosong, halaman login.
- **Penuh (`rounded-full`):** badge status, spinner, titik notifikasi, avatar bulat.

Border selalu **1px solid** slate-200 (terang) / #334155 (gelap); satu pengecualian: empty state memakai border **putus-putus** untuk menandai "ruang kosong". Tidak ada clipping aneh atau bentuk sudut lain — siluet aplikasi selalu kartu lembut.

## Components

### Buttons
- **Shape:** kontrol utama radius 12px (rounded-xl); tombol sekunder/aksi di modal radius 8px (rounded-lg).
- **Primary:** background indigo (#4F46E5), teks putih, padding 10px 16px, teks 14px/600. Dipakai untuk aksi tunggal terpenting sebuah layar (Simpan, Login, Bayar).
- **Hover / Focus:** hover ke indigo #6366F1; fokus ring 2px indigo-100; disabled opacity 60%. Tombol login punya efek angkat -2px halus.
- **Secondary:** putih dengan border 1px slate-200, teks slate-600, hover ke slate-50.
- **Danger:** merah (#E11D48), radius 8px, hover ke #F43F5E — hanya untuk hapus/konfirmasi destruktif.

### Cards / Containers
- **Corner Style:** 16px (rounded-2xl).
- **Background:** putih (mode terang) / slate-800 (mode gelap).
- **Shadow Strategy:** Rest Ringan; angkat hanya saat hover kartu statistik.
- **Border:** 1px slate-200 solid.
- **Internal Padding:** 20px (p-5); panel kosong 40px.

### Inputs / Fields
- **Style:** radius 12px, border 1px slate-200, background putih, padding 10px 14px, teks 14px.
- **Focus:** border berpindah ke indigo #6366F1 + ring 2px indigo-100 — glow lembut, bukan outline tebal.
- **Placeholder:** slate-400 (#94A3B8).
- **Label:** 14px/500 slate-600 di atas input, jarak 6px.

### Badges / Chips
- **Style:** pill penuh, padding 2px 10px, teks 12px/600, selalu tiga lapis (soft bg + teks pekat + border tipis).
- **Variants:** hijau (lunas/aktif), merah (belum/gagal), oranye (menunggu), indigo (info), slate (netral).

### Navigation
- **Sidebar:** item radius 12px, padding 10px 14px, ikon 18px, teks 14px/500 slate-600; **aktif** → background indigo-50 + teks indigo-700; hover → slate-50.
- **Header:** sticky, blur, berisi pencarian (radius 12px, bg slate-50), lonceng notifikasi, dan chip avatar (border 1px, radius 12px).
- **Mobile:** bottom bar ikon fixed + drawer slide-in 256px dengan overlay slate-950/40.

### Modal Konfirmasi (signature)
Overlay slate-950/40 memenuhi layar; panel putih radius 16px, padding 24px, Shadow Overlay, muncul dengan animasi scale 0.96 → 1 + fade (0.18s). Judul 16px/700, deskripsi slate-500, aksi rata kanan: Batal (secondary) di kiri Hapus (danger).

### Motion
- **Halaman:** fade + slide 10px, 0.2s (PageTransition).
- **Masuk data:** fade-in-up 0.45s, stagger 60ms per kartu (framer-motion).
- **Dropdown/drawer:** fade + scale 0.97 atau slide 260px, 0.15–0.2s.
- **Modal:** modalPop 0.28s CSS / scale-fade 0.18s framer.

## Do's and Don'ts

### Do:
- **Do** pakai indigo hanya untuk aksi utama, state fokus, dan menu aktif — sisanya netral slate.
- **Do** pertahankan radius 12px untuk kontrol dan 16px untuk wadah di setiap layar baru.
- **Do** beri status sebagai tiga lapis soft-bg + teks pekat + border tipis.
- **Do** pakai border 1px slate-200 sebagai pemisah utama; bayangan hanya untuk dropdown/modal.
- **Do** hormati mode gelap: permukaan slate-800 di atas background slate-900, teks slate-200.
- **Do** beri judul hierarki lewat berat 800 + tracking negatif, bukan font baru.

### Don't:
- **Don't** membuat permukaan indigo besar (hero/kartu penuh indigo) — aksen ini harus langka.
- **Don't** memakai sudut tajam (0px) atau mencampur radius berbeda pada komponen sejenis.
- **Don't** memakai teks slate-400 untuk informasi penting — kontrasnya di bawah 4.5:1.
- **Don't** menumpuk bayangan tebal pada kartu datar atau memberi kartu bayangan ganda.
- **Don't** menambahkan font selain Inter atau mengubah ukuran body (14px) secara acak.
- **Don't** menampilkan data yang sama dengan cara berbeda di dua halaman — satu pola kartu, satu pola tabel.
