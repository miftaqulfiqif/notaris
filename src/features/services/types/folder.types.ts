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
