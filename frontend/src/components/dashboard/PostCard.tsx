import { CalendarClockIcon } from "lucide-react";
import type { Post } from "../../lib/types";
import { formatDateTime, truncate } from "../../lib/dashboard";
import PlatformBadge from "./PlatformBadge";
import StatusPill from "./StatusPill";

export default function PostCard({ post }: { post: Post }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 hover:border-slate-300 transition-colors">
            {post.mediaUrl && (
                <img src={post.mediaUrl} alt="" className="size-20 rounded-xl object-cover shrink-0 bg-slate-100" />
            )}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5">
                        {post.platforms.map((p) => (
                            <PlatformBadge key={p} platform={p} size="sm" />
                        ))}
                    </div>
                    <StatusPill status={post.status} />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{truncate(post.content, 160)}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2.5">
                    <CalendarClockIcon className="size-3.5" />
                    {formatDateTime(post.scheduledFor)}
                </div>
            </div>
        </div>
    );
}
