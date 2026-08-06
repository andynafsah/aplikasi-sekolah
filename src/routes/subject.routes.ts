import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { verifyJWT } from '../../server';

export const subjectRoutes = Router();
const controller = new SubjectController();

subjectRoutes.post('/getCourses', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('getCourses', req, res, tenantId, authUser, username, role);
});

export async function handleSubject(
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
