import { ProtectedPath } from '@/features/auth/presentation/components/ProtectedPath';

export default function SuperadminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ProtectedPath allowedRoles={['SUPERADMIN']} redirectTo="/dashboard">
            {children}
        </ProtectedPath>
    );
}
