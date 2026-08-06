/**
 * Enterprise Auth Session Repository
 * 
 * Manages secure user session mappings and active Refresh Tokens with expiration schedules.
 */

import { logger } from '../../config/logger';
import { ConnectionManager } from '../../../database/connection/ConnectionManager';

export interface AuthSession {
  token_id: string;
  user_id: string;
  refresh_token: string;
  expires_at: number;
  remember_me: boolean;
  user_agent?: string;
  ip_address?: string;
}

class SessionStoreSimulator {
  public async saveSession(session: AuthSession): Promise<void> {
    const activeProvider = ConnectionManager.getInstance().getProvider();
    const expiresAtDate = new Date(session.expires_at).toISOString().slice(0, 19).replace('T', ' ');
    const createdStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
      // 1. Insert into sessions table (no tenant_id)
      await activeProvider.execute(
        'INSERT INTO sessions (id, user_id, ip_address, user_agent, remember_me, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          session.token_id,
          session.user_id,
          session.ip_address || null,
          session.user_agent || null,
          session.remember_me ? 1 : 0,
          createdStr,
          expiresAtDate
        ]
      );

      // 2. Insert into refresh_tokens table (no tenant_id)
      await activeProvider.execute(
        'INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          session.token_id,
          session.user_id,
          session.refresh_token,
          expiresAtDate,
          createdStr
        ]
      );
      logger.debug(`Saved active session token in secure database store`, { tokenId: session.token_id });
    } catch (err) {
      logger.error('Failed to save session in database:', err);
    }
  }

  public async getSessionByToken(refreshToken: string): Promise<AuthSession | null> {
    const activeProvider = ConnectionManager.getInstance().getProvider();
    try {
      const tokenRows = await activeProvider.query(
        'SELECT * FROM refresh_tokens WHERE token = ?',
        [refreshToken]
      );
      if (tokenRows.length === 0) return null;
      const tokenRow = tokenRows[0];

      // Check expiration
      const expTime = new Date(tokenRow.expires_at).getTime();
      if (Date.now() > expTime) {
        // Evict expired session
        await activeProvider.execute('DELETE FROM refresh_tokens WHERE id = ?', [tokenRow.id]);
        await activeProvider.execute('DELETE FROM sessions WHERE id = ?', [tokenRow.id]);
        logger.info(`Evicting expired refresh session from DB`, { tokenId: tokenRow.id });
        return null;
      }

      // Load from sessions to get additional metadata
      const sessRows = await activeProvider.query(
        'SELECT * FROM sessions WHERE id = ?',
        [tokenRow.id]
      );
      const sessRow = sessRows[0] || {};

      return {
        token_id: tokenRow.id,
        user_id: tokenRow.user_id,
        refresh_token: tokenRow.token,
        expires_at: expTime,
        remember_me: !!(sessRow.remember_me),
        user_agent: sessRow.user_agent || undefined,
        ip_address: sessRow.ip_address || undefined
      };
    } catch (err) {
      logger.error('Failed to retrieve session from database:', err);
      return null;
    }
  }

  public async revokeSession(tokenId: string): Promise<boolean> {
    const activeProvider = ConnectionManager.getInstance().getProvider();
    try {
      await activeProvider.execute('DELETE FROM refresh_tokens WHERE id = ?', [tokenId]);
      await activeProvider.execute('DELETE FROM sessions WHERE id = ?', [tokenId]);
      return true;
    } catch (err) {
      logger.error('Failed to revoke session:', err);
      return false;
    }
  }

  public async revokeAllUserSessions(userId: string): Promise<number> {
    const activeProvider = ConnectionManager.getInstance().getProvider();
    try {
      const res1 = await activeProvider.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
      const res2 = await activeProvider.execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
      return (res1.affectedRows || 0) + (res2.affectedRows || 0);
    } catch (err) {
      logger.error('Failed to revoke all user sessions:', err);
      return 0;
    }
  }
}

export const AuthRepository = new SessionStoreSimulator();
export default AuthRepository;
