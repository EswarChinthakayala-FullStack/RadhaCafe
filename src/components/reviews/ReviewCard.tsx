import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDate } from '../../lib/utils/formatDate';
import { toast } from '../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  QuoteUpIcon,
  Share01Icon,
  Coffee02Icon,
  ThumbsUpIcon,
} from '@hugeicons/core-free-icons';

export interface ReviewCardProps {
  id?: string;
  customerName: string;
  message: string;
  rating: number;
  createdAt?: string | Date;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  helpfulCount?: number;
  isUserHelpful?: boolean;
  onToggleHelpful?: (reviewId: string) => void;
  isFeatured?: boolean;
  className?: string;
}

// Background colors for customer avatar initials (Brand-toned)
const AVATAR_COLORS = [
  'bg-[#6F4E37] text-[#FFF8F0]',
  'bg-[#B85C1E] text-white',
  'bg-[#8B5A2B] text-white',
  'bg-[#4A2C1D] text-[#EAD5C3]',
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
  id,
  customerName,
  message,
  rating = 5,
  createdAt,
  adminReply,
  adminRepliedAt,
  helpfulCount = 0,
  isUserHelpful = false,
  onToggleHelpful,
  isFeatured = false,
  className = '',
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(customerName);
  const avatarColor = getAvatarColor(customerName);

  // Check if review text is long (> 160 characters) to offer Read more
  const isLongMessage = message.length > 160;
  const displayMessage = isExpanded || !isLongMessage ? message : `${message.slice(0, 150)}...`;

  // Deep linking scroll & highlight observer
  useEffect(() => {
    if (!id || typeof window === 'undefined') return;

    const checkHash = () => {
      if (window.location.hash === `#review-${id}`) {
        setIsHighlighted(true);
        if (cardRef.current) {
          cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const timer = setTimeout(() => setIsHighlighted(false), 3000);
        return () => clearTimeout(timer);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [id]);

  const handleShare = async () => {
    const url = `${window.location.origin}/reviews#review-${id || ''}`;
    const shareData = {
      title: `Review by ${customerName} for RadhaCafe`,
      text: `Read ${customerName}'s ${rating}-star review for RadhaCafe: "${message.slice(0, 80)}..."`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      toast.add({
        title: 'Review Link Copied!',
        description: 'Link copied to your clipboard.',
        type: 'success',
      });
    } catch {
      toast.add({
        title: 'Link Ready',
        description: url,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      id={id ? `review-${id}` : undefined}
      className={`rounded-2xl transition-all duration-500 ${
        isHighlighted
          ? 'ring-2 ring-[#E5A88B] ring-offset-2 ring-offset-[#140A06] scale-[1.01]'
          : ''
      }`}
    >
      <Card
        className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full ${
          isFeatured
            ? 'bg-[#24130C] border-2 border-[#E5A88B]/60 shadow-xl'
            : 'bg-[#1D100A]/95 border-[#3E2519]/70 hover:border-[#E5A88B]/40 shadow-md hover:shadow-xl'
        } ${className}`}
      >
        <CardContent className="p-5 sm:p-6 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            {/* Top Row: Avatar + Name + Rating + Date */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-[#3E2519] shadow-sm shrink-0">
                  <AvatarFallback className={`font-bold text-xs ${avatarColor}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-heading font-bold text-sm text-cream leading-tight">
                    {customerName}
                  </h4>
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
                    className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-[#3E2519]'}
                  />
                ))}
              </div>
            </div>

            {/* Review Content */}
            <div className="relative pt-1 space-y-1.5">
              <HugeiconsIcon icon={QuoteUpIcon} size={15} className="text-[#E5A88B]/30 mb-0.5" />
              <p className="text-xs sm:text-sm text-[#EAD5C3]/90 leading-relaxed font-normal">
                {displayMessage}
              </p>

              {isLongMessage && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] font-bold text-[#E5A88B] hover:text-[#EEB89D] underline underline-offset-2 transition-colors cursor-pointer inline-block"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Owner Response from RadhaCafe (if present) */}
            {adminReply && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#140A06]/90 border border-[#3E2519]/70 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 border-b border-[#3E2519]/40 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#B85C1E] text-white flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={Coffee02Icon} size={11} />
                    </div>
                    <span className="font-heading font-bold text-[11px] text-[#E5A88B]">
                      Response from RadhaCafe
                    </span>
                  </div>
                  {adminRepliedAt && (
                    <span className="text-[10px] text-cream/40 font-mono">
                      {formatDate(adminRepliedAt, 'dd MMM yyyy')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#EAD5C3]/80 leading-relaxed font-normal italic">
                  &ldquo;{adminReply}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions Row: Helpful + Share */}
          <div className="pt-3 border-t border-[#3E2519]/60 flex items-center justify-between gap-3 text-xs">
            {/* Helpful Button */}
            <button
              type="button"
              onClick={() => id && onToggleHelpful && onToggleHelpful(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold ${
                isUserHelpful
                  ? 'bg-[#E5A88B] text-[#140A06] font-bold shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-cream/70 hover:text-cream border border-white/10'
              }`}
              aria-label={`Mark review as helpful (${helpfulCount} people found this helpful)`}
            >
              <HugeiconsIcon
                icon={ThumbsUpIcon}
                size={13}
                className={isUserHelpful ? 'fill-current' : ''}
              />
              <span>Helpful</span>
              {helpfulCount > 0 && (
                <span className={`text-[11px] ${isUserHelpful ? 'text-[#140A06]' : 'text-[#E5A88B]'}`}>
                  &middot; {helpfulCount}
                </span>
              )}
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-cream/60 hover:text-[#E5A88B] transition-all cursor-pointer"
              aria-label="Share review link"
              title="Share review"
            >
              <HugeiconsIcon icon={Share01Icon} size={14} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
