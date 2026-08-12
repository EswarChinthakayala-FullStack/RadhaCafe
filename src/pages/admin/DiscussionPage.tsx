import { DiscussionModerator } from '../../components/admin/discussion/DiscussionModerator';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon } from '@hugeicons/core-free-icons';

export function DiscussionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Comment01Icon} size={22} />
            </div>
            <span>Review & Discussion Moderation</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review, approve, or remove guest ratings and feedback before public display on RadhaCafe.
          </p>
        </div>
      </div>

      <DiscussionModerator />
    </div>
  );
}
