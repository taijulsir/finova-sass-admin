"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface DangerButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  iconLeft?: React.ReactNode;
}

export function DangerButton({
  children,
  loading,
  disabled,
  iconLeft,
  className,
  variant = "destructive",
  ...props
}: DangerButtonProps) {
  return (
    <Button
      variant={variant}
      disabled={disabled || loading}
      className={cn("rounded-2xl font-medium", className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : iconLeft ? (
        <span className="mr-2">{iconLeft}</span>
      ) : null}
      {children}
    </Button>
  );
}
