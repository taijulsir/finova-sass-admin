import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TbEdit, TbArchive } from "react-icons/tb";

interface UserViewProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: any) => void;
  onArchive: (user: any) => void;
}

export function UserView({
  user,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: UserViewProps) {
  if (!user) return null;

  return (
    <Modal
      title="User Details"
      description="View detailed information about this user."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 pt-2">
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {user.name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Role</p>
            <p className="text-base capitalize font-semibold text-foreground">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.status}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Joined At</p>
            <p className="text-base text-foreground underline decoration-muted">
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
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t mt-4">
          <Button 
            variant="outline" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
            onClick={() => onEdit(user)}
          >
            <TbEdit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="outline" 
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
            onClick={() => onArchive(user)}
          >
            <TbArchive className="mr-2 h-4 w-4" /> Archive
          </Button>
          <Button variant="secondary" onClick={onClose} className="sm:w-auto w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
