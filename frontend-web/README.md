# 🌐 STANDALONE WEB FRONTEND CLIENT (REACT + VITE)
# frontend-web/README.md

Web Frontend ini dikembangkan menggunakan **React (Vite)** dan **Tailwind CSS**, berperan sebagai aplikasi satu halaman (Single Page Application - SPA) murni yang hanya berinteraksi dengan backend melalui REST API JSON.

---

## 🎨 FITUR-FITUR UTAMA

1.  **Zero Direct DB Connection**: Aplikasi tidak menyambung ke MySQL atau SQLite secara langsung. Seluruh state sinkron dengan backend Express.
2.  **Modular Component Architecture**: Membagi interface secara rapi antara halaman akademik, billing SPP, data siswa, inventory, dan log audit.
3.  **Dynamic RBAC Menu Navigation**: Menampilkan menu navigasi yang sepenuhnya didikte oleh respon otorisasi backend secara dinamis.
4.  **Responsive Layout**: Desain bento-grid dan antarmuka ramah pengguna di desktop maupun mobile.

---

## 🛠️ CARA MENJALANKAN DI LOCALHOST

### 1. Pasang Dependensi
```bash
npm install
```

### 2. Jalankan Mode Pengembangan
```bash
npm run dev
```
Aplikasi web akan berjalan pada alamat `http://localhost:5173`. Seluruh permintaan rute `/api/*` secara otomatis di-proxy oleh Vite ke backend API di `http://localhost:3000`.

### 3. Kompilasi Produksi (Production Build)
```bash
npm run build
```
File statis HTML/CSS/JS yang optimal akan terkompilasi di dalam folder `dist/`. Anda dapat menyajikannya menggunakan Nginx di VPS Anda (Lihat Panduan `/docs/vps-deployment.md`).
