import Hero from "@/components/Hero";
import ConsumerValue from "@/components/ConsumerValue";
import BusinessValue from "@/components/BusinessValue";
import HowItWorks from "@/components/HowItWorks";
import AIApproach from "@/components/AIApproach";
import WasteReduction from "@/components/WasteReduction";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CinematicBackground from "@/components/CinematicBackground";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen">
      <CinematicBackground />
      <main className="shelf-marketing-page relative z-10">
        <Hero />
        <ConsumerValue />
        <BusinessValue />
        <HowItWorks />
        <AIApproach />
        <WasteReduction />
        <Pricing />
        <FinalCTA />
        <Footer />
        <BackToTop />
      </main>
    </div>
  );
}
