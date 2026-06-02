import { useState } from "react";
import { CheckIcon, CircleCheckBigIcon } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
    { id: "starter", name: "Starter", monthly: 0, description: "Perfect for creators just getting started with social media automation.", features: ["2 social accounts", "10 scheduled posts/month", "AI content (5 credits/mo)", "Basic dashboard"], cta: "Get Started Free", highlight: false },
    { id: "pro", name: "Pro", monthly: 29, description: "Everything you need to grow and automate your social presence.", features: ["Unlimited accounts", "Unlimited scheduling", "AI content (200 credits/mo)", "Priority support"], cta: "Start 14-day Free Trial", highlight: true },
    { id: "agency", name: "Agency", monthly: 79, description: "For teams and agencies managing multiple brands at scale.", features: ["Everything in Pro", "5 team members", "Unlimited AI credits", "Custom AI personas", "Dedicated support"], cta: "Contact Sales", highlight: false },
];

export default function Pricing() {
    const [annual, setAnnual] = useState(false);
    const priceFor = (m: number) => (m === 0 ? "Free" : annual ? `$${Math.round(m * 10)}` : `$${m}`);
    const periodFor = (m: number) => (m === 0 ? "" : annual ? "/year" : "/month");

    return (
        <section id="pricing" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <CircleCheckBigIcon className="size-3" /> Simple pricing
                    </div>
                    <h2 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-gray-900">
                        Plans for every stage
                        <br />
                        <span className="text-gradient italic">of growth</span>
                    </h2>
                    <p className="mt-5 text-gray-500 max-w-md mx-auto">Start free, upgrade when you're ready. Cancel anytime — no hidden fees.</p>

                    {/* Monthly / Annual toggle */}
                    <div className="mt-8 inline-flex items-center gap-1 bg-slate-100 rounded-full p-1 text-sm">
                        <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 rounded-full transition-all ${!annual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Monthly</button>
                        <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 rounded-full transition-all ${annual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                            Annual <span className="text-red-500 text-xs font-medium">−2 months</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`rounded-2xl border p-7 flex flex-col gap-6 relative transition-transform hover:-translate-y-1 ${plan.highlight ? "bg-linear-to-b from-red-500 to-red-600 text-white border-red-400 shadow-2xl shadow-red-200 md:scale-[1.03]" : "bg-white text-slate-900 border-slate-200"}`}>
                            {plan.highlight && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full">Most Popular</div>}
                            <div>
                                <div className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-red-100" : "text-red-500"}`}>{plan.name}</div>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-bold tabular-nums">{priceFor(plan.monthly)}</span>
                                    <span className={`text-sm mb-1.5 ${plan.highlight ? "text-red-200" : "text-slate-400"}`}>{periodFor(plan.monthly)}</span>
                                </div>
                                <p className={`text-sm mt-2 leading-relaxed ${plan.highlight ? "text-red-100" : "text-slate-500"}`}>{plan.description}</p>
                            </div>

                            <ul className="space-y-2.5">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-sm">
                                        <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-red-400" : "bg-red-50"}`}>
                                            <CheckIcon className={`w-2.5 h-2.5 ${plan.highlight ? "text-white" : "text-red-500"}`} />
                                        </div>
                                        <span className={plan.highlight ? "text-red-50" : "text-slate-600"}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/login" className={`mt-auto text-center font-semibold text-sm px-6 py-3 rounded-full transition-all ${plan.highlight ? "bg-white text-red-500 hover:bg-red-50" : "bg-red-500 text-white hover:bg-red-600"}`}>
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
