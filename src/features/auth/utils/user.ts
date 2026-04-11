import type { User } from '../types/user.types';

export const getUserRoleName = (user?: Pick<User, 'role'> | null) => {
    const role = user?.role;

    if (typeof role === 'string') {
        const normalizedRole = role.trim();
        return normalizedRole || undefined;
    }

    if (role && typeof role === 'object' && typeof role.role_name === 'string') {
        const normalizedRole = role.role_name.trim();
        return normalizedRole || undefined;
    }

    return undefined;
};

export const isSuperadminUser = (user?: Pick<User, 'role'> | null) => {
    const roleName = getUserRoleName(user);

    return roleName?.toUpperCase() === 'SUPERADMIN';
};

export const getAuthenticatedHomePath = (user?: Pick<User, 'role'> | null) => {
    return isSuperadminUser(user) ? '/superadmin' : '/dashboard';
};
