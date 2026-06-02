import type { PostStatus } from "../../lib/types";

const STYLES: Record<PostStatus, string> = {
    published: "bg-emerald-50 text-emerald-600 border-emerald-100",
    scheduled: "bg-amber-50 text-amber-600 border-amber-100",
    draft: "bg-slate-100 text-slate-500 border-slate-200",
    failed: "bg-red-50 text-red-600 border-red-100",
};

export default function StatusPill({ status }: { status: PostStatus }) {
    return <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border capitalize ${STYLES[status]}`}>{status}</span>;
}
