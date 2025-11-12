'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  type?: 'single';
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
}

interface AccordionContentProps {
  className?: string;
  children: ReactNode;
}

export function Accordion({ type, collapsible, className, children }: AccordionProps) {
  return <div className={cn('w-full', className)}>{children}</div>;
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return <div className={cn('border-b', className)}>{children}</div>;
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline',
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
      />
    </button>
  );
}

export function AccordionContent({ className, children }: AccordionContentProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Enkel implementation - kan förbättras med context om behövs
  return (
    <div className={cn('overflow-hidden transition-all', isOpen ? 'block' : 'hidden', className)}>
      {children}
    </div>
  );
}

