import { PrismaEngine } from '../backend/database/prisma';

// Memory tracker for failed logins to avoid database bloat and schema dependencies
const failedLoginsMap = new Map<string, { attempts: number; lockUntil: Date | null }>();

export class AuthRepository {
  private prisma = PrismaEngine;

  /**
   * Universal user search supporting multiple identifier modes
   */
  public async findUserByIdentifier(identifier: string, tenantId?: string): Promise<any | null> {
    const cleanId = identifier.trim().toLowerCase();

    // Query MySQL directly via Prisma
    let user = await this.prisma.user.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { username: cleanId },
          { email: cleanId },
          { phone: cleanId }
        ]
      },
      include: {
        role: {
          include: {
            role_permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      try {
        const physicalCount = await this.prisma.user.count();
        if (physicalCount === 0) {
          console.log('[AUTH REPO] Physical user table is empty. Auto-seeding from in-memory fallback list...');
          const { inMemoryDb } = await import('../backend/database/prisma');
          
          // Seed roles first
          for (const roleData of inMemoryDb.role) {
            await this.prisma.role.upsert({
              where: { code: roleData.code },
              update: {},
              create: {
                id: roleData.id,
                name: roleData.name,
                code: roleData.code
              }
            });
          }
          
          // Seed users
          for (const userData of inMemoryDb.user) {
            const { role, ...userDataClean } = userData;
            await this.prisma.user.upsert({
              where: { email: userDataClean.email },
              update: {},
              create: userDataClean
            });
          }
          
          // Query again
          user = await this.prisma.user.findFirst({
            where: {
              deleted_at: null,
              OR: [
                { username: cleanId },
                { email: cleanId },
                { phone: cleanId }
              ]
            },
            include: {
              role: {
                include: {
                  role_permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          });
        } else {
          // Fall back to in-memory fallback cache if user is defined in seed lists but not physical table
          const { inMemoryDb } = await import('../backend/database/prisma');
          const mockUser = inMemoryDb.user.find((u: any) => 
            u.username.toLowerCase() === cleanId || 
            u.email.toLowerCase() === cleanId
          );
          if (mockUser) {
            user = mockUser;
          }
        }
      } catch (err: any) {
        console.error('[AUTH REPO] Failed to check/seed physical user table:', err.message);
      }
    }

    if (!user) return null;

    // Map to the legacy field name user.password expected by other auth components
    return {
      ...user,
      password: user.password_hash,
      role: user.role?.code || 'GURU'
    };
  }

  /**
   * Retrieves a tenant by ID
   */
  public async findTenantById(tenantId: string): Promise<any | null> {
    return await this.prisma.school.findFirst();
  }

  /**
   * Tracks failed login attempts for locking rules
   */
  public async trackFailedLogin(userId: string): Promise<{ failedCount: number; isLocked: boolean; lockUntil?: string }> {
    const now = new Date();
    let record = failedLoginsMap.get(userId);

    if (!record) {
      record = { attempts: 0, lockUntil: null };
      failedLoginsMap.set(userId, record);
    }

    // Check if lock has expired, reset if so
    if (record.lockUntil && record.lockUntil.getTime() < now.getTime()) {
      record.attempts = 0;
      record.lockUntil = null;
    }

    record.attempts += 1;

    let isLocked = false;
    let lockUntil: string | undefined;

    if (record.attempts >= 5) {
      isLocked = true;
      const unlockTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins lock
      record.lockUntil = unlockTime;
      lockUntil = unlockTime.toISOString();
    }

    return {
      failedCount: record.attempts,
      isLocked,
      lockUntil
    };
  }

  /**
   * Resets failed login records upon successful authentication
   */
  public async clearFailedLogins(userId: string): Promise<void> {
    failedLoginsMap.delete(userId);
  }

  /**
   * Forcefully unlocks an account (called by administrator)
   */
  public async adminUnlockAccount(userId: string): Promise<boolean> {
    const record = failedLoginsMap.get(userId);
    if (record) {
      failedLoginsMap.delete(userId);
      return true;
    }
    return false;
  }

  /**
   * Checks if user is currently locked
   */
  public isAccountLocked(userId: string): { isLocked: boolean; lockUntil?: string } {
    const record = failedLoginsMap.get(userId);
    if (!record || !record.lockUntil) return { isLocked: false };

    const now = new Date();
    if (record.lockUntil.getTime() > now.getTime()) {
      return { isLocked: true, lockUntil: record.lockUntil.toISOString() };
    }

    // Lock has expired, clear it
    failedLoginsMap.delete(userId);
    return { isLocked: false };
  }
}

export default AuthRepository;

