"use client";

import { Badge } from "@/components/ui/badge";
import { TbEdit, TbTrash, TbMailForward, TbArchive, TbPlayerPause } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  inviteStatus?: string;
  expiresAt?: string;
  invitedBy?: { name: string; email: string };
  _type?: 'invitation' | 'user';
  organizationId?: { name: string };
  isActive: boolean;
  status?: string;
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
  tab?: string;
}

export const getUserColumns = ({
  onView,
  onEdit,
  onDelete,
  onSuspend,
  tab = 'active',
}: UserColumnsProps): Column<User>[] => {
  // ── Invited tab columns ──────────────────────────────────────────────────
  if (tab === 'invited') {
    return [
      {
        accessorKey: "email",
        header: "Invited Email",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <TbMailForward className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{row.email}</span>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

  // ── User tab columns (Active, Archvied, Suspended) ───────────────────────
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
      accessorKey: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
          {user.role}
        </Badge>
      ),
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
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(row)}
                >
                  <TbEdit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit User</TooltipContent>
            </Tooltip>

            {/* Suspend — only on active tab for active users */}
            {tab === 'active' && row.status !== 'suspended' && onSuspend && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                    onClick={() => onSuspend(row)}
                  >
                    <TbPlayerPause className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Suspend User</TooltipContent>
              </Tooltip>
            )}

            {row.isActive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(row)}
                  >
                    <TbArchive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive User</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      ),
    },
  ];
};

