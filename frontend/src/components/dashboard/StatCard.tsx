import type { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string | number;
    icon: LucideIcon;
    accent?: string;
    hint?: string;
}

export default function StatCard({ label, value, icon: Icon, accent = "text-red-500 bg-red-50", hint }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between">
            <div>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums">{value}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
                {hint && <div className="text-xs text-emerald-500 mt-1.5">{hint}</div>}
            </div>
            <span className={`size-10 rounded-full grid place-items-center ${accent}`}>
                <Icon className="size-5" />
            </span>
        </div>
    );
}
