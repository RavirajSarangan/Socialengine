import PageHeader from "../../components/dashboard/PageHeader";
import ActivityItem from "../../components/dashboard/ActivityItem";
import { useActivity } from "../../hooks/useData";

export default function Activity() {
    const { data: activity = [], isLoading } = useActivity();
    return (
        <>
            <PageHeader title="Activity" subtitle="A complete log of everything that happened on your account" />
            <div className="bg-white rounded-2xl border border-slate-200 px-5 divide-y divide-slate-100">
                {activity.map((a) => (
                    <ActivityItem key={a._id} item={a} />
                ))}
                {activity.length === 0 && <p className="py-8 text-center text-sm text-slate-400">{isLoading ? "Loading…" : "No activity yet."}</p>}
            </div>
        </>
    );
}
