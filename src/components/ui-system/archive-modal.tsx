'use client';

import { useState } from "react";
import { TbArchive } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export function ArchiveModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: ArchiveModalProps) {
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await onConfirm();
      toast.success("Successfully archived");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <TbArchive className="h-10 w-10" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          This action will move this item to the archive. It will no longer be visible in the main lists.
        </p>
        <div className="flex w-full items-center justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Confirm Archive"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
