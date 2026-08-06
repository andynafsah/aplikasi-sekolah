import { Router } from 'express';
import { AuthController } from '../auth/auth.controller';
import { verifyJWT } from '../../server';

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post('/login', (req, res, next) => controller.handle('login', req, res, '', null, '', ''));
authRoutes.post('/register', (req, res, next) => controller.handle('register', req, res, '', null, '', ''));

export async function handleAuth(
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
