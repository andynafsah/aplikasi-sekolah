import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { handleAuditActions } from '../lib/audit-server-data';
import { DB, logActivity, verifyJWT } from '../../server';

export class AuditController extends BaseController {
  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.body.token;
      const authUser = token ? verifyJWT(token) : null;
      if (!authUser) return this.badRequest(res, 'Sesi telah berakhir');
      const logs = DB.auditLogs.filter(l => l.tenant_id === authUser.tenant_id);
      return this.success(res, logs, 'Fetch audit logs successful');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.body.token;
      const authUser = token ? verifyJWT(token) : null;
      if (!authUser) return this.badRequest(res, 'Sesi telah berakhir');
      const log = DB.auditLogs.find(l => l.id === req.params.id && l.tenant_id === authUser.tenant_id);
      if (!log) return this.notFound(res, 'Audit log not found');
      return this.success(res, log, 'Audit log detail fetched');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Audit log cannot be created manually');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Audit logs cannot be updated');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Audit logs cannot be deleted');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.body.token;
      const authUser = token ? verifyJWT(token) : null;
      if (!authUser) return this.badRequest(res, 'Sesi telah berakhir');
      const q = (req.query.q || req.body.q || '').toString().toLowerCase();
      const logs = DB.auditLogs.filter(l => l.tenant_id === authUser.tenant_id && (l.username.toLowerCase().includes(q) || l.action.toLowerCase().includes(q)));
      return this.success(res, logs, 'Search successful');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Audit logs exported successfully');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Audit logs cannot be imported');
    } catch (error) {
      next(error);
    }
  }

  public async handle(
    action: string,
    req: any,
    res: any,
    next: NextFunction,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    try {
      return await handleAuditActions(action, req, res, tenantId, authUser, username, role, logActivity, DB);
    } catch (error) {
      next(error);
    }
  }
}
