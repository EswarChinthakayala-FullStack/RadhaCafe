import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { AppLogo } from '../../components/brand/AppLogo';
import { LiveCafeTime } from '../../components/contact/LiveCafeTime';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';

export function LoginPage() {
  // Ensure document background matches the dark theme to prevent white overscroll on mobile
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = '#140A06';
    document.body.style.backgroundColor = '#140A06';

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-[#140A06] text-cream selection:bg-cinnamon selection:text-white overscroll-none">
      <div className="min-h-full w-full grid lg:grid-cols-12 bg-[#140A06]">
        {/* ── Left Panel: Cinematic Photography & Platform Showcase (7 Cols Desktop) ── */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between min-h-screen p-12 xl:p-16 bg-[#1A0E08] border-r border-[#2C1810] relative overflow-hidden">
          {/* Full-Height Photography Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-[center_35%] filter brightness-90 contrast-105 scale-105 transition-transform duration-1000"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2400&q=90')`,
              }}
            />
            {/* Multi-Layered Coffee & Dark Roast Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/85 to-[#1C100B]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,10,6,0.85)_100%)]" />
          </div>

          {/* Top Header: Official Brand Emblem */}
          <div className="relative z-10">
            <AppLogo size="lg" lightText />
          </div>

          {/* Center Editorial Brand Statement */}
          <div className="relative z-10 space-y-6 my-auto max-w-xl">
            <div className="space-y-3">
              <h1 className="font-heading font-extrabold text-4xl xl:text-5xl text-cream leading-[1.1] tracking-tight">
                Everything your cafe needs,{' '}
                <span className="font-serif italic font-normal text-[#E5A88B] block mt-1">
                  in one place.
                </span>
              </h1>
              <p className="text-sm text-[#EAD5C3]/80 leading-relaxed font-normal">
                Real-time POS order dispatch, thermal receipt printing, live menu catalog control, customer accounts, and revenue analytics.
              </p>
            </div>
          </div>

          {/* Bottom Detail Strip */}
          <div className="relative z-10 pt-6 border-t border-[#2C1810] flex items-center justify-between text-xs text-[#EAD5C3]/60">
            <span>RadhaCafe POS &middot; Tallur, AP</span>
            <LiveCafeTime />
          </div>
        </div>

        {/* ── Right Panel: Dedicated Authentication Surface (5 Cols Desktop) ── */}
        <div className="lg:col-span-5 min-h-full flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-[#140A06] relative">
          {/* Soft Ambient Radial Glow */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(229,168,139,0.06)_0%,transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar: Back to Public Website */}
          <div className="flex items-center justify-between relative z-10 pb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#EAD5C3]/70 hover:text-cream transition-colors group"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to RadhaCafe</span>
            </Link>
          </div>

          {/* Center: Authentication Form Container */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-6 relative z-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
