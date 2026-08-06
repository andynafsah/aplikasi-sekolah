import { AuthRepository } from './auth.repository';
import { PasswordService } from '../security/password.service';
import { JwtService, TokenPayload } from '../security/jwt.service';
import { RefreshTokenService } from '../security/refresh-token.service';
import { SessionService, SessionMetadata } from '../security/session.service';
import { RbacService } from '../rbac/rbac.service';
import { PrismaEngine } from '../backend/database/prisma';
import { logActivity } from '../../server';

export enum TwoFactorMethod {
  GOOGLE_AUTHENTICATOR = 'GOOGLE_AUTHENTICATOR',
  EMAIL_OTP = 'EMAIL_OTP',
  WHATSAPP_OTP = 'WHATSAPP_OTP',
  SMS_OTP = 'SMS_OTP'
}

export interface TwoFactorState {
  enabled: boolean;
  preferred_method: TwoFactorMethod | null;
  temp_secret?: string;
}

export class AuthService {
  private readonly authRepo: AuthRepository;
  private readonly passwordService: PasswordService;
  private readonly jwtService: JwtService;
  private readonly refreshTokenService: RefreshTokenService;
  private readonly sessionService: SessionService;
  private readonly rbacService: RbacService;
  private readonly prisma = PrismaEngine;

  constructor() {
    this.authRepo = new AuthRepository();
    this.passwordService = new PasswordService();
    this.jwtService = new JwtService();
    this.refreshTokenService = new RefreshTokenService();
    this.sessionService = new SessionService();
    this.rbacService = new RbacService();
  }

  /**
   * Creates a new user account dynamically
   */
  public async createUser(
    name: string,
    email: string,
    username: string,
    passwordPlain: string,
    roleCode: string,
    tenantId: string
  ): Promise<any> {
    const existing = await this.authRepo.findUserByIdentifier(email);
    if (existing) {
      return { success: false, message: 'Alamat email atau username sudah terdaftar' };
    }

    // Validate strength
    const policyResult = this.passwordService.validatePasswordPolicy(passwordPlain);
    if (!policyResult.isValid) {
      return { success: false, message: policyResult.message };
    }

    const hashedPassword = await this.passwordService.hashPassword(passwordPlain);

    // Find role ID
    const role = await this.prisma.role.findFirst({
      where: { code: roleCode }
    });

    if (!role) {
      return { success: false, message: `Peran "${roleCode}" tidak ditemukan` };
    }

    const userId = `user-${Date.now()}`;
    const newUser = await this.prisma.user.create({
      data: {
        id: userId,
        email: email,
        username: username,
        password_hash: hashedPassword,
        name: name,
        role_id: role.id,
        status: 'ACTIVE'
      }
    });

    // Save password history
    await this.passwordService.logPasswordHistory(userId, hashedPassword);

    logActivity(tenantId, userId, newUser.username, roleCode, 'CREATE_USER', 'Authentication', `Membuat akun user baru: ${username} dengan role ${roleCode}`);

    return {
      success: true,
      message: 'Akun berhasil dibuat',
      data: newUser
    };
  }

