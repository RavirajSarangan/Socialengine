import { getPlatform } from "../../lib/dashboard";

interface Props {
    platform: string;
    size?: "sm" | "md";
    withLabel?: boolean;
}

const COLORS: Record<string, string> = {
    twitter: "bg-slate-900 text-white",
    linkedin: "bg-[#0a66c2] text-white",
    facebook: "bg-[#1877f2] text-white",
    instagram: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white",
};

export default function PlatformBadge({ platform, size = "md", withLabel = false }: Props) {
    const config = getPlatform(platform);
    const Icon = config?.icon;
    const box = size === "sm" ? "size-6" : "size-8";
    const icon = size === "sm" ? "size-3" : "size-4";

    return (
        <span className="inline-flex items-center gap-2">
            <span className={`${box} ${COLORS[platform] ?? "bg-slate-200 text-slate-600"} rounded-full grid place-items-center shrink-0`} title={config?.name ?? platform}>
                {Icon ? <Icon className={icon} /> : null}
            </span>
            {withLabel && <span className="text-sm text-slate-600">{config?.name ?? platform}</span>}
        </span>
    );
}
