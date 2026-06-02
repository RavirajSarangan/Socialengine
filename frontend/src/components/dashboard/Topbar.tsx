import { Link } from "react-router-dom";
import { MenuIcon, SparklesIcon, BellIcon } from "lucide-react";
import { currentUser } from "../../lib/dashboard";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
    const initials = currentUser.name.slice(0, 2).toUpperCase();
    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
            <button onClick={onMenu} className="lg:hidden text-slate-500 hover:text-slate-800">
                <MenuIcon className="size-5" />
            </button>

            <div className="hidden lg:block text-sm text-slate-400">
                Welcome back, <span className="text-slate-700 font-medium">{currentUser.name}</span>
            </div>

            <div className="flex items-center gap-3">
                <Link to="/dashboard/settings" className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full">
                    <SparklesIcon className="size-3.5" />
                    {currentUser.aiCredits} AI credits
                </Link>
                <button className="size-9 grid place-items-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                    <BellIcon className="size-5" />
                </button>
                <div className="flex items-center gap-2 pl-1">
                    <span className="size-9 rounded-full bg-linear-to-br from-red-500 to-red-600 text-white grid place-items-center text-xs font-medium">{initials}</span>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-sm text-slate-700">{currentUser.name}</div>
                        <div className="text-xs text-slate-400">{currentUser.plan} plan</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