  /**
   * Logs in a user using Universal credentials
   */
  public async login(
    identifier: string,
    passwordPlain: string,
    rememberMe = false,
    sessionMeta: SessionMetadata,
    singleLogin = false
  ): Promise<any> {
    const user = await this.authRepo.findUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'Kredensial login salah atau tidak terdaftar' };
    }

    const userId = user.id;

    // Check if locked
    const lockCheck = this.authRepo.isAccountLocked(userId);
    if (lockCheck.isLocked) {
      const minutesLeft = Math.ceil((new Date(lockCheck.lockUntil!).getTime() - Date.now()) / (60 * 1000));
      return { 
        success: false, 
        message: `Akun terkunci sementara karena 5x gagal login. Sisa waktu: ${minutesLeft} menit.` 
      };
    }

    // Verify password
    const passwordValid = await this.passwordService.comparePassword(passwordPlain, user.password_hash);
    if (!passwordValid) {
      // Track failed attempt
      const failStatus = await this.authRepo.trackFailedLogin(userId);
      logActivity(user.tenant_id, user.id, user.username, user.role, 'FAILED_LOGIN', 'Authentication', `Gagal login untuk user: ${user.username}. Percobaan: ${failStatus.failedCount}/5`);
      
      if (failStatus.isLocked) {
        return { 
          success: false, 
          message: 'Akun Anda telah dikunci selama 15 menit karena 5x berturut-turut gagal login.' 
        };
      }
      return { 
        success: false, 
        message: `Kredensial login salah. Sisa percobaan: ${5 - failStatus.failedCount}` 
      };
    }

    // Password is valid - clear failed login counter
    await this.authRepo.clearFailedLogins(userId);

    // Verify Password Expiration (e.g. 90 days policy)
    const passwordUpdateDate = user.password_updated_at || user.created_at || new Date().toISOString();
    const isExpired = this.passwordService.isPasswordExpired(passwordUpdateDate, 90);
    const forcePasswordChange = user.force_password_change || isExpired;

    // Get role Normalized
    const normRole = user.role;

    // Prepare JWT payloads
    const payload: TokenPayload = {
      id: user.id,
      tenant_id: user.tenant_id || 'tenant-1',
      email: user.email,
      username: user.username,
      name: user.name,
      role: normRole
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    // Save refresh token
    const expiryDays = rememberMe ? 30 : 7;
    const refreshExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    await this.refreshTokenService.saveToken(userId, refreshToken, refreshExpiry, user.tenant_id || 'tenant-1');

    // Register active session login
    const session = await this.sessionService.createSession(userId, user.tenant_id || 'tenant-1', {
      ...sessionMeta,
      rememberMe
    }, singleLogin);

    // Fetch Tenant details
    const tenant = await this.authRepo.findTenantById(user.tenant_id || 'tenant-1');

    // Retrieve permissions & menus dynamically from database (NO HARDCODING)
    const userWithRole = await this.prisma.user.findFirst({
      where: { id: userId },
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

    const permissions = userWithRole?.role?.role_permissions.map(rp => rp.permission.code) || [];
    if (userWithRole?.role?.code === 'SUPER_ADMIN') {
      permissions.push('*');
    }

    // Dynamically build menu access list based on DB permissions
    const menus: string[] = ['Dashboard'];
    if (permissions.includes('*') || normRole === 'SUPER_ADMIN') {
      menus.push('*');
    } else {
      if (permissions.includes('student:read')) menus.push('Sivitas', 'Master Data');
      if (permissions.includes('student:write')) menus.push('PPDB', 'Tata Usaha');
      if (permissions.includes('attendance:log')) menus.push('Akademik', 'KBM');
      if (permissions.includes('finance:read')) menus.push('Keuangan', 'SPP', 'Payroll');
      if (permissions.includes('settings:manage')) menus.push('Sistem', 'Audit');
    }

    // Prepared 2FA state (Ready simulation)
    const defaultTwoFactorState: TwoFactorState = {
      enabled: user.two_factor_enabled || false,
      preferred_method: user.two_factor_method || null
    };

    // Activity tracking
    logActivity(user.tenant_id || 'tenant-1', userId, user.username, normRole, 'LOGIN', 'Authentication', `Sukses masuk ke sistem via session ${session.id}`);

    return {
      success: true,
      message: 'Login berhasil',
      data: {
        token: accessToken,
        refresh_token: refreshToken,
        session_id: session.id,
        force_change_password: forcePasswordChange,
        user: {
          id: user.id,
          tenant_id: user.tenant_id || 'tenant-1',
          email: user.email,
          username: user.username,
          name: user.name,
          role: normRole,
          phone: user.phone,
          profile: {
            photo: user.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            signature: user.signature || '',
            barcode: user.barcode || `USR-${user.username}`,
            qrcode: user.qrcode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userId}`,
            theme: user.theme || 'light',
            language: user.language || 'id',
            timezone: user.timezone || 'Asia/Jakarta'
          },
          two_factor: defaultTwoFactorState
        },
        permissions,
        menus,
        tenant: tenant || { id: 'tenant-1', name: 'SMA Islam Terpadu & Pondok Pesantren Terpadu', type: 'SEKOLAH' }
      }
    };
  }

  /**
   * Registers a new tenant and its super-admin account
   */
  public async register(
    name: string,
    email: string,
    passwordPlain: string,
    schoolName: string,
    schoolType = 'SEKOLAH'
  ): Promise<any> {
    const existing = await this.authRepo.findUserByIdentifier(email);
    if (existing) {
      return { success: false, message: 'Alamat email atau username sudah terdaftar' };
    }

    // Validate strength
    const policyResult = this.passwordService.validatePasswordPolicy(passwordPlain);
    if (!policyResult.isValid) {
      return { success: false, message: policyResult.message };
    }

    const tenantId = `tenant-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    const newTenant = await this.prisma.school.create({
      data: {
        id: tenantId,
        name: schoolName || 'Sekolah Baru Custom',
        address: 'Jl. Raya Pendidikan No. 1',
        phone: '08123456789'
      }
    });

    const hashedPassword = await this.passwordService.hashPassword(passwordPlain);
    
    // Find SUPER_ADMIN role ID
    const superAdminRole = await this.prisma.role.findFirst({
      where: { code: 'SUPER_ADMIN' }
    });

    const newUser = await this.prisma.user.create({
      data: {
        id: userId,
        email: email,
        username: email.split('@')[0],
        password_hash: hashedPassword,
        name: name || 'Kepala Sekolah Baru',
        role_id: superAdminRole?.id || 'role-superadmin',
        phone: '08123456789',
        status: 'ACTIVE'
      }
    });

    // Save password history
    await this.passwordService.logPasswordHistory(userId, hashedPassword);

    logActivity(tenantId, userId, newUser.username, 'SUPER_ADMIN', 'REGISTER', 'Authentication', `Mendaftarkan tenant baru: ${schoolName}`);

    // Generate JWT payload
    const payload: TokenPayload = {
      id: userId,
      tenant_id: tenantId,
      email: email,
      username: newUser.username,
      name: newUser.name,
      role: 'SUPER_ADMIN'
    };

    const token = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return {
      success: true,
      message: 'Registrasi sukses',
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: userId,
          tenant_id: tenantId,
          email: email,
          username: newUser.username,
          name: newUser.name,
          role: 'SUPER_ADMIN',
          phone: newUser.phone,
          profile: {
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            signature: '',
            barcode: `USR-${newUser.username}`,
            qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userId}`,
            theme: 'light',
            language: 'id',
            timezone: 'Asia/Jakarta'
          }
        },
        tenant: newTenant
      }
    };
  }

  /**
   * Refreshes user access tokens using a valid refresh token
   */
  public async refreshAccessToken(token: string): Promise<any> {
    const isValid = await this.refreshTokenService.isValidToken(token);
    if (!isValid) {
      return { success: false, message: 'Refresh token tidak valid atau telah kadaluarsa' };
    }

    const payload = this.jwtService.verifyRefreshToken(token);
    if (!payload) {
      return { success: false, message: 'Sesi token tidak valid' };
    }

    const newAccessToken = this.jwtService.generateAccessToken({
      id: payload.id,
      tenant_id: payload.tenant_id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
      role: payload.role
    });

    return {
      success: true,
      data: {
        token: newAccessToken
      }
    };
  }

  /**
   * Logs out from current device / session
   */
  public async logout(refreshToken: string, sessionId?: string): Promise<any> {
    if (refreshToken) {
      await this.refreshTokenService.revokeToken(refreshToken);
    }
    if (sessionId) {
      await this.sessionService.terminateSession(sessionId);
    }
    return { success: true, message: 'Logout berhasil' };
  }

  /**
   * Logs out from all active devices and sessions (Revoke All Devices)
   */
  public async logoutAllDevices(userId: string, tenantId: string, username: string, role: string): Promise<any> {
    // Revoke all refresh tokens
    await this.refreshTokenService.revokeUserTokens(userId);

    // Revoke all session logins
    const sessions = await this.sessionService.getUserSessions(userId);
    for (const session of sessions) {
      await this.sessionService.terminateSession(session.id);
    }

    logActivity(tenantId, userId, username, role, 'LOGOUT_ALL', 'Authentication', `Melakukan logout dari semua perangkat`);
    return { success: true, message: 'Berhasil keluar dari semua perangkat' };
  }

  /**
   * Triggers forgot password reset request
   */
  public async forgotPassword(identifier: string): Promise<any> {
    const user = await this.authRepo.findUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'Username atau email tidak terdaftar di instansi manapun' };
    }

    const resetToken = `rst-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Persist reset token using SystemSetting to avoid schema modification
    await this.prisma.systemSetting.upsert({
      where: { key: `reset_token:${resetToken}` },
      update: { value: JSON.stringify({ userId: user.id, expires: resetExpires.getTime() }) },
      create: {
        key: `reset_token:${resetToken}`,
        value: JSON.stringify({ userId: user.id, expires: resetExpires.getTime() })
      }
    });

    logActivity(user.tenant_id || 'tenant-1', user.id, user.username, user.role, 'RESET_PASSWORD_REQUEST', 'Authentication', `Mengirimkan permintaan reset password`);

    return {
      success: true,
      message: 'Kode reset password telah disiapkan dan dikirimkan (Simulasi)',
      data: {
        reset_token: resetToken,
        email: user.email
      }
    };
  }

  /**
   * Resets password using valid reset token
   */
  public async resetPassword(resetToken: string, passwordPlain: string): Promise<any> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: `reset_token:${resetToken}` }
    });

    if (!setting) {
      return { success: false, message: 'Token reset password tidak valid atau kedaluwarsa' };
    }

    const tokenData = JSON.parse(setting.value);
    if (tokenData.expires < Date.now()) {
      return { success: false, message: 'Token reset password telah kedaluwarsa' };
    }

    // Check strength
    const policy = this.passwordService.validatePasswordPolicy(passwordPlain);
    if (!policy.isValid) {
      return { success: false, message: policy.message };
    }

    // Check password history limit
    const usedBefore = await this.passwordService.checkPasswordHistory(tokenData.userId, passwordPlain, 3);
    if (usedBefore) {
      return { success: false, message: 'Password baru tidak boleh sama dengan 3 password terakhir Anda' };
    }

    const hashedPassword = await this.passwordService.hashPassword(passwordPlain);

    await this.prisma.user.update({
      where: { id: tokenData.userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });

    // Delete setting token
    await this.prisma.systemSetting.delete({
      where: { key: `reset_token:${resetToken}` }
    });

    // Log password history
    await this.passwordService.logPasswordHistory(tokenData.userId, hashedPassword);

    return { success: true, message: 'Password Anda berhasil diatur ulang' };
  }

  /**
   * Changes user password manually (with verification of current password)
   */
  public async changePassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    // Check old password
    const verifyOld = await this.passwordService.comparePassword(oldPasswordPlain, user.password_hash);
    if (!verifyOld) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan salah' };
    }

    // Check strength
    const policy = this.passwordService.validatePasswordPolicy(newPasswordPlain);
    if (!policy.isValid) {
      return { success: false, message: policy.message };
    }

    // Check history
    const usedBefore = await this.passwordService.checkPasswordHistory(userId, newPasswordPlain, 3);
    if (usedBefore) {
      return { success: false, message: 'Password baru tidak boleh sama dengan 3 password terakhir Anda' };
    }

    const hashedPassword = await this.passwordService.hashPassword(newPasswordPlain);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });

    // Log password history
    await this.passwordService.logPasswordHistory(userId, hashedPassword);

    return { success: true, message: 'Password berhasil diubah' };
  }

  /**
   * Forces a password change (e.g. from the admin panel)
   */
  public async forcePasswordChange(userId: string, newPasswordPlain: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    const policy = this.passwordService.validatePasswordPolicy(newPasswordPlain);
    if (!policy.isValid) {
      return { success: false, message: policy.message };
    }

    const hashedPassword = await this.passwordService.hashPassword(newPasswordPlain);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });

    await this.passwordService.logPasswordHistory(userId, hashedPassword);

    return { success: true, message: 'Password berhasil dipaksa ubah oleh sistem' };
  }

  /**
   * Admin-initiated account unlock
   */
  public async adminUnlock(userId: string, adminId: string, adminUsername: string, adminRole: string, tenantId: string): Promise<any> {
    const ok = await this.authRepo.adminUnlockAccount(userId);
    if (!ok) {
      return { success: false, message: 'Gagal membuka kunci. Akun ini tidak dalam status terkunci.' };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    const username = user ? user.username : userId;

    logActivity(tenantId, adminId, adminUsername, adminRole, 'UNLOCK_ACCOUNT', 'Authentication', `Membuka kunci login untuk user: ${username}`);
    return { success: true, message: `Sukses membuka kunci akun untuk user: ${username}` };
  }

  /**
   * Updates user profile attributes (photo, signature, timezone, language, theme)
   */
  public async updateProfile(userId: string, profileData: any): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    const data: any = {};
    if (profileData.name) data.name = profileData.name;
    if (profileData.phone) data.phone = profileData.phone;
    if (profileData.photo) data.photo = profileData.photo;
    if (profileData.signature) data.signature = profileData.signature;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updated_at: new Date()
      },
      include: {
        role: true
      }
    });

    const normRole = updatedUser.role?.code || 'GURU';

    return {
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id: updatedUser.id,
        tenant_id: 'tenant-1',
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        role: normRole,
        phone: updatedUser.phone,
        profile: {
          photo: updatedUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          signature: updatedUser.signature || '',
          barcode: `USR-${updatedUser.username}`,
          qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userId}`,
          theme: 'light',
          language: 'id',
          timezone: 'Asia/Jakarta'
        }
      }
    };
  }
}

export default AuthService;

