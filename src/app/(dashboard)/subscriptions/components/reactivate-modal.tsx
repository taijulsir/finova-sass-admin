"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { AdminService } from "@/services/admin.service";
import { SubscriptionRow } from "@/types/subscription";
import { TbPlayerPlay } from "react-icons/tb";

const schema = z.object({
  planId: z.string().min(1, "Plan is required"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  reason: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ReactivateModalProps {
  subscription: SubscriptionRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReactivateModal({ subscription, isOpen, onClose, onSuccess }: ReactivateModalProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      planId: subscription?.plan?._id ?? "",
      billingCycle: subscription?.billingCycle ?? "MONTHLY",
      reason: "",
    },
  });

  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 }).then((res) => setPlans(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (subscription) {
      form.reset({
        planId: subscription.plan?._id ?? "",
        billingCycle: subscription.billingCycle ?? "MONTHLY",
        reason: "",
      });
    }
  }, [subscription, form]);

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    if (!subscription) return;
    setIsSubmitting(true);
    try {
      await AdminService.adminReactivateSubscription(subscription._id, {
        planId: values.planId,
        billingCycle: values.billingCycle,
        reason: values.reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      form.setError("root", { message: err?.response?.data?.message ?? "Failed to reactivate" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Reactivate Subscription"
      description={`Restore access for ${subscription?.org?.name ?? "this organization"}.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan <span className="text-destructive">*</span></FormLabel>
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
                <FormLabel>Billing Cycle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? "MONTHLY"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
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
                <FormLabel>Reason (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. Customer renewed after cancellation" rows={2} {...field} />
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
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Reactivating..." : (
                <><TbPlayerPlay className="h-4 w-4 mr-2" /> Reactivate</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
