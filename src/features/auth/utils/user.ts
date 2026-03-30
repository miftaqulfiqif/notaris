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
