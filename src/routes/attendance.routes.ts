import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { verifyJWT } from '../../server';

export const attendanceRoutes = Router();
const controller = new AttendanceController();

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

attendanceRoutes.post('/getAttendances', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getAttendances', req, res, tenantId, authUser, username, role);
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
