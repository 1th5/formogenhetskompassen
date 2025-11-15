'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MultiSelectToggleProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  minSelections?: number;
  className?: string;
}

export function MultiSelectToggle({ 
  options, 
  selected, 
  onChange, 
  minSelections = 1,
  className 
}: MultiSelectToggleProps) {
  const handleToggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      // Om man försöker avmarkera och det skulle bli färre än minSelections, blockera
      if (selected.length <= minSelections) {
        return;
      }
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const isDisabled = !isSelected && selected.length < minSelections;
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleToggle(option.id)}
            disabled={isDisabled}
            className={cn(
              "relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              isSelected
                ? "bg-primary/10 border-primary shadow-md scale-[1.02]"
                : "bg-white/80 border-slate-200 hover:border-primary/40 hover:bg-primary/5",
              !isSelected && !isDisabled && "cursor-pointer"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox indicator */}
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-white border-slate-300"
              )}>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {option.icon && (
                  <div className="mb-1.5 text-primary/70">
                    {option.icon}
                  </div>
                )}
                <div className="font-semibold text-sm text-primary mb-0.5">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-xs text-primary/60 leading-relaxed">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Selection indicator dot */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

