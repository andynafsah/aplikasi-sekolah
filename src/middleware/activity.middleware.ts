import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logActivity } from '../../server';

export function activityMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = req.authUser;
  if (user) {
    const method = req.method;
    const url = req.originalUrl;
    const action = req.query?.action || req.body?.action || 'index';

    // Log modification operations (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      logActivity(
        user.tenant_id,
        user.id,
        user.username,
        user.role,
        method,
        'User Activity Tracing',
        `Menjalankan instruksi [${method}] pada endpoint ${url} - Action: ${action}`
      );
    }
  }
  next();
}

export default activityMiddleware;
