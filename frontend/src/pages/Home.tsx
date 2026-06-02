import Navbar from "../components/Home/Navbar";
import Hero from "../components/Home/Hero";
import LogosMarquee from "../components/Home/LogosMarquee";
import Features from "../components/Home/Features";
import StatsBand from "../components/Home/StatsBand";
import HowItWorks from "../components/Home/HowItWorks";
import Testimonials from "../components/Home/Testimonials";
import Pricing from "../components/Home/Pricing";
import FAQ from "../components/Home/FAQ";
import CTA from "../components/Home/CTA";
import Footer from "../components/Home/Footer";

export default function Landing() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Navbar />
            <Hero />
            <LogosMarquee />
            <Features />
            <StatsBand />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </div>
    );
}
