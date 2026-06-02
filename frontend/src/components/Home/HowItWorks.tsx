import { CheckCircleIcon, LinkIcon, Wand2Icon, SendIcon } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

const steps = [
    { step: "01", icon: LinkIcon, title: "Connect Your Accounts", description: "Link your social profiles in seconds. We support Twitter, LinkedIn, Facebook, and Instagram." },
    { step: "02", icon: Wand2Icon, title: "Create or Generate Content", description: "Write your own post or let our AI craft a caption and image based on your prompt." },
    { step: "03", icon: SendIcon, title: "Schedule & Publish", description: "Pick a time, select your platforms, and hit schedule. We handle publishing automatically." },
];

export default function HowItWorks() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <CheckCircleIcon className="size-3" /> Simple setup
                    </div>
                    <h2 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-gray-900">
                        Up and running in <span className="text-gradient italic">minutes</span>
                    </h2>
                    <p className="mt-5 text-gray-500 max-w-lg mx-auto leading-relaxed">No complicated onboarding, no steep learning curve. Just connect, create, and grow.</p>
                </div>

                <div ref={ref} className="relative pl-2">
                    {/* progress rail */}
                    <div className="absolute left-[2.35rem] top-6 bottom-6 w-px bg-slate-100">
                        <div className={`w-px bg-linear-to-b from-red-500 to-red-300 transition-[height] duration-1000 ease-out ${visible ? "h-full" : "h-0"}`} />
                    </div>

                    <div className="space-y-8">
                        {steps.map((s, i) => (
                            <div key={s.step} className={`reveal ${visible ? "reveal-in" : ""} relative flex gap-6 items-start`} style={{ transitionDelay: `${i * 160}ms` }}>
                                <div className="shrink-0 size-14 rounded-2xl bg-white border border-red-100 shadow-sm shadow-red-500/10 grid place-items-center relative z-10">
                                    <s.icon className="size-5 text-red-500" />
                                    <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full size-5 grid place-items-center">{s.step}</span>
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">{s.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
