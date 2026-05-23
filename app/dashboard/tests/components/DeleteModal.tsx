"use client";

import { ConfirmationDialog, DashboardButton } from "../../components/primitives";

type DeleteModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onDelete: () => void;
  deleting: boolean;
};

const DeleteModal = ({ isOpen, onCancel, onDelete, deleting }: DeleteModalProps) => {
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ConfirmationDialog
      title="Confirm deletion"
      description="Are you sure you want to delete this test? This action cannot be undone."
      onClose={onCancel}
      footer={
        <>
          <DashboardButton onClick={handleCancel} variant="secondary" disabled={deleting} className="flex-1">
            Cancel
          </DashboardButton>
          <DashboardButton onClick={onDelete} disabled={deleting} variant="danger" className="flex-1">
            {deleting ? "Deleting..." : "Delete"}
          </DashboardButton>
        </>
      }
    />
  );
};

export default DeleteModal;
