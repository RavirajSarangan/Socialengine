import { useState } from "react";
import { MessageSquareReplyIcon, SparklesIcon, PlusIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, toneOptions } from "../../lib/dashboard";
import { useAutoReply, useCreateRule, useToggleRule } from "../../hooks/useData";

export default function AutoReply() {
    const { data: rules = [] } = useAutoReply();
    const createRule = useCreateRule();
    const toggleRule = useToggleRule();
    const [formOpen, setFormOpen] = useState(false);
    const [platform, setPlatform] = useState(PLATFORMS[0].id);
    const [trigger, setTrigger] = useState("");
    const [tone, setTone] = useState(toneOptions[0]);
    const [instructions, setInstructions] = useState("");

    function toggle(id: string, enabled: boolean) {
        toggleRule.mutate({ id, enabled: !enabled });
    }

    function submitRule(e: React.FormEvent) {
        e.preventDefault();
        createRule.mutate(
            { platform, trigger, tone, instructions, enabled: true },
            {
                onSuccess: () => {
                    setTrigger("");
                    setInstructions("");
                    setFormOpen(false);
                },
            }
        );
    }

    return (
        <>
            <PageHeader
                title="Auto-Reply"
                subtitle="Let AI handle comments, mentions and DMs in your voice"
                action={
                    <button onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        <PlusIcon className="size-4" /> New rule
                    </button>
                }
            />

            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <SparklesIcon className="size-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">Auto-reply drafts responses with OpenAI based on each rule's tone and instructions. Replies can post automatically or wait for your approval (configurable per rule in Phase 6).</p>
            </div>

            {formOpen && (
                <form onSubmit={submitRule} className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 grid gap-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                        <label className="text-xs text-slate-500">
                            Platform
                            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300">
                                {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </label>
                        <label className="text-xs text-slate-500">
                            Trigger
                            <input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="New comment" className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300" />
                        </label>
                        <label className="text-xs text-slate-500">
                            Tone
                            <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300">
                                {toneOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </label>
                    </div>
                    <label className="text-xs text-slate-500">
                        Instructions
                        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Tell the assistant how to respond." className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300" />
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={createRule.isPending || !trigger.trim() || !instructions.trim()} className="rounded-full bg-red-500 px-4 py-2 text-sm text-white disabled:opacity-50">Save rule</button>
                    </div>
                </form>
            )}

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
                        <button onClick={() => toggle(r._id, r.enabled)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${r.enabled ? "bg-red-500" : "bg-slate-200"}`} aria-label="toggle rule">
                            <span className={`absolute top-0.5 size-5 bg-white rounded-full transition-all ${r.enabled ? "left-5.5" : "left-0.5"}`} />
                        </button>
                    </div>
                ))}
                {!rules.length && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
                        No auto-reply rules yet.
                    </div>
                )}
            </div>
        </>
    );
}
