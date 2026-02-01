import { User } from '@/shared/types/user.types';
import { Service } from '@/features/dashboard/types';

export const currentUser: User = {
    name: "Johny Marten",
    email: "Example@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=johny"
};

export const services: Service[] = [
    { name: "PT" },
    { name: "CV" },
    { name: "Fidusia" },
    { name: "Firma" },
    { name: "Koperasi" },
    { name: "Yayasan" },
    { name: "Persekutuan" },
];
