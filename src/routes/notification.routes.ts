import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { verifyJWT } from '../../server';

export const notificationRoutes = Router();
const controller = new NotificationController();

notificationRoutes.post('/announcementCreate', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('announcementCreate', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/announcementPublish', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('announcementPublish', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/broadcastCreate', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('broadcastCreate', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/broadcastSend', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('broadcastSend', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/automationRule', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('automationRule', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/deliveryStatistic', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('deliveryStatistic', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/notificationProvider', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('notificationProvider', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/notificationTemplate', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('notificationTemplate', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/notificationQueue', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('notificationQueue', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/notificationSend', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('notificationSend', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/notificationRetry', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('notificationRetry', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/emailSend', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('emailSend', req, res, tenantId, authUser, username, role);
});
notificationRoutes.post('/pushSend', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('pushSend', req, res, tenantId, authUser, username, role);
});

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

// GET /api/v1/notifications
notificationRoutes.get('/', authMiddleware, (req, res, next) => {
  controller.index(req, res, next);
});

// GET /api/v1/notifications/unread-count
notificationRoutes.get('/unread-count', authMiddleware, (req, res, next) => {
  controller.unreadCount(req, res, next);
});

// GET /api/v1/notifications/:id
notificationRoutes.get('/:id', authMiddleware, (req, res, next) => {
  controller.show(req, res, next);
});

// POST /api/v1/notifications/:id/read
notificationRoutes.post('/:id/read', authMiddleware, (req, res, next) => {
  controller.markAsRead(req, res, next);
});

// POST /api/v1/notifications/read-all
notificationRoutes.post('/read-all', authMiddleware, (req, res, next) => {
  controller.markAllAsRead(req, res, next);
});

// DELETE /api/v1/notifications/:id
notificationRoutes.delete('/:id', authMiddleware, (req, res, next) => {
  controller.destroy(req, res, next);
});

export async function handleNotification(
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
