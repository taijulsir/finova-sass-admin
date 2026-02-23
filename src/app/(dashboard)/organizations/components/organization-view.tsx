import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TbEdit, TbArchive } from "react-icons/tb";

interface OrganizationViewProps {
  organization: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (org: any) => void;
  onArchive: (org: any) => void;
}

export function OrganizationView({
  organization,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: OrganizationViewProps) {
  if (!organization) return null;

  return (
    <Modal
      title="Organization Details"
      description="View detailed information about this organization."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Name</p>
            <p className="text-base font-semibold text-foreground">{organization.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              organization.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {organization.status}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
            <p className="text-base capitalize text-foreground">{organization.plan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Owner Email</p>
            <p className="text-base text-foreground underline decoration-muted">{organization.ownerId?.email || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created At</p>
            <p className="text-base text-foreground">{new Date(organization.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization ID</p>
            <code className="text-[11px] font-mono bg-muted p-1 px-1.5 rounded text-muted-foreground break-all">
              {organization._id}
            </code>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t mt-4">
          <Button 
            variant="outline" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
            onClick={() => onEdit(organization)}
          >
            <TbEdit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="outline" 
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
            onClick={() => onArchive(organization)}
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
