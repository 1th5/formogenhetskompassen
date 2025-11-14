'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { Person, Asset } from '@/lib/types';
import { 
  calculateOccupationalPensionMonthlyAllocations,
  calculatePremiePensionMonthlyAllocations,
  calculatePrivatePensionMonthlyAllocations,
  calculatePublicPensionMonthlyAllocations,
  calculateOccupationalPension,
  calculatePremiePension,
  calculateIncomePension
} from '@/lib/wealth/calc';
import { 
  TrendingUp, 
  Lock, 
  Info, 
  ChevronRight,
  Building2,
  PiggyBank,
  Landmark,
  Wallet
} from 'lucide-react';
import { getDefaultReturnRate } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';

interface PensionOverviewCardProps {
  assets: Asset[];
  persons: Person[];
  isLocked?: boolean;
}

interface PensionTypeData {
  label: string;
  icon: React.ReactNode;
  currentValue: number;
  monthlyContribution: number;
  futureValueAt67: number;
  color: string;
  bgColor: string;
  returnInfo: string;
  usedRiskAdjustment: boolean;
}

// Konvertera årlig avkastning till månatlig (geometrisk)
function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1/12) - 1;
}

// Beräkna framtida värde med ränta-på-ränta
function calculateFutureValue(
  currentValue: number,
  monthlyContribution: number,
  monthlyReturn: number,
  months: number
): number {
  if (months <= 0) return currentValue;
  
  // FV = PV * (1 + r)^n + PMT * (((1 + r)^n - 1) / r)
  // där PV = currentValue, PMT = monthlyContribution, r = monthlyReturn, n = months
  const futureValueOfPrincipal = currentValue * Math.pow(1 + monthlyReturn, months);
  const futureValueOfContributions = monthlyContribution > 0 && monthlyReturn > 0
    ? monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn)
    : monthlyContribution * months; // Om ingen avkastning, bara summan
  
  return futureValueOfPrincipal + futureValueOfContributions;
}

// Beräkna framtida värde med riskjustering för åren 60-67
// Om snittålder < 65 och avkastning > 5%, använd max 4% för åren 60-67
// Om useInflationAdjustment är true, använd real avkastning (avkastning - 2% inflation)
function calculateFutureValueWithRiskAdjustment(
  currentValue: number,
  monthlyContribution: number,
  annualReturn: number,
  averageAge: number,
  useInflationAdjustment: boolean = false,
  targetAge: number = 67
): { futureValue: number; usedRiskAdjustment: boolean; returnInfo: string } {
  const INFLATION_RATE = 0.02; // 2% inflation
  const RISK_ADJUSTMENT_START_AGE = 60;
  const RISK_ADJUSTMENT_END_AGE = 67;
  const RISK_ADJUSTED_RETURN = 0.04; // 4% nominell avkastning under riskjustering
  
  // Om inflationsjustering är aktiverad, använd real avkastning
  const effectiveReturn = useInflationAdjustment 
    ? annualReturn - INFLATION_RATE 
    : annualReturn;
    
  if (averageAge >= targetAge) {
    const returnText = useInflationAdjustment 
      ? `${(effectiveReturn * 100).toFixed(1)} % per år (real, efter 2 % inflation)`
      : `${(annualReturn * 100).toFixed(1)} % per år (nominell)`;
    return {
      futureValue: currentValue,
      usedRiskAdjustment: false,
      returnInfo: returnText
    };
  }

  const monthsToTarget = (targetAge - averageAge) * 12;
  if (monthsToTarget <= 0) {
    const returnText = useInflationAdjustment 
      ? `${(effectiveReturn * 100).toFixed(1)} % per år (real, efter 2 % inflation)`
      : `${(annualReturn * 100).toFixed(1)} % per år (nominell)`;
    return {
      futureValue: currentValue,
      usedRiskAdjustment: false,
      returnInfo: returnText
    };
  }

  // Kontrollera om riskjustering ska användas
  // Riskjustering: snittålder < 65 OCH avkastning > 5% OCH vi kommer att passera åldersintervallet 60-67
  const willPassRiskAdjustmentPeriod = averageAge < RISK_ADJUSTMENT_END_AGE && targetAge > RISK_ADJUSTMENT_START_AGE;
  const shouldAdjustRisk = averageAge < 65 && annualReturn > 0.05 && willPassRiskAdjustmentPeriod;
  
  // Använd max 4% (eller 2% real om inflationsjustering) för riskjustering
  const adjustedReturnNominal = Math.min(annualReturn, RISK_ADJUSTED_RETURN); // Max 4%
  const adjustedReturnEffective = useInflationAdjustment 
    ? adjustedReturnNominal - INFLATION_RATE 
    : adjustedReturnNominal;

  if (!shouldAdjustRisk) {
    // Ingen riskjustering, använd normal beräkning
    const monthlyReturn = annualToMonthlyRate(effectiveReturn);
    const returnText = useInflationAdjustment 
      ? `${(effectiveReturn * 100).toFixed(1)} % per år (real, efter 2 % inflation)`
      : `${(annualReturn * 100).toFixed(1)} % per år (nominell)`;
    return {
      futureValue: calculateFutureValue(currentValue, monthlyContribution, monthlyReturn, monthsToTarget),
      usedRiskAdjustment: false,
      returnInfo: returnText
    };
  }

  // Beräkna i två faser:
  // 1. Fram till 60 år: normal avkastning
  // 2. 60-67 år: max 4% avkastning (eller 2% real om inflationsjustering)
  
  const monthsTo60 = Math.max(0, (RISK_ADJUSTMENT_START_AGE - averageAge) * 12);
  const monthsFrom60To67 = Math.max(0, monthsToTarget - monthsTo60);

  const monthlyReturnNormal = annualToMonthlyRate(effectiveReturn);
  const monthlyReturnAdjusted = annualToMonthlyRate(adjustedReturnEffective);

  // Fas 1: Fram till 60 år med normal avkastning
  let value = currentValue;
  if (monthsTo60 > 0) {
    value = calculateFutureValue(currentValue, monthlyContribution, monthlyReturnNormal, monthsTo60);
  }

  // Fas 2: 60-67 år med max 4% avkastning
  if (monthsFrom60To67 > 0) {
    value = calculateFutureValue(value, monthlyContribution, monthlyReturnAdjusted, monthsFrom60To67);
  }

  const returnText = useInflationAdjustment
    ? `${(effectiveReturn * 100).toFixed(1)} % per år (real) fram till 60 år, sedan max ${(adjustedReturnEffective * 100).toFixed(1)} % per år (real, riskjustering 60-67)`
    : `${(annualReturn * 100).toFixed(1)} % per år fram till 60 år, sedan max ${(adjustedReturnNominal * 100).toFixed(1)} % per år (riskjustering 60-67)`;

  return {
    futureValue: value,
    usedRiskAdjustment: true,
    returnInfo: returnText
  };
}

