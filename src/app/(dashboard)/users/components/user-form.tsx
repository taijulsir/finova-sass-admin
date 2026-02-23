import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput, SelectInput } from "@/components/ui-system/form-fields";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "user", "manager", "support"]).default("user"),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
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
  return (
    <FormContainer
      schema={userSchema}
      defaultValues={defaultValues as UserFormValues}
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

          <div className="grid grid-cols-2 gap-4">
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
            
            <SelectInput
              control={form.control}
              name="status"
              label="Status"
              placeholder="Select status"
              options={[
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Suspended", value: "suspended" },
              ]}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}
    </FormContainer>
  );
}
