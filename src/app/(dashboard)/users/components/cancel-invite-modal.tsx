import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function CancelInviteModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Cancel Invitation"
      description={`Cancel invitation for ${target?.name || target?.email || "this invitee"}?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-muted-foreground">
          The invitation link sent to{" "}
          <span className="font-medium text-foreground">{target?.email}</span>{" "}
          will be cancelled and they will no longer be able to register with this link.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Invitation
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Cancelling..." : "Cancel Invitation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