export default function PensionOverviewCard({ assets, persons, isLocked = false }: PensionOverviewCardProps) {
  const router = useRouter();
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [showAllCalculations, setShowAllCalculations] = useState(false);
  const [animatedTotalValue, setAnimatedTotalValue] = useState(0);
  const [allCalculationsData, setAllCalculationsData] = useState<{
    totalAt67: number;
    monthlyPayout: number;
    usedRiskAdjustment: boolean;
  } | null>(null);
  
  // Hämta inflationsjustering och pensionsår från store
  const useInflationAdjustment = useHouseholdStore((state) => state.useInflationAdjustment);
  const setUseInflationAdjustment = useHouseholdStore((state) => state.setUseInflationAdjustment);
  const pensionAge = useHouseholdStore((state) => state.pensionAge);
  const setPensionAge = useHouseholdStore((state) => state.setPensionAge);

  // Beräkna genomsnittlig ålder
  const averageAge = useMemo(() => {
    if (!persons || persons.length === 0) return 67;
    const currentYear = new Date().getFullYear();
    const totalAge = persons.reduce((sum, person) => {
      return sum + (currentYear - person.birth_year);
    }, 0);
    return Math.round(totalAge / persons.length);
  }, [persons]);

  // Beräkna månader till valt pensionsår
  const monthsToPensionAge = useMemo(() => {
    return Math.max(0, (pensionAge - averageAge) * 12);
  }, [averageAge, pensionAge]);

  // Dölj beräkningar när inflationsjustering eller pensionsår ändras
  useEffect(() => {
    setExpandedType(null);
    setShowAllCalculations(false);
    setAllCalculationsData(null);
    setAnimatedValues({});
    setAnimatedTotalValue(0);
  }, [useInflationAdjustment, pensionAge]);

  // Beräkna nuvarande värden per pensionstyp
  const pensionData = useMemo(() => {
    // Tjänstepension
    const occPensionAssets = assets
      .filter(a => a.category === 'Tjänstepension')
      .reduce((sum, a) => sum + a.value, 0);
    const occPensionContrib = calculateOccupationalPensionMonthlyAllocations(persons);
    const occPensionReturn = getDefaultReturnRate('Tjänstepension');
    const occPensionCalc = calculateFutureValueWithRiskAdjustment(
      occPensionAssets,
      occPensionContrib,
      occPensionReturn,
      averageAge,
      useInflationAdjustment,
      pensionAge
    );
    const occPensionFuture = occPensionCalc.futureValue;

    // Premiepension
    const premiePensionAssets = assets
      .filter(a => a.category === 'Premiepension')
      .reduce((sum, a) => sum + a.value, 0);
    const premiePensionContrib = calculatePremiePensionMonthlyAllocations(persons);
    const premiePensionReturn = getDefaultReturnRate('Premiepension');
    const premiePensionCalc = calculateFutureValueWithRiskAdjustment(
      premiePensionAssets,
      premiePensionContrib,
      premiePensionReturn,
      averageAge,
      useInflationAdjustment,
      pensionAge
    );
    const premiePensionFuture = premiePensionCalc.futureValue;

    // IPS
    const ipsAssets = assets
      .filter(a => a.category === 'Privat pensionssparande (IPS)')
      .reduce((sum, a) => sum + a.value, 0);
    const ipsContrib = calculatePrivatePensionMonthlyAllocations(persons);
    const ipsReturn = getDefaultReturnRate('Privat pensionssparande (IPS)');
    const ipsCalc = calculateFutureValueWithRiskAdjustment(
      ipsAssets,
      ipsContrib,
      ipsReturn,
      averageAge,
      useInflationAdjustment,
      pensionAge
    );
    const ipsFuture = ipsCalc.futureValue;

    // Statlig pension (inkomstpension)
    const statePensionAssets = assets
      .filter(a => a.category === 'Trygghetsbaserad pension (Statlig)')
      .reduce((sum, a) => sum + a.value, 0);
    const statePensionContrib = calculatePublicPensionMonthlyAllocations(persons);
    const statePensionReturn = getDefaultReturnRate('Trygghetsbaserad pension (Statlig)');
    const statePensionCalc = calculateFutureValueWithRiskAdjustment(
      statePensionAssets,
      statePensionContrib,
      statePensionReturn,
      averageAge,
      useInflationAdjustment,
      pensionAge
    );
    const statePensionFuture = statePensionCalc.futureValue;

    return {
      occupational: {
        label: 'Tjänstepension',
        icon: <Building2 className="w-5 h-5" />,
        currentValue: occPensionAssets,
        monthlyContribution: occPensionContrib,
        futureValueAt67: occPensionFuture, // Note: actually uses pensionAge
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        returnInfo: occPensionCalc.returnInfo,
        usedRiskAdjustment: occPensionCalc.usedRiskAdjustment
      },
      premie: {
        label: 'Premiepension',
        icon: <Landmark className="w-5 h-5" />,
        currentValue: premiePensionAssets,
        monthlyContribution: premiePensionContrib,
        futureValueAt67: premiePensionFuture, // Note: actually uses pensionAge
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        returnInfo: premiePensionCalc.returnInfo,
        usedRiskAdjustment: premiePensionCalc.usedRiskAdjustment
      },
      ips: {
        label: 'IPS',
        icon: <PiggyBank className="w-5 h-5" />,
        currentValue: ipsAssets,
        monthlyContribution: ipsContrib,
        futureValueAt67: ipsFuture, // Note: actually uses pensionAge
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        returnInfo: ipsCalc.returnInfo,
        usedRiskAdjustment: ipsCalc.usedRiskAdjustment
      },
      state: {
        label: 'Statlig pension',
        icon: <Wallet className="w-5 h-5" />,
        currentValue: statePensionAssets,
        monthlyContribution: statePensionContrib,
        futureValueAt67: statePensionFuture, // Note: actually uses pensionAge
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        returnInfo: statePensionCalc.returnInfo,
        usedRiskAdjustment: statePensionCalc.usedRiskAdjustment
      }
    };
  }, [assets, persons, averageAge, useInflationAdjustment, pensionAge]);

  // Animation för framtida värden
  useEffect(() => {
    if (expandedType && pensionData[expandedType as keyof typeof pensionData]) {
      const targetValue = pensionData[expandedType as keyof typeof pensionData].futureValueAt67;
      const duration = 2000; // 2 sekunder
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Ease-out animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = targetValue * easedProgress;
        
        setAnimatedValues(prev => ({
          ...prev,
          [expandedType]: currentValue
        }));

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedValues(prev => ({
            ...prev,
            [expandedType]: targetValue
          }));
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [expandedType, pensionData]);

  // Hämta pensionsavtal per person
  const pensionAgreements = useMemo(() => {
    const agreements: Record<string, string[]> = {};
    persons.forEach(person => {
      const personAgreements: string[] = [];
      person.incomes?.forEach(income => {
        if (income.income_type === 'job' && income.pension_type) {
          personAgreements.push(income.pension_type);
        }
      });
      if (personAgreements.length > 0) {
        agreements[person.name] = [...new Set(personAgreements)];
      }
    });
    return agreements;
  }, [persons]);

  // Beräkna per person (diskret)
  const perPersonData = useMemo(() => {
    return persons.map(person => {
      const personName = person.name;
      const personAge = new Date().getFullYear() - person.birth_year;
      
      // Hitta tillgångar för denna person (baserat på label som innehåller personens namn)
      const personAssets = assets.filter(asset => {
        const assetLabel = asset.label || '';
        return assetLabel.includes(personName);
      });

      // Gruppera tillgångar per typ
      const occAssets = personAssets
        .filter(a => a.category === 'Tjänstepension')
        .reduce((sum, a) => sum + a.value, 0);
      const premieAssets = personAssets
        .filter(a => a.category === 'Premiepension')
        .reduce((sum, a) => sum + a.value, 0);
      const ipsAssets = personAssets
        .filter(a => a.category === 'Privat pensionssparande (IPS)')
        .reduce((sum, a) => sum + a.value, 0);
      const stateAssets = personAssets
        .filter(a => a.category === 'Trygghetsbaserad pension (Statlig)')
        .reduce((sum, a) => sum + a.value, 0);

      // Beräkna avsättningar per person
      const occContrib = calculateOccupationalPension(person);
      const premieContrib = calculatePremiePension(person);
      const ipsContrib = person.ips_monthly || 0;
      // Statlig pensionsavsättning beräknas från lön
      const stateContrib = calculateIncomePension(person);

      return {
        name: personName,
        age: personAge,
        assets: {
          occupational: occAssets,
          premie: premieAssets,
          ips: ipsAssets,
          state: stateAssets
        },
        contributions: {
          occupational: occContrib,
          premie: premieContrib,
          ips: ipsContrib,
          state: stateContrib
        },
        agreements: pensionAgreements[personName] || []
      };
    });
  }, [persons, assets, pensionAgreements]);

  const totalCurrent = Object.values(pensionData).reduce((sum, p) => sum + p.currentValue, 0);
  const totalMonthly = Object.values(pensionData).reduce((sum, p) => sum + p.monthlyContribution, 0);

  if (isLocked) {
    return (
      <Card className="relative overflow-visible border-0 shadow-lg opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
              <Wallet className="w-5 h-5 text-primary/60" />
            </div>
            <span>Pensionstillgångar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-6 h-6" />
              <span className="text-lg font-medium">Lås upp på Nivå 1</span>
            </div>
            <p className="text-sm text-gray-600">
              För att se din pensionsöversikt behöver du först skapa ett hushåll med minst en person.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-visible border-0 shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Pensionstillgångar
              </CardTitle>
              <p className="text-xs text-gray-600 mt-0.5">
                Din framtida trygghet
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/pension/info')}
            className="text-xs text-primary/70 hover:text-primary"
          >
            <Info className="w-4 h-4 mr-1" />
            Läs mer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        {/* Totalt */}
        <div className="text-center pb-4 border-b border-slate-200">
          <p className="text-xs text-primary/60 mb-1">Totalt idag</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {formatCurrency(totalCurrent)}
          </p>
          <p className="text-xs text-primary/60 mt-2">
            + {formatCurrency(totalMonthly)}/mån
          </p>
        </div>

        {/* Pensionsår reglage */}
        <div className="p-3 bg-white/60 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-primary/60" />
            <p className="text-sm font-medium text-gray-900">Pensionsår för beräkningar</p>
          </div>
          <SegmentedControl
            options={[
              { 
                value: 63, 
                label: '63 år',
                disabled: averageAge >= 63
              },
              { 
                value: 65, 
                label: '65 år',
                disabled: averageAge >= 65
              },
              { 
                value: 67, 
                label: '67 år',
                disabled: averageAge >= 67
              }
            ]}
            value={pensionAge}
            onChange={(age) => {
              setPensionAge(age);
            }}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-2">
            Alla beräkningar använder detta pensionsår
          </p>
        </div>

        {/* Inflationsjustering switch */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary/60" />
            <div>
              <p className="text-sm font-medium text-gray-900">Inflationsjustering</p>
              <p className="text-xs text-gray-600">
                {useInflationAdjustment 
                  ? 'Räknar med real avkastning (avkastning - 2 % inflation)'
                  : 'Räknar med nominell avkastning'}
              </p>
            </div>
          </div>
          <Switch
            checked={useInflationAdjustment}
            onCheckedChange={(checked) => {
              setUseInflationAdjustment(checked);
            }}
          />
        </div>

        {/* Knapp för att beräkna alla */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const totalAt67 = Object.values(pensionData).reduce((sum, p) => sum + p.futureValueAt67, 0);
              const usedRiskAdjustment = Object.values(pensionData).some(p => p.usedRiskAdjustment);
              
              // Beräkna månadsutbetalning över 25 år (300 månader)
              // Använd enkel formel: totalAt67 / 300 (ingen avkastning under utbetalning för enkelhet)
              const monthlyPayout = totalAt67 / 300;
              
              const willShow = !showAllCalculations;
              
              setAllCalculationsData({
                totalAt67,
                monthlyPayout,
                usedRiskAdjustment
              });
              setShowAllCalculations(willShow);
              
              // Starta animation för totalen när vi visar beräkningen
              if (willShow) {
                setAnimatedTotalValue(0);
                // Använd setTimeout för att säkerställa att state har uppdaterats
                setTimeout(() => {
                  const duration = 2000; // 2 sekunder
                  const steps = 60;
                  const stepDuration = duration / steps;
                  let currentStep = 0;

                  const interval = setInterval(() => {
                    currentStep++;
                    const progress = currentStep / steps;
                    // Ease-out animation
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    const currentValue = totalAt67 * easedProgress;
                    
                    setAnimatedTotalValue(currentValue);

                    if (currentStep >= steps) {
                      clearInterval(interval);
                      setAnimatedTotalValue(totalAt67);
                    }
                  }, stepDuration);
                }, 10);
              } else {
                setAnimatedTotalValue(0);
              }
            }}
            className="text-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {showAllCalculations ? 'Dölj' : `Beräkna alla tillgångar vid ${pensionAge}`}
          </Button>
        </div>

        {/* Visa totalberäkning */}
        {showAllCalculations && allCalculationsData && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg p-4 border border-primary/30">
            <p className="text-sm font-semibold text-primary mb-3 text-center">Total pensionstillgång vid {pensionAge} års ålder</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary text-center mb-4">
              {formatCurrency(animatedTotalValue || 0)}
            </p>
            {useInflationAdjustment && (
              <p className="text-xs text-primary/70 text-center mb-2">
                (Real värde, efter 2 % inflation)
              </p>
            )}
            <div className="bg-white/60 rounded-lg p-4 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Månadsutbetalning över 25 år</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(allCalculationsData.monthlyPayout)}/mån
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Om totalbeloppet fördelas jämnt över 25 år (300 månader)
              </p>
            </div>
            {allCalculationsData.usedRiskAdjustment && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>ℹ️ Antagande:</strong> För tillgångar med avkastning över 5 % har vi begränsat avkastningen till max 4 % per år för åren 60-67 för att minska risken närmare pension (gäller när hushållets snittålder är under 65 år).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pensionstyper */}
        <div className="space-y-3">
          {(Object.keys(pensionData) as Array<keyof typeof pensionData>).map((key) => {
            const data = pensionData[key];
            const isExpanded = expandedType === key;
            const animatedValue = animatedValues[key] || 0;

            return (
              <div
                key={key}
                className={`border rounded-lg p-3 transition-all ${
                  isExpanded ? 'border-primary/30 shadow-md' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${data.bgColor}`}>
                      <div className={data.color}>{data.icon}</div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{data.label}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(data.currentValue)} • Beräknad månadsvis pensionsrätt: +{formatCurrency(data.monthlyContribution)}/mån (tilldelas årligen)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedType(isExpanded ? null : key)}
                    className="text-xs"
                  >
                    {isExpanded ? 'Dölj' : `Visa vid ${pensionAge}`}
                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 text-center">
                      <p className="text-xs text-primary/70 mb-1">Uppskattat värde vid {pensionAge} års ålder</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {formatCurrency(animatedValue)}
                      </p>
                      <p className="text-xs text-primary/60 mt-2">
                        Baserat på {monthsToPensionAge} månader med {data.returnInfo}
                      </p>
                      {data.usedRiskAdjustment && (
                        <div className="mt-2 pt-2 border-t border-primary/20">
                          <p className="text-xs text-primary/70 italic">
                            ℹ️ Modellantagande: För att minska risken begränsar Förmögenhetskollen avkastningen till max 4 % per år för åren 60-67
                          </p>
                        </div>
                      )}
                      {key === 'state' && (
                        <div className="mt-2 pt-2 border-t border-primary/20">
                          <p className="text-xs text-primary/70 italic">
                            (Inkomstpension är inte en fonderad tillgång utan en intjänad rättighet. Beräkningen här är en förenklad uppskattning.)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Per person */}
        {perPersonData.length > 0 && (
          <div className="pt-4 border-t border-slate-200/60">
            <p className="text-sm font-semibold text-gray-900 mb-3">Per person</p>
            <div className="space-y-3">
              {perPersonData.map((person, idx) => {
                const hasAnyPension = 
                  person.assets.occupational > 0 || 
                  person.assets.premie > 0 || 
                  person.assets.ips > 0 || 
                  person.assets.state > 0 ||
                  person.contributions.occupational > 0 || 
                  person.contributions.premie > 0 || 
                  person.contributions.ips > 0 ||
                  person.contributions.state > 0;
                
                if (!hasAnyPension) return null;
                
                // Samla alla pensionstyper med data
                const pensionTypes = [
                  { 
                    key: 'occupational', 
                    label: 'Tjänstepension', 
                    icon: <Building2 className="w-4 h-4" />,
                    asset: person.assets.occupational,
                    contribution: person.contributions.occupational,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                  },
                  { 
                    key: 'premie', 
                    label: 'Premiepension', 
                    icon: <Landmark className="w-4 h-4" />,
                    asset: person.assets.premie,
                    contribution: person.contributions.premie,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-50'
                  },
                  { 
                    key: 'ips', 
                    label: 'IPS', 
                    icon: <PiggyBank className="w-4 h-4" />,
                    asset: person.assets.ips,
                    contribution: person.contributions.ips,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                  },
                  { 
                    key: 'state', 
                    label: 'Statlig pension', 
                    icon: <Wallet className="w-4 h-4" />,
                    asset: person.assets.state,
                    contribution: person.contributions.state,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50'
                  }
                ].filter(pt => pt.asset > 0 || pt.contribution > 0);
                
                return (
                  <div key={idx} className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl p-3 sm:p-4 border border-slate-200/60 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">
                        {person.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {person.agreements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {person.agreements.map((agreement, aidx) => (
                              <Badge 
                                key={aidx} 
                                variant="outline" 
                                className="text-xs bg-white/80 border-slate-300/60 text-gray-700 font-medium px-2 py-0.5"
                              >
                                {agreement}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{person.age} år</span>
                      </div>
                    </div>
                    
                    {/* Pensionstyper - kompakt grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pensionTypes.map((pt) => (
                        <div 
                          key={pt.key} 
                          className={`${pt.bgColor} rounded-lg p-2.5 border border-slate-200/40`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={pt.color}>
                              {pt.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{pt.label}</span>
                          </div>
                          {pt.asset > 0 && (
                            <p className="text-xs text-gray-600 mb-0.5">
                              <span className="font-semibold text-gray-900">{formatCurrency(pt.asset)}</span>
                            </p>
                          )}
                          {pt.contribution > 0 && (
                            <p className="text-xs text-gray-600">
                              <span className="text-gray-500">+</span> <span className="font-medium text-gray-700">{formatCurrency(pt.contribution)}</span><span className="text-gray-500">/mån</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Varningstext */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-primary/60 leading-relaxed">
            <strong className="text-primary/70">Viktigt:</strong> Dessa beräkningar är förenklingar och baseras på antaganden om avkastning och framtida utveckling. 
            Tidigare utveckling på börsen är ingen garanti för framtida resultat. 
            Verkliga värden kan avvika betydligt beroende på marknadsutveckling, skatter, avgifter och förändringar i pensionssystemet.
            {useInflationAdjustment ? (
              <> Beräkningarna använder real avkastning (nominell avkastning minus 2 % inflation per år), vilket ger värden i dagens penningvärde. 
              Nominell avkastning skulle ge högre belopp men dessa skulle ha lägre köpkraft på grund av inflation.</>
            ) : (
              <> Beräkningarna använder nominell avkastning, vilket innebär att värdena inte är justerade för inflation. 
              För att se värden i dagens penningvärde, aktivera inflationsjustering.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

