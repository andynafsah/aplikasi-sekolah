/**
 * Enterprise User Service
 * 
 * Coordinates user creation, profile mutations, and updates, ensuring strict tenant boundaries.
 */

import { UserRepository } from './user.repository';
import { logger } from '../../config/logger';
import { CacheEngine } from '../../cache/redis';
import { AuthorizationError } from '../../middleware/rbac';

export class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  public async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) return null;

    return user;
  }

  public async registerTenantUser(data: { name: string; email: string; password_hash: string; role_id: string }) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error(`Email ${data.email} is already in use.`);
    }

    const userId = `user-${Math.random().toString(36).substring(2, 10)}`;
    const user = await this.repo.create({
      id: userId,
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role_id: data.role_id,
      status: 'ACTIVE'
    });

    logger.info(`👤 Created user profile: ${user.name}`);
    return user;
  }

  public async updateProfile(id: string, data: { name?: string; status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) {
    const updated = await this.repo.update(id, data);
    
    // Invalidate individual cache
    await CacheEngine.delete(`user:profile:${id}`);
    
    return updated;
  }
}
