import { PlusIcon, CheckCircle2Icon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, accounts, formatRelativeTime } from "../../lib/dashboard";

export default function Accounts() {
    const connectedFor = (platformId: string) => accounts.find((a) => a.platform === platformId && a.status === "connected");

    return (
        <>
            <PageHeader title="Accounts" subtitle="Connect the platforms you want to publish to" />

            <div className="grid sm:grid-cols-2 gap-4">
                {PLATFORMS.map((p) => {
                    const acct = connectedFor(p.id);
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
                                    <div className="text-xs text-slate-400 mt-0.5 truncate">{p.description}</div>
                                )}
                            </div>
                            {acct ? (
                                <button className="text-xs text-slate-500 border border-slate-200 rounded-full px-3.5 py-1.5 hover:bg-slate-50">Disconnect</button>
                            ) : (
                                <button className="inline-flex items-center gap-1.5 text-xs text-white bg-linear-to-r from-red-600 to-red-500 rounded-full px-3.5 py-1.5 hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition-all">
                                    <PlusIcon className="size-3.5" /> Connect
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-slate-400 mt-4">Connections are powered by a social publishing API (Phase 5). OAuth flows open in a popup and never store your platform password.</p>
        </>
    );
}
