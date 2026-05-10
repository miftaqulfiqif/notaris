export interface Role {
    id?: string;
    role_name: string;
    role_code?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Notaris {
    id?: string;
    notaris_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserSubscription {
    billing_phase: string;
    has_pending_invoice: boolean;
    package: string | null;
    renewal_date: string | null;
    status: string;
}

export type UserRole = Role | string;

export interface User {
    id?: string;
    email: string;
    username?: string;
    name: string;
    role_id?: string;
    notaris_id?: string;
    notaris_name?: string | null;
    profile_picture?: string | null;
    verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    role?: UserRole | null;
    access: string;
    notaris?: Notaris | null;
    favorites?: unknown[];
    folder?: unknown[];
    subscription?: UserSubscription | null;
}

export interface UserResponse {
    message: string;
    data: User;
}

export interface UserDetailInfoUser {
    profile_picture: string | null;
    name: string | null;
    gender: string | null;
    phone: string | null;
    jabatan: string | null;
}

export interface UserDetailAkun {
    username: string | null;
    email: string | null;
    password: string | null;
    role: string | null;
    created_at: string | null;
    last_login: string | null;
    last_updated_password: string | null;
}

export interface UserDetailInstansi {
    notaris_name: string | null;
    email: string | null;
    phone: string | null;
    paket: string | null;
}

export interface UserDetailData {
    informasi_user: UserDetailInfoUser;
    detail_akun: UserDetailAkun;
    informasi_instansi: UserDetailInstansi;
}

export interface UserDetailResponse {
    message: string;
    data: UserDetailData;
}
