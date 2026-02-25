import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ConfirmModalProps } from "../user-types";

export function ResendInviteModal({ isOpen, onClose, target, isLoading, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      title="Resend Invitation"
      description={`Resend invitation email to ${target?.name || target?.email || "this invitee"}?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-muted-foreground">
          A new invitation link will be sent to{" "}
          <span className="font-medium text-foreground">{target?.email}</span>.
          The previous link will be invalidated.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Sending..." : "Resend Invitation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
