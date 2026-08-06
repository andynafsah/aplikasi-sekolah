import { Router } from 'express';
import { WhatsappController } from '../controllers/whatsapp.controller';
import { verifyJWT } from '../../server';

export const whatsappRoutes = Router();
const controller = new WhatsappController();

whatsappRoutes.post('/whatsappAccount', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('whatsappAccount', req, res, tenantId, authUser, username, role);
});
whatsappRoutes.post('/whatsappSend', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('whatsappSend', req, res, tenantId, authUser, username, role);
});

export async function handleWhatsapp(
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
