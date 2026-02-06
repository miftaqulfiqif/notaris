'use client';

import React from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastState {
    message: string;
    variant?: ToastVariant;
}

interface ToastProps {
    toast: ToastState | null;
    onClose: () => void;
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

const POSITION_CLASS: Record<NonNullable<ToastProps['position']>, string> = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
};

export function Toast({ toast, onClose, position = 'bottom-left' }: ToastProps) {
    if (!toast) return null;

    const variantClass = toast.variant === 'error' ? 'bg-red-600' : 'bg-emerald-600';

    return (
        <div className={`fixed z-50 ${POSITION_CLASS[position]}`}>
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${variantClass}`}>
                <p className="font-medium text-sm">{toast.message}</p>
                <button
                    type="button"
                    className="ml-2 text-white/80 hover:text-white text-xs uppercase tracking-wide"
                    onClick={onClose}
                    aria-label="Tutup notifikasi"
                >
                    <span aria-hidden="true" className="ml-1">×</span>
                </button>
            </div>
        </div>
    );
}
