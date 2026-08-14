import { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';

interface LiveCafeTimeProps {
  openingHours?: string | null;
  className?: string;
  variant?: 'badge' | 'compact' | 'hero';
}

/**
 * Helper to safely interpret opening hours if in standard format like "4:30 AM - 10:00 PM"
 * or "Mon - Sun: 4:30 AM - 10:00 PM". Returns status info if reliably parsed.
 */
function parseCafeStatus(openingHoursStr?: string | null, date = new Date()): {
  isOpen: boolean | null;
  statusText: string;
} {
  if (!openingHoursStr) {
    return { isOpen: null, statusText: 'RadhaCafe Local Time' };
  }

  try {
    // Look for standard time range pattern like "4:30 AM - 10:00 PM" or "04:30 AM - 10:00 PM"
    const match = openingHoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      return { isOpen: null, statusText: 'RadhaCafe Local Time' };
    }

    const [, startH, startM, startP, endH, endM, endP] = match;

    const to24h = (h: string, m: string, p: string) => {
      let hours = parseInt(h, 10);
      const minutes = parseInt(m, 10);
      if (p.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (p.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = to24h(startH, startM, startP);
    const endMinutes = to24h(endH, endM, endP);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    const isClosingSoon = isOpen && (endMinutes - currentMinutes) <= 45;

    if (isClosingSoon) {
      return { isOpen: true, statusText: 'Closing Soon' };
    }
    if (isOpen) {
      return { isOpen: true, statusText: 'Open Now' };
    }
    return { isOpen: false, statusText: `Opens at ${startH}:${startM} ${startP.toUpperCase()}` };
  } catch {
    return { isOpen: null, statusText: 'RadhaCafe Local Time' };
  }
}

export function LiveCafeTime({ openingHours, className = '', variant = 'hero' }: LiveCafeTimeProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Sync update to the next minute boundary, then interval every 60s
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => {
        setNow(new Date());
      }, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const timeFormatted = useMemo(() => {
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [now]);

  const { isOpen, statusText } = useMemo(() => {
    return parseCafeStatus(openingHours, now);
  }, [openingHours, now]);

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-cream/70 font-medium ${className}`}>
        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-cinnamon shrink-0" />
        <span className="font-mono text-cream font-semibold tracking-wider">{timeFormatted}</span>
        {isOpen !== null && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isOpen
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className={`size-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {statusText}
          </span>
        )}
      </div>
    );
  }

  // Hero variant: Elegant frosted pill with status dot, time, and live indicator
  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#1C100B]/80 backdrop-blur-md border border-[#E5A88B]/30 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#E5A88B]/60 ${className}`}
      aria-label={`Cafe Local Time: ${timeFormatted}, Status: ${statusText}`}
    >
      <div className="flex items-center gap-1.5">
        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-[#E5A88B]" />
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/70">
          Local Time
        </span>
      </div>

      <span className="h-3 w-px bg-white/20" aria-hidden="true" />

      <span className="font-mono text-xs font-bold text-cream tracking-wide">
        {timeFormatted}
      </span>

      {isOpen !== null && (
        <>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${
                isOpen ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-400'
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-[10px] font-bold tracking-wider uppercase ${
                isOpen ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {statusText}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
