'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { UploadPreSelection } from '@/features/dashboard/types';

interface DragDropContextType {
    preSelection: UploadPreSelection | null;
    setPreSelection: (preSelection: UploadPreSelection | null) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
    const [preSelection, setPreSelectionState] = useState<UploadPreSelection | null>(null);

    const setPreSelection = useCallback((selection: UploadPreSelection | null) => {
        if (!selection) {
            setPreSelectionState(null);
            return;
        }

        const normalizedFolderName = selection.folderName?.trim();
        setPreSelectionState({
            ...selection,
            folderName: normalizedFolderName || undefined,
        });
    }, []);

    return (
        <DragDropContext.Provider value={{ preSelection, setPreSelection }}>
            {children}
        </DragDropContext.Provider>
    );
}

export function useDragDropContext() {
    const context = useContext(DragDropContext);
    if (context === undefined) {
        throw new Error('useDragDropContext must be used within a DragDropProvider');
    }
    return context;
}
