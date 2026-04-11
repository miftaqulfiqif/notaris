export interface ServiceTypeDetailAccessUser {
    profile_picture: string | null;
    name: string;
    role?: string;
}

export interface ServiceTypeDetailFolderInfo {
    tipe_layanan: string;
    created_at?: string | null;
    created_by?: string | null;
    opened_at: string | null;
    opened_by: string | null;
    modified_at?: string | null;
    modified_by?: string | null;
}

export interface ServiceTypeFolderStatus {
    selesai: number;
    dalam_proses: number;
    terjeda: number;
}

export interface ServiceTypeDetailData {
    have_access: ServiceTypeDetailAccessUser[];
    detail_folder_tipe_layanan: ServiceTypeDetailFolderInfo;
    status_folder: ServiceTypeFolderStatus;
}

export interface ServiceTypeDetailResponse {
    message: string;
    data: ServiceTypeDetailData;
}

