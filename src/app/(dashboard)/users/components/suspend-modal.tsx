import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { name?: string } | null;
  isLoading: boolean;
  onConfirm: (note: string) => void;
}

export function SuspendModal({ isOpen, onClose, target, isLoading, onConfirm }: SuspendModalProps) {
  const [note, setNote] = useState("");

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Modal
      title="Suspend User"
      description={`Suspend ${target?.name || "this user"}. They will not be able to log in until restored.`}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="suspend-note">
            Reason for suspension <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="suspend-note"
            placeholder="Describe why this user is being suspended..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!note.trim() || isLoading}
            onClick={() => onConfirm(note.trim())}
          >
            {isLoading ? "Suspending..." : "Confirm Suspend"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
