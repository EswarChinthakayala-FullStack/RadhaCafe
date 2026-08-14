import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, SparklesIcon } from '@hugeicons/core-free-icons';

export function LiveWaterTime() {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C100B]/80 border border-[#3E2519] text-[#E5A88B] text-xs backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-1.5 text-[#E5A88B]">
        <HugeiconsIcon icon={Clock01Icon} size={14} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Local Time</span>
      </div>
      <span className="text-cream/30">&middot;</span>
      <span className="font-bold text-cream font-mono">{timeString || '01:57 AM'}</span>
      <span className="text-cream/30">&middot;</span>
      <div className="flex items-center gap-1 text-[#E5A88B]">
        <HugeiconsIcon icon={SparklesIcon} size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Enquiries Open</span>
      </div>
    </div>
  );
}
