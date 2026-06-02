import type { ReactNode } from "react";

interface Props {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div className="flex items-end justify-between gap-4 mb-6">
            <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}
