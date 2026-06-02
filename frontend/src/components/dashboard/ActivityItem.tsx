import { CheckCircle2Icon } from "lucide-react";
import type { Activity } from "../../lib/types";
import { formatRelativeTime, truncate } from "../../lib/dashboard";

export default function ActivityItem({ item }: { item: Activity }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <span className="size-8 rounded-full bg-emerald-50 text-emerald-500 grid place-items-center shrink-0">
                <CheckCircle2Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{item.description.trim()}</p>
                {item.relatedPost && <p className="text-xs text-slate-400 mt-0.5">{truncate(item.relatedPost.content, 80)}</p>}
            </div>
            <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.createdAt)}</span>
        </div>
    );
}
