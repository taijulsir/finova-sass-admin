import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput } from "@/components/ui-system/form-fields";

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  status: z.enum(["active", "suspended"]).optional().default("active"),
  plan: z.enum(["free", "pro", "enterprise"]).optional().default("free"),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  defaultValues?: Partial<OrganizationFormValues>;
  onSubmit: (data: OrganizationFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export function OrganizationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: OrganizationFormProps) {
  return (
    <FormContainer
      schema={organizationSchema}
      defaultValues={defaultValues as OrganizationFormValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {(form) => (
        <div className="grid gap-4 py-4">
          <ShortTextInput
            control={form.control}
            name="name"
            label="Organization Name"
            placeholder="Acme Corp"
            disabled={isSubmitting}
          />
          {isEdit && (
            <>
              <SelectInput
                control={form.control}
                name="status"
                label="Status"
                placeholder="Select status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" },
                ]}
                disabled={isSubmitting}
              />
              <SelectInput
                control={form.control}
                name="plan"
                label="Plan"
                placeholder="Select plan"
                options={[
                  { label: "Free", value: "free" },
                  { label: "Pro", value: "pro" },
                  { label: "Enterprise", value: "enterprise" },
                ]}
                disabled={isSubmitting}
              />
            </>
          )}
        </div>
      )}
    </FormContainer>
  );
}
