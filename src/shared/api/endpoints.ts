export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/user/login`,
        REGISTER: `${API_BASE_URL}/user/register`,
        CURRENT: `${API_BASE_URL}/user/current`,
        LOGOUT: `${API_BASE_URL}/user/logout`,
    },
    USER: {
        SERVICES: `${API_BASE_URL}/user/layanan`,
        SERVICE_TYPES: `${API_BASE_URL}/user/layanan/:serviceId/tipe-layanan`,
        UPLOAD_FILE: `${API_BASE_URL}/upload-file`,
        FOLDERS: `${API_BASE_URL}/folders`,
        FOLDER_DETAIL: `${API_BASE_URL}/detail-folder/:folderId`,
        FOLDER_FILES: `${API_BASE_URL}/files/:folderId`,
        EDIT_FOLDER: `${API_BASE_URL}/edit-folder/:folder_id`,
        ITEM_FAVORITE: `${API_BASE_URL}/item-favorite`,
        REMOVE_ITEM_FAVORITE: `${API_BASE_URL}/remove-item-favorite`,
        ITEM_DELETE: `${API_BASE_URL}/item-delete`,
        MULTIPLE_ITEM_DELETE: `${API_BASE_URL}/multiple-item-delete`,
        RESTORE_ITEM_DELETED: `${API_BASE_URL}/restore-item-deleted`,
        MULTIPLE_ITEM_RESTORE: `${API_BASE_URL}/multiple-item-restore`,
        OTP_REQUEST: `${API_BASE_URL}/user/otp/request`,
        OTP_VERIFY: `${API_BASE_URL}/user/otp/verify`,
    },
} as const;
