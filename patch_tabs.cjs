const fs = require('fs');
let code = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');

const newTabs = `  const allSubTabs: { id: AttendanceTab, label: string }[] = [
    { id: 'DASHBOARD', label: isTeacher ? 'Riwayat Kehadiran' : 'Dashboard' },
    { id: 'QR_BARCODE', label: 'Rekam Presensi' },
    { id: 'LEAVE_REQUEST', label: 'Izin & Cuti' },
    { id: 'MONITORING', label: 'Monitor Live' },
    { id: 'RULES', label: 'Pengaturan' }
  ];`;

code = code.replace(/const allSubTabs: \{ id: AttendanceTab, label: string \}\[\] = \[\s*\{[\s\S]*?\];/m, newTabs);

fs.writeFileSync('src/pages/Attendance.tsx', code, 'utf8');
console.log('Patched allSubTabs');
