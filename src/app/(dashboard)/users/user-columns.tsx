"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TbMailForward,
  TbShieldCheck,
  TbForbid2,
  TbArchive,
  TbArchiveOff,
  TbUserCheck,
  TbSend,
  TbDots,
  TbEye,
  TbPencil,
  TbTrash,
  TbLogout,
  TbMailCheck,
  TbMailX,
} from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { GLOBAL_ROLE_STYLE } from "./user-constants";
import type { User, Column, UserColumnsProps } from "./user-types";

// ─── Shared Cells ────────────────────────────────────────────────────────────

function getInitials(name?: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function GlobalRoleBadge({ role }: { role?: string }) {
  if (!role) return <span className="text-muted-foreground text-sm">—</span>;
  const cls = GLOBAL_ROLE_STYLE[role] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={`text-xs font-medium ${cls}`}>
      {role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  );
}

function RolesPills({ roles }: { roles?: Array<{ _id: string; name: string }> }) {
  if (!roles?.length) return <span className="text-muted-foreground text-xs">No roles</span>;
  const visible = roles.slice(0, 2);
  const rest = roles.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((r) => (
        <Badge key={r._id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20">
          {r.name}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground">+{rest}</Badge>
      )}
    </div>
  );
}

function EmailVerifiedBadge({ verified }: { verified?: boolean }) {
  if (verified === undefined) return <span className="text-muted-foreground text-xs">—</span>;
  return verified ? (
    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 gap-1">
      <TbMailCheck className="h-3 w-3" /> Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 gap-1">
      <TbMailX className="h-3 w-3" /> Unverified
    </Badge>
  );
}

function LastLoginCell({ date }: { date?: string }) {
  if (!date) return <span className="text-muted-foreground text-xs">Never</span>;
  try {
    return <span className="text-xs text-muted-foreground tabular-nums">{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>;
  } catch {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
}

function StatusBadge({ user }: { user: User }) {
  if (!user.isActive)
    return <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground border-border">Archived</Badge>;
  if (user.status === "suspended")
    return <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">Suspended</Badge>;
  return <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-[#36E59A]/10 dark:text-[#36E59A] dark:border-[#36E59A]/20">Active</Badge>;
}

function DateCell({ date }: { date?: string }) {
  if (!date) return <span className="text-muted-foreground text-xs">—</span>;
  return <span className="text-xs text-muted-foreground tabular-nums">{new Date(date).toLocaleDateString()}</span>;
}

// ─── Action Dropdown ─────────────────────────────────────────────────────────

function ActionMenu({
  user, onView, onEdit, onAssignRoles, onSuspend, onArchive, onUnarchive, onForceLogout, tab,
}: {
  user: User;
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onAssignRoles?: (u: User) => void;
  onSuspend?: (u: User) => void;
  onArchive?: (u: User) => void;
  onUnarchive?: (u: User) => void;
  onForceLogout?: (u: User) => void;
  tab: string;
}) {
  const isSuperAdmin = user.globalRole === "SUPER_ADMIN";
  const isArchived = tab === "archived";
  const isSuspended = tab === "suspended";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground data-[state=open]:bg-muted cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <TbDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onView(user); }}>
          <TbEye className="h-4 w-4 text-muted-foreground" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onEdit(user); }}>
          <TbPencil className="h-4 w-4 text-muted-foreground" /> Edit User
        </DropdownMenuItem>
        {onAssignRoles && (
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onAssignRoles(user); }}>
            <TbShieldCheck className="h-4 w-4 text-muted-foreground" /> Assign Roles
          </DropdownMenuItem>
        )}

        {onForceLogout && !isArchived && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30" onClick={(e) => { e.stopPropagation(); onForceLogout(user); }}>
              <TbLogout className="h-4 w-4" /> Force Logout
            </DropdownMenuItem>
          </>
        )}

        {!isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            {isArchived ? (
              onUnarchive && (
                <DropdownMenuItem className="cursor-pointer gap-2 text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/30" onClick={(e) => { e.stopPropagation(); onUnarchive(user); }}>
                  <TbArchiveOff className="h-4 w-4" /> Unarchive User
                </DropdownMenuItem>
              )
            ) : isSuspended ? (
              <DropdownMenuItem className="cursor-pointer gap-2 text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/30" onClick={(e) => { e.stopPropagation(); onSuspend?.(user); }}>
                <TbUserCheck className="h-4 w-4" /> Unsuspend User
              </DropdownMenuItem>
            ) : (
              <>
                {onSuspend && (
                  <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onSuspend(user); }}>
                    <TbForbid2 className="h-4 w-4" /> Suspend User
                  </DropdownMenuItem>
                )}
                {onArchive && (
                  <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onArchive(user); }}>
                    <TbArchive className="h-4 w-4" /> Archive User
                  </DropdownMenuItem>
                )}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Column Definitions ──────────────────────────────────────────────────────

