import { useState } from "react";
import { SparklesIcon, ImageIcon, AudioLinesIcon, Loader2Icon, WandSparklesIcon, CopyIcon, PlayIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { currentUser, generations, toneOptions, truncate, voiceOptions } from "../../lib/dashboard";

type Tab = "caption" | "image" | "voice";

const TABS: { id: Tab; label: string; provider: string; icon: typeof SparklesIcon }[] = [
    { id: "caption", label: "Caption", provider: "OpenAI", icon: SparklesIcon },
    { id: "image", label: "Image", provider: "OpenAI", icon: ImageIcon },
    { id: "voice", label: "Voiceover", provider: "ElevenLabs", icon: AudioLinesIcon },
];

const SAMPLE_TEXT =
    "Introducing our most requested update yet. ✨ Faster, smarter, and built around how you actually work. Available today for every plan — no upgrade required.\n\n#ProductUpdate #Innovation #BuildInPublic";

export default function AIStudio() {
    const [tab, setTab] = useState<Tab>("caption");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState(toneOptions[0]);
    const [voice, setVoice] = useState(voiceOptions[0].id);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ text?: string; image?: string; audio?: boolean } | null>(null);

    const active = TABS.find((t) => t.id === tab)!;

    /* Phase 4 swaps this simulation for POST /ai/caption | /ai/image | /ai/voice. */
    function run() {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        setTimeout(() => {
            if (tab === "caption") setResult({ text: SAMPLE_TEXT });
            if (tab === "image") setResult({ image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80" });
            if (tab === "voice") setResult({ audio: true });
            setLoading(false);
        }, 1300);
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
                    <p className="text-xs text-slate-400 text-center mt-2">Uses 1 of {currentUser.aiCredits} AI credits</p>
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
                    {result?.image && <img src={result.image} alt="" className="w-full rounded-xl object-cover" />}
                    {result?.audio && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <button className="size-10 rounded-full bg-red-500 text-white grid place-items-center"><PlayIcon className="size-4" /></button>
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200"><div className="h-full w-1/3 rounded-full bg-red-400" /></div>
                            <span className="text-xs text-slate-400">0:12</span>
                        </div>
                    )}
                </div>
            </div>

            {/* History */}
            <h3 className="text-sm font-medium text-slate-700 mt-8 mb-3">Recent generations</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {generations.slice(0, 6).map((g) => (
                    <div key={g._id} className="bg-white rounded-2xl border border-slate-200 p-4">
                        {g.mediaUrl && <img src={g.mediaUrl} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />}
                        <p className="text-xs text-slate-400 mb-1">{g.prompt}</p>
                        <p className="text-sm text-slate-600">{truncate(g.content, 90)}</p>
                        <span className="inline-block mt-2 text-[11px] text-red-500 bg-red-50 rounded-full px-2 py-0.5">{g.tone}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
