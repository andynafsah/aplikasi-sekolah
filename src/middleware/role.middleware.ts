import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { RbacService } from '../rbac/rbac.service';
import { logActivity } from '../../server';

const rbacService = new RbacService();

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const user = req.authUser;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Otorisasi diperlukan.'
      });
    }

    const normalizedUserRole = rbacService.normalizeRole(user.role);
    const normalizedAllowedRoles = allowedRoles.map(r => rbacService.normalizeRole(r));

    if (normalizedUserRole === 'SUPER_ADMIN' || normalizedAllowedRoles.includes(normalizedUserRole)) {
      return next();
    }

    // Log unauthorized attempt to audit logs
    logActivity(
      user.tenant_id,
      user.id,
      user.username,
      user.role,
      'PERMISSION_DENIED',
      'Security Access Control',
      `Mencoba mengakses rute terproteksi role [${allowedRoles.join(', ')}]`
    );

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Peran Anda (${user.role}) tidak diizinkan mengakses halaman ini.`
    });
  };
}

export default roleMiddleware;
