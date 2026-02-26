"use client";

import { useState } from "react";
import { TbTrash, TbAlertTriangle } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  entityName?: string;
  /** Extra warning shown before the destructive action (e.g. active subscription). */
  warning?: string;
  confirmLabel?: string;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Permanently",
  description = "This action cannot be undone.",
  entityName,
  warning,
  confirmLabel = "Delete",
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal title={title} description={description} isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <TbTrash className="h-8 w-8" />
        </div>

        {entityName && (
          <p className="text-center text-sm font-semibold">{entityName}</p>
        )}

        <p className="text-center text-sm text-muted-foreground max-w-xs">
          Are you sure you want to permanently delete this? This action cannot be undone and all associated data will be lost.
        </p>

        {warning && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 w-full dark:border-amber-800 dark:bg-amber-950/30">
            <TbAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">{warning}</p>
          </div>
        )}

        <div className="flex w-full items-center justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
