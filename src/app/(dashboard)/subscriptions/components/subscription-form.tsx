'use client';

import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { SelectInput } from "@/components/ui-system/form-fields";

const subscriptionSchema = z.object({
  planId: z.string().min(1, "Plan is required"),
  reason: z.string().optional(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  isSubmitting?: boolean;
  defaultValues?: Partial<SubscriptionFormValues>;
  onSubmit: (data: SubscriptionFormValues) => void;
  onCancel: () => void;
  orgName?: string;
  plans?: { _id: string; name: string; price: number; billingCycle: string }[];
}

export function SubscriptionForm({
  isSubmitting,
  defaultValues,
  onSubmit,
  onCancel,
  orgName,
  plans = [],
}: SubscriptionFormProps) {
  const planOptions = plans.map((p) => ({
    label: `${p.name} — $${p.price}/${p.billingCycle === "yearly" ? "yr" : "mo"}`,
    value: p._id,
  }));

  return (
    <FormContainer
      schema={subscriptionSchema}
      defaultValues={defaultValues || { planId: '' }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Change Plan"
    >
      {(form) => (
        <div className="space-y-4 py-2">
          {orgName && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <div className="p-2 border rounded bg-muted/50 font-medium text-sm">
                {orgName}
              </div>
            </div>
          )}
          
          <SelectInput
            control={form.control}
            name="planId"
            label="New Plan"
            placeholder="Select a plan"
            options={planOptions}
          />
        </div>
      )}
    </FormContainer>
  );
}
