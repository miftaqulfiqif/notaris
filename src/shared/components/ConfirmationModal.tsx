import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isProcessing = false,
    variant = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-50',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            ring: 'focus:ring-red-500'
        },
        warning: {
            bg: 'bg-amber-50',
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
            ring: 'focus:ring-amber-500'
        },
        info: {
            bg: 'bg-blue-50',
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            ring: 'focus:ring-blue-500'
        }
    };

    const style = colors[variant];

    return (
        <div className="z-60 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-full ${style.bg}`}>
                            <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h2 className="font-bold text-gray-900 text-xl mb-2">{title}</h2>
                    <div className="text-gray-600 text-sm">
                        {description}
                    </div>
                </div>

                <div className="flex justify-end gap-3 bg-gray-50/80 p-6 border-gray-100 border-t">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="hover:bg-gray-100 disabled:opacity-50 px-5 py-2.5 rounded-xl font-medium text-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 ${style.button} disabled:opacity-50 shadow-sm px-5 py-2.5 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.ring}`}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        <span>{isProcessing ? 'Memproses...' : confirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
