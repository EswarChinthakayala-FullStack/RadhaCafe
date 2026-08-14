import { ScrollProgress } from '../../components/shared/ScrollProgress';
import { ScrollToTopButton } from '../../components/shared/ScrollToTopButton';
import { Navbar } from '../../components/landing/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { MarqueeBanner } from '../../components/landing/MarqueeBanner';
import { IntroStatement } from '../../components/landing/IntroStatement';
import { AboutSection } from '../../components/landing/AboutSection';
import { CinematicImageBreak } from '../../components/landing/CinematicImageBreak';
import { MenuHighlights } from '../../components/landing/MenuHighlights';
import { SpecialtySection } from '../../components/landing/SpecialtySection';
import { GallerySection } from '../../components/landing/GallerySection';
import { DiscussionSection } from '../../components/landing/DiscussionSection';
import { RadhaWaterSection } from '../../components/landing/RadhaWaterSection';
import { ContactSection } from '../../components/landing/ContactSection';
import { FinalCtaSection } from '../../components/landing/FinalCtaSection';
import { Footer } from '../../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      {/* Top Cinnamon Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Sticky Header Frosted Glass Navigation */}
      <Navbar />

      {/* Main Scrollytelling Public Experience */}
      <main className="flex-1">
        {/* 1. Cinematic 100svh Hero with Live Synced Typography */}
        <HeroSection />

        {/* 2. Ambient Craft Marquee Banner */}
        <MarqueeBanner />

        {/* 3. Brand Philosophy & Craft Pillars */}
        <IntroStatement />

        {/* 4. Narrative Storytelling About Section */}
        <AboutSection />

        {/* 5. Full-Bleed Atmospheric Image Interlude */}
        <CinematicImageBreak />

        {/* 6. Algorithmic Curated Menu Discovery */}
        <MenuHighlights />

        {/* 7. Artisanal Standards & Specialty Vignettes */}
        <SpecialtySection />

        {/* 8. Editorial Asymmetric Gallery Scrollytelling */}
        <GallerySection />

        {/* 9. Guest Testimonials & Reviews */}
        <DiscussionSection />

        {/* 10. RadhaWater Clean Hydration Service Story */}
        <RadhaWaterSection />

        {/* 11. Hospitality Contact & Destination Section */}
        <ContactSection />

        {/* 12. Final High-Impact Brand Statement */}
        <FinalCtaSection />
      </main>

      {/* 13. Deep Dark Roast Footer */}
      <Footer />

      {/* Floating Bottom-Right Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
