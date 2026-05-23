import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 "
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 14, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="theme-bg/90 backdrop-blur-2xl rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-dashed theme-border-color"
      >
        {/* Modal Header */}
        <header className="px-6 py-4 border-b-2 border-dashed theme-border-color flex items-center justify-between">
          <h2 className="text-xl font-semibold theme-text">{title}</h2>
          <button
            onClick={onClose}
            className="theme-text-secondary hover:theme-text transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </header>

        {/* Modal Content */}
        <main className="px-6 py-4 overflow-y-auto">{children}</main>
      </motion.div>
    </motion.div>
  );
}
