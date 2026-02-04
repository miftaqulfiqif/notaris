export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/user/login`,
        CURRENT: `${API_BASE_URL}/user/current`,
        LOGOUT: `${API_BASE_URL}/user/logout`,
    },
    USER: {
        SERVICES: `${API_BASE_URL}/user/layanan`,
        SERVICE_TYPES: `${API_BASE_URL}/user/layanan/:serviceId/tipe-layanan`,
        UPLOAD_FILE: `${API_BASE_URL}/upload-file`,
        FOLDERS: `${API_BASE_URL}/folders`,
    },
} as const;
