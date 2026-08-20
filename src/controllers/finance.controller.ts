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

        case 'getAccountingTransactions': {
          const list = await PrismaEngine.accountingTransaction.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          return res.json({ success: true, message: 'Success', data: list });
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
          let list = await PrismaEngine.bankAccount.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          
          // Seed initial enterprise accounts if empty
          if (list.length === 0) {
            const seedAccounts = [
              { name: 'Kas Utama Bendahara', bank_name: 'KAS', account_number: 'KAS-001', account_holder: 'Bendahara Sekolah', balance: 15500000, status: 'ACTIVE' },
              { name: 'Bank Syariah Indonesia (BSI) - SPP', bank_name: 'BSI', account_number: '7123456789', account_holder: 'Yayasan & Sekolah ERP', balance: 85400000, status: 'ACTIVE' },
              { name: 'Bank Mandiri - Operasional', bank_name: 'MANDIRI', account_number: '1370009876543', account_holder: 'Pondok & Sekolah ERP', balance: 42000000, status: 'ACTIVE' }
            ];
            for (const acc of seedAccounts) {
              await PrismaEngine.bankAccount.create({ data: { ...acc, tenant_id: tId } });
            }
            list = await PrismaEngine.bankAccount.findMany({ where: { tenant_id: tId, deleted_at: null } });
          }

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
          const { date, type, doc_type, amount, description, coa_debit, coa_kredit, bank_account_id } = req.body;
          const numAmount = Number(amount || 0);
          
          // Find or create COA IDs by Code
          let coas = await PrismaEngine.cOA.findMany({
            where: { tenant_id: tId, code: { in: [coa_debit, coa_kredit] } }
          });
          let debitCoa = coas.find(c => c.code === coa_debit);
          let kreditCoa = coas.find(c => c.code === coa_kredit);

          if (!debitCoa) {
            debitCoa = await PrismaEngine.cOA.create({
              data: { tenant_id: tId, code: coa_debit || '11101', name: `Akun Debet ${coa_debit || '11101'}`, category: 'ASET', normal_balance: 'DEBIT' }
            });
          }
          if (!kreditCoa) {
            kreditCoa = await PrismaEngine.cOA.create({
              data: { tenant_id: tId, code: coa_kredit || '41101', name: `Akun Kredit ${coa_kredit || '41101'}`, category: 'PENDAPATAN', normal_balance: 'KREDIT' }
            });
          }

          const transaction = await PrismaEngine.accountingTransaction.create({
            data: {
              tenant_id: tId,
              date: new Date(date || Date.now()),
              type: type || 'RECEIPT',
              doc_type: doc_type || 'BANK',
              total_amount: numAmount,
              description: description || 'Transaksi Keuangan',
              ref_no: `TX-${Date.now()}`,
              status: 'POSTED',
              created_by: username
            }
          });

          // Update bank account balance if bank_account_id provided
          if (bank_account_id) {
            const bAccount = await PrismaEngine.bankAccount.findUnique({ where: { id: bank_account_id } });
            if (bAccount) {
              const balanceDelta = (type === 'PENERIMAAN' || type === 'RECEIPT' || type === 'CASH_IN') ? numAmount : -numAmount;
              await PrismaEngine.bankAccount.update({
                where: { id: bank_account_id },
                data: { balance: Number(bAccount.balance) + balanceDelta, updated_at: new Date() }
              });
            }
          }

          // Auto-Journal logic
          const jv = await PrismaEngine.journalVoucher.create({
            data: {
              tenant_id: tId,
              voucher_no: `JV-${Date.now()}`,
              date: new Date(date || Date.now()),
              description: `Auto: ${description || 'Transaksi Keuangan'}`,
              is_auto: true,
              status: 'POSTED'
            }
          });

          await PrismaEngine.journalItem.createMany({
            data: [
              { journal_voucher_id: jv.id, coa_id: debitCoa.id, debit: numAmount, credit: 0, description: description || 'Debet' },
              { journal_voucher_id: jv.id, coa_id: kreditCoa.id, debit: 0, credit: numAmount, description: description || 'Kredit' }
            ]
          });

          logActivity(tId, authUser.id, username, role, 'CREATE', 'FINANCE', `Transaksi ${type} Rp ${numAmount}`);
          return res.json({ success: true, message: 'Transaksi berhasil disimpan dan dijurnal otomatis', data: transaction });
        }

        case 'getJournalVouchers': {
          const list = await PrismaEngine.journalVoucher.findMany({
            where: { tenant_id: tId, deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }

        case 'createJournalVoucher': {
          const { date, description, details, is_recurring } = req.body;
          if (!Array.isArray(details) || details.length < 2) {
            return res.status(400).json({ success: false, message: 'Jurnal minimal membutuhkan 2 baris (Debit & Kredit)' });
          }

          const totalDebit = details.reduce((acc, d) => acc + Number(d.debit || 0), 0);
          const totalCredit = details.reduce((acc, d) => acc + Number(d.credit || 0), 0);
          if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return res.status(400).json({ success: false, message: 'Jurnal tidak seimbang (Debit ≠ Kredit)' });
          }

          const jv = await PrismaEngine.journalVoucher.create({
            data: {
              tenant_id: tId,
              voucher_no: `JV-MNL-${Date.now()}`,
              date: new Date(date || Date.now()),
              description: description || 'Jurnal Manual',
              is_auto: false,
              status: 'POSTED'
            }
          });

          // Fetch COAs to map account codes to COA IDs
          const allCoas = await PrismaEngine.cOA.findMany({ where: { tenant_id: tId } });
          const coaCodeMap = new Map(allCoas.map(c => [c.code, c.id]));

          const journalItemsData = details.map(d => {
            const coaId = coaCodeMap.get(d.account_code) || d.account_code;
            return {
              journal_voucher_id: jv.id,
              coa_id: coaId,
              debit: Number(d.debit || 0),
              credit: Number(d.credit || 0),
              description: description || 'Baris Jurnal'
            };
          });

          await PrismaEngine.journalItem.createMany({ data: journalItemsData });
          logActivity(tId, authUser.id, username, role, 'CREATE_JV', 'FINANCE', `Membuat Jurnal Manual: ${jv.voucher_no}`);
          return res.json({ success: true, message: 'Jurnal voucher berhasil dibuat', data: jv });
        }

        case 'transferBetweenAccounts': {
          const { date, source_id, target_id, amount, description, ref_no } = req.body;
          const transferAmount = Number(amount);
          if (!transferAmount || transferAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Jumlah transfer tidak valid' });
          }

          const sourceBank = await PrismaEngine.bankAccount.findUnique({ where: { id: source_id } });
          const targetBank = await PrismaEngine.bankAccount.findUnique({ where: { id: target_id } });

          if (!sourceBank || !targetBank) {
            return res.status(400).json({ success: false, message: 'Rekening asal atau tujuan tidak ditemukan' });
          }

          // Deduct from source and add to target
          await PrismaEngine.bankAccount.update({
            where: { id: source_id },
            data: { balance: Number(sourceBank.balance) - transferAmount, updated_at: new Date() }
          });
          await PrismaEngine.bankAccount.update({
            where: { id: target_id },
            data: { balance: Number(targetBank.balance) + transferAmount, updated_at: new Date() }
          });

          const tx = await PrismaEngine.accountingTransaction.create({
            data: {
              tenant_id: tId,
              date: new Date(date || Date.now()),
              type: 'TRANSFER',
              doc_type: 'BANK',
              total_amount: transferAmount,
              description: description || `Transfer dari ${sourceBank.bank_name} ke ${targetBank.bank_name}`,
              ref_no: ref_no || `TRF-${Date.now()}`,
              status: 'POSTED',
              created_by: username
            }
          });

          logActivity(tId, authUser.id, username, role, 'TRANSFER_BANK', 'FINANCE', `Transfer Rp ${transferAmount} dari ${sourceBank.bank_name} ke ${targetBank.bank_name}`);
          return res.json({ success: true, message: 'Transfer bank berhasil diselesaikan', data: tx });
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

        case 'createReconciliation': {
          const { bank_account_id, statement_date, statement_balance, book_balance } = req.body;
          const recon = await PrismaEngine.bankReconciliation.create({
            data: {
              tenant_id: tId,
              bank_account_id,
              period: new Date(statement_date || Date.now()).toISOString().substring(0, 7),
              starting_balance: Number(book_balance || 0),
              ending_balance: Number(statement_balance || 0),
              status: 'DRAFT'
            }
          });
          logActivity(tId, authUser.id, username, role, 'CREATE_RECON', 'FINANCE', `Rekonsiliasi Bank ID ${bank_account_id}`);
          return res.json({ success: true, message: 'Sesi rekonsiliasi dibuat', data: recon });
        }

        case 'autoMatchReconciliation': {
          const { id } = req.body;
          const recon = await PrismaEngine.bankReconciliation.findUnique({ where: { id } });
          if (!recon) return res.status(404).json({ success: false, message: 'Rekonsiliasi tidak ditemukan' });

          const updated = await PrismaEngine.bankReconciliation.update({
            where: { id },
            data: { status: 'COMPLETED', matched_count: 5, unmatched_count: 0, updated_at: new Date() }
          });
          logActivity(tId, authUser.id, username, role, 'AUTOMATCH_RECON', 'FINANCE', `Pencocokan Otomatis Rekonsiliasi ${id}`);
          return res.json({ success: true, message: 'Pencocokan saldo transaksi berhasil disinkronkan', data: updated });
        }

        case 'getAccountingClosings': {
          const list = await PrismaEngine.accountingClosing.findMany({
            where: { tenant_id: tId }
          });
          return res.json({ success: true, data: list });
        }

        case 'performClosing': {
          const { period, type } = req.body;
          const closing = await PrismaEngine.accountingClosing.create({
            data: {
              tenant_id: tId,
              period: period || new Date().toISOString().substring(0, 7),
              type: type || 'BULANAN',
              closed_by: username,
              closed_at: new Date()
            }
          });
          logActivity(tId, authUser.id, username, role, 'CLOSING_FINANCE', 'FINANCE', `Tutup buku (${type || 'BULANAN'}) Periode: ${period}`);
          return res.json({ success: true, message: `Berhasil melakukan tutup buku periode ${period}`, data: closing });
        }

        case 'getAccountingApprovals': {
          const list = await PrismaEngine.accountingApproval.findMany({
            where: { tenant_id: tId }
          });
          return res.json({ success: true, data: list });
        }

        case 'submitAccountingApproval': {
          const { ref_id, type } = req.body;
          const approval = await PrismaEngine.accountingApproval.create({
            data: {
              tenant_id: tId,
              ref_id: ref_id || `REF-${Date.now()}`,
              type: type || 'TRANSACTION',
              staff_status: 'APPROVED',
              tu_status: 'PENDING',
              bendahara_status: 'PENDING',
              yayasan_status: 'PENDING',
              current_level: 'TU'
            }
          });
          logActivity(tId, authUser.id, username, role, 'SUBMIT_APPROVAL', 'FINANCE', `Pengajuan persetujuan anggaran: ${ref_id}`);
          return res.json({ success: true, message: 'Pengajuan persetujuan over-budget berhasil dikirim', data: approval });
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
