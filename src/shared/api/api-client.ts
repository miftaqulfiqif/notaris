export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export interface ApiError {
    message: string;
    status?: number;
}

export async function apiClient<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const isFormDataBody =
        typeof FormData !== 'undefined' && options.body instanceof FormData;

    const defaultHeaders: HeadersInit = {
        ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include',
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function apiGet<T>(url: string): Promise<T> {
    return apiClient<T>(url, { method: 'GET' });
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
    const payloadBody =
        body && typeof FormData !== 'undefined' && body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined;

    return apiClient<T>(url, {
        method: 'POST',
        body: payloadBody,
    });
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
    const payloadBody =
        body && typeof FormData !== 'undefined' && body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined;

    return apiClient<T>(url, {
        method: 'PATCH',
        body: payloadBody,
    });
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
    const payloadBody =
        body && typeof FormData !== 'undefined' && body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined;

    return apiClient<T>(url, {
        method: 'PUT',
        body: payloadBody,
    });
}

export async function apiDelete<T>(url: string, body?: unknown): Promise<T> {
    const payloadBody =
        body && typeof FormData !== 'undefined' && body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined;

    return apiClient<T>(url, {
        method: 'DELETE',
        body: payloadBody,
    });
}
