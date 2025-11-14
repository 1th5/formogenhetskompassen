'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { getCurrentLevel } from '@/lib/wealth/calc';
import { calculateAmortizationMonthly } from '@/lib/wealth/calc';
import { Person, Asset, Liability } from '@/lib/types';
import { PiggyBank, TrendingUp, Target, Sparkles, Lock } from 'lucide-react';

interface SavingsCardProps {
  assets: Asset[];
  liabilities: Liability[];
  persons: Person[];
  totalNetWorth: number;
  isLocked?: boolean;
}

export default function SavingsCard({ assets, liabilities, persons, totalNetWorth, isLocked = false }: SavingsCardProps) {
  const router = useRouter();

  // Beräkna nuvarande månadssparande
  const monthlySavings = useMemo(() => {
    return persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
  }, [persons]);

  const amortizationMonthly = useMemo(() => {
    return calculateAmortizationMonthly(liabilities);
  }, [liabilities]);

  const totalMonthlySavings = monthlySavings + amortizationMonthly;

  // Beräkna nettoinkomst för att räkna ut sparkvot
  const netIncome = useMemo(() => {
    return persons.reduce((sum, person) => {
      const personNetIncome = person.incomes?.reduce((incomeSum, income) => {
        if (income.monthly_income) {
          return incomeSum + income.monthly_income;
        }
        return incomeSum;
      }, 0) || 0;
      return sum + personNetIncome;
    }, 0);
  }, [persons]);

  // Sparkvot
  const savingsRate = netIncome > 0 ? (totalMonthlySavings / netIncome) * 100 : 0;

  // Bestäm vilken nivå användaren är på
  const currentLevel = getCurrentLevel(totalNetWorth);
  const isLevel1 = currentLevel.level === 1;
  const isLevel2 = currentLevel.level === 2;
  const isLevel3Plus = currentLevel.level >= 3;

  // Likvida vs totala tillgångar
  const totalAssetValue = useMemo(() => assets.reduce((s,a)=> s + (a.value || 0), 0), [assets]);
  const liquidValue = useMemo(() => assets
    .filter(a => ['Fonder & Aktier','Sparkonto & Kontanter'].includes(a.category as any))
    .reduce((s,a)=> s + (a.value || 0), 0), [assets]);
  const liquidRatio = totalAssetValue > 0 ? liquidValue / totalAssetValue : 0;
  const shouldShowSavingsNudge = useMemo(() => {
    return currentLevel.level <= 3 && savingsRate < 5 && ((liquidRatio < 0.3) || (totalAssetValue < 100000));
  }, [currentLevel.level, savingsRate, liquidRatio, totalAssetValue]);

  // Bestäm text för "Kom igång"-knappen baserat på sparande
  const getISKButtonText = () => {
    // Om man har högt sparande (över 500k i likvida tillgångar eller nivå 3+)
    if (liquidValue > 500000 || currentLevel.level >= 3) {
      return 'Läs mer om ISK';
    }
    return 'Kom igång';
  };

  // Bestäm meddelande och stil baserat på nivå
  const messageInfo = useMemo(() => {
    if (isLevel1) {
      return {
        title: 'Bygg din buffert',
        message: 'Varje månad du sparar bygger trygghet och ger dig möjlighet till framtida frihet.',
        color: 'amber',
        icon: PiggyBank,
        badge: 'Kom igång',
        encouragement: totalMonthlySavings === 0 
          ? 'Börja med att sätta undan en liten summa varje månad – varje steg räknas!'
          : `Bra start! Du sparar redan ${formatCurrency(totalMonthlySavings)}/månad.`
      };
    } else if (isLevel2) {
      return {
        title: 'Mot ekonomisk trygghet',
        message: 'Ditt sparande växer och ger dig större möjligheter och valfrihet.',
        color: 'green',
        icon: Target,
        badge: 'På väg!',
        encouragement: `Fortsätt spara ${formatCurrency(totalMonthlySavings)}/månad för att nå nästa nivå.`
      };
    } else {
      return {
        title: 'Mot ekonomisk frihet',
        message: 'Ränta-på-ränta-effekten accelererar – ditt sparande får växa allt snabbare över tid.',
        color: 'emerald',
        icon: Sparkles,
        badge: 'Fantastiskt!',
        encouragement: `Med ${formatCurrency(totalMonthlySavings)}/månad och ränta-på-ränta bygger du snabbt framtid.`
      };
    }
  }, [isLevel1, isLevel2, isLevel3Plus, totalMonthlySavings]);

  // Sparkvot info för styling
  const savingsRateInfo = useMemo(() => {
    if (savingsRate >= 30) {
      return {
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50 border-emerald-300',
        borderClass: 'border-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badge: 'Utmärkt!'
      };
    } else if (savingsRate >= 20) {
      return {
        colorClass: 'text-green-700',
        bgClass: 'bg-green-50 border-green-300',
        borderClass: 'border-green-300',
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
        badge: 'Mycket bra!'
      };
    } else if (savingsRate >= 10) {
      return {
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50 border-blue-300',
        borderClass: 'border-blue-300',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        badge: 'Bra!'
      };
    } else if (savingsRate >= 5) {
      return {
        colorClass: 'text-amber-700',
        bgClass: 'bg-amber-50 border-amber-300',
        borderClass: 'border-amber-300',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        badge: 'På väg!'
      };
    } else if (savingsRate > 0) {
      return {
        colorClass: 'text-orange-700',
        bgClass: 'bg-orange-50 border-orange-300',
        borderClass: 'border-orange-300',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
        badge: 'Början!'
      };
    } else {
      return {
        colorClass: 'text-gray-700',
        bgClass: 'bg-gray-50 border-gray-300',
        borderClass: 'border-gray-300',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        badge: 'Kom igång'
      };
    }
  }, [savingsRate]);

  // Visa låst version om isLocked är true
  if (isLocked) {
    return (
      <Card className="relative overflow-visible border-0 shadow-lg opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
              <PiggyBank className="w-5 h-5 text-primary/60" />
            </div>
            <span>Ditt sparande</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-6 h-6" />
              <span className="text-lg font-medium">Lås upp på Nivå 1</span>
            </div>
            <p className="text-sm text-gray-600">
              För att se ditt sparande och beräkna framtida tillväxt behöver du först skapa ett hushåll med minst en person.
            </p>
            <Badge variant="secondary" className="text-xs">
              Baserat på din nettoförmögenhet
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card id="savings-card" className={`relative overflow-visible border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
        savingsRate >= 30 ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50' :
        savingsRate >= 20 ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50' :
        savingsRate >= 10 ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' :
        savingsRate >= 5 ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50' :
        savingsRate > 0 ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50' :
        'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
      }`}>
        {/* ISK-guide knapp - alltid synlig */}
        <div className="absolute top-4 right-4 z-30">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-card px-3 py-2">
            {shouldShowSavingsNudge && (
              <>
                <div className="relative group w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-help">
                  <span className="text-primary">💡</span>
                  <div className="pointer-events-none absolute right-0 top-9 hidden group-hover:block whitespace-normal break-words bg-white border border-slate-200/70 rounded-lg shadow-md text-[10px] text-primary/80 px-3 py-2 w-[320px] z-40">
                    Börja spara regelbundet och bygg upp likvida tillgångar – då blir 0,01%-potten mer användbar i vardagen. Små steg räcker för att komma igång.
                  </div>
                </div>
                <span className="hidden sm:block text-xs font-medium text-primary">Tips</span>
              </>
            )}
            <button
              onClick={() => router.push('/dashboard/savings/info')}
              className="inline-flex items-center rounded-full bg-primary text-white px-3 py-1.5 text-xs shadow-sm hover:bg-primary/90 hover:shadow-md cursor-pointer"
            >
              {getISKButtonText()}
            </button>
          </div>
        </div>
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow ${
                messageInfo.color === 'emerald' ? 'shadow-lg' : 'shadow'
              }`}>
                <messageInfo.icon className={`w-6 h-6 ${savingsRateInfo.colorClass}`} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Ditt sparande
                </CardTitle>
                <p className="text-xs text-gray-600 mt-0.5">
                  {messageInfo.title}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Nuvarande sparande */}
          <div className="text-center py-2">
            <div className={`text-4xl md:text-5xl font-extrabold mb-1 ${savingsRateInfo.colorClass} drop-shadow-sm`}>
              {formatCurrency(totalMonthlySavings)}
            </div>
            <p className="text-sm text-gray-600 mb-2">per månad</p>
            <p className="text-xs text-primary/60 mb-3">
              Månadsökningen består av amorteringar (som ökar din nettoförmögenhet) och annat sparande som registrerats i hushållet (exklusive pensionsavsättningar).
            </p>
            
            {/* Sparkvot */}
            <div className={`inline-block px-4 py-2 rounded-lg border-2 mb-3 ${savingsRateInfo.bgClass} ${savingsRateInfo.borderClass}`}>
              <p className="text-xs text-gray-600 mb-1">Sparkvot</p>
              <div className={`text-3xl font-bold ${savingsRateInfo.colorClass}`}>
                {savingsRate.toFixed(1)} %
              </div>
            <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${savingsRateInfo.badgeClass}`}>
                {savingsRateInfo.badge}
              </div>
            </div>

          {/* Progressbar borttagen enligt önskemål */}
        </div>

        {/* Disclaimer */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-primary/60 italic text-center">
            Sparkvotsbedömningarna är förenklade och baserade på allmän praxis — individuell situation kan variera.
          </p>
        </div>

          {/* Uppmuntring */}
          <div className={`${savingsRateInfo.bgClass} backdrop-blur-sm p-4 rounded-xl border-2 ${savingsRateInfo.borderClass} shadow-sm`}>
            <p className={`text-sm ${savingsRateInfo.colorClass} leading-relaxed text-center font-medium`}>
              {savingsRate === 0 
                ? messageInfo.encouragement
                : savingsRate < 5
                ? messageInfo.encouragement + ' Din sparkvot är ' + savingsRate.toFixed(1) + ' % – en målsättning på 10–20 % ger snabbare framsteg.'
                : messageInfo.encouragement
              }
            </p>
          </div>

          {/* CTA-knapp - alltid tydlig kontrast */}
          <Button
            onClick={() => router.push('/dashboard/savings')}
            variant="default"
            className="w-full font-semibold transition-all duration-300 shadow-card rounded-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Se ränta-på-ränta effekt
          </Button>
        </CardContent>
      </Card>

    </>
  );
}
