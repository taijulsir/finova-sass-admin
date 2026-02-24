import { z } from "zod";
import { ShortTextInput, SelectInput } from "@/components/ui-system/form-fields";
import { ImageUploader } from "@/components/ui/image-uploader/image-uploader";
import { Controller, useWatch, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminService } from "@/services/admin.service";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  // Email is required for invite (new user) — optional only when editing an existing user
  email: z.string().email("Invalid email address").optional(),
  role: z.string().min(1, "Role is required"),
  avatar: z.union([z.instanceof(File), z.string()]).optional().nullable(),
  isInvite: z.boolean().optional(),
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
  const [emailStatus, setEmailStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  const formattedDefaultValues: UserFormValues = {
    name: defaultValues?.name ?? "",
    email: defaultValues?.email ?? "",
    role: defaultValues?.role?.toUpperCase() ?? "USER",
    avatar: defaultValues?.avatar ?? null,
    isInvite: isEdit ? defaultValues?.isInvite : true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<UserFormValues, any, UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: formattedDefaultValues,
  });

  const emailValue = useWatch({ control: form.control, name: "email" });
  const debouncedEmail = useDebounce(emailValue, 500);

  useEffect(() => {
    async function checkEmail() {
      if (!debouncedEmail || isEdit || !debouncedEmail.includes("@")) {
        setEmailStatus(null);
        setIsValidatingEmail(false);
        return;
      }
      setIsValidatingEmail(true);
      try {
        const res = await AdminService.checkEmail(debouncedEmail);
        if (res.available) {
          setEmailStatus({ available: true, message: "Email is available" });
          form.clearErrors("email");
        } else {
          setEmailStatus({
            available: false,
            message: res.exists ? "User already exists" : "Invitation already pending",
          });
          form.setError("email", { message: "Email is taken" });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsValidatingEmail(false);
      }
    }
    checkEmail();
  }, [debouncedEmail, isEdit]);

  const handleSubmit = async (data: UserFormValues) => {
    // Guard: invite requires a valid, available email
    if (!isEdit) {
      if (!data.email || !data.email.includes("@")) {
        form.setError("email", { message: "Email is required to send an invitation" });
        return;
      }
      if (emailStatus && !emailStatus.available) return;
    }
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-6 py-4">
          {/* Avatar — only shown when editing; no avatar upload for invites */}
          {isEdit && (
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
          )}

          {/* Invite banner */}
          {!isEdit && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-snug">
                An invitation email with a registration link will be sent to the invitee.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {/* Invitee / user full name */}
            <ShortTextInput
              control={form.control}
              name="name"
              label={isEdit ? "Full Name" : "Invitee Name"}
              placeholder={isEdit ? "John Doe" : "e.g. John Doe"}
              disabled={isSubmitting}
            />

            {/* Email — required for invite, hidden for edit */}
            {!isEdit && (
              <div className="relative">
                <ShortTextInput
                  control={form.control}
                  name="email"
                  label="Invitee Email Address"
                  placeholder="john@company.com"
                  disabled={isSubmitting}
                />
                {/* Inline email availability indicator */}
                <div className="absolute right-0 top-0 mt-8 pt-1 pr-2 flex items-center">
                  {isValidatingEmail && (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {!isValidatingEmail && emailStatus && (
                    <div className="flex items-center gap-1">
                      {emailStatus.available ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={`text-[10px] ${emailStatus.available ? "text-green-600" : "text-destructive"}`}>
                        {emailStatus.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <SelectInput
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={[
                { label: "Admin", value: "ADMIN" },
                { label: "User", value: "USER" },
                { label: "Member", value: "MEMBER" },
                { label: "Support", value: "SUPPORT" },
              ]}
              disabled={isSubmitting}
            />

          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!isEdit && !!emailStatus && !emailStatus.available)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update User" : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

