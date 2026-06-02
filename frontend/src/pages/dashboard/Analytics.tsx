import { CalendarClockIcon, FileCheck2Icon, MessageSquareReplyIcon, UsersIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS } from "../../lib/dashboard";
import { useAccounts, useAnalytics, usePosts } from "../../hooks/useData";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function Analytics() {
    const { data: summary } = useAnalytics();
    const { data: posts = [] } = usePosts();
    const { data: accounts = [] } = useAccounts();

    const today = new Date();
    const week = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today.getTime() - (6 - index) * DAY_MS);
        const key = date.toISOString().slice(0, 10);
        return {
            key,
            label: date.toLocaleDateString(undefined, { weekday: "short" }),
            posts: posts.filter((post) => (post.scheduledFor || post.createdAt).slice(0, 10) === key).length,
        };
    });
    const maxPosts = Math.max(1, ...week.map((d) => d.posts));
    const platformCounts = PLATFORMS.map((platform) => ({
        ...platform,
        count: posts.filter((post) => post.platforms.includes(platform.id)).length,
        connected: accounts.some((account) => account.platform === platform.id && account.status === "connected"),
    }));
    const totalPlatformPosts = Math.max(1, platformCounts.reduce((sum, platform) => sum + platform.count, 0));

    return (
        <>
            <PageHeader title="Analytics" subtitle="Database-backed activity across your connected platforms" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Scheduled" value={summary?.scheduled ?? 0} icon={CalendarClockIcon} accent="text-sky-500 bg-sky-50" hint="Posts" />
                <StatCard label="Published" value={summary?.published ?? 0} icon={FileCheck2Icon} accent="text-emerald-500 bg-emerald-50" hint="Posts" />
                <StatCard label="Accounts" value={summary?.accounts ?? 0} icon={UsersIcon} accent="text-rose-500 bg-rose-50" hint="Connected" />
                <StatCard label="AI rules" value={summary?.aiRules ?? 0} icon={MessageSquareReplyIcon} accent="text-red-500 bg-red-50" hint="Active" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-medium text-slate-700 mb-5">Posts this week</h3>
                    <div className="flex items-end justify-between gap-3 h-48">
                        {week.map((d) => (
                            <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col justify-end h-40">
                                    <div className="w-full min-h-1 rounded-t-lg bg-linear-to-t from-red-500 to-red-400 transition-all" style={{ height: `${(d.posts / maxPosts) * 100}%` }} title={`${d.posts} posts`} />
                                </div>
                                <span className="text-xs text-slate-400">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-medium text-slate-700 mb-4">Platform activity</h3>
                    <div className="space-y-4">
                        {platformCounts.map((p) => {
                            const pct = Math.round((p.count / totalPlatformPosts) * 100);
                            return (
                                <div key={p.id}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <PlatformBadge platform={p.id} size="sm" withLabel />
                                        <span className="text-xs text-slate-400">{p.connected ? `${p.count} posts` : "not connected"}</span>
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
        </>
    );
}
