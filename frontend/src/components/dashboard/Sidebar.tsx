import { NavLink, Link } from "react-router-dom";
import { LayoutDashboardIcon, PenSquareIcon, CalendarDaysIcon, FileTextIcon, Share2Icon, SparklesIcon, BarChart3Icon, ActivityIcon, MessageSquareReplyIcon, SettingsIcon, XIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
}

const NAV: NavItem[] = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, end: true },
    { to: "/dashboard/compose", label: "Composer", icon: PenSquareIcon },
    { to: "/dashboard/calendar", label: "Calendar", icon: CalendarDaysIcon },
    { to: "/dashboard/posts", label: "Posts", icon: FileTextIcon },
    { to: "/dashboard/accounts", label: "Accounts", icon: Share2Icon },
    { to: "/dashboard/ai-studio", label: "AI Studio", icon: SparklesIcon },
    { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3Icon },
    { to: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
    { to: "/dashboard/auto-reply", label: "Auto-Reply", icon: MessageSquareReplyIcon },
    { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
    return (
        <>
            {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="logo" className="size-7" />
                        <span className="text-xl font-medium font-serif text-slate-800">Scheduler</span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700">
                        <XIcon className="size-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {NAV.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? "bg-red-50 text-red-600 font-medium" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
                            }
                        >
                            <Icon className="size-4.5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3">
                    <Link to="/dashboard/compose" onClick={onClose} className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-red-600 to-red-500 text-white rounded-full py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <PenSquareIcon className="size-4" /> Create Post
                    </Link>
                </div>
            </aside>
        </>
    );
}
