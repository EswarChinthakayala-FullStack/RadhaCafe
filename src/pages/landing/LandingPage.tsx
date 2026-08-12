import { Navbar } from '../../components/landing/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { MarqueeBanner } from '../../components/landing/MarqueeBanner';
import { MenuHighlights } from '../../components/landing/MenuHighlights';
import { AboutSection } from '../../components/landing/AboutSection';
import { SpecialtySection } from '../../components/landing/SpecialtySection';
import { GallerySection } from '../../components/landing/GallerySection';
import { DiscussionSection } from '../../components/landing/DiscussionSection';
import { ContactSection } from '../../components/landing/ContactSection';
import { Footer } from '../../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MarqueeBanner />
        <MenuHighlights />
        <AboutSection />
        <SpecialtySection />
        <GallerySection />
        <DiscussionSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
