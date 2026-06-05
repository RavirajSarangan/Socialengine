import { useState } from "react";
import { NavLink, Link, useNavigate, Outlet } from "react-router-dom";
import {
    LayoutDashboardIcon,
    UsersIcon,
    SparklesIcon,
    ActivityIcon,
    ShieldAlertIcon,
    LogOutIcon,
    MenuIcon,
    XIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdminNavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
    { to: "/admin", label: "Stats Overview", icon: LayoutDashboardIcon, end: true },
    { to: "/admin/users", label: "User Accounts", icon: UsersIcon },
    { to: "/admin/credits", label: "AI Credits", icon: SparklesIcon },
    { to: "/admin/logs", label: "System Audit Logs", icon: ActivityIcon },
    { to: "/admin/health", label: "System Health", icon: ShieldAlertIcon },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/admin/login");
    }

    const name = user?.name ?? "Administrator";
    const initials = name.slice(0, 2).toUpperCase() || "AD";

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="logo" className="size-7 brightness-200" />
                        <span className="text-xl font-medium font-serif text-white">Socialengine Admin</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                        Management
                    </div>
                    {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                    isActive
                                        ? "bg-slate-800 text-white font-medium shadow-sm"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                }`
                            }
                        >
                            <Icon className="size-4.5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded-xl py-2.5 text-sm transition-colors"
                    >
                        <LogOutIcon className="size-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Topbar */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-500 hover:text-slate-800"
                    >
                        <MenuIcon className="size-5" />
                    </button>

                    <div className="hidden lg:block text-sm text-slate-500">
                        Admin Portal logged in as: <span className="text-slate-800 font-semibold">{name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-3 py-1.5 rounded-full font-medium">
                            System Control
                        </span>
                        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                            <span className="size-9 rounded-full bg-linear-to-br from-violet-600 to-violet-700 text-white grid place-items-center text-xs font-semibold">
                                {initials}
                            </span>
                            <div className="hidden sm:block leading-tight">
                                <div className="text-sm text-slate-700 font-medium">{name}</div>
                                <div className="text-xs text-slate-400">System Admin</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Page */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
