import { useReveal, useCountUp } from "../../hooks/useReveal";

const STATS = [
    { value: 2, suffix: "M+", label: "Posts scheduled" },
    { value: 18, suffix: "k", label: "Hours saved monthly" },
    { value: 4, suffix: "", label: "Platforms in one place" },
    { value: 99, suffix: "%", label: "Publish reliability" },
];

function Stat({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
    const n = useCountUp(value, active);
    return (
        <div className="text-center">
            <div className="font-serif text-4xl sm:text-5xl font-semibold text-slate-900 tabular-nums">
                {n}
                <span className="text-gradient">{suffix}</span>
            </div>
            <div className="text-sm text-slate-400 mt-1.5">{label}</div>
        </div>
    );
}

export default function StatsBand() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <section className="py-16 bg-white">
            <div ref={ref} className={`reveal ${visible ? "reveal-in" : ""} max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-10`}>
                {STATS.map((s) => (
                    <Stat key={s.label} {...s} active={visible} />
                ))}
            </div>
        </section>
    );
}
