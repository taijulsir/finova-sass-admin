"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  TbEdit,
  TbShieldCheck,
  TbLogout,
  TbMailCheck,
  TbMailX,
  TbUser,
  TbClock,
  TbCalendar,
  TbLogin,
  TbHash,
  TbBuilding,
  TbAlertTriangle,
} from "react-icons/tb";
import { formatDistanceToNow } from "date-fns";

interface UserDetailDrawerProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: any) => void;
  onAssignRoles?: (user: any) => void;
  onForceLogout?: (user: any) => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider min-w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

export function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  onEdit,
  onAssignRoles,
  onForceLogout,
}: UserDetailDrawerProps) {
  if (!user) return null;

  const isSuspended = user.status === "suspended";
  const isArchived = !user.isActive;
  const isActive = !isSuspended && !isArchived;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-105 sm:w-120 overflow-y-auto flex flex-col gap-0 p-0">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-border shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight truncate">
                {user.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </SheetDescription>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {isActive && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                    Active
                  </Badge>
                )}
                {isSuspended && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                    Suspended
                  </Badge>
                )}
                {isArchived && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground border-border">
                    Archived
                  </Badge>
                )}
                {user.isEmailVerified ? (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 gap-1">
                    <TbMailCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 gap-1">
                    <TbMailX className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── Profile ────────────────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TbUser className="h-3.5 w-3.5" /> Profile
            </p>
            <div className="divide-y divide-border/50">
              <DetailRow label="Global Role">
                <Badge variant="outline" className="text-xs font-medium">
                  {(user.globalRole || user.role || "USER").replace(/_/g, " ")}
                </Badge>
              </DetailRow>
              {user.organizationId && (
                <DetailRow label="Organization">
                  <span className="text-sm text-foreground flex items-center gap-1 justify-end">
                    <TbBuilding className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.organizationId.name}
                  </span>
                </DetailRow>
              )}
              <DetailRow label="User ID">
                <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground break-all">
                  {user._id}
                </code>
              </DetailRow>
            </div>
          </div>

          <Separator />

          {/* ── Platform Roles ─────────────────────────────────────────────── */}
          {user.roles && user.roles.length > 0 && (
            <>
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TbShieldCheck className="h-3.5 w-3.5" /> Platform Roles
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r: { _id: string; name: string }) => (
                    <Badge
                      key={r._id}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {r.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* ── Activity ───────────────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TbClock className="h-3.5 w-3.5" /> Activity
            </p>
            <div className="divide-y divide-border/50">
              <DetailRow label="Last Login">
                {user.lastLoginAt ? (
                  <span className="text-sm text-foreground flex items-center gap-1 justify-end">
                    <TbLogin className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Never</span>
                )}
              </DetailRow>
              <DetailRow label="Login Count">
                <span className="text-sm text-foreground flex items-center gap-1 justify-end">
                  <TbHash className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.loginCount ?? 0} session{(user.loginCount ?? 0) !== 1 ? "s" : ""}
                </span>
              </DetailRow>
              <DetailRow label="Joined">
                <span className="text-sm text-foreground flex items-center gap-1 justify-end">
                  <TbCalendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </DetailRow>
            </div>
          </div>

          {/* ── Suspension Details ─────────────────────────────────────────── */}
          {isSuspended && (
            <>
              <Separator />
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TbAlertTriangle className="h-3.5 w-3.5" /> Suspension Details
                </p>
                <div className="divide-y divide-border/50">
                  <DetailRow label="Suspended">
                    <span className="text-sm text-foreground">
                      {user.suspensedAt
                        ? new Date(user.suspensedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : "—"}
                    </span>
                  </DetailRow>
                  <DetailRow label="By">
                    <span className="text-sm text-foreground">
                      {user.suspensedBy?.name || user.suspensedBy?.email || "Admin"}
                    </span>
                  </DetailRow>
                  {user.suspenseNote && (
                    <DetailRow label="Reason">
                      <span className="text-sm text-foreground text-right">{user.suspenseNote}</span>
                    </DetailRow>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Actions Footer ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t mt-auto space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 cursor-pointer"
              onClick={() => { onEdit(user); onClose(); }}
            >
              <TbEdit className="h-4 w-4" />
              Edit User
            </Button>
            {onAssignRoles && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 cursor-pointer"
                onClick={() => { onAssignRoles(user); onClose(); }}
              >
                <TbShieldCheck className="h-4 w-4" />
                Assign Roles
              </Button>
            )}
          </div>
          {onForceLogout && !isArchived && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 cursor-pointer"
              onClick={() => { onForceLogout(user); onClose(); }}
            >
              <TbLogout className="h-4 w-4" />
              Force Logout All Sessions
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
