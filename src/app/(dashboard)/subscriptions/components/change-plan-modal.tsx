"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminService } from "@/services/admin.service";
import { SubscriptionRow } from "@/types/subscription";
import { TbArrowRight, TbArrowUp, TbArrowDown } from "react-icons/tb";

const schema = z.object({
  newPlanId: z.string().min(1, "Plan is required"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  reason: z.string().min(1, "Reason is required").max(500),
});

type FormValues = z.infer<typeof schema>;

interface ChangePlanModalProps {
  subscription: SubscriptionRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PLAN_TIER: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, ENTERPRISE: 3 };

export function ChangePlanModal({ subscription, isOpen, onClose, onSuccess }: ChangePlanModalProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPlanId: "", billingCycle: undefined, reason: "" },
  });

  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 }).then((res) => setPlans(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const selectedPlanId = form.watch("newPlanId");
  const selectedPlan = plans.find((p) => p._id === selectedPlanId);
  const currentPlanName = subscription?.plan?.name ?? "";
  const newPlanName = selectedPlan?.name ?? "";
  const planChange =
    selectedPlan && currentPlanName
      ? (PLAN_TIER[newPlanName] ?? 0) > (PLAN_TIER[currentPlanName] ?? 0)
        ? "upgrade"
        : "downgrade"
      : null;

  const onSubmit = async (values: FormValues) => {
    if (!subscription) return;
    setIsSubmitting(true);
    try {
      await AdminService.adminChangePlan(subscription._id, {
        newPlanId: values.newPlanId,
        billingCycle: values.billingCycle,
        reason: values.reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      form.setError("root", { message: err?.response?.data?.message ?? "Failed to change plan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Change Subscription Plan"
      description={`Update the plan for ${subscription?.org?.name ?? "this organization"}.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Current plan */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Current Plan</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/30 font-semibold">{currentPlanName || "—"}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{subscription?.billingCycle?.toLowerCase()}</span>
              </div>
            </div>
            {planChange && (
              <>
                <div className="text-muted-foreground">
                  {planChange === "upgrade" ? <TbArrowUp className="h-4 w-4 text-emerald-500" /> : <TbArrowDown className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">New Plan</p>
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="outline" className="font-semibold border-primary/40 bg-primary/5">{newPlanName}</Badge>
                    {selectedPlan?.price !== undefined && (
                      <span className="text-xs text-muted-foreground">${selectedPlan.price}/mo</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <FormField
            control={form.control}
            name="newPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Plan <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        <div className="flex items-center gap-2">
                          <span>{plan.name}</span>
                          {plan.price !== undefined && (
                            <span className="text-muted-foreground text-xs">${plan.price}/mo</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle (optional — keeps current if unset)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Keep current" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain the reason for this plan change..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Updating..." : (
                <><TbArrowRight className="h-4 w-4" /> Change Plan</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
