import { Router, Request, Response } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { verifyJWT } from '../../server';

export const auditRoutes = Router();
const controller = new AuditController();

function extractAuth(req: Request) {
  const token = req.headers.authorization?.split(' ')[1] || (req.query.token as string) || (req.body?.token as string);
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser?.tenant_id || 'tenant-1';
  const username = authUser?.username || authUser?.name || 'Administrator';
  const role = (authUser?.role || 'SUPER_ADMIN').toUpperCase();
  return { tenantId, authUser, username, role };
}

// 1. Audit Dashboard & KPI Cockpit
auditRoutes.get('/dashboard', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditDashboard', req, res, next, tenantId, authUser, username, role);
});

// 2. Audit Trail Logs (with multi-domain filters & pagination)
auditRoutes.get('/logs', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditLogList', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/events', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditEventList', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/history', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditHistory', req, res, next, tenantId, authUser, username, role);
});

// 3. Security Events & Active Sessions
auditRoutes.get('/security', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('securityEvents', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/sessions', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditSession', req, res, next, tenantId, authUser, username, role);
});

// 4. Exceptions & Internal Control
auditRoutes.get('/exceptions', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditExceptionList', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/exceptions', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditExceptionCreate', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/exceptions/:id/resolve', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  req.body = { ...(req.body || {}), exception_id: req.params.id };
  await controller.handle('auditExceptionResolve', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/internal-control', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('internalControl', req, res, next, tenantId, authUser, username, role);
});

// 5. Compliance & Frameworks
auditRoutes.get('/compliance', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('complianceFramework', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/compliance', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('complianceFramework', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/compliance/assessment', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('complianceAssessment', req, res, next, tenantId, authUser, username, role);
});

// 6. Risk Management & Corrective Actions
auditRoutes.get('/risks', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('riskManagement', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/risks', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('riskManagement', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/corrective-actions', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('correctiveAction', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/corrective-actions', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('correctiveAction', req, res, next, tenantId, authUser, username, role);
});

// 7. Hash Chain Tamper Detection & Retention Policies
auditRoutes.get('/verify-chain', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('verifyHashChain', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/verify-chain', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('verifyHashChain', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/retention', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('retentionPolicy', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/retention', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('retentionPolicy', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/retention/run-archive', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('runRetentionJob', req, res, next, tenantId, authUser, username, role);
});

// 8. Exports & Formal Reports
auditRoutes.post('/export', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditExport', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/reports', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditReport', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.post('/reports', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('auditReport', req, res, next, tenantId, authUser, username, role);
});

auditRoutes.get('/executive', async (req: Request, res: Response, next) => {
  const { tenantId, authUser, username, role } = extractAuth(req);
  await controller.handle('executiveAudit', req, res, next, tenantId, authUser, username, role);
});
