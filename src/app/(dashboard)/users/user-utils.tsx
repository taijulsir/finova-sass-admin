"use client";

import { Badge } from "@/components/ui/badge";
import {
  TbEdit, TbTrash, TbMailForward, TbArchive, TbSend,
  TbForbid2, TbArchiveOff, TbShieldCheck, TbUserCheck,
} from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  _type?: 'invitation' | 'user';
  organizationId?: { name: string };
  isActive: boolean;
  status?: string;
  suspenseNote?: string;
  suspensedAt?: string;
  suspensedBy?: { name: string; email: string };
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
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
  tab?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global-role badge colours
// ─────────────────────────────────────────────────────────────────────────────
const globalRoleStyle: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
  ADMIN:       'bg-blue-50 text-blue-700 border-blue-200',
  SUPPORT:     'bg-purple-50 text-purple-700 border-purple-200',
  USER:        'bg-gray-50 text-gray-600 border-gray-200',
  MEMBER:      'bg-gray-50 text-gray-600 border-gray-200',
};

function GlobalRoleBadge({ role }: { role?: string }) {
  if (!role) return <span className="text-muted-foreground text-sm">—</span>;
  const cls = globalRoleStyle[role] ?? 'bg-muted text-muted-foreground border-muted';
  return (
    <Badge variant="outline" className={`capitalize text-xs ${cls}`}>
      {role.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  );
}

function RolesPills({ roles }: { roles?: Array<{ _id: string; name: string }> }) {
  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground text-xs">No roles</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <Badge
          key={r._id}
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20"
        >
          {r.name}
        </Badge>
      ))}
    </div>
  );
}

export const getUserColumns = ({
  onView,
  onEdit,
  onDelete,
  onSuspend,
  onResend,
  onArchive,
  onUnarchive,
  onAssignRoles,
  tab = 'active',
}: UserColumnsProps): Column<User>[] => {
  // ── Invited tab columns ──────────────────────────────────────────────────
  if (tab === 'invited') {
    return [
      {
        accessorKey: "email",
        header: "Invitee",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-muted shrink-0">
              <AvatarImage src={row.avatar || undefined} alt={row.name || row.email} />
              <AvatarFallback className="bg-amber-50 border border-amber-200 text-amber-600 font-medium text-xs">
                {row.name && row.name !== '—'
                  ? row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                  : <TbMailForward className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {row.name && row.name !== '—' ? row.name : row.email}
              </span>
              {row.name && row.name !== '—' && (
                <span className="text-xs text-muted-foreground">{row.email}</span>
              )}
              <span className="text-xs text-muted-foreground">
                Invited by {row.invitedBy?.name || 'Admin'}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Assigned Role",
        cell: (row) => (
          <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
            {row.role || 'member'}
          </Badge>
        ),
      },
      {
        accessorKey: "inviteStatus",
        header: "Status",
        cell: () => (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 border hover:bg-amber-100">
            Pending
          </Badge>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: (row) => {
          if (!row.expiresAt) return <span className="text-muted-foreground text-sm">—</span>;
          const expired = new Date(row.expiresAt) < new Date();
          return (
            <span className={`text-sm tabular-nums ${expired ? 'text-red-500' : 'text-muted-foreground'}`}>
              {expired ? 'Expired · ' : ''}{new Date(row.expiresAt).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Invited At",
        cell: (row) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        className: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              {onResend && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => onResend(row)}
                    >
                      <TbSend className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resend Invitation</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => onDelete(row)}
                  >
                    <TbTrash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel Invitation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ];
  }

  // ── Archived tab columns ─────────────────────────────────────────────────
  if (tab === 'archived') {
    return [
      {
        accessorKey: "name",
        header: "User",
        cell: (user) => (
          <div className="flex items-center gap-3 opacity-60">
            <Avatar className="h-9 w-9 border border-muted">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground line-through decoration-muted-foreground/50">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "globalRole",
        header: "Global Role",
        cell: (user) => <GlobalRoleBadge role={user.globalRole} />,
      },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: (user) => <RolesPills roles={user.roles} />,
      },
      {
        accessorKey: "createdAt",
        header: "Archived At",
        cell: (user) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        className: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              {onUnarchive && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-green-600 cursor-pointer"
                      onClick={() => onUnarchive(row)}
                    >
                      <TbArchiveOff className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unarchive User</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        ),
      },
    ];
  }

  // ── Suspended tab columns ─────────────────────────────────────────────────
  if (tab === 'suspended') {
    return [
      {
        accessorKey: "name",
        header: "User",
        cell: (user) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-red-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-red-50 text-red-500 font-medium text-xs">
                {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "globalRole",
        header: "Global Role",
        cell: (user) => <GlobalRoleBadge role={user.globalRole} />,
      },
      {
        accessorKey: "suspenseNote",
        header: "Reason",
        cell: (user) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-45">
            {user.suspenseNote || '—'}
          </span>
        ),
      },
      {
        accessorKey: "suspensedAt",
        header: "Suspended At",
        cell: (user) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {user.suspensedAt ? new Date(user.suspensedAt).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        className: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 cursor-pointer"
                    onClick={() => onDelete(row)}
                  >
                    <TbUserCheck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unsuspend User</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ];
  }

  // ── Active tab columns ───────────────────────────────────────────────────
  return [
    {
      accessorKey: "name",
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-muted">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "globalRole",
      header: "Global Role",
      cell: (user) => <GlobalRoleBadge role={user.globalRole} />,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: (user) => <RolesPills roles={user.roles} />,
    },
    {
      accessorKey: "organizationId",
      header: "Organization",
      cell: (user) => (
        <span className="text-sm text-foreground">{user.organizationId?.name || 'Self-Managed'}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (user) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const isSuperAdmin = row.globalRole === 'SUPER_ADMIN';
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={() => onEdit(row)}
                  >
                    <TbEdit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit User</TooltipContent>
              </Tooltip>

              {/* Assign Roles */}
              {onAssignRoles && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => onAssignRoles(row)}
                    >
                      <TbShieldCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Assign Roles</TooltipContent>
                </Tooltip>
              )}

              {/* Suspend — not for superadmin */}
              {!isSuperAdmin && onSuspend && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 cursor-pointer"
                      onClick={() => onSuspend(row)}
                    >
                      <TbForbid2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Suspend User</TooltipContent>
                </Tooltip>
              )}

              {/* Archive — not for superadmin */}
              {!isSuperAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => onArchive ? onArchive(row) : onDelete(row)}
                    >
                      <TbArchive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Archive User</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        );
      },
    },
  ];
};
