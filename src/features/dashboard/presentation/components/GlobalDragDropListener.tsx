'use client';

import { useEffect } from 'react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';

export function GlobalDragDropListener() {
    const { openModal, setFiles } = useUploadModal();
    const { preSelection } = useDragDropContext();

    useEffect(() => {
        const normalizedSelection = preSelection
            ? {
                ...preSelection,
                folderName: preSelection.folderName?.trim() || undefined,
            }
            : undefined;

        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                openModal(normalizedSelection);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();

            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                setFiles(e.dataTransfer.files);
                openModal(normalizedSelection);
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
    }, [openModal, setFiles, preSelection]);

    return null;
}
