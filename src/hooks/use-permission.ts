import { useAuthStore } from '@/lib/store';
import type { PlatformPermissionKey } from '@/lib/permissions';
import { MODULE_PERMISSION_MAP } from '@/lib/permissions';

/**
 * usePermission
 * -------------
 * Returns helpers for platform-level permission checking.
 *
 * Permissions are a flat string[] loaded from the server on login.
 * SUPER_ADMIN bypasses all checks and sees every module / action.
 *
 * Usage:
 *   const { can, canViewModule } = usePermission();
 *   can('ORG_VIEW')         // true / false
 *   canViewModule('USERS')  // checks MODULE_PERMISSION_MAP['USERS']
 */
export function usePermission() {
  const permissions = useAuthStore((s) => s.permissions);
  const platformRoles = useAuthStore((s) => s.platformRoles);
  const globalRole = useAuthStore((s) => s.user?.globalRole);

  /** SUPER_ADMIN sees everything — no permission-by-permission gate needed */
  const isSuperAdmin =
    platformRoles?.includes('SUPER_ADMIN') || globalRole === 'SUPER_ADMIN';

  /**
   * Check if the current user has a specific platform permission.
   */
  const can = (permission: PlatformPermissionKey): boolean => {
    if (isSuperAdmin) return true;
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if the user can view a sidebar module.
   * Uses MODULE_PERMISSION_MAP to resolve the required permission.
   * Modules with no mapping are always visible.
   */
  const canViewModule = (moduleKey: string): boolean => {
    if (isSuperAdmin) return true;
    const requiredPerm = MODULE_PERMISSION_MAP[moduleKey];
    if (!requiredPerm) return true; // no gate → always visible
    return can(requiredPerm);
  };

  return { can, canViewModule, isSuperAdmin, permissions };
}
