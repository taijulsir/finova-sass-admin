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
import { DangerButton } from "../buttons/DangerButton";
import { SecondaryButton } from "../buttons/SecondaryButton";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-muted bg-background sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row sm:justify-center">
          <SecondaryButton
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </SecondaryButton>
          <DangerButton
            onClick={onConfirm}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Confirm
          </DangerButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
