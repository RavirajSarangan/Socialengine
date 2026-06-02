import { CalendarDaysIcon, Wand2Icon, Share2Icon, ZapIcon, BarChart3Icon, HashIcon } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

const features = [
    { icon: Wand2Icon, title: "AI Content Generator", description: "Generate on-brand captions and stunning images with built-in AI. Never stare at a blank page again.", large: true },
    { icon: CalendarDaysIcon, title: "Smart Scheduling", description: "Queue posts across every platform in one click. Set it once and let us handle the rest." },
    { icon: Share2Icon, title: "Multi-Platform", description: "Twitter, LinkedIn, Facebook & Instagram — post everywhere from one workspace." },
    { icon: BarChart3Icon, title: "Activity Dashboard", description: "A bird's-eye view of published, scheduled and engagement activity in real time." },
    { icon: ZapIcon, title: "Instant Publishing", description: "Go live now or schedule for peak times with full timezone support." },
    { icon: HashIcon, title: "Hashtag Suggestions", description: "AI-powered hashtag ideas to reach a wider, more relevant audience." },
];

export default function Features() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <section id="features" className="py-24 bg-slate-50 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <ZapIcon className="size-3" /> Everything you need
                    </div>
                    <h2 className="font-serif text-4xl sm:text-5xl font-medium leading-tight text-gray-900">
                        Automate your entire
                        <br />
                        <span className="text-gradient italic">social media workflow</span>
                    </h2>
                    <p className="mt-5 text-gray-500 max-w-xl mx-auto leading-relaxed">From content creation to scheduling — Socialengine handles it all so you can focus on what matters most.</p>
                </div>

                <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className={`reveal ${visible ? "reveal-in" : ""} group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 hover:border-red-200 hover:shadow-[0_18px_40px_-18px_rgba(239,68,68,0.25)] transition-all duration-300 ${f.large ? "sm:col-span-2 lg:row-span-2 lg:flex lg:flex-col lg:justify-between" : ""}`}
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            {f.large && <div className="absolute -right-10 -top-10 size-40 rounded-full bg-linear-to-br from-red-500/10 to-amber-500/10 blur-2xl" />}
                            <div>
                                <div className={`rounded-xl flex items-center justify-center mb-4 bg-linear-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 ${f.large ? "size-14" : "size-10"}`}>
                                    <f.icon className={f.large ? "size-7" : "size-5"} />
                                </div>
                                <h3 className={`text-slate-900 mb-2 font-medium ${f.large ? "text-2xl font-serif" : ""}`}>{f.title}</h3>
                                <p className={`text-slate-500/90 leading-relaxed ${f.large ? "text-base max-w-md" : "text-sm"}`}>{f.description}</p>
                            </div>
                            {f.large && (
                                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><Wand2Icon className="size-3.5 text-red-500" /> AI draft</div>
                                    <div className="space-y-1.5">
                                        <div className="h-2 rounded-full bg-slate-200 w-full" />
                                        <div className="h-2 rounded-full bg-slate-200 w-5/6" />
                                        <div className="h-2 rounded-full bg-red-200 w-1/2" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
