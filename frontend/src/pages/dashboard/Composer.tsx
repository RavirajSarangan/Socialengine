import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SparklesIcon, ImageIcon, AudioLinesIcon, CalendarClockIcon, SendIcon, Loader2Icon, XIcon, UploadCloudIcon, SmileIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import MediaPreview from "../../components/dashboard/MediaPreview";
import { PLATFORMS, toneOptions, captionLimit, EMOJIS } from "../../lib/dashboard";
import { useAuth } from "../../context/AuthContext";
import { useCreatePost, useGenerateCaption, useGenerateImage, useGenerateVoice } from "../../hooks/useData";
import { useUploadMedia } from "../../hooks/useMedia";
import { apiErrorMessage } from "../../lib/api";
import type { MediaItem, MediaType } from "../../lib/types";

export default function Composer() {
    const { user, refresh } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const createPost = useCreatePost();
    const caption = useGenerateCaption();
    const image = useGenerateImage();
    const voiceGen = useGenerateVoice();
    const uploadMedia = useUploadMedia();
    const [content, setContent] = useState("");
    const [selected, setSelected] = useState<string[]>(["instagram"]);
    const [media, setMedia] = useState<MediaItem[]>(() => {
        const preset = (location.state as { media?: MediaItem } | null)?.media;
        return preset ? [preset] : [];
    });
    const [tone, setTone] = useState(toneOptions[0]);
    const [schedule, setSchedule] = useState("");
    const [generating, setGenerating] = useState<null | "text" | "image" | "voice">(null);
    const [uploading, setUploading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);

    function togglePlatform(id: string) {
        setSelected((s) => (s.includes(id) ? s.filter((p) => p !== id) : [...s, id]));
    }

    function removeMedia(index: number) {
        setMedia((m) => m.filter((_, i) => i !== index));
    }

    /** Capture a poster frame from a video file (client-side, no ffmpeg) and upload it as an image. */
    async function capturePoster(file: File): Promise<string | undefined> {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.muted = true;
            video.src = URL.createObjectURL(file);
            video.onloadeddata = () => {
                video.currentTime = Math.min(1, video.duration || 0);
            };
            video.onseeked = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(undefined);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async (blob) => {
                    URL.revokeObjectURL(video.src);
                    if (!blob) return resolve(undefined);
                    try {
                        const asset = await uploadMedia.mutateAsync(new File([blob], "poster.png", { type: "image/png" }));
                        resolve(asset.url);
                    } catch {
                        resolve(undefined);
                    }
                }, "image/png");
            };
            video.onerror = () => resolve(undefined);
        });
    }

    async function onFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        setAiError("");
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const type: MediaType = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image";
                const asset = await uploadMedia.mutateAsync(file);
                const posterUrl = type === "video" ? await capturePoster(file) : undefined;
                setMedia((m) => [...m, { url: asset.url, type, posterUrl }]);
            }
        } catch (e) {
            setAiError(apiErrorMessage(e, "Upload failed"));
        } finally {
            setUploading(false);
        }
    }

    function submit(status: "draft" | "scheduled" | "published") {
        const scheduledFor = schedule ? new Date(schedule).toISOString() : new Date().toISOString();
        createPost.mutate(
            {
                content,
                platforms: selected,
                media: media.length ? media : undefined,
                scheduledFor,
                status,
            },
            { onSuccess: () => navigate("/dashboard/posts") }
        );
    }

    async function generate(kind: "text" | "image" | "voice") {
        if (!content.trim()) {
            setAiError("Type a short idea or brief first, then generate.");
            return;
        }
        setAiError("");
        setGenerating(kind);
        try {
            if (kind === "text") {
                const r = await caption.mutateAsync({ prompt: content, tone, platforms: selected });
                setContent(r.generation.content);
            } else if (kind === "image") {
                const r = await image.mutateAsync({ prompt: content });
                if (r.generation.mediaUrl) setMedia((m) => [...m, { url: r.generation.mediaUrl!, type: "image" }]);
            } else {
                const r = await voiceGen.mutateAsync({ text: content, voiceId: "rachel" });
                if (r.generation.mediaUrl) setMedia((m) => [...m, { url: r.generation.mediaUrl!, type: "audio" }]);
            }
            await refresh(); // refresh AI-credit count
        } catch (e) {
            setAiError(apiErrorMessage(e, "Generation failed"));
        } finally {
            setGenerating(null);
        }
    }

    const limit = captionLimit(selected);
    const remaining = limit - content.length;

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
                        <div className="flex items-center justify-between mt-2">
                            <div className="relative">
                                <button onClick={() => setShowEmoji((v) => !v)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                                    <SmileIcon className="size-4" /> Emoji
                                </button>
                                {showEmoji && (
                                    <div className="absolute z-10 mt-2 w-56 grid grid-cols-8 gap-1 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                                        {EMOJIS.map((e) => (
                                            <button key={e} onClick={() => { setContent((c) => c + e); setShowEmoji(false); }} className="text-lg hover:bg-slate-50 rounded">{e}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs ${remaining < 0 ? "text-red-500" : "text-slate-400"}`}>{remaining} / {limit}</span>
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

                    {/* Media upload + items */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Media</h3>
                        <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
                            className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-200 rounded-xl py-7 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-colors"
                        >
                            {uploading ? <Loader2Icon className="size-5 animate-spin text-red-400" /> : <UploadCloudIcon className="size-5 text-slate-400" />}
                            <span className="text-sm text-slate-500">Drop images / videos / audio, or click to upload</span>
                            <span className="text-xs text-slate-400">Up to 50&nbsp;MB each</span>
                            <input type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
                        </label>

                        {media.length > 0 && (
                            <div className="grid grid-cols-3 gap-2.5 mt-3">
                                {media.map((m, i) => (
                                    <div key={`${m.url}-${i}`} className="relative group">
                                        <MediaPreview url={m.url} type={m.type} posterUrl={m.posterUrl} className="w-full h-24 object-cover rounded-xl bg-slate-100" />
                                        <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 size-6 grid place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <XIcon className="size-3.5" />
                                        </button>
                                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1.5 py-0.5 capitalize">{m.type}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
                            <button onClick={() => submit(schedule ? "scheduled" : "published")} className="flex-1 inline-flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50" disabled={!content || selected.length === 0 || remaining < 0 || createPost.isPending}>
                                {createPost.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />} {schedule ? "Schedule post" : "Publish now"}
                            </button>
                            <button onClick={() => submit("draft")} disabled={!content || createPost.isPending} className="px-5 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Save draft</button>
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
                        {media[0] && <MediaPreview url={media[0].url} type={media[0].type} posterUrl={media[0].posterUrl} className="w-full max-h-80 object-cover" />}
                        {media.length > 1 && <div className="px-4 pt-2 text-xs text-slate-400">+{media.length - 1} more attached</div>}
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
