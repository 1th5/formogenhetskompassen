'use client';

import { Users, Home, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Section = 'people' | 'assets' | 'debts';

interface SectionConfig {
  id: Section;
  icon: typeof Users;
  title: string;
  subtitle: string;
}

const sections: SectionConfig[] = [
  {
    id: 'people',
    icon: Users,
    title: 'Personer & inkomster',
    subtitle: 'Vi börjar med vilka ni är'
  },
  {
    id: 'assets',
    icon: Home,
    title: 'Tillgångar',
    subtitle: 'Bostad, sparande, övrigt'
  },
  {
    id: 'debts',
    icon: CreditCard,
    title: 'Skulder & lån',
    subtitle: 'Bolån, studielån, krediter'
  }
];

interface OnboardingSectionProgressProps {
  currentSection: string;
  completedSections: Section[];
}

// Mappa steg till sektioner
const SECTION_BY_STEP: Record<string, Section> = {
  // 1) personer & inkomster & pension per person
  'welcome': 'people',
  'persons': 'people',
  'pension-per-person': 'people',
  
  // 2) tillgångar
  'savings-investments': 'assets',
  'housing': 'assets',
  'housing-loan': 'assets',
  'other-investments': 'assets',
  'car-loan': 'assets',
  
  // 3) skulder
  'liabilities': 'debts',
  
  // Sammanfattning räknas inte som en sektion
  'summary': 'debts' // Tekniskt sett är vi "klara" med skulder när vi når summary
};

export default function OnboardingSectionProgress({
  currentSection,
  completedSections
}: OnboardingSectionProgressProps) {
  const currentSectionType = SECTION_BY_STEP[currentSection] || 'people';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {sections.map((section) => {
        const Icon = section.icon;
        const isCompleted = completedSections.includes(section.id);
        const isCurrent = !isCompleted && currentSectionType === section.id;
        const isUpcoming = !isCompleted && !isCurrent;
        
        return (
          <div
            key={section.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-200',
              isCompleted && 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm scale-[1.01]',
              isCurrent && 'bg-primary/5 border-primary/40 text-primary',
              isUpcoming && 'bg-white border-slate-200 text-slate-500'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                isCompleted && 'bg-emerald-500 text-white',
                isCurrent && 'bg-primary/10 text-primary',
                isUpcoming && 'bg-slate-100 text-slate-400'
              )}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{section.title}</span>
              <span className={cn(
                'text-xs',
                isCompleted && 'text-emerald-700',
                isCurrent && 'text-primary/70',
                isUpcoming && 'text-slate-500'
              )}>
                {section.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

