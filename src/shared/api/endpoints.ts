export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/user/login`,
        CURRENT: `${API_BASE_URL}/user/current`,
        LOGOUT: `${API_BASE_URL}/user/logout`,
    },
} as const;
