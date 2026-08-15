import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { verifyJWT } from '../../server';

export const deviceRoutes = Router();
const controller = new NotificationController();

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token || req.query.token as string;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
  req.authUser = decoded;
  req.tenantId = decoded.tenant_id || 'system';
  next();
};

// POST /api/v1/devices/register
deviceRoutes.post('/register', authMiddleware, (req, res, next) => {
  controller.registerDevice(req, res, next);
});

// DELETE /api/v1/devices/:id
deviceRoutes.delete('/:id', authMiddleware, (req, res, next) => {
  controller.unregisterDevice(req, res, next);
});

export default deviceRoutes;
