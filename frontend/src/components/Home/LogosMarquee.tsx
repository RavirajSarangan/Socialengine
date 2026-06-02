const LOGOS = ["Northwind", "Lumen", "Foundry", "Apex Labs", "Brightside", "Cobalt", "Meridian", "Vertex"];

export default function LogosMarquee() {
    const row = [...LOGOS, ...LOGOS];
    return (
        <section className="py-12 border-y border-slate-100 bg-white">
            <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-400 mb-7">
                Trusted by fast-growing teams worldwide
            </p>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
                <div className="flex w-max animate-marquee gap-14" style={{ ["--marquee-duration" as string]: "34s" }}>
                    {row.map((name, i) => (
                        <span key={`${name}-${i}`} className="text-xl font-serif font-medium text-slate-400/80 whitespace-nowrap hover:text-slate-700 transition-colors">
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
