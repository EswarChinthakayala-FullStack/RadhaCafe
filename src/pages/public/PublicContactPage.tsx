import { useCafeSettings } from '../../hooks/useCafeSettings';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { ContactHeader } from '../../components/contact/ContactHeader';
import { ContactInfoCards } from '../../components/contact/ContactInfoCards';
import { ContactMap } from '../../components/contact/ContactMap';
import { ContactCta } from '../../components/contact/ContactCta';
import { ContactSkeleton } from '../../components/contact/ContactSkeleton';
import { ContactErrorState } from '../../components/contact/ContactErrorState';

export function PublicContactPage() {
  const { isLoading, isError, refetch } = useCafeSettings();

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Page Hero Header */}
      <ContactHeader />

      {/* Main Contact Content */}
      <main className="flex-1 py-14 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-14">
          {/* Information Cards / Loading / Error State */}
          {isLoading ? (
            <ContactSkeleton />
          ) : isError ? (
            <ContactErrorState onRetry={() => refetch()} />
          ) : (
            <ContactInfoCards />
          )}

          {/* Location Map */}
          <ContactMap />

          {/* Quick Contact CTA Banner */}
          <ContactCta />
        </div>
      </main>

      <Footer />
    </div>
  );
}
