"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-card border border-border/80 rounded-2xl shadow-xl p-3.5 sm:p-4 select-none w-fit",
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 z-10",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 rounded-lg hover:bg-cinnamon/10 hover:text-cinnamon transition-colors text-muted-foreground border border-border/40 shadow-2xs",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 rounded-lg hover:bg-cinnamon/10 hover:text-cinnamon transition-colors text-muted-foreground border border-border/40 shadow-2xs",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center px-8",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-7 w-full items-center justify-center gap-1.5 text-xs font-bold text-foreground",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-lg",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-bold font-heading text-sm text-foreground select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-lg text-xs font-semibold text-foreground [&>svg]:size-3.5 [&>svg]:text-cinnamon",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex pb-1 border-b border-border/50 mb-1", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 text-[11px] font-bold text-cinnamon/80 uppercase tracking-wider select-none text-center py-1",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full gap-1", defaultClassNames.week),
        week_number_header: cn(
          "w-8 select-none text-[10px] font-bold text-muted-foreground",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[11px] text-muted-foreground select-none font-mono",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-8 w-8 p-0 text-center select-none flex items-center justify-center",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-lg bg-cinnamon/20 text-cinnamon font-bold",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-cinnamon/10 text-cinnamon font-medium", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-lg bg-cinnamon/20 text-cinnamon font-bold",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-lg bg-cinnamon/10 text-cinnamon font-bold border border-cinnamon/30",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/35 aria-selected:text-muted-foreground/50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground/30 opacity-40 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className={cn("size-3.5 text-foreground", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className={cn("size-3.5 text-foreground", className)} {...props} />
            )
          }

          return (
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className={cn("size-3.5 text-foreground", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex h-8 w-8 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 border-0 hover:bg-cinnamon/15 hover:text-cinnamon hover:font-bold data-[selected-single=true]:bg-cinnamon data-[selected-single=true]:text-white data-[selected-single=true]:font-bold data-[selected-single=true]:shadow-xs data-[range-start=true]:bg-cinnamon data-[range-start=true]:text-white data-[range-end=true]:bg-cinnamon data-[range-end=true]:text-white data-[range-middle=true]:bg-cinnamon/10 data-[range-middle=true]:text-cinnamon",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
