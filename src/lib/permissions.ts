/**
 * PLATFORM_PERMISSIONS — mirrors backend src/constants/platform-permissions.ts
 * Keep these in sync. Never rename — they are stable DB identifiers.
 */
export const PLATFORM_PERMISSIONS = {
  // Organizations
  ORG_VIEW:     'ORG_VIEW',
  ORG_CREATE:   'ORG_CREATE',
  ORG_EDIT:     'ORG_EDIT',
  ORG_SUSPEND:  'ORG_SUSPEND',
  ORG_DELETE:   'ORG_DELETE',
  // Plans
  PLAN_VIEW:    'PLAN_VIEW',
  PLAN_CREATE:  'PLAN_CREATE',
  PLAN_CHANGE:  'PLAN_CHANGE',
  // Subscriptions
  SUBSCRIPTION_VIEW: 'SUBSCRIPTION_VIEW',
  // Analytics
  ANALYTICS_VIEW: 'ANALYTICS_VIEW',
  // Audit
  AUDIT_VIEW: 'AUDIT_VIEW',
  // Admin Users
  ADMIN_VIEW:    'ADMIN_VIEW',
  ADMIN_INVITE:  'ADMIN_INVITE',
  ADMIN_EDIT:    'ADMIN_EDIT',
  ADMIN_SUSPEND: 'ADMIN_SUSPEND',
  // Designations / Platform Roles
  DESIGNATION_VIEW:    'DESIGNATION_VIEW',
  DESIGNATION_CREATE:  'DESIGNATION_CREATE',
  DESIGNATION_EDIT:    'DESIGNATION_EDIT',
  DESIGNATION_ARCHIVE: 'DESIGNATION_ARCHIVE',
} as const;

export type PlatformPermissionKey = typeof PLATFORM_PERMISSIONS[keyof typeof PLATFORM_PERMISSIONS];

/** Sidebar module → required view permission mapping */
export const MODULE_PERMISSION_MAP: Record<string, PlatformPermissionKey> = {
  DASHBOARD:     PLATFORM_PERMISSIONS.ORG_VIEW,
  ORGANIZATIONS: PLATFORM_PERMISSIONS.ORG_VIEW,
  SUBSCRIPTIONS: PLATFORM_PERMISSIONS.SUBSCRIPTION_VIEW,
  USERS:         PLATFORM_PERMISSIONS.ADMIN_VIEW,
  DESIGNATIONS:  PLATFORM_PERMISSIONS.DESIGNATION_VIEW,
  AUDIT:         PLATFORM_PERMISSIONS.AUDIT_VIEW,
  ANALYTICS:     PLATFORM_PERMISSIONS.ANALYTICS_VIEW,
  SETTINGS:      PLATFORM_PERMISSIONS.ORG_VIEW,
};

// ── Legacy: kept so designation-form.tsx still compiles ─────────────────────
export const ADMIN_MODULES = [
  { key: 'DASHBOARD',      label: 'Dashboard' },
  { key: 'ORGANIZATIONS',  label: 'Organizations' },
  { key: 'SUBSCRIPTIONS',  label: 'Subscriptions' },
  { key: 'USERS',          label: 'Users' },
  { key: 'DESIGNATIONS',   label: 'Designations' },
  { key: 'AUDIT',          label: 'Audit Logs' },
  { key: 'ANALYTICS',      label: 'Analytics' },
  { key: 'SETTINGS',       label: 'Settings' },
] as const;

export const ADMIN_ACTIONS = [
  { key: 'VIEW',    label: 'View' },
  { key: 'CREATE',  label: 'Create' },
  { key: 'EDIT',    label: 'Edit' },
  { key: 'ARCHIVE', label: 'Archive' },
] as const;

export type ModuleKey = typeof ADMIN_MODULES[number]['key'];
export type ActionKey = typeof ADMIN_ACTIONS[number]['key'];
/** @deprecated use string[] from PLATFORM_PERMISSIONS */
export type PermissionMap = Partial<Record<ModuleKey, ActionKey[]>>;

