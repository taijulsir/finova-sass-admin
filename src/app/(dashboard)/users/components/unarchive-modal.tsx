import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function UnarchiveModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Unarchive User"
      description={`Restore ${target?.name || "this user"} from archive?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3">
          <p className="text-sm text-green-800 dark:text-green-400 font-medium">What will happen:</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>User account will be re-activated</li>
            <li>All platform roles will be restored</li>
            <li>User can log in again with their credentials</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Restoring..." : "Unarchive User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
