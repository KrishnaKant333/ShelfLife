import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductPreview from "@/components/ProductPreview";
import Audience from "@/components/Audience";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <main className="shelf-background">
      <Hero />
      <Features />
      <ProductPreview />
      <Audience />
      <Pricing />
      <Footer />
      <BackToTop />
    </main>
  );
}