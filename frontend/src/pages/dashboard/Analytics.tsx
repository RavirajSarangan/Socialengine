import { TrendingUpIcon, HeartIcon, Share2Icon, UsersIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, analyticsSeries } from "../../lib/dashboard";

export default function Analytics() {
    const maxEng = Math.max(...analyticsSeries.map((d) => d.engagement));

    return (
        <>
            <PageHeader title="Analytics" subtitle="Engagement trends across your connected platforms" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total reach" value="24.8k" icon={UsersIcon} accent="text-sky-500 bg-sky-50" hint="+8.2%" />
                <StatCard label="Engagements" value="1,260" icon={HeartIcon} accent="text-rose-500 bg-rose-50" hint="+14%" />
                <StatCard label="Shares" value="312" icon={Share2Icon} accent="text-emerald-500 bg-emerald-50" hint="+5%" />
                <StatCard label="Avg. eng. rate" value="4.7%" icon={TrendingUpIcon} accent="text-red-500 bg-red-50" hint="+0.6pt" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-medium text-slate-700 mb-5">Engagement this week</h3>
                    <div className="flex items-end justify-between gap-3 h-48">
                        {analyticsSeries.map((d) => (
                            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col justify-end h-40">
                                    <div className="w-full rounded-t-lg bg-linear-to-t from-red-500 to-red-400 transition-all" style={{ height: `${(d.engagement / maxEng) * 100}%` }} title={`${d.engagement} engagements`} />
                                </div>
                                <span className="text-xs text-slate-400">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Per-platform */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-medium text-slate-700 mb-4">By platform</h3>
                    <div className="space-y-4">
                        {PLATFORMS.map((p, i) => {
                            const pct = [72, 58, 41, 30][i];
                            return (
                                <div key={p.id}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <PlatformBadge platform={p.id} size="sm" withLabel />
                                        <span className="text-xs text-slate-400">{pct}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-400 mt-4">Showing sample data. Live metrics are pulled from the publishing API in Phase 6.</p>
        </>
    );
}
