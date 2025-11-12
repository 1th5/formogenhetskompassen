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

export default function PensionOverviewCard({ assets, persons, isLocked = false }: PensionOverviewCardProps) {
  const router = useRouter();
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Beräkna genomsnittlig ålder
  const averageAge = useMemo(() => {
    if (!persons || persons.length === 0) return 67;
    const currentYear = new Date().getFullYear();
    const totalAge = persons.reduce((sum, person) => {
      return sum + (currentYear - person.birth_year);
    }, 0);
    return Math.round(totalAge / persons.length);
  }, [persons]);

  // Beräkna månader till 67 års ålder
  const monthsTo67 = useMemo(() => {
    return Math.max(0, (67 - averageAge) * 12);
  }, [averageAge]);

  // Beräkna nuvarande värden per pensionstyp
  const pensionData = useMemo(() => {
    // Tjänstepension
    const occPensionAssets = assets
      .filter(a => a.category === 'Tjänstepension')
      .reduce((sum, a) => sum + a.value, 0);
    const occPensionContrib = calculateOccupationalPensionMonthlyAllocations(persons);
    const occPensionReturn = getDefaultReturnRate('Tjänstepension');
    const occPensionFuture = calculateFutureValue(
      occPensionAssets,
      occPensionContrib,
      annualToMonthlyRate(occPensionReturn),
      monthsTo67
    );

    // Premiepension
    const premiePensionAssets = assets
      .filter(a => a.category === 'Premiepension')
      .reduce((sum, a) => sum + a.value, 0);
    const premiePensionContrib = calculatePremiePensionMonthlyAllocations(persons);
    const premiePensionReturn = getDefaultReturnRate('Premiepension');
    const premiePensionFuture = calculateFutureValue(
      premiePensionAssets,
      premiePensionContrib,
      annualToMonthlyRate(premiePensionReturn),
      monthsTo67
    );

    // IPS
    const ipsAssets = assets
      .filter(a => a.category === 'Privat pensionssparande (IPS)')
      .reduce((sum, a) => sum + a.value, 0);
    const ipsContrib = calculatePrivatePensionMonthlyAllocations(persons);
    const ipsReturn = getDefaultReturnRate('Privat pensionssparande (IPS)');
    const ipsFuture = calculateFutureValue(
      ipsAssets,
      ipsContrib,
      annualToMonthlyRate(ipsReturn),
      monthsTo67
    );

    // Statlig pension (inkomstpension)
    const statePensionAssets = assets
      .filter(a => a.category === 'Trygghetsbaserad pension (Statlig)')
      .reduce((sum, a) => sum + a.value, 0);
    const statePensionContrib = calculatePublicPensionMonthlyAllocations(persons);
    const statePensionReturn = getDefaultReturnRate('Trygghetsbaserad pension (Statlig)');
    const statePensionFuture = calculateFutureValue(
      statePensionAssets,
      statePensionContrib,
      annualToMonthlyRate(statePensionReturn),
      monthsTo67
    );

    return {
      occupational: {
        label: 'Tjänstepension',
        icon: <Building2 className="w-5 h-5" />,
        currentValue: occPensionAssets,
        monthlyContribution: occPensionContrib,
        futureValueAt67: occPensionFuture,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      premie: {
        label: 'Premiepension',
        icon: <Landmark className="w-5 h-5" />,
        currentValue: premiePensionAssets,
        monthlyContribution: premiePensionContrib,
        futureValueAt67: premiePensionFuture,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      },
      ips: {
        label: 'IPS',
        icon: <PiggyBank className="w-5 h-5" />,
        currentValue: ipsAssets,
        monthlyContribution: ipsContrib,
        futureValueAt67: ipsFuture,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      state: {
        label: 'Statlig pension',
        icon: <Wallet className="w-5 h-5" />,
        currentValue: statePensionAssets,
        monthlyContribution: statePensionContrib,
        futureValueAt67: statePensionFuture,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      }
    };
  }, [assets, persons, monthsTo67]);

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
                        {formatCurrency(data.currentValue)} • +{formatCurrency(data.monthlyContribution)}/mån
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedType(isExpanded ? null : key)}
                    className="text-xs"
                  >
                    {isExpanded ? 'Dölj' : 'Visa vid 67'}
                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 text-center">
                      <p className="text-xs text-primary/70 mb-1">Uppskattat värde vid 67 års ålder</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {formatCurrency(animatedValue)}
                      </p>
                      <p className="text-xs text-primary/60 mt-2">
                        Baserat på {monthsTo67} månader med {((getDefaultReturnRate(
                          key === 'occupational' ? 'Tjänstepension' :
                          key === 'premie' ? 'Premiepension' :
                          key === 'ips' ? 'Privat pensionssparande (IPS)' :
                          'Trygghetsbaserad pension (Statlig)'
                        ) * 100).toFixed(1))}% årlig avkastning
                      </p>
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
            <p className="text-sm font-semibold text-gray-900 mb-4">Per person</p>
            <div className="space-y-4">
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
                
                return (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200/60">
                    <p className="font-semibold text-base text-gray-900 mb-3">
                      {person.name} ({person.age} år)
                    </p>
                    
                    {/* Tillgångar */}
                    {(person.assets.occupational > 0 || person.assets.premie > 0 || person.assets.ips > 0 || person.assets.state > 0) && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tillgångar</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                          {person.assets.occupational > 0 && (
                            <span className="font-medium">Tjänstepension: <span className="font-normal">{formatCurrency(person.assets.occupational)}</span></span>
                          )}
                          {person.assets.premie > 0 && (
                            <span className="font-medium">Premiepension: <span className="font-normal">{formatCurrency(person.assets.premie)}</span></span>
                          )}
                          {person.assets.ips > 0 && (
                            <span className="font-medium">IPS: <span className="font-normal">{formatCurrency(person.assets.ips)}</span></span>
                          )}
                          {person.assets.state > 0 && (
                            <span className="font-medium">Statlig pension: <span className="font-normal">{formatCurrency(person.assets.state)}</span></span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Avsättningar */}
                    {(person.contributions.occupational > 0 || person.contributions.premie > 0 || person.contributions.ips > 0 || person.contributions.state > 0) && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Avsättning/mån</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                          {person.contributions.occupational > 0 && (
                            <span className="font-medium">Tjänstepension: <span className="font-normal">{formatCurrency(person.contributions.occupational)}/mån</span></span>
                          )}
                          {person.contributions.premie > 0 && (
                            <span className="font-medium">Premiepension: <span className="font-normal">{formatCurrency(person.contributions.premie)}/mån</span></span>
                          )}
                          {person.contributions.ips > 0 && (
                            <span className="font-medium">IPS: <span className="font-normal">{formatCurrency(person.contributions.ips)}/mån</span></span>
                          )}
                          {person.contributions.state > 0 && (
                            <span className="font-medium">Statlig pension: <span className="font-normal">{formatCurrency(person.contributions.state)}/mån</span></span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pensionsavtal */}
                    {person.agreements.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60">
                        <p className="text-sm font-medium text-gray-700 mb-2">Pensionsavtal</p>
                        <div className="flex flex-wrap gap-2">
                          {person.agreements.map((agreement, aidx) => (
                            <Badge 
                              key={aidx} 
                              variant="outline" 
                              className="text-sm bg-slate-50/80 border-slate-300/60 text-gray-700 font-normal px-3 py-1"
                            >
                              {agreement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

