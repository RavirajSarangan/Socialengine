import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

export default function CTA() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div ref={ref} className={`reveal ${visible ? "reveal-in" : ""} shine relative rounded-3xl overflow-hidden p-14 sm:p-20 text-center bg-aurora border border-red-500/15`}>
                    <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
                    <div className="relative">
                        <div className="mb-6 inline-flex items-center gap-1.5 bg-white/70 backdrop-blur border border-red-100 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">Ready to grow?</div>
                        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] font-medium text-gray-900">
                            Automate your social
                            <br />
                            <span className="text-gradient italic">media today</span>
                        </h2>
                        <p className="mt-6 text-gray-500 max-w-lg mx-auto text-lg">Join thousands of creators and marketers who trust Socialengine to grow their audience on autopilot.</p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link to="/login" className="group bg-linear-to-r from-red-600 to-red-500 text-white rounded-full font-semibold hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)] inline-flex items-center gap-2 text-[15px] px-10 py-4 w-full sm:w-auto justify-center transition-all">
                                Get Started Free <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <a href="#pricing" className="bg-white/70 backdrop-blur text-[#333] border-[1.5px] border-black/10 rounded-full font-medium hover:bg-white hover:border-black/20 inline-flex items-center gap-2 text-[15px] px-10 py-4 w-full sm:w-auto justify-center transition-all">
                                View Pricing
                            </a>
                        </div>
                        <p className="mt-6 text-xs text-gray-400">No credit card required · Cancel anytime</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
