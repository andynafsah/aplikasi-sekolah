import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { logActivity } from '../../server';
import { PrismaEngine } from '../backend/database/prisma';

export class FinanceController extends BaseController {

  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    const tId = tenantId || 'tenant-1';
    
    try {
      switch (action) {
        case 'getCashTransactions': {
          const transactions = await PrismaEngine.accountingTransaction.findMany({
            where: { tenant_id: tId, doc_type: { in: ['CASH', 'KAS', 'KAS_KECIL'] }, deleted_at: null }
          });
          return res.json({ success: true, message: 'Success', data: transactions });
        }

        case 'getLedgerEntries': {
          const entries = await PrismaEngine.journalItem.findMany({
            // We need the COA code for the UI
          });
          
          // Fetch all COAs to map codes
          const coas = await PrismaEngine.cOA.findMany({ where: { tenant_id: tId } });
          const coaMap = new Map(coas.map(c => [c.id, c.code]));

          const mapped = entries.map(e => ({
            ...e,
            tenant_id: tId,
            account_code: coaMap.get(e.coa_id) || e.coa_id
          }));
          return res.json({ success: true, message: 'Success', data: mapped });
        }

        case 'getCOAs': {
          const list = await PrismaEngine.cOA.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          
          // Seed if empty (Enterprise standard)
          if (list.length === 0) {
            const seedCoas = [
              { code: '11101', name: 'Kas Utama', category: 'ASET', normal_balance: 'DEBIT' },
              { code: '12101', name: 'Bank Utama', category: 'ASET', normal_balance: 'DEBIT' },
              { code: '41101', name: 'Pendapatan SPP', category: 'PENDAPATAN', normal_balance: 'KREDIT' },
              { code: '51101', name: 'Beban Gaji', category: 'BEBAN', normal_balance: 'DEBIT' }
            ];
            for (const c of seedCoas) {
              await PrismaEngine.cOA.create({ data: { ...c, tenant_id: tId } });
            }
            const newList = await PrismaEngine.cOA.findMany({ where: { tenant_id: tId, deleted_at: null } });
            return res.json({ success: true, data: newList });
          }
          
          return res.json({ success: true, data: list });
        }

        case 'saveCOA': {
          const { id, code, name, category, sub_account, normal_balance, active, is_header, parent_id } = req.body;
          const status = active === false ? 'INACTIVE' : 'ACTIVE';
          
          if (id) {
            await PrismaEngine.cOA.update({
              where: { id },
              data: { code, name, category, normal_balance, is_header, parent_id, status, updated_at: new Date() }
            });
          } else {
            await PrismaEngine.cOA.create({
              data: { tenant_id: tId, code, name, category, normal_balance, is_header, parent_id, status }
            });
          }
          logActivity(tId, authUser.id, username, role, 'SAVE', 'FINANCE', `Menyimpan COA: ${name}`);
          return res.json({ success: true, message: 'COA saved' });
        }

        case 'getBankAccounts': {
          const list = await PrismaEngine.bankAccount.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          // Map status to active for UI compatibility
          const mapped = list.map(b => ({ ...b, active: b.status === 'ACTIVE' }));
          return res.json({ success: true, data: mapped });
        }

        case 'saveBankAccount': {
          const { id, name, bank_name, account_number, account_holder, balance, active } = req.body;
          const status = active === false ? 'INACTIVE' : 'ACTIVE';

          if (id) {
            await PrismaEngine.bankAccount.update({
              where: { id },
              data: { name, bank_name, account_number, account_holder, balance: Number(balance), status, updated_at: new Date() }
            });
          } else {
            await PrismaEngine.bankAccount.create({
              data: { tenant_id: tId, name, bank_name, account_number, account_holder, balance: Number(balance), status }
            });
          }
          return res.json({ success: true, message: 'Bank account saved' });
        }

        case 'createAccountingTransaction': {
          const { date, type, doc_type, amount, description, coa_debit, coa_kredit } = req.body;
          
          // Find COA IDs by Code
          const coas = await PrismaEngine.cOA.findMany({
            where: { tenant_id: tId, code: { in: [coa_debit, coa_kredit] } }
          });
          const debitCoa = coas.find(c => c.code === coa_debit);
          const kreditCoa = coas.find(c => c.code === coa_kredit);

          if (!debitCoa || !kreditCoa) {
            return res.status(400).json({ success: false, message: 'Invalid COA code(s)' });
          }

          const transaction = await PrismaEngine.accountingTransaction.create({
            data: {
              tenant_id: tId,
              date: new Date(date),
              type,
              doc_type,
              total_amount: Number(amount),
              description,
              ref_no: `TX-${Date.now()}`,
              status: 'POSTED',
              created_by: username
            }
          });

          // Auto-Journal logic
          const jv = await PrismaEngine.journalVoucher.create({
            data: {
              tenant_id: tId,
              voucher_no: `JV-${Date.now()}`,
              date: new Date(date),
              description: `Auto: ${description}`,
              is_auto: true,
              status: 'POSTED'
            }
          });

          await PrismaEngine.journalItem.createMany({
            data: [
              { journal_voucher_id: jv.id, coa_id: debitCoa.id, debit: Number(amount), credit: 0, description },
              { journal_voucher_id: jv.id, coa_id: kreditCoa.id, debit: 0, credit: Number(amount), description }
            ]
          });

          logActivity(tId, authUser.id, username, role, 'CREATE', 'FINANCE', `Transaksi ${type} Rp ${amount}`);
          return res.json({ success: true, message: 'Transaction created and journaled' });
        }

        case 'getJournalVouchers': {
          const list = await PrismaEngine.journalVoucher.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }

        case 'getBudgetRealizations': {
          const list = await PrismaEngine.budgetPlan.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }

        case 'getReconciliations': {
          const list = await PrismaEngine.bankReconciliation.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }

        case 'getAccountingClosings': {
          const list = await PrismaEngine.accountingClosing.findMany({
            where: { tenant_id: tId }
          });
          return res.json({ success: true, data: list });
        }

        case 'getAccountingApprovals': {
          const list = await PrismaEngine.accountingApproval.findMany({
            where: { tenant_id: tId }
          });
          return res.json({ success: true, data: list });
        }

        default:
          return null;
      }
    } catch (error: any) {
      console.error('Finance Controller Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
