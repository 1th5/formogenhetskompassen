'use client';

import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils/format';
import { simulatePortfolio } from '@/lib/fire/simulate';
import { calculateFIRE, calculateAutoReturns } from '@/lib/fire/calc';
import { findSafeFireYear } from '@/lib/fire/validate';
import { calculatePersonNetIncome } from '@/lib/wealth/tax-calc';
import { 
  calculateAmortizationMonthly,
  calculatePublicPensionMonthlyAllocations,
  calculateOccupationalPensionMonthlyAllocations,
  calculatePremiePensionMonthlyAllocations,
  calculatePrivatePensionMonthlyAllocations,
  calculateNetWorth
} from '@/lib/wealth/calc';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { ArrowLeft, Info } from 'lucide-react';

// Hjälpkomponent för info-ikoner med pedagogisk information
function InfoIcon({ title, description }: { title: string; description: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Stäng tooltip när man klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.info-tooltip-container')) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTooltip]);

  return (
    <div className="relative info-tooltip-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 p-1 transition-colors cursor-help focus:outline-none"
        aria-label="Visa förklaring"
      >
        <Info className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 top-8 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-sm text-gray-700">
          <p className="font-medium mb-2">{title}</p>
          <div className="text-xs leading-relaxed">
            {description
              .replace(/\\n/g, '\n') // Konvertera escape-sekvenser till faktiska newlines
              .split('\n')
              .map((line, index, array) => {
                // Om raden är tom (dvs två newlines i rad), lägg till extra spacing
                if (line === '' && index < array.length - 1) {
                  return <div key={index} className="mb-2" />;
                }
                if (line === '') {
                  return null;
                }
                return (
                  <p key={index} className={index > 0 && array[index - 1] === '' ? 'mt-2' : ''}>
                    {line}
                  </p>
                );
              })
              .filter(Boolean)}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="mt-3 text-primary hover:text-primary/80 text-xs font-medium"
          >
            Stäng
          </button>
        </div>
      )}
    </div>
  );
}

