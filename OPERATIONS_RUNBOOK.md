# Operations Runbook - ERP Sekolah & Pesantren

Dokumen panduan mitigasi insiden produksi (Incident Response & Mitigation SOP).

---

## 1. Matriks Eskalasi & Severity Level

| Severity | Kriteria | Target Waktu Respon | Tindakan Utama |
|---|---|---|---|
| **SEV-1 (Kritis)** | Server down total, data korup, kegagalan transaksi pembayaran massal | < 15 Menit | Rollback rilis, switch failover DB, panggil DevOps Lead |
| **SEV-2 (Tinggi)** | Fitur utama terganggu (LMS/CBT tidak bisa submit, WhatsApp gagal kirim) | < 1 Jam | Restart worker, bersihkan antrean Redis, cek log error ID |
| **SEV-3 (Sedang)** | Penurunan performa parsial, reporting lambat | < 4 Jam | Analisis query lambat, tambah resource container |
| **SEV-4 (Rendah)** | Minor UI bug atau typographic defect | < 24 Jam | Masukkan sprint backlog reguler |

---

## 2. Skenario Penanganan Insiden

### Skenario A: Database Connection Pool Exhausted (Koneksi Penuh)
**Gejala:** Endpoint `/health/database` mengembalikan error atau waktu respon API > 5000ms.
**Langkah Penanganan:**
1. Cek koneksi aktif pada database:
   ```sql
   SELECT count(*), state FROM pg_stat_activity GROUP BY state;
   ```
2. Hentikan query lambat atau idle transaction yang menahan lock:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - INTERVAL '5 minutes';
   ```
3. Sesuaikan `DB_POOL_MAX` di file `.env` jika traffic sekolah meningkat secara berkala (misal saat PPDB).

---

### Skenario B: Server Kehabisan Memori (OOM / High RAM Consumption)
**Gejala:** Node process restart berulang kali, error `JavaScript heap out of memory`.
**Langkah Penanganan:**
1. Periksa konsumsi RAM via `/health`:
   ```bash
   curl -s http://localhost:3000/health | jq .memory
   ```
2. Pastikan process dieksekusi dengan memory allocation yang memadai:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```
3. Jika terdapat file export Excel/PDF raksasa yang menumpuk di memori, manfaatkan streaming response atau background worker.

---

### Skenario C: Disk Storage Penuh (Upload / Log Overflow)
**Gejala:** Error upload file `ENOSPC: no space left on device`.
**Langkah Penanganan:**
1. Periksa penggunaan partisi disk:
   ```bash
   df -h
   ```
2. Hapus log lama atau file temporary di `/storage/uploads/temp/`:
   ```bash
   find ./storage/uploads/temp/ -type f -mtime +7 -delete
   ```
3. Pindahkan file lampiran dokumen arsip ke Object Storage eksternal (S3 / MinIO / GCS).

---

### Skenario D: Rate Limit Triggered Terlalu Sering
**Gejala:** Klien menerima respon `HTTP 429 Too Many Requests`.
**Langkah Penanganan:**
1. Verifikasi apakah ada aktivitas scraping ilegal atau bug loop pada frontend client.
2. Jika traffic valid berasal dari jaringan sekolah dengan single NAT IP, tingkatkan `RATE_LIMIT_MAX` di `.env` (misal dari 120 ke 600 req/menit).

---

## 3. Investigasi Error Menggunakan Error ID
Setiap kegagalan unhandled pada server akan menghasilkan respons terstruktur:
```json
{
  "success": false,
  "message": "Internal server error occurred. Our technical team has been notified.",
  "errorId": "err_1717000000000_abc123",
  "code": "INTERNAL_SERVER_ERROR"
}
```
Lacak root cause pada log server dengan grep:
```bash
grep -rn "err_1717000000000_abc123" /var/log/school-erp/
```
