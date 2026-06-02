import { Link } from "react-router-dom";
import { UsersIcon, ShieldIcon, FileTextIcon, Share2Icon, SparklesIcon, ImageIcon, ArrowRightIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { useAdminStats } from "../../hooks/useAdmin";

export default function AdminDashboard() {
    const { data: stats, isLoading } = useAdminStats();
    const planEntries = Object.entries(stats?.byPlan ?? {});
    const maxPlan = Math.max(1, ...planEntries.map(([, n]) => n));

    return (
        <>
            <PageHeader
                title="Admin"
                subtitle="System overview and management"
                action={
                    <Link to="/dashboard/admin/users" className="inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <UsersIcon className="size-4" /> Manage users
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard label="Users" value={isLoading ? "—" : stats!.users} icon={UsersIcon} accent="text-red-500 bg-red-50" />
                <StatCard label="Admins" value={isLoading ? "—" : stats!.admins} icon={ShieldIcon} accent="text-violet-500 bg-violet-50" />
                <StatCard label="Posts" value={isLoading ? "—" : stats!.posts} icon={FileTextIcon} accent="text-sky-500 bg-sky-50" />
                <StatCard label="Connected accounts" value={isLoading ? "—" : stats!.accounts} icon={Share2Icon} accent="text-emerald-500 bg-emerald-50" />
                <StatCard label="AI generations" value={isLoading ? "—" : stats!.generations} icon={SparklesIcon} accent="text-amber-500 bg-amber-50" />
                <StatCard label="Media assets" value={isLoading ? "—" : stats!.media} icon={ImageIcon} accent="text-rose-500 bg-rose-50" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-xl">
                <h2 className="text-sm font-medium text-slate-700 mb-4">Plan distribution</h2>
                {planEntries.length === 0 && <p className="text-sm text-slate-400">No users yet.</p>}
                <div className="space-y-3">
                    {planEntries.map(([plan, n]) => (
                        <div key={plan}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">{plan}</span>
                                <span className="text-slate-400">{n}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-red-400" style={{ width: `${(n / maxPlan) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
                <Link to="/dashboard/admin/users" className="mt-5 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                    Manage all users <ArrowRightIcon className="size-3" />
                </Link>
            </div>
        </>
    );
}
