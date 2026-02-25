// ─── User Module Types ───────────────────────────────────────────────────────

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  globalRole?: string;
  roles?: Array<{ _id: string; name: string; color?: string }>;
  avatar?: string;
  createdAt: string;
  inviteStatus?: string;
  expiresAt?: string;
  invitedBy?: { name: string; email: string };
  _type?: "invitation" | "user";
  organizationId?: { name: string };
  isActive: boolean;
  isEmailVerified?: boolean;
  status?: string;
  suspenseNote?: string;
  suspensedAt?: string;
  suspensedBy?: { name: string; email: string };
  lastLoginAt?: string;
  loginCount?: number;
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  isAction?: boolean;
}

export interface UserColumnsProps {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onSuspend?: (user: User) => void;
  onResend?: (user: User) => void;
  onArchive?: (user: User) => void;
  onUnarchive?: (user: User) => void;
  onAssignRoles?: (user: User) => void;
  onForceLogout?: (user: User) => void;
  tab?: string;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: User | null;
  isLoading: boolean;
  onConfirm: () => void;
}
