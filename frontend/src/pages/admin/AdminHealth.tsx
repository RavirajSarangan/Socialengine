import { ShieldCheckIcon, AlertCircleIcon, ServerIcon, CpuIcon, CheckCircleIcon } from "lucide-react";
import { useQuery } from "convex/react";
import PageHeader from "../../components/dashboard/PageHeader";
import { api } from "../../../convex/_generated/api";

export default function AdminHealth() {
    const health = useQuery(api.system.health);
    const loading = health === undefined;
    const isDbUp = health?.database === "connected";
    const integrations = health?.integrations ?? { openai: false, elevenlabs: false, ayrshare: false };

    return (
        <>
            <PageHeader
                title="System Health & Telemetry"
                subtitle="Live status monitoring of the Convex backend, database and service integrations"
            />

            <div className="grid md:grid-cols-2 gap-6">
                {/* Server & DB Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <ServerIcon className="size-4.5 text-slate-500" /> Server Status
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400">Backend Service</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                                <CpuIcon className="size-4 text-violet-500" />
                                {health?.service || "socialengine-backend"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400">API Telemetry Link</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                                {import.meta.env.VITE_API_URL || "/api"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400">MongoDB Database Connection</span>
                            {loading ? (
                                <span className="text-xs text-slate-400">Pinging...</span>
                            ) : isDbUp ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <CheckCircleIcon className="size-4" /> Connected (Atlas/Local)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold animate-pulse">
                                    <AlertCircleIcon className="size-4" /> Connection Failure
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between pb-1">
                            <span className="text-xs text-slate-400">Telemetry Server Time</span>
                            <span className="text-xs text-slate-600 tabular-nums font-mono">
                                {health?.time ? new Date(health.time).toLocaleString() : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* API Integrations Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <ShieldCheckIcon className="size-4.5 text-slate-500" /> Cloud Integrations
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                name: "OpenAI AI Studio",
                                key: "openai",
                                enabled: integrations.openai,
                                desc: "Powers caption rewriting and image generation.",
                                env: "OPENAI_API_KEY",
                            },
                            {
                                name: "ElevenLabs Voiceovers",
                                key: "elevenlabs",
                                enabled: integrations.elevenlabs,
                                desc: "Powers text-to-speech voice generation.",
                                env: "ELEVENLABS_API_KEY",
                            },
                            {
                                name: "Ayrshare Publisher",
                                key: "ayrshare",
                                enabled: integrations.ayrshare,
                                desc: "Powers social network OAuth linking and multi-platform publishing.",
                                env: "AYRSHARE_API_KEY",
                            },
                        ].map((integration) => (
                            <div
                                key={integration.key}
                                className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                            >
                                <div className="min-w-0 pr-4">
                                    <div className="text-sm font-medium text-slate-700">{integration.name}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{integration.desc}</div>
                                    <code className="inline-block text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 mt-1.5">
                                        {integration.env}
                                    </code>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                    {loading ? (
                                        <span className="text-xs text-slate-400">Loading...</span>
                                    ) : integration.enabled ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
