import { StarIcon } from "lucide-react";

const testimonials = [
    { name: "Sarah K.", role: "Marketing Manager", avatar: "S", avatarBg: "from-red-400 to-pink-400", text: "Socialengine has saved our team 10+ hours a week. The AI composer is genuinely impressive — it writes content that sounds like us." },
    { name: "Marcus L.", role: "Indie Creator", avatar: "M", avatarBg: "from-violet-400 to-purple-500", text: "I used to dread posting. Now I queue up a whole week of content in 20 minutes. The smart scheduling alone is worth it." },
    { name: "Priya D.", role: "Startup Founder", avatar: "P", avatarBg: "from-sky-400 to-blue-500", text: "Finally a scheduler that's beautiful AND powerful. The clean dashboard makes it easy to see exactly what's going out and when." },
    { name: "Diego R.", role: "Agency Lead", avatar: "D", avatarBg: "from-amber-400 to-orange-500", text: "Managing five brands used to be chaos. Now it's one calendar, one workflow. The auto-reply rules are a game changer." },
    { name: "Aisha N.", role: "Community Manager", avatar: "A", avatarBg: "from-emerald-400 to-teal-500", text: "The voiceover and image generation let us ship reels daily. Engagement is up and we barely lifted a finger." },
];

function Card({ t }: { t: (typeof testimonials)[number] }) {
    return (
        <div className="w-85 shrink-0 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className={`size-9 rounded-full bg-linear-to-br ${t.avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{t.avatar}</div>
                <div>
                    <div className="text-sm font-medium text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                </div>
            </div>
        </div>
    );
}

export default function Testimonials() {
    const row = [...testimonials, ...testimonials];
    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-14">
                <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                    <StarIcon className="size-3" /> Testimonials
                </div>
                <h2 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-gray-900">
                    Loved by <span className="text-gradient italic">creators &amp; teams</span>
                </h2>
                <p className="mt-5 text-gray-500 max-w-md mx-auto">Join thousands of people who automate their social media with Socialengine.</p>
            </div>

            <div className="group relative [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex gap-5 w-max animate-marquee group-hover:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "44s" }}>
                    {row.map((t, i) => <Card key={`${t.name}-${i}`} t={t} />)}
                </div>
            </div>
        </section>
    );
}
