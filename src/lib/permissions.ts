/** Mirror of the backend AdminModule / AdminAction enums */

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

export type ModuleKey   = typeof ADMIN_MODULES[number]['key'];
export type ActionKey   = typeof ADMIN_ACTIONS[number]['key'];

/** { DASHBOARD: ['VIEW'], USERS: ['VIEW','CREATE','EDIT','ARCHIVE'], ... } */
export type PermissionMap = Partial<Record<ModuleKey, ActionKey[]>>;
