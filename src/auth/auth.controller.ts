import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { AuthService } from './auth.service';

export class AuthController extends BaseController {
  private readonly authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Universal action routing endpoint for compatibility with standard action post gateways
   */
  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    try {
      const sessionMeta = {
        ip: req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      };

      switch (action) {
        case 'login': {
          const { email, password, username: usr, phone, nis, nip, niy, rememberMe, singleLogin } = req.body;
          const identifier = email || usr || phone || nis || nip || niy || '';
          
          if (!identifier || !password) {
            return res.json({ success: false, message: 'Identitas login dan kata sandi wajib diisi' });
          }

          const result = await this.authService.login(identifier, password, !!rememberMe, sessionMeta, !!singleLogin);
          if (result.success && result.data) {
            const expiryDays = rememberMe ? 30 : 1;
            res.cookie('access_token', result.data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: expiryDays * 24 * 60 * 60 * 1000
            });
            res.cookie('refresh_token', result.data.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: expiryDays * 24 * 60 * 60 * 1000
            });
            res.cookie('session_id', result.data.session_id, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: expiryDays * 24 * 60 * 60 * 1000
            });
          }
          return res.json(result);
        }

        case 'register': {
          const { name, email, password, schoolName, schoolType } = req.body;
          if (!email || !password || !schoolName) {
            return res.json({ success: false, message: 'Email, password, dan nama instansi wajib diisi' });
          }

          const result = await this.authService.register(name, email, password, schoolName, schoolType);
          if (result.success && result.data) {
            res.cookie('access_token', result.data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 1 * 24 * 60 * 60 * 1000
            });
            res.cookie('refresh_token', result.data.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000
            });
          }
          return res.json(result);
        }

        case 'refresh_token': {
          const refresh_token = req.body?.refresh_token || req.cookies?.refresh_token;
          if (!refresh_token) {
            return res.json({ success: false, message: 'Refresh token diperlukan' });
          }
          const result = await this.authService.refreshAccessToken(refresh_token);
          if (result.success && result.data?.token) {
            res.cookie('access_token', result.data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 1 * 24 * 60 * 60 * 1000
            });
          }
          return res.json(result);
        }

        case 'logout': {
          const { refresh_token, session_id } = req.body;
          const rToken = refresh_token || req.cookies?.refresh_token;
          const sId = session_id || req.cookies?.session_id;
          const result = await this.authService.logout(rToken, sId);
          res.clearCookie('access_token');
          res.clearCookie('refresh_token');
          res.clearCookie('session_id');
          return res.json(result);
        }

        case 'logout_all_devices': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const result = await this.authService.logoutAllDevices(authUser.id, tenantId, username, role);
          return res.json(result);
        }

        case 'forgot_password': {
          const { email: forgotEmail, username: forgotUsr } = req.body;
          const identifier = forgotEmail || forgotUsr;
          if (!identifier) {
            return res.json({ success: false, message: 'Email atau username wajib diisi' });
          }
          const result = await this.authService.forgotPassword(identifier);
          return res.json(result);
        }

        case 'reset_password': {
          const { reset_token, password } = req.body;
          if (!reset_token || !password) {
            return res.json({ success: false, message: 'Token reset dan password baru wajib diisi' });
          }
          const result = await this.authService.resetPassword(reset_token, password);
          return res.json(result);
        }

        case 'change_password': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const { old_password, new_password } = req.body;
          if (!old_password || !new_password) {
            return res.json({ success: false, message: 'Password lama dan password baru wajib diisi' });
          }
          const result = await this.authService.changePassword(authUser.id, old_password, new_password);
          return res.json(result);
        }

        case 'force_change_password': {
          const { user_id, new_password } = req.body;
          if (!user_id || !new_password) {
            return res.json({ success: false, message: 'User ID dan password baru wajib diisi' });
          }
          const result = await this.authService.forcePasswordChange(user_id, new_password);
          return res.json(result);
        }

        case 'admin_unlock_account': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const { user_id } = req.body;
          if (!user_id) {
            return res.json({ success: false, message: 'User ID wajib disertakan' });
          }
          const result = await this.authService.adminUnlock(user_id, authUser.id, username, role, tenantId);
          return res.json(result);
        }

        case 'update_profile': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const result = await this.authService.updateProfile(authUser.id, req.body);
          return res.json(result);
        }

        case 'get_profile': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const user = await this.authService.updateProfile(authUser.id, {});
          return res.json(user);
        }

        case 'create_user_account': {
          if (!authUser) return res.status(401).json({ success: false, message: 'Sesi tidak sah' });
          const { name, email, username, password, role, tenantId } = req.body;
          if (!name || !email || !username || !password || !role) {
            return res.json({ success: false, message: 'Data akun tidak lengkap' });
          }
          const result = await this.authService.createUser(name, email, username, password, role, tenantId || tenantId || authUser.tenant_id);
          return res.json(result);
        }

        default:
          return null; // Delegate back if no action matched
      }
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Terjadi kesalahan sistem internal' });
    }
  }
}

export default AuthController;
