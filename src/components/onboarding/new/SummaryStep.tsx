/**
 * Summary step - Sista steget i onboarding
 * Visar sammanfattning och låser upp dashboard
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Person, Asset, Liability } from '@/lib/types';
import { CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

interface SummaryStepProps {
  persons: Person[];
  assets: Asset[];
  liabilities: Liability[];
  onComplete: () => void;
  onBack: () => void;
}

export default function SummaryStep({ persons, assets, liabilities, onComplete, onBack }: SummaryStepProps) {
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.principal, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-emerald-50 border-emerald-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-emerald-900">Personer</span>
            <span className="text-xs text-emerald-700">{persons.length} st</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-emerald-50 border-emerald-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-emerald-900">Tillgångar & pension</span>
            <span className="text-xs text-emerald-700">Inlagda</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-emerald-50 border-emerald-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-emerald-900">Skulder</span>
            <span className="text-xs text-emerald-700">Inlagda</span>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary mb-2">
                Nu kan vi visa var ditt hushåll befinner sig i The Wealth Ladder – din ekonomiska nivå i verkligheten.
              </p>
              <p className="text-sm text-primary/80 mb-2">
                I USA ligger ungefär 20% av hushållen på nivå 1, 20% på nivå 2 och 40% på nivå 3 – där den typiska medelklassen befinner sig. Bara cirka 2% når nivå 5 ("geografisk frihet"). Var hamnar du?
              </p>
              <p className="text-sm text-primary/80">
                Du är nu redo att se hur din rikedom utvecklas månad för månad – och när din pension börjar bidra på riktigt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1 sm:flex-initial">
          Tillbaka
        </Button>
        <Button onClick={onComplete} className="flex-1 sm:flex-initial">
          Klar – Visa min förmögenhetsöversikt →
        </Button>
      </div>

      {/* Microcopy */}
      <p className="text-xs text-primary/70 text-center italic">
        Nu får du se var du befinner dig på The Wealth Ladder – din personliga rikedomskarta.
        <br />
        Här ser du hur din förmögenhet växer varje månad och när din pension börjar göra skillnad på riktigt.
      </p>

      {/* Referenstext */}
      <p className="text-xs text-primary/50 text-center mt-6 pt-4 border-t border-primary/10">
        Referenser: The Wealth Ladder (Nick Maggiulli), minpension.se, svenska pensionssystemet
      </p>
    </div>
  );
}

