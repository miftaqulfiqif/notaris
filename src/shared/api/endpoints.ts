export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL_WITH_API_PREFIX = API_BASE_URL
    ? API_BASE_URL.replace(/\/$/, '').endsWith('/api')
        ? API_BASE_URL.replace(/\/$/, '')
        : `${API_BASE_URL.replace(/\/$/, '')}/api`
    : '';

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
        DETAIL_SERVICE_TYPE: `${API_BASE_URL}/detail-tipe-layanan/:tipe_layanan_id`,
        UPLOAD_FILE: `${API_BASE_URL}/upload-file`,
        FOLDERS: `${API_BASE_URL}/folders`,
        FOLDER_DETAIL: `${API_BASE_URL}/detail-folder/:folderId`,
        DETAIL_FOLDER_SIDEBAR: `${API_BASE_URL}/detail-folder-sidebar/:folder_id`,
        FOLDER_ACTIVITIES: `${API_BASE_URL}/aktifitas/folder/:folder_id`,
        FOLDER_FILES: `${API_BASE_URL}/files/:folderId`,
        DOCUMENT_VIEW: `${API_BASE_URL}/document/:documentId/view`,
        DOCUMENT_DOWNLOAD: `${API_BASE_URL}/document/:documentId/download`,
        FOLDER_DOWNLOAD: `${API_BASE_URL}/folder/:folder_id/download`,
        EDIT_FOLDER: `${API_BASE_URL}/edit-folder/:folder_id`,
        UPDATE_STATUS_FOLDER: `${API_BASE_URL_WITH_API_PREFIX}/update-status-folder`,
        ITEM_FAVORITE: `${API_BASE_URL}/item-favorite`,
        MULTIPLE_ITEM_FAVORITE: `${API_BASE_URL}/multiple-item-favorite`,
        REMOVE_ITEM_FAVORITE: `${API_BASE_URL}/remove-item-favorite`,
        MULTIPLE_REMOVE_ITEM_FAVORITE: `${API_BASE_URL}/multiple-remove-item-favorite`,
        ITEM_DELETE: `${API_BASE_URL}/item-delete`,
        MULTIPLE_ITEM_DELETE: `${API_BASE_URL}/multiple-item-delete`,
        ITEM_DELETE_PERMANENT: `${API_BASE_URL}/item-delete-permanent`,
        MULTIPLE_ITEM_DELETE_PERMANENT: `${API_BASE_URL}/multiple-item-delete-permanent`,
        RESTORE_ITEM_DELETED: `${API_BASE_URL}/restore-item-deleted`,
        MULTIPLE_ITEM_RESTORE: `${API_BASE_URL}/multiple-item-restore`,
        NOTIFICATIONS: `${API_BASE_URL}/notifikasi`,
        NOTIFICATION_READ: `${API_BASE_URL}/notifikasi/read/:notifikasi_id`,
        OTP_REQUEST: `${API_BASE_URL}/user/otp/request`,
        OTP_VERIFY: `${API_BASE_URL}/user/otp/verify`,
        DETAIL: `${API_BASE_URL}/user/detail`,
    },
    NOTARIS: {
        DETAIL: `${API_BASE_URL}/notaris/detail`,
        USERS: `${API_BASE_URL}/notaris/users`,
        SETTING: `${API_BASE_URL}/notaris/setting`,
        SETTING_GENERAL: `${API_BASE_URL}/notaris/setting/umum`,
        SETTING_MEMBER: `${API_BASE_URL}/notaris/setting/member`,
        FILE_SEARCH: `${API_BASE_URL}/notaris/file`,
    },
    DASHBOARD: {
        ACTIVITIES: `${API_BASE_URL}/aktifitas`,
        RECOMMENDATIONS: `${API_BASE_URL}/aktifitas/recomendation`,
    }
} as const;
