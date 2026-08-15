import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { ScheduleController } from '../controllers/schedule.controller';
import { verifyJWT } from '../../server';

export const attendanceRoutes = Router();
const controller = new AttendanceController();
const scheduleController = new ScheduleController();

// Schedule and Working Calendar Endpoints (Spec 150)
attendanceRoutes.get('/schedules', (req, res) => scheduleController.getSchedules(req, res));
attendanceRoutes.post('/schedules', (req, res) => scheduleController.createSchedule(req, res));
attendanceRoutes.put('/schedules/:id', (req, res) => scheduleController.updateSchedule(req, res));
attendanceRoutes.delete('/schedules/:id', (req, res) => scheduleController.deleteSchedule(req, res));

attendanceRoutes.get('/calendars', (req, res) => scheduleController.getCalendars(req, res));
attendanceRoutes.post('/calendars', (req, res) => scheduleController.createCalendar(req, res));
attendanceRoutes.put('/calendars/:id', (req, res) => scheduleController.updateCalendar(req, res));
attendanceRoutes.delete('/calendars/:id', (req, res) => scheduleController.deleteCalendar(req, res));

attendanceRoutes.get('/holidays', (req, res) => scheduleController.getHolidays(req, res));
attendanceRoutes.post('/holidays', (req, res) => scheduleController.createHoliday(req, res));
attendanceRoutes.put('/holidays/:id', (req, res) => scheduleController.updateHoliday(req, res));
attendanceRoutes.delete('/holidays/:id', (req, res) => scheduleController.deleteHoliday(req, res));

attendanceRoutes.get('/overrides', (req, res) => scheduleController.getOverrides(req, res));
attendanceRoutes.post('/overrides', (req, res) => scheduleController.createOverride(req, res));
attendanceRoutes.put('/overrides/:id', (req, res) => scheduleController.updateOverride(req, res));
attendanceRoutes.delete('/overrides/:id', (req, res) => scheduleController.deleteOverride(req, res));

attendanceRoutes.get('/assignments', (req, res) => scheduleController.getAssignments(req, res));
attendanceRoutes.post('/assignments', (req, res) => scheduleController.createAssignment(req, res));
attendanceRoutes.delete('/assignments/:id', (req, res) => scheduleController.deleteAssignment(req, res));

attendanceRoutes.get('/my-schedule/today', (req, res) => scheduleController.getMyTodaySchedule(req, res));
attendanceRoutes.get('/conflicts', (req, res) => scheduleController.getConflictReport(req, res));

// Helper to extract authentication context
function getAuthContext(req: any) {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(String(token)) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  return { authUser, tenantId, username, role };
}

// Smart Attendance Core Endpoints (Section 52)
attendanceRoutes.post('/student/scan', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('studentScan', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/student/manual', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('studentManual', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/employee/gps', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('employeeGps', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/employee/qr', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('employeeQr', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/summary', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getSummaryReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/students', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getStudentReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/employees', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getEmployeeReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/teachers', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getTeacherReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/late', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getLateReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/absence', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getAbsenceReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/gates', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getGateReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/qr', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getQrReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/gps', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getGpsReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/manual', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getManualReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/corrections', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getCorrectionReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/audit', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getAuditReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/export', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('exportReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/exports/:id', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getExportJobDetail', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/exports', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getExportHistory', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports/download', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('exportReport', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/reports', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getAttendanceReports', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/gate/stats', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getGateStats', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/location/points', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  const action = req.method === 'POST' ? 'saveLocationPoint' : (req.method === 'DELETE' ? 'deleteLocationPoint' : 'getLocationPoints');
  controller.handle(action, req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/correction/request', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('requestCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/correction/approve', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('approveCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/my', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getMyCorrections', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id/submit', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('submitCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id/review', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('reviewCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id/approve', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('approveCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id/reject', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('rejectCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id/cancel', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('cancelCorrection', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections/:id', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getCorrectionDetail', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/corrections', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle(req.method === 'POST' ? 'requestCorrection' : 'getCorrections', req, res, tenantId, authUser, username, role);
});

// Enterprise QR Security Engine REST API Endpoints
attendanceRoutes.all('/qr', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getAttendanceQr', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/scan', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('scanAttendanceQr', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/history', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getAttendanceHistory', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('verifyAttendanceQr', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/qrSettings', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  const action = req.method === 'POST' ? 'saveQrSettings' : 'getQrSettings';
  controller.handle(action, req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/getAttendances', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getAttendances', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/dashboard', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getDashboard', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/activity', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getLiveActivity', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/securityAlerts', (req, res) => {
  const { authUser, tenantId, username, role } = getAuthContext(req);
  controller.handle('getSecurityAlerts', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/checkIn', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('checkIn', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/check-in', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('checkIn', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/checkOut', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('checkOut', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/check-out', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('checkOut', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/today', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(String(token)) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('today', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/myHistory', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(String(token)) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('myHistory', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/manualRequest', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('manualRequest', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/manual-request', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('manualRequest', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/submitLeave', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('submitLeave', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.all('/report', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(String(token)) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'school-main');
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('report', req, res, tenantId, authUser, username, role);
});

attendanceRoutes.post('/smartAttendance', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('smartAttendance', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/getRules', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getRules', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/saveRules', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('saveRules', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/getReplacements', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getReplacements', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/saveReplacement', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('saveReplacement', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/getGeofences', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getGeofences', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/saveGeofence', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('saveGeofence', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/importAttendances', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('importAttendances', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/getLeavePermissions', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getLeavePermissions', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/updateLeavePermission', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('updateLeavePermission', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingJoin', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingJoin', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingAttendance', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingAttendance', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingRecording', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingRecording', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingChat', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingChat', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingPoll', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingPoll', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingQuiz', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingQuiz', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingWhiteboard', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingWhiteboard', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingAnalytics', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingAnalytics', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/breakoutRoom', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('breakoutRoom', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/waitingRoom', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('waitingRoom', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/raiseHand', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('raiseHand', req, res, tenantId, authUser, username, role);
});
attendanceRoutes.post('/meetingNotification', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('meetingNotification', req, res, tenantId, authUser, username, role);
});

export async function handleAttendance(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  return controller.handle(action, req, res, tenantId, authUser, username, role);
}
