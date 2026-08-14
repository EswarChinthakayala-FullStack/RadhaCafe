import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDate } from '../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, CheckmarkCircle02Icon, QuoteUpIcon } from '@hugeicons/core-free-icons';

export interface ReviewCardProps {
  id?: string;
  customerName: string;
  message: string;
  rating: number;
  createdAt?: string | Date;
  isVerified?: boolean;
  isFeatured?: boolean;
  className?: string;
}

// Background colors for customer avatar initials
const AVATAR_COLORS = [
  'bg-[#6F4E37] text-white',
  'bg-[#B85C1E] text-white',
  'bg-[#8B5A2B] text-white',
  'bg-[#3E2723] text-[#F5E6D3]',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name: string): string {
  if (!name) return 'RC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ReviewCard({
  customerName,
  message,
  rating = 5,
  createdAt,
  isVerified = true,
  isFeatured = false,
  className = '',
}: ReviewCardProps) {
  const initials = getInitials(customerName);
  const avatarColor = getAvatarColor(customerName);

  return (
    <Card
      className={`rounded-2xl transition-all duration-300 flex flex-col justify-between ${
        isFeatured
          ? 'bg-[#24130C] border-2 border-[#E5A88B]/60 shadow-xl'
          : 'bg-[#1D100A]/90 border border-[#3E2519]/70 hover:border-[#E5A88B]/40 shadow-md hover:-translate-y-1 hover:shadow-xl'
      } ${className}`}
    >
      <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
        <div className="space-y-3.5">
          {/* Top Header: Avatar + Name + Rating */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-[#3E2519] shadow-sm">
                <AvatarFallback className={`font-bold text-xs ${avatarColor}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm text-cream">{customerName}</span>
                  {isVerified && (
                    <span
                      className="inline-flex items-center text-[#E5A88B]"
                      title="Verified RadhaCafe Guest"
                      aria-label="Verified Guest"
                    >
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    </span>
                  )}
                </div>
                {createdAt && (
                  <p className="text-[11px] text-cream/50 font-medium mt-0.5">
                    {formatDate(createdAt, 'dd MMM yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Star Rating */}
            <div
              className="flex items-center gap-0.5 text-amber-400 shrink-0"
              aria-label={`Rated ${rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={14}
                  className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-[#2C1810]'}
                />
              ))}
            </div>
          </div>

          {/* Quotation icon & Message */}
          <div className="relative pt-1">
            <HugeiconsIcon icon={QuoteUpIcon} size={16} className="text-[#E5A88B]/30 mb-1" />
            <p className="text-xs sm:text-sm text-[#EAD5C3]/85 leading-relaxed font-normal italic">
              &ldquo;{message}&rdquo;
            </p>
          </div>
        </div>

        {/* Optional Featured Tag */}
        {isFeatured && (
          <div className="pt-3 border-t border-[#3E2519]/60 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
              Featured Experience
            </span>
            <span className="text-[10px] text-cream/50 font-medium">RadhaCafe Guest</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
