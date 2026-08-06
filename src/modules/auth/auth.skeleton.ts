import { z } from 'zod';
import { BaseService } from '../../application/service.base';
import { BaseController } from '../../presentation/controller.base';
import { BaseValidator } from '../../application/validator.base';
import { IApiResponse } from '../../application/dto.base';
import { AuthError, ValidationError } from '../../core/error-handler';
import { RouterRequest, RouterResponse } from '../../presentation/router';
import { container } from '../../core/di';

// ==========================================
// 1. AUTH DTOS & SCHEMAS
// ==========================================
export const loginSchema = z.object({
  email: BaseValidator.common.email,
  password: z.string().min(6, { message: 'Password minimal harus terdiri dari 6 karakter' }),
  tenantId: BaseValidator.common.tenantId,
});

export type LoginRequestDto = z.infer<typeof loginSchema>;

export interface SessionUserDto {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'GURU' | 'SISWA';
  tenantId: string;
}

export interface LoginResponseDto {
  user: SessionUserDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==========================================
// 2. AUTH REPOSITORY CONTRACT
// ==========================================
export interface IAuthRepository {
  findUserByEmail(email: string, tenantId: string): Promise<SessionUserDto | null>;
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  revokeRefreshToken(token: string): Promise<void>;
  isRefreshTokenValid(token: string): Promise<boolean>;
}

// Sandbox/Mock implementation for preview-safe bootstrap
export class AuthRepositoryMock implements IAuthRepository {
  private activeTokens = new Set<string>();

  public async findUserByEmail(email: string, tenantId: string): Promise<SessionUserDto | null> {
    // Reusable mock auth database resolver
    if (email.endsWith('@erp.com') || email.endsWith('@gmail.com')) {
      return {
        id: 'usr-9281-auth',
        email,
        name: email.split('@')[0].toUpperCase(),
        role: 'ADMIN',
        tenantId,
      };
    }
    return null;
  }

  public async saveRefreshToken(userId: string, token: string): Promise<void> {
    this.activeTokens.add(token);
  }

  public async revokeRefreshToken(token: string): Promise<void> {
    this.activeTokens.delete(token);
  }

  public async isRefreshTokenValid(token: string): Promise<boolean> {
    return this.activeTokens.has(token);
  }
}

// ==========================================
// 3. AUTH SERVICE
// ==========================================
export class AuthService extends BaseService {
  private authRepo: IAuthRepository;

  constructor(authRepo: IAuthRepository = new AuthRepositoryMock()) {
    super('AuthService');
    this.authRepo = authRepo;
  }

  public async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.executeSafe('login', async () => {
      // Validate input constraints
      const validated = BaseValidator.validate(loginSchema, dto);

      const user = await this.authRepo.findUserByEmail(validated.email, validated.tenantId);
      if (!user) {
        throw new AuthError('Kombinasi email, password, atau ID Tenant tidak ditemukan.');
      }

      // Reusable simulated JWT payload signature tokens
      const accessToken = `jwt-access-token.${btoa(JSON.stringify(user))}.signature`;
      const refreshToken = `jwt-refresh-token.${btoa(JSON.stringify({ userId: user.id }))}.signature`;

      await this.authRepo.saveRefreshToken(user.id, refreshToken, new Date(Date.now() + 7 * 86400 * 1000));

      this.log.info(`User authenticated successfully: [${user.email}] under tenant [${user.tenantId}]`);

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      };
    });
  }

  public async logout(refreshToken: string): Promise<void> {
    return this.executeSafe('logout', async () => {
      await this.authRepo.revokeRefreshToken(refreshToken);
      this.log.debug('Session token revoked and cleared.');
    });
  }
}

// ==========================================
// 4. AUTH CONTROLLER
// ==========================================
export class AuthController extends BaseController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    super('AuthController');
    this.authService = authService;
  }

  public async handleLogin(req: RouterRequest): Promise<IApiResponse<LoginResponseDto>> {
    return this.handleRequest(async () => {
      const dto = req.body;
      const result = await this.authService.login(dto);
      return this.sendCreated(result, 'Autentikasi berhasil, token sesi diterbitkan.');
    });
  }

  public async handleLogout(req: RouterRequest): Promise<IApiResponse<{ success: boolean }>> {
    return this.handleRequest(async () => {
      const { refreshToken } = req.body || {};
      if (!refreshToken) {
        throw new ValidationError('Token refresh diperlukan untuk melakukan logout.');
      }
      await this.authService.logout(refreshToken);
      return this.sendSuccess({ success: true }, 'Sesi berhasil diakhiri.');
    });
  }
}

// ==========================================
// 5. SECURITY & TENANT ROUTE MIDDLEWARES
// ==========================================
export class SecurityMiddlewares {
  /**
   * Middleware to authorize JWT credentials and populates req.user
   */
  public static async requireAuth(req: RouterRequest, res: RouterResponse): Promise<void> {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.send({
        success: false,
        message: 'Token sesi otorisasi tidak valid atau hilang.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    try {
      // Decode mock bearer
      const payloadPart = token.split('.')[1];
      if (!payloadPart) throw new Error();
      
      const payload = JSON.parse(atob(payloadPart));
      req.user = payload;
    } catch {
      res.statusCode = 401;
      res.send({
        success: false,
        message: 'Token sesi otorisasi kedaluwarsa atau rusak.',
      });
    }
  }

  /**
   * Middleware to enforce Saas Tenancy validation and scope req.tenantId
   */
  public static async resolveTenant(req: RouterRequest, res: RouterResponse): Promise<void> {
    const tenantHeader = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];

    if (!tenantHeader) {
      res.statusCode = 400;
      res.send({
        success: false,
        message: 'Akses ditolak. Header X-Tenant-ID wajib disertakan untuk melakukan rujukan data.',
      });
      return;
    }

    req.tenantId = String(tenantHeader);
  }
}

// Instantiate core dependencies
export const authRepositoryMock = new AuthRepositoryMock();
export const authService = new AuthService(authRepositoryMock);
export const authController = new AuthController(authService);

// Register within the global Dependency Container (DI Ready)
container.register('IAuthRepository', authRepositoryMock);
container.register('AuthService', authService);
container.register('AuthController', authController);
