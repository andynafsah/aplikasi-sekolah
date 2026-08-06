# 87_ENTERPRISE_RBAC_ASSIGNMENT_SCOPE_ENGINE.md

# ENTERPRISE RBAC ASSIGNMENT & SCOPE EVALUATION ENGINE

Version: Enterprise 1.0  
Architecture: Single Tenant / Multi-Unit Ecosystem  
Backend: Express + Node.js (Prisma ORM)  
Frontend: React + Vite + Tailwind CSS  
Status: Production Ready  

---

## 1. OBJECTIVE & CORE PHILOSOPHY

Enterprise RBAC Assignment & Scope Evaluation Engine adalah pondasi tata kelola hak akses dan isolasi data multi-unit pada ekosistem sekolah & pesantren terpadu.

1. **Single Employee Identity, Multi-Role Capability**:
   - Setiap pegawai (Guru, Staf TU, Bendahara, Satpam, Musyrif) memiliki **1 identitas NIP/Pegawai utama**.
   - Pegawai dapat memegang satu atau lebih **Penugasan Role (Multi-Role Assignment)** sekaligus (contoh: *Guru Mapel Bahasa Arab* + *Wali Kelas X IPA 1* + *Musyrif Asrama*).

2. **Multi-Dimensional Scope Isolation**:
   - Hak akses tidak hanya dibatasi oleh **Role & Permission** (misal: `attendance.create`), tetapi juga dibatasi oleh **Data Scope**.
   - Tingkat Hirarki Scope:
     - `GLOBAL` (Super Admin, Ketua Yayasan): Akses lintas seluruh unit & lembaga.
     - `UNIT` (Kepala Sekolah, Bendahara Sekolah): Terisolasi pada unit tertentu (contoh: *SMA IT Utama*, *Pondok Pesantren*).
     - `DEPARTMENT` (Kabag Keuangan, Kasir TU): Terisolasi pada departemen/divisi (contoh: *Administrasi & Keuangan*).
     - `CLASS_BINAAN` (Guru Wali Kelas, Guru Mapel): Terisolasi pada kelas/rombel binaan (contoh: *Kelas X IPA 1*).
     - `INDIVIDUAL` (Pegawai/Siswa): Terisolasi pada data milik diri sendiri.

3. **Dynamic Evaluation & Live Switching**:
   - Dukungan **X-Preview-Role** dan **Scope Preview** di frontend & backend API untuk menguji visual UI & data scope tanpa perlu logout/login ulang.

---

## 2. DOMAIN ENTITIES & DATABASE SCHEMA STANDARD

```prisma
// Example Schema Representation for RBAC Scope Engine

model Role {
  id          String           @id @default(uuid())
  code        String           @unique // e.g. 'GURU', 'WALI_KELAS', 'PEGAWAI', 'BENDAHARA_SEKOLAH'
  name        String
  description String?
  isSystem    Boolean          @default(false)
  assignments RoleAssignment[]
  permissions RolePermission[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model RoleAssignment {
  id           String            @id @default(uuid())
  employeeId   String
  roleId       String
  unitId       String?           // Scope Unit (null = All Units)
  departmentId String?           // Scope Department
  classId      String?           // Scope Class/Rombel
  startDate    DateTime          @default(now())
  endDate      DateTime?
  isActive     Boolean           @default(true)
  role         Role              @relation(fields: [roleId], references: [id])
  scopes       ScopeAssignment[]
  createdAt    DateTime          @default(now())
}

model ScopeAssignment {
  id               String         @id @default(uuid())
  roleAssignmentId String
  scopeType        ScopeType      // GLOBAL | UNIT | DEPARTMENT | CLASS | SELF
  scopeValue       String         // ID Unit / ID Department / ID Rombel
  roleAssignment   RoleAssignment @relation(fields: [roleAssignmentId], references: [id])
}

enum ScopeType {
  GLOBAL
  UNIT
  DEPARTMENT
  CLASS
  SELF
}
```

---

## 3. SCOPE EVALUATION ALGORITHM & MATRIX

Saat API request atau navigasi UI dijalankan, RBAC Engine mengevaluasi kombinasi `(User, Role, Permission, TargetResource, ResourceScope)`:

