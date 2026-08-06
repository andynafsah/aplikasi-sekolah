# Dokumentasi REST API (v1)
# API_DOCUMENTATION.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

Seluruh komunikasi data antara Client (React Web / Mobile) dengan Backend (Express/Fastify) wajib melalui protokol HTTPS menggunakan format pertukaran data JSON. Dokumen ini mendefinisikan standar rute, header, struktur respon, dan rincian endpoint sistem.

---

## 📌 PRINSIP DASAR
1.  **Versioning:** Semua rute API wajib diawali dengan versi rilis `/api/v1/`.
2.  **Keamanan Sesi:** Semua endpoint yang dilindungi (protected) mewajibkan pengiriman JSON Web Token (JWT) yang valid.
3.  **Multi-Tenancy:** Identitas penyewa (pesantren) wajib dikirimkan pada setiap request melalui header kustom `X-Tenant-ID`.

---

## 📥 REQUEST HEADERS

Setiap request yang dikirimkan ke server API harus menyertakan header berikut:

| Nama Header | Tipe Data | Wajib | Deskripsi / Nilai Contoh |
| :--- | :--- | :--- | :--- |
| `Content-Type` | String | Ya | `application/json` |
| `X-Tenant-ID` | String (UUID) | Ya | Identitas unik instansi pesantren (contoh: `tenant-b7782-991c-43`) |
| `Authorization` | String | Kondisional | Token akses untuk endpoint terlindungi. Format: `Bearer <JWT_ACCESS_TOKEN>` |

---

## 📤 STRUKTUR RESPON STANDAR (RESPONSE STANDARD)

Format respon API dirancang seragam di seluruh modul bisnis menggunakan spesifikasi berikut:

### 1. Respon Sukses (Success Response)
```json
{
  "success": true,
  "message": "Data santri berhasil ditarik.",
  "data": {
    "id": "std-7729",
    "name": "Achmad Fauzi",
    "nis": "2026070001",
    "tenantId": "tenant-b7782-991c-43"
  },
  "meta": null,
  "errors": null
}
```

### 2. Respon Sukses Berpaginasi (Paginated Response)
```json
{
  "success": true,
  "message": "Daftar santri berhasil ditampilkan.",
  "data": [
    {
      "id": "std-7729",
      "name": "Achmad Fauzi",
      "nis": "2026070001"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15
  },
  "errors": null
}
```

### 3. Respon Kegagalan (Error Response)
```json
{
  "success": false,
  "message": "Validasi data gagal.",
  "data": null,
  "meta": null,
  "errors": [
    {
      "field": "email",
      "message": "Format alamat email tidak valid."
    }
  ]
}
```

---

## 🔑 ENDPOINT AUTENTIKASI (`/api/v1/auth`)

Rute-rute di bawah ini digunakan untuk manajemen sesi pengguna (diimplementasikan pada `auth.skeleton.ts`):

### 1. Login Pengguna
*   **Endpoint:** `POST /api/v1/auth/login`
*   **Proteksi:** Publik (Bebas)
*   **Request Body:**
    ```json
    {
      "email": "ustadz.fauzi@pesantren.id",
      "password": "PasswordAman123!"
    }
    ```
*   **Respon Sukses (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login berhasil.",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "usr-8821",
          "name": "Ustadz Fauzi",
          "role": "USTADZ",
          "tenantId": "tenant-b7782-991c-43"
        }
      },
      "meta": null,
      "errors": null
    }
    ```

### 2. Perbarui Sesi (Refresh Token)
*   **Endpoint:** `POST /api/v1/auth/refresh`
*   **Proteksi:** Publik (Mewajibkan Refresh Token lama)
*   **Request Body:**
    ```json
    {
      "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
    ```
*   **Respon Sukses (200 OK):**
    ```json
    {
      "success": true,
      "message": "Akses token baru berhasil diterbitkan.",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
      },
      "meta": null,
      "errors": null
    }
    ```

### 3. Ambil Informasi Pengguna Aktif (Get Me)
*   **Endpoint:** `GET /api/v1/auth/me`
*   **Proteksi:** Privat (Mewajibkan Access Token Bearer)
*   **Respon Sukses (200 OK):**
    ```json
    {
      "success": true,
      "message": "Data pengguna berhasil ditarik.",
      "data": {
        "id": "usr-8821",
        "name": "Ustadz Fauzi",
        "email": "ustadz.fauzi@pesantren.id",
        "role": "USTADZ",
        "tenantId": "tenant-b7782-991c-43"
      },
      "meta": null,
      "errors": null
    }
    ```

### 4. Keluar Sesi (Logout)
*   **Endpoint:** `POST /api/v1/auth/logout`
*   **Proteksi:** Privat (Mewajibkan Access Token Bearer)
*   **Respon Sukses (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logout berhasil, sesi telah dihapus.",
      "data": null,
      "meta": null,
      "errors": null
    }
    ```

---

## 🚨 DAFTAR KODE KESALAHAN HTTP (HTTP STATUS CODES)

Sistem merespon dengan kode HTTP terstandar berikut untuk mewakili status eksekusi:

*   **`200 OK`:** Permintaan berhasil diproses dan mengembalikan data.
*   **`201 Created`:** Sumber data baru (entitas) berhasil dibuat di server.
*   **`400 Bad Request`:** Permintaan tidak dapat diproses karena kesalahan sintaks atau skema input tidak lolos validasi.
*   **`401 Unauthorized`:** Token otentikasi tidak dilampirkan, telah kedaluwarsa, atau tidak valid.
*   **`403 Forbidden`:** Pengguna terautentikasi tetapi tidak memiliki hak akses (role/permission) untuk mengakses rute terkait.
*   **`404 Not Found`:** Alamat rute atau entitas data yang dicari tidak ditemukan di database.
*   **`422 Unprocessable Entity`:** Validasi bisnis gagal (misal: pengisian nilai melampaui batas, atau kuota santri baru penuh).
*   **`500 Internal Server Error`:** Kesalahan fatal pada server internal. Detail kesalahan akan dicatat oleh `logger.ts` demi alasan keamanan.
