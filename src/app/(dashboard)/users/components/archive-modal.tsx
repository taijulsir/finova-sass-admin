import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function ArchiveModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Archive User"
      description={`Archive ${target?.name || "this user"}? This will deactivate their account and all assigned roles.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-sm text-destructive font-medium">What will happen:</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>User will be deactivated and cannot log in</li>
            <li>All platform roles will be deactivated</li>
            <li>Active session will be invalidated immediately</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Archiving..." : "Archive User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
