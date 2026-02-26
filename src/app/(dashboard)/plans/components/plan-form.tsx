import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput, LongTextInput } from "@/components/ui-system/form-fields";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

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
  // features as newline-separated text
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

// ── Section label helper ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 py-2">

          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div className="space-y-5">

            {/* General */}
            <div>
              <SectionLabel>General</SectionLabel>
              <div className="space-y-3">
                <ShortTextInput
                  control={form.control}
                  name="name"
                  label="Plan Name"
                  placeholder="e.g. Starter, Pro, Enterprise"
                  disabled={isSubmitting}
                />
                <LongTextInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Brief description of this plan"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <SectionLabel>Pricing</SectionLabel>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
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
              </div>
            </div>

            <Separator />

            {/* Meta */}
            <div>
              <SectionLabel>Settings</SectionLabel>
              <div className="space-y-3">
                <ShortTextInput
                  control={form.control}
                  name="sortOrder"
                  label="Sort Order"
                  placeholder="0"
                  disabled={isSubmitting}
                />
                {/* isPublic checkbox */}
                <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={form.watch("isPublic")}
                    onCheckedChange={(checked) =>
                      form.setValue("isPublic", checked === true)
                    }
                    disabled={isSubmitting}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">Public plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visible on the public pricing page
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────── */}
          <div className="space-y-5">

            {/* Usage Limits */}
            <div>
              <SectionLabel>Usage Limits</SectionLabel>
              <div className="space-y-3">
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

            <Separator />

            {/* Features */}
            <div>
              <SectionLabel>Features</SectionLabel>
              <LongTextInput
                control={form.control}
                name="featuresText"
                label="Features (one per line)"
                placeholder={"CRM Access\nEmail Support\nBasic Analytics\nCustom Branding"}
                disabled={isSubmitting}
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Each line becomes a feature bullet shown to users.
              </p>
            </div>
          </div>
        </div>
      )}
    </FormContainer>
  );
}
