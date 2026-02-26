import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput, LongTextInput } from "@/components/ui-system/form-fields";
import { ImageUploader } from "@/components/ui/image-uploader/image-uploader";
import { Controller } from "react-hook-form";
import { Plan } from "../organization-utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// ── Create Schema ──────────────────────────────────────────────────────────
export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  logo: z.string().optional(),
  ownerEmail: z
    .string()
    .min(1, "Owner email is required")
    .email("Invalid email address"),
  ownerName: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().min(2, "Name must be at least 2 characters").optional()),
  planId: z.string().min(1, "Select a plan"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  isTrial: z.boolean().optional().default(false),
  trialDays: z.coerce.number().min(1).max(365).optional(),
  notes: z.string().max(1000).optional(),
});

// ── Edit Schema ────────────────────────────────────────────────────────────
export const editOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  logo: z.string().optional(),
  status: z.enum(["active", "suspended", "archived"]).optional(),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
export type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;
export type OrganizationFormValues = CreateOrganizationFormValues | EditOrganizationFormValues;

interface OrganizationFormProps {
  defaultValues?: Partial<OrganizationFormValues>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  plans?: Plan[];
}

export function OrganizationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
  plans = [],
}: OrganizationFormProps) {
  const schema = isEdit ? editOrganizationSchema : createOrganizationSchema;

  const activePlans = plans.filter((p) => p.isActive);
  const planOptions = activePlans.map((p) => ({
    label: `${p.name} — $${p.price}/${p.billingCycle === "YEARLY" ? "yr" : "mo"}`,
    value: p._id,
  }));

  return (
    <FormContainer
      schema={schema}
      defaultValues={defaultValues as any}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create Organization"}
    >
      {(form) => (
        <div className="space-y-6 py-4">
          {!isEdit && (
            <div className="flex justify-center">
              <Controller
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    shape="square"
                    folder="organizations"
                    width={400}
                    height={400}
                    label="Organization Logo"
                  />
                )}
              />
            </div>
          )}

          {isEdit && (
            <div className="flex justify-center">
              <Controller
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    shape="square"
                    folder="organizations"
                    width={400}
                    height={400}
                    label="Organization Logo"
                  />
                )}
              />
            </div>
          )}

          <div className="grid gap-4">
            <ShortTextInput
              control={form.control}
              name="name"
              label="Organization Name"
              placeholder="Acme Corp"
              disabled={isSubmitting}
            />

            {/* ── Create-only fields ───────────────────────────────── */}
            {!isEdit && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ShortTextInput
                    control={form.control}
                    name="ownerName"
                    label="Owner Full Name"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                  <ShortTextInput
                    control={form.control}
                    name="ownerEmail"
                    label="Owner Email *"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    control={form.control}
                    name="planId"
                    label="Plan *"
                    placeholder="Select a plan"
                    options={planOptions}
                    disabled={isSubmitting}
                  />
                  <SelectInput
                    control={form.control}
                    name="billingCycle"
                    label="Billing Cycle"
                    placeholder="Select cycle"
                    options={[
                      { label: "Monthly", value: "MONTHLY" },
                      { label: "Yearly", value: "YEARLY" },
                    ]}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Trial toggle */}
                <Controller
                  control={form.control}
                  name="isTrial"
                  render={({ field }) => (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Checkbox
                        id="isTrial"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <div>
                        <Label htmlFor="isTrial" className="text-sm font-medium cursor-pointer">
                          Start as Trial
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Organization will start on a trial period
                        </p>
                      </div>
                    </div>
                  )}
                />

                {form.watch("isTrial") && (
                  <ShortTextInput
                    control={form.control}
                    name="trialDays"
                    label="Trial Duration (days)"
                    placeholder="14"
                    type="number"
                    disabled={isSubmitting}
                  />
                )}

                <LongTextInput
                  control={form.control}
                  name="notes"
                  label="Internal Notes (optional)"
                  placeholder="e.g. VIP partner, marketing campaign lead..."
                  disabled={isSubmitting}
                />
              </>
            )}

            {/* ── Edit-only fields ────────────────────────────────── */}
            {isEdit && (
              <SelectInput
                control={form.control}
                name="status"
                label="Status"
                placeholder="Select status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" },
                  { label: "Archived", value: "archived" },
                ]}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      )}
    </FormContainer>
  );
}
