import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
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
    const { isLoading, isAuthenticated } = useConvexAuth();
    const me = useQuery(api.users.me);
    const { signIn, signOut } = useAuthActions();

    const user = (me as AuthUser | null | undefined) ?? null;
    const loading = isLoading || (isAuthenticated && me === undefined);

    async function login(email: string, password: string) {
        await signIn("password", { email, password, flow: "signIn" });
    }
    async function register(name: string, email: string, password: string, plan?: string) {
        await signIn("password", { name, email, password, flow: "signUp", ...(plan ? { plan } : {}) });
    }
    function logout() {
        void signOut();
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
