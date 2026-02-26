import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TbEdit, TbArchive, TbCurrencyDollar } from "react-icons/tb";

interface SubscriptionViewProps {
  subscription: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sub: any) => void;
  onArchive: (sub: any) => void;
}

const subscriptionStatusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  past_due: "bg-amber-100 text-amber-800",
  canceled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-600",
};

export function SubscriptionView({
  subscription,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: SubscriptionViewProps) {
  if (!subscription) return null;

  const sub = subscription.subscription;

  return (
    <Modal
      title="Subscription Details"
      description="View detailed information about the organization's subscription plan."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 pt-2">
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            <TbCurrencyDollar />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground capitalize">
              {sub?.planName || "No Plan"} {sub?.isTrial && <span className="text-sm font-normal text-blue-600">(Trial)</span>}
            </h3>
            <p className="text-sm text-muted-foreground">{subscription.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
            <Badge variant="outline" className="capitalize bg-muted/30">
              {sub?.planName || "None"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</p>
            <Badge className={subscriptionStatusStyles[sub?.status] || "bg-gray-100 text-gray-600"}>
              {sub?.isTrial ? "Trial" : sub?.status || "None"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Billing Cycle</p>
            <p className="text-base capitalize text-foreground">{sub?.billingCycle || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Billing Email</p>
            <p className="text-base text-foreground underline decoration-muted">{subscription.ownerId?.email || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Renewal Date</p>
            <p className="text-base text-foreground">
              {sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Source</p>
            <p className="text-base capitalize text-foreground">{sub?.createdBy || "—"}</p>
          </div>
          {sub?.isTrial && sub.trialEndDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trial Ends</p>
              <p className="text-base text-foreground">{new Date(sub.trialEndDate).toLocaleDateString()}</p>
            </div>
          )}
          <div className="space-y-1 col-span-2 pt-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization ID</p>
            <code className="text-[11px] font-mono bg-muted p-1 px-1.5 rounded text-muted-foreground break-all">
              {subscription.organizationId || subscription._id}
            </code>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t mt-4">
          <Button 
            variant="outline" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
            onClick={() => onEdit(subscription)}
          >
            <TbEdit className="mr-2 h-4 w-4" /> Change Plan
          </Button>
          <Button 
            variant="outline" 
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
            onClick={() => onArchive(subscription)}
          >
            <TbArchive className="mr-2 h-4 w-4" /> 
            {sub?.status === "canceled" ? "Reactivate" : "Cancel Subscription"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
