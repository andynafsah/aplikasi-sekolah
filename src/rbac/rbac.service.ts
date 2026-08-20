/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import rbacData from './rbac.db.json';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER_YAYASAN = 'OWNER_YAYASAN',
  KETUA_YAYASAN = 'KETUA_YAYASAN',
  BENDAHARA_YAYASAN = 'BENDAHARA_YAYASAN',
  KEPALA_SEKOLAH = 'KEPALA_SEKOLAH',
  WAKIL_KEPALA_SEKOLAH = 'WAKIL_KEPALA_SEKOLAH',
  ADMIN_TU = 'ADMIN_TU',
  BENDAHARA_SEKOLAH = 'BENDAHARA_SEKOLAH',
  GURU = 'GURU',
  WALI_KELAS = 'WALI_KELAS',
  PEGAWAI = 'PEGAWAI',
  PETUGAS_PPDB = 'PETUGAS_PPDB',
  PETUGAS_PERPUSTAKAAN = 'PETUGAS_PERPUSTAKAAN',
  PETUGAS_INVENTARIS = 'PETUGAS_INVENTARIS',
  PETUGAS_ASRAMA = 'PETUGAS_ASRAMA',
  MUSYRIF = 'MUSYRIF',
  MUSYRIFAH = 'MUSYRIFAH',
  PEMBINA_TAHFIDZ = 'PEMBINA_TAHFIDZ',
  WALI_SANTRI = 'WALI_SANTRI',
  SANTRI = 'SANTRI'
}

export class RbacService {
  private data: any;

  constructor() {
    this.data = rbacData;
    this.loadLatestConfig();
  }

  /**
   * Helper to load latest configuration if fs is available (server-side only)
   */
  public loadLatestConfig() {
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(process.cwd(), 'src/rbac/rbac.db.json');
        if (fs.existsSync(dbPath)) {
          const raw = fs.readFileSync(dbPath, 'utf8');
          this.data = JSON.parse(raw);
        }
      } catch (err) {
        // Fallback silently in non-Node environments
      }
    }
  }

  /**
   * Returns complete RBAC raw data configuration
   */
  public getRawConfig(): any {
    this.loadLatestConfig();
    return this.data || rbacData;
  }

  /**
   * Translates role code strings dynamically
   */
  public normalizeRole(rawRole: string): string {
    const r = rawRole?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (r === 'SUPERADMIN' || r === 'ADMIN') return 'SUPER_ADMIN';
    if (r === 'OWNER') return 'OWNER_YAYASAN';
    if (r === 'BENDAHARA') return 'BENDAHARA_SEKOLAH';
    if (r === 'PRINCIPAL') return 'KEPALA_SEKOLAH';
    if (r === 'TEACHER') return 'GURU';
    if (r === 'STUDENT' || r === 'SISWA') return 'SANTRI';
    if (r === 'PARENT' || r === 'ORANG_TUA') return 'WALI_SANTRI';

    const matched = this.getRoles().find(role => role.code === r);
    return matched ? matched.code : r;
  }

  /**
   * Returns list of roles
   */
  public getRoles(): Array<{ code: string; name: string }> {
    this.loadLatestConfig();
    return this.data.roles || [];
  }

  /**
   * Returns list of permissions
   */
  public getPermissions(): Array<{ code: string; name: string; description: string }> {
    this.loadLatestConfig();
    return this.data.permissions || [];
  }

  /**
   * Returns list of menus
   */
  public getMenus(): Array<{ id: string; name: string; path: string; is_active: boolean }> {
    this.loadLatestConfig();
    return this.data.menus || [];
  }

  /**
   * Gets list of permissions for a role
   */
  public getPermissionsForRole(role: string): string[] {
    this.loadLatestConfig();
    const norm = this.normalizeRole(role);
    if (norm === 'SUPER_ADMIN') {
      return this.getPermissions().map(p => p.code);
    }
    const mapping = this.data.rolePermissions || [];
    return mapping
      .filter((m: any) => m.role_code === norm)
      .map((m: any) => m.permission_code);
  }

  /**
   * Checks if a role has a specific permission
   */
  public hasPermission(role: string, permission: string): boolean {
    const permissions = this.getPermissionsForRole(role);
    if (role === 'SUPER_ADMIN') return true;
    return permissions.includes(permission);
  }

  /**
   * Gets list of active menus accessible by a role
   */
  public getMenusForRole(role: string): string[] {
    this.loadLatestConfig();
    const norm = this.normalizeRole(role);
    const activeMenuIds = this.getMenus()
      .filter(m => m.is_active)
      .map(m => m.id);

    if (norm === 'SUPER_ADMIN') {
      return activeMenuIds;
    }

    const mapping = this.data.roleMenus || [];
    const roleMenuEntry = mapping.find((m: any) => m.role_code === norm);
    if (!roleMenuEntry) return [];

    return roleMenuEntry.menu_ids.filter((id: string) => activeMenuIds.includes(id));
  }

  /**
   * Checks if a role has access to a specific menu
   */
  public hasMenuAccess(role: string, menu: string): boolean {
    const menus = this.getMenusForRole(role);
    return menus.includes(menu);
  }
}

export default RbacService;
