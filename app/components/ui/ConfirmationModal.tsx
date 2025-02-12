import { Button } from "~/components/ui/button";
import Modal from "~/components/ui/Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
