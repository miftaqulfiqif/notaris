/**
 * Service Type entity
 */
export interface ServiceType {
    id: string;
    name: string;
}

/**
 * Context type for ServiceTypes provider
 */
export interface ServiceTypesContextType {
    serviceTypes: ServiceType[];
    isLoading: boolean;
    error: string | null;
}
