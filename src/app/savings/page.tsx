'use client';

import { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Sparkles, Target, Info, Calculator, Plus, X, Check, CircleDollarSign, ExternalLink, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CompoundInterestResult {
  finalAmount: number;
  totalContributed: number;
  totalInterest: number;
  yearByYear: Array<{
    year: number;
    amount: number;
    contributed: number;
    interest: number;
    savingsIncreased?: boolean;
    increasedAmount?: number;
  }>;
  milestones: Array<{
    year: number;
    milestone: string;
    amount: number;
  }>;
}

interface SavingsPlan {
  id: string;
  name: string;
  color: string;
  startCapital: number;
  monthlySavings: number;
  returnNominal: number;
  years: number;
  inflation: number;
  whatIf?: {
    increaseAfterYears: number;
    increaseAmount: number;
  };
  // Scenario-val: vilka globala scenarier som ska gälla för denna plan
  useWhatIf?: boolean;
  useAnnualChange?: boolean;
}

// Konvertera årlig avkastning till månatlig (geometrisk)
function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1/12) - 1;
}

// Beräkna ränta-på-ränta effekt med stöd för "vad händer om"-scenarier och årlig förändring
function calculateCompoundInterest(
  monthlyContribution: number,
  annualReturn: number,
  years: number,
  initialAmount: number = 0,
  whatIf?: { increaseAfterYears: number; increaseAmount: number },
  annualChange?: { amount: number } // Månatlig förändring per år (kan vara negativ)
): CompoundInterestResult {
  const monthlyReturn = annualToMonthlyRate(annualReturn);
  const months = years * 12;
  let currentAmount = initialAmount;
  const yearByYear: CompoundInterestResult['yearByYear'] = [];
  const milestones: CompoundInterestResult['milestones'] = [];
  let totalContributed = 0;
  let previousYearAmount = initialAmount;
  let previousYearContributed = 0;
  
  const milestoneTargets = [
    { amount: 100000, text: 'Första 100 000 kr' },
    { amount: 250000, text: '250 000 kr' },
    { amount: 500000, text: 'Halv miljon' },
    { amount: 1000000, text: 'Första miljonen!' },
    { amount: 2500000, text: '2,5 miljoner' },
    { amount: 5000000, text: '5 miljoner' },
    { amount: 10000000, text: '10 miljoner!' },
  ];
  const milestoneReached = new Set<number>();

  for (let month = 1; month <= months; month++) {
    let currentMonthlySavings = monthlyContribution;
    const currentYear = Math.floor((month - 1) / 12);
    
    // Hantera årlig förändring (öka/sänk varje år) - appliceras alltid om aktiv
    if (annualChange) {
      currentMonthlySavings = monthlyContribution + (annualChange.amount * currentYear);
    }
    
    // Hantera "vad händer om"-scenario (öka/sänk efter X år) - läggs till på toppen av årlig förändring
    if (whatIf && month > whatIf.increaseAfterYears * 12) {
      // Om annualChange är aktiv, lägg till whatIf på toppen av det redan modifierade beloppet
      // Annars lägg till på grundbeloppet
      if (annualChange) {
        currentMonthlySavings = currentMonthlySavings + whatIf.increaseAmount;
      } else {
        currentMonthlySavings = monthlyContribution + whatIf.increaseAmount;
      }
    }
    
    // Säkerställ att sparbeloppet inte blir negativt (gäller både whatIf och annualChange)
    currentMonthlySavings = Math.max(0, currentMonthlySavings);

    currentAmount += currentMonthlySavings;
    totalContributed += currentMonthlySavings;

    const interest = currentAmount * monthlyReturn;
    currentAmount += interest;

    if (month % 12 === 0) {
      const year = month / 12;
      const previousYearData = yearByYear[yearByYear.length - 1];
      const previousAmount = previousYearData?.amount || initialAmount;
      const contributedThisYear = totalContributed - (previousYearData?.contributed || 0);
      const yearInterest = currentAmount - previousAmount - contributedThisYear;
      
      const isFirstYearWithIncrease = whatIf && year === Math.floor(whatIf.increaseAfterYears) + 1;
      const savingsIncreased = isFirstYearWithIncrease;
      const increasedAmount = savingsIncreased ? whatIf.increaseAmount : undefined;
      
      yearByYear.push({
        year,
        amount: currentAmount,
        contributed: totalContributed,
        interest: yearInterest,
        savingsIncreased,
        increasedAmount
      });

      for (const milestone of milestoneTargets) {
        if (initialAmount >= milestone.amount) {
          continue;
        }
        if (!milestoneReached.has(milestone.amount) && currentAmount >= milestone.amount) {
          milestones.push({
            year,
            milestone: milestone.text,
            amount: currentAmount
          });
          milestoneReached.add(milestone.amount);
        }
      }

      if (year > 1 && !milestones.some(m => m.milestone.includes('Avkastning överstiger'))) {
        const previousYearData = yearByYear[yearByYear.length - 2];
        if (previousYearData) {
          const previousYearContributions = previousYearData.contributed - (yearByYear[yearByYear.length - 3]?.contributed || 0);
          const previousYearInterest = previousYearData.interest;
          if (yearInterest > contributedThisYear && previousYearInterest <= previousYearContributions) {
            milestones.push({
              year,
              milestone: `År ${year}: Dina avkastningar överstiger dina insättningar!`,
              amount: currentAmount
            });
          }
        }
      }

      previousYearAmount = currentAmount;
      previousYearContributed = totalContributed;
    }
  }

  return {
    finalAmount: currentAmount,
    totalContributed,
    totalInterest: currentAmount - initialAmount - totalContributed,
    yearByYear,
    milestones
  };
}

