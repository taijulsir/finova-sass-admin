import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TbEdit, TbArchive } from "react-icons/tb";
import { Organization } from "../organization-utils";

interface OrganizationViewProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (org: Organization) => void;
  onArchive: (org: Organization) => void;
}

const subscriptionStatusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  trial: "bg-blue-100 text-blue-800",
  past_due: "bg-amber-100 text-amber-800",
  canceled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-600",
};

export function OrganizationView({
  organization,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: OrganizationViewProps) {
  if (!organization) return null;

  const sub = organization.subscription;

  return (
    <Modal
      title="Organization Details"
      description="View detailed information about this organization."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 pt-2">
        {/* ── Organization Info ───────────────────────────────────── */}
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
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Owner Email</p>
            <p className="text-base text-foreground underline decoration-muted">{organization.ownerId?.email || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created At</p>
            <p className="text-base text-foreground">{new Date(organization.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization ID</p>
            <code className="text-[11px] font-mono bg-muted p-1 px-1.5 rounded text-muted-foreground break-all">
              {organization.organizationId || organization._id}
            </code>
          </div>
        </div>

        {/* ── Subscription Info ──────────────────────────────────── */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Subscription</h4>
          {sub ? (
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                <Badge variant="outline" className="capitalize bg-muted/30">
                  {sub.planName}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <Badge className={subscriptionStatusStyles[sub.status] || "bg-gray-100 text-gray-600"}>
                  {sub.isTrial ? "Trial" : sub.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Billing Cycle</p>
                <p className="text-sm capitalize text-foreground">{sub.billingCycle || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Created By</p>
                <p className="text-sm capitalize text-foreground">{sub.createdBy || "—"}</p>
              </div>
              {sub.isTrial && sub.trialEndDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Trial Ends</p>
                  <p className="text-sm text-foreground">{new Date(sub.trialEndDate).toLocaleDateString()}</p>
                </div>
              )}
              {sub.renewalDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Renewal Date</p>
                  <p className="text-sm text-foreground">{new Date(sub.renewalDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No active subscription</p>
          )}
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
        </div>
      </div>
    </Modal>
  );
}