function userCell(user: User, variant: "default" | "red" | "muted" = "default") {
  const styles = {
    default: { border: "border-muted", bg: "bg-primary/10 text-primary", opacity: "" },
    red: { border: "border-red-200", bg: "bg-red-50 text-red-500", opacity: "" },
    muted: { border: "border-muted", bg: "bg-muted text-muted-foreground", opacity: "opacity-60" },
  }[variant];

  return (
    <div className={`flex items-center gap-3 ${styles.opacity}`}>
      <Avatar className={`h-8 w-8 border ${styles.border} shrink-0`}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className={`${styles.bg} font-semibold text-xs`}>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className={`font-medium text-sm text-foreground truncate ${variant === "muted" ? "line-through decoration-muted-foreground/50" : ""}`}>{user.name}</span>
        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
      </div>
    </div>
  );
}

function actionCol(row: User, tab: string, props: UserColumnsProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ActionMenu
        user={row}
        tab={tab}
        onView={props.onView}
        onEdit={props.onEdit}
        onAssignRoles={props.onAssignRoles}
        onSuspend={tab === "suspended" ? props.onDelete : props.onSuspend}
        onArchive={props.onArchive}
        onUnarchive={props.onUnarchive}
        onForceLogout={props.onForceLogout}
      />
    </div>
  );
}

const ACTIONS_COL = { accessorKey: "actions", header: "", className: "text-right w-16", isAction: true };

// ─── Exported column builder ─────────────────────────────────────────────────

export const getUserColumns = (props: UserColumnsProps): Column<User>[] => {
  const { onResend, onDelete, tab = "active" } = props;

  if (tab === "invited") {
    return [
      {
        accessorKey: "email", header: "Invitee",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-muted shrink-0">
              <AvatarImage src={row.avatar || undefined} alt={row.name || row.email} />
              <AvatarFallback className="bg-amber-50 border border-amber-200 text-amber-600 font-semibold text-xs">
                {row.name && row.name !== "—" ? getInitials(row.name) : <TbMailForward className="h-3.5 w-3.5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm text-foreground truncate">{row.name && row.name !== "—" ? row.name : row.email}</span>
              {row.name && row.name !== "—" && <span className="text-xs text-muted-foreground truncate">{row.email}</span>}
              <span className="text-xs text-muted-foreground">by {row.invitedBy?.name || "Admin"}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "inviteStatus", header: "Status",
        cell: () => <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-[10px] h-5 px-1.5 hover:bg-amber-100">Pending</Badge>,
      },
      {
        accessorKey: "expiresAt", header: "Expires",
        cell: (row) => {
          if (!row.expiresAt) return <span className="text-muted-foreground text-xs">—</span>;
          const expired = new Date(row.expiresAt) < new Date();
          return <span className={`text-xs tabular-nums ${expired ? "text-red-500" : "text-muted-foreground"}`}>{expired ? "Expired · " : ""}{new Date(row.expiresAt).toLocaleDateString()}</span>;
        },
      },
      { accessorKey: "createdAt", header: "Invited", cell: (row) => <DateCell date={row.createdAt} /> },
      {
        ...ACTIONS_COL, className: "text-right w-24",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {onResend && (
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer" title="Resend invitation" onClick={(e) => { e.stopPropagation(); onResend(row); }}>
                <TbSend className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer" title="Cancel invitation" onClick={(e) => { e.stopPropagation(); onDelete(row); }}>
              <TbTrash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];
  }

  if (tab === "archived") {
    return [
      { accessorKey: "name", header: "User", cell: (user) => userCell(user, "muted") },
      { accessorKey: "globalRole", header: "Role", cell: (user) => <GlobalRoleBadge role={user.globalRole} /> },
      { accessorKey: "isEmailVerified", header: "Email", cell: (user) => <EmailVerifiedBadge verified={user.isEmailVerified} /> },
      { accessorKey: "createdAt", header: "Joined", cell: (user) => <DateCell date={user.createdAt} /> },
      { ...ACTIONS_COL, cell: (row) => actionCol(row, "archived", props) },
    ];
  }

  if (tab === "suspended") {
    return [
      { accessorKey: "name", header: "User", cell: (user) => userCell(user, "red") },
      { accessorKey: "globalRole", header: "Role", cell: (user) => <GlobalRoleBadge role={user.globalRole} /> },
      { accessorKey: "suspenseNote", header: "Reason", cell: (user) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">{user.suspenseNote || "—"}</span> },
      { accessorKey: "suspensedAt", header: "Suspended", cell: (user) => <DateCell date={user.suspensedAt} /> },
      { ...ACTIONS_COL, cell: (row) => actionCol(row, "suspended", props) },
    ];
  }

  // Active tab
  return [
    { accessorKey: "name", header: "User", cell: (user) => userCell(user) },
    { accessorKey: "globalRole", header: "Global Role", cell: (user) => <GlobalRoleBadge role={user.globalRole} /> },
    { accessorKey: "roles", header: "Platform Roles", cell: (user) => <RolesPills roles={user.roles} /> },
    { accessorKey: "isEmailVerified", header: "Email", cell: (user) => <EmailVerifiedBadge verified={user.isEmailVerified} /> },
    { accessorKey: "status", header: "Status", cell: (user) => <StatusBadge user={user} /> },
    { accessorKey: "lastLoginAt", header: "Last Login", cell: (user) => <LastLoginCell date={user.lastLoginAt} /> },
    { accessorKey: "createdAt", header: "Joined", cell: (user) => <DateCell date={user.createdAt} /> },
    { ...ACTIONS_COL, cell: (row) => actionCol(row, "active", props) },
  ];
};
