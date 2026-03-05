import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ShortTextInput as UIShortTextInput, LongTextInput as UILongTextInput, SelectInput as UISelectInput } from "@/components/ui-system/inputs/inputs";
import { Control, FieldPath, FieldValues, ControllerRenderProps } from "react-hook-form";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "number" | "password" | "email";
  description?: string;
  disabled?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

export function ShortTextInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled,
  icon,
}: FormFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, FieldPath<T>> }) => (
          <FormItem className="space-y-1.5">
            {label && <FormLabel className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">{label}</FormLabel>}
            <FormControl>
              <div>
                <UIShortTextInput
                  {...(field as any)}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  type={inputType as any}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(isPassword && "pr-11")}
                />
                {isPassword && (
                  <div className="flex justify-end -mt-8 mr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-[11px] font-medium text-red-500" />
          </FormItem>
      )}
    />
  );
}

export function LongTextInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  rows,
}: FormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, FieldPath<T>> }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <UILongTextInput
              {...(field as any)}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              className="resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled,
}: FormFieldProps<T> & { options: { label: string; value: string }[] }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, FieldPath<T>> }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <UISelectInput
              options={options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
