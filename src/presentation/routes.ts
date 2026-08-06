import { AppRouter } from './router';
import { authController, SecurityMiddlewares } from '../modules/auth/auth.skeleton';

// 1. Register Public Auth Routes
AppRouter.post('/api/v1/auth/login', (req) => authController.handleLogin(req));

// 2. Register Protected Auth Routes with Middlewares
AppRouter.post(
  '/api/v1/auth/logout',
  (req) => authController.handleLogout(req),
  [SecurityMiddlewares.resolveTenant, SecurityMiddlewares.requireAuth]
);

// 3. Register a protected tenant resource test route as a demo
AppRouter.get(
  '/api/v1/tenant/profile',
  (req) => {
    return {
      statusCode: 200,
      success: true,
      message: 'Konteks data tenant berhasil diverifikasi.',
      data: {
        activeTenantId: req.tenantId,
        requestor: req.user,
        serverTime: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  },
  [SecurityMiddlewares.resolveTenant, SecurityMiddlewares.requireAuth]
);

export const RegisteredRoutes = AppRouter;
export default RegisteredRoutes;
