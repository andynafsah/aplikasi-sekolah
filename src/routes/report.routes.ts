import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { verifyJWT } from '../../server';

export const reportRoutes = Router();
const controller = new ReportController();

const extractAuthInfo = (req: any) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'tenant-1');
  const username = authUser ? authUser.username : (req.headers['x-user-name'] as string || 'system');
  const role = (req.headers['x-preview-role'] as string) || (authUser ? authUser.role : 'SUPER_ADMIN');
  return { tenantId, authUser, username, role };
};

// GET and POST /student
reportRoutes.get('/student', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportStudent', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/student', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportStudent', req, res, tenantId, authUser, username, role);
});

// GET and POST /employee
reportRoutes.get('/employee', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportEmployee', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/employee', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportEmployee', req, res, tenantId, authUser, username, role);
});

// GET and POST /attendance
reportRoutes.get('/attendance', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportAttendance', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/attendance', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('getReportAttendance', req, res, tenantId, authUser, username, role);
});

// GET and POST /download
reportRoutes.get('/download', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('downloadReport', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/download', async (req, res) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  await controller.handle('downloadReport', req, res, tenantId, authUser, username, role);
});

reportRoutes.post('/getBooks', (req, res, next) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  controller.handle('getBooks', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/getInventoryItems', (req, res, next) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  controller.handle('getInventoryItems', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/getInfractions', (req, res, next) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  controller.handle('getInfractions', req, res, tenantId, authUser, username, role);
});
reportRoutes.post('/getAchievements', (req, res, next) => {
  const { tenantId, authUser, username, role } = extractAuthInfo(req);
  controller.handle('getAchievements', req, res, tenantId, authUser, username, role);
});

export async function handleReport(
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

