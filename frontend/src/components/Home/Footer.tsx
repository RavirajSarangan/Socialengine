import { Link } from "react-router-dom";
import { SiX, SiInstagram, SiFacebook } from "@icons-pack/react-simple-icons";

const footerLinks = {
    Product: ["Features", "How it works", "Pricing", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

const socials = [SiX, SiInstagram, SiFacebook];

export default function Footer() {
    return (
        <footer className="relative bg-slate-50 border-t border-slate-200/70">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-300/60 to-transparent" />
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">
                    <div className="col-span-2 lg:col-span-3">
                        <Link to="/" onClick={() => scrollTo(0, 0)} className="inline-flex items-center gap-2 mb-5">
                            <img src="/logo.svg" alt="logo" className="size-6" />
                            <span className="font-medium font-serif text-xl text-gray-800">Socialengine</span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">The AI-powered social media platform that helps creators and teams grow faster with less effort.</p>
                        <div className="flex items-center gap-2 mt-5">
                            {socials.map((Icon, i) => (
                                <a key={i} href="#" className="size-9 rounded-full border border-slate-200 grid place-items-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors">
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <div className="text-xs font-semibold uppercase tracking-widest mb-5 text-gray-600">{category}</div>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200/70">
                    <p className="text-xs text-gray-400">© {new Date().getFullYear()} Socialengine. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-gray-400 hover:text-gray-700">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-400 hover:text-gray-700">Terms of Service</a>
                        <Link to="/login" className="text-xs text-gray-400 hover:text-gray-700">Sign In</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
