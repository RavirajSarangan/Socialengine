import { Link } from "react-router-dom";
import { ArrowRightIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
import { SiX, SiInstagram, SiFacebook } from "@icons-pack/react-simple-icons";

const stats = [
    { val: "12", label: "Scheduled" },
    { val: "48", label: "Published" },
    { val: "4", label: "Accounts" },
    { val: "3", label: "AI Rules" },
];

const activity = [
    { text: "Post published to LinkedIn & Twitter", time: "2m ago" },
    { text: "AI replied to 3 comments", time: "15m ago" },
    { text: "New post scheduled for tomorrow 9am", time: "1h ago" },
];

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-aurora">
            <div className="absolute inset-0 bg-grid pointer-events-none" />
            <div className="absolute inset-0 bg-grain opacity-[0.15] mix-blend-multiply pointer-events-none" />

            <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-red-100 text-red-500 text-sm px-3.5 py-1.5 rounded-full mb-8 shadow-sm animate-fade-up" style={{ animationDelay: "0ms" }}>
                    <span className="size-1.5 bg-red-400 rounded-full animate-pulse-glow" />
                    AI-Powered Social Media Automation
                </div>

                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem] leading-[0.95] text-slate-900 animate-fade-up" style={{ animationDelay: "90ms" }}>
                    Schedule smarter.
                    <br />
                    <span className="text-gradient italic">Grow faster.</span>
                </h1>

                <p className="mt-7 text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed animate-fade-up" style={{ animationDelay: "180ms" }}>
                    Socialengine lets you create, schedule, and auto-engage across all your social platforms — powered by AI that writes your captions and replies for you.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "270ms" }}>
                    <Link to="/login" className="group bg-linear-to-r from-red-600 to-red-500 text-white rounded-full font-medium hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)] inline-flex items-center gap-2 text-[15px] px-8 py-3.5 w-full sm:w-auto justify-center transition-all">
                        Start for free <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a href="#how-it-works" className="bg-white/70 backdrop-blur text-[#333] border-[1.5px] border-black/10 rounded-full font-medium hover:bg-white hover:border-black/20 inline-flex items-center gap-2 text-[15px] px-8 py-3.5 w-full sm:w-auto justify-center transition-all">
                        See how it works
                    </a>
                </div>

                <p className="mt-5 text-xs text-gray-400 inline-flex items-center gap-1.5 animate-fade-up" style={{ animationDelay: "330ms" }}>
                    <CheckCircle2Icon className="size-3.5 text-emerald-500" /> No credit card required · Free forever plan available
                </p>
            </div>

            {/* Floating product mockup */}
            <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-0 animate-fade-up" style={{ animationDelay: "420ms" }}>
                <div className="relative animate-float">
                    <div className="absolute -inset-x-10 -top-6 bottom-0 bg-linear-to-t from-red-500/10 to-transparent blur-2xl pointer-events-none" />
                    <div className="relative rounded-t-2xl overflow-hidden border border-gray-200/80 border-b-0 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#f0f0f0] border-b border-black/[0.06]">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <div className="flex-1 mx-4 rounded-md h-5 max-w-xs bg-white/80" />
                        </div>
                        <div className="p-6 bg-[#f7f7f7]">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                {stats.map((s) => (
                                    <div key={s.label} className="rounded-xl p-4 bg-white border border-black/[0.06]">
                                        <div className="text-2xl font-bold text-gray-900 tabular-nums">{s.val}</div>
                                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-xl p-4 space-y-3 bg-white border border-black/[0.06]">
                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</div>
                                {activity.map((item) => (
                                    <div key={item.text} className="flex items-center gap-3">
                                        <span className="size-5 rounded-full bg-emerald-50 text-emerald-500 grid place-items-center"><CheckCircle2Icon className="size-3" /></span>
                                        <span className="text-sm text-gray-600 flex-1">{item.text}</span>
                                        <span className="text-xs text-gray-300 shrink-0">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex absolute -left-6 top-24 items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-3 animate-float" style={{ animationDelay: "1s" }}>
                        <span className="size-8 rounded-full bg-red-50 text-red-500 grid place-items-center"><SparklesIcon className="size-4" /></span>
                        <div className="text-left">
                            <div className="text-xs font-medium text-slate-700">AI caption ready</div>
                            <div className="text-[10px] text-slate-400">in 1.2s</div>
                        </div>
                    </div>

                    <div className="hidden sm:flex absolute -right-4 top-40 items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-3 animate-float" style={{ animationDelay: "0.5s" }}>
                        <SiX className="size-4 text-slate-900" />
                        <SiInstagram className="size-4 text-rose-500" />
                        <SiFacebook className="size-4 text-[#1877f2]" />
                        <span className="text-xs font-medium text-slate-700">Posted everywhere</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
