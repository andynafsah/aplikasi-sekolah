/**
 * Fastify User Profile Controller
 * 
 * Exposes profile, administration, and team management endpoints.
 */

import { UserService } from './user.service';
import { buildRequestContext, enforcePermission } from '../../middleware/rbac';
import { validateBody, AuthValidationSchemas } from '../../middleware/validation';
import { logger } from '../../config/logger';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  /**
   * GET /api/v1/users/:id (Read individual profile)
   */
  public async handleGetProfile(userId: string, requestorUserId: string) {
    logger.info(`API Request: Get profile for User: ${userId}`);

    // Build authorization context
    const context = await buildRequestContext(requestorUserId);
    
    // Check if reading someone else's profile (requires privilege) or reading own profile
    if (userId !== requestorUserId) {
      await enforcePermission('user:read')(context);
    }

    const user = await this.service.getUserById(userId);
    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: 'User profile tidak ditemukan.'
      };
    }

    return {
      statusCode: 200,
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status
      }
    };
  }

  /**
   * POST /api/v1/users (Create team user)
   */
  public async handleCreateUser(requestorUserId: string, reqBody: any) {
    logger.info('API Request: Create User Profile');

    const context = await buildRequestContext(requestorUserId);
    await enforcePermission('user:create')(context);

    // Validate body
    const validated = validateBody(AuthValidationSchemas.registerUser)(reqBody);

    const user = await this.service.registerTenantUser({
      name: validated.name,
      email: validated.email,
      password_hash: validated.password, // Simulated encrypted hash
      role_id: validated.role_id
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Profil user baru berhasil didaftarkan.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    };
  }
}
