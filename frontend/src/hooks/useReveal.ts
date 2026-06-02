import { useEffect, useRef, useState } from "react";

/**
 * One-shot scroll reveal. Add the `reveal` class to an element, attach this ref,
 * and `reveal-in` is added when it scrolls into view (see index.css).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
    const ref = useRef<T | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || visible) return;
        const observer = new IntersectionObserver(
            ([entry], obs) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -10% 0px", ...options }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [visible, options]);

    return { ref, visible };
}

/** Counts from 0 to `target` once `active` becomes true. */
export function useCountUp(target: number, active: boolean, durationMs = 1400) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) return;
        const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const total = reduce ? 0 : durationMs;
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const p = total === 0 ? 1 : Math.min((now - start) / total, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setValue(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, active, durationMs]);

    return value;
}