```
                  ┌───────────────────────────────────┐
                  │ Request Context (User, Role, Path) │
                  └─────────────────┬─────────────────┘
                                    │
                        Is Role == SUPER_ADMIN ?
                       ┌────────────┴────────────┐
                      YES                        NO
                       │                         │
            ┌───────────────────┐     ┌──────────────────────┐
            │ Grant ALL Access  │     │ Evaluate Scope Rules │
            │ (GLOBAL SCOPE)    │     └──────────┬───────────┘
            └───────────────────┘                │
                                                 ▼
                                     ┌──────────────────────┐
                                     │ Check Role Assignment│
                                     │ & Permission Matrix  │
                                     └──────────┬───────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                            UNIT / DEPT Scope      CLASS / SELF Scope
                            (Filter Unit ID)      (Filter Class/User)
```

### Context Scope Matrix

| Role Code | Permitted Data Scope | Allowed UI Workspaces | Allowed Action Features |
|---|---|---|---|
| `SUPER_ADMIN` | `GLOBAL` | All Menus & System Settings | Full Create, Read, Update, Delete |
| `GURU` / `WALI_KELAS` | `CLASS` & `SELF` | Absensi Workspace, KBM, Input Nilai | Scan Barcode Siswa, Presensi Class Bulk, Self Check-In |
| `PEGAWAI` / `STAFF` | `SELF` | Absensi Workspace (Self), Pengajuan Izin | Self Check-In / Check-Out Direct, Form Izin |
| `BENDAHARA_SEKOLAH` | `UNIT` | Billing SPP, Keuangan, Payroll | Pembayaran, Rekap Keuangan Unit |
| `OPERATOR_SEKOLAH` | `UNIT` | Dapodik, Tata Usaha, Cetak Card | Manajemen Siswa & Pegawai Unit |

---

## 4. FRONTEND INTEGRATION & UI WORKFLOW

1. **Role Context Ingestion**:
   - Frontend membaca `user.role` dan `previewRole` dari `AuthContext`.
   - Mengaplikasikan `normalizeRole(previewRole || user.role)` untuk konsistensi nama role.

2. **Tab & Sub-Tab Scope Filtering**:
   - Menggunakan `visibleSubTabs` di `Attendance.tsx`, `Dashboard.tsx`, dan `Pegawai.tsx`.
   - Menghilangkan fitur yang tidak dimiliki oleh role tertentu (contoh: Karyawan/Pegawai tidak menampilkan Scan Barcode/QR Guru atau Guru Pengganti).

3. **Workspace Adaptation**:
   - `EnterpriseEmployeeAttendanceWorkspace.tsx` menyesuaikan komponen tombol aksi berdasarkan role aktif:
     - **Guru / Wali Kelas**: Menyediakan Scan Barcode Kartu Pelajar + Form Input Bulk Kelas.
     - **Pegawai / Staf**: Menyediakan Tombol Presensi Masuk/Pulang Mandiri + Pengajuan Izin.
     - **Siswa / Santri**: Menyediakan Status Kehadiran Terverifikasi (Diabsenkan oleh Guru).

---

## 5. REST API ENDPOINTS CONTRACT

```http
GET /api/rbac/roles
Header: Authorization: Bearer <token>
Response 200 OK:
{
  "success": true,
  "data": [
    { "id": "ROLE-01", "code": "GURU", "name": "Guru / Wali Kelas", "isSystem": true },
    { "id": "ROLE-02", "code": "PEGAWAI", "name": "Pegawai / Staf General", "isSystem": true }
  ]
}

POST /api/rbac/assignments
Header: Authorization: Bearer <token>
Content-Type: application/json
Body:
{
  "employeeId": "EMP-G01",
  "roleCode": "GURU",
  "scopeType": "UNIT",
  "scopeValue": "UNIT-SMA-IT"
}
Response 200 OK:
{
  "success": true,
  "message": "Penugasan role & scope RBAC berhasil disimpan"
}

POST /api/rbac/evaluate
Body:
{
  "userId": "EMP-G01",
  "requiredPermission": "attendance.bulk_student",
  "targetUnitId": "UNIT-SMA-IT"
}
Response 200 OK:
{
  "allowed": true,
  "scopeApplied": "UNIT-SMA-IT"
}
```

---

## 6. VERIFICATION & CERTIFICATION CHECKLIST

- [x] Multi-Role assignment terikat pada 1 ID Pegawai.
- [x] Scope data terisolasi secara akurat per Unit & Peran.
- [x] Fitur UI pada Absensi Workspace menyesuaikan hak akses per peran.
- [x] Fitur preview role switcher berfungsi instan di environment Dev & Preview.
- [x] Build TypeScript dan Linter terverifikasi 100% PASS.
