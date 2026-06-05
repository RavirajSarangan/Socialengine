import { useState } from "react";
import { SearchIcon, Loader2Icon, SparklesIcon, SaveIcon, RefreshCwIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminUsers, useUpdateUser } from "../../hooks/useAdmin";
import type { AdminUser } from "../../hooks/useAdmin";

function CreditRow({ u }: { u: AdminUser }) {
    const update = useUpdateUser();
    const [tempLimit, setTempLimit] = useState(u.aiCreditsTotal.toString());
    const [tempCurrent, setTempCurrent] = useState(u.aiCredits.toString());

    const isPending = update.isPending && update.variables?.id === u._id;

    const handleSaveLimit = () => {
        const val = parseInt(tempLimit, 10);
        if (!isNaN(val) && val >= 0) {
            update.mutate({ id: u._id, update: { aiCreditsTotal: val } });
        }
    };

    const handleSaveCurrent = () => {
        const val = parseInt(tempCurrent, 10);
        if (!isNaN(val) && val >= 0) {
            update.mutate({ id: u._id, update: { aiCredits: val } });
        }
    };

    const handleAdjust = (amount: number) => {
        const newBalance = Math.max(0, u.aiCredits + amount);
        setTempCurrent(newBalance.toString());
        update.mutate({ id: u._id, update: { aiCredits: newBalance } });
    };

    const handleReset = () => {
        setTempCurrent(u.aiCreditsTotal.toString());
        update.mutate({ id: u._id, update: { aiCredits: u.aiCreditsTotal } });
    };

    return (
        <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-linear-to-br from-violet-500 to-violet-600 text-white grid place-items-center text-xs font-semibold">
                        {u.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3.5">
                <span className="inline-block px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
                    {u.plan}
                </span>
            </td>
            {/* Current Balance */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="w-16 px-2 py-1 text-xs rounded border border-slate-200 text-slate-800 focus:border-violet-500 outline-none tabular-nums"
                        value={tempCurrent}
                        onChange={(e) => setTempCurrent(e.target.value)}
                    />
                    <button
                        onClick={handleSaveCurrent}
                        disabled={isPending || tempCurrent === u.aiCredits.toString()}
                        className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors disabled:opacity-40"
                        title="Save Current Balance"
                    >
                        <SaveIcon className="size-3.5" />
                    </button>
                </div>
            </td>
            {/* Limit (Total) */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="w-16 px-2 py-1 text-xs rounded border border-slate-200 text-slate-800 focus:border-violet-500 outline-none tabular-nums"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                    />
                    <button
                        onClick={handleSaveLimit}
                        disabled={isPending || tempLimit === u.aiCreditsTotal.toString()}
                        className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors disabled:opacity-40"
                        title="Save Total Limit"
                    >
                        <SaveIcon className="size-3.5" />
                    </button>
                </div>
            </td>
            {/* Adjustments */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleAdjust(50)}
                        disabled={isPending}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                    >
                        +50
                    </button>
                    <button
                        onClick={() => handleAdjust(100)}
                        disabled={isPending}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                    >
                        +100
                    </button>
                    <button
                        onClick={() => handleAdjust(-50)}
                        disabled={isPending}
                        className="px-2 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                        -50
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={isPending || u.aiCredits === u.aiCreditsTotal}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors disabled:opacity-40"
                        title="Reset to Total Limit"
                    >
                        <RefreshCwIcon className="size-3" /> Reset
                    </button>
                </div>
            </td>
            <td className="px-4 py-3.5 text-right">
                {isPending && <Loader2Icon className="size-4 animate-spin inline-block text-violet-500" />}
            </td>
        </tr>
    );
}

export default function AdminCredits() {
    const { data: users = [], isLoading } = useAdminUsers();
    const [q, setQ] = useState("");

    const filtered = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

    // Analytics summary
    const totalCurrentCredits = users.reduce((acc, curr) => acc + curr.aiCredits, 0);
    const totalLimitCredits = users.reduce((acc, curr) => acc + curr.aiCreditsTotal, 0);

    return (
        <>
            <PageHeader
                title="AI Credit Management"
                subtitle="Allocate and monitor credits across all customer accounts"
            />

            {/* Overview Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-violet-50 text-violet-500 rounded-xl">
                        <SparklesIcon className="size-5.5" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total Allocated</div>
                        <div className="text-xl font-bold text-slate-800 tabular-nums">{totalCurrentCredits}</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
                        <SparklesIcon className="size-5.5" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Max System Limit</div>
                        <div className="text-xl font-bold text-slate-800 tabular-nums">{totalLimitCredits}</div>
                    </div>
                </div>
                <div className="hidden sm:flex bg-white border border-slate-200 rounded-2xl p-4 items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                        <RefreshCwIcon className="size-5.5" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total User Profiles</div>
                        <div className="text-xl font-bold text-slate-800 tabular-nums">{users.length}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative mb-4 max-w-sm">
                <SearchIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name or email…"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-violet-300"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                                <th className="px-4 py-3.5 font-medium">User Profile</th>
                                <th className="px-4 py-3.5 font-medium">Plan</th>
                                <th className="px-4 py-3.5 font-medium">Current Balance</th>
                                <th className="px-4 py-3.5 font-medium">Total Limit</th>
                                <th className="px-4 py-3.5 font-medium">Quick Adjustments</th>
                                <th className="px-4 py-3.5 text-right" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <CreditRow key={u._id} u={u} />
                            ))}
                        </tbody>
                    </table>
                </div>
                {isLoading && <div className="p-8 text-center text-sm text-slate-400">Loading credits list…</div>}
                {!isLoading && filtered.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-400">No users match your query.</div>
                )}
            </div>
        </>
    );
}
