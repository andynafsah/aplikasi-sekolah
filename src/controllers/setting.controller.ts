import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { handleSettingsActions } from '../lib/settings-server-data';
import { DB, logActivity, verifyJWT } from '../../server';

export class SettingController extends BaseController {
  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.body.token;
      const authUser = token ? verifyJWT(token) : null;
      if (!authUser) return this.badRequest(res, 'Sesi telah berakhir');
      const settings = DB.brandings.find(b => b.tenant_id === authUser.tenant_id);
      return this.success(res, settings, 'Settings fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.index(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.update(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.body.token;
      const authUser = token ? verifyJWT(token) : null;
      if (!authUser) return this.badRequest(res, 'Sesi telah berakhir');
      const idx = DB.brandings.findIndex(b => b.tenant_id === authUser.tenant_id);
      if (idx !== -1) {
        DB.brandings[idx] = { ...DB.brandings[idx], ...req.body, updated_at: new Date().toISOString() };
        return this.updated(res, DB.brandings[idx], 'Settings updated');
      }
      return this.badRequest(res, 'Settings branding not found');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.badRequest(res, 'Cannot delete settings');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.index(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Settings exported successfully');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Settings imported successfully');
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
      return await handleSettingsActions(action, req, res, tenantId, authUser, username, role, logActivity, DB);
    } catch (error) {
      next(error);
    }
  }
}
