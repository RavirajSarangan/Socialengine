import { Link } from "react-router-dom";
import { UserIcon, SparklesIcon, CreditCardIcon, KeyIcon, ArrowRightIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
    const { user } = useAuth();
    const currentUser = {
        name: user?.name ?? "",
        email: user?.email ?? "",
        plan: user?.plan ?? "Starter",
        aiCredits: user?.aiCredits ?? 0,
        aiCreditsTotal: user?.aiCreditsTotal ?? 200,
    };
    const pct = Math.round((currentUser.aiCredits / currentUser.aiCreditsTotal) * 100);

    return (
        <>
            <PageHeader title="Settings" subtitle="Manage your profile, plan and integrations" />

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <UserIcon className="size-4 text-slate-400" />
                        <h2 className="text-sm font-medium text-slate-700">Profile</h2>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="block mb-1.5 text-slate-500">Name</label>
                            <input defaultValue={currentUser.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-red-300" />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-slate-500">Email</label>
                            <input defaultValue={currentUser.email} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-red-300" />
                        </div>
                        <button className="bg-linear-to-r from-red-600 to-red-500 text-white rounded-full px-5 py-2.5 hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">Save changes</button>
                    </div>
                </section>

                {/* Plan & credits */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCardIcon className="size-4 text-slate-400" />
                        <h2 className="text-sm font-medium text-slate-700">Plan & billing</h2>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-lg text-slate-800">{currentUser.plan} plan</div>
                            <div className="text-xs text-slate-400">$29/month · renews monthly</div>
                        </div>
                        <Link to="/#pricing" className="text-xs inline-flex items-center gap-1 text-red-500 border border-red-100 bg-red-50 rounded-full px-3.5 py-1.5">Upgrade <ArrowRightIcon className="size-3" /></Link>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5 text-sm text-slate-600">
                        <SparklesIcon className="size-4 text-red-500" /> AI credits
                        <span className="ml-auto text-xs text-slate-400">{currentUser.aiCredits} / {currentUser.aiCreditsTotal}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                    </div>
                </section>

                {/* API keys */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                        <KeyIcon className="size-4 text-slate-400" />
                        <h2 className="text-sm font-medium text-slate-700">Integrations & API keys</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Connect the services that power AI generation and publishing. Keys are stored server-side (configured in Phase 4–5).</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {[
                            { name: "OpenAI", env: "OPENAI_API_KEY", desc: "Captions & images" },
                            { name: "ElevenLabs", env: "ELEVENLABS_API_KEY", desc: "Voiceovers" },
                            { name: "Ayrshare", env: "AYRSHARE_API_KEY", desc: "Social publishing" },
                        ].map((s) => (
                            <div key={s.name} className="border border-slate-200 rounded-xl p-4">
                                <div className="text-sm text-slate-700">{s.name}</div>
                                <div className="text-xs text-slate-400 mb-2">{s.desc}</div>
                                <code className="text-[11px] text-slate-400 bg-slate-50 rounded px-2 py-1 block truncate">{s.env}</code>
                                <span className="inline-block mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Not connected</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
