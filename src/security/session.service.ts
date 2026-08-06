import { PrismaEngine } from '../backend/database/prisma';

export interface SessionMetadata {
  ip: string;
  userAgent: string;
  location?: string;
  rememberMe?: boolean;
}

export class SessionService {
  private prisma = PrismaEngine;

  /**
   * Helper to parse user agent strings into Browser, OS, and Device
   */
  private parseUserAgent(ua: string): { browser: string; os: string; device: string } {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let device = 'Desktop';

    const lowercaseUA = ua.toLowerCase();

    // Browser detection
    if (lowercaseUA.includes('chrome') || lowercaseUA.includes('chromium')) {
      browser = 'Google Chrome';
    } else if (lowercaseUA.includes('firefox')) {
      browser = 'Mozilla Firefox';
    } else if (lowercaseUA.includes('safari') && !lowercaseUA.includes('chrome')) {
      browser = 'Apple Safari';
    } else if (lowercaseUA.includes('edge')) {
      browser = 'Microsoft Edge';
    } else if (lowercaseUA.includes('opera') || lowercaseUA.includes('opr')) {
      browser = 'Opera';
    }

    // OS detection
    if (lowercaseUA.includes('windows')) {
      os = 'Windows OS';
    } else if (lowercaseUA.includes('macintosh') || lowercaseUA.includes('mac os')) {
      os = 'macOS';
    } else if (lowercaseUA.includes('linux')) {
      os = 'Linux';
    } else if (lowercaseUA.includes('android')) {
      os = 'Android';
    } else if (lowercaseUA.includes('iphone') || lowercaseUA.includes('ipad')) {
      os = 'iOS';
    }

    // Device detection
    if (lowercaseUA.includes('mobile') || lowercaseUA.includes('android') || lowercaseUA.includes('iphone')) {
      device = 'Mobile Device';
    } else if (lowercaseUA.includes('tablet') || lowercaseUA.includes('ipad')) {
      device = 'Tablet';
    }

    return { browser, os, device };
  }

  /**
   * Creates a new user session on login
   */
  public async createSession(
    userId: string,
    tenantId: string,
    metadata: SessionMetadata,
    singleLoginMode = false
  ): Promise<any> {
    // If Single Login Mode is active, terminate all existing active sessions of this user first
    if (singleLoginMode) {
      await this.prisma.session.updateMany({
        where: {
          user_id: userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'REVOKED',
          ended_at: new Date()
        }
      });
    }

    const { browser, os, device } = this.parseUserAgent(metadata.userAgent);
    const now = new Date();
    
    // Default session longevity is 24 hours, or 30 days if 'rememberMe' is selected
    const durationMs = metadata.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs);

    const session = await this.prisma.session.create({
      data: {
        id: `ses-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        login_date: now.toISOString().substring(0, 10),
        login_time: now.toTimeString().substring(0, 8),
        ip_address: metadata.ip || '127.0.0.1',
        browser,
        os,
        device,
        location: metadata.location || 'Indonesia',
        status: 'ACTIVE',
        last_activity_at: now,
        expires_at: expiresAt,
        created_at: now,
        ended_at: null
      }
    });

    return session;
  }

  /**
   * Fetches active sessions for a user
   */
  public async getUserSessions(userId: string): Promise<any[]> {
    return await this.prisma.session.findMany({
      where: {
        user_id: userId,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Updates last activity time to prevent Idle Timeout
   */
  public async touchSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { last_activity_at: new Date() }
      });
    } catch (e) {}
  }

  /**
   * Terminates a single session
   */
  public async terminateSession(sessionId: string): Promise<boolean> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'TERMINATED',
          ended_at: new Date()
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validates if a session is still active and has not expired or timed out.
   * Standard Idle Timeout is 30 minutes unless 'remember me' is active
   */
  public async validateSession(sessionId: string, idleTimeoutMinutes = 30): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) return false;
    if (session.status !== 'ACTIVE') return false;

    // Check strict expiry
    if (new Date(session.expires_at).getTime() < Date.now()) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'EXPIRED',
          ended_at: new Date()
        }
      });
      return false;
    }

    // Check idle timeout (skip if remembered - i.e. length of expiration is greater than 2 days)
    const rememberMe = session.expires_at ? (new Date(session.expires_at).getTime() - new Date(session.created_at).getTime() > 2 * 24 * 60 * 60 * 1000) : false;
    if (!rememberMe) {
      const lastActivity = new Date(session.last_activity_at).getTime();
      const idleLimitMs = idleTimeoutMinutes * 60 * 1000;
      if (Date.now() - lastActivity > idleLimitMs) {
        await this.prisma.session.update({
          where: { id: sessionId },
          data: {
            status: 'TIMED_OUT',
            ended_at: new Date()
          }
        });
        return false;
      }
    }

    // Touch session activity
    await this.touchSession(sessionId);
    return true;
  }
}

export default SessionService;
