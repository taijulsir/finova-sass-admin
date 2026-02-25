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
  isActive: boolean;
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

      // All roles: data.data.roles (paginated) or data.data (array)
      const roles: Role[] =
        allRolesRes?.data?.roles ??
        allRolesRes?.data ??
        allRolesRes?.roles ??
        [];
      setAllRoles(roles.filter((r: Role) => r.isActive !== false));

      // User roles: array of role objects
      const userRoles: any[] =
        userRolesRes?.data ??
        userRolesRes ??
        [];
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
      title="Assign Roles"
      description={`Manage platform roles for ${user?.name || user?.email || "this user"}`}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="space-y-4 py-2">
        {/* User info header */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
              : (user?.name?.charAt(0) || user?.email?.charAt(0) || "?")}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground text-sm truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          {user?.globalRole && (
            <Badge variant="outline" className="ml-auto shrink-0 text-xs capitalize">
              {user.globalRole.replace("_", " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Badge>
          )}
        </div>

        {/* Roles list */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Platform Roles
          </p>
          {loadingRoles ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : allRoles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No platform roles found. Create roles in the Roles section first.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {allRoles.map((role) => {
                const isAssigned = assignedRoleIds.has(role._id);
                const isSaving = savingRoleId === role._id;
                return (
                  <div
                    key={role._id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isAssigned
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          isAssigned ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <TbShieldCheckIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-muted-foreground truncate">{role.description}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isAssigned ? "destructive" : "default"}
                      size="sm"
                      className="ml-3 shrink-0 min-w-22"
                      onClick={() => handleToggleRole(role)}
                      disabled={!!savingRoleId}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAssigned ? (
                        <><TbShieldX className="h-3 w-3 mr-1" />Remove</>
                      ) : (
                        <><TbShieldCheckIcon className="h-3 w-3 mr-1" />Assign</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
