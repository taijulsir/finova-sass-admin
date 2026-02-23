import { z } from "zod";
import { FormContainer } from "@/components/ui-system/form-container";
import { ShortTextInput } from "@/components/ui-system/form-fields";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").optional(),
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
              type="email"
              disabled={isSubmitting}
            />
          )}
        </div>
      )}
    </FormContainer>
  );
}
