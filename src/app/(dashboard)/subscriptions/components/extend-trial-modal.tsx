"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TbCalendarPlus } from "react-icons/tb";
import { useState } from "react";

const schema = z.object({
  additionalDays: z
    .number()
    .min(1, "At least 1 day")
    .max(365, "Max 365 days"),
  reason: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ExtendTrialModalProps {
  subscription: SubscriptionRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExtendTrialModal({ subscription, isOpen, onClose, onSuccess }: ExtendTrialModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { additionalDays: 7, reason: "" },
  });

  useEffect(() => {
    if (!isOpen) form.reset({ additionalDays: 7, reason: "" });
  }, [isOpen, form]);

  const days = form.watch("additionalDays");
  const currentEnd = subscription?.trialEndDate;
  const previewEnd = currentEnd
    ? new Date(
        Math.max(new Date(currentEnd).getTime(), Date.now()) + (days || 0) * 86_400_000
      ).toLocaleDateString()
    : null;

  const onSubmit = async (values: FormValues) => {
    if (!subscription) return;
    setIsSubmitting(true);
    try {
      await AdminService.adminExtendTrial(subscription._id, {
        additionalDays: values.additionalDays,
        reason: values.reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      form.setError("root", { message: err?.response?.data?.message ?? "Failed to extend trial" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Extend Trial Period"
      description={`Extend the trial for ${subscription?.org?.name ?? "this organization"}.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Current trial info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/60">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">Current trial end</p>
              <p className="font-medium text-sm">{currentEnd ? new Date(currentEnd).toLocaleDateString() : "—"}</p>
            </div>
            <TbCalendarPlus className="h-5 w-5 text-blue-500" />
            <div className="text-right">
              <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">New trial end</p>
              <p className="font-medium text-sm text-blue-700 dark:text-blue-300">{previewEnd ?? "—"}</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="additionalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Days <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
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
                  <Textarea placeholder="e.g. Customer onboarding delay" rows={2} {...field} />
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
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Extending..." : "Extend Trial"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
