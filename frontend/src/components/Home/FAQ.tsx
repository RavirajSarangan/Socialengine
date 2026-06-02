import { useState } from "react";
import { PlusIcon, HelpCircleIcon } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

const faqs = [
    { q: "Which platforms does Socialengine support?", a: "Twitter / X, LinkedIn, Facebook, and Instagram — all managed from one unified workspace, with per-platform format and size validation built in." },
    { q: "Do I need a credit card to start?", a: "No. The Starter plan is free forever. You only add billing when you choose to upgrade to Pro or Agency." },
    { q: "How does the AI content generation work?", a: "Describe what you want and our AI writes on-brand captions with hashtags, generates images, and can even produce voiceovers — all from inside the composer." },
    { q: "Can I schedule posts to multiple platforms at once?", a: "Yes. Write once, pick your platforms, choose a time, and Socialengine publishes everywhere automatically with full timezone support." },
    { q: "Is my data and account information secure?", a: "Connections are stored securely against your account and never expose your platform passwords. You stay in control and can disconnect anytime." },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
    return (
        <div className={`rounded-2xl border transition-colors ${open ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"}`}>
            <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
                <span className="text-sm font-medium text-slate-800">{q}</span>
                <PlusIcon className={`size-4 shrink-0 text-red-500 transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
            </div>
        </div>
    );
}

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(0);
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <HelpCircleIcon className="size-3" /> FAQ
                    </div>
                    <h2 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-gray-900">
                        Questions? <span className="text-gradient italic">Answered.</span>
                    </h2>
                </div>

                <div ref={ref} className={`reveal ${visible ? "reveal-in" : ""} space-y-3`}>
                    {faqs.map((f, i) => (
                        <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
                    ))}
                </div>
            </div>
        </section>
    );
}
