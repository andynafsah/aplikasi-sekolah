# INSTALLATION PLAN & TECH STACK BLUEPRINT
# 03_TECH_STACK.md

Version : 3.0.0
Status : Blueprint
Last Updated : 2026-07-07

---

## 📌 PRINSIP INSTALASI
Sesuai dengan instruksi arsitektur:
1. **Just-in-Time Installation:** Jangan menginstal package sebelum modul yang membutuhkannya mulai dikembangkan/dipakai.
2. **Kesesuaian Standar:** Semua package harus mengacu pada dokumen standar yang telah ditentukan (`05_DATABASE_STANDARD.md`, `06_BACKEND_STANDARD.md`, `07_FRONTEND_STANDARD.md`).
3. **Optimasi Bundel:** Menjaga ukuran aplikasi tetap ringan dan efisien di sisi klien.

---

## 🛠️ KELOMPOK PACKAGE (STATUS INSTALASI)

### 1. CORE
*Berisi library inti untuk runtime aplikasi, request HTTP, dan framework server.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `react` | `^19.0.0` | **Terpasang (Aktif)** | UI Library Utama |
| `react-dom` | `^19.0.0` | **Terpasang (Aktif)** | DOM Renderer untuk React |
| `axios` | `^1.7.9` | **Terpasang (Aktif)** | HTTP Client untuk konsumsi REST API |
| `fastify` | `^4.x` / `^5.x` | **Terpasang (Aktif)** | High-performance backend framework |
| `pino` | `^9.x` | **Terpasang (Aktif)** | Logger standar backend |
| `redis` | `^4.x` | **Terpasang (Aktif)** | Caching layer di backend |
| `bullmq` | `^5.x` | **Terpasang (Aktif)** | Message queue & background jobs |

---

### 2. UI (USER INTERFACE)
*Koleksi library untuk membangun tampilan antarmuka yang modern, dinamis, dan terstandarisasi.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `lucide-react` | `^0.471.1` | **Terpasang (Aktif)** | Standard Vector Icons |
| `motion` | `^11.16.2` | **Terpasang (Aktif)** | React Animation Engine (Framer Motion) |
| `tailwindcss` | `^4.x` | **Terpasang (Aktif)** | Utility-first CSS Styling |
| `zustand` | `^5.0.x` | **Terpasang (Aktif)** | Lightweight client-side state management |
| `@tanstack/react-query`| `^5.x` | **Terpasang (Aktif)** | Server state synchronization & cache |
| `recharts` | `^2.x` | **Terpasang (Aktif)** | Data & Financial visualizations / charts |
| `@tanstack/react-table`| `^8.x` | **Terpasang (Aktif)** | Headless datatables with pagination/filtering |
| `dayjs` | `^1.11.x` | **Terpasang (Aktif)** | Fast date manipulation & formatting |

---

### 3. VALIDATION
*Mesin validasi skema data untuk memastikan integritas input baik di sisi frontend maupun backend.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `zod` | `^3.24.1` | **Terpasang (Aktif)** | TypeScript-first schema declaration & validation |
| `react-hook-form` | `^7.x` | **Terpasang (Aktif)** | High performance form controller |
| `@hookform/resolvers` | `^3.x` | **Terpasang (Aktif)** | Zod integration with React Hook Form |

---

### 4. ORM (OBJECT-RELATIONAL MAPPING)
*Penghubung entitas kode dengan database relasional MySQL.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `prisma` | `^5.x` | **Terpasang (Aktif)** | Prisma ORM CLI & Database Migrator (Dev) |
| `@prisma/client` | `^5.x` | **Terpasang (Aktif)** | Auto-generated query builder (Production) |

---

### 5. TESTING
*Perangkat lunak untuk menjalankan unit testing dan integration testing.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `vitest` | `^2.x` | **Terpasang (Aktif)** | Blazing fast unit-test framework |

---

### 6. FORMATTING & LINTING
*Menjaga konsistensi gaya penulisan kode sumber di seluruh tim pengembang.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `eslint` | `^9.x` | **Terpasang (Aktif)** | Linting & statis analisis kode |
| `prettier` | `^3.x` | **Terpasang (Aktif)** | Opinionated code formatter |

---

### 7. DEVELOPMENT
*Peralatan bantu kompilasi, eksekusi, dan build server.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :---5 | :--- | :--- |
| `typescript` | `^5.7.2` | **Terpasang (Aktif)** | Static type-checking compiler |
| `vite` | `^6.0.7` | **Terpasang (Aktif)** | Frontend build tool & dev server |
| `@vitejs/plugin-react` | `^4.3.4` | **Terpasang (Aktif)** | React plugin support for Vite |
| `@types/react` | `^19.0.4` | **Terpasang (Aktif)** | Type definitions for React |
| `@types/react-dom` | `^19.0.2` | **Terpasang (Aktif)** | Type definitions for React DOM |
| `tsx` | `^4.x` | **Terpasang (Aktif)** | Execute TypeScript directly on Node.js |
| `esbuild` | `^0.24.x` | **Terpasang (Aktif)** | JS/TS bundler for production backend compilation |

---

### 8. AI (ARTIFICIAL INTELLIGENCE)
*Pustaka integrasi dengan model AI Generatif Google.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `@google/genai` | `^0.x` | **Terpasang (Aktif)** | Official modern SDK for Gemini API integration |

---

### 9. OFFLINE
*Pustaka sinkronisasi data lokal ketika koneksi internet terputus.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `dexie` | `^4.x` | **Terpasang (Aktif)** | Minimalistic wrapper for IndexedDB (Client side persistence) |

---

### 10. AUTHENTICATION
*Keamanan sesi, hashing password, dan penerbitan token akses.*

| Nama Package | Versi (Target) | Status | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `jsonwebtoken` | `^9.x` | **Terpasang (Aktif)** | Standard JWT library for backend token generation |
| `bcryptjs` | `^2.4.3` | **Terpasang (Aktif)** | Secure password hashing |
