import { useCafeSettings } from '../../hooks/useCafeSettings';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { ContactHero } from '../../components/contact/ContactHero';
import { ContactQuickActions } from '../../components/contact/ContactQuickActions';
import { VisitSection } from '../../components/contact/VisitSection';
import { CafeAtmosphere } from '../../components/contact/CafeAtmosphere';
import { RadhaWaterCrossLink } from '../../components/contact/RadhaWaterCrossLink';
import { FinalVisitCta } from '../../components/contact/FinalVisitCta';
import { MobileContactBar } from '../../components/contact/MobileContactBar';
import { ContactSkeleton } from '../../components/contact/ContactSkeleton';
import { ContactErrorState } from '../../components/contact/ContactErrorState';

export function PublicContactPage() {
  const { isLoading, isError, refetch } = useCafeSettings();

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white relative">
      <Navbar />

      {/* Page Hero */}
      <ContactHero />

      {/* Main Content Flow */}
      <main className="flex-1 space-y-16 sm:space-y-20 pb-20 bg-[#140A06]">
        {/* Quick Contact Action Strip */}
        <ContactQuickActions />

        {/* Loading / Error States for Dynamic Info */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          {isLoading ? (
            <ContactSkeleton />
          ) : isError ? (
            <ContactErrorState onRetry={() => refetch()} />
          ) : (
            <VisitSection />
          )}
        </div>

        {/* Cafe Hospitality Atmosphere Section */}
        <CafeAtmosphere />

        {/* RadhaWater Commercial Plants Cross-Link */}
        <RadhaWaterCrossLink />

        {/* Final Warm Visit Invitation CTA */}
        <FinalVisitCta />
      </main>

      {/* Sticky Mobile Floating Action Bar */}
      <MobileContactBar />

      <Footer />
    </div>
  );
}
