import { Router } from 'express';
import { LegerController } from '../controllers/leger.controller';
import { verifyJWT } from '../../server';

export const legerRoutes = Router();
const controller = new LegerController();

// Legacy CRUD
legerRoutes.get('/', (req, res, next) => controller.index(req, res, next));
legerRoutes.get('/:id', (req, res, next) => controller.show(req, res, next));
legerRoutes.post('/', (req, res, next) => controller.store(req, res, next));
legerRoutes.put('/:id', (req, res, next) => controller.update(req, res, next));
legerRoutes.delete('/:id', (req, res, next) => controller.destroy(req, res, next));

// Gateway Action Dispatcher
legerRoutes.post('/action', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id || 'tenant-default';
  const username = authUser ? authUser.username : 'system';
  const role = authUser ? authUser.role : 'SUPER_ADMIN';
  const action = req.body.action || req.query.action || 'getLedgerDashboard';

  controller.handle(action, req, res, tenantId, authUser, username, role);
});

// Explicit REST API Endpoints according to Spec
legerRoutes.get('/dashboard', (req, res) => handleLeger('getAssessmentDashboard', req, res));
legerRoutes.get('/assessment-types', (req, res) => handleLeger('getAssessmentTypes', req, res));
legerRoutes.put('/assessment-types', (req, res) => handleLeger('updateAssessmentType', req, res));

legerRoutes.get('/assessments', (req, res) => handleLeger('getAssessments', req, res));
legerRoutes.post('/assessments', (req, res) => handleLeger('createAssessment', req, res));
legerRoutes.put('/assessments', (req, res) => handleLeger('updateAssessment', req, res));
legerRoutes.delete('/assessments', (req, res) => handleLeger('deleteAssessment', req, res));

legerRoutes.get('/scores', (req, res) => handleLeger('getScores', req, res));
legerRoutes.post('/scores', (req, res) => handleLeger('saveScores', req, res));
legerRoutes.post('/scores/clear', (req, res) => handleLeger('clearScores', req, res));
legerRoutes.post('/scores/import', (req, res) => handleLeger('importScores', req, res));

legerRoutes.get('/grading-rules', (req, res) => handleLeger('getGradingRules', req, res));
legerRoutes.post('/grading-rules', (req, res) => handleLeger('saveGradingRule', req, res));

legerRoutes.get('/kkm-rules', (req, res) => handleLeger('getKKMRules', req, res));
legerRoutes.post('/kkm-rules', (req, res) => handleLeger('saveKKMRule', req, res));

legerRoutes.get('/grade-scales', (req, res) => handleLeger('getGradeScales', req, res));
legerRoutes.post('/grade-scales', (req, res) => handleLeger('saveGradeScale', req, res));

legerRoutes.get('/remedial', (req, res) => handleLeger('getRemedialList', req, res));
legerRoutes.post('/remedial', (req, res) => handleLeger('saveRemedial', req, res));

legerRoutes.get('/class-ledger', (req, res) => handleLeger('getClassLedger', req, res));
legerRoutes.get('/student-ledger', (req, res) => handleLeger('getStudentLedger', req, res));
legerRoutes.get('/subject-ledger', (req, res) => handleLeger('getSubjectLedger', req, res));
legerRoutes.get('/rankings', (req, res) => handleLeger('getRankings', req, res));

legerRoutes.post('/submit', (req, res) => handleLeger('submitAssessment', req, res));
legerRoutes.post('/review', (req, res) => handleLeger('reviewAssessment', req, res));
legerRoutes.post('/approve', (req, res) => handleLeger('approveAssessment', req, res));
legerRoutes.post('/lock', (req, res) => handleLeger('lockLedger', req, res));
legerRoutes.post('/unlock', (req, res) => handleLeger('unlockLedger', req, res));
legerRoutes.post('/publish', (req, res) => handleLeger('publishLedger', req, res));

legerRoutes.get('/monitoring', (req, res) => handleLeger('getMonitoring', req, res));
legerRoutes.get('/snapshots', (req, res) => handleLeger('getLegerSnapshots', req, res));
legerRoutes.post('/snapshots', (req, res) => handleLeger('generateLegerSnapshot', req, res));
legerRoutes.get('/audit-logs', (req, res) => handleLeger('getAuditLogs', req, res));

export async function handleLeger(
  action: string,
  req: any,
  res: any,
  tenantId?: string,
  authUser?: any,
  username?: string,
  role?: string
): Promise<any> {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const user = authUser || (token ? verifyJWT(token) : null);
  const tid = tenantId || user?.tenant_id || req.body?.tenant_id || 'tenant-default';
  const uname = username || user?.username || 'system';
  const rle = role || user?.role || 'SUPER_ADMIN';

  return controller.handle(action, req, res, tid, user, uname, rle);
}
