import { LoginForm } from '../../components/auth/LoginForm';
import { AppLogo } from '../../components/brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon } from '@hugeicons/core-free-icons';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#140A06] text-cream grid lg:grid-cols-2 selection:bg-cinnamon selection:text-white">
      {/* ── Left Panel: Full-Height Brand Visual & Story Showcase (Desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between min-h-screen p-12 lg:p-16 bg-[#1A0E0A] border-r border-[#2C1810] relative overflow-hidden">
        {/* Full-Height Photography Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/about.png"
            alt="RadhaCafe Atmosphere"
            className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/85 to-[#1C100B]/75" />
        </div>

        {/* Top Header: Logo */}
        <div className="relative z-10">
          <AppLogo size="lg" lightText />
        </div>

        {/* Center Content: Headline & Portal Modules */}
        <div className="relative z-10 space-y-6 my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-bold uppercase tracking-widest">
            <HugeiconsIcon icon={LockKeyIcon} size={14} />
            <span>RADHACAFE ADMIN PORTAL</span>
          </div>

          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-cream leading-[1.1] tracking-tight">
            Crafted Coffee.{' '}
            <span className="font-serif italic font-normal text-[#E5A88B] block mt-1">
              Thoughtful Hospitality.
            </span>
          </h1>

          <p className="text-sm text-cream/80 leading-relaxed font-normal">
            Single-administrator management system for order dispatch, POS thermal receipt printing, menu catalog control, and store analytics.
          </p>


        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 pt-6 border-t border-[#2C1810] flex items-center justify-between text-xs text-cream/50">
          <span>Est. 2026 &middot; Tallur, AP</span>
          <span>RadhaCafe POS System</span>
        </div>
      </div>

      {/* ── Right Panel: Full-Height Authentication Form Surface ── */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 bg-[#140A06] relative">
        {/* Soft Warm Radial Glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(229,168,139,0.08)_0%,transparent_70%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="w-full max-w-md relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
