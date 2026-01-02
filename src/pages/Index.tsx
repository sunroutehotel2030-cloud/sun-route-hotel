import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Accommodations from "@/components/Accommodations";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  useAnalytics();

  return (
    <main id="top" className="min-h-screen">
      <Header />
      <Hero />
      <Accommodations />
      <Testimonials />
      <Footer />
    </main>
  );
};

export default Index;
