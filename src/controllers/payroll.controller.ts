import { Request, Response } from 'express';
import { BaseController } from '../core/base.controller';
import { logActivity } from '../../server';
import { PayrollRepository } from '../repositories/payroll.repository';
import { PayrollService } from '../services/payroll.service';
import { PayrollValidator } from '../validators/payroll.validator';
import { PayrollMapper } from '../mappers/payroll.mapper';

export class PayrollController extends BaseController {

  public async handle(
    action: string,
    req: Request,
    res: Response,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    const repo = new PayrollRepository();
    const service = new PayrollService(repo);

    switch (action) {
      // 1. Master Gaji
      case 'getMasters': {
        try {
          const data = await service.getMasters(tenantId);
          return res.json({ success: true, message: 'Success', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'saveMaster': {
        try {
          const valResult = PayrollValidator.validateSalaryMaster(req.body);
          if (!valResult.isValid) {
            return res.json({ success: false, message: valResult.message });
          }
          const data = await service.saveMaster(req.body, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Master Gaji', `Menyimpan master gaji karyawan ${req.body.employeeName}`);
          return res.json({ success: true, message: 'Master gaji berhasil disimpan!', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'importMasters': {
        try {
          const list = req.body.items || [];
          let imported = 0;
          for (const item of list) {
            const val = PayrollValidator.validateSalaryMaster(item);
            if (val.isValid) {
              await service.saveMaster(item, tenantId, authUser);
              imported++;
            }
          }
          logActivity(tenantId, authUser?.id || 'system', username, role, 'IMPORT', 'Master Gaji', `Mengimpor ${imported} data master gaji.`);
          return res.json({ success: true, message: `Berhasil mengimpor ${imported} data master gaji!` });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      // 2. Payroll Runs
      case 'getRuns': {
        const { period } = req.body;
        try {
          const data = await repo.getRuns(period, tenantId);
          const mapped = data.map(r => PayrollMapper.toSlipFormat(r));
          return res.json({ success: true, message: 'Success', data: mapped });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'calculatePeriod': {
        const { period } = req.body;
        if (!period) {
          return res.json({ success: false, message: 'Periode (YYYY-MM) wajib ditentukan.' });
        }
        try {
          const data = await service.calculatePeriodPayroll(period, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Payroll Engine', `Kalkulasi otomatis payroll bulanan periode ${period} selesai.`);
          const mapped = data.map(r => PayrollMapper.toSlipFormat(r));
          return res.json({ success: true, message: `Kalkulasi payroll periode ${period} berhasil diproses!`, data: mapped });
        } catch (err: any) {
          return res.json({ success: false, message: err.message });
        }
      }

      // 3. Approval Workflow steps
      case 'approvePeriod': {
        const { period, levelRole } = req.body;
        try {
          const result = await service.approvePayrollPeriod(period, levelRole || role, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'APPROVE', 'Payroll Workflow', `Pencairan gaji periode ${period} disetujui di tingkat ${levelRole || role}`);
          return res.json({ success: true, message: `Pencairan periode ${period} disetujui! Status berikutnya: ${result.nextStatus}`, data: result });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      // 4. Loans (Pinjaman)
      case 'getLoans': {
        try {
          const data = await service.getLoans(tenantId);
          return res.json({ success: true, message: 'Success', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'submitLoan': {
        try {
          const valResult = PayrollValidator.validateLoanApplication(req.body);
          if (!valResult.isValid) {
            return res.json({ success: false, message: valResult.message });
          }
          const data = await service.submitLoan(req.body, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Pinjaman Karyawan', `Pengajuan pinjaman baru senilai Rp ${Number(req.body.amount).toLocaleString('id-ID')} diajukan.`);
          return res.json({ success: true, message: 'Pengajuan pinjaman Anda berhasil dikirim ke Staff Keuangan.', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'approveLoan': {
        const { id, levelRole } = req.body;
        try {
          const data = await service.approveLoan(id, levelRole || role, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'APPROVE', 'Pinjaman Karyawan', `Menyetujui pinjaman karyawan ID: ${id}`);
          return res.json({ success: true, message: 'Persetujuan pinjaman berhasil dicatat!', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      // 5. Kasbon
      case 'getKasbons': {
        try {
          const data = await service.getKasbons(tenantId);
          return res.json({ success: true, message: 'Success', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'submitKasbon': {
        try {
          const valResult = PayrollValidator.validateKasbonApplication(req.body);
          if (!valResult.isValid) {
            return res.json({ success: false, message: valResult.message });
          }
          const data = await service.submitKasbon(req.body, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Kasbon Karyawan', `Pengajuan kasbon darurat senilai Rp ${Number(req.body.amount).toLocaleString('id-ID')} dikirim.`);
          return res.json({ success: true, message: 'Pengajuan kasbon darurat berhasil diajukan.', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      case 'approveKasbon': {
        const { id } = req.body;
        try {
          const data = await service.approveKasbon(id, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'APPROVE', 'Kasbon Karyawan', `Menyetujui kasbon karyawan ID: ${id}`);
          return res.json({ success: true, message: 'Kasbon berhasil disetujui & dicairkan!', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      // 6. THR
      case 'distributeThr': {
        try {
          const result = await service.distributeThr(req.body, tenantId, authUser);
          logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'THR Distribute', `Mendistribusikan tunjangan hari raya ke slip periode ${req.body.period}`);
          return res.json(result);
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      // 7. Audit Trail
      case 'getAuditLogs': {
        try {
          const data = await service.getAuditLogs(tenantId);
          return res.json({ success: true, message: 'Success', data });
        } catch (err: any) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }

      default:
        return res.status(404).json({ success: false, message: 'Action not found.' });
    }
  }
}
export default PayrollController;
