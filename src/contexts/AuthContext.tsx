/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant } from '../types';
import apiClient from '../api/client';
import defaultRbacData from '../rbac/rbac.db.json';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, tenant: Tenant) => void;
  logout: () => void;
  loading: boolean;
  rbacConfig: {
    roles: any[];
    permissions: any[];
    menus: any[];
    rolePermissions: any[];
    roleMenus: any[];
  } | null;
  hasPermission: (permission: string) => boolean;
  hasMenuAccess: (menuId: string) => boolean;
  reloadRbac: () => Promise<void>;
  previewRole: string | null;
  setPreviewRole: (role: string | null) => void;
  activeRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rbacConfig, setRbacConfig] = useState<any>(defaultRbacData);
  const [previewRole, setPreviewRoleState] = useState<string | null>(localStorage.getItem('erp_preview_role'));

  const setPreviewRole = (role: string | null) => {
    setPreviewRoleState(role);
    if (role) {
      localStorage.setItem('erp_preview_role', role);
    } else {
      localStorage.removeItem('erp_preview_role');
    }
    window.location.reload();
  };

  const fetchRbacConfig = async (userToken?: string | null, retries = 1) => {
    try {
      const headers: Record<string, string> = {};
      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }
      const res = await apiClient.post('/api/action?action=getRbacConfig', {}, { headers });
      if (res.data?.success && res.data?.data) {
        setRbacConfig(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401 && userToken) {
        // Clear invalid token session
        setToken(null);
        setUser(null);
        setTenant(null);
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_tenant');
      } else if (retries > 0) {
        setTimeout(() => fetchRbacConfig(userToken, retries - 1), 1000);
      }
    }
  };

  useEffect(() => {
    // Load session on startup
    const storedToken = localStorage.getItem('erp_token');
    const storedUser = localStorage.getItem('erp_user');
    const storedTenant = localStorage.getItem('erp_tenant');

    if (storedToken && storedUser && storedTenant) {
      try {
        const u = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(u);
        setTenant(JSON.parse(storedTenant));
        fetchRbacConfig(storedToken);
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_tenant');
      }
    } else {
      // Fetch public default RBAC configuration on startup
      fetchRbacConfig(null);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, newTenant: Tenant) => {
    setToken(newToken);
    setUser(newUser);
    setTenant(newTenant);
    localStorage.setItem('erp_token', newToken);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    localStorage.setItem('erp_tenant', JSON.stringify(newTenant));
    fetchRbacConfig(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    setRbacConfig(null);
    setPreviewRoleState(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_tenant');
    localStorage.removeItem('erp_preview_role');
    window.location.href = '/login';
  };

  const reloadRbac = async () => {
    if (token) {
      await fetchRbacConfig(token);
    }
  };

  // Helper to normalize role
  const normalizeRole = (rawRole: string): string => {
    const r = rawRole?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (r === 'SUPERADMIN' || r === 'ADMIN' || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    if (r === 'OWNER' || r === 'OWNER_YAYASAN') return 'OWNER_YAYASAN';
    if (r === 'BENDAHARA' || r === 'BENDAHARA_KEUANGAN' || r === 'BENDAHARA_SEKOLAH') return 'BENDAHARA_SEKOLAH';
    if (r === 'OPERATOR' || r === 'OPERATOR_SEKOLAH' || r === 'OPS') return 'OPERATOR_SEKOLAH';
    if (r === 'PRINCIPAL' || r === 'KEPALA_SEKOLAH') return 'KEPALA_SEKOLAH';
    if (r === 'TEACHER' || r === 'GURU' || r === 'USTADZ') return 'GURU';
    if (r === 'STUDENT' || r === 'SISWA') return 'SANTRI';
    if (r === 'PARENT' || r === 'ORANG_TUA') return 'WALI_SANTRI';
    return r;
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    const roleNorm = normalizeRole(previewRole || user.role);
    if (roleNorm === 'SUPER_ADMIN') return true;
    if (!rbacConfig) return true;

    // Search mapping
    const mappings = rbacConfig.rolePermissions || [];
    if (!mappings || mappings.length === 0) return true;
    return mappings.some(
      (m: any) => m.role_code === roleNorm && m.permission_code === permissionCode
    );
  };

  const hasMenuAccess = (menuId: string): boolean => {
    if (!user) return false;
    const roleNorm = normalizeRole(previewRole || user.role);
    if (roleNorm === 'SUPER_ADMIN') return true;
    if (!rbacConfig) return true;

    // Check if menu itself is globally disabled
    const menuObj = rbacConfig.menus?.find((m: any) => m.id === menuId);
    if (menuObj && menuObj.is_active === false) return false;

    const mappings = rbacConfig.roleMenus || [];
    const roleMenuEntry = mappings.find((m: any) => m.role_code === roleNorm);
    if (!roleMenuEntry || !roleMenuEntry.menu_ids) return true;

    return roleMenuEntry.menu_ids.includes(menuId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
        rbacConfig,
        hasPermission,
        hasMenuAccess,
        reloadRbac,
        previewRole,
        setPreviewRole,
        activeRole: previewRole || user?.role || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const fallbackAuthContext: AuthContextType = {
  user: null,
  tenant: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: false,
  rbacConfig: null,
  hasPermission: () => true,
  hasMenuAccess: () => true,
  reloadRbac: async () => {},
  previewRole: null,
  setPreviewRole: () => {},
  activeRole: null
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return fallbackAuthContext;
  }
  return context;
};
