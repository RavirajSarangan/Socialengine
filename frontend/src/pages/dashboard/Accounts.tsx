import { useState } from "react";
import { PlusIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, formatRelativeTime } from "../../lib/dashboard";
import { useAccounts, useConnectAccount, useDisconnectAccount } from "../../hooks/useData";

export default function Accounts() {
    const { data: accounts = [] } = useAccounts();
    const connect = useConnectAccount();
    const disconnect = useDisconnectAccount();
    const [handles, setHandles] = useState<Record<string, string>>({});

    const connectedFor = (platformId: string) => accounts.find((a) => a.platform === platformId && a.status === "connected");
    const updateHandle = (platformId: string, handle: string) => setHandles((current) => ({ ...current, [platformId]: handle }));

    return (
        <>
            <PageHeader title="Accounts" subtitle="Connect the platforms you want to publish to" />

            <div className="grid sm:grid-cols-2 gap-4">
                {PLATFORMS.map((p) => {
                    const acct = connectedFor(p.id);
                    const busy = (connect.isPending && connect.variables?.platform === p.id) || (disconnect.isPending && disconnect.variables === acct?._id);
                    return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                            <PlatformBadge platform={p.id} />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm text-slate-800">{p.name}</div>
                                {acct ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-0.5">
                                        <CheckCircle2Icon className="size-3.5" /> @{acct.handle} · connected {formatRelativeTime(acct.updatedAt)}
                                    </div>
                                ) : (
                                    <input
                                        value={handles[p.id] ?? ""}
                                        onChange={(e) => updateHandle(p.id, e.target.value)}
                                        placeholder="@handle"
                                        className="mt-2 w-full max-w-xs rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-red-300 focus:bg-white"
                                    />
                                )}
                            </div>
                            {acct ? (
                                <button onClick={() => disconnect.mutate(acct._id)} disabled={busy} className="text-xs text-slate-500 border border-slate-200 rounded-full px-3.5 py-1.5 hover:bg-slate-50 disabled:opacity-50">Disconnect</button>
                            ) : (
                                <button
                                    onClick={() => connect.mutate(
                                        { platform: p.id, handle: (handles[p.id] ?? "").trim() },
                                        { onSuccess: () => updateHandle(p.id, "") }
                                    )}
                                    disabled={busy || !(handles[p.id] ?? "").trim()}
                                    className="inline-flex items-center gap-1.5 text-xs text-white bg-linear-to-r from-red-600 to-red-500 rounded-full px-3.5 py-1.5 hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50"
                                >
                                    {busy ? <Loader2Icon className="size-3.5 animate-spin" /> : <PlusIcon className="size-3.5" />} Connect
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-slate-400 mt-4">Connections persist to your account. Live publishing via the Zernio/Ayrshare API is wired in Phase 9.</p>
        </>
    );
}
