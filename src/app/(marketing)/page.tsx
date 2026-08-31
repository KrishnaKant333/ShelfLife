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

export default function Home() {
  return (
    <main className="shelf-background">
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
  );
}