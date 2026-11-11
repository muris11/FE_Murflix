# Murflix Frontend (React JS + Vite + Tailwind CSS v4)

Frontend Single Page Application (SPA) untuk Murflix Streaming Hub, dibangun dengan **React 19**, **Vite**, **TypeScript**, dan **Tailwind CSS v4**.

## ✨ Fitur

- **Tampilan Dark Mode ala Netflix** (`#141414`) dengan animasi interaktif.
- **Multi-Server Video Player Modal**: Mendukung 9+ server streaming fallback (VidLink, VidSrc CC, Embed.su, MoviesAPI, dll.) plus video langsung.
- **Katalog Konten Lengkap**:
  - Film & Serial TV (Trending, Popular, Top Rated, Now Playing, Upcoming)
  - Detail film & episode series
  - DramaBox VIP & ReelShort (Micro-drama vertikal)
  - Anime ongoing & complete
  - Realtime debounced search
  - My List (Daftar Tontonan Tersimpan)
- **Suite Admin Lengkap**:
  - **Dashboard Overview**: KPI statistik pengguna & paket
  - **Kelola Pengguna**: Tambah, edit, aktifkan/nonaktifkan akun, dan perpanjang masa aktif
  - **Paket & Harga Langganan**: Manajemen harga sewa harian, mingguan, bulanan, dan permanen
  - **Pengaturan & API Keys**: Form aman untuk konfigurasi TMDB Token & URL API tanpa file `.env`

## 🏃 Cara Menjalankan

1. Install dependensi:
   ```bash
   npm install
   ```

2. Jalankan server development:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

3. Build production:
   ```bash
   npm run build
   ```
