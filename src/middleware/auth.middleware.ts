import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../security/jwt.service';
import { SessionService } from '../security/session.service';
import { PrismaEngine } from '../backend/database/prisma';
import { logActivity } from '../../server';

const jwtService = new JwtService();
const sessionService = new SessionService();

export interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    tenant_id: string;
    email: string;
    username: string;
    name: string;
    role: string;
  };
  sessionId?: string;
  cookies: any;
}

/**
 * authenticate middleware: checks for JWT access token in cookies, authorization headers, or request body.
 * Also validates the database-backed session for idle timeout/revocation.
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> {
  // Try cookie first (HttpOnly cookies), then Bearer Token in Authorization header, then body/query
  let token = req.cookies?.access_token || '';
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    token = req.body?.token || req.query?.token || '';
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi Anda tidak valid atau token otentikasi tidak ditemukan.'
    });
  }

  // Verify access token
  const payload = jwtService.verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Sesi telah berakhir atau token tidak valid. Silakan login kembali.'
    });
  }

  // Check active session tracking in DB
  const sessionId = req.cookies?.session_id || req.headers['x-session-id'] as string || req.body?.session_id;
  if (sessionId) {
    const isSessionActive = await sessionService.validateSession(sessionId, 30); // 30 minutes Idle Timeout
    if (!isSessionActive) {
      return res.status(401).json({
        success: false,
        message: 'Sesi login Anda telah berakhir (Idle Timeout atau dicabut dari perangkat lain).'
      });
    }
    req.sessionId = sessionId;
  }

  // Attach auth user payload to request
  req.authUser = payload;
  next();
}

/**
 * authorize middleware: checks if user has one of the allowed roles
 */
export function authorize(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.authUser) {
      return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    }

    if (allowedRoles.includes(req.authUser.role) || req.authUser.role === 'SUPER_ADMIN') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran Anda (${req.authUser.role}) tidak memiliki otoritas untuk modul ini.`
      });
    }
  };
}

/**
 * permission middleware: dynamically queries the database (no hardcoding) to check if the user has the required permission
 */
export function permission(requiredPermission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    if (!req.authUser) {
      return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    }

    try {
      // Query database for role permissions
      const userWithPermissions = await PrismaEngine.user.findFirst({
        where: { id: req.authUser.id },
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      const dbPermissions = userWithPermissions?.role?.role_permissions.map(rp => rp.permission.code) || [];

      if (
        userWithPermissions?.role?.code === 'SUPER_ADMIN' ||
        dbPermissions.includes('*') ||
        dbPermissions.includes(requiredPermission)
      ) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Akses ditolak. Anda tidak memiliki izin '${requiredPermission}' yang diperlukan.`
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat memeriksa perizinan.' });
    }
  };
}

/**
 * activityLogMiddleware: Automatically logs the request to the ActivityLog table in database
 */
export function activityLogMiddleware(moduleName: string, actionType: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (req.authUser && res.statusCode < 400) {
        logActivity(
          req.authUser.tenant_id,
          req.authUser.id,
          req.authUser.username,
          req.authUser.role,
          actionType,
          moduleName,
          `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
        );
      }
    });
    next();
  };
}

export default authenticate;

