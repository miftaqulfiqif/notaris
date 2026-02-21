/**
 * Folder item in tipe layanan detail
 */
export interface FolderItem {
    id: string;
    folder_name: string;
    tipe_layanan: string;
    user: string;
    is_favorite: boolean;
    updated_at: string;
    status: 'selesai' | 'proses' | 'terjeda' | 'tertunda' | string;
}

/**
 * Optional paginated payload for folders
 */
export interface FolderListPagination {
    current_page?: number;
    total_items?: number;
    total_pages?: number;
    data: FolderItem[];
}

/**
 * API response for folders
 */
export interface FoldersResponse {
    message: string;
    data: FolderItem[] | FolderListPagination;
}

export interface FolderDetail {
    id: string;
    folder_name: string;
    kedudukan: string;
    nomor_akta: string;
    nomor_pt: string;
    nik_penghadap: string;
    status: string;
}

export interface FolderDetailResponse {
    message: string;
    data: FolderDetail;
}

export interface FolderSidebarAccessUser {
    profile_picture: string | null;
    name: string;
}

export interface FolderSidebarStatusDetail {
    status: string;
    last_modified: string | null;
    modification_by: string | null;
}

export interface FolderSidebarDetailFolder {
    modified_at: string | null;
    modified_by: string | null;
    opened_at: string | null;
    opened_by: string | null;
    created_at: string | null;
    created_by: string | null;
}

export interface FolderSidebarData {
    folder_name: string;
    have_access: FolderSidebarAccessUser[];
    detail_status: FolderSidebarStatusDetail;
    detail_folder: FolderSidebarDetailFolder;
}

export interface FolderSidebarResponse {
    message: string;
    data: FolderSidebarData;
}

export interface FolderActivityItem {
    id: string;
    description: string;
    folder_name: string;
    object: string;
    object_status: string | null;
    created_at: string;
}

export interface FolderActivitiesResponse {
    message: string;
    data: FolderActivityItem[];
}
