import { ScrollProgress } from '../../components/shared/ScrollProgress';
import { ScrollToTopButton } from '../../components/shared/ScrollToTopButton';
import { WaterNavbar } from '../../components/water/public/WaterNavbar';
import { WaterHero } from '../../components/water/public/WaterHero';
import { WaterTrustStatement } from '../../components/water/public/WaterTrustStatement';
import { WaterProductsSection } from '../../components/water/public/WaterProductsSection';
import { WaterBenefitsSection } from '../../components/water/public/WaterBenefitsSection';
import { WaterCinematicBreak } from '../../components/water/public/WaterCinematicBreak';
import { WaterHowItWorks } from '../../components/water/public/WaterHowItWorks';
import { WaterEventStory } from '../../components/water/public/WaterEventStory';
import { WaterEventForm } from '../../components/water/public/WaterEventForm';
import { WaterContactSection } from '../../components/water/public/WaterContactSection';
import { WaterCafeLink } from '../../components/water/public/WaterCafeLink';
import { WaterFooter } from '../../components/water/public/WaterFooter';

export function PublicWaterPage() {
  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col font-sans selection:bg-[#B85C1E]/30 selection:text-white">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Floating Scroll To Top Action */}
      <ScrollToTopButton />

      {/* Dedicated RadhaWater Header */}
      <WaterNavbar />

      {/* Main Scrollytelling Story */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* 1. Cinematic Hero with Live Time & Pricing Preview */}
        <WaterHero />

        {/* 2. Brand Trust Statement & 3 Craft Pillars */}
        <WaterTrustStatement />

        {/* 3. Live Database Water Products (₹5 & ₹30) */}
        <WaterProductsSection />

        {/* 4. Why RadhaWater Service Benefits */}
        <WaterBenefitsSection />

        {/* 5. Full-Bleed Atmospheric Visual Interlude */}
        <WaterCinematicBreak />

        {/* 6. Simple 4-Step Ordering Timeline */}
        <WaterHowItWorks />

        {/* 7. Wedding & Grand Event Logistics Story */}
        <WaterEventStory />

        {/* 8. Public Event Requirement Inquiry Form with GPS */}
        <WaterEventForm />

        {/* 9. Contact Details, Service Hours & Click-To-Call */}
        <WaterContactSection />

        {/* 10. Sister Brand Connection to RadhaCafe */}
        <WaterCafeLink />
      </main>

      {/* Dedicated RadhaWater Footer */}
      <WaterFooter />
    </div>
  );
}
