'use client';

import { useEffect } from 'react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';

export function GlobalDragDropListener() {
    const { openModal, setFiles } = useUploadModal();

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            // Check if the dragged item is a file
            if (e.dataTransfer?.types.includes('Files')) {
                // Determine if we should open the modal immediately or just indicate drag
                // Here we open it to show the user they can drop
                openModal();
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault(); // Prevent default behavior to allow drop
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();

            // If files are dropped, capture them and open modal if not already open
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

    return null; // This component doesn't render anything
}
