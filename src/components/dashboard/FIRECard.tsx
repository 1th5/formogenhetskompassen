'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, Sparkles, Zap, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { calculateFIRE, FIREResult, calculateAutoReturns } from '@/lib/fire/calc';
import { simulatePortfolio } from '@/lib/fire/simulate';
import { findSafeFireYear } from '@/lib/fire/validate';
import { calculatePersonNetIncome } from '@/lib/wealth/tax-calc';
import { 
  calculateAmortizationMonthly,
  calculatePublicPensionMonthlyAllocations,
  calculateOccupationalPensionMonthlyAllocations,
  calculatePremiePensionMonthlyAllocations,
  calculatePrivatePensionMonthlyAllocations
} from '@/lib/wealth/calc';
import { Person, Asset, Liability } from '@/lib/types';
import { getProgressTheme } from '@/lib/progressTheme';
import { useRouter } from 'next/navigation';

interface FIRECardProps {
  assets: Asset[];
  liabilities: Liability[];
  persons: Person[];
  totalNetWorth: number;
  currentLevel: number;
}

export default function FIRECard({ assets, liabilities, persons, totalNetWorth, currentLevel }: FIRECardProps) {
  const router = useRouter();
  const [fireResult, setFireResult] = useState<FIREResult | null>(null);
  const [showExpensesTooltip, setShowExpensesTooltip] = useState(false);
  const [showPortfolioTooltip, setShowPortfolioTooltip] = useState(false);
  const isLocked = currentLevel < 3;
  const isLevelZero = currentLevel === 0;

  // Stäng tooltips när man klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tooltip-container')) {
        setShowExpensesTooltip(false);
        setShowPortfolioTooltip(false);
      }
    };

    if (showExpensesTooltip || showPortfolioTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExpensesTooltip, showPortfolioTooltip]);
  
  useEffect(() => {
    // Beräkna månadssparande
    const monthlySavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    const amortizationMonthly = calculateAmortizationMonthly(liabilities);
    
    // Beräkna pensionsavsättningar (separerat per kategori)
    const occPensionContribMonthly = calculateOccupationalPensionMonthlyAllocations(persons);
    const premiePensionContribMonthly = calculatePremiePensionMonthlyAllocations(persons);
    const privatePensionContribMonthly = calculatePrivatePensionMonthlyAllocations(persons);
    const statePensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);
    
    // Beräkna automatiska avkastningar (använd default inflation 2% för dashboard-kortet)
    const inflation = 0.02; // Dashboard-kortet använder fast 2% eftersom det inte har slider
    // Säkerställ att liabilities är en array
    const safeLiabilities = Array.isArray(liabilities) ? liabilities : [];
    const autoReturns = calculateAutoReturns(assets, inflation, 0.07, safeLiabilities);
    
    // Förenklad beräkning av pension
    const monthlyPensionAfterTax = 0;
    
    // Lägg ihop sparande och amortering så dashboardens FIRE använder samma total som simulatorn
    const totalMonthlySavings = monthlySavings + amortizationMonthly;
    
    // Utgifter = nettoinkomst − (spar + amortering)
    const totalNetIncomeMonthly = persons.reduce((sum, p) => sum + (calculatePersonNetIncome(p) || 0), 0);
    const customMonthlyExpenses = Math.max(0, totalNetIncomeMonthly - totalMonthlySavings);

    const baseResult = calculateFIRE(
      assets,
      persons,
      totalNetWorth,
      totalMonthlySavings,
      autoReturns.realReturnAvailable,
      63, // Pension vid 63 år
      monthlyPensionAfterTax,
      calculatePersonNetIncome,
      customMonthlyExpenses,
      inflation, // inflation
      safeLiabilities, // Skulder för att beräkna nettovärden per kategori
      autoReturns.realReturnOccPension,
      autoReturns.realReturnPremiePension,
      autoReturns.realReturnPrivatePension,
      autoReturns.realReturnStatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      55, // occPensionEarlyStartAge (default 55)
      55  // ipsEarlyStartAge (default 55)
    );
    
    // Validera FIRE-året mot simuleringen för att säkerställa att kapitalet inte tar slut före pension
    const safeResult = findSafeFireYear({
      baseResult,
      assets,
      liabilities: safeLiabilities,
      persons,
      totalNetWorth,
      inflation,
      pensionStartAge: 63,
      maxAdditionalYears: 10
    });
    
    setFireResult(safeResult);
  }, [assets, persons, liabilities, totalNetWorth]);

  // Kör simulering för att få rätt portfolioAtFire-värde (samma som i simulatorn)
  const portfolioAtFireFromSimulation = useMemo(() => {
    if (!fireResult || !fireResult.isAchievable || fireResult.yearsToFire === null) {
      return null;
    }

    // Beräkna samma värden som i useEffect ovan
    const monthlySavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    const amortizationMonthly = calculateAmortizationMonthly(liabilities);
    const totalMonthlySavings = monthlySavings + amortizationMonthly;
    
    const occPensionContribMonthly = calculateOccupationalPensionMonthlyAllocations(persons);
    const premiePensionContribMonthly = calculatePremiePensionMonthlyAllocations(persons);
    const privatePensionContribMonthly = calculatePrivatePensionMonthlyAllocations(persons);
    const statePensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);
    
    const inflation = 0.02;
    const safeLiabilities = Array.isArray(liabilities) ? liabilities : [];
    const autoReturns = calculateAutoReturns(assets, inflation, 0.07, safeLiabilities);
    const totalNetIncomeMonthly = persons.reduce((sum, p) => sum + (calculatePersonNetIncome(p) || 0), 0);
    const customMonthlyExpenses = Math.max(0, totalNetIncomeMonthly - totalMonthlySavings);

    // Använd värden från calculateFIRE för konsistens
    const availableAtStart = fireResult.availableAtStart;
    const statePensionAtStart = fireResult.statePensionAtStart ?? 0;
    
    // Beräkna separata pensionsstartvärden från assets
    const occPensionAtStart = assets
      .filter(a => a.category === 'Tjänstepension')
      .reduce((sum, a) => sum + a.value, 0);
    const premiePensionAtStart = assets
      .filter(a => a.category === 'Premiepension')
      .reduce((sum, a) => sum + a.value, 0);
    const privatePensionAtStart = assets
      .filter(a => a.category === 'Privat pensionssparande (IPS)')
      .reduce((sum, a) => sum + a.value, 0);
    
    const averageAge = persons.length > 0 
      ? Math.round(persons.reduce((sum, p) => {
          const age = new Date().getFullYear() - p.birth_year;
          return sum + age;
        }, 0) / persons.length)
      : 40;

    // Beräkna 4%-krav med statlig pension (samma som i fire/page.tsx)
    const annualExpenses = customMonthlyExpenses * 12;
    const statePensionIncome = fireResult.statePensionAnnualIncome || 0;
    const totalPensionIncome = statePensionIncome;
    const requiredAtPension = Math.max(0, (annualExpenses - totalPensionIncome) * 25);

    // Hämta statlig pensionsdata från fireResult
    const statePensionPayoutYears = fireResult.statePensionPayoutYears ?? 20;
    const statePensionAnnualIncome = fireResult.statePensionAnnualIncome ?? 0;

    // Kör simulering med samma parametrar som simulatorn (inkl. statlig pension)
    const simulation = simulatePortfolio(
      availableAtStart,
      0, // pensionLockedAtStart - inte längre används
      totalMonthlySavings,
      autoReturns.realReturnAvailable,
      0, // realReturnPension - inte längre används
      customMonthlyExpenses * 12,
      averageAge,
      63, // Pension vid 63 år
      requiredAtPension,
      fireResult.yearsToFire,
      0, // monthlyPensionAfterTax
      0, // pensionContribMonthly - inte längre används
      inflation,
      false, // useCoastFire
      0, // coastFireYears
      0, // coastFirePensionContribMonthly - inte längre används
      statePensionAtStart, // Statlig pensionskapital vid start
      autoReturns.realReturnStatePension, // Real avkastning för statlig pension
      statePensionContribMonthly, // Statlig pensionsavsättning (inkomstpension)
      statePensionPayoutYears, // Antal år statlig pension betalas ut
      statePensionAnnualIncome, // Årlig utbetalning från statlig pension
      // Separata pensionsparametrar
      occPensionAtStart,
      premiePensionAtStart,
      privatePensionAtStart,
      autoReturns.realReturnOccPension,
      autoReturns.realReturnPremiePension,
      autoReturns.realReturnPrivatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      55, // occPensionEarlyStartAge
      55  // ipsEarlyStartAge
    );

    // Hämta värdet från simuleringen för FIRE-året
    const fireAge = averageAge + fireResult.yearsToFire;
    const dataPoint = simulation.data.find(d => d.age === fireAge);
    return dataPoint ? dataPoint.available : null;
  }, [fireResult, assets, persons, liabilities, totalNetWorth]);

  // Använd simuleringens värde om det finns, annars fallback till calculateFIRE
  const portfolioAtFire = portfolioAtFireFromSimulation !== null 
    ? portfolioAtFireFromSimulation 
    : (fireResult?.portfolioAtFire || 0);
  
  // Beräkna progress och färger baserat på hur nära man är (måste vara innan early return för Hooks-ordning)
  const progressInfo = useMemo(() => {
    if (isLocked || !fireResult || !fireResult.isAchievable || fireResult.yearsToFire === null) {
      return { progress: 0, theme: getProgressTheme(0), iconColor: 'text-gray-400', numberColor: 'text-gray-600', badgeText: '', badgeColor: '' };
    }
    
    const years = fireResult.yearsToFire;
    // Antag max 40 år för progress-beräkning
    const maxYears = 40;
    const progress = Math.max(0, Math.min(1, (maxYears - years) / maxYears));
    const theme = getProgressTheme(progress);
    
    if (years === 0) {
      return { 
        progress, theme,
        iconColor: 'text-emerald-600',
        numberColor: 'text-emerald-600',
        badgeText: 'Målet uppnått! 🎉',
        badgeColor: theme.badge
      };
    } else if (years <= 5) {
      return { 
        progress, theme,
        iconColor: 'text-emerald-600',
        numberColor: 'text-emerald-600',
        badgeText: 'Nästan där!',
        badgeColor: theme.badge
      };
    } else if (years <= 10) {
      return { 
        progress, theme,
        iconColor: 'text-green-600',
        numberColor: 'text-green-600',
        badgeText: 'På väg!',
        badgeColor: theme.badge
      };
    } else if (years <= 20) {
      return { 
        progress, theme,
        iconColor: 'text-orange-600',
        numberColor: 'text-orange-600',
        badgeText: 'Bra start!',
        badgeColor: theme.badge
      };
    } else {
      return { 
        progress, theme,
        iconColor: 'text-amber-600',
        numberColor: 'text-orange-600',
        badgeText: 'Början av resan',
        badgeColor: theme.badge
      };
    }
  }, [fireResult, isLocked]);

  // Visa låst version om nivå < 3
  if (isLocked) {
    // Beräkna grundläggande värden för simulatorn även när det är låst
    const averageAge = persons.length > 0 
      ? Math.round(persons.reduce((sum, p) => {
          const age = new Date().getFullYear() - p.birth_year;
          return sum + age;
        }, 0) / persons.length)
      : 40;
    
    const monthlySavingsTotal = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    const amortizationMonthly = calculateAmortizationMonthly(liabilities);
    
    // Beräkna tillgänglig/pension delning från assets (använd fireResult om tillgängligt)
    const availableAtStart = fireResult?.availableAtStart ?? 0;
    
    // Skapa en enkel fireResult för simulatorn
    const defaultFireResult: FIREResult = fireResult || {
      isAchievable: false,
      yearsToFire: null,
      estimatedAge: averageAge + 40,
      portfolioAtFire: 0,
      requiredAtPension: 0,
      availableAtStart,
      statePensionAtStart: 0,
      currentMonthlyExpenses: 0,
      warnings: [],
      realReturnAvailable: 0.05,
      realReturnStatePension: 0.01
    };

    return (
      <>
      <Card className="relative overflow-hidden opacity-60">
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Ekonomisk frihet
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  baserat på FIRE-principer
                </p>
              </div>
            </div>
            {!isLevelZero && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/fire')}
                className="h-8 w-8 p-0 hover:bg-white/60 rounded-lg"
              >
                <Info className="w-4 h-4 text-gray-600" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Lock className="w-6 h-6" />
            <span className="text-lg font-medium">Lås upp på Nivå 3 (≥ 1 000 000 kr)</span>
          </div>
          <p className="text-sm text-gray-600">
            Ekonomisk frihet aktiveras när du når Restaurangfrihet och ekonomisk trygghet.
          </p>
          {!isLevelZero && (
            <p className="text-xs text-gray-500 mt-2">
              Nivå 1-2 handlar om att bygga buffert och grundläggande trygghet. Fokusera på att skapa en ekonomisk säkerhetsmarginal här.
            </p>
          )}
          <Badge variant="secondary" className="text-xs">
            Baserat på din nettoförmögenhet
          </Badge>
          
          {/* Information om simulatorn */}
          {!isLevelZero && (
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/60 shadow-sm mt-4">
              <p className="text-xs font-semibold text-gray-900 mb-2">I simulatorn kan du:</p>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside ml-1">
                <li>Se interaktiv graf över din väg mot ekonomisk frihet</li>
                <li>Justera avkastning, inflation, utgifter och sparande</li>
                <li>Simulera Coast FIRE – deltidsarbete under bridge-perioden</li>
                <li>Se när kapitalet når 4 %-regeln och när uttag kan börja</li>
                <li>Testa olika scenarier med "vad händer om"-tänk</li>
              </ul>
            </div>
          )}
          
          {/* Visa simulator-knapp endast om inte nivå 0 */}
          {!isLevelZero && (
            <div className="pt-4">
              <Button
                onClick={() => router.push('/dashboard/fire')}
                className="w-full font-semibold transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Testa simulator
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Du kan testa simulatoren även innan du låser upp funktionen
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </>
    );
  }

  if (!fireResult) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Ekonomisk frihet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Beräknar din väg mot ekonomisk frihet...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Beräkna nuvarande ålder för persons
  const currentYear = new Date().getFullYear();
  const averageAge = persons.length > 0 
    ? Math.round(persons.reduce((sum, p) => {
        const age = currentYear - p.birth_year;
        return sum + age;
      }, 0) / persons.length)
    : 40;

  return (
    <>
    <Card className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${fireResult.isAchievable && fireResult.yearsToFire !== null ? progressInfo.theme.wrapper : 'bg-white'}`}>
      {/* Dekorativ bakgrund */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/60 backdrop-blur-sm ${progressInfo.iconColor === 'text-emerald-600' ? 'shadow-lg' : 'shadow'}`}>
              {fireResult.yearsToFire !== null && fireResult.yearsToFire <= 5 ? (
                <Sparkles className={`w-6 h-6 ${progressInfo.iconColor}`} />
              ) : (
                <TrendingUp className={`w-6 h-6 ${progressInfo.iconColor}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Ekonomisk frihet
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                baserat på FIRE-principer
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/fire')}
            className="h-8 w-8 p-0 hover:bg-white/60 rounded-lg"
          >
            <Info className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-5">
        {fireResult.isAchievable && fireResult.yearsToFire !== null ? (
          <>
            {/* Badge och progress */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${progressInfo.badgeColor} backdrop-blur-sm shadow-sm`}>
                {progressInfo.badgeText}
              </span>
              {fireResult.yearsToFire <= 10 && (
                <div className={`flex items-center gap-1 text-xs ${progressInfo.numberColor}`}>
                  <Zap className={`w-3 h-3 ${progressInfo.numberColor}`} />
                  <span>{Math.round(progressInfo.progress * 100)}% av vägen</span>
                </div>
              )}
            </div>

            {/* Progress bar - always visible */}
            <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${progressInfo.theme.bar}`}
                style={{ width: `${Math.min(progressInfo.progress * 100, 100)}%` }}
              />
            </div>

            {/* Stort årstal */}
            <div className="text-center py-3">
              <div className={`text-6xl md:text-7xl font-extrabold mb-1 ${progressInfo.numberColor} drop-shadow-md tracking-tight`}>
                {fireResult.yearsToFire}
              </div>
              <div className={`text-3xl font-bold ${progressInfo.numberColor === 'text-emerald-600' ? 'text-emerald-700' : progressInfo.numberColor === 'text-green-600' ? 'text-green-700' : 'text-gray-700'} mb-3`}>
                {fireResult.yearsToFire === 1 ? 'år' : 'år'}
              </div>
              {fireResult.yearsToFire === 0 ? (
                <p className="text-base font-semibold text-emerald-700 mb-1 text-center">
                  Du når ekonomisk frihet enligt dina antaganden – grymt jobbat!
                  <span className="block text-sm font-normal text-emerald-800/80">nu kan du leva på avkastningen utan att behöva arbeta</span>
                </p>
              ) : (
                <p className="text-base font-semibold text-gray-800 mb-1 text-center">
                  tills du tidigast kan vara ekonomiskt oberoende
                  <span className="block text-sm font-normal text-gray-600">om förutsättningarna förblir oförändrade från idag</span>
                </p>
              )}
              <p className="text-xs text-gray-500">
                vid {fireResult.estimatedAge} år • genomsnittlig ålder i hushållet
              </p>
              <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50/50 rounded-lg p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong className="text-amber-900">Viktigt:</strong> Beräkningen förutsätter uttag från 55 år och använder genomsnittliga avkastningar. Börsen är oförutsägbar och verktyget garanterar inget. Om du planerar FIRE, gör egna beräkningar med dina förutsättningar.
                </p>
                <p className="text-xs text-amber-800 leading-relaxed mt-2">
                  Beräkningen är en simulering baserad på 4 %-regeln och dina antaganden om avkastning och utgifter – inte en garanti eller personlig rekommendation.
                </p>
              </div>
            </div>
            
            {/* Förklarande ruta / firande */}
            {fireResult.yearsToFire === 0 ? (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-md">
                <p className="text-sm text-emerald-900 leading-relaxed">
                  🎉 <strong>Stort grattis!</strong> Din portfölj bedöms kunna täcka dina utgifter med rimliga antaganden. Nu handlar det om att bevara friheten: håll en sund uttagsnivå, ha buffert och låt avkastningen göra jobbet.
                </p>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-md">
                <p className="text-sm text-gray-800 leading-relaxed">
                  <strong className="text-gray-900">Vad betyder det?</strong> När du enligt denna modell är ekonomiskt oberoende skulle ditt kapital kunna täcka dina beräknade utgifter utan arbete, givet antagandena ovan. Det är en teoretisk simulering – inte en uppmaning att sluta arbeta. Modellen visar en <strong className="text-gray-900">teoretisk frihet att välja</strong> hur du vill leva – oavsett om det är att sluta jobba, byta karriär, eller ha trygghet i vardagen.
                </p>
              </div>
            )}
            
            {/* Finansiella nyckeltal - snyggare layout */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-md hover:shadow-lg transition-shadow relative tooltip-container ${showExpensesTooltip ? 'z-50' : ''}`}>
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-xs text-gray-600 font-medium">Utgifter/mån</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExpensesTooltip(!showExpensesTooltip);
                      setShowPortfolioTooltip(false);
                    }}
                    className="cursor-help focus:outline-none"
                    aria-label="Visa förklaring"
                  >
                    <Info className="w-3 h-3 text-gray-400 flex-shrink-0 hover:text-gray-600 transition-colors" />
                  </button>
                </div>
                {showExpensesTooltip && (
                  <div className="absolute z-50 top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs text-gray-700">
                    <p className="font-medium mb-1">Hur beräknas utgifter?</p>
                    <p>Beräknas som: Nettoinkomst - (Sparande + Amortering). Detta värde är en uppskattning baserad på dina registrerade inkomster och sparande.</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExpensesTooltip(false);
                      }}
                      className="mt-2 text-primary hover:text-primary/80 text-xs font-medium"
                    >
                      Stäng
                    </button>
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">{formatCurrency(fireResult.currentMonthlyExpenses)}</p>
                {/* Varning om orimligt låga utgifter */}
                {fireResult.currentMonthlyExpenses > 0 && fireResult.currentMonthlyExpenses < 5000 && (
                  <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      ⚠️ <strong>Låga utgifter:</strong> Dina beräknade utgifter verkar orimligt låga. Kontrollera att allt stämmer under <button onClick={() => router.push('/household')} className="underline font-semibold text-amber-900 hover:text-amber-700">Redigera hushåll</button>.
                    </p>
                  </div>
                )}
              </div>
              <div className={`bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-md hover:shadow-lg transition-shadow relative tooltip-container ${showPortfolioTooltip ? 'z-50' : ''}`}>
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-xs text-gray-600 font-medium">Portfölj vid frihet</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPortfolioTooltip(!showPortfolioTooltip);
                      setShowExpensesTooltip(false);
                    }}
                    className="cursor-help focus:outline-none"
                    aria-label="Visa förklaring"
                  >
                    <Info className="w-3 h-3 text-gray-400 flex-shrink-0 hover:text-gray-600 transition-colors" />
                  </button>
                </div>
                {showPortfolioTooltip && (
                  <div className="absolute z-50 top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs text-gray-700">
                    <p className="font-medium mb-1">Vad är portfölj vid frihet?</p>
                    <p>Det tillgängliga kapitalet (exkl. pension) som du behöver vid ekonomisk frihet för att täcka utgifter fram till pension. Detta är beloppet du behöver ha investerat när du slutar jobba.</p>
                    <p className="mt-2 pt-2 border-t border-gray-200">
                      <strong>Bostad:</strong> I Förmögenhetskollens modell räknas 40 % av bostadens nettovärde som tillgängligt kapital, eftersom allt bostadskapital inte alltid är lätt att frigöra. Avkastningen på tillgängligt kapital beräknas med hänsyn till nettovärden (tillgångar minus relaterade skulder) och proportionell fördelning av övriga skulder.
                    </p>
                    {fireResult?.statePensionAnnualIncome && fireResult.statePensionAnnualIncome > 0 && (
                      <p className="mt-2 pt-2 border-t border-gray-200">
                        <strong>Statlig pension (inkomstpension):</strong> {formatCurrency(fireResult.statePensionAnnualIncome / 12)}/mån från lägsta uttagsålder för din födelseårskull (ca 63 år idag) utbetalas som inkomst och minskar därför behovet av kapital vid pension. Den statliga pensionen växer fram till pensionsstart och utbetalas sedan över flera år (utbetalningstid kan variera beroende på val och regelverk).
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPortfolioTooltip(false);
                      }}
                      className="mt-2 text-primary hover:text-primary/80 text-xs font-medium"
                    >
                      Stäng
                    </button>
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">{formatCurrency(portfolioAtFire)}</p>
                {fireResult?.statePensionAnnualIncome && fireResult.statePensionAnnualIncome > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    + Statlig pension: {formatCurrency(fireResult.statePensionAnnualIncome / 12)}/mån från lägsta uttagsålder (ca 63 år idag)
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-gray-600 mb-2">Fler år kvar</div>
            <div className="text-sm text-gray-500 mb-4">
              <p>Ekonomisk frihet är inte uppnåelig med nuvarande antaganden.</p>
              {fireResult.warnings.length > 0 && (
                <p className="mt-2 text-xs text-red-600">{fireResult.warnings[0]}</p>
              )}
            </div>
            <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 text-left shadow-sm">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>Tips:</strong> Öka sparandet, sänk utgifterna, eller justera dina antaganden om avkastning för att se hur det påverkar din väg mot ekonomisk frihet.
              </p>
            </div>
          </div>
        )}
        
        {/* Information om simulatorn */}
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/60 shadow-sm">
          <p className="text-xs font-semibold text-gray-900 mb-2">I simulatorn kan du:</p>
          <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside ml-1">
            <li>Se interaktiv graf över din väg mot ekonomisk frihet</li>
            <li>Justera avkastning, inflation, utgifter och sparande</li>
            <li>Simulera Coast FIRE – deltidsarbete under bridge-perioden</li>
            <li>Se när kapitalet når 4%-regeln och när uttag kan börja</li>
            <li>Testa olika scenarier med "vad händer om"-tänk</li>
          </ul>
        </div>
        
        {/* CTA-knapp - mer lockande */}
        <div className="pt-2">
          <Button
            onClick={() => router.push('/dashboard/fire')}
            variant={progressInfo.theme.ctaVariant}
            className={`w-full font-semibold transition-all duration-300 ${progressInfo.theme.ctaClass} shadow-card hover:shadow-lg`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Visa simulator
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

