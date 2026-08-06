# 73_ENTERPRISE_EMPLOYEE_ATTENDANCE_WORKSPACE.md
## Enterprise Employee Smart Attendance Workspace Engine

### 1. Overview & Architecture
Enterprise Employee Smart Attendance Workspace (`EnterpriseEmployeeAttendanceWorkspace.tsx`) is a production-ready, zero-hardcode attendance & HR management ecosystem. It seamlessly integrates:
- **Realtime Monitoring**: Live status tracking (Hadir Tepat Waktu, Terlambat, Izin/Sakit/Cuti, Belum Absen).
- **Check-In & Check-Out Terminal**: Supports Dynamic QR Code, GPS Geofencing, Face Verification Selfie, & Manual Supervisor Approval.
- **Multi-Level Approval Workflow (RBAC)**: Multi-stage approvals (Guru → Kepala TU → Kepala Sekolah → Yayasan).
- **Overtime & Payroll Engine Integration**: Automated overtime honor calculation (Rp 35.000/hour) and automatic late deduction calculation.
- **Export & Rekap Engine**: Print, PDF, & Excel (.xlsx) export functionality.
- **Shift & Calendar Engine**: Shift Pagi (07:00-15:30), Shift Malam (18:00-06:00), & Split Shift.

### 2. REST API Integration Points
- `POST /api/attendance/getAttendances` - Fetches live employee attendance records.
- `POST /api/attendance/checkIn` - Processes Check-In and Check-Out with GPS coordinates, method, & device details.
- `POST /api/attendance/getLeavePermissions` - Retrieves leave & permission requests.
- `POST /api/attendance/updateLeavePermission` - Submits and approves leave requests.
- `POST /api/attendance/getRules` & `saveRules` - Manages grace periods & late deduction penalty tiers.

### 3. Verification
Integrated directly inside `/src/pages/Attendance.tsx` under sub-tab **"Employee Attendance Workspace"**.
