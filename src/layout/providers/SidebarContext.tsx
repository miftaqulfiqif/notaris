'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Service } from '@/features/dashboard/types/service.types';
import { ENDPOINTS } from '@/shared/api/endpoints';

type SidebarContextType = {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    services: Service[];
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(ENDPOINTS.USER.SERVICES, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setServices(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch services", error);
            }
        };

        fetchServices();
    }, []);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close, services }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
