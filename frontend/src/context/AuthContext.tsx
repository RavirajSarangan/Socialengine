import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getToken, setToken, clearToken } from "../lib/api";
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
    const [token, setTok] = useState<string | null>(getToken());
    const me = useQuery(api.customAuth.me, { token: token ?? undefined });
    const signUp = useMutation(api.customAuth.signUp);
    const signIn = useMutation(api.customAuth.signIn);
    const signOutMut = useMutation(api.customAuth.signOut);

    const user = (me as AuthUser | null | undefined) ?? null;
    const loading = token != null && me === undefined;

    async function login(email: string, password: string) {
        const r = await signIn({ email, password });
        setToken(r.token);
        setTok(r.token);
    }
    async function register(name: string, email: string, password: string, plan?: string) {
        const r = await signUp({ name, email, password, ...(plan ? { plan } : {}) });
        setToken(r.token);
        setTok(r.token);
    }
    function logout() {
        if (token) void signOutMut({ token });
        clearToken();
        setTok(null);
    }
    async function refresh() {
        // Convex queries are reactive — nothing to refresh.
    }

    return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
