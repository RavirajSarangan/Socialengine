import { useState } from "react";
import { MessageSquareReplyIcon, SparklesIcon, PlusIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { autoReplyRules } from "../../lib/dashboard";
import type { AutoReplyRule } from "../../lib/types";

export default function AutoReply() {
    const [rules, setRules] = useState<AutoReplyRule[]>(autoReplyRules);

    function toggle(id: string) {
        setRules((rs) => rs.map((r) => (r._id === id ? { ...r, enabled: !r.enabled } : r)));
    }

    return (
        <>
            <PageHeader
                title="Auto-Reply"
                subtitle="Let AI handle comments, mentions and DMs in your voice"
                action={
                    <button className="hidden sm:inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <PlusIcon className="size-4" /> New rule
                    </button>
                }
            />

            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <SparklesIcon className="size-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">Auto-reply drafts responses with OpenAI based on each rule's tone and instructions. Replies can post automatically or wait for your approval (configurable per rule in Phase 6).</p>
            </div>

            <div className="space-y-3">
                {rules.map((r) => (
                    <div key={r._id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
                        <span className="size-10 rounded-full bg-red-50 text-red-500 grid place-items-center shrink-0">
                            <MessageSquareReplyIcon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <PlatformBadge platform={r.platform} size="sm" withLabel />
                                <span className="text-xs text-slate-300">·</span>
                                <span className="text-sm text-slate-700">{r.trigger}</span>
                                <span className="text-[11px] text-red-500 bg-red-50 rounded-full px-2 py-0.5">{r.tone}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1.5">{r.instructions}</p>
                        </div>
                        <button onClick={() => toggle(r._id)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${r.enabled ? "bg-red-500" : "bg-slate-200"}`} aria-label="toggle rule">
                            <span className={`absolute top-0.5 size-5 bg-white rounded-full transition-all ${r.enabled ? "left-5.5" : "left-0.5"}`} />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
