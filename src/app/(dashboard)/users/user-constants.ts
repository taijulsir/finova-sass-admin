// ─── User Module Constants ───────────────────────────────────────────────────

export const USER_TABS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Archived", value: "archived" },
  { label: "Invited", value: "invited" },
] as const;

export const GLOBAL_ROLE_STYLE: Record<string, string> = {
  SUPER_ADMIN:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  ADMIN:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  SUPPORT:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  USER: "bg-muted text-muted-foreground border-border",
  MEMBER: "bg-muted text-muted-foreground border-border",
};

export const GLOBAL_ROLE_OPTIONS = [
  { label: "User", value: "USER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Support", value: "SUPPORT" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
] as const;
