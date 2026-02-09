export interface FileItem {
    id: string;
    file_name: string;
    user: string;
    updated_at: string;
    is_favorite?: boolean;
}

export interface FilesResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: FileItem[];
    };
}
