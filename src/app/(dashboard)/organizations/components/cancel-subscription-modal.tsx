"use client";

import { useState } from "react";
import { TbBan } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Organization } from "../organization-utils";

interface CancelSubscriptionModalProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelSubscriptionModal({
  organization,
  isOpen,
  onClose,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!organization) return;
    if (!reason.trim()) {
      toast.error("A reason is required to cancel a subscription.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AdminService.cancelSubscription(organization._id, reason.trim());
      toast.success("Subscription cancelled successfully");
      setReason("");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) return null;

  const sub = organization.subscription;

  return (
    <Modal
      title="Cancel Subscription"
      description={`Cancel the subscription for ${organization.name}`}
      isOpen={isOpen}
      onClose={() => {
        setReason("");
        onClose();
      }}
    >
      <div className="space-y-5 py-3">
        {/* Current subscription info */}
        {sub && (
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Active Subscription
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-medium uppercase">{sub.planId?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{sub.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Billing</p>
                <p className="text-sm">{sub.billingCycle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-medium">
                  ${sub.planId?.price || 0}/{sub.billingCycle === "YEARLY" ? "yr" : "mo"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
          <TbBan className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              This will immediately cancel the subscription
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              The organization will lose access to premium features once the current
              billing period ends.
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason for Cancellation *</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer requested, non-payment, switching to competitor..."
            rows={3}
            disabled={isSubmitting}
          />
          {reason.length === 0 && (
            <p className="text-[11px] text-muted-foreground">A reason is required.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setReason("");
              onClose();
            }}
            disabled={isSubmitting}
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Cancelling…" : "Cancel Subscription"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
