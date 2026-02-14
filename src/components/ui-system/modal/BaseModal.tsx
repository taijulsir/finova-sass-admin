"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButton } from "../buttons/SecondaryButton";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  maxWidth?: string;
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
  maxWidth = "sm:max-w-[425px]",
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("rounded-3xl border-muted bg-background/95 backdrop-blur-sm", maxWidth)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {onCancel && (
            <SecondaryButton onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </SecondaryButton>
          )}
          {onConfirm && (
            <PrimaryButton onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
