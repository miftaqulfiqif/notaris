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

export const getSubscriptionStatus = (user?: Pick<User, 'subscription'> | null) => {
    return user?.subscription?.status ?? null;
};

export const isEmailVerifiedUser = (user?: Pick<User, 'verified_at'> | null) => {
    return !!user?.verified_at;
};

export const isPendingPaymentUser = (user?: Pick<User, 'subscription'> | null) => {
    return getSubscriptionStatus(user) === 'pending_payment';
};

export const isSubscriptionExpiredUser = (user?: Pick<User, 'subscription'> | null) => {
    return getSubscriptionStatus(user) === 'expired';
};

export const canAccessCheckout = (user?: Pick<User, 'subscription' | 'verified_at'> | null) => {
    const subscriptionStatus = getSubscriptionStatus(user);

    return isEmailVerifiedUser(user)
        && (subscriptionStatus === 'pending_payment'
            || subscriptionStatus === 'expired'
            || !!user?.subscription?.has_pending_invoice);
};

export const getAuthenticatedHomePath = (user?: Pick<User, 'role' | 'subscription' | 'verified_at'> | null) => {
    if (!isEmailVerifiedUser(user)) {
        return '/verify-email';
    }

    if (canAccessCheckout(user) || isPendingPaymentUser(user) || isSubscriptionExpiredUser(user)) {
        return '/register/checkout';
    }

    return isSuperadminUser(user) ? '/superadmin' : '/dashboard';
};
