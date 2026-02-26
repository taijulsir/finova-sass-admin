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
  // Coupons
  COUPON_VIEW:   'COUPON_VIEW',
  COUPON_CREATE: 'COUPON_CREATE',
  COUPON_EDIT:   'COUPON_EDIT',
  COUPON_DELETE: 'COUPON_DELETE',
  // Feature Flags
  FEATURE_FLAG_VIEW:   'FEATURE_FLAG_VIEW',
  FEATURE_FLAG_TOGGLE: 'FEATURE_FLAG_TOGGLE',
  // Support Tickets
  SUPPORT_VIEW:   'SUPPORT_VIEW',
  SUPPORT_MANAGE: 'SUPPORT_MANAGE',
  // Feedback
  FEEDBACK_VIEW: 'FEEDBACK_VIEW',
  // Billing Events
  BILLING_EVENT_VIEW: 'BILLING_EVENT_VIEW',
  // System Logs
  SYSTEM_LOG_VIEW: 'SYSTEM_LOG_VIEW',
} as const;

export type PlatformPermissionKey = typeof PLATFORM_PERMISSIONS[keyof typeof PLATFORM_PERMISSIONS];

/** Sidebar module → required view permission mapping.
 *  A missing key means the item is always visible (no permission gate). */
export const MODULE_PERMISSION_MAP: Record<string, PlatformPermissionKey> = {
  ORGANIZATIONS:  PLATFORM_PERMISSIONS.ORG_VIEW,
  SUBSCRIPTIONS:  PLATFORM_PERMISSIONS.SUBSCRIPTION_VIEW,
  PLANS:          PLATFORM_PERMISSIONS.PLAN_VIEW,
  USERS:          PLATFORM_PERMISSIONS.ADMIN_VIEW,
  ROLES:          PLATFORM_PERMISSIONS.DESIGNATION_VIEW,
  AUDIT:          PLATFORM_PERMISSIONS.AUDIT_VIEW,
  ANALYTICS:      PLATFORM_PERMISSIONS.ANALYTICS_VIEW,
  COUPONS:        PLATFORM_PERMISSIONS.COUPON_VIEW,
  FEATURE_FLAGS:  PLATFORM_PERMISSIONS.FEATURE_FLAG_VIEW,
  SUPPORT:        PLATFORM_PERMISSIONS.SUPPORT_VIEW,
  FEEDBACK:       PLATFORM_PERMISSIONS.FEEDBACK_VIEW,
  BILLING_EVENTS: PLATFORM_PERMISSIONS.BILLING_EVENT_VIEW,
  SYSTEM_LOGS:    PLATFORM_PERMISSIONS.SYSTEM_LOG_VIEW,
  // DASHBOARD and SETTINGS have no gate — always visible to authenticated admins
};

export const ADMIN_MODULES = [
  { key: 'DASHBOARD',      label: 'Dashboard' },
  { key: 'ORGANIZATIONS',  label: 'Organizations' },
  { key: 'SUBSCRIPTIONS',  label: 'Subscriptions' },
  { key: 'PLANS',          label: 'Plans' },
  { key: 'USERS',          label: 'Users' },
  { key: 'ROLES',          label: 'Roles & Permissions' },
  { key: 'ANALYTICS',      label: 'Analytics' },
  { key: 'AUDIT',          label: 'Audit Logs' },
  { key: 'COUPONS',        label: 'Coupons' },
  { key: 'FEATURE_FLAGS',  label: 'Feature Flags' },
  { key: 'SUPPORT',        label: 'Support Tickets' },
  { key: 'FEEDBACK',       label: 'Feedback' },
  { key: 'BILLING_EVENTS', label: 'Billing Events' },
  { key: 'SYSTEM_LOGS',    label: 'System Logs' },
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
