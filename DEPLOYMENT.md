# Panduan Deployment Produksi ERP Sekolah & Pesantren Modern

Dokumen ini memuat standar operasional prosedur (SOP) deployment enterprise grade untuk aplikasi ERP Sekolah & Pesantren.

---

## 1. Spesifikasi Server & Environment Prerequisite

### Rekomendasi Hardware
| Komponen | Minimal (1 Sekolah / ~1.000 Siswa) | Rekomendasi SaaS (Multi-Tenant / >10.000 Siswa) |
|---|---|---|
| **CPU** | 2 vCPU (x86_64 / ARM64) | 4–8 vCPU |
| **RAM** | 4 GB | 8–16 GB |
| **Storage** | 40 GB SSD / NVMe | 100+ GB NVMe + Object Storage (S3/MinIO) |
| **OS** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS / Alpine Container |
| **Node.js** | v20.x LTS / v22.x LTS | v20.x LTS |
| **Database** | PostgreSQL 16+ / MySQL 8.4 LTS | PostgreSQL 16+ Managed (RDS / Cloud SQL) |
| **Redis** | Redis 7.x (Opsional / Cache Layer) | Redis 7.x Cluster |

---

## 2. Struktur Konfigurasi Lingkungan (`.env`)

Salin template konfigurasi dari `.env.example` ke `.env` sebelum menjalankan aplikasi:

```bash
cp .env.example .env
```

### Variabel Wajib:
- `DATABASE_URL`: URI koneksi database utama (`postgresql://...` atau `mysql://...`).
- `JWT_SECRET`: Kunci rahasia untuk tanda tangan access token (minimal 32 karakter acak).
- `REFRESH_TOKEN_SECRET`: Kunci rahasia untuk refresh token (minimal 32 karakter acak).
- `PORT`: Port aplikasi (default: `3000`).
- `CORS_ORIGINS`: Daftar domain yang diizinkan (pisahkan dengan koma).
- `UPLOAD_PATH`: Direktori penyimpanan file upload lokal atau mount volume.

---

## 3. Tahapan Build & Deployment Standar

### A. Pre-flight Check & Validasi
```bash
# 1. Install dependensi
npm ci --legacy-peer-deps

# 2. Jalankan type checking
npm run typecheck

# 3. Jalankan automated test suite
npm run test

# 4. Validasi linting
npm run lint
```

### B. Kompilasi Produksi
```bash
# Kompilasi frontend dan backend bundle
npm run build
```
Hasil build akan berada di direktori `dist/` dan siap disajikan secara statis dan modular.

### C. Menjalankan Server Produksi
```bash
# Menggunakan Node runtime langsung
NODE_ENV=production npm start

# Atau menggunakan process manager PM2
pm2 start dist/server.cjs --name "school-erp" -i max --env production
```

---

## 4. Health Check & Observabilitas

Aplikasi menyediakan endpoint pemantauan berkala:

| Endpoint | Kegunaan | Status Sukses |
|---|---|---|
| `/health` | Pemeriksaan kesehatan umum sistem & konsumsi RAM | `HTTP 200 { status: "ok" }` |
| `/health/liveness` | Pemeriksaan liveness pod / container orchestration | `HTTP 200 { status: "alive" }` |
| `/health/readiness` | Pemeriksaan kesiapan menerima traffic | `HTTP 200 { status: "ready" }` |
| `/health/database` | Pemeriksaan konektivitas database & inisialisasi skema | `HTTP 200 { status: "UP" }` |
| `/health/storage` | Pemeriksaan ketersediaan folder & storage driver | `HTTP 200 { status: "UP" }` |
| `/health/redis` | Pemeriksaan status cache layer | `HTTP 200 { status: "UP" }` |
| `/api/health` | Pemeriksaan gateway API | `HTTP 200 { status: "HEALTHY" }` |

---

## 5. Prosedur Backup & Disaster Recovery

### Backup Database Otomatis (Cron)
```bash
# Script backup PostgreSQL harian
pg_dump -U postgres -h localhost school_erp | gzip > /backups/db_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Restore Database
```bash
# Restore dari file dump
gunzip -c /backups/db_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres -h localhost school_erp
```

---

## 6. Prosedur Rollback Versi
1. Simpan commit hash stabil sebelumnya.
2. Lakukan checkout ke tag rilis sebelumnya: `git checkout <release-tag>`.
3. Jalankan `npm ci` dan `npm run build`.
4. Muat ulang process manager: `pm2 reload school-erp`.
