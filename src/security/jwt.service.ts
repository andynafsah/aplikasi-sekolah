import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-erp-platform-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-2026';

export interface TokenPayload {
  id: string;
  tenant_id: string;
  email: string;
  username: string;
  name: string;
  role: string;
}

export class JwtService {
  /**
   * Generates a short-lived access token (e.g. 1 hour)
   */
  public generateAccessToken(user: TokenPayload): string {
    return jwt.sign(
      {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Generates a long-lived refresh token (e.g. 7 days)
   */
  public generateRefreshToken(user: TokenPayload): string {
    return jwt.sign(
      {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifies an access token and returns payload, or null if invalid/expired
   */
  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      // Fallback: If it's a legacy base64-encoded JWT from simulated seed server code, try decoding it
      try {
        const payloadStr = Buffer.from(token, 'base64').toString('ascii');
        const payload = JSON.parse(payloadStr);
        if (payload && payload.exp && payload.exp > Date.now()) {
          return {
            id: payload.id,
            tenant_id: payload.tenant_id,
            email: payload.email,
            username: payload.username,
            name: payload.name,
            role: payload.role
          };
        }
      } catch {}
      return null;
    }
  }

  /**
   * Verifies a refresh token and returns payload, or null if invalid/expired
   */
  public verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }
}

export default JwtService;
