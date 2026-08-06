import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';

export class DashboardController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method');
    } catch (error) {
      next(error);
    }
  }


  public async handle(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  switch (action) {
    case 'getAuditLogs': {
      const logs = DB.auditLogs.filter(log => log.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: logs });
    }

    case 'dashboardList': {
      const templates = DB.dwDashboardTemplates;
            const shares = DB.dwDashboardShares.filter((s: any) => s.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: { templates, shares } });
    }

    case 'dashboardShare': {
      const { title, expiration_date, access_level } = req.body;
            const share = {
              id: `share-${Date.now()}`,
              tenant_id: tenantId,
              title: title || 'Laporan Eksekutif Baru',
              share_token: `token_${Math.random().toString(16).substr(2, 8)}`,
              expiration_date: expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              access_level: access_level || 'READ_ONLY',
              views_count: 0,
              is_active: true,
              created_at: new Date().toISOString()
            };
            DB.dwDashboardShares.unshift(share);
      
            logActivity(tenantId, authUser.id, username, role, 'DASHBOARD_SHARE', 'Business Intelligence', `Created public share for dashboard: "${share.title}"`);
            return res.json({ success: true, message: 'Link dashboard berhasil dibagikan.', data: share });
    }

    case 'executiveCockpit': {
      const factsAcad = DB.dwFactAcademic.filter((f: any) => f.tenant_id === tenantId);
            const factsFin = DB.dwFactFinance.filter((f: any) => f.tenant_id === tenantId);
            const factsAtt = DB.dwFactAttendance.filter((f: any) => f.tenant_id === tenantId);
            const factsPay = DB.dwFactPayroll.filter((f: any) => f.tenant_id === tenantId);
      
            const totalRevenue = factsFin.reduce((sum: number, f: any) => sum + f.collected_amount, 0);
            const targetRevenue = factsFin.reduce((sum: number, f: any) => sum + f.billing_amount, 0);
            const collectionRate = targetRevenue > 0 ? parseFloat(((totalRevenue / targetRevenue) * 100).toFixed(1)) : 95.2;
      
            const avgAttendance = factsAtt.length > 0 
              ? parseFloat((factsAtt.reduce((sum: number, f: any) => sum + f.attendance_rate, 0) / factsAtt.length).toFixed(1)) 
              : 94.8;
      
            const avgGrade = factsAcad.length > 0 
              ? parseFloat((factsAcad.reduce((sum: number, f: any) => sum + f.grade_average, 0) / factsAcad.length).toFixed(1)) 
              : 84.5;
      
            const activeStudentsCount = DB.dwDimStudent.filter((s: any) => s.tenant_id === tenantId && s.status === 'ACTIVE').length;
      
            return res.json({
              success: true,
              message: 'Success',
              data: {
                metrics: {
                  revenue: { value: totalRevenue, target: targetRevenue, unit: 'IDR', status: 'ON_TRACK' },
                  collection: { value: collectionRate, target: 98.0, unit: '%', status: 'ON_TRACK' },
                  attendance: { value: avgAttendance, target: 95.0, unit: '%', status: 'ON_TRACK' },
                  graduationReady: { value: 100, target: 100, unit: '%', status: 'EXCELLENT' },
                  retention: { value: 98.4, target: 99.0, unit: '%', status: 'ON_TRACK' },
                  dropout: { value: 0.8, target: 1.0, unit: '%', status: 'EXCELLENT' },
                  teacherPerformance: { value: 87.5, target: 90.0, unit: 'Points', status: 'ON_TRACK' },
                  studentPerformance: { value: avgGrade, target: 80.0, unit: '%', status: 'EXCELLENT' }
                },
                summary: {
                  totalStudents: activeStudentsCount,
                  totalStaff: DB.dwDimEmployee.filter((e: any) => e.tenant_id === tenantId).length,
                  martsReady: DB.dwDataMarts.filter((m: any) => m.tenant_id === tenantId && m.status === 'READY').length,
                  etlJobsActive: DB.dwEtlJobs.filter((j: any) => j.tenant_id === tenantId && j.is_active).length,
                  qualityCheckStatus: DB.dwQualityChecks.filter((c: any) => c.tenant_id === tenantId && c.status === 'WARNING').length > 0 ? 'WARNING' : 'PASSED'
                }
              }
            });
    }

    default:
      return null;
  }
}
}
