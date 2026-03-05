"use client";

import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import { Form } from "@/components/ui/form";

type FormWrapperProps<T extends FieldValues> = {
  schema: ZodTypeAny;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
};

export function FormWrapper<T extends FieldValues>({ schema, defaultValues, onSubmit, children }: FormWrapperProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any) as any,
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {children(form)}
      </form>
    </Form>
  );
}

export default FormWrapper;
