import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken, clearToken, getToken } from "../lib/api";
import type { AuthUser } from "../lib/types";

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, plan?: string) => Promise<void>;
    logout: () => void;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadMe() {
        if (!getToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get<AuthUser>("/auth/me");
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Bootstrap the session from a stored token on mount (async; runs after paint).
        const t = setTimeout(loadMe, 0);
        return () => clearTimeout(t);
    }, []);

    async function login(email: string, password: string) {
        const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
        setToken(data.token);
        setUser(data.user);
    }

    async function register(name: string, email: string, password: string, plan?: string) {
        const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register", { name, email, password, plan });
        setToken(data.token);
        setUser(data.user);
    }

    function logout() {
        clearToken();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadMe }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
