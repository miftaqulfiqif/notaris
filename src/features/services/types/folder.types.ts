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
    status: 'selesai' | 'proses' | 'terutunda' | string;
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
