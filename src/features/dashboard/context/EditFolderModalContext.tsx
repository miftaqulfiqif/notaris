'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EditFolderPreSelection } from '@/features/dashboard/types';

interface EditFolderModalContextType {
    isOpen: boolean;
    openModal: (preSelection: EditFolderPreSelection) => void;
    closeModal: () => void;
    preSelection: EditFolderPreSelection | null;
}

const EditFolderModalContext = createContext<EditFolderModalContextType | undefined>(undefined);

export function EditFolderModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [preSelection, setPreSelection] = useState<EditFolderPreSelection | null>(null);

    const openModal = (selection: EditFolderPreSelection) => {
        setPreSelection(selection);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setPreSelection(null);
    };

    return (
        <EditFolderModalContext.Provider value={{
            isOpen,
            openModal,
            closeModal,
            preSelection
        }}>
            {children}
        </EditFolderModalContext.Provider>
    );
}

export function useEditFolderModal() {
    const context = useContext(EditFolderModalContext);
    if (context === undefined) {
        throw new Error('useEditFolderModal must be used within an EditFolderModalProvider');
    }
    return context;
}
