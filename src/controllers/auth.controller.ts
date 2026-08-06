import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';

export class AuthController extends BaseController {

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
  if (action === 'login') {
    const { email, password } = req.body;
    const user = DB.users.find(u => u.email === email && u.password === password && u.deleted_at === null);
    if (!user) {
      return res.json({ success: false, message: 'Email atau password salah' });
    }
    const tenant = DB.tenants.find(t => t.id === user.tenant_id);
    const jwt = generateJWT(user);
    logActivity(user.tenant_id, user.id, user.username, user.role, 'LOGIN', 'Authentication', `User logged in to ${tenant?.name}`);
    return res.json({
      success: true,
      message: 'Login sukses',
      data: {
        token: jwt,
        user: {
          id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
        tenant
      }
    });
  }

  if (action === 'register') {
    const { name, email, password, schoolName, schoolType } = req.body;
    const existingUser = DB.users.find(u => u.email === email && u.deleted_at === null);
    if (existingUser) {
      return res.json({ success: false, message: 'Alamat email sudah terdaftar' });
    }
    const tenantId = `tenant-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    const newTenant = {
      id: tenantId,
      name: schoolName || 'Sekolah Baru Custom',
      subdomain: (schoolName || 'sekolah-baru').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      type: schoolType || 'SEKOLAH',
      status: 'ACTIVE',
      address: 'Jl. Raya Pendidikan No. 1',
      phone: '08123456789',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: userId,
      updated_by: userId
    };
    DB.tenants.push(newTenant);
    const newUser = {
      id: userId,
      tenant_id: tenantId,
      email: email,
      username: email.split('@')[0],
      password: password,
      name: name || 'Kepala Sekolah Baru',
      role: 'SUPER_ADMIN',
      phone: '08123456789',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: 'system',
      updated_by: 'system'
    };
    DB.users.push(newUser);
    logActivity(tenantId, userId, newUser.username, 'SUPER_ADMIN', 'REGISTER', 'Authentication', `Registered new tenant ${schoolName} and admin account ${email}`);
    const jwt = generateJWT(newUser);
    return res.json({
      success: true,
      message: 'Registrasi sukses',
      data: {
        token: jwt,
        user: {
          id: newUser.id,
          tenant_id: newUser.tenant_id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone
        },
        tenant: newTenant
      }
    });
  }
  return null;
}
}
