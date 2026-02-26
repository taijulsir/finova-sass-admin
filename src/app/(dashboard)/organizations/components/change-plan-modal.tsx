"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Organization, Plan, subscriptionStatusStyles } from "../organization-utils";
import { TbArrowRight } from "react-icons/tb";

interface ChangePlanModalProps {
  organization: Organization | null;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePlanModal({
  organization,
  plans,
  isOpen,
  onClose,
  onSuccess,
}: ChangePlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const sub = organization?.subscription;
  const currentPlan = sub?.planId;
  const activePlans = plans.filter((p) => p.isActive);
  const selectedPlan = activePlans.find((p) => p._id === selectedPlanId);

  // Billing impact
  const priceDiff =
    selectedPlan && currentPlan
      ? selectedPlan.price - currentPlan.price
      : null;

  const resetForm = () => {
    setSelectedPlanId("");
    setReason("");
    setConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!organization) return;
    if (!selectedPlanId) return toast.error("Select a plan");
    if (reason.length < 3) return toast.error("Reason is required (min 3 characters)");
    if (!confirmed) return toast.error("Please confirm the plan change");

    setIsSubmitting(true);
    try {
      await AdminService.changeOrgPlan(organization._id, selectedPlanId, reason);
      toast.success("Plan changed successfully");
      resetForm();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to change plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) return null;

  return (
    <Modal
      title="Change Subscription Plan"
      description={`Modify the plan for ${organization.name}`}
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <div className="space-y-5 py-3">
        {/* Current Plan */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Plan
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase">
              {currentPlan?.name || "No Plan"}
            </Badge>
            {currentPlan && (
              <span className="text-sm text-muted-foreground">
                ${currentPlan.price}/mo
              </span>
            )}
            {sub && (
              <Badge
                className={`ml-auto text-[10px] ${
                  subscriptionStatusStyles[sub.status] || ""
                }`}
              >
                {sub.status}
              </Badge>
            )}
          </div>
        </div>

        {/* New Plan Selection */}
        <div className="space-y-2">
          <Label>New Plan *</Label>
          <Select
            value={selectedPlanId}
            onValueChange={setSelectedPlanId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-200">
              {activePlans.map((p) => (
                <SelectItem
                  key={p._id}
                  value={p._id}
                  disabled={p._id === currentPlan?._id}
                >
                  <div className="flex items-center gap-2">
                    <span className="uppercase">{p.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ${p.price}/mo
                      {p.yearlyPrice ? ` · $${p.yearlyPrice}/yr` : ""}
                    </span>
                    {p._id === currentPlan?._id && (
                      <Badge variant="outline" className="text-[10px] ml-1">
                        Current
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Billing Impact */}
        {selectedPlan && currentPlan && selectedPlan._id !== currentPlan._id && (
          <div className="rounded-lg border p-3 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Billing Impact
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>${currentPlan.price}/mo</span>
              <TbArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${selectedPlan.price}/mo</span>
              {priceDiff !== null && (
                <Badge
                  variant="outline"
                  className={
                    priceDiff > 0
                      ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                      : priceDiff < 0
                      ? "text-amber-700 border-amber-200 bg-amber-50"
                      : ""
                  }
                >
                  {priceDiff > 0 ? "Upgrade" : priceDiff < 0 ? "Downgrade" : "Same"}
                  {priceDiff !== 0 && ` ($${Math.abs(priceDiff).toFixed(2)})`}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason for Change *</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer requested upgrade, promotional offer..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Confirmation */}
        <label
          htmlFor="confirm-change"
          className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <Checkbox
            id="confirm-change"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
            disabled={isSubmitting}
            className="mt-0.5"
          />
          <div>
            <span className="text-sm font-medium">
              I confirm this plan change
            </span>
            <p className="text-xs text-muted-foreground">
              This action will immediately change the subscription plan for this
              organization.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !confirmed || !selectedPlanId || reason.length < 3}
          >
            {isSubmitting ? "Changing…" : "Confirm Change"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
