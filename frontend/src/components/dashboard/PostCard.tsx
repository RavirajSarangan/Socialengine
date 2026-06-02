import { CalendarClockIcon, LayersIcon } from "lucide-react";
import type { MediaItem, Post } from "../../lib/types";
import { formatDateTime, truncate } from "../../lib/dashboard";
import PlatformBadge from "./PlatformBadge";
import StatusPill from "./StatusPill";
import MediaPreview from "./MediaPreview";

export default function PostCard({ post }: { post: Post }) {
    const items: MediaItem[] = post.media && post.media.length > 0
        ? post.media
        : post.mediaUrl
            ? [{ url: post.mediaUrl, type: post.mediaType ?? "image" }]
            : [];
    const first = items[0];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 hover:border-slate-300 transition-colors">
            {first && (
                <div className="relative size-20 shrink-0">
                    <MediaPreview url={first.url} type={first.type} posterUrl={first.posterUrl} className="size-20 rounded-xl object-cover bg-slate-100" />
                    {items.length > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center gap-0.5 text-[10px] bg-slate-900 text-white rounded-full px-1.5 py-0.5">
                            <LayersIcon className="size-2.5" /> {items.length}
                        </span>
                    )}
                </div>
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
