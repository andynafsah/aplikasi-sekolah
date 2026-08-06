import { PrismaEngine } from '../backend/database/prisma';

export class RefreshTokenService {
  private prisma = PrismaEngine;

  /**
   * Saves a newly generated refresh token
   */
  public async saveToken(userId: string, token: string, expiresAt: Date, tenantId?: string): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: `rt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        token,
        expires_at: expiresAt,
        is_revoked: false,
        created_at: new Date()
      }
    });
  }

  /**
   * Checks if a refresh token is valid and active (not revoked or expired)
   */
  public async isValidToken(token: string): Promise<boolean> {
    const found = await this.prisma.refreshToken.findUnique({
      where: { token }
    });
    if (!found) return false;
    if (found.is_revoked) return false;
    if (new Date(found.expires_at).getTime() < Date.now()) return false;
    return true;
  }

  /**
   * Revokes a specific refresh token (e.g. during manual logout)
   */
  public async revokeToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.update({
        where: { token },
        data: {
          is_revoked: true,
          updated_at: new Date()
        }
      });
    } catch (e) {}
  }

  /**
   * Revokes all refresh tokens belonging to a user (Logout All Devices)
   */
  public async revokeUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { user_id: userId },
        data: {
          is_revoked: true,
          updated_at: new Date()
        }
      });
    } catch (e) {}
  }
}

export default RefreshTokenService;

