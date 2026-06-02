import PageHeader from "../../components/dashboard/PageHeader";
import ActivityItem from "../../components/dashboard/ActivityItem";
import { activity } from "../../lib/dashboard";

export default function Activity() {
    return (
        <>
            <PageHeader title="Activity" subtitle="A complete log of everything that happened on your account" />
            <div className="bg-white rounded-2xl border border-slate-200 px-5 divide-y divide-slate-100">
                {activity.map((a) => (
                    <ActivityItem key={a._id} item={a} />
                ))}
            </div>
        </>
    );
}
