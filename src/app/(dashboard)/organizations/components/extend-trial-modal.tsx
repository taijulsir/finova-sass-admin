"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Organization } from "../organization-utils";

const extendTrialSchema = z.object({
  additionalDays: z.coerce
    .number()
    .min(1, "At least 1 day")
    .max(365, "Maximum 365 days"),
  reason: z.string().max(500).optional(),
});

interface ExtendTrialFormValues {
  additionalDays: number;
  reason?: string;
}

interface ExtendTrialModalProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExtendTrialModal({
  organization,
  isOpen,
  onClose,
  onSuccess,
}: ExtendTrialModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sub = organization?.subscription;

  const form = useForm<ExtendTrialFormValues>({
    resolver: zodResolver(extendTrialSchema) as any,
    defaultValues: { additionalDays: 14, reason: "" },
  });

  const handleSubmit = async (data: ExtendTrialFormValues) => {
    if (!organization) return;
    setIsSubmitting(true);
    try {
      await AdminService.extendTrial(
        organization._id,
        data.additionalDays,
        data.reason || undefined
      );
      toast.success(`Trial extended by ${data.additionalDays} days`);
      form.reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to extend trial");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) return null;

  const trialEndDate = sub?.trialEndDate
    ? new Date(sub.trialEndDate)
    : null;
  const daysRemaining = trialEndDate
    ? Math.max(
        0,
        Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return (
    <Modal
      title="Extend Trial Period"
      description={`Extend the trial for ${organization.name}`}
      isOpen={isOpen}
      onClose={() => {
        form.reset();
        onClose();
      }}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 py-3">
        {/* Current trial info */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Trial Info
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <Badge variant="outline" className="uppercase mt-0.5">
                {sub?.planId?.name || "Unknown"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                className={`mt-0.5 ${
                  sub?.isTrial
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {sub?.isTrial ? "TRIAL" : sub?.status || "—"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trial Ends</p>
              <p className="text-sm font-medium">
                {trialEndDate ? trialEndDate.toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Remaining</p>
              <p className="text-sm font-medium">
                <span
                  className={
                    daysRemaining <= 3
                      ? "text-red-600"
                      : daysRemaining <= 7
                      ? "text-amber-600"
                      : "text-foreground"
                  }
                >
                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional days */}
        <div className="space-y-2">
          <Label>Additional Days *</Label>
          <Input
            type="number"
            {...form.register("additionalDays")}
            placeholder="14"
            min={1}
            max={365}
            disabled={isSubmitting}
          />
          {form.formState.errors.additionalDays && (
            <p className="text-xs text-destructive">
              {form.formState.errors.additionalDays.message}
            </p>
          )}
          {trialEndDate && form.watch("additionalDays") > 0 && (
            <p className="text-xs text-muted-foreground">
              New trial end date:{" "}
              <span className="font-medium">
                {new Date(
                  trialEndDate.getTime() +
                    form.watch("additionalDays") * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason (optional)</Label>
          <Textarea
            {...form.register("reason")}
            placeholder="e.g. Customer needs more time to evaluate, sales negotiation..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Extending…" : "Extend Trial"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
