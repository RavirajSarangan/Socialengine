import { useState } from "react";
import { SearchIcon, FilterIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminActivities, useAdminUsers } from "../../hooks/useAdmin";
import { formatRelativeTime } from "../../lib/dashboard";

export default function AdminLogs() {
    const { data: logs = [], isLoading: isLoadingLogs } = useAdminActivities();
    const { data: users = [], isLoading: isLoadingUsers } = useAdminUsers();
    const [q, setQ] = useState("");
    const [selectedAction, setSelectedAction] = useState("");

    const userMap = new Map(users.map((u) => [u._id, u]));

    // Unique action types for filtering dropdown
    const actionTypes = Array.from(new Set(logs.map((l) => l.actionType)));

    const filtered = logs.filter((l) => {
        const user = userMap.get(l.user);
        const userString = user ? `${user.name} ${user.email}` : l.user;
        const matchesSearch = `${userString} ${l.description} ${l.actionType}`
            .toLowerCase()
            .includes(q.toLowerCase());
        const matchesAction = selectedAction === "" || l.actionType === selectedAction;
        return matchesSearch && matchesAction;
    });

    const isLoading = isLoadingLogs || isLoadingUsers;

    return (
        <>
            <PageHeader title="System Audit Logs" subtitle="Track user actions and background tasks" />

            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search logs by user, description or type…"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-violet-300"
                    />
                </div>

                {/* Dropdown Filter */}
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <FilterIcon className="size-3.5" />
                    </div>
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-violet-300 appearance-none text-slate-600"
                    >
                        <option value="">All Action Types</option>
                        {actionTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                                <th className="px-4 py-3.5 font-medium w-48">Timestamp</th>
                                <th className="px-4 py-3.5 font-medium w-56">User</th>
                                <th className="px-4 py-3.5 font-medium w-40">Action Type</th>
                                <th className="px-4 py-3.5 font-medium">Description</th>
                                <th className="px-4 py-3.5 font-medium">Related Entity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((l) => {
                                const matchedUser = userMap.get(l.user);
                                const displayName = matchedUser ? matchedUser.name : "System / Unknown";
                                const displayEmail = matchedUser ? matchedUser.email : l.user;

                                return (
                                    <tr key={l._id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                                        {/* Timestamp */}
                                        <td className="px-4 py-3.5 text-xs text-slate-500 tabular-nums">
                                            {new Date(l.createdAt).toLocaleString()}
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {formatRelativeTime(l.createdAt)}
                                            </div>
                                        </td>
                                        {/* User Info */}
                                        <td className="px-4 py-3.5">
                                            <div className="text-sm font-medium text-slate-800">{displayName}</div>
                                            <div className="text-xs text-slate-400 truncate">{displayEmail}</div>
                                        </td>
                                        {/* Action Type Badge */}
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                                                    l.actionType.includes("CONNECT") || l.actionType.includes("CREATE")
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : l.actionType.includes("DELETE") || l.actionType.includes("DISCONNECT")
                                                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                {l.actionType}
                                            </span>
                                        </td>
                                        {/* Description */}
                                        <td className="px-4 py-3.5 text-xs text-slate-700 whitespace-pre-wrap">
                                            {l.description}
                                        </td>
                                        {/* Related Entity */}
                                        <td className="px-4 py-3.5 text-xs">
                                            {l.relatedPost ? (
                                                <div className="max-w-xs truncate text-slate-500 bg-slate-50 rounded border border-slate-100 p-1.5" title={l.relatedPost.content}>
                                                    <span className="font-semibold text-slate-600">Post Content: </span>
                                                    {l.relatedPost.content}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {isLoading && <div className="p-8 text-center text-sm text-slate-400">Loading audit logs…</div>}
                {!isLoading && filtered.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-400">No activity logs found matching the filter.</div>
                )}
            </div>
        </>
    );
}
