/**
 * Service Type entity
 */
export interface ServiceType {
    id: string;
    name: string;
    is_favorite?: boolean;
}

/**
 * Context type for ServiceTypes provider
 */
export interface ServiceTypesContextType {
    serviceTypes: ServiceType[];
    isLoading: boolean;
    error: string | null;
}
