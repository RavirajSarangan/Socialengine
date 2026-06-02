import { useState } from "react";
import { ShieldIcon, Trash2Icon, SearchIcon, Loader2Icon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminUsers, useUpdateUser, useDeleteUser } from "../../hooks/useAdmin";
import type { AdminUser } from "../../hooks/useAdmin";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../../lib/dashboard";

const PLANS = ["Starter", "Pro", "Agency"];

function Row({ u, selfId }: { u: AdminUser; selfId?: string }) {
    const update = useUpdateUser();
    const del = useDeleteUser();
    const isSelf = u._id === selfId;

    return (
        <tr className="border-t border-slate-100 hover:bg-slate-50/60">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-linear-to-br from-red-500 to-red-600 text-white grid place-items-center text-xs font-medium">{u.name.slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0">
                        <div className="text-sm text-slate-800 flex items-center gap-1.5">{u.name} {u.role === "admin" && <ShieldIcon className="size-3.5 text-violet-500" />}</div>
                        <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <select value={u.role} onChange={(e) => update.mutate({ id: u._id, update: { role: e.target.value } })} className="text-xs rounded-full border border-slate-200 bg-white px-2.5 py-1 outline-none focus:border-red-300">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                </select>
            </td>
            <td className="px-4 py-3">
                <select value={u.plan} onChange={(e) => update.mutate({ id: u._id, update: { plan: e.target.value } })} className="text-xs rounded-full border border-slate-200 bg-white px-2.5 py-1 outline-none focus:border-red-300">
                    {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600 tabular-nums">{u.aiCredits} / {u.aiCreditsTotal}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{formatRelativeTime(u.createdAt)}</td>
            <td className="px-4 py-3 text-right">
                <button
                    onClick={() => { if (window.confirm(`Delete ${u.email} and all their data? This cannot be undone.`)) del.mutate(u._id); }}
                    disabled={isSelf || del.isPending}
                    title={isSelf ? "You can't delete your own account here" : "Delete user"}
                    className="inline-flex items-center justify-center size-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    {del.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <Trash2Icon className="size-4" />}
                </button>
            </td>
        </tr>
    );
}

export default function AdminUsers() {
    const { data: users = [], isLoading } = useAdminUsers();
    const { user } = useAuth();
    const [q, setQ] = useState("");

    const filtered = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

    return (
        <>
            <PageHeader title="Users" subtitle={`${users.length} registered ${users.length === 1 ? "account" : "accounts"}`} />

            <div className="relative mb-4 max-w-sm">
                <SearchIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-red-300" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase tracking-wide">
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Plan</th>
                                <th className="px-4 py-3 font-medium">AI credits</th>
                                <th className="px-4 py-3 font-medium">Joined</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => <Row key={u._id} u={u} selfId={user?._id} />)}
                        </tbody>
                    </table>
                </div>
                {isLoading && <div className="p-8 text-center text-sm text-slate-400">Loading…</div>}
                {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No users match your search.</div>}
            </div>
        </>
    );
}
