import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function UnsuspendModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Unsuspend User"
      description={`Lift suspension for ${target?.name || "this user"}?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3">
          <p className="text-sm text-green-800 dark:text-green-400 font-medium">What will happen:</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Suspension will be lifted immediately</li>
            <li>User will be able to log in again</li>
            <li>Suspension reason will be cleared</li>
          </ul>
        </div>
        {target?.suspenseNote && (
          <div className="rounded-lg border border-muted bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">Suspension reason</p>
            <p className="text-sm text-foreground">{target.suspenseNote}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Suspended
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Unsuspending..." : "Unsuspend User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
