'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiGet, ApiResponse } from '@/shared/api/api-client';
import { ServiceType, ServiceTypesContextType } from '@/features/services/types';

const ServiceTypesContext = createContext<ServiceTypesContextType | undefined>(undefined);

export function ServiceTypesProvider({ children, serviceId }: { children: ReactNode; serviceId?: string }) {
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceTypes = async () => {
            if (!serviceId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Construct URL dynamically
                const url = ENDPOINTS.USER.SERVICE_TYPES.replace(':serviceId', serviceId);
                const data = await apiGet<ApiResponse<ServiceType[]>>(url);
                setServiceTypes(data.data || []);
            } catch (err) {
                console.error("Failed to fetch service types", err);
                setError(err instanceof Error ? err.message : 'Failed to fetch service types');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceTypes();
    }, [serviceId]);

    return (
        <ServiceTypesContext.Provider value={{ serviceTypes, isLoading, error }}>
            {children}
        </ServiceTypesContext.Provider>
    );
}

export function useServiceTypes() {
    const context = useContext(ServiceTypesContext);
    if (context === undefined) {
        throw new Error('useServiceTypes must be used within a ServiceTypesProvider');
    }
    return context;
}
