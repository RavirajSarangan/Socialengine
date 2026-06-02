import { useState } from "react";
import { PlusIcon, CheckCircle2Icon, Loader2Icon, ShieldCheckIcon, ClockIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, formatRelativeTime } from "../../lib/dashboard";
import { useAccounts, useConnectAccount, useDisconnectAccount, useVerifyAccounts } from "../../hooks/useData";

export default function Accounts() {
    const { data: accounts = [] } = useAccounts();
    const connect = useConnectAccount();
    const disconnect = useDisconnectAccount();
    const verify = useVerifyAccounts();
    const [handles, setHandles] = useState<Record<string, string>>({});

    const accountFor = (platformId: string) => accounts.find((a) => a.platform === platformId);
    const updateHandle = (platformId: string, handle: string) => setHandles((current) => ({ ...current, [platformId]: handle }));

    return (
        <>
            <PageHeader
                title="Accounts"
                subtitle="Connect the platforms you want to publish to"
                action={
                    <button onClick={() => verify.mutate()} disabled={verify.isPending} className="inline-flex items-center gap-2 text-sm border border-slate-200 text-slate-600 rounded-full px-4 py-2 hover:bg-slate-50 disabled:opacity-50">
                        {verify.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ShieldCheckIcon className="size-4" />} Verify connections
                    </button>
                }
            />

            <div className="grid sm:grid-cols-2 gap-4">
                {PLATFORMS.map((p) => {
                    const acct = accountFor(p.id);
                    const busy = (connect.isPending && connect.variables?.platform === p.id) || (disconnect.isPending && disconnect.variables === acct?._id);
                    return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                            <PlatformBadge platform={p.id} />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm text-slate-800">{p.name}</div>
                                {acct && acct.status === "connected" ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-0.5">
                                        <CheckCircle2Icon className="size-3.5" /> @{acct.handle} · verified {formatRelativeTime(acct.updatedAt)}
                                    </div>
                                ) : acct ? (
                                    <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-0.5">
                                        <ClockIcon className="size-3.5" /> @{acct.handle} · awaiting verification — connect {p.name} in your provider, then Verify
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

            <p className="text-xs text-slate-400 mt-4">Connections persist to your account. Scheduled posts publish automatically on time. Connect each platform in your publishing provider (Ayrshare), then click <span className="text-slate-500">Verify connections</span> — verified platforms post to your real timelines.</p>
        </>
    );
}
