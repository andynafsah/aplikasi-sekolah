import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { verifyJWT } from '../../server';

export const financeRoutes = Router();
const controller = new FinanceController();

financeRoutes.post('/getCashTransactions', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getCashTransactions', req, res, tenantId, authUser, username, role);
});
financeRoutes.post('/getLedgerEntries', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getLedgerEntries', req, res, tenantId, authUser, username, role);
});

export async function handleFinance(
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
