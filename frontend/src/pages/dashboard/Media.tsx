import { useNavigate } from "react-router-dom";
import { UploadCloudIcon, Trash2Icon, Loader2Icon, SendIcon, SparklesIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import MediaPreview from "../../components/dashboard/MediaPreview";
import { useMediaAssets, useUploadMedia, useDeleteMedia } from "../../hooks/useMedia";
import { formatRelativeTime } from "../../lib/dashboard";

export default function Media() {
    const navigate = useNavigate();
    const { data: assets = [], isLoading } = useMediaAssets();
    const upload = useUploadMedia();
    const remove = useDeleteMedia();

    async function onFiles(files: FileList | null) {
        if (!files) return;
        for (const file of Array.from(files)) {
            await upload.mutateAsync(file).catch(() => null);
        }
    }

    return (
        <>
            <PageHeader
                title="Media library"
                subtitle="Your uploaded and AI-generated images, videos and audio"
                action={
                    <label className="inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 text-sm cursor-pointer hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                        {upload.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <UploadCloudIcon className="size-4" />} Upload
                        <input type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
                    </label>
                }
            />

            {isLoading ? (
                <div className="h-48 grid place-items-center text-slate-400"><Loader2Icon className="size-6 animate-spin" /></div>
            ) : assets.length === 0 ? (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-colors">
                    <UploadCloudIcon className="size-7 text-slate-400" />
                    <span className="text-sm text-slate-500">Upload images, videos or audio — or generate them in AI Studio</span>
                    <input type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
                </label>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {assets.map((a) => (
                        <div key={a._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
                            <div className="relative h-36 bg-slate-100">
                                <MediaPreview url={a.url} type={a.type} posterUrl={a.posterUrl} className="w-full h-36 object-cover" />
                                <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] bg-black/60 text-white rounded-full px-2 py-0.5 capitalize">
                                    {a.source === "ai" && <SparklesIcon className="size-2.5" />}{a.type}
                                </span>
                            </div>
                            <div className="p-3">
                                <div className="text-xs text-slate-500 truncate">{a.name || a.type}</div>
                                <div className="text-[11px] text-slate-400 mb-2">{formatRelativeTime(a.createdAt)}</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigate("/dashboard/compose", { state: { media: { url: a.url, type: a.type, posterUrl: a.posterUrl, size: a.size } } })} className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-full py-1.5 hover:bg-red-100">
                                        <SendIcon className="size-3" /> Use in post
                                    </button>
                                    <button onClick={() => remove.mutate(a._id)} className="size-7 grid place-items-center rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200">
                                        <Trash2Icon className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
