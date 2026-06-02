import { Link } from "react-router-dom";
import { CalendarClockIcon, SendIcon, Share2Icon, SparklesIcon, ArrowRightIcon, PenSquareIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import PostCard from "../../components/dashboard/PostCard";
import ActivityItem from "../../components/dashboard/ActivityItem";
import { activity, getStats, posts } from "../../lib/dashboard";

export default function Overview() {
    const stats = getStats();
    const upcoming = posts
        .filter((p) => p.status === "scheduled")
        .sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor))
        .slice(0, 4);

    return (
        <>
            <PageHeader
                title="Overview"
                subtitle="A snapshot of your scheduling and engagement"
                action={
                    <Link to="/dashboard/compose" className="hidden sm:inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <PenSquareIcon className="size-4" /> Create Post
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Scheduled" value={stats.scheduled} icon={CalendarClockIcon} accent="text-amber-500 bg-amber-50" />
                <StatCard label="Published" value={stats.published} icon={SendIcon} accent="text-emerald-500 bg-emerald-50" hint="+12% this week" />
                <StatCard label="Connected accounts" value={stats.accounts} icon={Share2Icon} accent="text-sky-500 bg-sky-50" />
                <StatCard label="Active AI rules" value={stats.aiRules} icon={SparklesIcon} accent="text-red-500 bg-red-50" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-slate-700">Upcoming posts</h2>
                        <Link to="/dashboard/calendar" className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1">
                            View calendar <ArrowRightIcon className="size-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {upcoming.length > 0 ? (
                            upcoming.map((p) => <PostCard key={p._id} post={p} />)
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                                No scheduled posts. <Link to="/dashboard/compose" className="text-red-500">Create one</Link>.
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-slate-700">Recent activity</h2>
                        <Link to="/dashboard/activity" className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1">
                            All <ArrowRightIcon className="size-3" />
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 px-4 divide-y divide-slate-100">
                        {activity.slice(0, 6).map((a) => (
                            <ActivityItem key={a._id} item={a} />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
