import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface FormContainerProps<T extends FieldValues> {
  schema: z.ZodType<T, any, any>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function FormContainer<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  children,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
  className = "",
}: FormContainerProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      {/*
       * Outer form fills the flex column given to it by Modal.
       * ┌─────────────────────────────┐
       * │  scrollable body (flex-1)   │
       * ├─────────────────────────────┤
       * │  sticky footer (shrink-0)   │
       * └─────────────────────────────┘
       */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col min-h-0 flex-1"
      >
        {/* Scrollable content area */}
        <div className={`flex-1 min-h-0 overflow-y-auto px-1 ${className}`}>
          {children(form)}
        </div>

        {/* Pinned footer — always visible, never scrolled away */}
        <div className="shrink-0 flex justify-end gap-2 pt-4 pb-1 border-t mt-4 bg-background">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
