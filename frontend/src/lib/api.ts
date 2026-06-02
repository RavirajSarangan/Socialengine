import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const TOKEN_KEY = "se_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
    baseURL: `${API_URL}/api`,
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On auth failure, drop the token and bounce to login.
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url ?? "";
        const isPublicAuthRequest = url.startsWith("/auth/login") || url.startsWith("/auth/register");
        if ((status === 401 || status === 403) && !isPublicAuthRequest) {
            clearToken();
            if (!window.location.pathname.startsWith("/login")) {
                window.location.assign("/login");
            }
        }
        return Promise.reject(error);
    }
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? error.message ?? fallback;
    }
    return fallback;
}
