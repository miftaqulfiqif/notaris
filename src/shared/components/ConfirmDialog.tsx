"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title = "Konfirmasi",
  message = "Apakah anda yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
  type = "info",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  if (!isOpen) return null;

  const typeColor = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-black"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${typeColor[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}