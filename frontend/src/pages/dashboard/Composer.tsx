import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesIcon, ImageIcon, AudioLinesIcon, CalendarClockIcon, SendIcon, Loader2Icon, XIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { PLATFORMS, toneOptions } from "../../lib/dashboard";
import { useAuth } from "../../context/AuthContext";
import { useCreatePost } from "../../hooks/useData";

export default function Composer() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const createPost = useCreatePost();
    const [content, setContent] = useState("");
    const [selected, setSelected] = useState<string[]>(["instagram"]);
    const [mediaUrl, setMediaUrl] = useState("");
    const [tone, setTone] = useState(toneOptions[0]);
    const [schedule, setSchedule] = useState("");
    const [generating, setGenerating] = useState<null | "text" | "image" | "voice">(null);
    const [aiError, setAiError] = useState("");

    function togglePlatform(id: string) {
        setSelected((s) => (s.includes(id) ? s.filter((p) => p !== id) : [...s, id]));
    }

    function submit() {
        const scheduledFor = schedule ? new Date(schedule).toISOString() : new Date().toISOString();
        createPost.mutate(
            {
                content,
                platforms: selected,
                mediaUrl: mediaUrl || undefined,
                mediaType: mediaUrl ? "image" : undefined,
                scheduledFor,
                status: schedule ? "scheduled" : "published",
            },
            { onSuccess: () => navigate("/dashboard/posts") }
        );
    }

    function generate(kind: "text" | "image" | "voice") {
        setGenerating(kind);
        setAiError("AI generation API is not connected yet.");
        setGenerating(null);
    }

    const remaining = 2200 - content.length;

    return (
        <>
            <PageHeader title="Composer" subtitle="Write once, publish everywhere — or let AI draft it for you" />

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Editor */}
                <div className="lg:col-span-3 space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Caption</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            placeholder="What do you want to share?"
                            className="w-full resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-red-300 focus:bg-white transition-colors"
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                            <span>AI tone:</span>
                            <span className={remaining < 0 ? "text-red-500" : ""}>{remaining} characters left</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {toneOptions.map((t) => (
                                <button key={t} onClick={() => setTone(t)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${tone === t ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI actions */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <SparklesIcon className="size-4 text-red-500" />
                            <h3 className="text-sm font-medium text-slate-700">Generate with AI</h3>
                            <span className="text-xs text-slate-400 ml-auto">{user?.aiCredits ?? 0} credits</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <AIButton label="Write caption" sub="OpenAI" icon={SparklesIcon} loading={generating === "text"} onClick={() => generate("text")} />
                            <AIButton label="Generate image" sub="OpenAI" icon={ImageIcon} loading={generating === "image"} onClick={() => generate("image")} />
                            <AIButton label="Add voiceover" sub="ElevenLabs" icon={AudioLinesIcon} loading={generating === "voice"} onClick={() => generate("voice")} />
                        </div>
                        {aiError && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{aiError}</p>}
                    </div>

                    {/* Media */}
                    {mediaUrl && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-700">Media</h3>
                                <button onClick={() => setMediaUrl("")} className="text-slate-400 hover:text-red-500">
                                    <XIcon className="size-4" />
                                </button>
                            </div>
                            <img src={mediaUrl} alt="" className="w-full max-h-72 object-cover rounded-xl" />
                        </div>
                    )}

                    {/* Platforms + schedule */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Publish to</label>
                        <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
                            {PLATFORMS.map((p) => {
                                const on = selected.includes(p.id);
                                return (
                                    <button key={p.id} onClick={() => togglePlatform(p.id)} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${on ? "border-red-200 bg-red-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                                        <PlatformBadge platform={p.id} />
                                        <div className="min-w-0">
                                            <div className="text-sm text-slate-700">{p.name}</div>
                                            <div className="text-xs text-slate-400 truncate">{p.description}</div>
                                        </div>
                                        <span className={`ml-auto size-4 rounded-full border-2 ${on ? "bg-red-500 border-red-500" : "border-slate-300"}`} />
                                    </button>
                                );
                            })}
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
                        <div className="relative">
                            <CalendarClockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-red-300" />
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button onClick={submit} className="flex-1 inline-flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50" disabled={!content || selected.length === 0 || createPost.isPending}>
                                {createPost.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />} {schedule ? "Schedule post" : "Publish now"}
                            </button>
                            <button onClick={() => createPost.mutate({ content, platforms: selected, mediaUrl: mediaUrl || undefined, mediaType: mediaUrl ? "image" : undefined, status: "draft" }, { onSuccess: () => navigate("/dashboard/posts") })} disabled={!content} className="px-5 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Save draft</button>
                        </div>
                    </div>
                </div>

                {/* Live preview */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Preview</h3>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                            <span className="size-9 rounded-full bg-linear-to-br from-red-500 to-red-600 text-white grid place-items-center text-xs font-medium">{(user?.name ?? "SE").slice(0, 2).toUpperCase()}</span>
                            <div>
                                <div className="text-sm text-slate-700">{user?.name ?? "You"}</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {selected.length ? selected.map((p) => <PlatformBadge key={p} platform={p} size="sm" />) : <span className="text-xs text-slate-400">No platform selected</span>}
                                </div>
                            </div>
                        </div>
                        {mediaUrl && <img src={mediaUrl} alt="" className="w-full max-h-80 object-cover" />}
                        <div className="p-4">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{content || <span className="text-slate-300">Your caption preview appears here…</span>}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

interface AIButtonProps {
    label: string;
    sub: string;
    icon: typeof SparklesIcon;
    loading: boolean;
    onClick: () => void;
}

function AIButton({ label, sub, icon: Icon, loading, onClick }: AIButtonProps) {
    return (
        <button onClick={onClick} disabled={loading} className="flex flex-col items-start gap-1 p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/40 transition-colors disabled:opacity-60">
            <span className="size-8 rounded-full bg-red-50 text-red-500 grid place-items-center">{loading ? <Loader2Icon className="size-4 animate-spin" /> : <Icon className="size-4" />}</span>
            <span className="text-sm text-slate-700 mt-1">{label}</span>
            <span className="text-xs text-slate-400">{sub}</span>
        </button>
    );
}
