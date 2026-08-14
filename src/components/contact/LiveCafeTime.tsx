import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';

interface LiveCafeTimeProps {
  className?: string;
  dark?: boolean;
}

export function LiveCafeTime({ className = '', dark = false }: LiveCafeTimeProps) {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setTimeString(formatted);
      } catch {
        const now = new Date();
        setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTime();
    // Update every minute on the minute boundary
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!timeString) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
        dark
          ? 'bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B]'
          : 'bg-secondary/80 border border-border/80 text-foreground'
      } ${className}`}
    >
      <HugeiconsIcon
        icon={Clock01Icon}
        size={13}
        className={dark ? 'text-[#E5A88B]' : 'text-cinnamon shrink-0'}
      />
      <span className="whitespace-nowrap">
        IST: <strong className={`font-mono font-bold ${dark ? 'text-white' : 'text-foreground'}`}>{timeString}</strong>
      </span>
    </div>
  );
}
