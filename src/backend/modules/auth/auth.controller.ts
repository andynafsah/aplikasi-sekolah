/**
 * Fastify Authentication Controller
 * 
 * Directs secure session entries, token rotations, logouts, and token handshakes.
 */

import { AuthService } from './auth.service';
import { validateBody, AuthValidationSchemas } from '../../middleware/validation';
import { SecurityMiddleware } from '../../middleware/security';
import { logger } from '../../config/logger';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * POST /api/v1/auth/login (Establish session credentials)
   */
  public async handleLogin(reqBody: any, ip: string, userAgent?: string) {
    logger.info(`API Request: Login attempt from IP: ${ip}`);

    // Enforce Rate Limiting
    const rateCheck = SecurityMiddleware.evaluateRateLimit(ip);
    if (!rateCheck.allowed) {
      return {
        statusCode: 429,
        success: false,
        message: `Terlalu banyak permintaan login. Silakan coba lagi dalam ${Math.ceil(rateCheck.resetMs / 1000)} detik.`
      };
    }

    // Parse with Zod
    const validated = validateBody(AuthValidationSchemas.login)(reqBody);

    try {
      const { user, tokens } = await this.service.login({
        email: validated.email,
        password_raw: validated.password,
        rememberMe: validated.rememberMe,
        userAgent,
        ipAddress: ip
      });

      // Secure CSRF Token generation
      const csrfToken = `csrf-${tokens.refreshToken.substring(5, 12)}`;

      return {
        statusCode: 200,
        success: true,
        message: 'Login berhasil.',
        data: {
          user,
          tokens,
          csrfToken
        }
      };
    } catch (err: any) {
      return {
        statusCode: 401,
        success: false,
        message: err.message || 'Email atau password salah.'
      };
    }
  }

  /**
   * POST /api/v1/auth/refresh (Rotate Session and Token Credentials)
   */
  public async handleRefresh(reqBody: { refreshToken?: string }) {
    logger.info('API Request: Refresh Access Token');

    if (!reqBody.refreshToken) {
      return {
        statusCode: 400,
        success: false,
        message: 'Refresh token tidak ditemukan.'
      };
    }

    try {
      const tokens = await this.service.refreshAccessToken(reqBody.refreshToken);
      const csrfToken = `csrf-${tokens.refreshToken.substring(5, 12)}`;

      return {
        statusCode: 200,
        success: true,
        data: {
          tokens,
          csrfToken
        }
      };
    } catch (err: any) {
      return {
        statusCode: 401,
        success: false,
        message: err.message || 'Sesi tidak valid atau kedaluwarsa.'
      };
    }
  }

  /**
   * POST /api/v1/auth/logout (Revoke credentials)
   */
  public async handleLogout(reqBody: { refreshToken?: string }) {
    logger.info('API Request: Revoke Session');

    if (!reqBody.refreshToken) {
      return {
        statusCode: 400,
        success: false,
        message: 'Refresh token diperlukan untuk memproses logout.'
      };
    }

    const revoked = await this.service.logout(reqBody.refreshToken);
    
    return {
      statusCode: 200,
      success: true,
      message: revoked ? 'Sesi berhasil dinonaktifkan.' : 'Sesi sudah kedaluwarsa atau tidak aktif.'
    };
  }
}
export const AuthRouteController = new AuthController();
export default AuthRouteController;
