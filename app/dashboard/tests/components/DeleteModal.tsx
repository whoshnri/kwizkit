"use client";

type DeleteModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onDelete: () => void;
  deleting: boolean;
};

const DeleteModal = ({
  isOpen,
  onCancel,
  onDelete,
  deleting,
}: DeleteModalProps) => {

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Cancel deletion");
    onCancel();
  }

  if(!isOpen){
    return
  }

  return (
    <div
      onClick={onCancel}
      className="fixed flex top-0 bottom-0 left-0 right-0 z-20 items-center justify-center bg-black/60"
    >
      <div className=" backdrop-blur-xl p-6 rounded-md w-full max-w-sm border-2 border-dashed theme-border-color z-50">
        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p className="theme-text-secondary mb-6">
          Are you sure you want to delete this test? This action cannot be undone.
        </p>
        <div className="flex justify-between gap-4 w-fit">
          <button
            onClick={handleCancel}
            className="theme-button-secondary px-6"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="theme-button-danger"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;