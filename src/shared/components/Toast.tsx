'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'success' | 'error' | 'info';

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

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Toast({ toast, onClose, position = 'bottom-left' }: ToastProps) {
    const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

    if (!toast || !mounted) return null;

    const variantClass = toast.variant === 'error' ? 'bg-red-600' : 'bg-emerald-600';

    return createPortal(
        <div className={`fixed z-50 ${POSITION_CLASS[position]}`}>
            <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${variantClass}`}>
                <p className="font-medium text-sm">{toast.message}</p>
                <button
                    type="button"
                    className="ml-2 text-white/80 hover:text-white text-xs uppercase tracking-wide"
                    onClick={onClose}
                    aria-label="Tutup notifikasi"
                >
                    <span className="ml-1 text-2xl">×</span>
                </button>
            </div>
        </div>,
        document.body
    );
}
