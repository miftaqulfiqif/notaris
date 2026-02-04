/**
 * Upload form data interface
 */
export interface UploadFormData {
    layanan_id: string;
    tipe_layanan_id: string;
    folder_name: string;
    kedudukan: string;
    nomor_akta: string;
    nomor_pt: string;
    nama_penghadap: string;
    nik_penghadap: string;
    file_name: string;
}

/**
 * Pre-selection options for upload modal
 * Used to pre-fill selections based on current page context
 */
export interface UploadPreSelection {
    /** Pre-selected layanan ID (from service page) */
    layananId?: string;
    /** Pre-selected layanan name for display */
    layananName?: string;
    /** Pre-selected tipe layanan ID (from tipe layanan detail page) */
    tipeLayananId?: string;
    /** Pre-selected tipe layanan name for display */
    tipeLayananName?: string;
    /** Callback function to run after successful upload */
    onSuccess?: () => void;
}

/**
 * Initial empty form data
 */
export const EMPTY_UPLOAD_FORM: UploadFormData = {
    layanan_id: '',
    tipe_layanan_id: '',
    folder_name: '',
    kedudukan: '',
    nomor_akta: '',
    nomor_pt: '',
    nama_penghadap: '',
    nik_penghadap: '',
    file_name: '',
};
