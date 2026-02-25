import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput } from "@/components/ui-system/form-fields";
import { ImageUploader } from "@/components/ui/image-uploader/image-uploader";
import { Controller } from "react-hook-form";

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  status: z.enum(["active", "suspended"]).optional().default("active"),
  plan: z.enum(["free", "pro", "enterprise"]).optional().default("free"),
  logo: z.string().optional(),
  ownerEmail: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().email("Invalid email address").optional()),
  ownerName: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(
      z
        .string()
        .min(2, "Name must be at least 2 characters")
        .optional()
    ),
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
        <div className="space-y-6 py-4">
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

          <div className="grid gap-4">
            <ShortTextInput
              control={form.control}
              name="name"
              label="Organization Name"
              placeholder="Acme Corp"
              disabled={isSubmitting}
            />

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
                    label="Owner Email Address"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {isEdit && (
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}
          </div>
        </div>
      )}
    </FormContainer>
  );
}
