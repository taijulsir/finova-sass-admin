// ─── User Advanced Filter Types & Constants ──────────────────────────────────

export interface UserFilters {
  roles: string[];          // globalRole values: SUPER_ADMIN, ADMIN, SUPPORT, USER
  statuses: string[];       // active | suspended | archived | invited
  emailVerified: '' | 'true' | 'false';
  lastLogin: '' | 'never' | '24h' | '7d' | '30d' | 'custom';
  lastLoginFrom: string;    // ISO date string for custom range
  lastLoginTo: string;
  joinedFrom: string;       // ISO date string
  joinedTo: string;
}

export const DEFAULT_FILTERS: UserFilters = {
  roles: [],
  statuses: [],
  emailVerified: '',
  lastLogin: '',
  lastLoginFrom: '',
  lastLoginTo: '',
  joinedFrom: '',
  joinedTo: '',
};

// ── Option lists ──────────────────────────────────────────────────────────────

export const ROLE_FILTER_OPTIONS = [
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Support', value: 'SUPPORT' },
  { label: 'User', value: 'USER' },
] as const;

export const STATUS_FILTER_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Archived', value: 'archived' },
  { label: 'Invited', value: 'invited' },
] as const;

export const EMAIL_VERIFIED_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Verified', value: 'true' },
  { label: 'Not Verified', value: 'false' },
] as const;

export const LAST_LOGIN_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Never logged in', value: 'never' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range…', value: 'custom' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true when at least one filter has a non-default value */
export function hasActiveFilters(f: UserFilters): boolean {
  return (
    f.roles.length > 0 ||
    f.statuses.length > 0 ||
    f.emailVerified !== '' ||
    f.lastLogin !== '' ||
    f.joinedFrom !== '' ||
    f.joinedTo !== ''
  );
}

/** Compute the number of distinct filter groups that are active */
export function activeFilterCount(f: UserFilters): number {
  let n = 0;
  if (f.roles.length > 0) n++;
  if (f.statuses.length > 0) n++;
  if (f.emailVerified !== '') n++;
  if (f.lastLogin !== '') n++;
  if (f.joinedFrom !== '' || f.joinedTo !== '') n++;
  return n;
}

/**
 * Serialize filters to plain query-param-compatible object.
 * Omits empty/default values so URLs stay clean.
 */
export function filtersToParams(f: UserFilters): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.roles.length) p.roles = f.roles.join(',');
  if (f.statuses.length) p.statuses = f.statuses.join(',');
  if (f.emailVerified !== '') p.emailVerified = f.emailVerified;
  if (f.lastLogin !== '') p.lastLogin = f.lastLogin;
  if (f.lastLogin === 'custom' && f.lastLoginFrom) p.lastLoginFrom = f.lastLoginFrom;
  if (f.lastLogin === 'custom' && f.lastLoginTo) p.lastLoginTo = f.lastLoginTo;
  if (f.joinedFrom !== '') p.joinedFrom = f.joinedFrom;
  if (f.joinedTo !== '') p.joinedTo = f.joinedTo;
  return p;
}
