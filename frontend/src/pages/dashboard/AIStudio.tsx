import { useState } from "react";
import { SparklesIcon, ImageIcon, AudioLinesIcon, Loader2Icon, WandSparklesIcon, CopyIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { toneOptions, truncate, voiceOptions } from "../../lib/dashboard";
import { useAuth } from "../../context/AuthContext";
import { useGenerations, useGenerateCaption, useGenerateImage, useGenerateVoice } from "../../hooks/useData";
import { API_URL, apiErrorMessage } from "../../lib/api";

type Tab = "caption" | "image" | "voice";

const TABS: { id: Tab; label: string; provider: string; icon: typeof SparklesIcon }[] = [
    { id: "caption", label: "Caption", provider: "OpenAI", icon: SparklesIcon },
    { id: "image", label: "Image", provider: "OpenAI", icon: ImageIcon },
    { id: "voice", label: "Voiceover", provider: "ElevenLabs", icon: AudioLinesIcon },
];

function mediaSrc(url?: string) {
    if (!url) return "";
    return url.startsWith("http") ? url : API_URL + url;
}

export default function AIStudio() {
    const { user, refresh } = useAuth();
    const { data: generations = [] } = useGenerations();
    const aiCredits = user?.aiCredits ?? 0;
    const [tab, setTab] = useState<Tab>("caption");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState(toneOptions[0]);
    const [voice, setVoice] = useState(voiceOptions[0].id);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ text?: string; image?: string; audio?: string } | null>(null);

    const caption = useGenerateCaption();
    const image = useGenerateImage();
    const voiceGen = useGenerateVoice();
    const loading = caption.isPending || image.isPending || voiceGen.isPending;

    const active = TABS.find((t) => t.id === tab)!;

    async function run() {
        if (!prompt.trim()) return;
        setError("");
        setResult(null);
        try {
            if (tab === "caption") {
                const r = await caption.mutateAsync({ prompt, tone });
                setResult({ text: r.generation.content });
            } else if (tab === "image") {
                const r = await image.mutateAsync({ prompt });
                setResult({ image: r.generation.mediaUrl });
            } else {
                const r = await voiceGen.mutateAsync({ text: prompt, voiceId: voice });
                setResult({ audio: r.generation.mediaUrl });
            }
            await refresh(); // update the AI-credit count
        } catch (e) {
            setError(apiErrorMessage(e, "Generation failed"));
        }
    }

    return (
        <>
            <PageHeader title="AI Studio" subtitle="Generate captions, images and voiceovers — powered by OpenAI & ElevenLabs" />

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
                {TABS.map(({ id, label, provider, icon: Icon }) => (
                    <button key={id} onClick={() => { setTab(id); setResult(null); }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${tab === id ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                        <Icon className="size-4" /> {label}
                        <span className="text-[10px] uppercase tracking-wide opacity-60">{provider}</span>
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">{tab === "voice" ? "Script" : "Prompt"}</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} placeholder={tab === "image" ? "A minimal product photo of white sneakers on a soft gradient…" : tab === "voice" ? "Paste the text you want narrated…" : "Write a launch post for our new AI feature…"} className="w-full resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-red-300 focus:bg-white transition-colors" />

                    {tab === "caption" && (
                        <div className="mt-3">
                            <span className="text-xs text-slate-400">Tone</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {toneOptions.map((t) => (
                                    <button key={t} onClick={() => setTone(t)} className={`text-xs px-3 py-1 rounded-full border ${tone === t ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === "voice" && (
                        <div className="mt-3">
                            <span className="text-xs text-slate-400">Voice</span>
                            <div className="grid grid-cols-2 gap-2 mt-1.5">
                                {voiceOptions.map((v) => (
                                    <button key={v.id} onClick={() => setVoice(v.id)} className={`text-left p-2.5 rounded-xl border text-sm ${voice === v.id ? "bg-red-50 border-red-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                        <div className="text-slate-700">{v.name}</div>
                                        <div className="text-xs text-slate-400">{v.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={run} disabled={loading || !prompt.trim()} className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white rounded-full py-2.5 text-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50">
                        {loading ? <Loader2Icon className="size-4 animate-spin" /> : <WandSparklesIcon className="size-4" />} Generate {active.label.toLowerCase()}
                    </button>
                    <p className="text-xs text-slate-400 text-center mt-2">Uses 1 of {aiCredits} AI credits</p>
                    {error && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                </div>

                {/* Output */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 min-h-[18rem]">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Result</h3>
                    {!result && !loading && <div className="h-48 grid place-items-center text-sm text-slate-300">Your generated {active.label.toLowerCase()} will appear here</div>}
                    {loading && <div className="h-48 grid place-items-center text-sm text-slate-400"><Loader2Icon className="size-6 animate-spin text-red-400" /></div>}
                    {result?.text && (
                        <div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.text}</p>
                            <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50"><CopyIcon className="size-3.5" /> Copy</button>
                        </div>
                    )}
                    {result?.image && <img src={mediaSrc(result.image)} alt="" className="w-full rounded-xl object-cover" />}
                    {result?.audio && <audio controls src={mediaSrc(result.audio)} className="w-full mt-1" />}
                </div>
            </div>

            {/* History */}
            <h3 className="text-sm font-medium text-slate-700 mt-8 mb-3">Recent generations</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {generations.slice(0, 6).map((g) => (
                    <div key={g._id} className="bg-white rounded-2xl border border-slate-200 p-4">
                        {g.mediaUrl && g.mediaType === "audio" && <audio controls src={mediaSrc(g.mediaUrl)} className="w-full mb-3" />}
                        {g.mediaUrl && g.mediaType !== "audio" && <img src={mediaSrc(g.mediaUrl)} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />}
                        <p className="text-xs text-slate-400 mb-1">{g.prompt}</p>
                        {g.content && <p className="text-sm text-slate-600">{truncate(g.content, 90)}</p>}
                        {g.tone && <span className="inline-block mt-2 text-[11px] text-red-500 bg-red-50 rounded-full px-2 py-0.5">{g.tone}</span>}
                    </div>
                ))}
            </div>
        </>
    );
}
