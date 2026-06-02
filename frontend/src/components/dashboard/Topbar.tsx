import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, SparklesIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const name = user?.name ?? "";
    const initials = name.slice(0, 2).toUpperCase() || "SE";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
            <button onClick={onMenu} className="lg:hidden text-slate-500 hover:text-slate-800">
                <MenuIcon className="size-5" />
            </button>

            <div className="hidden lg:block text-sm text-slate-400">
                Welcome back, <span className="text-slate-700 font-medium">{name}</span>
            </div>

            <div className="flex items-center gap-3">
                <Link to="/dashboard/settings" className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full">
                    <SparklesIcon className="size-3.5" />
                    {user?.aiCredits ?? 0} AI credits
                </Link>
                <div className="flex items-center gap-2 pl-1">
                    <span className="size-9 rounded-full bg-linear-to-br from-red-500 to-red-600 text-white grid place-items-center text-xs font-medium">{initials}</span>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-sm text-slate-700">{name}</div>
                        <div className="text-xs text-slate-400">{user?.plan} plan</div>
                    </div>
                </div>
                <button onClick={handleLogout} title="Sign out" className="size-9 grid place-items-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-red-500">
                    <LogOutIcon className="size-5" />
                </button>
            </div>
        </header>
    );
}
