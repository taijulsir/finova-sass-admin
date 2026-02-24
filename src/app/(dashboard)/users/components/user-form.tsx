import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput } from "@/components/ui-system/form-fields";
import { ImageUploader } from "@/components/ui/image-uploader/image-uploader";
import { Controller } from "react-hook-form";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "user", "manager", "support"]).default("user"),
  // avatar can be a File (pending upload) or a CDN string (already uploaded)
  avatar: z.union([z.instanceof(File), z.string()]).optional().nullable(),
  isInvite: z.boolean().default(true).optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: UserFormProps) {
  // Ensure isInvite is true when creating a user
  const initialValues = !isEdit ? { ...defaultValues, isInvite: true } : defaultValues;

  return (
    <FormContainer
      schema={userSchema}
      defaultValues={initialValues as UserFormValues}
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
              name="avatar"
              render={({ field }) => (
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  shape="circle"
                  folder="users"
                  width={200}
                  height={200}
                  label="Profile Picture"
                />
              )}
            />
          </div>

          <div className="grid gap-4">
            <ShortTextInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {!isEdit && (
              <ShortTextInput
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <SelectInput
                control={form.control}
                name="role"
                label="Role"
                placeholder="Select role"
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                  { label: "Manager", value: "manager" },
                  { label: "Support", value: "support" },
                ]}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </FormContainer>
  );
}
