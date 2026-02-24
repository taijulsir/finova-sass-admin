import { useAuthStore } from '@/lib/store';
import type { PlatformPermissionKey } from '@/lib/permissions';
import { MODULE_PERMISSION_MAP } from '@/lib/permissions';

/**
 * usePermission
 * -------------
 * Returns helpers for platform-level permission checking.
 *
 * Permissions are a flat string[] loaded from the server on login.
 * Every check goes through the array — no role-name bypass.
 *
 * Usage:
 *   const { can, canViewModule } = usePermission();
 *   can('ORG_VIEW')         // true / false
 *   canViewModule('USERS')  // checks MODULE_PERMISSION_MAP['USERS']
 */
export function usePermission() {
  const { permissions } = useAuthStore();

  /**
   * Check if the current user has a specific platform permission.
   */
  const can = (permission: PlatformPermissionKey): boolean => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if the user can view a sidebar module.
   * Uses MODULE_PERMISSION_MAP to resolve the required permission.
   */
  const canViewModule = (moduleKey: string): boolean => {
    const requiredPerm = MODULE_PERMISSION_MAP[moduleKey];
    if (!requiredPerm) return false;
    return can(requiredPerm);
  };

  return { can, canViewModule, permissions };
}

