'use client';

import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { SelectInput } from "@/components/ui-system/form-fields";

const subscriptionSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
  status: z.string().min(1, "Status is required"),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  isEdit?: boolean;
  isSubmitting?: boolean;
  defaultValues?: Partial<SubscriptionFormValues>;
  onSubmit: (data: SubscriptionFormValues) => void;
  onCancel: () => void;
  orgName?: string;
}

export function SubscriptionForm({
  isEdit,
  isSubmitting,
  defaultValues,
  onSubmit,
  onCancel,
  orgName
}: SubscriptionFormProps) {
  return (
    <FormContainer
      schema={subscriptionSchema}
      defaultValues={defaultValues || { plan: 'free', status: 'active' }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update Subscription" : "Create Subscription"}
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
            name="plan"
            label="Subscription Plan"
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />

          <SelectInput
            control={form.control}
            name="status"
            label="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Past Due", value: "past_due" },
            ]}
          />
        </div>
      )}
    </FormContainer>
  );
}
