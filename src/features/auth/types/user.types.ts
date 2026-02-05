export interface Role {
    id: string;
    role_name: string;
    role_code: string;
    created_at: string;
    updated_at: string;
}

export interface Notaris {
    id: string;
    notaris_name: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    role_id: string;
    notaris_id: string;
    notaris_name: string;
    profile_picture: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: Role;
    notaris: Notaris;
    favorites: any[]; // Type as needed
    folder: any[]; // Type as needed
}

export interface UserResponse {
    message: string;
    data: User;
}
