'use client';

import { use, useMemo } from 'react';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { ServiceTypesProvider } from '@/features/services/context/ServiceTypesContext';

export default function ServiceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const { services } = useSidebar();

    const currentService = useMemo(() => {
        if (!services.length) return null;
        return services.find(s =>
            s.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            s.name.toLowerCase() === slug.toLowerCase()
        );
    }, [services, slug]);

    return (
        <ServiceTypesProvider serviceId={currentService?.id}>
            {children}
        </ServiceTypesProvider>
    );
}
