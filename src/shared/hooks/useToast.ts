'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastState, ToastVariant } from '@/shared/components/Toast';

interface ShowToastOptions {
    message: string;
    variant?: ToastVariant;
    duration?: number;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const hideToast = useCallback(() => {
        clearTimer();
        setToast(null);
    }, [clearTimer]);

    const showToast = useCallback(
        ({ message, variant = 'success', duration = 3000 }: ShowToastOptions) => {
            clearTimer();
            setToast({ message, variant });

            if (duration > 0) {
                timeoutRef.current = window.setTimeout(() => {
                    setToast(null);
                    timeoutRef.current = null;
                }, duration);
            }
        },
        [clearTimer],
    );

    useEffect(() => () => clearTimer(), [clearTimer]);

    return { toast, showToast, hideToast };
}
