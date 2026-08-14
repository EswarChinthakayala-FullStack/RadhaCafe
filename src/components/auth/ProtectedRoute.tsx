import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { AppLogo } from '../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon, LockKeyIcon } from '@hugeicons/core-free-icons';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, initialized, isLoading } = useAuth();

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen min-h-svh w-full flex flex-col items-center justify-center bg-[#140A06] text-cream p-6 relative overflow-hidden">
        {/* Soft Radial Center Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center space-y-5 text-center">
          <AppLogo size="lg" lightText />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-semibold">
            <HugeiconsIcon icon={LockKeyIcon} size={13} />
            <span>Secure Admin Portal</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#EAD5C3]/75 pt-2 font-mono">
            <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin text-[#E5A88B]" />
            <span>Verifying admin session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
