import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput, LongTextInput } from "@/components/ui-system/form-fields";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// ── Schema ─────────────────────────────────────────────────────────────────

export const planSchema = z.object({
  name: z.string().min(2, "Name is required").max(50),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  yearlyPrice: z.coerce.number().min(0).optional(),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  trialDays: z.coerce.number().min(0).max(365).optional().default(0),
  sortOrder: z.coerce.number().min(0).optional().default(0),
  isPublic: z.boolean().optional().default(true),
  // limits
  maxMembers: z.coerce.number().min(1).default(5),
  maxLeads: z.coerce.number().min(0).default(100),
  maxStorage: z.coerce.number().min(0).default(1024), // in MB
  // features as comma-separated text
  featuresText: z.string().optional().default(""),
});

export type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  defaultValues?: Partial<PlanFormValues>;
  onSubmit: (data: PlanFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export function PlanForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: PlanFormProps) {
  return (
    <FormContainer
      schema={planSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update Plan" : "Create Plan"}
    >
      {(form) => (
        <div className="space-y-6 py-4">
          <div className="grid gap-4">
            {/* Name */}
            <ShortTextInput
              control={form.control}
              name="name"
              label="Plan Name"
              placeholder="e.g. Starter, Pro, Enterprise"
              disabled={isSubmitting}
            />

            {/* Description */}
            <LongTextInput
              control={form.control}
              name="description"
              label="Description"
              placeholder="Brief description of this plan"
              disabled={isSubmitting}
            />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <ShortTextInput
                control={form.control}
                name="price"
                label="Monthly Price ($)"
                placeholder="29"
                disabled={isSubmitting}
              />
              <ShortTextInput
                control={form.control}
                name="yearlyPrice"
                label="Yearly Price ($)"
                placeholder="290"
                disabled={isSubmitting}
              />
            </div>

            {/* Billing cycle & trial */}
            <div className="grid grid-cols-2 gap-4">
              <SelectInput
                control={form.control}
                name="billingCycle"
                label="Default Billing Cycle"
                options={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Yearly", value: "yearly" },
                ]}
                disabled={isSubmitting}
              />
              <ShortTextInput
                control={form.control}
                name="trialDays"
                label="Trial Days"
                placeholder="14"
                disabled={isSubmitting}
              />
            </div>

            {/* Limits */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Limits</Label>
              <div className="grid grid-cols-3 gap-4">
                <ShortTextInput
                  control={form.control}
                  name="maxMembers"
                  label="Max Members"
                  placeholder="5"
                  disabled={isSubmitting}
                />
                <ShortTextInput
                  control={form.control}
                  name="maxLeads"
                  label="Max Leads"
                  placeholder="100"
                  disabled={isSubmitting}
                />
                <ShortTextInput
                  control={form.control}
                  name="maxStorage"
                  label="Storage (MB)"
                  placeholder="1024"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Features */}
            <LongTextInput
              control={form.control}
              name="featuresText"
              label="Features (one per line)"
              placeholder={"CRM Access\nEmail Support\nBasic Analytics"}
              disabled={isSubmitting}
            />

            {/* Sort order */}
            <ShortTextInput
              control={form.control}
              name="sortOrder"
              label="Sort Order"
              placeholder="0"
              disabled={isSubmitting}
            />

            {/* isPublic checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("isPublic")}
                onCheckedChange={(checked) =>
                  form.setValue("isPublic", checked === true)
                }
                disabled={isSubmitting}
              />
              <Label className="text-sm">Visible on public pricing page</Label>
            </div>
          </div>
        </div>
      )}
    </FormContainer>
  );
}
