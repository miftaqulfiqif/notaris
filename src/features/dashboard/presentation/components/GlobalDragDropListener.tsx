'use client';

import { useEffect } from 'react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';

export function GlobalDragDropListener() {
    const { openModal, setFiles } = useUploadModal();

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                openModal();
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();

            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                setFiles(e.dataTransfer.files);
                openModal();
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [openModal, setFiles]);

    return null;
}
