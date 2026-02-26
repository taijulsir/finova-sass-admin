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
import { AdminService } from "@/services/admin.service";
import { SubscriptionRow } from "@/types/subscription";
import { TbAlertTriangle } from "react-icons/tb";

const schema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

type FormValues = z.infer<typeof schema>;

interface CancelModalProps {
  subscription: SubscriptionRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({ subscription, isOpen, onClose, onSuccess }: CancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    if (!subscription) return;
    setIsSubmitting(true);
    try {
      await AdminService.adminCancelSubscription(subscription._id, values.reason);
      onSuccess();
      onClose();
    } catch (err: any) {
      form.setError("root", { message: err?.response?.data?.message ?? "Failed to cancel subscription" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Cancel Subscription"
      description={`Cancel the active subscription for ${subscription?.org?.name ?? "this organization"}.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <TbAlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm text-destructive">
              <p className="font-semibold">This action will immediately cancel the subscription.</p>
              <p className="mt-0.5 text-destructive/80">
                The organization will lose access at the end of the current billing period.
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Cancellation <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Customer requested cancellation, non-payment..."
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
              Keep Subscription
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
