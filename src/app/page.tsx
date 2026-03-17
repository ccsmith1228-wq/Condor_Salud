import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LandingContent from "@/components/LandingContent";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LandingContent />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
