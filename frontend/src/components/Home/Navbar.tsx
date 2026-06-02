import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/75 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.04)]" : "bg-transparent border-b border-transparent"}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link to="/" onClick={() => scrollTo(0, 0)} className="flex items-center gap-2 group">
                    <span className="relative grid place-items-center">
                        <span className="absolute inset-0 rounded-full bg-red-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="/logo.svg" alt="logo" className="size-7 relative transition-transform group-hover:rotate-6" />
                    </span>
                    <span className="text-xl lg:text-2xl font-medium font-serif text-slate-800">Socialengine</span>
                </Link>

                <div className="hidden md:flex items-center gap-1 text-sm">
                    {LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="relative px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-px after:bg-red-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
                            {l.label}
                        </a>
                    ))}
                </div>

                {user ? (
                    <Link to="/dashboard" className="group flex items-center gap-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white pl-2 pr-4 py-1.5 rounded-full transition-all">
                        <span className="size-7 rounded-full bg-linear-to-br from-red-500 to-red-600 grid place-items-center text-xs">{(user.name ?? "U").slice(0, 2).toUpperCase()}</span>
                        Dashboard <ArrowRightIcon className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 hidden sm:block">Sign In</Link>
                        <Link to="/login" className="group flex items-center gap-1.5 text-sm font-medium bg-linear-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full shadow-sm hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition-all">
                            Get Started <ArrowRightIcon className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
