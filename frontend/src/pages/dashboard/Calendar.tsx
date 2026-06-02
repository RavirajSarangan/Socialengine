import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import PlatformBadge from "../../components/dashboard/PlatformBadge";
import { posts, truncate } from "../../lib/dashboard";
import type { Post } from "../../lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
    // Seed on the month with the most mock data (May 2026).
    const [cursor, setCursor] = useState(new Date(2026, 4, 1));

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const byDay = new Map<number, Post[]>();
    for (const p of posts) {
        const d = new Date(p.scheduledFor);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            byDay.set(day, [...(byDay.get(day) ?? []), p]);
        }
    }

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

    return (
        <>
            <PageHeader
                title="Calendar"
                subtitle="Your publishing schedule at a glance"
                action={
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="size-9 grid place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
                            <ChevronLeftIcon className="size-4" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 w-36 text-center">{monthLabel}</span>
                        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="size-9 grid place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
                            <ChevronRightIcon className="size-4" />
                        </button>
                    </div>
                }
            />

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="px-3 py-2.5 text-xs font-medium text-slate-400 text-center">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const dayPosts = day ? byDay.get(day) ?? [] : [];
                        return (
                            <div key={i} className="min-h-28 border-b border-r border-slate-100 p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0">
                                {day && (
                                    <>
                                        <div className={`text-xs mb-1.5 inline-grid place-items-center size-6 rounded-full ${isToday ? "bg-red-500 text-white" : "text-slate-400"}`}>{day}</div>
                                        <div className="space-y-1">
                                            {dayPosts.slice(0, 3).map((p) => (
                                                <div key={p._id} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[11px] ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`} title={p.content}>
                                                    {p.platforms[0] && <PlatformBadge platform={p.platforms[0]} size="sm" />}
                                                    <span className="truncate">{truncate(p.content, 22)}</span>
                                                </div>
                                            ))}
                                            {dayPosts.length > 3 && <div className="text-[11px] text-slate-400 px-1.5">+{dayPosts.length - 3} more</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
