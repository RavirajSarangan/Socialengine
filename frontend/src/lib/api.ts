// Convex migration: the REST/axios client was removed. This module keeps only the
// small helpers a few components still import. Media URLs from Convex storage are
// absolute, so API_URL is an empty prefix.

export const API_URL = "";

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

/** Normalises a Convex/JS error into a readable message. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (error instanceof Error && error.message) {
        const m = error.message;
        const idx = m.lastIndexOf("Uncaught Error:");
        const cleaned = idx >= 0 ? m.slice(idx + "Uncaught Error:".length) : m;
        return cleaned.split("\n")[0].trim() || fallback;
    }
    return fallback;
}