export default function StandaloneSavingsPage() {
  const router = useRouter();

  const [sliderYears, setSliderYears] = useState([10]);
  const [sliderMonthlySavings, setSliderMonthlySavings] = useState([0]);
  const [sliderReturn, setSliderReturn] = useState([7]);
  const [sliderStartCapital, setSliderStartCapital] = useState([0]);
  const [sliderInflation, setSliderInflation] = useState([2]);
  const [useInflation, setUseInflation] = useState(false);
  
  const [dynamicStartCapitalMax, setDynamicStartCapitalMax] = useState(0);
  const [dynamicMonthlySavingsMax, setDynamicMonthlySavingsMax] = useState(0);
  const [planMaxValues, setPlanMaxValues] = useState<Record<string, { startCapital?: number; monthlySavings?: number }>>({});
  
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [animatedAmounts, setAnimatedAmounts] = useState<Record<string, number>>({});
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [whatIfIncreaseAfter, setWhatIfIncreaseAfter] = useState([5]);
  const [whatIfIncreaseAmount, setWhatIfIncreaseAmount] = useState([500]);
  const [showAnnualChange, setShowAnnualChange] = useState(false);
  const [annualChangeAmount, setAnnualChangeAmount] = useState([0]);
  const animationRefs = useRef<Record<string, number>>({});
  const isAnimatingRef = useRef(false);
  const previousTargetValueRef = useRef<number | null>(null);
  const animatedAmountRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSlidingRef = useRef(false);
  const sliderUpdateTimeouts = useRef<Record<string, NodeJS.Timeout | null>>({});
  const planUpdateTimeouts = useRef<Record<string, NodeJS.Timeout | null>>({});
  const chartDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedChartData, setDebouncedChartData] = useState<any[]>([]);
  const previousChartDataRef = useRef<any[]>([]);
  const debouncedChartDataRef = useRef<any[]>([]);

  // Default max values (fixed for standalone version)
  const defaultStartCapitalMax = 1000000;
  const defaultMonthlySavingsMax = 25000;

  // Defer slider-värden för bättre prestanda vid snabba uppdateringar
  const dSliderMonthlySavings = useDeferredValue(sliderMonthlySavings);
  const dSliderReturn = useDeferredValue(sliderReturn);
  const dSliderInflation = useDeferredValue(sliderInflation);
  const dSliderStartCapital = useDeferredValue(sliderStartCapital);
  const dSliderYears = useDeferredValue(sliderYears);
  const dWhatIfIncreaseAfter = useDeferredValue(whatIfIncreaseAfter);
  const dWhatIfIncreaseAmount = useDeferredValue(whatIfIncreaseAmount);
  const dAnnualChangeAmount = useDeferredValue(annualChangeAmount);

  const effectiveMonthlySavings = dSliderMonthlySavings[0];
  const effectiveReturnNominal = dSliderReturn[0] / 100;
  const effectiveInflation = dSliderInflation[0] / 100;
  const effectiveReturnReal = ((1 + effectiveReturnNominal) / (1 + effectiveInflation)) - 1;
  // Använd real avkastning om inflation är aktiverad, annars nominell avkastning
  const effectiveReturn = useInflation ? effectiveReturnReal : effectiveReturnNominal;
  const effectiveStartCapital = dSliderStartCapital[0];

  // Beräkna ränta-på-ränta effekt för huvudplanen
  const result = useMemo(() => {
    const whatIf = showWhatIf ? {
      increaseAfterYears: dWhatIfIncreaseAfter[0],
      increaseAmount: dWhatIfIncreaseAmount[0]
    } : undefined;
    
    const annualChange = showAnnualChange ? {
      amount: dAnnualChangeAmount[0]
    } : undefined;
    
    return calculateCompoundInterest(
      effectiveMonthlySavings,
      effectiveReturn,
      dSliderYears[0],
      effectiveStartCapital,
      whatIf,
      annualChange
    );
  }, [effectiveMonthlySavings, effectiveReturn, dSliderYears, effectiveStartCapital, showWhatIf, dWhatIfIncreaseAfter, dWhatIfIncreaseAmount, showAnnualChange, dAnnualChangeAmount]);

  // Beräkna alla sparplaner
  const allPlanResults = useMemo(() => {
    const results: Record<string, CompoundInterestResult> = {};
    results['main'] = result;
    
    const globalWhatIf = showWhatIf ? {
      increaseAfterYears: dWhatIfIncreaseAfter[0],
      increaseAmount: dWhatIfIncreaseAmount[0]
    } : undefined;
    
    const globalAnnualChange = showAnnualChange ? {
      amount: dAnnualChangeAmount[0]
    } : undefined;
    
    savingsPlans.forEach(plan => {
      const planReturnNominal = plan.returnNominal / 100;
      let planReturn: number;
      if (useInflation) {
        const planInflation = plan.inflation / 100;
        planReturn = ((1 + planReturnNominal) / (1 + planInflation)) - 1;
      } else {
        planReturn = planReturnNominal;
      }
      
      // Använd globala scenarier endast om planen har valt att använda dem
      // Om useWhatIf är false, använd inte globalWhatIf. Om undefined, använd globalWhatIf om det finns.
      // Om useWhatIf är false och plan.whatIf finns, använd plan.whatIf istället.
      let planWhatIf: { increaseAfterYears: number; increaseAmount: number } | undefined;
      if (plan.useWhatIf === false) {
        // Planen har explicit valt att inte använda globalt whatIf, använd bara plan.whatIf om det finns
        planWhatIf = plan.whatIf;
      } else if (plan.useWhatIf === true || plan.useWhatIf === undefined) {
        // Planen har valt att använda globalt whatIf (eller default är att använda det)
        planWhatIf = globalWhatIf || plan.whatIf;
      }
      
      // Om useAnnualChange är false, använd inte globalAnnualChange
      // Om undefined, använd globalAnnualChange om det finns
      const planAnnualChange = (plan.useAnnualChange !== false && globalAnnualChange) || undefined;
      
      results[plan.id] = calculateCompoundInterest(
        plan.monthlySavings,
        planReturn,
        plan.years,
        plan.startCapital,
        planWhatIf,
        planAnnualChange
      );
    });
    
    return results;
  }, [result, savingsPlans, useInflation, showWhatIf, dWhatIfIncreaseAfter, dWhatIfIncreaseAmount, showAnnualChange, dAnnualChangeAmount]);

  // Memoize chart data - optimera genom att använda index istället för find()
  const chartData = useMemo(() => {
    const maxYears = Math.max(
      dSliderYears[0],
      ...savingsPlans.map(p => p.years)
    );
    const data: any[] = [];
    
    // Skapa indexerade maps för snabbare uppslag
    const mainYearMap = new Map(result.yearByYear.map(y => [y.year, y]));
    const planYearMaps = new Map<string, Map<number, typeof result.yearByYear[0]>>();
    savingsPlans.forEach(plan => {
      const planResult = allPlanResults[plan.id];
      if (planResult) {
        planYearMaps.set(plan.id, new Map(planResult.yearByYear.map(y => [y.year, y])));
      }
    });
    
    for (let year = 0; year <= maxYears; year++) {
      const entry: any = { År: year };
      const mainYearData = mainYearMap.get(year);
      entry['Nuvarande plan'] = mainYearData?.amount || (year === 0 ? effectiveStartCapital : null);
      
      savingsPlans.forEach(plan => {
        const planYearMap = planYearMaps.get(plan.id);
        if (planYearMap) {
          const planYearData = planYearMap.get(year);
          entry[plan.name] = planYearData?.amount || (year === 0 ? plan.startCapital : null);
        }
      });
      
      data.push(entry);
    }
    
    return data;
  }, [result, allPlanResults, savingsPlans, dSliderYears, effectiveStartCapital]);

  // Synkronisera debouncedChartDataRef med debouncedChartData state
  useEffect(() => {
    debouncedChartDataRef.current = debouncedChartData;
  }, [debouncedChartData]);

  // Debounce chart data uppdatering när användaren drar i sliders
  useEffect(() => {
    // Jämför om data faktiskt har ändrats för att undvika oändliga loopar
    const currentDataString = JSON.stringify(previousChartDataRef.current);
    const newDataString = JSON.stringify(chartData);
    
    // Om data inte har ändrats, gör ingenting
    if (currentDataString === newDataString) {
      return;
    }
    
    // Uppdatera ref
    previousChartDataRef.current = chartData;
    
    // Rensa befintlig timeout
    if (chartDataTimeoutRef.current) {
      clearTimeout(chartDataTimeoutRef.current);
    }
    
    // Initialisera om debouncedChartData är tom
    if (debouncedChartDataRef.current.length === 0 && chartData.length > 0) {
      try {
        setDebouncedChartData(chartData);
        debouncedChartDataRef.current = chartData;
      } catch (error) {
        console.warn('Chart data update error caught:', error);
      }
      return;
    }
    
    // Om användaren inte drar, uppdatera direkt men bara om det faktiskt har ändrats
    if (!isSlidingRef.current) {
      const currentDebouncedString = JSON.stringify(debouncedChartDataRef.current);
      if (currentDebouncedString !== newDataString) {
        try {
          setDebouncedChartData(chartData);
          debouncedChartDataRef.current = chartData;
        } catch (error) {
          console.warn('Chart data update error caught:', error);
        }
      }
      return;
    }
    
    // Om användaren drar, vänta 1 sekund efter att värdet varit oförändrat
    chartDataTimeoutRef.current = setTimeout(() => {
      if (!isSlidingRef.current) {
        // Hämta senaste chartData-värdet
        const timeoutChartData = previousChartDataRef.current;
        const timeoutDataString = JSON.stringify(timeoutChartData);
        const currentDebouncedString = JSON.stringify(debouncedChartDataRef.current);
        if (currentDebouncedString !== timeoutDataString) {
          try {
            setDebouncedChartData(timeoutChartData);
            debouncedChartDataRef.current = timeoutChartData;
          } catch (error) {
            console.warn('Chart data timeout update error caught:', error);
          }
        }
      }
    }, 1000);
    
    return () => {
      if (chartDataTimeoutRef.current) {
        clearTimeout(chartDataTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  // Animation för belopp
  useEffect(() => {
    const targetValue = result.finalAmount;
    
    if (isAnimatingRef.current && animationRefs.current['main']) {
      try {
        cancelAnimationFrame(animationRefs.current['main']);
        delete animationRefs.current['main'];
        isAnimatingRef.current = false;
      } catch (error) {
        console.warn('Error canceling animation:', error);
      }
    }
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    if (isSlidingRef.current) {
      // När användaren drar, uppdatera bara ref, inte state (förhindrar oändliga loopar)
      animatedAmountRef.current = targetValue;
      previousTargetValueRef.current = targetValue;
      return;
    }
    
    if (isAnimatingRef.current) {
      return;
    }
    
    if (previousTargetValueRef.current === targetValue) {
      return;
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      const currentTargetValue = result.finalAmount;
      
      if (previousTargetValueRef.current === currentTargetValue) {
        return;
      }
      
      if (isAnimatingRef.current && animationRefs.current['main']) {
        cancelAnimationFrame(animationRefs.current['main']);
        delete animationRefs.current['main'];
        isAnimatingRef.current = false;
      }
      
      const currentAnimatedValue = animatedAmountRef.current ?? currentTargetValue;
      const startValue = currentAnimatedValue;
      const difference = Math.abs(startValue - currentTargetValue);
      
      if (difference > 100) {
        isAnimatingRef.current = true;
        previousTargetValueRef.current = currentTargetValue;
        
        const duration = 600;
        const startTime = performance.now();
        let lastUpdateTime = startTime;
        
        const animate = (currentTime: number) => {
          if (currentTime - lastUpdateTime < 16) {
            animationRefs.current['main'] = requestAnimationFrame(animate);
            return;
          }
          lastUpdateTime = currentTime;
          
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = startValue + (currentTargetValue - startValue) * eased;
          
          animatedAmountRef.current = current;
          try {
            setAnimatedAmounts(prev => {
              if (prev.main === current) return prev;
              return { ...prev, main: current };
            });
          } catch (error) {
            console.warn('Animation error caught:', error);
          }
          
          if (progress < 1) {
            animationRefs.current['main'] = requestAnimationFrame(animate);
          } else {
            animatedAmountRef.current = currentTargetValue;
            try {
              setAnimatedAmounts(prev => ({
                ...prev,
                main: currentTargetValue
              }));
            } catch (error) {
              console.warn('Animation final update error caught:', error);
            }
            isAnimatingRef.current = false;
          }
        };
        
        animationRefs.current['main'] = requestAnimationFrame(animate);
      } else {
        animatedAmountRef.current = currentTargetValue;
        try {
          setAnimatedAmounts(prev => ({
            ...prev,
            main: currentTargetValue
          }));
        } catch (error) {
          console.warn('Animation direct update error caught:', error);
        }
        previousTargetValueRef.current = currentTargetValue;
      }
    }, 100);

    return () => {
      if (animationRefs.current['main']) {
        cancelAnimationFrame(animationRefs.current['main']);
        delete animationRefs.current['main'];
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, [result.finalAmount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(animationRefs.current).forEach(id => cancelAnimationFrame(id));
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      Object.values(sliderUpdateTimeouts.current).forEach(timeout => {
        if (timeout) {
          try {
            clearTimeout(timeout);
          } catch (error) {
            console.warn('Error clearing slider timeout:', error);
          }
        }
      });
      Object.values(planUpdateTimeouts.current).forEach(timeout => {
        if (timeout) {
          try {
            clearTimeout(timeout);
          } catch (error) {
            console.warn('Error clearing plan update timeout:', error);
          }
        }
      });
      if (chartDataTimeoutRef.current) {
        clearTimeout(chartDataTimeoutRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  // Filter milestones that are already reached by initial capital
  const filteredMilestones = useMemo(() => {
    return result.milestones.filter(m => m.amount > effectiveStartCapital);
  }, [result.milestones, effectiveStartCapital]);

  const planColors = ['#A855F7', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#14B8A6', '#6366F1', '#DC2626', '#0891B2', '#7C3AED'];

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-4 md:py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-slate-200/40 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <Calculator className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-primary">Sparkalkylator (ränta-på-ränta)</h1>
              </div>
              <p className="text-primary/70 mt-1 text-xs md:text-sm">
                Se hur ditt sparande kan växa över tid med ränta-på-ränta-effekten
              </p>
              <p className="text-xs text-primary/60 mt-2 italic">
                Observera: Beräkningarna är förenklade simuleringar baserade på dina egna antaganden. De visar exempel på möjliga utfall, inte en prognos eller garanti.
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                  Vad är en ränta-på-ränta-kalkylator?
                </h3>
                <p className="text-sm text-primary/80 mb-3">
                  En ränta-på-ränta-kalkylator (även kallad sammansatt räntekalkylator) hjälper dig förstå hur ditt sparande kan utvecklas över tid när du både sparar regelbundet och får avkastning på ditt kapital.
                </p>
                <p className="text-sm text-primary/80 mb-3">
                  <strong>Grundprincipen:</strong> När du sparar eller investerar pengar får du avkastning – och den avkastningen får i sin tur avkastning. Detta kallas ränta-på-ränta eller sammansatt ränta. Över många år kan det göra stor skillnad, även om du inte sparar enorma belopp varje månad.
                </p>
                <p className="text-sm text-primary/80 mb-3">
                  <strong>Exempel:</strong> Om du börjar med 100 000 kr och sparar 5 000 kr/månad med en årlig avkastning på 7% kan sparandet i detta räkneexempel växa till över 3,5 miljoner kr – varav mer än 1,5 miljoner kr från avkastning. Utfallet beror helt på antagandena och tar inte hänsyn till skatt, avgifter eller förändrade villkor.
                </p>
                <p className="text-sm text-primary/80">
                  <strong>Vad kan du göra här:</strong> Jämför olika sparstrategier, testa "vad händer om"-scenarier, och se hur ditt sparande växer år för år med interaktiva grafer och milstolpar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Same structure as dashboard version but without auto-mode */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Controls */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/40 p-4 md:p-6 shadow-card">
              <h3 className="text-base md:text-lg font-serif text-primary mb-4 md:mb-5">Inställningar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                {/* Startkapital */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-primary">Startkapital</Label>
                  <p className="text-xs text-primary/60 mb-3">
                    Ange eller justera ditt startbelopp med reglaget
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={sliderStartCapital[0] === 0 ? '' : Math.floor(sliderStartCapital[0]).toString()}
                      onChange={(e) => {
                        try {
                          const val = e.target.value;
                          if (val === '') {
                            setSliderStartCapital([0]);
                            setDynamicStartCapitalMax(0);
                          } else {
                            const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                            if (!isNaN(num)) {
                              const safeMax = 9999999999999;
                              const clampedValue = Math.min(num, safeMax);
                              setSliderStartCapital([clampedValue]);
                              const newMax = Math.max(defaultStartCapitalMax, Math.ceil(clampedValue * 1.2));
                              // Uppdatera max bara om det är större än det nuvarande värdet för att undvika loopar
                              if (newMax > (dynamicStartCapitalMax || 0)) {
                                setDynamicStartCapitalMax(newMax);
                              }
                            }
                          }
                        } catch (error) {
                          console.warn('Start capital input error caught:', error);
                        }
                      }}
                      placeholder="0"
                      min={0}
                      max={9999999999999}
                      className="w-24 sm:w-32 text-sm"
                    />
                    <span className="text-xs text-gray-500 flex-shrink-0">kr</span>
                  </div>
                  <Slider
                    value={sliderStartCapital}
                    onValueChange={(vals) => {
                      if (!isSlidingRef.current) {
                        if (sliderUpdateTimeouts.current.startCapital) {
                          clearTimeout(sliderUpdateTimeouts.current.startCapital);
                        }
                        isSlidingRef.current = true;
                        try {
                          setSliderStartCapital(vals);
                        } catch (error) {
                          console.warn('Slider update error caught:', error);
                        } finally {
                          sliderUpdateTimeouts.current.startCapital = setTimeout(() => {
                            isSlidingRef.current = false;
                          }, 100);
                        }
                      }
                    }}
                    onValueCommit={(vals) => {
                      try {
                        setSliderStartCapital(vals);
                        isSlidingRef.current = false;
                        if (sliderUpdateTimeouts.current.startCapital) {
                          clearTimeout(sliderUpdateTimeouts.current.startCapital);
                          sliderUpdateTimeouts.current.startCapital = null;
                        }
                        if (chartDataTimeoutRef.current) {
                          clearTimeout(chartDataTimeoutRef.current);
                        }
                        setDebouncedChartData(chartData);
                      } catch (error) {
                        console.warn('Slider commit error caught:', error);
                      }
                    }}
                    min={0}
                    max={dynamicStartCapitalMax > 0 ? Math.min(dynamicStartCapitalMax, 9999999999999) : defaultStartCapitalMax}
                    step={10000}
                    className="w-full mb-2"
                  />
                  <div className="text-xs text-gray-500">
                    {formatCurrency(effectiveStartCapital)}
                  </div>
                </div>

                {/* Månadssparande */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-primary">Månadssparande</Label>
                  <p className="text-xs text-primary/60 mb-3">
                    Ange hur mycket du sparar varje månad och justera med reglaget
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={sliderMonthlySavings[0] === 0 ? '' : Math.floor(sliderMonthlySavings[0]).toString()}
                      onChange={(e) => {
                        try {
                          const val = e.target.value;
                          if (val === '') {
                            setSliderMonthlySavings([0]);
                            setDynamicMonthlySavingsMax(0);
                          } else {
                            const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                            if (!isNaN(num) && num >= 0) {
                              const safeMax = 999999999;
                              const clampedValue = Math.min(num, safeMax);
                              setSliderMonthlySavings([clampedValue]);
                              const newMax = Math.max(defaultMonthlySavingsMax, Math.ceil(clampedValue * 1.2));
                              // Uppdatera max bara om det är större än det nuvarande värdet för att undvika loopar
                              if (newMax > (dynamicMonthlySavingsMax || 0)) {
                                setDynamicMonthlySavingsMax(newMax);
                              }
                            }
                          }
                        } catch (error) {
                          console.warn('Monthly savings input error caught:', error);
                        }
                      }}
                      placeholder="0"
                      disabled={false}
                      min={0}
                      max={999999999}
                      className="w-24 sm:w-32 text-sm"
                    />
                    <span className="text-xs text-gray-500 flex-shrink-0">kr/mån</span>
                  </div>
                  <Slider
                    value={sliderMonthlySavings}
                    onValueChange={(vals) => {
                      if (!isSlidingRef.current) {
                        if (sliderUpdateTimeouts.current.monthlySavings) {
                          clearTimeout(sliderUpdateTimeouts.current.monthlySavings);
                        }
                        isSlidingRef.current = true;
                        try {
                          setSliderMonthlySavings(vals);
                        } catch (error) {
                          console.warn('Slider update error caught:', error);
                        } finally {
                          sliderUpdateTimeouts.current.monthlySavings = setTimeout(() => {
                            isSlidingRef.current = false;
                          }, 100);
                        }
                      }
                    }}
                    onValueCommit={(vals) => {
                      try {
                        setSliderMonthlySavings(vals);
                        isSlidingRef.current = false;
                        if (sliderUpdateTimeouts.current.monthlySavings) {
                          clearTimeout(sliderUpdateTimeouts.current.monthlySavings);
                          sliderUpdateTimeouts.current.monthlySavings = null;
                        }
                        if (chartDataTimeoutRef.current) {
                          clearTimeout(chartDataTimeoutRef.current);
                        }
                        setDebouncedChartData(chartData);
                      } catch (error) {
                        console.warn('Slider commit error caught:', error);
                      }
                    }}
                    min={0}
                    max={dynamicMonthlySavingsMax > 0 ? Math.min(dynamicMonthlySavingsMax, 999999999) : defaultMonthlySavingsMax}
                    step={500}
                    className="w-full mb-2"
                  />
                  <div className="text-xs text-gray-500">
                    {formatCurrency(effectiveMonthlySavings)}/mån
                  </div>
                </div>

                {/* Avkastning */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-primary">Årlig avkastning (nominell)</Label>
                  <p className="text-xs text-primary/60 mb-3">
                    Förväntad årlig avkastning före inflation. Nominell avkastning är före inflation. Den reala avkastningen beräknas automatiskt om inflation är aktiverad.
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={sliderReturn[0].toFixed(1)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setSliderReturn([0]);
                        } else {
                          const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
                          if (!isNaN(num)) {
                            const clampedValue = Math.max(0, Math.min(15, num));
                            setSliderReturn([clampedValue]);
                          }
                        }
                      }}
                      placeholder="0.0"
                      disabled={false}
                      min={0}
                      max={15}
                      step={0.1}
                      className="w-24 sm:w-32 text-sm"
                    />
                    <span className="text-xs text-gray-500 flex-shrink-0">%</span>
                  </div>
                <Slider
                  value={sliderReturn}
                  onValueChange={(vals) => {
                    if (!isSlidingRef.current) {
                      if (sliderUpdateTimeouts.current.return) {
                        clearTimeout(sliderUpdateTimeouts.current.return);
                      }
                      isSlidingRef.current = true;
                      try {
                        setSliderReturn(vals);
                      } catch (error) {
                        console.warn('Slider update error caught:', error);
                      } finally {
                        sliderUpdateTimeouts.current.return = setTimeout(() => {
                          isSlidingRef.current = false;
                        }, 100);
                      }
                    }
                  }}
                  onValueCommit={(vals) => {
                    try {
                      setSliderReturn(vals);
                      isSlidingRef.current = false;
                      if (sliderUpdateTimeouts.current.return) {
                        clearTimeout(sliderUpdateTimeouts.current.return);
                        sliderUpdateTimeouts.current.return = null;
                      }
                      if (chartDataTimeoutRef.current) {
                        clearTimeout(chartDataTimeoutRef.current);
                      }
                      setDebouncedChartData(chartData);
                    } catch (error) {
                      console.warn('Slider commit error caught:', error);
                    }
                  }}
                  min={0}
                  max={15}
                  step={0.1}
                  disabled={false}
                  className="w-full mb-2"
                />
                  <div className="text-xs text-gray-500">
                    {useInflation ? 'Real avkastning' : 'Nominell avkastning'}: {useInflation ? (effectiveReturnReal >= 0 ? '+' : '') + (effectiveReturnReal * 100).toFixed(2) : (effectiveReturnNominal * 100).toFixed(2)}%/år
                  </div>
                </div>

                {/* Inflation */}
                <div className="mt-6 pt-6 border-t border-slate-200/40">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Använd inflation i beräkningen</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs transition-colors ${!useInflation ? 'text-primary font-medium' : 'text-primary/50'}`}>
                        Av
                      </span>
                      <Switch
                        checked={useInflation}
                        onCheckedChange={setUseInflation}
                      />
                      <span className={`text-xs transition-colors ${useInflation ? 'text-primary font-medium' : 'text-primary/50'}`}>
                        På
                      </span>
                    </div>
                  </div>
                  {useInflation && (
                    <>
                      <p className="text-xs text-primary/60 mb-3">
                        Inflationsjustering används för att beräkna real avkastning. Standard är 2%/år.
                      </p>
                      <div className="flex items-center gap-3 mb-2">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={sliderInflation[0].toFixed(1)}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setSliderInflation([0]);
                            } else {
                              const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
                              if (!isNaN(num)) {
                                const clampedValue = Math.max(0, Math.min(10, num));
                                setSliderInflation([clampedValue]);
                              }
                            }
                          }}
                          placeholder="2.0"
                          min={0}
                          max={10}
                          step={0.1}
                          className="w-24 sm:w-32 text-sm"
                        />
                        <span className="text-xs text-gray-500">%/år</span>
                      </div>
                      <Slider
                        value={sliderInflation}
                        onValueChange={(vals) => {
                          isSlidingRef.current = true;
                          setSliderInflation(vals);
                          setTimeout(() => {
                            isSlidingRef.current = false;
                          }, 100);
                        }}
                        onValueCommit={(vals) => {
                          setSliderInflation(vals);
                          isSlidingRef.current = false;
                          if (chartDataTimeoutRef.current) {
                            clearTimeout(chartDataTimeoutRef.current);
                          }
                          setDebouncedChartData(chartData);
                        }}
                        min={0}
                        max={10}
                        step={0.1}
                        className="w-full mb-2"
                      />
                      <div className="text-xs text-primary/70">
                        {sliderInflation[0].toFixed(1)}%/år
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Real avkastning: {effectiveReturnReal >= 0 ? '+' : ''}{(effectiveReturnReal * 100).toFixed(1)}%/år
                        {(effectiveReturnReal * 100) < 0 && ' (negativ real avkastning)'}
                      </p>
                    </>
                  )}
                </div>

                {/* År */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-primary">Tidsperiod</Label>
                  <p className="text-xs text-primary/60 mb-3">
                    Hur många år framåt vill du simulera utvecklingen?
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={sliderYears[0].toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setSliderYears([1]);
                        } else {
                          const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                          if (!isNaN(num)) {
                            const clampedValue = Math.max(1, Math.min(40, num));
                            setSliderYears([clampedValue]);
                          }
                        }
                      }}
                      placeholder="10"
                      min={1}
                      max={40}
                      step={1}
                      className="w-24 sm:w-32 text-sm"
                    />
                    <span className="text-xs text-gray-500">år</span>
                  </div>
                  <Slider
                    value={sliderYears}
                    onValueChange={(vals) => {
                      try {
                        isSlidingRef.current = true;
                        setSliderYears(vals);
                        setTimeout(() => {
                          isSlidingRef.current = false;
                        }, 300);
                      } catch (error) {
                        console.warn('Slider years update error caught:', error);
                      }
                    }}
                    onValueCommit={(vals) => {
                      try {
                        setSliderYears(vals);
                        isSlidingRef.current = false;
                        if (chartDataTimeoutRef.current) {
                          clearTimeout(chartDataTimeoutRef.current);
                        }
                        setDebouncedChartData(chartData);
                      } catch (error) {
                        console.warn('Slider years commit error caught:', error);
                      }
                    }}
                    min={1}
                    max={40}
                    step={1}
                    className="w-full mb-2"
                  />
                  <div className="text-xs text-gray-500">
                    {sliderYears[0]} år
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Chart and Results */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Resultat */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6 lg:p-8 rounded-2xl border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 flex-shrink-0" />
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Resultat</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="order-2 md:order-1 bg-white p-4 md:p-6 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Startkapital</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{formatCurrency(effectiveStartCapital)}</p>
                  <p className="text-xs text-gray-400 mt-1">Inledande belopp</p>
                </div>
                <div className="order-1 md:order-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Total summa</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 break-words">
                    {formatCurrency(Math.round(animatedAmounts['main'] || result.finalAmount))}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Efter {sliderYears[0]} år</p>
                </div>
                <div className="order-3 bg-white p-4 md:p-6 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Sparat</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{formatCurrency(result.totalContributed)}</p>
                  <p className="text-xs text-gray-400 mt-1">Månadsinsättningar</p>
                </div>
                <div className="order-4 bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-xl border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Avkastning</p>
                  <p className={`text-2xl md:text-3xl font-bold break-words ${result.totalInterest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.totalInterest)}
                  </p>
                  <p className={`text-xs mt-1 ${result.totalInterest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Ränta-på-ränta effekt
                  </p>
                </div>
              </div>
            </div>

            {/* Interaktiv graf */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6 lg:p-8 rounded-2xl border-2 border-emerald-200 shadow-lg mt-4 md:mt-6">
              <div className="mb-4 md:mb-6 bg-white p-4 md:p-6 rounded-xl border-2 border-gray-200 shadow-md">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Utveckling över tid
                </h4>
                <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={debouncedChartData.length > 0 ? debouncedChartData : chartData}
                      margin={{ left: 50, right: 20, top: 10, bottom: 30 }}
                      onMouseMove={(state: any) => {
                        if (state?.activePayload?.[0]) {
                          setHoveredYear(state.activePayload[0].payload?.År || null);
                        }
                      }}
                      onMouseLeave={() => setHoveredYear(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="År" 
                        stroke="#6b7280"
                        label={{ value: 'År', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        width={100}
                        angle={-45}
                        tickFormatter={(value) => formatCurrency(value).replace(/\s/g, '')}
                        label={{ value: 'Belopp (kr)', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#6b7280' } }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const year = payload[0].payload?.År || 0;
                          const mainData = result.yearByYear.find(y => y.year === year);
                          
                          const milestoneForYear = result.milestones.find(m => m.year === year && effectiveStartCapital < m.amount);
                          
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-semibold mb-2">År {year}</p>
                              {milestoneForYear && (
                                <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                                  <p className="font-semibold text-emerald-900">🎯 Milstolpe:</p>
                                  <p className="text-emerald-700">{milestoneForYear.milestone}</p>
                                </div>
                              )}
                              {payload.map((entry: any, idx: number) => {
                                const yearData = entry.dataKey === 'Nuvarande plan' 
                                  ? result.yearByYear.find((y: any) => y.year === year)
                                  : savingsPlans.find(p => p.name === entry.dataKey) 
                                    ? allPlanResults[savingsPlans.find(p => p.name === entry.dataKey)!.id]?.yearByYear.find((y: any) => y.year === year)
                                    : null;
                                
                              let annualSavings = 0;
                              if (entry.dataKey === 'Nuvarande plan') {
                                let monthlySavingsForYear = effectiveMonthlySavings;
                                
                                // Först applicera årlig förändring (om aktiv)
                                if (showAnnualChange && year > 0) {
                                  monthlySavingsForYear += dAnnualChangeAmount[0] * (year - 1);
                                }
                                
                                // Sedan lägg till "vad händer om"-scenario på toppen (om aktiv och efter X år)
                                if (showWhatIf && year > dWhatIfIncreaseAfter[0]) {
                                  monthlySavingsForYear += dWhatIfIncreaseAmount[0];
                                }
                                
                                annualSavings = Math.max(0, monthlySavingsForYear) * 12;
                              } else {
                                const plan = savingsPlans.find(p => p.name === entry.dataKey);
                                if (plan) {
                                  let monthlySavingsForYear = plan.monthlySavings;
                                  
                                  // Först applicera årlig förändring (om aktiv och planen har valt att använda den)
                                  if (showAnnualChange && plan.useAnnualChange !== false && year > 0) {
                                    monthlySavingsForYear += dAnnualChangeAmount[0] * (year - 1);
                                  }
                                  
                                  // Sedan lägg till "vad händer om"-scenario på toppen (om aktiv och planen har valt att använda den)
                                  if (showWhatIf && plan.useWhatIf !== false && year > dWhatIfIncreaseAfter[0]) {
                                    monthlySavingsForYear += dWhatIfIncreaseAmount[0];
                                  } else if (plan.whatIf && year > plan.whatIf.increaseAfterYears) {
                                    // Använd planens eget whatIf om den inte använder det globala
                                    monthlySavingsForYear += plan.whatIf.increaseAmount;
                                  }
                                  
                                  annualSavings = Math.max(0, monthlySavingsForYear) * 12;
                                }
                              }
                                
                                const previousYearData = entry.dataKey === 'Nuvarande plan'
                                  ? result.yearByYear.find((y: any) => y.year === year - 1)
                                  : savingsPlans.find(p => p.name === entry.dataKey)
                                    ? allPlanResults[savingsPlans.find(p => p.name === entry.dataKey)!.id]?.yearByYear.find((y: any) => y.year === year - 1)
                                    : null;
                                
                                const contributedThisYear = yearData?.contributed 
                                  ? (yearData.contributed - (previousYearData?.contributed || 0))
                                  : annualSavings;
                                
                                return (
                                  <div key={idx} className="mb-1">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: entry.stroke || '#3b82f6' }}
                                      />
                                      <span className="font-medium">{entry.name}:</span>
                                      <span className="font-bold">{formatCurrency(entry.value || 0)}</span>
                                    </div>
                                    {yearData && year > 0 && (
                                      <div className="text-xs text-gray-600 ml-5 mt-1 space-y-0.5">
                                        <div>Spar per år: <span className="font-semibold">{formatCurrency(contributedThisYear)}</span></div>
                                        <div>Avkastning: {formatCurrency(yearData.interest)} | Total: {formatCurrency(yearData.amount)}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Nuvarande plan" 
                        stroke="#0E5E4B" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0E5E4B' }}
                        activeDot={{ r: 6, fill: '#0E5E4B' }}
                      />
                      {savingsPlans.map(plan => (
                        <Line
                          key={plan.id}
                          type="monotone"
                          dataKey={plan.name}
                          stroke={plan.color}
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: plan.color }}
                          activeDot={{ r: 5, fill: plan.color }}
                        />
                      ))}
                      {result.milestones
                        .filter(milestone => effectiveStartCapital < milestone.amount)
                        .map((milestone, idx) => (
                          <ReferenceLine
                            key={idx}
                            x={milestone.year}
                            stroke="#10b981"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
              </div>
              
              {/* Visuell tidslinje med milstolpar */}
              {(() => {
                const filteredMilestones = result.milestones.filter(
                  milestone => effectiveStartCapital < milestone.amount
                );
                
                return filteredMilestones.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Milstolpar
                    </h5>
                    <p className="text-xs text-gray-600 mb-4 italic">
                      För: <strong>Nuvarande plan</strong>
                    </p>
                    <div className="relative">
                      <div className="absolute left-0 top-6 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                      
                      <div className="relative space-y-4 pl-6">
                        {filteredMilestones.map((milestone, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-8 top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-emerald-900">
                                    År {milestone.year}: {milestone.milestone}
                                  </p>
                                  <p className="text-xs text-emerald-700 mt-1">
                                    Total: {formatCurrency(milestone.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* "Vad händer om"-scenario */}
            <div className="bg-white/70 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-200/40 shadow-subtle mt-4 md:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-primary mb-1">Vad händer om-scenario</h4>
                  <p className="text-xs text-primary/70">
                    Se vad som händer om du ökar eller sänker månadssparandet efter X år (påverkar alla sparplaner)
                  </p>
                </div>
                <Switch
                  checked={showWhatIf}
                  onCheckedChange={setShowWhatIf}
                  className="flex-shrink-0"
                />
              </div>
              
              {showWhatIf && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4">
                  <div>
                    <Label className="text-xs text-primary/70 mb-2 block">Öka sparandet efter (år)</Label>
                    <div className="flex items-center gap-3 mb-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={whatIfIncreaseAfter[0].toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setWhatIfIncreaseAfter([1]);
                          } else {
                            const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                            if (!isNaN(num)) {
                              const maxValue = Math.max(1, sliderYears[0] - 1);
                              const clampedValue = Math.max(1, Math.min(maxValue, num));
                              setWhatIfIncreaseAfter([clampedValue]);
                            }
                          }
                        }}
                        placeholder="5"
                        min={1}
                        max={Math.max(1, sliderYears[0] - 1)}
                        step={1}
                        className="w-20 sm:w-24 text-sm"
                      />
                      <span className="text-xs text-gray-500">år</span>
                    </div>
                    <Slider
                      value={whatIfIncreaseAfter}
                      onValueChange={(vals) => {
                        if (!isSlidingRef.current) {
                          if (sliderUpdateTimeouts.current.whatIfIncreaseAfter) {
                            clearTimeout(sliderUpdateTimeouts.current.whatIfIncreaseAfter);
                          }
                          isSlidingRef.current = true;
                          try {
                            setWhatIfIncreaseAfter(vals);
                          } catch (error) {
                            console.warn('WhatIf after slider update error caught:', error);
                          } finally {
                            sliderUpdateTimeouts.current.whatIfIncreaseAfter = setTimeout(() => {
                              isSlidingRef.current = false;
                            }, 100);
                          }
                        }
                      }}
                      onValueCommit={(vals) => {
                        try {
                          setWhatIfIncreaseAfter(vals);
                          isSlidingRef.current = false;
                          if (sliderUpdateTimeouts.current.whatIfIncreaseAfter) {
                            clearTimeout(sliderUpdateTimeouts.current.whatIfIncreaseAfter);
                            sliderUpdateTimeouts.current.whatIfIncreaseAfter = null;
                          }
                          if (chartDataTimeoutRef.current) {
                            clearTimeout(chartDataTimeoutRef.current);
                          }
                          setDebouncedChartData(chartData);
                        } catch (error) {
                          console.warn('WhatIf after slider commit error caught:', error);
                        }
                      }}
                      min={1}
                      max={sliderYears[0] - 1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Efter {whatIfIncreaseAfter[0]} år
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-primary/70 mb-2 block">Förändra med (kr/mån)</Label>
                    <div className="flex items-center gap-3 mb-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={whatIfIncreaseAmount[0] === 0 ? '' : whatIfIncreaseAmount[0].toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setWhatIfIncreaseAmount([0]);
                          } else {
                            const num = parseInt(val.replace(/[^\d-]/g, ''), 10);
                            if (!isNaN(num)) {
                              const clampedValue = Math.max(-10000, Math.min(10000, num));
                              setWhatIfIncreaseAmount([clampedValue]);
                            }
                          }
                        }}
                        placeholder="0"
                        min={-10000}
                        max={10000}
                        step={100}
                        className="w-24 sm:w-32 text-sm"
                      />
                      <span className="text-xs text-gray-500">kr/mån</span>
                    </div>
                    <Slider
                      value={whatIfIncreaseAmount}
                      onValueChange={(vals) => {
                        if (!isSlidingRef.current) {
                          if (sliderUpdateTimeouts.current.whatIfIncreaseAmount) {
                            clearTimeout(sliderUpdateTimeouts.current.whatIfIncreaseAmount);
                          }
                          isSlidingRef.current = true;
                          try {
                            setWhatIfIncreaseAmount(vals);
                          } catch (error) {
                            console.warn('WhatIf slider update error caught:', error);
                          } finally {
                            sliderUpdateTimeouts.current.whatIfIncreaseAmount = setTimeout(() => {
                              isSlidingRef.current = false;
                            }, 100);
                          }
                        }
                      }}
                      onValueCommit={(vals) => {
                        try {
                          setWhatIfIncreaseAmount(vals);
                          isSlidingRef.current = false;
                          if (sliderUpdateTimeouts.current.whatIfIncreaseAmount) {
                            clearTimeout(sliderUpdateTimeouts.current.whatIfIncreaseAmount);
                            sliderUpdateTimeouts.current.whatIfIncreaseAmount = null;
                          }
                          if (chartDataTimeoutRef.current) {
                            clearTimeout(chartDataTimeoutRef.current);
                          }
                          setDebouncedChartData(chartData);
                        } catch (error) {
                          console.warn('WhatIf slider commit error caught:', error);
                        }
                      }}
                      min={-10000}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {whatIfIncreaseAmount[0] >= 0 ? '+' : ''}{formatCurrency(whatIfIncreaseAmount[0])}/månad
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Årlig förändring-scenario */}
            <div className="bg-white/70 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-200/40 shadow-subtle mt-4 md:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-primary mb-1">Årlig förändring</h4>
                  <p className="text-xs text-primary/70">
                    Öka eller sänk sparbeloppet varje år med ett fast belopp (påverkar alla sparplaner)
                  </p>
                </div>
                <Switch
                  checked={showAnnualChange}
                  onCheckedChange={setShowAnnualChange}
                  className="flex-shrink-0"
                />
              </div>
              
              {showAnnualChange && (
                <div className="mt-4">
                  <Label className="text-xs text-primary/70 mb-2 block">Förändring per år (kr/mån)</Label>
                  <div className="flex items-center gap-3 mb-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={annualChangeAmount[0] === 0 ? '' : annualChangeAmount[0].toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setAnnualChangeAmount([0]);
                        } else {
                          const num = parseInt(val.replace(/[^\d-]/g, ''), 10);
                          if (!isNaN(num)) {
                            const clampedValue = Math.max(-5000, Math.min(5000, num));
                            setAnnualChangeAmount([clampedValue]);
                          }
                        }
                      }}
                      placeholder="0"
                      min={-5000}
                      max={5000}
                      step={100}
                      className="w-24 sm:w-32 text-sm"
                    />
                    <span className="text-xs text-gray-500">kr/mån per år</span>
                  </div>
                  <Slider
                    value={annualChangeAmount}
                    onValueChange={(vals) => {
                      if (!isSlidingRef.current) {
                        if (sliderUpdateTimeouts.current.annualChangeAmount) {
                          clearTimeout(sliderUpdateTimeouts.current.annualChangeAmount);
                        }
                        isSlidingRef.current = true;
                        try {
                          setAnnualChangeAmount(vals);
                        } catch (error) {
                          console.warn('Annual change slider update error caught:', error);
                        } finally {
                          sliderUpdateTimeouts.current.annualChangeAmount = setTimeout(() => {
                            isSlidingRef.current = false;
                          }, 100);
                        }
                      }
                    }}
                    onValueCommit={(vals) => {
                      try {
                        setAnnualChangeAmount(vals);
                        isSlidingRef.current = false;
                        if (sliderUpdateTimeouts.current.annualChangeAmount) {
                          clearTimeout(sliderUpdateTimeouts.current.annualChangeAmount);
                          sliderUpdateTimeouts.current.annualChangeAmount = null;
                        }
                        if (chartDataTimeoutRef.current) {
                          clearTimeout(chartDataTimeoutRef.current);
                        }
                        setDebouncedChartData(chartData);
                      } catch (error) {
                        console.warn('Annual change slider commit error caught:', error);
                      }
                    }}
                    min={-5000}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {annualChangeAmount[0] >= 0 ? '+' : ''}{formatCurrency(annualChangeAmount[0])}/månad per år
                    {annualChangeAmount[0] !== 0 && (
                      <span className="block mt-1 text-primary/60">
                        År 1: {formatCurrency(effectiveMonthlySavings)}/mån, 
                        År {sliderYears[0]}: {formatCurrency(effectiveMonthlySavings + (annualChangeAmount[0] * (sliderYears[0] - 1)))}/mån
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Jämför sparplaner */}
            <div className="bg-white/70 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-200/40 shadow-subtle mt-4 md:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-primary mb-1">Jämför sparplaner</h4>
                  <p className="text-xs text-primary/70">
                    Skapa flera planer för att jämföra strategier (t.ex. trygg vs aggressiv)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const allColors = [
                      '#A855F7', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4',
                      '#8B5CF6', '#F97316', '#14B8A6', '#6366F1', '#DC2626',
                      '#0891B2', '#7C3AED'
                    ];
                    const mainColor = '#0E5E4B';
                    const usedColors = new Set([mainColor, ...savingsPlans.map(p => p.color)]);
                    let selectedColor = allColors.find(color => !usedColors.has(color));
                    if (!selectedColor) {
                      const availableColors = allColors.filter(c => c !== mainColor);
                      selectedColor = availableColors[savingsPlans.length % availableColors.length];
                    }
                  const newPlan: SavingsPlan = {
                    id: `plan-${Date.now()}`,
                    name: `Plan ${savingsPlans.length + 1}`,
                    color: selectedColor,
                    startCapital: effectiveStartCapital,
                    monthlySavings: effectiveMonthlySavings,
                    returnNominal: effectiveReturnNominal * 100,
                    years: sliderYears[0],
                    inflation: sliderInflation[0],
                    // Default: använd globala scenarier om de är aktiva
                    useWhatIf: showWhatIf ? true : undefined,
                    useAnnualChange: showAnnualChange ? true : undefined
                  };
                    setSavingsPlans([...savingsPlans, newPlan]);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till plan
                </Button>
              </div>
              
              {savingsPlans.length > 0 && (
                <div className="space-y-3">
                  {savingsPlans.map((plan, idx) => {
                    const planResult = allPlanResults[plan.id];
                    return (
                      <div key={plan.id} className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: plan.color }}
                          />
                          <Input
                            value={plan.name}
                            onChange={(e) => {
                              const updated = [...savingsPlans];
                              updated[idx].name = e.target.value;
                              setSavingsPlans(updated);
                            }}
                            className="flex-1 text-sm"
                            placeholder="Plan namn (t.ex. Trygg, Aggressiv)"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSavingsPlans(savingsPlans.filter(p => p.id !== plan.id))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <Label className="text-xs mb-1">Startkapital</Label>
                            <div className="flex items-center gap-2 mb-1">
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={plan.startCapital === 0 ? '' : Math.floor(plan.startCapital).toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...savingsPlans];
                                  if (val === '') {
                                    updated[idx].startCapital = 0;
                                    setPlanMaxValues(prev => {
                                      const { [plan.id]: _, ...remaining } = prev;
                                      return remaining;
                                    });
                                  } else {
                                    const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                                    if (!isNaN(num) && num >= 0) {
                                      const clampedValue = Math.min(num, 9999999999999);
                                      updated[idx].startCapital = clampedValue;
                                      setPlanMaxValues(prev => ({
                                        ...prev,
                                        [plan.id]: {
                                          ...prev[plan.id],
                                          startCapital: Math.max(clampedValue * 1.2, defaultStartCapitalMax)
                                        }
                                      }));
                                    }
                                  }
                                  setSavingsPlans(updated);
                                }}
                                className="w-full text-xs"
                                placeholder="0"
                                min={0}
                                max={9999999999999}
                              />
                              <span className="text-xs text-gray-500">kr</span>
                            </div>
                            <Slider
                              value={[plan.startCapital]}
                              onValueChange={(vals) => {
                                const existingTimeout = planUpdateTimeouts.current[`${plan.id}-startCapital`];
                                if (existingTimeout) {
                                  clearTimeout(existingTimeout);
                                }
                                planUpdateTimeouts.current[`${plan.id}-startCapital`] = setTimeout(() => {
                                  try {
                                    const updated = [...savingsPlans];
                                    const newValue = vals[0];
                                    const currentMax = planMaxValues[plan.id]?.startCapital || defaultStartCapitalMax;
                                    const clampedValue = Math.max(0, Math.min(newValue, Math.min(currentMax, 9999999999999)));
                                    if (updated[idx].startCapital !== clampedValue) {
                                      updated[idx].startCapital = clampedValue;
                                      setSavingsPlans(updated);
                                    }
                                  } catch (error) {
                                    console.warn('Slider startCapital update error caught:', error);
                                  } finally {
                                    planUpdateTimeouts.current[`${plan.id}-startCapital`] = null;
                                  }
                                }, 50);
                              }}
                              onValueCommit={(vals) => {
                                const existingTimeout = planUpdateTimeouts.current[`${plan.id}-startCapital`];
                                if (existingTimeout) {
                                  clearTimeout(existingTimeout);
                                  planUpdateTimeouts.current[`${plan.id}-startCapital`] = null;
                                }
                                try {
                                  const updated = [...savingsPlans];
                                  const newValue = vals[0];
                                  const currentMax = planMaxValues[plan.id]?.startCapital || defaultStartCapitalMax;
                                  const clampedValue = Math.max(0, Math.min(newValue, Math.min(currentMax, 9999999999999)));
                                  updated[idx].startCapital = clampedValue;
                                  setSavingsPlans(updated);
                                  if (chartDataTimeoutRef.current) {
                                    clearTimeout(chartDataTimeoutRef.current);
                                  }
                                  setDebouncedChartData(chartData);
                                } catch (error) {
                                  console.warn('Slider startCapital commit error caught:', error);
                                }
                              }}
                              min={0}
                              max={planMaxValues[plan.id]?.startCapital || defaultStartCapitalMax}
                              step={10000}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Månadssparande</Label>
                            <div className="flex items-center gap-2 mb-1">
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={plan.monthlySavings === 0 ? '' : Math.floor(plan.monthlySavings).toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...savingsPlans];
                                  if (val === '') {
                                    updated[idx].monthlySavings = 0;
                                    setPlanMaxValues(prev => {
                                      const newValues = { ...prev };
                                      if (newValues[plan.id]) {
                                        const { monthlySavings, ...rest } = newValues[plan.id];
                                        if (Object.keys(rest).length === 0) {
                                          const { [plan.id]: _, ...remaining } = newValues;
                                          return remaining;
                                        } else {
                                          return { ...newValues, [plan.id]: rest };
                                        }
                                      }
                                      return newValues;
                                    });
                                  } else {
                                    const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                                    if (!isNaN(num) && num >= 0) {
                                      const clampedValue = Math.min(num, 999999999);
                                      updated[idx].monthlySavings = clampedValue;
                                      setPlanMaxValues(prev => ({
                                        ...prev,
                                        [plan.id]: {
                                          ...prev[plan.id],
                                          monthlySavings: Math.max(clampedValue * 1.2, defaultMonthlySavingsMax)
                                        }
                                      }));
                                    }
                                  }
                                  setSavingsPlans(updated);
                                }}
                                className="w-full text-xs"
                                placeholder="0"
                                min={0}
                                max={999999999}
                              />
                              <span className="text-xs text-gray-500">kr/mån</span>
                            </div>
                            <Slider
                              value={[plan.monthlySavings]}
                              onValueChange={(vals) => {
                                const existingTimeout = planUpdateTimeouts.current[`${plan.id}-monthlySavings`];
                                if (existingTimeout) {
                                  clearTimeout(existingTimeout);
                                }
                                planUpdateTimeouts.current[`${plan.id}-monthlySavings`] = setTimeout(() => {
                                  try {
                                    const updated = [...savingsPlans];
                                    const newValue = vals[0];
                                    const currentMax = planMaxValues[plan.id]?.monthlySavings || defaultMonthlySavingsMax;
                                    const clampedValue = Math.max(0, Math.min(newValue, Math.min(currentMax, 999999999)));
                                    if (updated[idx].monthlySavings !== clampedValue) {
                                      updated[idx].monthlySavings = clampedValue;
                                      setSavingsPlans(updated);
                                    }
                                  } catch (error) {
                                    console.warn('Slider monthlySavings update error caught:', error);
                                  } finally {
                                    planUpdateTimeouts.current[`${plan.id}-monthlySavings`] = null;
                                  }
                                }, 50);
                              }}
                              onValueCommit={(vals) => {
                                const existingTimeout = planUpdateTimeouts.current[`${plan.id}-monthlySavings`];
                                if (existingTimeout) {
                                  clearTimeout(existingTimeout);
                                  planUpdateTimeouts.current[`${plan.id}-monthlySavings`] = null;
                                }
                                try {
                                  const updated = [...savingsPlans];
                                  const newValue = vals[0];
                                  const currentMax = planMaxValues[plan.id]?.monthlySavings || defaultMonthlySavingsMax;
                                  const clampedValue = Math.max(0, Math.min(newValue, Math.min(currentMax, 999999999)));
                                  updated[idx].monthlySavings = clampedValue;
                                  setSavingsPlans(updated);
                                  if (chartDataTimeoutRef.current) {
                                    clearTimeout(chartDataTimeoutRef.current);
                                  }
                                  setDebouncedChartData(chartData);
                                } catch (error) {
                                  console.warn('Slider monthlySavings commit error caught:', error);
                                }
                              }}
                              min={0}
                              max={planMaxValues[plan.id]?.monthlySavings || defaultMonthlySavingsMax}
                              step={500}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Avkastning (nominell)</Label>
                            <div className="flex items-center gap-2 mb-1">
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={plan.returnNominal.toFixed(1)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...savingsPlans];
                                  if (val === '') {
                                    updated[idx].returnNominal = 0;
                                  } else {
                                    const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
                                    if (!isNaN(num) && num >= 0 && num <= 15) {
                                      updated[idx].returnNominal = num;
                                    }
                                  }
                                  setSavingsPlans(updated);
                                }}
                                className="w-full text-xs"
                                placeholder="0.0"
                                min={0}
                                max={15}
                                step={0.1}
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                            <Slider
                              value={[plan.returnNominal]}
                              onValueChange={(vals) => {
                                try {
                                  const updated = [...savingsPlans];
                                  updated[idx].returnNominal = Math.max(0, Math.min(vals[0], 15));
                                  setSavingsPlans(updated);
                                } catch (error) {
                                  console.warn('Slider returnNominal update error caught:', error);
                                }
                              }}
                              onValueCommit={(vals) => {
                                try {
                                  const updated = [...savingsPlans];
                                  updated[idx].returnNominal = Math.max(0, Math.min(vals[0], 15));
                                  setSavingsPlans(updated);
                                  if (chartDataTimeoutRef.current) {
                                    clearTimeout(chartDataTimeoutRef.current);
                                  }
                                  setDebouncedChartData(chartData);
                                } catch (error) {
                                  console.warn('Slider returnNominal commit error caught:', error);
                                }
                              }}
                              min={0}
                              max={15}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Tidsperiod (år)</Label>
                            <div className="flex items-center gap-2 mb-1">
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={plan.years.toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...savingsPlans];
                                  if (val === '') {
                                    updated[idx].years = 1;
                                  } else {
                                    const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                                    if (!isNaN(num) && num >= 1 && num <= 40) {
                                      updated[idx].years = num;
                                    }
                                  }
                                  setSavingsPlans(updated);
                                }}
                                className="w-full text-xs"
                                placeholder="10"
                                min={1}
                                max={40}
                                step={1}
                              />
                              <span className="text-xs text-gray-500">år</span>
                            </div>
                            <Slider
                              value={[plan.years]}
                              onValueChange={(vals) => {
                                try {
                                  const updated = [...savingsPlans];
                                  updated[idx].years = Math.max(1, Math.min(vals[0], 40));
                                  setSavingsPlans(updated);
                                } catch (error) {
                                  console.warn('Slider years update error caught:', error);
                                }
                              }}
                              onValueCommit={(vals) => {
                                try {
                                  const updated = [...savingsPlans];
                                  updated[idx].years = Math.max(1, Math.min(vals[0], 40));
                                  setSavingsPlans(updated);
                                  if (chartDataTimeoutRef.current) {
                                    clearTimeout(chartDataTimeoutRef.current);
                                  }
                                  setDebouncedChartData(chartData);
                                } catch (error) {
                                  console.warn('Slider years commit error caught:', error);
                                }
                              }}
                              min={1}
                              max={40}
                              step={1}
                              className="w-full"
                            />
                          </div>
                      </div>
                      
                      {/* Scenario-val - visas endast om det finns aktiva scenarier */}
                      {(showWhatIf || showAnnualChange) && (
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <Label className="text-xs font-medium text-primary mb-2 block">
                            Applicera scenarier på denna plan:
                          </Label>
                          <div className="flex flex-col gap-2">
                            {showWhatIf && (
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`whatIf-${plan.id}`} className="text-xs text-gray-700 cursor-pointer">
                                  "Vad händer om"-scenario
                                </Label>
                                <Switch
                                  id={`whatIf-${plan.id}`}
                                  checked={plan.useWhatIf !== false}
                                  onCheckedChange={(checked) => {
                                    const updated = [...savingsPlans];
                                    updated[idx].useWhatIf = checked;
                                    setSavingsPlans(updated);
                                  }}
                                />
                              </div>
                            )}
                            {showAnnualChange && (
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`annualChange-${plan.id}`} className="text-xs text-gray-700 cursor-pointer">
                                  Årlig förändring
                                </Label>
                                <Switch
                                  id={`annualChange-${plan.id}`}
                                  checked={plan.useAnnualChange !== false}
                                  onCheckedChange={(checked) => {
                                    const updated = [...savingsPlans];
                                    updated[idx].useAnnualChange = checked;
                                    setSavingsPlans(updated);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {planResult && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Slutsumma efter {plan.years} år:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(planResult.finalAmount)}</span>
                          </div>
                        </div>
                      )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* År-för-år tabell */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6 lg:p-8 rounded-2xl border-2 border-emerald-200 shadow-lg mt-4 md:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Utveckling per år
                </h4>
                <p className="text-xs text-gray-600 italic">
                  Visar: <strong>Nuvarande plan</strong>
                </p>
              </div>
              <div className="max-h-96 overflow-x-auto overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm -mx-2 md:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-gray-700 font-bold w-12 sm:w-16">År</th>
                      <th className="text-right p-2 sm:p-3 md:p-4 text-gray-700 font-bold whitespace-nowrap">Total summa</th>
                      <th className="text-right p-2 sm:p-3 md:p-4 text-gray-700 font-bold whitespace-nowrap">Insatt totalt</th>
                      <th className="text-right p-2 sm:p-3 md:p-4 text-gray-700 font-bold whitespace-nowrap">Avkastning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveStartCapital > 0 && (
                      <tr className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <td className="p-2 sm:p-3 md:p-4 text-gray-700 font-semibold">Start</td>
                        <td className="p-2 sm:p-3 md:p-4 text-right font-bold text-gray-900 whitespace-nowrap">{formatCurrency(effectiveStartCapital)}</td>
                        <td className="p-2 sm:p-3 md:p-4 text-right text-gray-700 whitespace-nowrap font-medium">{formatCurrency(effectiveStartCapital)}</td>
                        <td className="p-2 sm:p-3 md:p-4 text-right text-gray-400 whitespace-nowrap">-</td>
                      </tr>
                    )}
                    {result.yearByYear.map((row, idx) => {
                      const totalContributed = effectiveStartCapital + row.contributed;
                      return (
                        <tr 
                          key={row.year} 
                          className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="p-2 sm:p-3 md:p-4 text-gray-700 font-semibold">{row.year}</td>
                          <td className="p-2 sm:p-3 md:p-4 text-right font-bold text-gray-900 whitespace-nowrap">{formatCurrency(row.amount)}</td>
                          <td className="p-2 sm:p-3 md:p-4 text-right text-gray-700 whitespace-nowrap font-medium">
                            {formatCurrency(totalContributed)}
                            <span className="text-xs text-gray-500 block mt-1">
                              (Start: {formatCurrency(effectiveStartCapital)} + Sparat: {formatCurrency(row.contributed)})
                            </span>
                            {row.savingsIncreased && row.increasedAmount && (
                              <span className="text-xs text-blue-600 font-medium block mt-1">
                                ⬆ Sparandet ökat med {formatCurrency(row.increasedAmount)}/månad (gäller från detta år)
                              </span>
                            )}
                          </td>
                          <td className={`p-2 sm:p-3 md:p-4 text-right font-semibold whitespace-nowrap ${row.interest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(row.interest)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Banner - Flyttad till botten */}
        <Card className="mt-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                  Vill du se hur ditt sparande passar in i din totala förmögenhet?
                </h3>
                <p className="text-sm text-primary/80 mb-4">
                  Med <strong>Förmögenhetskollen</strong> kan du koppla ihop ditt sparande med hela din ekonomi: bostad, pension, lån och övriga tillgångar. Du kan se en beräknad nettoförmögenhet, en uppskattad nivå i Rikedomstrappan och en simulerad bild av hur din ekonomi förändras varje månad – inte bara hur ett enskilt sparande växer.
                </p>
                <ul className="text-sm text-primary/80 space-y-1 mb-4">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-primary/80 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Få en samlad bild av tillgångar, skulder och pension</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-primary/80 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Se din beräknade nivå i Rikedomstrappan (The Wealth Ladder)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-primary/80 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Följ hur din nettoförmögenhet förändras månad för månad</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-primary/80 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Helt gratis och sparas lokalt i din webbläsare – ingen registrering</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="default"
                size="lg"
                className="w-full md:w-auto flex-shrink-0 bg-primary text-white hover:bg-primary/90"
              >
                Kom igång med Förmögenhetskollen
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Ytterligare verktyg */}
        <div className="mt-8 mb-6">
          <div className="border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-200/60">
                <Calculator className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-sm sm:text-base text-slate-700 mb-1">Ytterligare verktyg</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ytterligare kalkylatorer som kan vara användbara
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/fire')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-blue-50">
                    <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">FIRE-kalkylator</div>
                    <div className="text-xs text-slate-500 truncate">Ekonomisk frihet</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/salary')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-purple-50">
                    <CircleDollarSign className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Lönekalkylator</div>
                    <div className="text-xs text-slate-500 truncate">Efter skatt</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-blue-50">
                    <Home className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Förmögenhetskollen</div>
                    <div className="text-xs text-slate-500 truncate">Dashboard</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

