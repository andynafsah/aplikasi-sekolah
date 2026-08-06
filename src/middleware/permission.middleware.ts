import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { RbacService } from '../rbac/rbac.service';
import { logActivity } from '../../server';

const rbacService = new RbacService();

export function permissionMiddleware(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const user = req.authUser;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Otorisasi diperlukan.'
      });
    }

    const hasAccess = rbacService.hasPermission(user.role, requiredPermission);
    if (hasAccess) {
      return next();
    }

    // Log permission failure to security audits
    logActivity(
      user.tenant_id,
      user.id,
      user.username,
      user.role,
      'PERMISSION_DENIED',
      'Security Access Control',
      `Percobaan gagal mengakses fitur dengan kode izin: "${requiredPermission}"`
    );

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Anda tidak memiliki hak izin melakukan operasi ini (${requiredPermission}).`
    });
  };
}

export default permissionMiddleware;
