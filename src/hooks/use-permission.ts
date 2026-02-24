import { useAuthStore } from '@/lib/store';
import type { ModuleKey, ActionKey } from '@/lib/permissions';

/**
 * Returns helpers for permission checking.
 *
 * SUPER_ADMIN always gets full access regardless of designation.
 *
 * Usage:
 *   const { can, canView } = usePermission();
 *   can('USERS', 'CREATE')   // true / false
 *   canView('USERS')         // true / false
 */
export function usePermission() {
  const { user, permissions } = useAuthStore();
  const isSuperAdmin = user?.globalRole === 'SUPER_ADMIN';

  /**
   * Check if the current user has a specific action on a module.
   * Super admins always return true.
   */
  const can = (module: ModuleKey, action: ActionKey): boolean => {
    if (isSuperAdmin) return true;
    return (permissions?.[module] ?? []).includes(action);
  };

  const canView    = (module: ModuleKey) => can(module, 'VIEW');
  const canCreate  = (module: ModuleKey) => can(module, 'CREATE');
  const canEdit    = (module: ModuleKey) => can(module, 'EDIT');
  const canArchive = (module: ModuleKey) => can(module, 'ARCHIVE');

  return { can, canView, canCreate, canEdit, canArchive, isSuperAdmin };
}
