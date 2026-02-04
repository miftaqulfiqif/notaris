/**
 * Folder item in tipe layanan detail
 */
export interface FolderItem {
    id: string;
    folder_name: string;
    nama_penghadap: string;
    tipe_layanan: string;
    user: string;
    updated_at: string;
    status: 'selesai' | 'proses' | 'terutunda' | string;
}

/**
 * API response for folders
 */
export interface FoldersResponse {
    message: string;
    data: FolderItem[];
}

export interface FolderDetail {
    id: string;
    folder_name: string;
    kedudukan: string;
    nomor_akta: string;
    nomor_pt: string;
    nama_penghadap: string;
    nik_penghadap: string;
    status: string;
}

export interface FolderDetailResponse {
    message: string;
    data: FolderDetail;
}
