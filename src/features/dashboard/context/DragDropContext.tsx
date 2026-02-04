'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UploadPreSelection } from '@/features/dashboard/types';

interface DragDropContextType {
    /** Current pre-selection for drag and drop uploads */
    preSelection: UploadPreSelection | null;
    /** Set pre-selection (call from pages to set context) */
    setPreSelection: (preSelection: UploadPreSelection | null) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
    const [preSelection, setPreSelection] = useState<UploadPreSelection | null>(null);

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
