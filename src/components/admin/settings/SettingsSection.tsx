import type { ReactNode } from 'react';
import { Separator } from '../../ui/separator';

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  showSeparator?: boolean;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  showSeparator = true,
  className = '',
}: SettingsSectionProps) {
  return (
    <div className={`space-y-3 w-full min-w-0 ${className}`}>
      {/* Optional Group Title & Description */}
      {(title || description) && (
        <div className="space-y-0.5 pb-1">
          {title && (
            <h4 className="text-xs font-bold font-heading text-muted-foreground uppercase tracking-wider">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Rows Container */}
      <div className="divide-y divide-border/50">
        {children}
      </div>

      {showSeparator && (
        <Separator className="bg-border/60 my-5" />
      )}
    </div>
  );
}
