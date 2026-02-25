import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function ForceLogoutModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Force Logout"
      description={`Log out ${target?.name || "this user"} from all active sessions?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
          <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">What will happen:</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>All active sessions will be immediately terminated</li>
            <li>Refresh tokens will be invalidated</li>
            <li>User will need to log in again</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white border-transparent"
          >
            {isLoading ? "Logging out..." : "Force Logout"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
