import { Router } from 'express';
import { KbmController } from '../controllers/kbm.controller';
import { verifyJWT } from '../../server';

export const kbmRoutes = Router();
const controller = new KbmController();

kbmRoutes.all('/*', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || 'tenant-main');
  const username = authUser ? authUser.username : (req.body?.username || 'Ustadz Ahmad Ghozali, S.Pd.');
  const role = authUser ? authUser.role : (req.body?.role || 'SUPER_ADMIN');

  let action = req.query.action as string || req.body?.action;
  if (!action) {
    // Derive action from URL path e.g. /getKbmDashboard -> getKbmDashboard
    const parts = req.path.split('/').filter(Boolean);
    if (parts.length > 0) {
      action = parts[parts.length - 1];
    }
  }

  if (!action) {
    action = 'getKbmDashboard';
  }

  controller.handle(action, req, res, tenantId, authUser, username, role);
});

export async function handleKbm(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  return controller.handle(action, req, res, tenantId, authUser, username, role);
}
