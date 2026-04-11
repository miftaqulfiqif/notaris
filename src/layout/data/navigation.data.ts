import {
    LayoutDashboard,
    Star,
    BookOpen,
    Building2,
    Trash2,
    Settings,
    LucideIcon
} from 'lucide-react';

export interface NavigationItem {
    id: string;
    label: string;
    path: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
    disabled?: boolean;
}

export const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 'starred',
        label: 'Berbintang',
        path: '/starred',
        icon: Star,
    },
    {
        id: 'services',
        label: 'Layanan',
        path: '/services',
        icon: BookOpen,
        hasSubmenu: true,
    },
    {
        id: 'company',
        label: 'Perusahaan',
        path: '/company',
        icon: Building2,
    },
    {
        id: 'trash',
        label: 'Sampah',
        path: '/trash',
        icon: Trash2,
    },
    {
        id: 'settings',
        label: 'Setting',
        path: '/settings',
        icon: Settings,
    },
];
