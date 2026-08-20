/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { RbacService } from '../rbac/rbac.service';

const rbacService = new RbacService();
const DB_FILE_PATH = path.join(process.cwd(), 'src/rbac/rbac.db.json');

function saveToDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not persist RBAC configuration to disk:', err);
  }
}

export async function handleRbac(
  action: string,
  req: any,
  res: Response,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN';

  switch (action) {
    case 'getRbacConfig': {
      try {
        const config = rbacService.getRawConfig();
        return res.json({ success: true, data: config });
      } catch (err: any) {
        console.error('Error fetching RBAC configuration:', err);
        return res.json({ success: true, data: rbacService.getRawConfig() });
      }
    }

    case 'saveRole': {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat mengelola Role' });
      }

      const { code, name } = req.body;
      if (!code || !name) {
        return res.json({ success: false, message: 'Kode role dan nama role wajib diisi' });
      }

      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const rbacData = JSON.parse(raw);

      const codeNormalized = code.toUpperCase().replace(/\s+/g, '_');
      const existingIdx = rbacData.roles.findIndex((r: any) => r.code === codeNormalized);

      if (existingIdx >= 0) {
        rbacData.roles[existingIdx].name = name;
      } else {
        rbacData.roles.push({ code: codeNormalized, name });
        // Initialize empty mappings for this role
        if (!rbacData.rolePermissions.some((rp: any) => rp.role_code === codeNormalized)) {
          rbacData.rolePermissions.push({ role_code: codeNormalized, permission_code: 'dashboard.view' });
        }
        if (!rbacData.roleMenus.some((rm: any) => rm.role_code === codeNormalized)) {
          rbacData.roleMenus.push({ role_code: codeNormalized, menu_ids: ['dashboard'] });
        }
      }

      saveToDb(rbacData);
      return res.json({ success: true, message: 'Role berhasil disimpan dan disinkronkan' });
    }

    case 'savePermission': {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat mengelola Permission' });
      }

      const { code, name, description } = req.body;
      if (!code || !name) {
        return res.json({ success: false, message: 'Kode permission dan nama wajib diisi' });
      }

      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const rbacData = JSON.parse(raw);

      const codeNormalized = code.toLowerCase().trim();
      const existingIdx = rbacData.permissions.findIndex((p: any) => p.code === codeNormalized);

      if (existingIdx >= 0) {
        rbacData.permissions[existingIdx].name = name;
        rbacData.permissions[existingIdx].description = description || '';
      } else {
        rbacData.permissions.push({ code: codeNormalized, name, description: description || '' });
      }

      saveToDb(rbacData);
      return res.json({ success: true, message: 'Permission berhasil disimpan dan disinkronkan' });
    }

    case 'saveMenu': {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat mengelola Menu' });
      }

      const { id, name, path: menuPath, is_active } = req.body;
      if (!id || !name) {
        return res.json({ success: false, message: 'ID dan nama menu wajib diisi' });
      }

      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const rbacData = JSON.parse(raw);

      const existingIdx = rbacData.menus.findIndex((m: any) => m.id === id);

      if (existingIdx >= 0) {
        rbacData.menus[existingIdx].name = name;
        if (menuPath !== undefined) rbacData.menus[existingIdx].path = menuPath;
        if (is_active !== undefined) rbacData.menus[existingIdx].is_active = is_active;
      } else {
        rbacData.menus.push({ id, name, path: menuPath || id, is_active: is_active !== false });
      }

      saveToDb(rbacData);
      return res.json({ success: true, message: 'Menu berhasil diperbarui' });
    }

    case 'saveRolePermissions': {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat memperbarui pemetaan izin' });
      }

      const { role_code, permission_codes } = req.body;
      if (!role_code || !Array.isArray(permission_codes)) {
        return res.json({ success: false, message: 'Parameter tidak valid' });
      }

      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const rbacData = JSON.parse(raw);

      // Remove existing permissions for this role
      rbacData.rolePermissions = rbacData.rolePermissions.filter((rp: any) => rp.role_code !== role_code);

      // Add new mappings
      permission_codes.forEach((pCode: string) => {
        rbacData.rolePermissions.push({ role_code, permission_code: pCode });
      });

      saveToDb(rbacData);
      return res.json({ success: true, message: `Izin untuk role ${role_code} berhasil diperbarui` });
    }

    case 'saveRoleMenus': {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat memperbarui hak akses menu' });
      }

      const { role_code, menu_ids } = req.body;
      if (!role_code || !Array.isArray(menu_ids)) {
        return res.json({ success: false, message: 'Parameter tidak valid' });
      }

      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const rbacData = JSON.parse(raw);

      // Find role menu mapping
      const mappingIdx = rbacData.roleMenus.findIndex((rm: any) => rm.role_code === role_code);

      if (mappingIdx >= 0) {
        rbacData.roleMenus[mappingIdx].menu_ids = menu_ids;
      } else {
        rbacData.roleMenus.push({ role_code, menu_ids });
      }

      saveToDb(rbacData);
      return res.json({ success: true, message: `Menu untuk role ${role_code} berhasil diperbarui` });
    }

    default:
      return null;
  }
}
