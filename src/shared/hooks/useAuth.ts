import { useAuthContext } from '@/features/auth/context/auth.context';

export const useAuth = () => {
    return useAuthContext();
};
