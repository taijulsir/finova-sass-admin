"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface SecondaryButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function SecondaryButton({
  children,
  iconLeft,
  iconRight,
  className,
  variant = "secondary",
  ...props
}: SecondaryButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn("rounded-2xl font-medium", className)}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </Button>
  );
}
