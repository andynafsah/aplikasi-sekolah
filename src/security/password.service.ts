import bcrypt from 'bcryptjs';
import { PrismaEngine } from '../backend/database/prisma';

export class PasswordService {
  private prisma = PrismaEngine;

  /**
   * Hashes a plain text password using bcrypt
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password against a bcrypt hash
   */
  public async comparePassword(password: string, hash: string): Promise<boolean> {
    // For initial seed users with plain text passwords (like 'password123'), support a fallback
    if (hash === password) {
      return true;
    }
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  /**
   * Validates a password against the security policy:
   * - Minimal 8 characters
   * - Must contain at least one uppercase letter
   * - Must contain at least one lowercase letter
   * - Must contain at least one digit
   * - Must contain at least one special character/symbol
   */
  public validatePasswordPolicy(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password minimal harus 8 karakter' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password harus mengandung minimal satu huruf besar (A-Z)' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password harus mengandung minimal satu huruf kecil (a-z)' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password harus mengandung minimal satu angka (0-9)' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password harus mengandung minimal satu karakter spesial/simbol (!@#$%^&*)' };
    }
    return { isValid: true };
  }

  /**
   * Determines if a password has expired based on standard days limit (e.g. 90 days)
   */
  public isPasswordExpired(updatedAt: string | Date, daysLimit = 90): boolean {
    const lastUpdate = new Date(updatedAt).getTime();
    const expiryTime = lastUpdate + daysLimit * 24 * 60 * 60 * 1000;
    return Date.now() > expiryTime;
  }

  /**
   * Checks if the new password has been used recently to prevent reuse (tracks up to limit)
   */
  public async checkPasswordHistory(userId: string, newPasswordPlain: string, historyLimit = 3): Promise<boolean> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: `password_history:${userId}` }
      });
      if (!setting) return false;

      const history: any[] = JSON.parse(setting.value);
      const recentHistory = history.slice(0, historyLimit);

      for (const record of recentHistory) {
        const match = await this.comparePassword(newPasswordPlain, record.password_hash);
        if (match) {
          return true; // Password was used previously
        }
      }
    } catch (e) {}
    return false;
  }

  /**
   * Logs a password to the user's history
   */
  public async logPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    try {
      const key = `password_history:${userId}`;
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key }
      });

      let history: any[] = [];
      if (setting) {
        history = JSON.parse(setting.value);
      }

      history.unshift({
        id: `pwh-${Date.now()}-${Math.floor(Math.random() * 105)}`,
        user_id: userId,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      });

      // Keep last 10 entries to avoid bloat
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(history) },
        create: { key, value: JSON.stringify(history) }
      });
    } catch (e) {}
  }
}

export default PasswordService;

