'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UploadPreSelection } from '@/features/dashboard/types';

interface UploadModalContextType {
    isOpen: boolean;
    openModal: (preSelection?: UploadPreSelection) => void;
    closeModal: () => void;
    files: FileList | null;
    setFiles: (files: FileList | null) => void;
    preSelection: UploadPreSelection | null;
}

const UploadModalContext = createContext<UploadModalContextType | undefined>(undefined);

export function UploadModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [preSelection, setPreSelection] = useState<UploadPreSelection | null>(null);

    const openModal = (selection?: UploadPreSelection) => {
        setPreSelection(selection || null);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setFiles(null);
        setPreSelection(null);
    };

    return (
        <UploadModalContext.Provider value={{
            isOpen,
            openModal,
            closeModal,
            files,
            setFiles,
            preSelection
        }}>
            {children}
        </UploadModalContext.Provider>
    );
}

export function useUploadModal() {
    const context = useContext(UploadModalContext);
    if (context === undefined) {
        throw new Error('useUploadModal must be used within an UploadModalProvider');
    }
    return context;
}
