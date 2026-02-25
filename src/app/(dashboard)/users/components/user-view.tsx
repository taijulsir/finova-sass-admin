import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TbEdit } from "react-icons/tb";

interface UserViewProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: any) => void;
}

export function UserView({
  user,
  isOpen,
  onClose,
  onEdit,
}: UserViewProps) {
  if (!user) return null;

  const isSuspended = user.status === 'suspended';
  const isArchived = !user.isActive;

  return (
    <Modal
      title="User Details"
      description="View detailed information about this user."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 pt-2">
        {/* Avatar + name header */}
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
              : (user.name?.charAt(0) || user.email?.charAt(0) || '?')}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {isSuspended && (
                <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs">Suspended</Badge>
              )}
              {isArchived && (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200 border text-xs">Archived</Badge>
              )}
              {!isSuspended && !isArchived && (
                <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs">Active</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Role</p>
            <p className="text-base capitalize font-semibold text-foreground">{user.globalRole || user.role || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Joined At</p>
            <p className="text-base text-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          {user.organizationId && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization</p>
              <p className="text-base text-foreground truncate">{user.organizationId.name || 'N/A'}</p>
            </div>
          )}
          <div className="space-y-1 col-span-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
            <code className="text-[11px] font-mono bg-muted p-1 px-1.5 rounded text-muted-foreground break-all">
              {user._id}
            </code>
          </div>
        </div>

        {/* ── Suspension details ── */}
        {isSuspended && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 dark:bg-red-950/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">Suspension Details</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suspended At</p>
                <p className="text-sm text-foreground">
                  {user.suspensedAt ? new Date(user.suspensedAt).toLocaleString() : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suspended By</p>
                <p className="text-sm text-foreground">
                  {user.suspensedBy?.name || user.suspensedBy?.email || 'Admin'}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</p>
                <p className="text-sm text-foreground">{user.suspenseNote || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        {!isSuspended && !isArchived && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t mt-2">
            <Button
              variant="outline"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 cursor-pointer"
              onClick={() => onEdit(user)}
            >
              <TbEdit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
