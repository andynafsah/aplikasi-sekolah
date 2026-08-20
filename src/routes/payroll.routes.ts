import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { verifyJWT } from '../../server';

export const payrollRoutes = Router();
const controller = new PayrollController();

payrollRoutes.post('/getMasters', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getMasters', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/saveMaster', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('saveMaster', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/importMasters', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('importMasters', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/getRuns', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getRuns', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/calculatePeriod', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('calculatePeriod', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/approvePeriod', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('approvePeriod', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/getLoans', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getLoans', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/submitLoan', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('submitLoan', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/approveLoan', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('approveLoan', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/getKasbons', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getKasbons', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/submitKasbon', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('submitKasbon', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/approveKasbon', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('approveKasbon', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/distributeThr', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('distributeThr', req, res, tenantId, authUser, username, role);
});

payrollRoutes.post('/getAuditLogs', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getAuditLogs', req, res, tenantId, authUser, username, role);
});

export async function handlePayroll(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  const payrollActionMap: Record<string, string> = {
    payrollMasterList: 'getMasters',
    getPayrollMasters: 'getMasters',
    savePayrollMaster: 'saveMaster',
    importPayrollMasters: 'importMasters',
    getPayrollRuns: 'getRuns',
    runPayroll: 'calculatePeriod',
    calculatePayroll: 'calculatePeriod',
    approvePayroll: 'approvePeriod',
    payrollLoanList: 'getLoans',
    submitPayrollLoan: 'submitLoan',
    approvePayrollLoan: 'approveLoan',
    payrollKasbonList: 'getKasbons',
    submitPayrollKasbon: 'submitKasbon',
    approvePayrollKasbon: 'approveKasbon',
    payrollAuditLogs: 'getAuditLogs'
  };

  const resolvedAction = payrollActionMap[action] || action;
  return controller.handle(resolvedAction, req, res, tenantId, authUser, username, role);
}

export default payrollRoutes;
