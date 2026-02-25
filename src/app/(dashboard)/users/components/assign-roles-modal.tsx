"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TbShieldCheck as TbShieldCheckIcon, TbShieldX } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";

interface Role {
  _id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt?: string;
}

interface AssignRolesModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignRolesModal({ user, isOpen, onClose, onSuccess }: AssignRolesModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<string>>(new Set());
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?._id || !isOpen) return;
    setLoadingRoles(true);
    try {
      const [allRolesRes, userRolesRes] = await Promise.all([
        AdminService.getPlatformRoles(),
        AdminService.getUserPlatformRoles(user._id),
      ]);

      // GET /platform-rbac/roles → { success, data: { roles: [...], total, page, ... } }
      const rolesPayload = allRolesRes?.data;
      const roles: Role[] = Array.isArray(rolesPayload?.roles)
        ? rolesPayload.roles
        : Array.isArray(rolesPayload)
        ? rolesPayload
        : [];
      setAllRoles(roles);

      // GET /platform-rbac/users/:userId/roles → { success, data: [...roleObjects] }
      const userRolesPayload = userRolesRes?.data;
      const userRoles: any[] = Array.isArray(userRolesPayload) ? userRolesPayload : [];
      const ids = new Set<string>(userRoles.map((r: any) => r._id?.toString()));
      setAssignedRoleIds(ids);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  }, [user?._id, isOpen]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleRole = async (role: Role) => {
    if (savingRoleId) return;
    setSavingRoleId(role._id);
    const isAssigned = assignedRoleIds.has(role._id);
    try {
      if (isAssigned) {
        await AdminService.removePlatformRole(user._id, role._id);
        setAssignedRoleIds((prev) => {
          const next = new Set(prev);
          next.delete(role._id);
          return next;
        });
        toast.success(`Removed role "${role.name}"`);
      } else {
        await AdminService.assignPlatformRole(user._id, role._id);
        setAssignedRoleIds((prev) => new Set([...prev, role._id]));
        toast.success(`Assigned role "${role.name}"`);
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? `Failed to ${isAssigned ? "remove" : "assign"} role`);
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleClose = () => {
    setAllRoles([]);
    setAssignedRoleIds(new Set());
    onClose();
  };

  return (
    <Modal
      title="Assign Platform Roles"
      description={`Manage platform roles for ${user?.name || user?.email || "this user"}`}
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <div className="space-y-5 py-1">
        {/* User info header */}
        <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
          <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0 overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
              : (user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?")}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-foreground text-base leading-tight truncate">{user?.name}</span>
            <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
          </div>
          {user?.globalRole && (
            <Badge
              variant="outline"
              className="shrink-0 text-xs px-2.5 py-1 capitalize font-medium"
            >
              {user.globalRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Badge>
          )}
        </div>

        {/* Roles list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Platform Roles</p>
            <span className="text-xs text-muted-foreground">
              {assignedRoleIds.size} role{assignedRoleIds.size !== 1 ? "s" : ""} assigned
            </span>
          </div>

          {loadingRoles ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : allRoles.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No platform roles found. Create roles in the Roles section first.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {allRoles.map((role) => {
                const isAssigned = assignedRoleIds.has(role._id);
                const isSaving = savingRoleId === role._id;
                return (
                  <div
                    key={role._id}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      isAssigned
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
                    }`}
                  >
                    {/* Role icon */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isAssigned
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <TbShieldCheckIcon className="h-5 w-5" />
                    </div>

                    {/* Role name + description */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {role.name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        {isAssigned && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                            Assigned
                          </Badge>
                        )}
                        {role.isSystem && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                            System
                          </Badge>
                        )}
                      </div>
                      {role.description ? (
                        <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{role.description}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 mt-0.5 italic">No description</span>
                      )}
                    </div>

                    {/* Action button */}
                    <Button
                      variant={isAssigned ? "outline" : "default"}
                      size="sm"
                      className={`shrink-0 min-w-24 transition-all ${
                        isAssigned
                          ? "border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          : ""
                      }`}
                      onClick={() => handleToggleRole(role)}
                      disabled={!!savingRoleId}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isAssigned ? (
                        <><TbShieldX className="h-3.5 w-3.5 mr-1.5" />Remove</>
                      ) : (
                        <><TbShieldCheckIcon className="h-3.5 w-3.5 mr-1.5" />Assign</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1 border-t">
          <Button variant="outline" onClick={handleClose} className="mt-3">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
