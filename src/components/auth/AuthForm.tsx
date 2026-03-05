"use client";

import React, { ReactNode } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import AuthCardHeader from "./AuthCardHeader";
import AuthAlerts from "./AuthAlerts";
import FormWrapper from "@/components/ui-system/FormWrapper";
import { FieldValues, UseFormReturn, DefaultValues } from "react-hook-form";
import { ZodSchema } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthFormProps<T extends FieldValues> {
    title: string;
    description: string;
    badge?: string;
    schema: ZodSchema<T>;
    onSubmit: (data: T) => Promise<void>;
    defaultValues: DefaultValues<T>;
    submitButtonText: string;
    submittingButtonText: string;
    error: string | null;
    success: string | null;
    children: (form: UseFormReturn<T>) => ReactNode;
    footerContent?: ReactNode;
}

export default function AuthForm<T extends FieldValues>({
    title,
    description,
    badge,
    schema,
    onSubmit,
    defaultValues,
    submitButtonText,
    submittingButtonText,
    error,
    success,
    children,
    footerContent,
}: AuthFormProps<T>) {
    return (
        <div className="space-y-0 w-full">
            <AuthCardHeader
                title={title}
                description={description}
                badge={badge}
            />

            <FormWrapper schema={schema} onSubmit={onSubmit} defaultValues={defaultValues}>
                {(form) => (
                    <>
                        <CardContent className="space-y-4 p-0 mt-1">
                            <AuthAlerts error={error} success={success} />
                            {children(form)}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 p-0 mt-5 md:mt-6">
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-[#4F46E5] text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{submittingButtonText}</>
                                ) : (
                                    submitButtonText
                                )}
                            </Button>

                            {footerContent && (
                                <div className="text-center pt-1 w-full">
                                    {footerContent}
                                </div>
                            )}
                        </CardFooter>
                    </>
                )}
            </FormWrapper>
        </div>
    );
}
