import type { ReactNode } from 'react';
import { Badge } from '../../ui/badge';

interface SettingsRowProps {
  id?: string;
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
  alignTop?: boolean;
  className?: string;
}

export function SettingsRow({
  id,
  title,
  description,
  badge,
  children,
  alignTop = false,
  className = '',
}: SettingsRowProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row ${
        alignTop ? 'sm:items-start' : 'sm:items-center'
      } justify-between gap-3 sm:gap-6 py-3.5 first:pt-0 last:pb-0 ${className}`}
    >
      {/* Left: Label, Description & Optional Badge */}
      <div className="space-y-1 max-w-xl min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={id}
            className="text-xs sm:text-sm font-semibold text-foreground tracking-tight select-none cursor-pointer"
          >
            {title}
          </label>
          {badge && (
            <Badge
              variant="outline"
              className="text-[10px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/5 px-1.5 py-0 h-4"
            >
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Right: Control Component */}
      <div className="shrink-0 sm:max-w-xs w-full sm:w-auto flex items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
