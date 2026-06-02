import { useState } from "react";
import { Link } from "react-router-dom";
import { PenSquareIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PostCard from "../../components/dashboard/PostCard";
import { usePosts } from "../../hooks/useData";
import type { PostStatus } from "../../lib/types";

const FILTERS: { id: "all" | PostStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Drafts" },
    { id: "failed", label: "Failed" },
];

export default function Posts() {
    const [filter, setFilter] = useState<"all" | PostStatus>("all");
    const { data: posts = [], isLoading } = usePosts();

    const filtered = posts
        .filter((p) => filter === "all" || p.status === filter)
        .sort((a, b) => +new Date(b.scheduledFor) - +new Date(a.scheduledFor));

    return (
        <>
            <PageHeader
                title="Posts"
                subtitle="Everything you've created, scheduled and published"
                action={
                    <Link to="/dashboard/compose" className="hidden sm:inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <PenSquareIcon className="size-4" /> Create Post
                    </Link>
                }
            />

            <div className="flex flex-wrap gap-2 mb-5">
                {FILTERS.map((f) => {
                    const count = f.id === "all" ? posts.length : posts.filter((p) => p.status === f.id).length;
                    return (
                        <button key={f.id} onClick={() => setFilter(f.id)} className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${filter === f.id ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                            {f.label} <span className="text-xs opacity-70">{count}</span>
                        </button>
                    );
                })}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
                {filtered.map((p) => (
                    <PostCard key={p._id} post={p} />
                ))}
            </div>
            {filtered.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">{isLoading ? "Loading posts…" : "No posts match this filter."}</div>}
        </>
    );
}
