const fs = require('fs');
let code = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');

const newVisible = `  const visibleSubTabs = allSubTabs.filter(tab => {
    if (isSuperAdmin) return true;
    if (isTeacher) {
      return ['DASHBOARD', 'QR_BARCODE', 'LEAVE_REQUEST'].includes(tab.id);
    }
    if (isTreasurer) {
      return ['DASHBOARD', 'LEAVE_REQUEST', 'MONITORING'].includes(tab.id);
    }
    if (isOperator) {
      return ['DASHBOARD', 'MONITORING', 'LEAVE_REQUEST', 'QR_BARCODE'].includes(tab.id);
    }
    if (isStudentOrParent) {
      return ['DASHBOARD', 'LEAVE_REQUEST', 'QR_BARCODE'].includes(tab.id);
    }
    if (isEmployee) {
      return ['DASHBOARD', 'LEAVE_REQUEST', 'QR_BARCODE'].includes(tab.id);
    }
    return ['DASHBOARD'].includes(tab.id);
  });`;

code = code.replace(/const visibleSubTabs = allSubTabs\.filter\(tab => \{[\s\S]*?\}\);/m, newVisible);

fs.writeFileSync('src/pages/Attendance.tsx', code, 'utf8');
console.log('Patched visibleSubTabs');
