import { Router } from 'express';
import { LegerController } from '../controllers/leger.controller';
import { verifyJWT } from '../../server';

export const legerRoutes = Router();
const controller = new LegerController();

legerRoutes.get('/', (req, res, next) => controller.index(req, res, next));
legerRoutes.get('/:id', (req, res, next) => controller.show(req, res, next));
legerRoutes.post('/', (req, res, next) => controller.store(req, res, next));
legerRoutes.put('/:id', (req, res, next) => controller.update(req, res, next));
legerRoutes.delete('/:id', (req, res, next) => controller.destroy(req, res, next));

legerRoutes.post('/action', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id || 'tenant-default';
  const username = authUser ? authUser.username : 'system';
  const role = authUser ? authUser.role : 'SUPER_ADMIN';
  const action = req.body.action || req.query.action || 'getLedgerDashboard';

  controller.handle(action, req, res, tenantId, authUser, username, role);
});

export async function handleLeger(
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
