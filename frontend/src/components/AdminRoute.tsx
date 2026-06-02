import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Guards admin routes — only users with role "admin" may enter. */
export default function AdminRoute() {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-slate-50">
                <div className="size-8 rounded-full border-2 border-red-200 border-t-red-500 animate-spin" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return user.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
