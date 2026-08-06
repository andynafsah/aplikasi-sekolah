import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { verifyJWT } from '../../server';

export const documentRoutes = Router();
const controller = new DocumentController();

documentRoutes.post('/documentUpload', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('documentUpload', req, res, tenantId, authUser, username, role);
});

export async function handleDocument(
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