export default function FIREPage() {
  const router = useRouter();
  const { draftHousehold } = useHouseholdStore();
  
  // Redirect om inget hushåll finns (nivå 0)
  useEffect(() => {
    const hasHousehold = draftHousehold && draftHousehold.persons && draftHousehold.persons.length > 0;
    if (!hasHousehold) {
      router.push('/dashboard');
    }
  }, [draftHousehold, router]);
  
  const [sliderInflation, setSliderInflation] = useState([2]);
  const [sliderPensionAge, setSliderPensionAge] = useState([63]);
  const [statePensionPayoutYears, setStatePensionPayoutYears] = useState([20]);
  const [occPensionEarlyStartAge, setOccPensionEarlyStartAge] = useState([55]);
  const [ipsEarlyStartAge, setIpsEarlyStartAge] = useState([55]);
  const [manualFireYear, setManualFireYear] = useState<number | null>(null);
  const [useCoastFire, setUseCoastFire] = useState(false);
  const [coastFireYears, setCoastFireYears] = useState([0]);
  
  // Beräkna initiala värden från hushåll
  const { fireResult, availableAtStart, averageAge, monthlySavings, assets, persons, liabilities, totalNetWorth } = useMemo(() => {
    if (!draftHousehold || !draftHousehold.persons || draftHousehold.persons.length === 0) {
      return {
        fireResult: null,
        availableAtStart: 0,
        averageAge: 40,
        monthlySavings: 0,
        assets: [],
        persons: [],
        liabilities: [],
        totalNetWorth: 0
      };
    }

    const assets = draftHousehold.assets || [];
    const liabilities = draftHousehold.liabilities || [];
    const persons = draftHousehold.persons || [];
    
    // Beräkna månadssparande
    const monthlySavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    const amortizationMonthly = calculateAmortizationMonthly(liabilities);
    const totalMonthlySavings = monthlySavings + amortizationMonthly;
    
    // Beräkna separata pensionsavsättningar
    const occPensionContribMonthly = calculateOccupationalPensionMonthlyAllocations(persons);
    const premiePensionContribMonthly = calculatePremiePensionMonthlyAllocations(persons);
    const privatePensionContribMonthly = calculatePrivatePensionMonthlyAllocations(persons);
    const statePensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);
    // Total marknadsbaserad pensionsavsättning (summan av de tre kategorierna)
    const marketPensionContribMonthly = occPensionContribMonthly + premiePensionContribMonthly + privatePensionContribMonthly;
    const pensionContribMonthly = marketPensionContribMonthly + statePensionContribMonthly;
    
    // Beräkna automatiska avkastningar (använd default inflation 2% för initial beräkning)
    // OBS: Denna initiala beräkning använder hårdkodad inflation 2% eftersom state inte är satt ännu.
    // Den dynamiska beräkningen längre ner använder sliderInflation från UI.
    const inflation = 0.02;
    const autoReturns = calculateAutoReturns(assets, inflation, 0.07, liabilities);
    
    // Förenklad beräkning av pension
    const monthlyPensionAfterTax = 0;
    
    // Utgifter = nettoinkomst − (spar + amortering)
    const totalNetIncomeMonthly = persons.reduce((sum, p) => sum + (calculatePersonNetIncome(p) || 0), 0);
    const customMonthlyExpenses = Math.max(0, totalNetIncomeMonthly - totalMonthlySavings);
    
    const totalNetWorth = calculateNetWorth(assets, liabilities);
    
    const baseFireResult = calculateFIRE(
      assets,
      persons,
      totalNetWorth,
      totalMonthlySavings,
      autoReturns.realReturnAvailable,
      63,
      monthlyPensionAfterTax,
      calculatePersonNetIncome,
      customMonthlyExpenses,
      inflation, // inflation (default 2% för initial beräkning)
      liabilities, // Skulder för att beräkna nettovärden per kategori
      autoReturns.realReturnOccPension,
      autoReturns.realReturnPremiePension,
      autoReturns.realReturnPrivatePension,
      autoReturns.realReturnStatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      occPensionEarlyStartAge[0], // Använd slider-värdet
      ipsEarlyStartAge[0] // Använd slider-värdet
    );
    
    // Validera FIRE-året mot simuleringen för att säkerställa att kapitalet inte tar slut före pension
    // (Detta görs bara för initiala värden - när användaren justerar reglagen i simulatorn kan de få scenarier där det inte håller)
    const fireResult = findSafeFireYear({
      baseResult: baseFireResult,
      assets,
      liabilities,
      persons,
      totalNetWorth,
      inflation,
      pensionStartAge: 63,
      maxAdditionalYears: 10
    });
    
    // Beräkna tillgängligt kapital
    const availableAtStart = fireResult.availableAtStart;
    
    // Beräkna genomsnittlig ålder
    const averageAge = Math.round(persons.reduce((sum, p) => {
      const age = new Date().getFullYear() - p.birth_year;
      return sum + age;
    }, 0) / persons.length);
    
    return {
      fireResult,
      availableAtStart,
      averageAge,
      monthlySavings,
      assets,
      persons,
      liabilities,
      totalNetWorth
    };
  }, [draftHousehold]);

  const [monthlyExpenses, setMonthlyExpenses] = useState(fireResult?.currentMonthlyExpenses || 0);
  
  // Beräkna månatlig amortering från skulder
  const amortizationMonthly = useMemo(() => {
    return calculateAmortizationMonthly(liabilities);
  }, [liabilities]);
  
  // Spara initialt värde för jämförelse
  const initialMonthlySavings = useMemo(() => {
    return monthlySavings + amortizationMonthly;
  }, [monthlySavings, amortizationMonthly]);
  
  const [sliderMonthlySavings, setSliderMonthlySavings] = useState(() => [initialMonthlySavings]);
  const [monthlySavingsMax, setMonthlySavingsMax] = useState(30000);
  
  // Max-värde för input (hard limit)
  const INPUT_MAX = 100000;
  
  // Deferred values för sliders (behövs för autoReturns)
  const dSliderInflation = useDeferredValue(sliderInflation);
  
  // Beräkna automatiska avkastningar baserat på tillgångar (använd inflation från slider)
  const autoReturns = useMemo(() => {
    const inflation = dSliderInflation[0] / 100;
    const fallbackNominal = 0.07;
    const STATE_PENSION_FALLBACK_NOMINAL = 0.03;
    
    if (!assets || assets.length === 0) {
      // Returnera default-värden om inga tillgångar finns, men beräkna reala med aktuell inflation
      return {
        nomAvailable: fallbackNominal,
        nomOccPension: fallbackNominal,
        nomPremiePension: fallbackNominal,
        nomPrivatePension: fallbackNominal,
        nomStatePension: STATE_PENSION_FALLBACK_NOMINAL,
        realReturnAvailable: ((1 + fallbackNominal) / (1 + inflation)) - 1,
        realReturnOccPension: ((1 + fallbackNominal) / (1 + inflation)) - 1,
        realReturnPremiePension: ((1 + fallbackNominal) / (1 + inflation)) - 1,
        realReturnPrivatePension: ((1 + fallbackNominal) / (1 + inflation)) - 1,
        realReturnStatePension: ((1 + STATE_PENSION_FALLBACK_NOMINAL) / (1 + inflation)) - 1
      };
    }
    return calculateAutoReturns(assets, inflation, fallbackNominal, liabilities);
  }, [assets, dSliderInflation]);
  
  // Beräkna dynamiska min/max-värden för sliders baserat på autoReturns
  const sliderBounds = useMemo(() => {
    const DEFAULT_MIN = -5;
    const DEFAULT_MAX = 15;
    const MARGIN = 2; // Marginal för att ge lite utrymme
    
    if (!autoReturns) {
      return {
        available: { min: DEFAULT_MIN, max: DEFAULT_MAX },
        pension: { min: DEFAULT_MIN, max: DEFAULT_MAX },
        occPension: { min: DEFAULT_MIN, max: DEFAULT_MAX },
        premiePension: { min: DEFAULT_MIN, max: DEFAULT_MAX },
        privatePension: { min: DEFAULT_MIN, max: DEFAULT_MAX }
      };
    }
    
    // Samla alla autoReturns-värden för att hitta min/max
    const allReturns = [
      autoReturns.nomAvailable * 100,
      autoReturns.nomOccPension * 100,
      autoReturns.nomPremiePension * 100,
      autoReturns.nomPrivatePension * 100
    ].filter(v => Number.isFinite(v));
    
    const globalMin = allReturns.length > 0 ? Math.min(...allReturns) : DEFAULT_MIN;
    const globalMax = allReturns.length > 0 ? Math.max(...allReturns) : DEFAULT_MAX;
    
    // Beräkna bounds för varje slider med marginal
    const calculateBounds = (value: number) => ({
      min: Math.min(DEFAULT_MIN, Math.floor(value) - MARGIN),
      max: Math.max(DEFAULT_MAX, Math.ceil(value) + MARGIN)
    });
    
    const availableBounds = calculateBounds(autoReturns.nomAvailable * 100);
    const occBounds = calculateBounds(autoReturns.nomOccPension * 100);
    const premieBounds = calculateBounds(autoReturns.nomPremiePension * 100);
    const privateBounds = calculateBounds(autoReturns.nomPrivatePension * 100);
    
    // För pensionstillgångar (genomsnitt), använd den bredaste bounds
    const pensionMin = Math.min(occBounds.min, premieBounds.min, privateBounds.min);
    const pensionMax = Math.max(occBounds.max, premieBounds.max, privateBounds.max);
    
    return {
      available: availableBounds,
      pension: { min: pensionMin, max: pensionMax },
      occPension: occBounds,
      premiePension: premieBounds,
      privatePension: privateBounds
    };
  }, [autoReturns]);

  // State för separata avkastningar (kan överstyra auto)
  const [sliderReturnAvailable, setSliderReturnAvailable] = useState(() => 
    autoReturns ? [autoReturns.nomAvailable * 100] : [7]
  );
  const [sliderReturnPension, setSliderReturnPension] = useState(() => {
    if (!autoReturns) return [7];
    const avgNomPension = (autoReturns.nomOccPension + autoReturns.nomPremiePension + autoReturns.nomPrivatePension) / 3;
    return [avgNomPension * 100];
  });
  // Tre separata sliders för pensionsavkastning (endast används i manuellt läge)
  const [sliderReturnOccPension, setSliderReturnOccPension] = useState(() => {
    if (!autoReturns) return [7];
    return [(autoReturns.nomOccPension ?? 0.07) * 100];
  });
  const [sliderReturnPremiePension, setSliderReturnPremiePension] = useState(() => {
    if (!autoReturns) return [7];
    return [(autoReturns.nomPremiePension ?? 0.07) * 100];
  });
  const [sliderReturnPrivatePension, setSliderReturnPrivatePension] = useState(() => {
    if (!autoReturns) return [7];
    return [(autoReturns.nomPrivatePension ?? 0.07) * 100];
  });
  const [useAutoReturns, setUseAutoReturns] = useState(true);
  
  // Synka Auto-värden till sliders när de uppdateras
  useEffect(() => {
    if (useAutoReturns) {
      const inflation = dSliderInflation[0] / 100;
      const fallbackNominal = 0.07;
      const stableAutoReturns = calculateAutoReturns(assets, inflation, fallbackNominal, liabilities);
      
      setSliderReturnAvailable([stableAutoReturns.nomAvailable * 100]);
      // För bakåtkompatibilitet: använd summan av de tre pensionskategorierna
      const nomPension = (stableAutoReturns.nomOccPension + stableAutoReturns.nomPremiePension + stableAutoReturns.nomPrivatePension) / 3;
      setSliderReturnPension([nomPension * 100]);
    } else {
      // När man växlar till manuellt läge: initiera de tre separata sliders från autoReturns
      const inflation = dSliderInflation[0] / 100;
      const fallbackNominal = 0.07;
      const stableAutoReturns = calculateAutoReturns(assets, inflation, fallbackNominal, liabilities);
      
      // Initiera de tre separata sliders med värden från autoReturns
      // Om någon saknas, använd genomsnittet av de andra eller fallback
      const avgNomPension = (stableAutoReturns.nomOccPension + stableAutoReturns.nomPremiePension + stableAutoReturns.nomPrivatePension) / 3;
      const baseOcc = stableAutoReturns.nomOccPension ?? avgNomPension ?? fallbackNominal;
      const basePremie = stableAutoReturns.nomPremiePension ?? avgNomPension ?? fallbackNominal;
      const basePrivate = stableAutoReturns.nomPrivatePension ?? avgNomPension ?? fallbackNominal;
      
      setSliderReturnOccPension([baseOcc * 100]);
      setSliderReturnPremiePension([basePremie * 100]);
      setSliderReturnPrivatePension([basePrivate * 100]);
    }
  }, [useAutoReturns, assets, dSliderInflation, liabilities]);
  
  // Justera slider-värden om de är utanför bounds när bounds ändras (endast om de faktiskt är utanför)
  useEffect(() => {
    // Justera available slider
    const currentAvailable = sliderReturnAvailable[0];
    if (currentAvailable < sliderBounds.available.min || currentAvailable > sliderBounds.available.max) {
      const clamped = Math.max(sliderBounds.available.min, Math.min(sliderBounds.available.max, currentAvailable));
      if (clamped !== currentAvailable) {
        setSliderReturnAvailable([clamped]);
      }
    }
    
    // Justera pension slider
    const currentPension = sliderReturnPension[0];
    if (currentPension < sliderBounds.pension.min || currentPension > sliderBounds.pension.max) {
      const clamped = Math.max(sliderBounds.pension.min, Math.min(sliderBounds.pension.max, currentPension));
      if (clamped !== currentPension) {
        setSliderReturnPension([clamped]);
      }
    }
    
    // Justera separata pensionssliders
    const currentOcc = sliderReturnOccPension[0];
    if (currentOcc < sliderBounds.occPension.min || currentOcc > sliderBounds.occPension.max) {
      const clamped = Math.max(sliderBounds.occPension.min, Math.min(sliderBounds.occPension.max, currentOcc));
      if (clamped !== currentOcc) {
        setSliderReturnOccPension([clamped]);
      }
    }
    
    const currentPremie = sliderReturnPremiePension[0];
    if (currentPremie < sliderBounds.premiePension.min || currentPremie > sliderBounds.premiePension.max) {
      const clamped = Math.max(sliderBounds.premiePension.min, Math.min(sliderBounds.premiePension.max, currentPremie));
      if (clamped !== currentPremie) {
        setSliderReturnPremiePension([clamped]);
      }
    }
    
    const currentPrivate = sliderReturnPrivatePension[0];
    if (currentPrivate < sliderBounds.privatePension.min || currentPrivate > sliderBounds.privatePension.max) {
      const clamped = Math.max(sliderBounds.privatePension.min, Math.min(sliderBounds.privatePension.max, currentPrivate));
      if (clamped !== currentPrivate) {
        setSliderReturnPrivatePension([clamped]);
      }
    }
  }, [sliderBounds]);
  
  // Beräkna månadsvis pensionsavsättning från personer (separerat per kategori)
  const occPensionContribMonthly = useMemo(() => {
    return calculateOccupationalPensionMonthlyAllocations(persons);
  }, [persons]);
  
  const premiePensionContribMonthly = useMemo(() => {
    return calculatePremiePensionMonthlyAllocations(persons);
  }, [persons]);
  
  const privatePensionContribMonthly = useMemo(() => {
    return calculatePrivatePensionMonthlyAllocations(persons);
  }, [persons]);
  
  const statePensionContribMonthly = useMemo(() => {
    return calculatePublicPensionMonthlyAllocations(persons);
  }, [persons]);
  
  // För bakåtkompatibilitet
  const marketPensionContribMonthly = useMemo(() => {
    return occPensionContribMonthly + premiePensionContribMonthly + privatePensionContribMonthly;
  }, [occPensionContribMonthly, premiePensionContribMonthly, privatePensionContribMonthly]);
  
  // Total pensionsavsättning (för bakåtkompatibilitet och Coast FIRE-beräkning)
  const pensionContribMonthly = marketPensionContribMonthly + statePensionContribMonthly;
  
  // Defer snabb sliderdrag
  const dMonthlyExpenses = useDeferredValue(monthlyExpenses);

  // Coast FIRE: räkna ner marknadspensionsavsättning i samma proportion som
  // sparandet tidigare var del av (spar + utgift), och ta bort löneväxling.
  const coastFirePensionContribs = useMemo(() => {
    const years = coastFireYears?.[0] ?? 0;
    if (!useCoastFire || years === 0 || !persons || persons.length === 0) {
      return { occ: occPensionContribMonthly, premie: premiePensionContribMonthly, private: privatePensionContribMonthly };
    }

    // Beräkna sparande som procent av (sparande + utgifter)
    const totalMonthlySavings = monthlySavings + amortizationMonthly;
    const totalMonthlyExpenses = dMonthlyExpenses;
    const totalIncome = totalMonthlySavings + totalMonthlyExpenses;
    
    if (totalIncome <= 0) {
      return { occ: occPensionContribMonthly, premie: premiePensionContribMonthly, private: privatePensionContribMonthly };
    }

    const savingsPercentage = totalMonthlySavings / totalIncome;

    // Skapa temporära personer med reducerade inkomster
    const reducedPersons = persons.map(person => {
      const reducedIncomes = person.incomes?.map(income => {
        if (income.income_type === 'job') {
          // Sänk pensionsgrundande inkomster (job-inkomster) med sparande-procenten
          // Ta bort löneväxling
          // Säkerställ att custom_tp_rate är decimal (om det finns gammal data som procent, konvertera)
          let customTpRate = income.custom_tp_rate;
          if (income.tp_input_type === 'percentage' && customTpRate !== undefined && customTpRate > 1) {
            customTpRate = customTpRate / 100;
          }
          
          return {
            ...income,
            monthly_income: income.monthly_income * (1 - savingsPercentage),
            salary_exchange_monthly: 0, // Ta bort löneväxling
            custom_tp_rate: customTpRate // Säkerställ att det är decimal
          };
        }
        return income;
      });

      return {
        ...person,
        incomes: reducedIncomes
      };
    });

    // Beräkna ny marknadsbaserad pensionsavsättning med reducerade inkomster
    // Statlig pensionsavsättning (inkomstpension) är ofta obligatorisk och påverkas inte av Coast FIRE
    const reducedOcc = calculateOccupationalPensionMonthlyAllocations(reducedPersons);
    const reducedPremie = calculatePremiePensionMonthlyAllocations(reducedPersons);
    const reducedPrivate = calculatePrivatePensionMonthlyAllocations(reducedPersons);
    // Returnera som objekt så vi kan använda separata värden
    return { occ: reducedOcc, premie: reducedPremie, private: reducedPrivate };
  }, [useCoastFire, coastFireYears, persons, monthlySavings, amortizationMonthly, dMonthlyExpenses, occPensionContribMonthly, premiePensionContribMonthly, privatePensionContribMonthly]);
  // dSliderInflation är redan deklarerad tidigare (används för autoReturns)
  const dSliderPensionAge = useDeferredValue(sliderPensionAge);
  const dSliderStatePensionPayoutYears = useDeferredValue(statePensionPayoutYears);
  const dSliderReturnAvailable = useDeferredValue(sliderReturnAvailable);
  const dSliderReturnPension = useDeferredValue(sliderReturnPension);
  const dSliderReturnOccPension = useDeferredValue(sliderReturnOccPension);
  const dSliderReturnPremiePension = useDeferredValue(sliderReturnPremiePension);
  const dSliderReturnPrivatePension = useDeferredValue(sliderReturnPrivatePension);
  const dSliderMonthlySavings = useDeferredValue(sliderMonthlySavings);

  // Beräkna reala avkastningar (auto eller manuella)
  const realReturns = useMemo(() => {
    const inflation = dSliderInflation[0] / 100;
    
    let realReturnAvailable: number;
    let realReturnStatePension: number;
    let realReturnOccPension: number;
    let realReturnPremiePension: number;
    let realReturnPrivatePension: number;
    
    if (useAutoReturns) {
      realReturnAvailable = autoReturns.realReturnAvailable;
      realReturnStatePension = autoReturns.realReturnStatePension;
      realReturnOccPension = autoReturns.realReturnOccPension;
      realReturnPremiePension = autoReturns.realReturnPremiePension;
      realReturnPrivatePension = autoReturns.realReturnPrivatePension;
    } else {
      // Manuellt läge: använd värden från sliders
      const nomAvailable = dSliderReturnAvailable[0] / 100;
      const nomOcc = dSliderReturnOccPension[0] / 100;
      const nomPremie = dSliderReturnPremiePension[0] / 100;
      const nomPrivate = dSliderReturnPrivatePension[0] / 100;
      
      realReturnAvailable = ((1 + nomAvailable) / (1 + inflation)) - 1;
      // För statlig pension: använd auto-beräkning (default 3% nominellt)
      realReturnStatePension = autoReturns.realReturnStatePension;
      
      // För separata pensionskategorier: konvertera från nominella sliders till reala
      realReturnOccPension = ((1 + nomOcc) / (1 + inflation)) - 1;
      realReturnPremiePension = ((1 + nomPremie) / (1 + inflation)) - 1;
      realReturnPrivatePension = ((1 + nomPrivate) / (1 + inflation)) - 1;
    }
    
    const POST_FIRE_NOMINAL_RETURN = 0.07;
    const realPostFireReturnAvailable = Math.max(
      ((1 + POST_FIRE_NOMINAL_RETURN) / (1 + inflation)) - 1,
      realReturnAvailable
    );
    
    return {
      realReturnAvailable,
      realReturnStatePension,
      realReturnOccPension,
      realReturnPremiePension,
      realReturnPrivatePension,
      realPostFireReturnAvailable
    };
  }, [useAutoReturns, autoReturns, dSliderReturnAvailable, dSliderReturnPension, dSliderReturnOccPension, dSliderReturnPremiePension, dSliderReturnPrivatePension, dSliderInflation]);
  
  // Beräkna FIRE med uppdaterade parametrar
  const dynamicFireResult = useMemo(() => {
    return calculateFIRE(
      assets,
      persons,
      totalNetWorth,
      dSliderMonthlySavings[0],
      realReturns.realReturnAvailable,
      dSliderPensionAge[0],
      0,
      calculatePersonNetIncome,
      dMonthlyExpenses,
      dSliderInflation[0] / 100,
      liabilities,
      realReturns.realReturnOccPension,
      realReturns.realReturnPremiePension,
      realReturns.realReturnPrivatePension,
      realReturns.realReturnStatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      occPensionEarlyStartAge[0],
      ipsEarlyStartAge[0]
    );
  }, [
    assets,
    persons,
    totalNetWorth,
    dSliderMonthlySavings,
    realReturns.realReturnAvailable,
    realReturns.realReturnOccPension,
    realReturns.realReturnPremiePension,
    realReturns.realReturnPrivatePension,
    realReturns.realReturnStatePension,
    dSliderPensionAge,
    dMonthlyExpenses,
    dSliderInflation,
    liabilities,
    occPensionContribMonthly,
    premiePensionContribMonthly,
    privatePensionContribMonthly,
    occPensionEarlyStartAge,
    ipsEarlyStartAge
  ]);
  
  // Beräkna 4%-kravet live (inkluderar statlig pension)
  const requiredAtPensionLive = useMemo(() => {
    const annualExpenses = dMonthlyExpenses * 12;
    // Ta hänsyn till statlig pension (samma som i calculateFIRE)
    const statePensionIncome = dynamicFireResult?.statePensionAnnualIncome || 0;
    const totalPensionIncome = statePensionIncome; // monthlyPensionAfterTax är alltid 0 i denna vy
    return Math.max(0, (annualExpenses - totalPensionIncome) * 25);
  }, [dMonthlyExpenses, dynamicFireResult?.statePensionAnnualIncome]);

  // Använd manuellt valt FIRE-år om det finns, annars beräknat
  // Om användaren inte har justerat reglagen, använd det validerade året från fireResult
  // När de börjar justera, använd dynamicFireResult (som kan visa osäkra scenarier)
  const hasUserAdjusted = useMemo(() => {
    // Kontrollera om några reglage har ändrats från default
    return (
      sliderInflation[0] !== 2 ||
      sliderPensionAge[0] !== 63 ||
      sliderReturnAvailable[0] !== (autoReturns.nomAvailable * 100) ||
      sliderReturnPension[0] !== ((autoReturns.nomOccPension + autoReturns.nomPremiePension + autoReturns.nomPrivatePension) / 3 * 100) ||
      sliderMonthlySavings[0] !== initialMonthlySavings ||
      monthlyExpenses !== fireResult?.currentMonthlyExpenses ||
      manualFireYear !== null
    );
  }, [
    sliderInflation,
    sliderPensionAge,
    sliderReturnAvailable,
    sliderReturnPension,
    sliderMonthlySavings,
    initialMonthlySavings,
    monthlyExpenses,
    manualFireYear,
    autoReturns,
    fireResult?.currentMonthlyExpenses
  ]);
  
  // Kontrollera om användaren inte har ändrat något (pristine state)
  const isPristine = !hasUserAdjusted && fireResult !== null;

  const effectiveFireYear = useMemo(() => {
    if (manualFireYear !== null) {
      const fireAge = manualFireYear;
      const yearsToFire = fireAge - averageAge;
      return yearsToFire >= 0 ? yearsToFire : null;
    }
    // Om användaren inte har justerat, använd det validerade året från fireResult
    // Annars använd dynamicFireResult (som kan visa osäkra scenarier)
    if (!hasUserAdjusted && fireResult && fireResult.yearsToFire !== null) {
      return fireResult.yearsToFire;
    }
    return dynamicFireResult.yearsToFire;
  }, [manualFireYear, dynamicFireResult.yearsToFire, fireResult?.yearsToFire, averageAge, hasUserAdjusted]);
  
  // Validera och återställ manualFireYear om det blir ogiltigt
  useEffect(() => {
    if (manualFireYear !== null) {
      if (manualFireYear < averageAge || manualFireYear >= sliderPensionAge[0]) {
        setManualFireYear(null);
      }
    }
    if (dynamicFireResult.yearsToFire === null && manualFireYear !== null) {
      setManualFireYear(null);
    }
  }, [manualFireYear, averageAge, sliderPensionAge, dynamicFireResult.yearsToFire]);

  // Simulera portföljen
  // Om användaren inte har ändrat något (pristine), använd det validerade resultatet (fireResult)
  // Annars använd dynamicFireResult (som kan visa osäkra scenarier)
  const simulation = useMemo(() => {
    const source = isPristine ? fireResult : dynamicFireResult;
    
    const bridgeYears = effectiveFireYear !== null 
      ? Math.max(0, dSliderPensionAge[0] - (averageAge + effectiveFireYear))
      : 0;
    const maxCoastYears = Math.floor(bridgeYears);
    
    // Hämta statlig pensionsdata
    const statePensionAtStart = source?.statePensionAtStart ?? 0;
    const statePensionAnnualIncome = source?.statePensionAnnualIncome ?? 0;
    // Om pristine, använd payout-år från fireResult, annars från slider
    const statePensionPayoutYears = isPristine
      ? (fireResult?.statePensionPayoutYears ?? dSliderStatePensionPayoutYears[0])
      : dSliderStatePensionPayoutYears[0];
    
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
    
    // Skicka in normala pensionsavsättningar som standard
    // Coast FIRE-pensionsavsättningar skickas separat och används bara under Coast FIRE-perioden
    const hasActiveCoast = useCoastFire && (coastFireYears[0] ?? 0) > 0;
    
    // Baila tidigt om source saknas
    if (!source) {
      return {
        data: [],
        fireYear: null,
        pensionStartYear: averageAge + dSliderPensionAge[0],
        requiredAtPension: requiredAtPensionLive,
        capitalDepletedYear: null
      };
    }
    
    return simulatePortfolio(
      source.availableAtStart,
      0, // pensionLockedAtStart - inte längre används, ersatt av separata pensionshinkar
      dSliderMonthlySavings[0],
      realReturns.realReturnAvailable,
      0, // realReturnPension - inte längre används, ersatt av separata pensionsavkastningar
      dMonthlyExpenses * 12,
      averageAge,
      dSliderPensionAge[0],
      requiredAtPensionLive,
      effectiveFireYear,
      0,
      0, // pensionContribMonthly - inte längre används, ersatt av separata pensionsavsättningar
      dSliderInflation[0] / 100,
      hasActiveCoast,
      hasActiveCoast ? Math.min(coastFireYears[0], maxCoastYears) : 0,
      0, // coastFirePensionContribMonthly - inte längre används
      statePensionAtStart,
      realReturns.realReturnStatePension,
      statePensionContribMonthly,
      statePensionPayoutYears,
      statePensionAnnualIncome,
      // Separata pensionsparametrar
      occPensionAtStart,
      premiePensionAtStart,
      privatePensionAtStart,
      realReturns.realReturnOccPension,
      realReturns.realReturnPremiePension,
      realReturns.realReturnPrivatePension,
      // Normala pensionsavsättningar (används före FIRE)
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      // Coast FIRE-pensionsavsättningar (används bara under Coast FIRE-perioden)
      hasActiveCoast ? coastFirePensionContribs.occ : undefined,
      hasActiveCoast ? coastFirePensionContribs.premie : undefined,
      hasActiveCoast ? coastFirePensionContribs.private : undefined,
      occPensionEarlyStartAge[0],
      ipsEarlyStartAge[0]
    );
  }, [
    isPristine,
    fireResult,
    dynamicFireResult,
    dSliderStatePensionPayoutYears,
    dSliderMonthlySavings,
    realReturns.realReturnAvailable,
    realReturns.realReturnOccPension,
    realReturns.realReturnPremiePension,
    realReturns.realReturnPrivatePension,
    realReturns.realReturnStatePension,
    dMonthlyExpenses,
    averageAge,
    dSliderPensionAge,
    requiredAtPensionLive,
    effectiveFireYear,
    marketPensionContribMonthly,
    occPensionContribMonthly,
    premiePensionContribMonthly,
    privatePensionContribMonthly,
    statePensionContribMonthly,
    dSliderInflation,
    useCoastFire,
    coastFireYears,
    coastFirePensionContribs,
    occPensionEarlyStartAge,
    ipsEarlyStartAge,
    assets
  ]);
  
  // Hämta portfölj vid frihet från simuleringen (för att matcha grafen)
  const portfolioAtFireFromSimulation = useMemo(() => {
    if (effectiveFireYear === null) return null;
    const fireAge = averageAge + effectiveFireYear;
    const dataPoint = simulation.data.find(d => d.age === fireAge);
    return dataPoint ? dataPoint.available : null;
  }, [simulation.data, effectiveFireYear, averageAge]);

  // Använd simuleringens värde om det finns, annars fallback till calculateFIRE
  const portfolioAtFire = portfolioAtFireFromSimulation !== null 
    ? portfolioAtFireFromSimulation 
    : (effectiveFireYear !== null ? dynamicFireResult.portfolioAtFire : 0);

  // Detektera om vi är på mobil
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Beräkna när 4%-regeln nås (total >= requiredAtPensionLive)
  const fourPercentRuleMetYear = useMemo(() => {
    if (requiredAtPensionLive <= 0) return null;
    const dataPoint = simulation.data.find(d => d.total >= requiredAtPensionLive);
    return dataPoint ? dataPoint.age : null;
  }, [simulation.data, requiredAtPensionLive]);

  // Beräkna när tillgängligt kapital går över FIRE-linjen
  const availableCrossesFIREYear = useMemo(() => {
    if (requiredAtPensionLive <= 0) return null;
    const dataPoint = simulation.data.find(d => d.available >= requiredAtPensionLive);
    return dataPoint ? dataPoint.age : null;
  }, [simulation.data, requiredAtPensionLive]);

  // Analysera grafen för dynamisk beskrivning
  const graphAnalysis = useMemo(() => {
    if (!simulation.data || simulation.data.length === 0) return null;
    
    const fireAge = effectiveFireYear !== null ? averageAge + effectiveFireYear : null;
    const pensionAge = sliderPensionAge[0];
    const bridgeYears = fireAge !== null ? Math.max(0, pensionAge - fireAge) : 0;
    
    // Beräkna när uttag faktiskt börjar (efter Coast FIRE om aktivt)
    const coastYears = useCoastFire && coastFireYears[0] > 0 ? coastFireYears[0] : 0;
    const withdrawalStartAge = fireAge !== null && coastYears > 0 
      ? Math.min(fireAge + coastYears, pensionAge)
      : fireAge;
    const actualWithdrawalYears = withdrawalStartAge !== null && pensionAge > withdrawalStartAge
      ? pensionAge - withdrawalStartAge
      : 0;
    
    // Beräkna årsutgifter från månadsutgifter
    const annualExpenses = dMonthlyExpenses * 12;
    
    // Hitta data för FIRE-året
    const fireYearData = fireAge !== null 
      ? simulation.data.find(d => d.age === fireAge) 
      : null;
    
    // Hitta data för när uttag faktiskt börjar
    const withdrawalStartData = withdrawalStartAge !== null
      ? simulation.data.find(d => d.age === withdrawalStartAge)
      : null;
    
    // Hitta data för pensionsåldern
    const pensionYearData = simulation.data.find(d => d.age === pensionAge);
    
    // Analysera withdrawal rate vid faktisk uttagsstart (efter coast om aktivt)
    const withdrawalRateAtStart = withdrawalStartData && withdrawalStartData.available > 0 && annualExpenses > 0
      ? (annualExpenses / withdrawalStartData.available) * 100
      : null;
    
    // Analysera withdrawal rate vid FIRE (för jämförelse)
    const withdrawalRateAtFire = fireYearData && fireYearData.available > 0 && annualExpenses > 0
      ? (annualExpenses / fireYearData.available) * 100
      : null;
    
    // Hitta lägsta tillgängliga kapital under faktisk uttagsperiod (efter coast)
    const withdrawalPeriodData = withdrawalStartAge !== null && pensionAge > withdrawalStartAge
      ? simulation.data.filter(d => d.age >= withdrawalStartAge && d.age <= pensionAge)
      : [];
    const minAvailableDuringWithdrawal = withdrawalPeriodData.length > 0
      ? Math.min(...withdrawalPeriodData.map(d => d.available))
      : null;
    const minAvailableAge = minAvailableDuringWithdrawal !== null
      ? withdrawalPeriodData.find(d => d.available === minAvailableDuringWithdrawal)?.age
      : null;
    
    // Hitta lägsta tillgängliga kapital under hela bridge-perioden (för jämförelse)
    const bridgeData = fireAge !== null && pensionAge > fireAge
      ? simulation.data.filter(d => d.age >= fireAge && d.age <= pensionAge)
      : [];
    const minAvailableDuringBridge = bridgeData.length > 0
      ? Math.min(...bridgeData.map(d => d.available))
      : null;
    
    // Beräkna genomsnittlig withdrawal rate under faktisk uttagsperiod
    const avgWithdrawalRate = withdrawalPeriodData.length > 0 && annualExpenses > 0
      ? withdrawalPeriodData.reduce((sum, d) => {
          const rate = d.available > 0 ? (annualExpenses / d.available) * 100 : 0;
          return sum + rate;
        }, 0) / withdrawalPeriodData.length
      : null;
    
    // Kolla om kapitalet växer eller minskar under bridge
    const capitalGrowthDuringBridge = fireYearData && pensionYearData
      ? ((pensionYearData.available - fireYearData.available) / fireYearData.available) * 100
      : null;
    
    // Kolla kapitaltillväxt under faktisk uttagsperiod
    const capitalGrowthDuringWithdrawal = withdrawalStartData && pensionYearData
      ? ((pensionYearData.available - withdrawalStartData.available) / withdrawalStartData.available) * 100
      : null;
    
    // Beräkna hur mycket kapitalet behöver växa för att nå 4%-kravet
    // Om Coast FIRE täcker hela bridge-perioden, kolla om kapitalet vid pensionsåldern redan överstiger kravet
    // Annars beräkna från när uttag faktiskt börjar
    const coastCoversFullBridgeCheck = coastYears > 0 && bridgeYears > 0 && coastYears >= bridgeYears;
    const capitalNeededToGrow = (() => {
      if (coastCoversFullBridgeCheck && fireYearData && pensionYearData) {
        // Om Coast FIRE täcker hela bridge-perioden, kolla om kapitalet vid pensionsåldern redan överstiger 4%-kravet
        // Om det gör det, returnera null (ingen varning behövs)
        // Om det inte gör det, beräkna från FIRE-året (men detta reflekterar att kapitalet har växt under Coast FIRE)
        if (pensionYearData.available >= requiredAtPensionLive) {
          // Kapitalet vid pensionsåldern överstiger redan 4%-kravet - ingen varning behövs
          return null;
        }
        // Kapitalet har växt från FIRE-året till pensionsåldern, men räcker fortfarande inte
        // Beräkna hur mycket mer det behöver växa från nuvarande värde vid pensionsåldern
        return requiredAtPensionLive > pensionYearData.available
          ? ((requiredAtPensionLive - pensionYearData.available) / pensionYearData.available) * 100
      : null;
      } else if (withdrawalStartData) {
        // Annars beräkna från när uttag faktiskt börjar
        return requiredAtPensionLive > withdrawalStartData.available
          ? ((requiredAtPensionLive - withdrawalStartData.available) / withdrawalStartData.available) * 100
          : null;
      }
      return null;
    })();
    
    // Kolla om statlig pension hjälper
    const statePensionHelps = pensionYearData && pensionYearData.statePensionIncome 
      ? pensionYearData.statePensionIncome > 0
      : false;
    
    // Beräkna hur nära kapitalet är att ta slut (procent av startvärdet vid faktisk uttagsstart)
    const capitalBuffer = minAvailableDuringWithdrawal !== null && withdrawalStartData
      ? (minAvailableDuringWithdrawal / withdrawalStartData.available) * 100
      : null;
    
    // Kolla om Coast FIRE täcker hela bridge-perioden
    const coastCoversFullBridge = coastYears > 0 && bridgeYears > 0 && coastYears >= bridgeYears;
    
    // Kolla om Coast FIRE förbättrar situationen signifikant
    const coastSignificantlyHelps = coastYears > 0 && withdrawalStartData && fireYearData
      ? withdrawalStartData.available > fireYearData.available * 1.1 // Minst 10% mer kapital efter coast
      : false;
    
    return {
      fireAge,
      pensionAge,
      bridgeYears,
      fireYearData,
      pensionYearData,
      withdrawalRateAtFire,
      withdrawalRateAtStart, // Ny: withdrawal rate vid faktisk uttagsstart
      withdrawalStartAge, // Ny: ålder när uttag faktiskt börjar
      actualWithdrawalYears, // Ny: antal år med faktiska uttag
      withdrawalStartData, // Ny: data vid faktisk uttagsstart
      minAvailableDuringBridge,
      minAvailableDuringWithdrawal, // Ny: lägsta kapital under faktisk uttagsperiod
      minAvailableAge,
      avgWithdrawalRate,
      capitalGrowthDuringBridge,
      capitalGrowthDuringWithdrawal, // Ny: kapitaltillväxt under faktisk uttagsperiod
      capitalNeededToGrow,
      statePensionHelps,
      capitalBuffer,
      coastYears, // Ny: antal år med Coast FIRE
      coastCoversFullBridge, // Ny: om Coast FIRE täcker hela bridge-perioden
      coastSignificantlyHelps // Ny: om Coast FIRE förbättrar situationen signifikant
    };
  }, [simulation.data, effectiveFireYear, averageAge, sliderPensionAge, dMonthlyExpenses, requiredAtPensionLive, useCoastFire, coastFireYears]);

  // Preparera data för graf - begränsa till 80 år på mobil
  const chartData = useMemo(() => {
    const allData = simulation.data.map(d => {
      return {
        ...d, // Sprid in alla fält från simuleringen (availableReturn, savingsContrib, netWithdrawal, osv)
        År: d.age,
        Tillgängligt: d.available,
        'Marknadsbaserad pension': d.pension,
        // Total inkluderar redan statlig pension (kapital fram till pension, inkomst efter)
        Total: d.total,
        'Statlig pension (inkomst)': d.statePensionCapital || d.statePensionIncome, // Visa statlig inkomstpension (kapital fram till pension, inkomst efter)
      };
    });
    
    // Filtrera till max 80 år på mobil
    return isMobile ? allData.filter(d => d.År <= 80) : allData;
  }, [simulation.data, isMobile]);

  // Scroll till FIRE-kortet när man kommer tillbaka
  const handleBack = () => {
    router.push('/dashboard');
    // Scroll till FIRE-kortet efter navigation
    setTimeout(() => {
      const fireCard = document.getElementById('fire-card');
      if (fireCard) {
        fireCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  if (!fireResult) {
    return (
      <div className="min-h-screen bg-[var(--surface-bg)] py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button onClick={handleBack} variant="secondary" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till översikt
          </Button>
          <div className="text-center py-12">
            <p className="text-primary/70">Inget hushåll hittades. Gå tillbaka till översikten för att lägga till data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-4 md:py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button onClick={handleBack} variant="secondary" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till översikt
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-primary">Kapital över tid (realt)</h1>
              <p className="text-sm md:text-base text-primary/70 mt-1">
                Ekonomisk frihet nås, enl. FIRE, när tillgängligt kapital räcker fram till pension och vid pensionsstart överstiger 4%-kravet.
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/fire/info')}
              variant="secondary"
              className="w-full md:w-auto"
            >
              <Info className="w-4 h-4 mr-2" />
              Om beräkningen
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Graf - större på desktop */}
          <div className="lg:col-span-2 flex flex-col lg:block space-y-6">
            {/* Utgångskapital - mobilversion (visas ovanför grafen på mobil) */}
            {(() => {
              // Beräkna utgångsvärden från assets
              const startAvailable = availableAtStart || 0;
              const startOccPension = assets
                .filter(a => a.category === 'Tjänstepension')
                .reduce((sum, a) => sum + a.value, 0);
              const startPremiePension = assets
                .filter(a => a.category === 'Premiepension')
                .reduce((sum, a) => sum + a.value, 0);
              const startPrivatePension = assets
                .filter(a => a.category === 'Privat pensionssparande (IPS)')
                .reduce((sum, a) => sum + a.value, 0);
              const startTotalPension = startOccPension + startPremiePension + startPrivatePension;
              // Hämta statlig pension från fireResult eller dynamicFireResult
              const isPristine = manualFireYear === null;
              const sourceForStatePension = isPristine ? fireResult : dynamicFireResult;
              const startStatePension = sourceForStatePension?.statePensionAtStart || 0;
              
              // Visa bara om det finns något kapital och bara på mobil
              if ((startAvailable > 0 || startTotalPension > 0 || startStatePension > 0)) {
                return (
                  <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-3 mb-4">
                    <p className="text-xs font-semibold mb-2 text-gray-700">
                      Utgångskapital
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {/* Tillgängligt */}
                      {startAvailable > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#C47A2C] flex-shrink-0"></div>
                            <span className="text-gray-600">Tillgängligt</span>
                          </div>
                          <span className="text-gray-900 font-medium">{formatCurrency(startAvailable)}</span>
                        </div>
                      )}
                      
                      {/* Marknadsbaserad pension - visa separata delar */}
                      {startTotalPension > 0 && (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-[#4A84C1] flex-shrink-0"></div>
                              <span className="text-gray-600">Marknadsbaserad pension</span>
                            </div>
                            <span className="text-gray-900 font-medium">{formatCurrency(startTotalPension)}</span>
                          </div>
                          {(startOccPension > 0 || startPremiePension > 0 || startPrivatePension > 0) && (
                            <div className="pl-3.5 space-y-0.5 text-[0.65rem] text-gray-500">
                              {startOccPension > 0 && (
                                <div>• Tjänste: {formatCurrency(startOccPension)}</div>
                              )}
                              {startPremiePension > 0 && (
                                <div>• Premie: {formatCurrency(startPremiePension)}</div>
                              )}
                              {startPrivatePension > 0 && (
                                <div>• IPS: {formatCurrency(startPrivatePension)}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Statlig pension */}
                      {startStatePension > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#60a5fa] flex-shrink-0"></div>
                            <span className="text-gray-600">Statlig pension</span>
                          </div>
                          <span className="text-gray-900 font-medium">{formatCurrency(startStatePension)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            {/* Dynamisk ekonomisk frihet-indikator */}
            <div className={`p-4 md:p-6 rounded-lg border ${
              simulation.capitalDepletedYear !== null 
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className={`text-base md:text-lg font-semibold mb-2 ${
                      simulation.capitalDepletedYear !== null
                        ? 'text-red-800'
                        : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                        ? 'text-green-800'
                        : 'text-orange-800'
                    }`}>Din väg mot ekonomisk frihet</h3>
                    <p className={`text-sm ${
                      simulation.capitalDepletedYear !== null
                        ? 'text-red-700'
                        : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}>
                      {simulation.capitalDepletedYear !== null ? (
                        <>
                          <span className="text-base md:text-lg font-semibold text-red-600">
                            Kapitalet tar slut vid {simulation.capitalDepletedYear} år
                          </span>
                          <span className="block text-xs mt-1">
                            {effectiveFireYear !== null 
                              ? `Ekonomisk frihet nås vid ${averageAge + effectiveFireYear} år, men kapitalet räcker inte fram till pension (${sliderPensionAge[0]} år).`
                              : 'Kapitalet räcker inte för att nå ekonomisk frihet.'
                            }
                          </span>
                        </>
                      ) : effectiveFireYear !== null ? (
                        <>
                          <span className={`text-xl md:text-2xl font-bold ${
                            fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                              ? 'text-green-900'
                              : 'text-orange-900'
                          }`}>
                            {effectiveFireYear} år
                          </span>
                          <span className="ml-2">tills du tidigast kan vara ekonomiskt oberoende</span>
                          <span className="block text-xs mt-1">
                            Vid ålder {averageAge + effectiveFireYear} år
                            {manualFireYear !== null && (
                              <span className={`ml-2 italic ${
                                fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                              }`}>
                                (manuellt justerat)
                              </span>
                            )}
                          </span>
                          <span className="block text-xs mt-1 text-primary/70 italic">
                            Med inställda förutsättningar om inget skulle förändras
                          </span>
                          {dynamicFireResult.yearsToFire !== null && manualFireYear !== null && 
                           Math.abs(effectiveFireYear - dynamicFireResult.yearsToFire) > 0 && (
                            <span className="block text-xs mt-1 text-gray-600">
                              Beräknat: {dynamicFireResult.yearsToFire} år (vid {averageAge + dynamicFireResult.yearsToFire} år)
                            </span>
                          )}
                          {fourPercentRuleMetYear !== null && (
                            <span className="block text-xs mt-2 font-medium">
                              {fourPercentRuleMetYear < averageAge + effectiveFireYear 
                                ? `4%-regeln nås vid ${fourPercentRuleMetYear} år (före ekonomisk frihet)`
                                : fourPercentRuleMetYear === averageAge + effectiveFireYear
                                ? `4%-regeln nås vid ${fourPercentRuleMetYear} år (samtidigt med ekonomisk frihet)`
                                : fourPercentRuleMetYear <= sliderPensionAge[0]
                                ? `4%-regeln nås vid ${fourPercentRuleMetYear} år (under bridge-perioden)`
                                : `4%-regeln nås vid ${fourPercentRuleMetYear} år (efter pensionsstart)`
                              }
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-base md:text-lg font-semibold text-red-600">
                          Ekonomisk frihet ej uppnåelig med nuvarande antaganden
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className={`text-sm ${
                      simulation.capitalDepletedYear !== null
                        ? 'text-red-700'
                        : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}>
                      <div>Portfölj vid frihet:</div>
                      <div className={`font-semibold ${
                        simulation.capitalDepletedYear !== null
                          ? 'text-red-900'
                          : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                          ? 'text-green-900'
                          : 'text-orange-900'
                      }`}>
                      {effectiveFireYear !== null 
                        ? formatCurrency(portfolioAtFire)
                        : 'N/A'
                      }
                      </div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      simulation.capitalDepletedYear !== null
                        ? 'text-red-600'
                        : effectiveFireYear !== null && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      4%-krav: {formatCurrency(requiredAtPensionLive)}
                    </div>
                  </div>
                </div>
                
                {/* Dynamisk analys av grafen */}
                {effectiveFireYear !== null && simulation.capitalDepletedYear === null && graphAnalysis && (
                  <div className={`mt-3 pt-3 border-t ${
                    fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                      ? 'border-green-200'
                      : 'border-orange-200'
                  }`}>
                    {/* Vad ser du i grafen just nu? */}
                    <div className="mb-3">
                      <p className={`text-xs font-semibold mb-2 ${
                          fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                            ? 'text-green-800'
                            : 'text-orange-800'
                        }`}>
                        📊 Vad ser du i grafen just nu?
                      </p>
                      <div className="text-xs space-y-1.5">
                        {graphAnalysis.bridgeYears > 0 ? (
                          <>
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>blå linjen (Tillgängligt)</strong> visar ditt kapital som kan användas före pension. 
                              {graphAnalysis.coastYears > 0 ? (
                                <>Vid {graphAnalysis.fireAge} år börjar Coast FIRE-perioden där du jobbar deltid. Utag från denna linje börjar vid {graphAnalysis.withdrawalStartAge !== null ? graphAnalysis.withdrawalStartAge : graphAnalysis.fireAge} år{graphAnalysis.coastCoversFullBridge ? ' (efter hela bridge-perioden)' : ''}.</>
                              ) : (
                                <>Vid {graphAnalysis.fireAge} år börjar du ta ut från denna linje för att täcka utgifter.</>
                              )}
                            </p>
                            {graphAnalysis.coastYears > 0 && !graphAnalysis.coastCoversFullBridge && graphAnalysis.capitalGrowthDuringWithdrawal !== null && (
                              <p className={
                                graphAnalysis.capitalGrowthDuringWithdrawal > 0 
                                  ? (fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700')
                                  : 'text-red-700'
                              }>
                                • Under uttagsperioden{graphAnalysis.withdrawalStartAge !== null && graphAnalysis.pensionAge > graphAnalysis.withdrawalStartAge ? ` (mellan ${graphAnalysis.withdrawalStartAge}-${graphAnalysis.pensionAge} år, ${graphAnalysis.actualWithdrawalYears} år)` : ` (${graphAnalysis.actualWithdrawalYears} år)`} {graphAnalysis.capitalGrowthDuringWithdrawal > 0 ? 'växer' : 'minskar'} ditt tillgängliga kapital med {Math.abs(graphAnalysis.capitalGrowthDuringWithdrawal).toFixed(1)}%.
                                {graphAnalysis.capitalGrowthDuringWithdrawal < 0 && (
                                  <span className="font-semibold text-red-800"> ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer.</span>
                                )}
                              </p>
                            )}
                            {graphAnalysis.coastYears === 0 && graphAnalysis.capitalGrowthDuringBridge !== null && (
                              <p className={
                                graphAnalysis.capitalGrowthDuringBridge > 0 
                                  ? (fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700')
                                  : 'text-red-700'
                              }>
                                • Under bridge-perioden{graphAnalysis.fireAge !== null && graphAnalysis.pensionAge > graphAnalysis.fireAge ? ` (mellan ${graphAnalysis.fireAge}-${graphAnalysis.pensionAge} år, ${graphAnalysis.bridgeYears} år)` : ` (${graphAnalysis.bridgeYears} år)`} {graphAnalysis.capitalGrowthDuringBridge > 0 ? 'växer' : 'minskar'} ditt tillgängliga kapital med {Math.abs(graphAnalysis.capitalGrowthDuringBridge).toFixed(1)}%.
                                {graphAnalysis.capitalGrowthDuringBridge < 0 && (
                                  <span className="font-semibold text-red-800"> ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer.</span>
                          )}
                        </p>
                            )}
                            {graphAnalysis.coastYears > 0 && graphAnalysis.coastCoversFullBridge && (
                              <p className="text-green-700">
                                • Under hela bridge-perioden ({graphAnalysis.bridgeYears} år) växer ditt kapital eftersom du täcker utgifter med deltidsarbete istället för uttag.
                              </p>
                            )}
                            {graphAnalysis.minAvailableAge && graphAnalysis.minAvailableAge !== graphAnalysis.fireAge && graphAnalysis.minAvailableDuringWithdrawal !== null && (
                              <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                                • Kapitalet når sitt lägsta värde vid {graphAnalysis.minAvailableAge} år ({formatCurrency(graphAnalysis.minAvailableDuringWithdrawal)}), 
                                sedan växer det igen när uttagen minskar eller avkastningen ökar.
                              </p>
                            )}
                            {graphAnalysis.minAvailableAge && graphAnalysis.minAvailableAge !== graphAnalysis.fireAge && graphAnalysis.minAvailableDuringWithdrawal === null && graphAnalysis.minAvailableDuringBridge !== null && (
                              <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                                • Kapitalet når sitt lägsta värde vid {graphAnalysis.minAvailableAge} år ({formatCurrency(graphAnalysis.minAvailableDuringBridge)}), 
                                sedan växer det igen när uttagen minskar eller avkastningen ökar.
                              </p>
                            )}
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>gröna linjen (Marknadsbaserad pension)</strong> växer hela tiden tills den slås ihop med tillgängligt vid {graphAnalysis.pensionAge} år.
                            </p>
                            {graphAnalysis.statePensionHelps && (
                              <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                                • Den <strong>gula linjen (Statlig pension)</strong> visar inkomstpensionen som minskar ditt behov av uttag efter {graphAnalysis.pensionAge} år.
                              </p>
                            )}
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>svarta linjen (Total)</strong> visar summan av allt. Den ska överskrida 4%-kravet ({formatCurrency(requiredAtPensionLive)}) vid eller före {graphAnalysis.pensionAge} år.
                            </p>
                          </>
                        ) : (
                          <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                            Du når ekonomisk frihet vid eller efter pensionsålder. Alla tillgångar är redan tillgängliga.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Riskvarningar och vad man ska tänka på */}
                    {graphAnalysis.bridgeYears > 0 && (
                      <div className={`mt-3 pt-3 border-t ${
                        fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                          ? 'border-green-200'
                          : 'border-orange-200'
                      }`}>
                        <p className={`text-xs font-semibold mb-2 ${
                          fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                            ? 'text-green-800'
                            : 'text-orange-800'
                        }`}>
                          ⚠️ Vad ska du tänka på?
                        </p>
                        <div className="text-xs space-y-2">
                          {/* Coast FIRE info - visa först om aktivt */}
                          {graphAnalysis.coastYears > 0 && effectiveFireYear !== null && (
                            <div className={graphAnalysis.coastCoversFullBridge 
                              ? 'text-green-700 bg-green-50 p-2 rounded' 
                              : graphAnalysis.coastSignificantlyHelps 
                              ? 'text-blue-700 bg-blue-50 p-2 rounded'
              : 'text-blue-700 bg-blue-50 p-2 rounded'}>
                              <p>
                                <strong>🌊 Coast FIRE-period ({graphAnalysis.coastYears} år):</strong> Under de första {graphAnalysis.coastYears} åren efter {graphAnalysis.fireAge} år jobbar du deltid för att täcka utgifter. 
                                Kapitalet växer utan uttag, vilket hjälper till att nå 4%-kravet.
                                {graphAnalysis.coastCoversFullBridge ? (
                                  <span className="block mt-1 font-semibold">✅ Du täcker hela bridge-perioden med deltidsarbete! Detta eliminerar risken för uttag under bridge-perioden.</span>
                                ) : graphAnalysis.coastSignificantlyHelps ? (
                                  <span className="block mt-1">💡 Detta minskar risken betydligt eftersom kapitalet får växa i början av bridge-perioden innan uttag börjar.</span>
                                ) : (
                                  <span className="block mt-1">💡 Detta minskar risken eftersom kapitalet får växa i början av bridge-perioden.</span>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Withdrawal rate varning - använd faktisk uttagsstart om Coast FIRE är aktivt */}
                          {(() => {
                            // Välj vilken withdrawal rate som ska visas
                            const withdrawalRate = graphAnalysis.withdrawalRateAtStart !== null ? graphAnalysis.withdrawalRateAtStart : graphAnalysis.withdrawalRateAtFire;
                            const withdrawalStartAge = graphAnalysis.withdrawalStartAge !== null ? graphAnalysis.withdrawalStartAge : graphAnalysis.fireAge;
                            const withdrawalPeriodText = withdrawalStartAge !== null && graphAnalysis.pensionAge > withdrawalStartAge 
                              ? ` (mellan ${withdrawalStartAge}-${graphAnalysis.pensionAge} år)`
                              : graphAnalysis.fireAge !== null && graphAnalysis.pensionAge > graphAnalysis.fireAge 
                              ? ` (mellan ${graphAnalysis.fireAge}-${graphAnalysis.pensionAge} år)`
                              : '';
                            
                            // Visa inte varning om Coast FIRE täcker hela bridge-perioden
                            if (graphAnalysis.coastCoversFullBridge) return null;
                            
                            // Visa inte varning om withdrawal rate är null eller om det inte finns någon faktisk uttagsperiod
                            if (withdrawalRate === null || graphAnalysis.actualWithdrawalYears === 0) return null;
                            
                            return (
                              <div className={withdrawalRate > 5 ? 'text-red-700 bg-red-50 p-2 rounded' : withdrawalRate > 4 ? 'text-orange-700 bg-orange-50 p-2 rounded' : 'text-green-700'}>
                                <p>
                                  <strong>Uttagsnivå{withdrawalPeriodText}:</strong> Du tar ut {withdrawalRate.toFixed(1)}% per år från ditt tillgängliga kapital{graphAnalysis.coastYears > 0 ? ` efter Coast FIRE-perioden` : ''}.
                                  {withdrawalRate > 5 && (
                                    <span className="block mt-1 font-semibold">⚠️ Detta är högt! Över 5% per år ökar risken att kapitalet tar slut. Överväg att spara mer, jobba längre, eller öka Coast FIRE-perioden.</span>
                                  )}
                                  {withdrawalRate > 4 && withdrawalRate <= 5 && (
                                    <span className="block mt-1">💡 Detta är över den säkra 4%-regeln. Om marknaden går dåligt kan det bli tufft. Överväg en buffert eller längre Coast FIRE-period.</span>
                                  )}
                                  {withdrawalRate <= 4 && (
                                  <span className="block mt-1">✅ Detta är inom den säkra 4%-regeln. Bra!</span>
                          )}
                        </p>
                      </div>
                            );
                          })()}

                          {/* Capital buffer varning - använd faktisk uttagsperiod */}
                          {(() => {
                            // Visa inte varning om Coast FIRE täcker hela bridge-perioden
                            if (graphAnalysis.coastCoversFullBridge) return null;
                            
                            // Visa inte om det inte finns någon faktisk uttagsperiod
                            if (graphAnalysis.actualWithdrawalYears === 0) return null;
                            
                            if (graphAnalysis.capitalBuffer !== null && graphAnalysis.capitalBuffer < 50) {
                              const withdrawalStartAge = graphAnalysis.withdrawalStartAge !== null ? graphAnalysis.withdrawalStartAge : graphAnalysis.fireAge;
                              const withdrawalPeriodText = withdrawalStartAge !== null && graphAnalysis.pensionAge > withdrawalStartAge 
                                ? ` (mellan ${withdrawalStartAge}-${graphAnalysis.pensionAge} år)`
                                : '';
                              
                              return (
                            <div className="text-red-700 bg-red-50 p-2 rounded">
                              <p>
                                    <strong>Liten kapitalbuffert{withdrawalPeriodText}:</strong> Ditt kapital kan sjunka till {graphAnalysis.capitalBuffer.toFixed(0)}% av startvärdet under uttagsperioden.
                                    <span className="block mt-1 font-semibold">⚠️ Detta är riskabelt! En marknadskrasch tidigt i uttagsperioden kan tömma kapitalet. Överväg att spara mer, jobba längre, eller öka Coast FIRE-perioden.</span>
                              </p>
                    </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Capital growth behövs - visa även om Coast FIRE täcker hela bridge-perioden om det finns fog */}
                          {(() => {
                            if (graphAnalysis.capitalNeededToGrow !== null && graphAnalysis.capitalNeededToGrow > 50) {
                              // Om Coast FIRE täcker hela bridge-perioden, använd bridge-perioden för beräkning
                              const isCoastFullBridge = graphAnalysis.coastCoversFullBridge;
                              const periodYears = isCoastFullBridge ? graphAnalysis.bridgeYears : graphAnalysis.actualWithdrawalYears;
                              const periodStartAge = isCoastFullBridge ? graphAnalysis.fireAge : (graphAnalysis.withdrawalStartAge !== null ? graphAnalysis.withdrawalStartAge : graphAnalysis.fireAge);
                              const periodText = periodStartAge !== null && graphAnalysis.pensionAge > periodStartAge 
                                ? ` (mellan ${periodStartAge}-${graphAnalysis.pensionAge} år)`
                                : '';
                              const avgReturnNeeded = periodYears > 0 
                                ? (graphAnalysis.capitalNeededToGrow / periodYears).toFixed(1)
                                : '0.0';
                              
                              return (
                            <div className={graphAnalysis.capitalNeededToGrow > 100 ? 'text-red-700 bg-red-50 p-2 rounded' : 'text-orange-700 bg-orange-50 p-2 rounded'}>
                              <p>
                                    <strong>Stor tillväxt krävs{periodText}:</strong> {isCoastFullBridge 
                                      ? `Ditt kapital vid pensionsåldern behöver växa med ${graphAnalysis.capitalNeededToGrow.toFixed(0)}% från nuvarande värde för att nå 4%-kravet.`
                                      : `Ditt kapital behöver växa med ${graphAnalysis.capitalNeededToGrow.toFixed(0)}% under uttagsperioden för att nå 4%-kravet.`
                                    }
                                {graphAnalysis.capitalNeededToGrow > 100 && (
                                      <span className="block mt-1 font-semibold">⚠️ Detta är mycket! Det kräver en genomsnittlig real avkastning på över {avgReturnNeeded}% per år. Överväg att spara mer{isCoastFullBridge ? ' eller jobba längre' : ' eller öka Coast FIRE-perioden'}.</span>
                                )}
                                {graphAnalysis.capitalNeededToGrow <= 100 && graphAnalysis.capitalNeededToGrow > 50 && (
                                      <span className="block mt-1">💡 Detta kräver en genomsnittlig real avkastning på {avgReturnNeeded}% per år. Det är möjligt men inte garanterat{isCoastFullBridge ? '. Överväg att spara mer eller jobba längre' : '. Överväg att öka Coast FIRE-perioden'}.</span>
                                )}
                              </p>
                            </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Positiv feedback - visa även om Coast FIRE täcker hela bridge-perioden om situationen är bra */}
                          {(() => {
                            if (graphAnalysis.capitalNeededToGrow !== null && graphAnalysis.capitalNeededToGrow <= 30 && fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]) {
                              // Om Coast FIRE täcker hela bridge-perioden, använd bridge-perioden för beräkning
                              const isCoastFullBridge = graphAnalysis.coastCoversFullBridge;
                              const periodYears = isCoastFullBridge ? graphAnalysis.bridgeYears : graphAnalysis.actualWithdrawalYears;
                              const periodStartAge = isCoastFullBridge ? graphAnalysis.fireAge : (graphAnalysis.withdrawalStartAge !== null ? graphAnalysis.withdrawalStartAge : graphAnalysis.fireAge);
                              const periodText = periodStartAge !== null && graphAnalysis.pensionAge > periodStartAge 
                                ? ` (mellan ${periodStartAge}-${graphAnalysis.pensionAge} år)`
                                : '';
                              const avgReturnNeeded = periodYears > 0 
                                ? (graphAnalysis.capitalNeededToGrow / periodYears).toFixed(1)
                                : '0.0';
                              
                              return (
                            <div className="text-green-700 bg-green-50 p-2 rounded">
                              <p>
                                    <strong>Bra läge{periodText}:</strong> Ditt kapital behöver bara växa med {graphAnalysis.capitalNeededToGrow.toFixed(0)}% för att nå 4%-kravet, 
                                    vilket är rimligt med en genomsnittlig real avkastning på {avgReturnNeeded}% per år.
                                <span className="block mt-1">✅ Detta är en hållbar plan!</span>
                        </p>
                      </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Manual adjustment info */}
                          {manualFireYear !== null && dynamicFireResult.yearsToFire !== null && 
                           Math.abs(effectiveFireYear - dynamicFireResult.yearsToFire) > 0 && (
                            <div className="text-gray-700 bg-gray-50 p-2 rounded">
                              <p>
                                <strong>Manuell justering:</strong> Du har satt FIRE-åldern till {averageAge + effectiveFireYear} år, 
                                men beräkningen visar att du kan nå det vid {averageAge + dynamicFireResult.yearsToFire} år.
                                <span className="block mt-1">
                                  {effectiveFireYear > dynamicFireResult.yearsToFire 
                                    ? `💡 Genom att jobba ${effectiveFireYear - dynamicFireResult.yearsToFire} år extra bygger du en större buffert, vilket minskar risken.`
                                    : `💡 Genom att starta ${dynamicFireResult.yearsToFire - effectiveFireYear} år tidigare ökar du risken eftersom du har mindre kapital.`
                                  }
                                </span>
                        </p>
                      </div>
                    )}
                        </div>
                      </div>
                    )}

                    {/* Vad händer när du drar i reglagen? */}
                    <div className={`mt-3 pt-3 border-t border-gray-200`}>
                      <p className="text-xs font-semibold mb-2 text-gray-800">
                        🎛️ Vad händer när du drar i reglagen?
                      </p>
                      <div className="text-xs space-y-1.5 text-gray-700">
                        <p>• <strong>Öka månadssparande:</strong> Den blå linjen växer snabbare, FIRE-åldern minskar, och du får mer kapital vid frihet.</p>
                        <p>• <strong>Öka avkastning:</strong> Alla linjer växer snabbare. Högre avkastning = tidigare FIRE, men också högre risk.</p>
                        <p>• <strong>Öka utgifter:</strong> Du behöver mer kapital vid frihet, FIRE-åldern ökar, och withdrawal rate blir högre.</p>
                        <p>• <strong>Öka pensionsålder:</strong> Bridge-perioden blir längre, du behöver mer kapital vid frihet, men pensionstillgångarna hinner växa mer.</p>
                        <p>• <strong>Justera startålder:</strong> Flytta FIRE framåt = mer kapital men senare start. Flytta bakåt = tidigare start men mindre kapital.</p>
                        {useCoastFire && (
                          <p>• <strong>Coast FIRE:</strong> Aktivera för att se hur deltidsarbete under bridge-perioden påverkar kapitalutvecklingen.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Diagram - större höjd för att se gröna strecket */}
            <div className="bg-white rounded-lg border border-slate-200/40 p-4 md:p-6">
              <div className="h-[400px] md:h-[500px] lg:h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD3" />
                    <XAxis 
                      dataKey="År" 
                      className="text-xs"
                      label={{ value: 'Ålder', position: 'insideBottom', offset: -5 }}
                      domain={isMobile ? ['dataMin', 80] : ['dataMin', 'dataMax']}
                    />
                    <YAxis 
                      className="text-xs"
                      label={{ value: 'Belopp (realt)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => formatCurrency(value)}
                      domain={[0, 'dataMax']}
                      width={100}
                      angle={-45}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        const payload = props.payload;
                        const formattedValue = formatCurrency(value);
                        const age = payload.År;
                        
                        const fireYear = effectiveFireYear;
                        const fireAge = fireYear !== null ? fireYear + averageAge : null;
                        const isFireYear = fireYear !== null && age === fireAge;
                        const isInBridge = fireAge !== null && age >= fireAge && age < sliderPensionAge[0];
                        const isAfterPension = age >= sliderPensionAge[0];
                        
                        // Detektera om detta är en milstolpe
                        const isTotal4Percent = fourPercentRuleMetYear !== null && age === fourPercentRuleMetYear;
                        const isAvailable4Percent = availableCrossesFIREYear !== null && age === availableCrossesFIREYear;
                        const isCapitalDepleted = simulation.capitalDepletedYear !== null && age === simulation.capitalDepletedYear;
                        
                        // Detektera Coast FIRE-period
                        const isInCoastFire = useCoastFire && effectiveFireYear !== null && coastFireYears[0] > 0 &&
                          age > averageAge + effectiveFireYear && 
                          age <= averageAge + effectiveFireYear + coastFireYears[0];
                        
                        if (name === 'Tillgängligt') {
                          let details = formattedValue;
                          details += `\nKapital som kan användas före pension`;
                          
                          // Kolla om tjänstepension eller IPS flyttas över detta år
                          const isOccPensionUnlockYear = age === occPensionEarlyStartAge[0];
                          const isIpsUnlockYear = age === ipsEarlyStartAge[0];
                          if (isOccPensionUnlockYear || isIpsUnlockYear) {
                            const unlockParts: string[] = [];
                            // Kolla om tjänstepension flyttas över (åldern matchar och det finns inte längre i occPension)
                            if (isOccPensionUnlockYear) {
                              // Om occPension är 0 eller undefined, har den flyttats över
                              if (payload.occPension === undefined || payload.occPension === 0) {
                                unlockParts.push('Tjänstepension');
                              }
                            }
                            // Kolla om IPS flyttas över (åldern matchar och det finns inte längre i privatePension)
                            if (isIpsUnlockYear) {
                              // Om privatePension är 0 eller undefined, har det flyttats över
                              if (payload.privatePension === undefined || payload.privatePension === 0) {
                                unlockParts.push('IPS');
                              }
                            }
                            if (unlockParts.length > 0) {
                              details += `\n🔄 ${unlockParts.join(' och ')} ${unlockParts.length === 1 ? 'har' : 'har'} flyttats över till tillgängligt`;
                            }
                          }
                          
                          if (payload.savingsContrib !== undefined && payload.savingsContrib > 0) {
                            details += `\n+ Sparande: ${formatCurrency(payload.savingsContrib)}`;
                          }
                          // Visa avkastning alltid med procenten, även om den är 0.0%
                          // Kolla om availableReturn finns i payload (kan vara undefined, 0, eller ett värde)
                          const availableReturnValue = payload.availableReturn;
                          if (availableReturnValue !== undefined) {
                            // Räkna ut faktisk avkastningsprocent från simulerad data
                            const savingsContrib = payload.savingsContrib || 0;
                            const netWithdrawal = payload.netWithdrawal || 0;
                            
                            // Beräkna kapitalet FÖRE avkastning
                            let capitalBeforeReturn: number;
                            if (isAfterPension) {
                              capitalBeforeReturn = payload.available - availableReturnValue + netWithdrawal;
                            } else if (isFireYear) {
                              capitalBeforeReturn = payload.available - availableReturnValue - savingsContrib;
                            } else {
                              capitalBeforeReturn = payload.available - availableReturnValue - savingsContrib + netWithdrawal;
                            }
                            
                            // Beräkna procenten - använd enklare fallback om capitalBeforeReturn är problematiskt
                            const base = capitalBeforeReturn > 0.01 ? capitalBeforeReturn : payload.available;
                            const effectivePct = base > 0.01 ? (availableReturnValue / base) * 100 : 0;
                            
                            // Visa procenten alltid, även om den är 0.0% eller NaN (visa 0.0% som fallback)
                            if (!isNaN(effectivePct) && isFinite(effectivePct)) {
                              details += `\n+ Avkastning (${effectivePct.toFixed(1)}%): ${formatCurrency(availableReturnValue)}`;
                            } else {
                              // Om beräkningen misslyckas, visa 0.0% som fallback
                              details += `\n+ Avkastning (0.0%): ${formatCurrency(availableReturnValue)}`;
                            }
                          } else if (payload.available > 0.01) {
                            // Om availableReturn är undefined men det finns kapital, visa 0.0% avkastning
                            details += `\n+ Avkastning (0.0%): ${formatCurrency(0)}`;
                          }
                          if (payload.netWithdrawal !== undefined && payload.netWithdrawal > 0) {
                            details += `\n- Utbetalningar: ${formatCurrency(payload.netWithdrawal)}/år`;
                          }
                          if (isInCoastFire) {
                            details += `\n🌊 Coast FIRE: ingen uttag`;
                          }
                          // Lägg till milstolpe-info
                          if (isAvailable4Percent) {
                            details += `\n⭐ Når 4%-kravet`;
                          }
                          if (isCapitalDepleted) {
                            details += `\n⚠️ Kapital tar slut`;
                          }
                          return details;
                        } else if (name === 'Marknadsbaserad pension') {
                          let details = formattedValue;
                          // Förenklad logik: avgör vilka pensionsdelar som finns kvar
                          const isAfterPensionStart = age >= sliderPensionAge[0];
                          
                          if (isAfterPensionStart) {
                            // Efter pensionsstart: allt har överförts
                            details += `\nAlla pensionsdelar har överförts till tillgängligt`;
                          } else {
                            // Före pensionsstart: bygg lista över delar som finns kvar
                            const pensionParts: string[] = [];
                            
                            // Tjänstepension: visa om den inte kan ha överförts än, eller om den faktiskt finns kvar
                            const canOccBeUnlocked = age >= occPensionEarlyStartAge[0];
                            if (!canOccBeUnlocked || (payload.occPension !== undefined && payload.occPension > 0)) {
                              pensionParts.push('Tjänstepension');
                            }
                            
                            // Premiepension: alltid kvar före pensionsstart (kan inte överföras tidigt)
                            pensionParts.push('Premiepension');
                            
                            // IPS: visa om det inte kan ha överförts än, eller om det faktiskt finns kvar
                            const canIpsBeUnlocked = age >= ipsEarlyStartAge[0];
                            if (!canIpsBeUnlocked || (payload.privatePension !== undefined && payload.privatePension > 0)) {
                              pensionParts.push('IPS');
                            }
                            
                            // Visa resultatet
                            details += `\n${pensionParts.join(' + ')}`;
                          }
                          if (payload.pensionContrib !== undefined && payload.pensionContrib > 0) {
                            details += `\n+ Avsättningar: ${formatCurrency(payload.pensionContrib)}`;
                            // Visa separata avsättningar om de finns (kompakt)
                            const parts: string[] = [];
                            if (payload.occPensionContrib !== undefined && payload.occPensionContrib > 0) {
                              parts.push(`Tjänste: ${formatCurrency(payload.occPensionContrib)}`);
                            }
                            if (payload.premiePensionContrib !== undefined && payload.premiePensionContrib > 0) {
                              parts.push(`Premie: ${formatCurrency(payload.premiePensionContrib)}`);
                            }
                            if (payload.privatePensionContrib !== undefined && payload.privatePensionContrib > 0) {
                              parts.push(`IPS: ${formatCurrency(payload.privatePensionContrib)}`);
                            }
                            if (parts.length > 0) {
                              details += `\n  (${parts.join(', ')})`;
                            }
                          }
                          if (payload.pensionReturn !== undefined && payload.pensionReturn !== 0) {
                            // Beräkna viktad avkastning baserat på faktiska värden
                            const occPension = payload.occPension || 0;
                            const premiePension = payload.premiePension || 0;
                            const privatePension = payload.privatePension || 0;
                            const totalPensionValue = occPension + premiePension + privatePension;
                            
                            // Om vi har separata avkastningar, visa dem separat för bättre transparens
                            const occReturn = payload.occPensionReturn || 0;
                            const premieReturn = payload.premiePensionReturn || 0;
                            const privateReturn = payload.privatePensionReturn || 0;
                            
                            // Kolla om vi har separata avkastningar att visa
                            const hasSeparateReturns = (occReturn !== 0 || premieReturn !== 0 || privateReturn !== 0) && 
                                                       (occPension > 0 || premiePension > 0 || privatePension > 0);
                            
                            if (hasSeparateReturns) {
                              // Visa separata avkastningar för varje pensionsdel
                              details += `\n+ Avkastning: ${formatCurrency(payload.pensionReturn)}`;
                              const returnParts: string[] = [];
                              
                              if (occPension > 0 && occReturn !== 0) {
                                // Beräkna procent från kapitalet före avkastning och avsättningar
                                const occContrib = payload.occPensionContrib || 0;
                                const prevOccPension = occPension - occReturn - occContrib;
                                const occPercent = prevOccPension > 0.01 ? ((occReturn / prevOccPension) * 100).toFixed(1) : '0.0';
                                returnParts.push(`Tjänste: ${occPercent}%`);
                              }
                              
                              if (premiePension > 0 && premieReturn !== 0) {
                                const premieContrib = payload.premiePensionContrib || 0;
                                const prevPremiePension = premiePension - premieReturn - premieContrib;
                                const premiePercent = prevPremiePension > 0.01 ? ((premieReturn / prevPremiePension) * 100).toFixed(1) : '0.0';
                                returnParts.push(`Premie: ${premiePercent}%`);
                              }
                              
                              if (privatePension > 0 && privateReturn !== 0) {
                                const privateContrib = payload.privatePensionContrib || 0;
                                const prevPrivatePension = privatePension - privateReturn - privateContrib;
                                const privatePercent = prevPrivatePension > 0.01 ? ((privateReturn / prevPrivatePension) * 100).toFixed(1) : '0.0';
                                returnParts.push(`IPS: ${privatePercent}%`);
                              }
                              
                              if (returnParts.length > 0) {
                                details += `\n  (${returnParts.join(', ')})`;
                              }
                            } else {
                              // Fallback: beräkna viktad avkastning om vi inte har separata värden
                              const pensionContrib = payload.pensionContrib || 0;
                              const prevTotalPension = totalPensionValue - payload.pensionReturn - pensionContrib;
                              if (prevTotalPension > 0.01) {
                                const weightedPercent = ((payload.pensionReturn / prevTotalPension) * 100).toFixed(1);
                                details += `\n+ Avkastning (${weightedPercent}%): ${formatCurrency(payload.pensionReturn)}`;
                              } else {
                                details += `\n+ Avkastning: ${formatCurrency(payload.pensionReturn)}`;
                              }
                            }
                          }
                          if (age >= sliderPensionAge[0]) {
                            details += `\nℹ️ Slås ihop vid pension`;
                          } else {
                            details += `\nℹ️ Låst tills pension (uttag från 55 år möjligt)`;
                          }
                          return details;
                        } else if (name === 'Statlig pension (inkomst)') {
                          // Före pension: visa kapital och tillväxt
                          if (payload.statePensionCapital !== undefined && payload.statePensionCapital > 0) {
                            let details = formattedValue;
                            details += `\nInkomstpension (statlig)`;
                            if (payload.statePensionContrib !== undefined && payload.statePensionContrib > 0) {
                              details += `\n+ Avsättning: ${formatCurrency(payload.statePensionContrib)}`;
                            }
                            if (payload.statePensionReturn !== undefined && payload.statePensionReturn !== 0) {
                              const statePensionPercent = (realReturns.realReturnStatePension * 100).toFixed(1);
                              details += `\n+ Avkastning (${statePensionPercent}%): ${formatCurrency(payload.statePensionReturn)}`;
                            }
                            return details;
                          }
                          // Efter pension: visa inkomst
                          if (payload.statePensionIncome !== undefined && payload.statePensionIncome > 0) {
                            let details = `${formattedValue}/år`;
                            details += `\n(${formatCurrency((value as number) / 12)}/mån)`;
                            details += `\nℹ️ Utbetalning per år (minskar uttag)`;
                            return details;
                          }
                          return formattedValue;
                        } else if (name === 'Total') {
                          let details = formattedValue;
                          details += `\nTotalt kapital`;
                          const savingsTotal = (payload.savingsContrib || 0) + (payload.pensionContrib || 0) + (payload.statePensionContrib || 0);
                          const returnsTotal = (payload.availableReturn || 0) + (payload.pensionReturn || 0) + (payload.statePensionReturn || 0);
                          if (savingsTotal > 0) {
                            details += `\n+ Insättningar: ${formatCurrency(savingsTotal)}`;
                          }
                          if (returnsTotal !== 0) {
                            details += `\n+ Avkastning: ${formatCurrency(returnsTotal)}`;
                          }
                          if (payload.netWithdrawal !== undefined && payload.netWithdrawal > 0) {
                            details += `\n- Utbetalningar: ${formatCurrency(payload.netWithdrawal)}/år`;
                          }
                          // Visa statlig pensionsinkomst om den finns (efter pension)
                          if (payload.statePensionIncome !== undefined && payload.statePensionIncome > 0) {
                            details += `\n+ Statlig pension: ${formatCurrency(payload.statePensionIncome)}/år`;
                          }
                          // Lägg till milstolpe-info
                          if (isTotal4Percent) {
                            details += `\n⭐ Når 4%-kravet`;
                          }
                          return details;
                        }
                        
                        return formattedValue;
                      }}
                      labelFormatter={(label) => {
                        const age = label;
                        let labelText = `Ålder: ${age} år`;
                        
                        // Lägg till milstolpe-info i label
                        if (fourPercentRuleMetYear !== null && age === fourPercentRuleMetYear) {
                          labelText += ' ⭐ Total når 4%';
                        }
                        if (availableCrossesFIREYear !== null && age === availableCrossesFIREYear && age !== fourPercentRuleMetYear) {
                          labelText += ' ⭐ Tillgängligt når 4%';
                        }
                        if (simulation.capitalDepletedYear !== null && age === simulation.capitalDepletedYear) {
                          labelText += ' ⚠️ Kapital förbrukat';
                        }
                        
                        return labelText;
                      }}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', whiteSpace: 'pre-line', maxWidth: '280px', fontSize: '12px', padding: '8px' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend />
                    
                    <Line 
                      type="monotone" 
                      dataKey="Tillgängligt" 
                      stroke="#C47A2C" 
                      strokeWidth={3}
                      dot={false}
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="Marknadsbaserad pension" 
                      stroke="#4A84C1" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    
                    {/* Statlig pension (inkomst) - visar kapital fram till pension, inkomst efter */}
                    <Line 
                      type="monotone" 
                      dataKey="Statlig pension (inkomst)" 
                      stroke="#60a5fa" 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                      connectNulls={false}
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="Total" 
                      stroke="#9ca3af" 
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="2 2"
                    />
                    
                    <ReferenceLine 
                      x={sliderPensionAge[0]} 
                      stroke="#C88C3C" 
                      strokeWidth={2}
                      label={{ value: 'Pensionsstart', position: 'top', fill: '#C88C3C' }}
                    />
                    
                    <ReferenceLine 
                      y={requiredAtPensionLive} 
                      stroke="#0E5E4B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ value: '4%-krav', position: 'right', fill: '#0E5E4B' }}
                    />
                    
                    {/* Vertikal markering när Total går över FIRE-linjen */}
                    {fourPercentRuleMetYear !== null && (
                      <ReferenceLine 
                        x={fourPercentRuleMetYear}
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ 
                          value: 'Total når 4%', 
                          position: 'top', 
                          fill: '#10b981',
                          fontSize: 12
                        }}
                      />
                    )}
                    
                    {/* Vertikal markering när Tillgängligt går över FIRE-linjen */}
                    {availableCrossesFIREYear !== null && availableCrossesFIREYear !== fourPercentRuleMetYear && (
                      <ReferenceLine 
                        x={availableCrossesFIREYear}
                        stroke="#C47A2C"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ 
                          value: 'Tillgängligt når 4%', 
                          position: 'top', 
                          fill: '#C47A2C',
                          fontSize: 12
                        }}
                      />
                    )}
                    
                    {(() => {
                      // fireAgeForArea ska vara åldern när FIRE nås (FIRE-året)
                      // effectiveFireYear är antal år TILL FIRE, så FIRE-åldern = averageAge + effectiveFireYear
                      const fireAgeForArea =
                        effectiveFireYear !== null
                          ? averageAge + effectiveFireYear
                          : null;
                      if (fireAgeForArea === null || fireAgeForArea >= sliderPensionAge[0]) {
                        return null;
                      }
                      
                      // Coast FIRE-period (om aktiverad)
                      // Coast FIRE börjar på FIRE-året (inte året efter)
                      const coastFireStartAge = useCoastFire && effectiveFireYear !== null && coastFireYears[0] > 0
                        ? fireAgeForArea // På FIRE-året
                        : null;
                      const coastFireEndAge = coastFireStartAge !== null
                        ? Math.min(coastFireStartAge + coastFireYears[0], sliderPensionAge[0])
                        : null;
                      
                      return (
                        <>
                          {/* Bridge-period (resten efter Coast FIRE) */}
                          {coastFireEndAge !== null && coastFireEndAge < sliderPensionAge[0] && (
                            <ReferenceArea
                              key={`bridge-${coastFireEndAge}-${sliderPensionAge[0]}`}
                              x1={coastFireEndAge}
                              x2={sliderPensionAge[0]}
                              stroke="#f59e0b"
                              strokeWidth={2}
                              fill="#f59e0b"
                              fillOpacity={0.1}
                            />
                          )}
                          {/* Bridge-period (om ingen Coast FIRE) */}
                          {/* Bridge-perioden börjar på FIRE-året (inte året efter) */}
                          {coastFireEndAge === null && (
                            <ReferenceArea
                              key={`bridge-${fireAgeForArea}-${sliderPensionAge[0]}`}
                              x1={fireAgeForArea}
                              x2={sliderPensionAge[0]}
                              stroke="#f59e0b"
                              strokeWidth={2}
                              fill="#f59e0b"
                              fillOpacity={0.1}
                            />
                          )}
                          {/* Coast FIRE-period */}
                          {coastFireStartAge !== null && coastFireEndAge !== null && (
                            <ReferenceArea
                              key={`coast-${coastFireStartAge}-${coastFireEndAge}`}
                              x1={coastFireStartAge}
                              x2={coastFireEndAge}
                              stroke="#10b981"
                              strokeWidth={2}
                              fill="#10b981"
                              fillOpacity={0.15}
                            />
                          )}
                        </>
                      );
                    })()}
                    
                    {/* Pensionsperiod - från pensionsstartålder och framåt */}
                    {chartData.length > 0 && (() => {
                      const maxAge = Math.max(...chartData.map(d => d.År));
                      if (sliderPensionAge[0] < maxAge) {
                        return (
                          <ReferenceArea
                            key={`pension-${sliderPensionAge[0]}-${maxAge}`}
                            x1={sliderPensionAge[0]}
                            x2={maxAge}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.08}
                          />
                        );
                      }
                      return null;
                    })()}
                    
                    {effectiveFireYear !== null && (
                      <ReferenceLine 
                        key={`fireline-${averageAge + effectiveFireYear}`}
                        x={averageAge + effectiveFireYear} 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        label={{ value: 'FIRE', position: 'top', fill: '#f59e0b' }}
                      />
                    )}
                    
                    {simulation.capitalDepletedYear !== null && (
                      <ReferenceLine 
                        x={simulation.capitalDepletedYear} 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{ value: 'Kapital förbrukat', position: 'top', fill: '#ef4444' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Startålder för ekonomisk frihet */}
            {effectiveFireYear !== null && (
              <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200 order-2 lg:order-none">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Startålder för ekonomisk frihet (simulering)</Label>
                    <InfoIcon 
                      title="Startålder för ekonomisk frihet"
                      description="Detta är åldern när du når ekonomisk frihet (FIRE) och kan sluta jobba.\n\nDu kan justera denna ålder för att se vad som händer om du:\n• Väntar längre: Mer kapital vid start, men senare frihet\n• Startar tidigare: Tidigare frihet, men mindre kapital och högre risk\n\nOm du sätter en tidigare ålder än beräkningen visar, ökar risken eftersom du har mindre kapital. Om du sätter en senare ålder, bygger du en större buffert som minskar risken."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {manualFireYear !== null ? manualFireYear : averageAge + effectiveFireYear} år
                    </span>
                    {manualFireYear !== null && (
                      <button
                        onClick={() => setManualFireYear(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Återställ
                      </button>
                    )}
                  </div>
                </div>
                <Slider
                  value={[manualFireYear !== null ? manualFireYear : averageAge + effectiveFireYear]}
                  onValueChange={(vals) => setManualFireYear(vals[0])}
                  min={averageAge}
                  max={sliderPensionAge[0] - 1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1 mb-4">
                  Justera startålder för att se vad som händer om du väntar längre eller startar tidigare på din väg mot ekonomisk frihet
                </div>
                
                {/* Coast FIRE Switch */}
                {effectiveFireYear !== null && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Börja din FIRE med att gå ner i arbetstid (Coast FIRE)</Label>
                          <InfoIcon 
                            title="Coast FIRE"
                            description="Coast FIRE är en variant av ekonomisk frihet där du går ner i arbetstid istället för att sluta helt.\n\nUnder Coast FIRE-perioden:\n• Jobbar du deltid för att täcka dina utgifter\n• Slutar spara (ingen ny inbetalning till kapital)\n• Låter ditt befintliga kapital växa med avkastning\n\nDetta ger mer balans och frihet tidigare, även om vägen till full ekonomisk frihet blir lite längre. Det minskar också risken eftersom kapitalet får växa i början av bridge-perioden utan uttag."
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Under en del av bridge-perioden jobbar du deltid för att täcka utgifter, men slutar spara
                        </p>
                      </div>
                      <Switch
                        checked={useCoastFire}
                        onCheckedChange={setUseCoastFire}
                      />
                    </div>
                    
                    {useCoastFire && effectiveFireYear !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Antal år med deltid (0-{Math.floor(Math.max(0, sliderPensionAge[0] - (averageAge + effectiveFireYear)))})</Label>
                          <span className="text-sm font-medium">{coastFireYears[0]} år</span>
                        </div>
                        <Slider
                          value={coastFireYears}
                          onValueChange={setCoastFireYears}
                          min={0}
                          max={Math.floor(Math.max(0, sliderPensionAge[0] - (averageAge + effectiveFireYear)))}
                          step={1}
                          className="w-full"
                        />
                        {useCoastFire && (coastFirePensionContribs.occ + coastFirePensionContribs.premie + coastFirePensionContribs.private) < marketPensionContribMonthly && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-800 font-medium mb-1">
                              Reducerad pensionsavsättning: {formatCurrency(coastFirePensionContribs.occ + coastFirePensionContribs.premie + coastFirePensionContribs.private)}/mån 
                              (tidigare: {formatCurrency(marketPensionContribMonthly)}/mån)
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Under Coast FIRE-perioden jobbar du deltid och täcker dina utgifter via arbete. Inga uttag från kapital och inget nytt sparande görs. Kapitalet växer ändå med avkastning.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Justera antaganden - visad i graf-kolumnen på mobil, dold på desktop */}
            <div className="space-y-6 order-3 lg:hidden">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Justera antaganden</h3>
                
                {/* Separata avkastningar */}
                <div className="mb-6">
                  <div className="mb-3">
                    <Label className="text-sm font-medium text-gray-900 block mb-2">Avkastning per hink</Label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className={`text-sm font-medium whitespace-nowrap ${!useAutoReturns ? 'text-gray-900' : 'text-gray-500'}`}>Manuell</span>
                      <Switch
                        checked={useAutoReturns}
                        onCheckedChange={setUseAutoReturns}
                      />
                      <span className={`text-sm font-medium whitespace-nowrap ${useAutoReturns ? 'text-gray-900' : 'text-gray-500'}`}>Auto</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                      Auto = viktat snitt från dina tillgångar
                    </p>
                  </div>
                  
                  {/* Tillgängliga tillgångar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Övriga tillgångar (nominell)</Label>
                        <InfoIcon 
                          title="Avkastning på övriga tillgångar"
                          description="Detta är den förväntade årliga avkastningen (före inflation) på dina tillgängliga tillgångar - allt utom pensionssparande.\n\nI auto-läge beräknas detta automatiskt baserat på dina tillgångar (fonder, aktier, sparkonto, bostad, etc.) och deras förväntade avkastning.\n\nJu högre avkastning, desto snabbare växer ditt kapital och desto tidigare kan du nå FIRE. Men högre avkastning innebär också högre risk.\n\nStandardvärdet är 7% nominell avkastning, vilket ger cirka 5% real avkastning efter inflation."
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {useAutoReturns ? (autoReturns.nomAvailable * 100).toFixed(1) : sliderReturnAvailable[0].toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={sliderReturnAvailable}
                      onValueChange={setSliderReturnAvailable}
                      min={sliderBounds.available.min}
                      max={sliderBounds.available.max}
                      step={0.1}
                      className="w-full"
                      disabled={useAutoReturns}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Real: {(realReturns.realReturnAvailable * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Pensionstillgångar - visa bara i auto-läge */}
                  {useAutoReturns && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Pensionstillgångar (nominell)</Label>
                      <span className="text-sm font-medium">
                          {((autoReturns.nomOccPension + autoReturns.nomPremiePension + autoReturns.nomPrivatePension) / 3 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={sliderReturnPension}
                      onValueChange={setSliderReturnPension}
                      min={sliderBounds.pension.min}
                      max={sliderBounds.pension.max}
                      step={0.1}
                      className="w-full"
                        disabled={true}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Real: {((realReturns.realReturnOccPension + realReturns.realReturnPremiePension + realReturns.realReturnPrivatePension) / 3 * 100).toFixed(1)}%
                    </div>
                  </div>
                  )}
                  
                  {/* Tre separata pensionssliders (endast i manuellt läge) */}
                  {!useAutoReturns && (
                    <>
                      {/* Tjänstepension */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Tjänstepension (nominell)</Label>
                            <InfoIcon 
                              title="Avkastning på tjänstepension"
                              description="Detta är den förväntade årliga avkastningen på din tjänstepension.\n\nTjänstepension är den pension som din arbetsgivare betalar in åt dig. Den växer med avkastning tills du börjar ta ut den (vanligtvis från 55 år eller vid pensionsstart).\n\nJu högre avkastning, desto mer växer din tjänstepension och desto mer hjälp ger den dig vid pensionsstart. Standardvärdet är 7% nominell avkastning."
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {sliderReturnOccPension[0].toFixed(1)}%
                          </span>
                        </div>
                        <Slider
                          value={sliderReturnOccPension}
                          onValueChange={setSliderReturnOccPension}
                          min={sliderBounds.occPension.min}
                          max={sliderBounds.occPension.max}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Real: {(realReturns.realReturnOccPension * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Premiepension */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Premiepension (nominell)</Label>
                            <InfoIcon 
                              title="Avkastning på premiepension"
                              description="Detta är den förväntade årliga avkastningen på din premiepension.\n\nPremiepension är en del av den statliga pensionen som du kan välja fonder för. Den växer med avkastning fram till pensionsstart (vanligtvis 63 år).\n\nPremiepension kan inte tas ut tidigt - den växer hela vägen till pensionsstart. Standardvärdet är 7% nominell avkastning."
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {sliderReturnPremiePension[0].toFixed(1)}%
                          </span>
                        </div>
                        <Slider
                          value={sliderReturnPremiePension}
                          onValueChange={setSliderReturnPremiePension}
                          min={sliderBounds.premiePension.min}
                          max={sliderBounds.premiePension.max}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Real: {(realReturns.realReturnPremiePension * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* IPS / Privat pensionssparande */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">IPS / Privat pensionssparande (nominell)</Label>
                            <InfoIcon 
                              title="Avkastning på IPS"
                              description="Detta är den förväntade årliga avkastningen på ditt IPS (Individuellt Pensionssparande).\n\nIPS är ett privat pensionssparande med skatteförmåner. Du kan ta ut IPS från 55 år, vilket gör det användbart för bridge-perioden innan statlig pension börjar.\n\nJu högre avkastning, desto mer växer ditt IPS. Standardvärdet är 7% nominell avkastning."
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {sliderReturnPrivatePension[0].toFixed(1)}%
                          </span>
                        </div>
                        <Slider
                          value={sliderReturnPrivatePension}
                          onValueChange={setSliderReturnPrivatePension}
                          min={sliderBounds.privatePension.min}
                          max={sliderBounds.privatePension.max}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Real: {(realReturns.realReturnPrivatePension * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 italic mb-4">
                        I manuellt läge styr du avkastningen för varje pensionsdel separat. Dessa tre värden används i både FIRE-beräkningen och simuleringen.
                      </div>
                    </>
                  )}
                  
                  {useAutoReturns && (
                  <div className="text-xs text-gray-500 italic">
                    Avkastning per hink baseras automatiskt på dina tillgångar (viktat). Du kan överstyra med reglagen.
                  </div>
                  )}
                  
                  {(!Number.isFinite(autoReturns.nomAvailable) || !Number.isFinite(autoReturns.nomOccPension)) && (
                    <div className="text-xs text-red-500 mt-1">
                      Varning: Kunde inte beräkna viktad avkastning – använder standardvärde 7%.
                    </div>
                  )}
                </div>
                
                {/* Inflation */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Inflation</Label>
                      <InfoIcon 
                        title="Inflation"
                        description="Inflation är den årliga prisökningen i samhället. När inflationen är 2% betyder det att samma varor och tjänster kostar 2% mer nästa år.\n\nI FIRE-beräkningen används real avkastning (avkastning minus inflation) för att se din faktiska köpkraft över tid. Om dina tillgångar växer med 7% men inflationen är 2%, är din reala avkastning 5%.\n\nStandardvärdet är 2%, vilket är Riksbankens inflationsmål. Du kan justera detta om du tror inflationen kommer vara högre eller lägre."
                      />
                    </div>
                    <span className="text-sm font-medium">{sliderInflation[0]}%</span>
                  </div>
                  <Slider
                    value={sliderInflation}
                    onValueChange={setSliderInflation}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                {/* Pensionsstartålder */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Pensionsstartålder</Label>
                      <InfoIcon 
                        title="Pensionsstartålder"
                        description="Detta är åldern när du planerar att börja ta ut din statliga pension och marknadsbaserade pensioner.\n\nBridge-perioden är tiden mellan när du når ekonomisk frihet (FIRE) och när pensionen börjar. Ju längre bridge-period, desto mer kapital behöver du vid FIRE för att täcka utgifterna.\n\nStandardvärdet är 63 år, vilket är den tidigaste åldern du kan ta ut statlig pension i Sverige. Du kan öka detta om du planerar att jobba längre."
                      />
                    </div>
                    <span className="text-sm font-medium">{sliderPensionAge[0]} år</span>
                  </div>
                  <Slider
                    value={sliderPensionAge}
                    onValueChange={setSliderPensionAge}
                    min={63}
                    max={67}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                {/* Utbetalningsperiod för statlig pension */}
                {dynamicFireResult?.statePensionAnnualIncome && dynamicFireResult.statePensionAnnualIncome > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Utbetalningsperiod för statlig pension</Label>
                        <InfoIcon 
                          title="Utbetalningsperiod för statlig pension"
                          description="Detta är antal år din statliga inkomstpension betalas ut från pensionsstart.\n\nJu längre utbetalningsperiod, desto lägre blir den månatliga utbetalningen men desto längre får du betalningar. Ju kortare period, desto högre månadsutbetalning men kortare tid.\n\nStandardvärdet är 20 år, vilket är en rimlig uppskattning baserat på genomsnittlig livslängd. Du kan justera detta baserat på din egen situation."
                        />
                      </div>
                      <span className="text-sm font-medium">{statePensionPayoutYears[0]} år</span>
                    </div>
                    <Slider
                      value={statePensionPayoutYears}
                      onValueChange={setStatePensionPayoutYears}
                      min={10}
                      max={25}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Antal år statlig inkomstpension betalas ut från pensionsstart
                    </p>
                  </div>
                )}
                
                {/* Tidig uttagsålder för tjänstepension */}
                {occPensionContribMonthly > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Börja använda tjänstepension från ålder</Label>
                        <InfoIcon 
                          title="Tidig uttag av tjänstepension"
                          description="Detta är åldern när du börjar ta ut din tjänstepension.\n\nTjänstepension kan ofta tas ut från 55 år, vilket gör den användbar för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela tjänstepensionen automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\nNär tjänstepensionen slås ihop med ditt övriga kapital beräknas en viktad avkastning baserat på storleken av varje del. För att simuleringen ska bli jämn höjs avkastningen på tjänstepensionen till minst samma nivå som efter FIRE (7% nominellt) innan viktningen.\n\nOm du väljer att börja använda denna pensionsdel före din pensionsålder flyttas både kapitalet och de löpande inbetalningarna över till din fria portfölj i simuleringen. Det gör vi för att inte fortsätta sätta in pengar i en pensionshink som redan har tagits i bruk.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag."
                        />
                      </div>
                      <span className="text-sm font-medium">{occPensionEarlyStartAge[0]} år</span>
                    </div>
                    <Slider
                      value={occPensionEarlyStartAge}
                      onValueChange={setOccPensionEarlyStartAge}
                      min={55}
                      max={sliderPensionAge[0]}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tjänstepension kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)
                    </p>
                  </div>
                )}
                
                {/* Tidig uttagsålder för IPS */}
                {privatePensionContribMonthly > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Börja använda IPS från ålder</Label>
                        <InfoIcon 
                          title="Tidig uttag av IPS"
                          description="Detta är åldern när du börjar ta ut ditt IPS (Individuellt Pensionssparande).\n\nIPS kan tas ut från 55 år, vilket gör det användbart för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela IPS-kapitalet automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\nNär IPS slås ihop med ditt övriga kapital beräknas en viktad avkastning baserat på storleken av varje del. För att simuleringen ska bli jämn höjs avkastningen på IPS till minst samma nivå som efter FIRE (7% nominellt) innan viktningen.\n\nOm du väljer att börja använda denna pensionsdel före din pensionsålder flyttas både kapitalet och de löpande inbetalningarna över till din fria portfölj i simuleringen. Det gör vi för att inte fortsätta sätta in pengar i en pensionshink som redan har tagits i bruk.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag."
                        />
                      </div>
                      <span className="text-sm font-medium">{ipsEarlyStartAge[0]} år</span>
                    </div>
                    <Slider
                      value={ipsEarlyStartAge}
                      onValueChange={setIpsEarlyStartAge}
                      min={55}
                      max={sliderPensionAge[0]}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      IPS kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)
                    </p>
                  </div>
                )}
                
                {/* Gemensam varning för tidiga uttag */}
                {(occPensionContribMonthly > 0 || privatePensionContribMonthly > 0) && (
                  <div className="mb-6">
                    <p className="text-xs text-amber-600 italic bg-amber-50 p-2 rounded border border-amber-200">
                      ⚠️ <strong>Antagande:</strong> Detta är ett exempel. Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag.
                    </p>
                  </div>
                )}
                
                {/* Utgifter/mån */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="expenses-mobile" className="text-sm">Utgifter/mån</Label>
                    <InfoIcon 
                      title="Månadsutgifter"
                      description="Detta är dina totala månadsutgifter som du behöver täcka efter ekonomisk frihet.\n\nJu lägre dina utgifter, desto mindre kapital behöver du för att nå FIRE. Detta är en av de viktigaste faktorerna för att nå ekonomisk frihet tidigt.\n\n4%-regeln säger att du behöver 25 gånger dina årsutgifter i kapital. Om dina utgifter är 20 000 kr/mån (240 000 kr/år), behöver du 6 miljoner kr för att nå FIRE."
                    />
                  </div>
                  <Input
                    id="expenses-mobile"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={monthlyExpenses === 0 ? '' : Math.floor(monthlyExpenses).toString()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setMonthlyExpenses(0);
                      } else {
                        const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                        if (!isNaN(num)) {
                          setMonthlyExpenses(num);
                        }
                      }
                    }}
                    className="w-full bg-white"
                  />
                  {/* Varning om orimligt låga utgifter */}
                  {monthlyExpenses > 0 && monthlyExpenses < 5000 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        ⚠️ <strong>Låga utgifter:</strong> Dina utgifter verkar orimligt låga. Kontrollera att allt stämmer under <button onClick={() => router.push('/household')} className="underline font-semibold text-amber-900 hover:text-amber-700">Redigera hushåll</button>.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Månadssparande */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Månadssparande</Label>
                      <InfoIcon 
                        title="Månadssparande"
                        description="Detta är det totala beloppet du sparar varje månad, inklusive amorteringar på lån.\n\nJu mer du sparar, desto snabbare når du ekonomisk frihet. Varje krona du sparar växer med avkastning över tid och hjälper dig att nå ditt mål tidigare.\n\nExempel: Om du sparar 10 000 kr/mån istället för 5 000 kr/mån, kan du nå FIRE flera år tidigare."
                      />
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(sliderMonthlySavings[0])}</span>
                  </div>
                  <Slider
                    value={sliderMonthlySavings}
                    onValueChange={setSliderMonthlySavings}
                    min={0}
                    max={monthlySavingsMax}
                    step={500}
                    className="w-full"
                  />
                  <div className="mt-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={sliderMonthlySavings[0] === 0 ? '' : Math.floor(sliderMonthlySavings[0]).toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setSliderMonthlySavings([0]);
                        } else {
                          const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                          if (!isNaN(num) && num >= 0) {
                            const clamped = Math.min(num, INPUT_MAX);
                            if (clamped > monthlySavingsMax && clamped <= INPUT_MAX) {
                              setMonthlySavingsMax(clamped);
                            }
                            setSliderMonthlySavings([clamped]);
                          }
                        }
                      }}
                      className="w-full bg-white"
                    />
                    <p className="text-[11px] text-primary/60 mt-1">
                      Tillåtet intervall: 0 – {formatCurrency(INPUT_MAX)}/mån. Du kan också dra i reglaget.
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Inkluderar amortering på skulder ({formatCurrency(amortizationMonthly)}/mån)
                  </p>
                </div>
                
                {/* Pensionsavsättning/mån */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-gray-700 block mb-1">
                    Pensionsavsättning/mån (från lön)
                  </Label>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(pensionContribMonthly)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatiskt från allmän pension, tjänstepension och löneväxling
                  </p>
                </div>
                
                {/* Real avkastning */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Real avkastning:</span>
                    <span className="text-lg font-bold text-blue-600">{(realReturns.realReturnAvailable * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Förklaring */}
            <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3 order-4 lg:order-none">
              {/* Bostadsfaktor förklaring */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong className="font-medium">Bostad i FIRE-beräkningen:</strong> Boendet räknas med till 40% av nettovärdet i den här FIRE-simuleringen. Det beror på att allt bostadskapital inte alltid är lätt att frigöra.
                </p>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Insättningar pågår tills du når ekonomisk frihet.</strong> Året du når ekonomisk frihet är sista året med insättningar, uttag startar året efter. 
                Efter brytet slutar pensionsinbetalningar, och endast avkastningen får pensionstillgångarna att växa.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-2">
                <strong>Avkastning beräknas automatiskt</strong> som viktat snitt från dina tillgångars förväntade avkastning, med hänsyn till nettovärden (tillgångar minus relaterade skulder) och proportionell fördelning av övriga skulder. 
                I manuellt läge kan du justera avkastningen för varje pensionsdel separat (tjänstepension, premiepension och IPS).
              </p>
              {useCoastFire && effectiveFireYear !== null && coastFireYears[0] > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">🌊 Coast FIRE-period</p>
                  <p className="text-xs text-green-800 leading-relaxed">
                    Under de första {coastFireYears[0]} åren efter ekonomisk frihet jobbar du deltid för att täcka dina utgifter. 
                    Du slutar spara nytt kapital och låter istället ditt redan investerade kapital växa. 
                    Pensionsavsättningarna fortsätter men reduceras baserat på din lägre inkomst. 
                    Efter Coast FIRE-perioden slutar du helt och börjar ta ut från ditt kapital.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Efter pensionsstart</strong> slås tillgängligt kapital och marknadsbaserad pension ihop till en portfölj. Den statliga inkomstpensionen utbetalas som en årlig inkomst (t.ex. över 20 år vid 63 års ålder) som minskar ditt behov av uttag från portföljen. Årliga uttag motsvarar därför dina utgifter <strong>minus</strong> statlig pension och görs från den sammanfogade portföljen.
                Hela poolen använder den avkastning som gäller efter att ekonomisk frihet nås (minst 7% nominell eller din ursprungliga om högre).
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Avkastning efter ekonomisk frihet:</strong> När ekonomisk frihet uppnås höjs avkastningen på tillgängliga tillgångar till minst 7% nominell för att säkerställa 4%-regeln. Om din ursprungliga avkastning redan är högre än 7%, fortsätter du med den höga avkastningen. Om ekonomisk frihet inte är uppnåelig används din ursprungliga avkastning hela vägen till pension.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Viktad avkastning vid sammanslagning:</strong> När kapital slås ihop från flera källor (t.ex. när pensionsdelar blir uttagsbara eller vid pensionsstart) beräknas en gemensam avkastning som ett viktat snitt av delarna. Pensionsdelar som blir uttagsbara justeras först upp till simulatorns lägsta nivå för avkastning efter frihet (7% nominellt) innan viktningen, så att låga pensionsavkastningar inte drar ner hela portföljen.
              </p>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-2">Linjer i grafen:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#C47A2C] rounded"></div>
                    <span><strong>Tillgängligt:</strong> Kapital du kan använda före pension. Visar sparande, avkastning och uttag.</span>
                </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#4A84C1] border-dashed border-t-2" style={{ borderColor: '#4A84C1' }}></div>
                    <span><strong>Marknadsbaserad pension:</strong> Tjänstepension, IPS och premiepension som blir tillgänglig vid pensionsstart (låst tills dess).</span>
                </div>
                  {dynamicFireResult?.statePensionAnnualIncome && dynamicFireResult.statePensionAnnualIncome > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-[#60a5fa] border-dashed border-t-2" style={{ borderColor: '#60a5fa' }}></div>
                      <span><strong>Statlig pension (inkomst):</strong> Inkomstpension som växer fram till pensionsstart, sedan utbetalas som inkomst ({formatCurrency(dynamicFireResult.statePensionAnnualIncome / 12)}/mån från {dSliderPensionAge[0]} år).</span>
                </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#9ca3af] border-dashed border-t-2" style={{ borderColor: '#9ca3af' }}></div>
                    <span><strong>Total:</strong> Summan av alla tillgångar och pensionsinkomster.</span>
                </div>
                </div>
                <div className="pt-2 border-t border-gray-200 mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 border-b-2 border-dashed" style={{ borderColor: '#0E5E4B' }}></div>
                    <span><strong>4%-krav:</strong> Det kapital du behöver vid pension för att kunna ta ut dina utgifter (4%-regeln). Om du har statlig pension som ger inkomst minskar behovet av kapital eftersom pensionen täcker en del av utgifterna.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 inline-block" style={{ backgroundColor: '#f59e0b', opacity: 0.2 }}></div>
                    <span><strong>Orange skugga:</strong> Bridge-perioden mellan ekonomisk frihet och pensionsstart.</span>
                </div>
                {useCoastFire && effectiveFireYear !== null && coastFireYears[0] > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 inline-block" style={{ backgroundColor: '#10b981', opacity: 0.15 }}></div>
                      <span><strong>Grön skugga:</strong> Coast FIRE-perioden – du jobbar deltid och täcker utgifter via arbete.</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 inline-block" style={{ backgroundColor: '#3b82f6', opacity: 0.08 }}></div>
                  <span><strong>Blå skugga:</strong> Pensionsperioden från pensionsstart och framåt.</span>
                </div>
                </div>
              </div>
            </div>
            
            {/* Grundprincip infobox */}
            <div className="p-4 md:p-6 bg-green-50 rounded-lg border border-green-200 order-5 lg:order-none">
              <p className="text-sm leading-relaxed text-green-900 mb-3">
                <strong className="text-green-900">💡 Kärnan i FIRE:</strong> Balansen mellan sparande, utgifter och avkastning. Genom att leva under dina tillgångar och investera skillnaden växer ditt kapital över tid genom ränta-på-ränta-effekten. När ditt investerade kapital kan täcka dina utgifter – utan att du behöver jobba – har du nått ekonomisk frihet.
              </p>
              {useCoastFire && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-sm leading-relaxed text-green-900">
                    <strong className="text-green-900">🌊 Coast FIRE:</strong> En variant av FIRE där du kan ta det lugnare. 
                    Istället för att jobba ihjäl dig och spara extremt mycket, kan du välja att gå ner i arbetstid under en del av bridge-perioden. 
                    Du jobbar deltid för att täcka utgifter, slutar spara, och låter ditt redan investerade kapital växa av sig självt. 
                    Det ger mer balans och frihet tidigare, även om vägen till full ekonomisk frihet blir lite längre.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Kontroller - sidebar på desktop, dold på mobil */}
          <div className="space-y-6 hidden lg:block">
            {/* Översikt över utgångskapital (startvärden) - kompakt */}
            {(() => {
              // Beräkna utgångsvärden från assets
              const startAvailable = availableAtStart || 0;
              const startOccPension = assets
                .filter(a => a.category === 'Tjänstepension')
                .reduce((sum, a) => sum + a.value, 0);
              const startPremiePension = assets
                .filter(a => a.category === 'Premiepension')
                .reduce((sum, a) => sum + a.value, 0);
              const startPrivatePension = assets
                .filter(a => a.category === 'Privat pensionssparande (IPS)')
                .reduce((sum, a) => sum + a.value, 0);
              const startTotalPension = startOccPension + startPremiePension + startPrivatePension;
              // Hämta statlig pension från fireResult eller dynamicFireResult
              const isPristine = manualFireYear === null;
              const sourceForStatePension = isPristine ? fireResult : dynamicFireResult;
              const startStatePension = sourceForStatePension?.statePensionAtStart || 0;
              
              // Visa bara om det finns något kapital
              if (startAvailable > 0 || startTotalPension > 0 || startStatePension > 0) {
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                    <p className="text-xs font-semibold mb-2 text-gray-700">
                      Utgångskapital
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {/* Tillgängligt */}
                      {startAvailable > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#C47A2C] flex-shrink-0"></div>
                            <span className="text-gray-600">Tillgängligt</span>
                          </div>
                          <span className="text-gray-900 font-medium">{formatCurrency(startAvailable)}</span>
                        </div>
                      )}
                      
                      {/* Marknadsbaserad pension - visa separata delar */}
                      {startTotalPension > 0 && (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-[#4A84C1] flex-shrink-0"></div>
                              <span className="text-gray-600">Marknadsbaserad pension</span>
                            </div>
                            <span className="text-gray-900 font-medium">{formatCurrency(startTotalPension)}</span>
                          </div>
                          {(startOccPension > 0 || startPremiePension > 0 || startPrivatePension > 0) && (
                            <div className="pl-3.5 space-y-0.5 text-[0.65rem] text-gray-500">
                              {startOccPension > 0 && (
                                <div>• Tjänste: {formatCurrency(startOccPension)}</div>
                              )}
                              {startPremiePension > 0 && (
                                <div>• Premie: {formatCurrency(startPremiePension)}</div>
                              )}
                              {startPrivatePension > 0 && (
                                <div>• IPS: {formatCurrency(startPrivatePension)}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Statlig pension */}
                      {startStatePension > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#60a5fa] flex-shrink-0"></div>
                            <span className="text-gray-600">Statlig pension</span>
                          </div>
                          <span className="text-gray-900 font-medium">{formatCurrency(startStatePension)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Justera antaganden</h3>
              
              {/* Separata avkastningar */}
              <div className="mb-6">
                <div className="mb-3">
                  <Label className="text-sm font-medium text-gray-900 block mb-2">Avkastning per hink</Label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className={`text-sm font-medium whitespace-nowrap ${!useAutoReturns ? 'text-gray-900' : 'text-gray-500'}`}>Manuell</span>
                    <Switch
                      checked={useAutoReturns}
                      onCheckedChange={setUseAutoReturns}
                    />
                    <span className={`text-sm font-medium whitespace-nowrap ${useAutoReturns ? 'text-gray-900' : 'text-gray-500'}`}>Auto</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    Auto = viktat snitt från dina tillgångar
                  </p>
                </div>
                
                {/* Tillgängliga tillgångar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Övriga tillgångar (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på övriga tillgångar"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på dina tillgängliga tillgångar - allt utom pensionssparande.\n\nI auto-läge beräknas detta automatiskt baserat på dina tillgångar (fonder, aktier, sparkonto, bostad, etc.) och deras förväntade avkastning.\n\nJu högre avkastning, desto snabbare växer ditt kapital och desto tidigare kan du nå FIRE. Men högre avkastning innebär också högre risk.\n\nStandardvärdet är 7% nominell avkastning, vilket ger cirka 5% real avkastning efter inflation."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {useAutoReturns ? (autoReturns.nomAvailable * 100).toFixed(1) : sliderReturnAvailable[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnAvailable}
                    onValueChange={setSliderReturnAvailable}
                    min={sliderBounds.available.min}
                    max={sliderBounds.available.max}
                    step={0.1}
                    className="w-full"
                    disabled={useAutoReturns}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnAvailable * 100).toFixed(1)}%
                  </div>
                </div>
                
                {/* Pensionstillgångar - visa bara i auto-läge */}
                {useAutoReturns && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Pensionstillgångar (nominell)</Label>
                    <span className="text-sm font-medium">
                        {((autoReturns.nomOccPension + autoReturns.nomPremiePension + autoReturns.nomPrivatePension) / 3 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnPension}
                    onValueChange={setSliderReturnPension}
                    min={sliderBounds.pension.min}
                    max={sliderBounds.pension.max}
                    step={0.1}
                    className="w-full"
                      disabled={true}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                      Real: {((realReturns.realReturnOccPension + realReturns.realReturnPremiePension + realReturns.realReturnPrivatePension) / 3 * 100).toFixed(1)}%
                  </div>
                </div>
                )}
                
                {/* Tre separata pensionssliders (endast i manuellt läge) */}
                {!useAutoReturns && (
                  <>
                    {/* Tjänstepension */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Tjänstepension (nominell)</Label>
                          <InfoIcon 
                            title="Avkastning på tjänstepension"
                            description="Detta är den förväntade årliga avkastningen på din tjänstepension.\n\nTjänstepension är den pension som din arbetsgivare betalar in åt dig. Den växer med avkastning tills du börjar ta ut den (vanligtvis från 55 år eller vid pensionsstart).\n\nJu högre avkastning, desto mer växer din tjänstepension och desto mer hjälp ger den dig vid pensionsstart. Standardvärdet är 7% nominell avkastning."
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {sliderReturnOccPension[0].toFixed(1)}%
                        </span>
                      </div>
                      <Slider
                        value={sliderReturnOccPension}
                        onValueChange={setSliderReturnOccPension}
                        min={sliderBounds.occPension.min}
                        max={sliderBounds.occPension.max}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Real: {(realReturns.realReturnOccPension * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* Premiepension */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Premiepension (nominell)</Label>
                          <InfoIcon 
                            title="Avkastning på premiepension"
                            description="Detta är den förväntade årliga avkastningen på din premiepension.\n\nPremiepension är en del av den statliga pensionen som du kan välja fonder för. Den växer med avkastning fram till pensionsstart (vanligtvis 63 år).\n\nPremiepension kan inte tas ut tidigt - den växer hela vägen till pensionsstart. Standardvärdet är 7% nominell avkastning."
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {sliderReturnPremiePension[0].toFixed(1)}%
                        </span>
                      </div>
                      <Slider
                        value={sliderReturnPremiePension}
                        onValueChange={setSliderReturnPremiePension}
                        min={sliderBounds.premiePension.min}
                        max={sliderBounds.premiePension.max}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Real: {(realReturns.realReturnPremiePension * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* IPS / Privat pensionssparande */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">IPS / Privat pensionssparande (nominell)</Label>
                          <InfoIcon 
                            title="Avkastning på IPS"
                            description="Detta är den förväntade årliga avkastningen på ditt IPS (Individuellt Pensionssparande).\n\nIPS är ett privat pensionssparande med skatteförmåner. Du kan ta ut IPS från 55 år, vilket gör det användbart för bridge-perioden innan statlig pension börjar.\n\nJu högre avkastning, desto mer växer ditt IPS. Standardvärdet är 7% nominell avkastning."
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {sliderReturnPrivatePension[0].toFixed(1)}%
                        </span>
                      </div>
                      <Slider
                        value={sliderReturnPrivatePension}
                        onValueChange={setSliderReturnPrivatePension}
                        min={sliderBounds.privatePension.min}
                        max={sliderBounds.privatePension.max}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Real: {(realReturns.realReturnPrivatePension * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 italic mb-4">
                      I manuellt läge styr du avkastningen för varje pensionsdel separat. Dessa tre värden används i både FIRE-beräkningen och simuleringen.
                    </div>
                  </>
                )}
                
                {useAutoReturns && (
                <div className="text-xs text-gray-500 italic">
                  Avkastning per hink baseras automatiskt på dina tillgångar (viktat). Du kan överstyra med reglagen.
                </div>
                )}
                
                {(!Number.isFinite(autoReturns.nomAvailable) || !Number.isFinite(autoReturns.nomOccPension)) && (
                  <div className="text-xs text-red-500 mt-1">
                    Varning: Kunde inte beräkna viktad avkastning – använder standardvärde 7%.
                  </div>
                )}
              </div>
              
              {/* Inflation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Inflation</Label>
                    <InfoIcon 
                      title="Inflation"
                      description="Inflation är den årliga prisökningen i samhället. När inflationen är 2% betyder det att samma varor och tjänster kostar 2% mer nästa år.\n\nI FIRE-beräkningen används real avkastning (avkastning minus inflation) för att se din faktiska köpkraft över tid. Om dina tillgångar växer med 7% men inflationen är 2%, är din reala avkastning 5%.\n\nStandardvärdet är 2%, vilket är Riksbankens inflationsmål. Du kan justera detta om du tror inflationen kommer vara högre eller lägre."
                    />
                  </div>
                  <span className="text-sm font-medium">{sliderInflation[0]}%</span>
                </div>
                <Slider
                  value={sliderInflation}
                  onValueChange={setSliderInflation}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              {/* Pensionsstartålder */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Pensionsstartålder</Label>
                    <InfoIcon 
                      title="Pensionsstartålder"
                      description="Detta är åldern när du planerar att börja ta ut din statliga pension och marknadsbaserade pensioner.\n\nBridge-perioden är tiden mellan när du når ekonomisk frihet (FIRE) och när pensionen börjar. Ju längre bridge-period, desto mer kapital behöver du vid FIRE för att täcka utgifterna.\n\nStandardvärdet är 63 år, vilket är den tidigaste åldern du kan ta ut statlig pension i Sverige. Du kan öka detta om du planerar att jobba längre."
                    />
                  </div>
                  <span className="text-sm font-medium">{sliderPensionAge[0]} år</span>
                </div>
                <Slider
                  value={sliderPensionAge}
                  onValueChange={setSliderPensionAge}
                  min={63}
                  max={67}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Utbetalningsperiod för statlig pension */}
              {dynamicFireResult?.statePensionAnnualIncome && dynamicFireResult.statePensionAnnualIncome > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Utbetalningsperiod för statlig pension</Label>
                      <InfoIcon 
                        title="Utbetalningsperiod för statlig pension"
                        description="Detta är antal år din statliga inkomstpension betalas ut från pensionsstart.\n\nJu längre utbetalningsperiod, desto lägre blir den månatliga utbetalningen men desto längre får du betalningar. Ju kortare period, desto högre månadsutbetalning men kortare tid.\n\nStandardvärdet är 20 år, vilket är en rimlig uppskattning baserat på genomsnittlig livslängd. Du kan justera detta baserat på din egen situation."
                      />
                    </div>
                    <span className="text-sm font-medium">{statePensionPayoutYears[0]} år</span>
                  </div>
                  <Slider
                    value={statePensionPayoutYears}
                    onValueChange={setStatePensionPayoutYears}
                    min={10}
                    max={25}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Antal år statlig inkomstpension betalas ut från pensionsstart
                  </p>
                </div>
              )}
              
              {/* Tidig uttagsålder för tjänstepension */}
              {occPensionContribMonthly > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Börja använda tjänstepension från ålder</Label>
                      <InfoIcon 
                        title="Tidig uttag av tjänstepension"
                        description="Detta är åldern när du börjar ta ut din tjänstepension.\n\nTjänstepension kan ofta tas ut från 55 år, vilket gör den användbar för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela tjänstepensionen automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag."
                      />
                    </div>
                    <span className="text-sm font-medium">{occPensionEarlyStartAge[0]} år</span>
                  </div>
                  <Slider
                    value={occPensionEarlyStartAge}
                    onValueChange={setOccPensionEarlyStartAge}
                    min={55}
                    max={sliderPensionAge[0]}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tjänstepension kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)
                  </p>
                </div>
              )}
              
              {/* Tidig uttagsålder för IPS */}
              {privatePensionContribMonthly > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Börja använda IPS från ålder</Label>
                      <InfoIcon 
                        title="Tidig uttag av IPS"
                        description="Detta är åldern när du börjar ta ut ditt IPS (Individuellt Pensionssparande).\n\nIPS kan tas ut från 55 år, vilket gör det användbart för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela IPS-kapitalet automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag."
                      />
                    </div>
                    <span className="text-sm font-medium">{ipsEarlyStartAge[0]} år</span>
                  </div>
                  <Slider
                    value={ipsEarlyStartAge}
                    onValueChange={setIpsEarlyStartAge}
                    min={55}
                    max={sliderPensionAge[0]}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    IPS kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)
                  </p>
                </div>
              )}
              
              {/* Gemensam varning för tidiga uttag */}
              {(occPensionContribMonthly > 0 || privatePensionContribMonthly > 0) && (
                <div className="mb-6">
                  <p className="text-xs text-amber-600 italic bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ <strong>Antagande:</strong> Detta är ett exempel. Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag.
                  </p>
                </div>
              )}
              
              {/* Utgifter/mån */}
              <div className="mb-6">
                <Label htmlFor="expenses" className="text-sm mb-2 block">Utgifter/mån</Label>
                <Input
                  id="expenses"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={monthlyExpenses === 0 ? '' : Math.floor(monthlyExpenses).toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setMonthlyExpenses(0);
                    } else {
                      const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                      if (!isNaN(num)) {
                        setMonthlyExpenses(num);
                      }
                    }
                  }}
                  className="w-full bg-white"
                />
                {/* Varning om orimligt låga utgifter */}
                {monthlyExpenses > 0 && monthlyExpenses < 5000 && (
                  <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      ⚠️ <strong>Låga utgifter:</strong> Dina utgifter verkar orimligt låga. Kontrollera att allt stämmer under <button onClick={() => router.push('/household')} className="underline font-semibold text-amber-900 hover:text-amber-700">Redigera hushåll</button>.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Månadssparande */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Månadssparande</Label>
                    <InfoIcon 
                      title="Månadssparande"
                      description="Detta är det totala beloppet du sparar varje månad, inklusive amorteringar på lån.\n\nJu mer du sparar, desto snabbare når du ekonomisk frihet. Varje krona du sparar växer med avkastning över tid och hjälper dig att nå ditt mål tidigare.\n\nExempel: Om du sparar 10 000 kr/mån istället för 5 000 kr/mån, kan du nå FIRE flera år tidigare."
                    />
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(sliderMonthlySavings[0])}</span>
                </div>
                <Slider
                  value={sliderMonthlySavings}
                  onValueChange={setSliderMonthlySavings}
                  min={0}
                  max={monthlySavingsMax}
                  step={500}
                  className="w-full"
                />
                <div className="mt-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={sliderMonthlySavings[0] === 0 ? '' : Math.floor(sliderMonthlySavings[0]).toString()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setSliderMonthlySavings([0]);
                      } else {
                        const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                        if (!isNaN(num) && num >= 0) {
                          const clamped = Math.min(num, INPUT_MAX);
                          if (clamped > monthlySavingsMax && clamped <= INPUT_MAX) {
                            setMonthlySavingsMax(clamped);
                          }
                          setSliderMonthlySavings([clamped]);
                        }
                      }
                    }}
                    className="w-full bg-white"
                  />
                  <p className="text-[11px] text-primary/60 mt-1">
                    Tillåtet intervall: 0 – {formatCurrency(INPUT_MAX)}/mån. Du kan också dra i reglaget.
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Inkluderar amortering på skulder ({formatCurrency(amortizationMonthly)}/mån)
                </p>
              </div>
              
              {/* Pensionsavsättning/mån */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-gray-700 block mb-1">
                  Pensionsavsättning/mån (från lön)
                </Label>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(pensionContribMonthly)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Automatiskt från allmän pension, tjänstepension och löneväxling
                </p>
              </div>
              
              {/* Real avkastning */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Real avkastning:</span>
                  <span className="text-lg font-bold text-blue-600">{(realReturns.realReturnAvailable * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Varningsbox - viktigt - längst ner */}
          <div className="lg:col-span-2 mt-6 p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="font-medium text-primary/80 mb-2 text-sm md:text-base">
                Viktigt: Detta är antaganden och gissningar
              </h3>
              <p className="text-xs md:text-sm text-primary/70 leading-relaxed mb-2">
                <strong className="text-primary/80">Denna simulator är gjord för att experimentera</strong> med olika antaganden om avkastning, inflation, sparande och utgifter. 
                Alla beräkningar baseras på antaganden, generaliseringar och förenklingar och är inte en garanti för framtida resultat.
              </p>
              <p className="text-xs md:text-sm text-primary/70 leading-relaxed mb-2">
                <strong className="text-primary/80">Tidigare utveckling är ingen garanti för framtiden.</strong> Historisk avkastning, inflation och ekonomiska trender kan och kommer att variera. 
                Detta är en förenklad simulering i dagens penningvärde med generaliseringar och förenklingar. Skatt och pension kan avvika från verkligheten.
              </p>
              <p className="text-xs md:text-sm text-primary/70 leading-relaxed">
                <strong className="text-primary/80">Om du funderar på att göra FIRE eller liknande måste du göra egna beräkningar utifrån dina specifika förhållanden.</strong> 
                Använd denna simulator som ett verktyg för att förstå och experimentera, inte som en exakt prognos eller rådgivning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

