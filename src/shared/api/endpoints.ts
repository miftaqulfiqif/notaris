export const API_BASE_URL = "http://localhost:3002/api";

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/user/login`,
    },
} as const;
