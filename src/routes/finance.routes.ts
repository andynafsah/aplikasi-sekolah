import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { verifyJWT } from '../../server';

export const financeRoutes = Router();
const controller = new FinanceController();

const wrapAction = (actionName: string) => (req: any, res: any) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id);
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  return controller.handle(actionName, req, res, tenantId, authUser, username, role);
};

// Map routes
financeRoutes.post('/getCashTransactions', wrapAction('getCashTransactions'));
financeRoutes.post('/getAccountingTransactions', wrapAction('getAccountingTransactions'));
financeRoutes.post('/getLedgerEntries', wrapAction('getLedgerEntries'));
financeRoutes.post('/getCOAs', wrapAction('getCOAs'));
financeRoutes.post('/saveCOA', wrapAction('saveCOA'));
financeRoutes.post('/getBankAccounts', wrapAction('getBankAccounts'));
financeRoutes.post('/saveBankAccount', wrapAction('saveBankAccount'));
financeRoutes.post('/createAccountingTransaction', wrapAction('createAccountingTransaction'));
financeRoutes.post('/getJournalVouchers', wrapAction('getJournalVouchers'));
financeRoutes.post('/createJournalVoucher', wrapAction('createJournalVoucher'));
financeRoutes.post('/transferBetweenAccounts', wrapAction('transferBetweenAccounts'));
financeRoutes.post('/getBudgetRealizations', wrapAction('getBudgetRealizations'));
financeRoutes.post('/getReconciliations', wrapAction('getReconciliations'));
financeRoutes.post('/createReconciliation', wrapAction('createReconciliation'));
financeRoutes.post('/autoMatchReconciliation', wrapAction('autoMatchReconciliation'));
financeRoutes.post('/getAccountingClosings', wrapAction('getAccountingClosings'));
financeRoutes.post('/performClosing', wrapAction('performClosing'));
financeRoutes.post('/getAccountingApprovals', wrapAction('getAccountingApprovals'));
financeRoutes.post('/submitAccountingApproval', wrapAction('submitAccountingApproval'));

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
