import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';

export function LiveCafeTime({ className = '' }: { className?: string }) {
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
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-xs font-semibold text-[#E5A88B] ${className}`}>
      <HugeiconsIcon icon={Clock01Icon} size={13} className="text-[#E5A88B]" />
      <span>Local Time (IST): <strong className="font-mono text-white">{timeString}</strong></span>
    </div>
  );
}
