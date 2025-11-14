'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlOption {
  value: number;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn(
      "inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 w-full",
      className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !option.disabled && onChange(option.value)}
          disabled={option.disabled}
          className={cn(
            "flex-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            value === option.value
              ? "bg-white text-primary shadow-sm cursor-default"
              : option.disabled
              ? "text-slate-400 cursor-not-allowed"
              : "text-slate-600 hover:text-slate-900 cursor-pointer"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

