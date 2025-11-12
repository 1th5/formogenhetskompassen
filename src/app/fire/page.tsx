'use client';

import { useState, useMemo, useEffect, useDeferredValue, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { toNumber } from '@/lib/utils/number';
import { simulatePortfolio, YearData } from '@/lib/fire/simulate';
import { calculateFIRE, FIREResult, calculateAutoReturns, toReal } from '@/lib/fire/calc';
import { ArrowLeft, Info, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateIncomePension, calculateOccupationalPension, calculatePremiePension } from '@/lib/wealth/calc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FIREFormWrapper, FIREFormValues } from '@/components/fire/FIREFormWrapper';

// Hjälpkomponent för info-ikoner med pedagogisk information (behålls för bakåtkompatibilitet)
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

export default function StandaloneFIREPage() {
  const router = useRouter();
  
  // Lägesval: snabbstart vs avancerat
  const [quickMode, setQuickMode] = useState(true);
  
  // Form values från FIREFormWrapper
  // Automatisk sättning av pensionsålder baserat på ålder
  const getDefaultPensionAge = (age: number): number => {
    if (age < 63) return 63;
    return 67;
  };

  const [formValues, setFormValues] = useState<FIREFormValues>({
    age: 40,
    pensionAge: getDefaultPensionAge(40),
    monthlyExpenses: 30000,
    monthlySavings: 10000,
    availableCapital: 300000,
    occPensionCapital: 0,
    premiePensionCapital: 0,
    ipsPensionCapital: 0,
    occPensionContrib: 0,
    premiePensionContrib: 0,
    ipsPensionContrib: 0,
    statePensionCapital: 0,
    statePensionContrib: 0,
  });
  
  // Standalone inputs - grunddata (behålls för bakåtkompatibilitet tills vidare)
  const [standaloneAssets, setStandaloneAssets] = useState<string>('300000');
  const [standalonePension, setStandalonePension] = useState<string>('300000');
  const [standaloneAge, setStandaloneAge] = useState<string>('35');
  const [standalonePensionContrib, setStandalonePensionContrib] = useState<string>('3000');
  
  // Bostad (valfritt)
  const [includeHousing, setIncludeHousing] = useState(false);
  const [housingValue, setHousingValue] = useState<string>('');
  const [housingLoan, setHousingLoan] = useState<string>('');
  
  // Pensionsfördelning (expanderbar)
  const [showPensionDetails, setShowPensionDetails] = useState(false);
  const [occPensionPercent, setOccPensionPercent] = useState(70);
  const [premiePensionPercent, setPremiePensionPercent] = useState(20);
  const [ipsPensionPercent, setIpsPensionPercent] = useState(10);
  const [occPensionCapital, setOccPensionCapital] = useState<string>('');
  const [premiePensionCapital, setPremiePensionCapital] = useState<string>('');
  const [ipsPensionCapital, setIpsPensionCapital] = useState<string>('');
  const [occPensionContrib, setOccPensionContrib] = useState<string>('');
  const [premiePensionContrib, setPremiePensionContrib] = useState<string>('');
  const [ipsPensionContrib, setIpsPensionContrib] = useState<string>('');
  
  // Statlig pension
  const [statePensionContrib, setStatePensionContrib] = useState<string>('0');
  const [statePensionCapital, setStatePensionCapital] = useState<string>('0');
  const [showStatePensionCalc, setShowStatePensionCalc] = useState(false);
  const [statePensionCalcSalary, setStatePensionCalcSalary] = useState<string>('');
  const [statePensionCalcAge, setStatePensionCalcAge] = useState<string>('');
  
  // Tidiga uttag
  const [occPensionEarlyStartAge, setOccPensionEarlyStartAge] = useState<number>(55);
  const [ipsEarlyStartAge, setIpsEarlyStartAge] = useState<number>(55);
  
  // Simulator controls (same as dashboard version)
  const [sliderReturnAvailable, setSliderReturnAvailable] = useState([7]);
  const [sliderReturnOccPension, setSliderReturnOccPension] = useState([7]);
  const [sliderReturnPremiePension, setSliderReturnPremiePension] = useState([5]);
  const [sliderReturnIpsPension, setSliderReturnIpsPension] = useState([7]);
  const [sliderReturnPension, setSliderReturnPension] = useState([5]); // För bakåtkompatibilitet
  const [sliderInflation, setSliderInflation] = useState([2]);
  const [sliderPensionAge, setSliderPensionAge] = useState([63]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [sliderMonthlySavings, setSliderMonthlySavings] = useState([10000]);
  
  // Ref för att undvika oändlig loop vid synkning
  const isSyncingFromAgeRef = useRef(false);
  const isSyncingFromSliderRef = useRef(false);
  const lastAgeRef = useRef(formValues.age);
  const lastPensionAgeRef = useRef(formValues.pensionAge);

  // Automatisk justering av pensionsålder när ålder ändras
  useEffect(() => {
    if (isSyncingFromSliderRef.current) return; // Ignorera om slidern just ändrats
    
    const currentAge = formValues.age;
    // Bara uppdatera om åldern faktiskt har ändrats
    if (currentAge === lastAgeRef.current) return;
    lastAgeRef.current = currentAge;
    
    const defaultPensionAge = getDefaultPensionAge(currentAge);
    
    // Bara uppdatera om pensionsåldern inte matchar default-värdet
    if (formValues.pensionAge !== defaultPensionAge) {
      isSyncingFromAgeRef.current = true;
      setFormValues(prev => ({ ...prev, pensionAge: defaultPensionAge }));
      setSliderPensionAge([defaultPensionAge]);
      lastPensionAgeRef.current = defaultPensionAge;
      // Reset flag efter en kort delay
      setTimeout(() => {
        isSyncingFromAgeRef.current = false;
      }, 10);
    }
  }, [formValues.age]);

  // Synka formValues.pensionAge till slidern (bara om det inte kommer från slidern)
  useEffect(() => {
    if (isSyncingFromSliderRef.current) return;
    if (isSyncingFromAgeRef.current) return;
    
    const currentPensionAge = formValues.pensionAge;
    if (currentPensionAge === lastPensionAgeRef.current) return;
    lastPensionAgeRef.current = currentPensionAge;
    
    if (sliderPensionAge[0] !== currentPensionAge) {
      isSyncingFromAgeRef.current = true;
      setSliderPensionAge([currentPensionAge]);
      setTimeout(() => {
        isSyncingFromAgeRef.current = false;
      }, 10);
    }
  }, [formValues.pensionAge]);

  // Synka formValues till befintliga state-variabler (utom pensionAge som hanteras separat)
  useEffect(() => {
    setMonthlyExpenses(formValues.monthlyExpenses);
    setSliderMonthlySavings([formValues.monthlySavings]);
  }, [formValues.monthlyExpenses, formValues.monthlySavings]);

  // Synka slidern tillbaka till formValues när användaren ändrar den
  useEffect(() => {
    if (isSyncingFromAgeRef.current) return;
    
    const currentSliderValue = sliderPensionAge[0];
    if (currentSliderValue === lastPensionAgeRef.current) return;
    lastPensionAgeRef.current = currentSliderValue;
    
    if (currentSliderValue !== formValues.pensionAge) {
      isSyncingFromSliderRef.current = true;
      setFormValues(prev => ({ ...prev, pensionAge: currentSliderValue }));
      setTimeout(() => {
        isSyncingFromSliderRef.current = false;
      }, 10);
    }
  }, [sliderPensionAge]);
  const [manualFireYear, setManualFireYear] = useState<number | null>(null);
  
  // Snabbstart: lön för att beräkna pensioner
  const [quickSalary, setQuickSalary] = useState<string>('');
  const [statePensionPayoutYears, setStatePensionPayoutYears] = useState([20]);
  
  // Calculate average age first - använd formValues om tillgängligt
  const averageAge = useMemo(() => {
    return Math.max(18, Math.min(100, formValues.age));
  }, [formValues.age]);
  
  // Snabbstart: beräkna pensioner från lön
  const quickPensionCalculations = useMemo(() => {
    if (quickMode && quickSalary) {
      const salary = toNumber(quickSalary);
      if (salary > 0) {
        const mockPerson = {
          name: 'Person',
          birth_year: new Date().getFullYear() - averageAge,
          incomes: [{
            id: '1',
            label: 'Lön',
            monthly_income: salary,
            income_type: 'job' as const,
            pension_type: 'ITP1' as const
          }],
          other_savings_monthly: 0
        };
        const incomePension = calculateIncomePension(mockPerson);
        const occPension = calculateOccupationalPension(mockPerson);
        const premiePension = calculatePremiePension(mockPerson);
        const totalMarketPension = occPension + premiePension;
        return {
          statePension: incomePension,
          marketPension: totalMarketPension,
          total: incomePension + totalMarketPension
        };
      }
    }
    return null;
  }, [quickMode, quickSalary, averageAge]);
  
  // Uppdatera pensionsavsättningar när quick-beräkning ändras (bara om fälten var tomma/0)
  useEffect(() => {
    if (quickPensionCalculations && quickMode) {
      // Bara skriv över om fältet var tomt eller 0, för att inte förstöra manuella inmatningar
      const currentStatePension = toNumber(statePensionContrib);
      if (currentStatePension === 0) {
        // Runda till närmaste heltal för bättre UX
        const rounded = Math.round(quickPensionCalculations.statePension);
        if (rounded > 0) {
          setStatePensionContrib(rounded.toString());
        }
      }
      const currentMarketPension = toNumber(standalonePensionContrib);
      if (currentMarketPension === 0) {
        // Runda till närmaste heltal för bättre UX
        const rounded = Math.round(quickPensionCalculations.marketPension);
        if (rounded > 0) {
          setStandalonePensionContrib(rounded.toString());
        }
      }
    }
  }, [quickPensionCalculations, quickMode]);
  
  // Calculate values from standalone inputs
  const baseAvailableAtStart = useMemo(() => {
    const val = toNumber(standaloneAssets);
    return val;
  }, [standaloneAssets]);
  
  const totalPensionCapital = useMemo(() => {
    const val = toNumber(standalonePension);
    return val;
  }, [standalonePension]);
  
  const totalPensionContribMonthly = useMemo(() => {
    const val = toNumber(standalonePensionContrib);
    return Math.max(0, val);
  }, [standalonePensionContrib]);
  
  // Bostad (40% av nettovärde)
  const housingNet = useMemo(() => {
    if (!includeHousing) return 0;
    const value = toNumber(housingValue);
    const loan = toNumber(housingLoan);
    return Math.max(0, value - loan);
  }, [includeHousing, housingValue, housingLoan]);
  
  const fireHousing = useMemo(() => {
    if (housingNet <= 0) return 0;
    return housingNet * 0.4; // 40% faktor
  }, [housingNet]);
  
  const availableAtStart = useMemo(() => {
    // Använd formValues om tillgängligt, annars fallback till gammal logik
    return formValues.availableCapital > 0 ? formValues.availableCapital : (baseAvailableAtStart + fireHousing);
  }, [formValues.availableCapital, baseAvailableAtStart, fireHousing]);
  
  // Pensionsfördelning - använd formValues om tillgängligt
  const occPensionAtStart = useMemo(() => {
    if (formValues.occPensionCapital > 0) return formValues.occPensionCapital;
    if (showPensionDetails && occPensionCapital) {
      return toNumber(occPensionCapital);
    }
    return totalPensionCapital * (occPensionPercent / 100);
  }, [formValues.occPensionCapital, showPensionDetails, occPensionCapital, totalPensionCapital, occPensionPercent]);
  
  const premiePensionAtStart = useMemo(() => {
    if (formValues.premiePensionCapital > 0) return formValues.premiePensionCapital;
    if (showPensionDetails && premiePensionCapital) {
      return toNumber(premiePensionCapital);
    }
    return totalPensionCapital * (premiePensionPercent / 100);
  }, [formValues.premiePensionCapital, showPensionDetails, premiePensionCapital, totalPensionCapital, premiePensionPercent]);
  
  const privatePensionAtStart = useMemo(() => {
    if (formValues.ipsPensionCapital > 0) return formValues.ipsPensionCapital;
    if (showPensionDetails && ipsPensionCapital) {
      return toNumber(ipsPensionCapital);
    }
    return totalPensionCapital * (ipsPensionPercent / 100);
  }, [formValues.ipsPensionCapital, showPensionDetails, ipsPensionCapital, totalPensionCapital, ipsPensionPercent]);
  
  const occPensionContribMonthly = useMemo(() => {
    if (formValues.occPensionContrib > 0) return formValues.occPensionContrib;
    if (showPensionDetails && occPensionContrib) {
      return toNumber(occPensionContrib);
    }
    return totalPensionContribMonthly * (occPensionPercent / 100);
  }, [formValues.occPensionContrib, showPensionDetails, occPensionContrib, totalPensionContribMonthly, occPensionPercent]);
  
  const premiePensionContribMonthly = useMemo(() => {
    if (formValues.premiePensionContrib > 0) return formValues.premiePensionContrib;
    if (showPensionDetails && premiePensionContrib) {
      return toNumber(premiePensionContrib);
    }
    return totalPensionContribMonthly * (premiePensionPercent / 100);
  }, [formValues.premiePensionContrib, showPensionDetails, premiePensionContrib, totalPensionContribMonthly, premiePensionPercent]);
  
  const privatePensionContribMonthly = useMemo(() => {
    // IPS-avsättning ska vara 0 som standard (både i Quick och Avancerat läge)
    // Användaren kan ange ett värde i Avancerat läge om de vill
    if (formValues.ipsPensionContrib > 0) return formValues.ipsPensionContrib;
    if (showPensionDetails && ipsPensionContrib) {
      return toNumber(ipsPensionContrib);
    }
    // Default: 0 (inte beräkna från procent)
    return 0;
  }, [formValues.ipsPensionContrib, showPensionDetails, ipsPensionContrib]);
  
  // Statlig pension - beräkning från lön
  const calculatedStatePensionContrib = useMemo(() => {
    if (showStatePensionCalc && statePensionCalcSalary && statePensionCalcAge) {
      // Använd calculateIncomePension för att räkna från lön
      const salary = toNumber(statePensionCalcSalary);
      const age = parseInt(statePensionCalcAge) || averageAge;
      const mockPerson = {
        name: 'Person',
        birth_year: new Date().getFullYear() - age,
        incomes: [{
          id: '1',
          label: 'Lön',
          monthly_income: salary,
          income_type: 'job' as const,
          pension_type: 'ITP1' as const
        }],
        other_savings_monthly: 0
      };
      return calculateIncomePension(mockPerson);
    }
    return null;
  }, [showStatePensionCalc, statePensionCalcSalary, statePensionCalcAge, averageAge]);
  
  // Uppdatera state när beräkning ändras (avancerat läge)
  // OBS: Denna useEffect ska INTE skriva över värdet från quick mode när man byter läge
  useEffect(() => {
    if (calculatedStatePensionContrib !== null && !quickMode && showStatePensionCalc) {
      // Runda till närmaste heltal för bättre UX
      const rounded = Math.round(calculatedStatePensionContrib);
      if (rounded > 0) {
        setStatePensionContrib(rounded.toString());
      }
    }
  }, [calculatedStatePensionContrib, quickMode, showStatePensionCalc]);
  
  const statePensionAtStart = useMemo(() => {
    if (formValues.statePensionCapital > 0) return formValues.statePensionCapital;
    const val = toNumber(statePensionCapital);
    return Math.max(0, val);
  }, [formValues.statePensionCapital, statePensionCapital]);
  
  // Använd beräknat värde om det finns, annars parsad input - prioritera formValues
  const statePensionContribMonthly = useMemo(() => {
    if (formValues.statePensionContrib > 0) return formValues.statePensionContrib;
    return calculatedStatePensionContrib ?? toNumber(statePensionContrib);
  }, [formValues.statePensionContrib, calculatedStatePensionContrib, statePensionContrib]);
  
  // Deferred values for performance
  const dSliderReturnAvailable = useDeferredValue(sliderReturnAvailable);
  const dSliderReturnOccPension = useDeferredValue(sliderReturnOccPension);
  const dSliderReturnPremiePension = useDeferredValue(sliderReturnPremiePension);
  const dSliderReturnIpsPension = useDeferredValue(sliderReturnIpsPension);
  const dSliderReturnPension = useDeferredValue(sliderReturnPension);
  const dSliderInflation = useDeferredValue(sliderInflation);
  const dSliderPensionAge = useDeferredValue(sliderPensionAge);
  const dMonthlyExpenses = useDeferredValue(monthlyExpenses);
  const dSliderMonthlySavings = useDeferredValue(sliderMonthlySavings);
  // Notera: occPensionEarlyStartAge och ipsEarlyStartAge är nu primitiva, inga deferred values behövs
  
  // Calculate real returns
  const realReturns = useMemo(() => {
    const nomAvailable = dSliderReturnAvailable[0] / 100;
    const nomOcc = dSliderReturnOccPension[0] / 100;
    const nomPremie = dSliderReturnPremiePension[0] / 100;
    const nomIps = dSliderReturnIpsPension[0] / 100;
    const inflation = dSliderInflation[0] / 100;
    
    return {
      realReturnAvailable: toReal(nomAvailable, inflation),
      realReturnOccPension: toReal(nomOcc, inflation),
      realReturnPremiePension: toReal(nomPremie, inflation),
      realReturnPrivatePension: toReal(nomIps, inflation),
      realReturnStatePension: toReal(0.03, inflation), // Default 3% nominal för statlig pension
      realReturnPension: toReal((nomOcc + nomPremie + nomIps) / 3, inflation), // Snitt för bakåtkompatibilitet
      realPostFireReturnAvailable: Math.max(toReal(0.07, inflation), toReal(nomAvailable, inflation))
    };
  }, [dSliderReturnAvailable, dSliderReturnOccPension, dSliderReturnPremiePension, dSliderReturnIpsPension, dSliderInflation]);
  
  // Create minimal assets/persons arrays for calculateFIRE
  const mockAssets = useMemo(() => {
    const assets: any[] = [];
    if (availableAtStart > 0) {
      assets.push({
        category: 'Övrigt',
        value: availableAtStart,
        expected_apy: sliderReturnAvailable[0] / 100
      });
    }
    if (occPensionAtStart > 0) {
      assets.push({
        category: 'Tjänstepension',
        value: occPensionAtStart,
        expected_apy: sliderReturnOccPension[0] / 100
      });
    }
    if (premiePensionAtStart > 0) {
      assets.push({
        category: 'Premiepension',
        value: premiePensionAtStart,
        expected_apy: sliderReturnPremiePension[0] / 100
      });
    }
    if (privatePensionAtStart > 0) {
      assets.push({
        category: 'Privat pensionssparande (IPS)',
        value: privatePensionAtStart,
        expected_apy: sliderReturnIpsPension[0] / 100
      });
    }
    if (statePensionAtStart > 0) {
      assets.push({
        category: 'Trygghetsbaserad pension (Statlig)',
        value: statePensionAtStart,
        expected_apy: 0.03 // Default 3% nominal
      });
    }
    return assets;
  }, [availableAtStart, occPensionAtStart, premiePensionAtStart, privatePensionAtStart, statePensionAtStart, sliderReturnAvailable, sliderReturnOccPension, sliderReturnPremiePension, sliderReturnIpsPension]);
  
  const mockPersons = useMemo(() => {
    return [{
      name: 'Person',
      birth_year: new Date().getFullYear() - averageAge,
      incomes: [],
      other_savings_monthly: 0 // calculateFIRE tar monthlySavings som separat parameter, så vi sätter 0 här
    }];
  }, [averageAge]);
  
  const totalNetWorth = availableAtStart + occPensionAtStart + premiePensionAtStart + privatePensionAtStart + statePensionAtStart;
  
  // Calculate FIRE
  const dynamicFireResult = useMemo(() => {
    if (availableAtStart <= 0 && occPensionAtStart <= 0 && premiePensionAtStart <= 0 && privatePensionAtStart <= 0 && statePensionAtStart <= 0) {
      return { yearsToFire: null, portfolioAtFire: 0 };
    }
    
    // Använd primitiva värden direkt (inte arrays längre)
    // Debug: Log när dynamicFireResult beräknas med nya värden
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 dynamicFireResult calculating with:', {
        occPensionEarlyStartAge,
        ipsEarlyStartAge,
        pensionAge: dSliderPensionAge[0]
      });
    }
    
    const result = calculateFIRE(
      mockAssets,
      mockPersons,
      totalNetWorth,
      dSliderMonthlySavings[0],
      realReturns.realReturnAvailable,
      dSliderPensionAge[0],
      0, // monthlyPensionAfterTax
      () => dMonthlyExpenses + dSliderMonthlySavings[0], // netIncomeFn (expenses + savings = income)
      dMonthlyExpenses, // customMonthlyExpenses
      dSliderInflation[0] / 100,
      [], // liabilities
      realReturns.realReturnOccPension,
      realReturns.realReturnPremiePension,
      realReturns.realReturnPrivatePension,
      realReturns.realReturnStatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      occPensionEarlyStartAge, // Primitivt värde
      ipsEarlyStartAge  // Primitivt värde
    );
    
    return {
      yearsToFire: result.yearsToFire,
      portfolioAtFire: result.portfolioAtFire,
      statePensionAnnualIncome: result.statePensionAnnualIncome || 0,
      statePensionPayoutYears: result.statePensionPayoutYears || 20
    };
  }, [
    mockAssets,
    mockPersons,
    totalNetWorth,
    dSliderMonthlySavings,
    realReturns.realReturnAvailable,
    realReturns.realReturnOccPension,
    realReturns.realReturnPremiePension,
    realReturns.realReturnPrivatePension,
    realReturns.realReturnStatePension,
    dSliderPensionAge,
    dMonthlyExpenses,
    occPensionContribMonthly,
    premiePensionContribMonthly,
    privatePensionContribMonthly,
    dSliderInflation,
    occPensionEarlyStartAge, // Primitivt värde
    ipsEarlyStartAge, // Primitivt värde
    availableAtStart,
    occPensionAtStart,
    premiePensionAtStart,
    privatePensionAtStart,
    statePensionAtStart
  ]);
  
  // Calculate 4% requirement (minus statlig pension)
  const requiredAtPensionLive = useMemo(() => {
    const annualExpenses = dMonthlyExpenses * 12;
    const statePensionIncome = dynamicFireResult.statePensionAnnualIncome || 0;
    return Math.max(0, (annualExpenses - statePensionIncome) * 25);
  }, [dMonthlyExpenses, dynamicFireResult.statePensionAnnualIncome]);
  
  // Use manual FIRE year if set, otherwise calculated
  const effectiveFireYear = useMemo(() => {
    if (manualFireYear !== null) {
      const fireAge = manualFireYear;
      const yearsToFire = fireAge - averageAge;
      return yearsToFire >= 0 ? yearsToFire : null;
    }
    return dynamicFireResult.yearsToFire;
  }, [manualFireYear, dynamicFireResult.yearsToFire, averageAge]);
  
  // Validate manualFireYear
  useEffect(() => {
    if (manualFireYear !== null) {
      if (manualFireYear < averageAge || manualFireYear >= sliderPensionAge[0]) {
        setManualFireYear(null);
      }
    }
    if (dynamicFireResult.yearsToFire === null && manualFireYear !== null) {
      setManualFireYear(null);
    }
  }, [manualFireYear, averageAge, sliderPensionAge[0], dynamicFireResult.yearsToFire]);
  
  // Simulate portfolio
  const simulation = useMemo(() => {
    // Använd primitiva värden direkt (inte arrays längre)
    const pensionAge = dSliderPensionAge[0];
    const payoutYears = statePensionPayoutYears[0];
    const inflation = dSliderInflation[0] / 100;
    const monthlySavings = dSliderMonthlySavings[0];
    
    // Debug: Log när simuleringen körs med nya värden
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Simulation running with:', {
        occPensionEarlyStartAge,
        ipsEarlyStartAge,
        pensionAge,
        payoutYears,
        inflation,
        monthlySavings
      });
    }
    
    const result = simulatePortfolio(
      availableAtStart,
      0, // pensionLockedAtStart (används inte längre, separata pensionshinkar används istället)
      monthlySavings,
      realReturns.realReturnAvailable,
      0, // realReturnPension (används inte längre, separata pensionsavkastningar används istället)
      dMonthlyExpenses * 12,
      averageAge,
      pensionAge,
      requiredAtPensionLive,
      effectiveFireYear,
      0, // monthlyPensionAfterTax
      0, // marketPensionContribMonthly (används inte längre, separata pensionsavsättningar används istället)
      inflation,
      false, // useCoastFire (inte tillgängligt i standalone)
      0, // coastFireYears
      0, // coastFirePensionContribMonthly
      statePensionAtStart,
      realReturns.realReturnStatePension,
      statePensionContribMonthly,
      payoutYears,
      dynamicFireResult.statePensionAnnualIncome || 0,
      occPensionAtStart,
      premiePensionAtStart,
      privatePensionAtStart,
      realReturns.realReturnOccPension,
      realReturns.realReturnPremiePension,
      realReturns.realReturnPrivatePension,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      undefined, // coastFireOccPensionContribMonthly
      undefined, // coastFirePremiePensionContribMonthly
      undefined, // coastFirePrivatePensionContribMonthly
      occPensionEarlyStartAge, // Primitivt värde
      ipsEarlyStartAge  // Primitivt värde
    );
    
    // Temporär logg för att verifiera merge (endast i dev-läge)
    if (process.env.NODE_ENV !== 'production') {
      // Verifiera tjänstepension merge
      if (occPensionAtStart > 0 && occPensionEarlyStartAge > averageAge && occPensionEarlyStartAge <= 100) {
        const beforeOcc = result.data.find(d => d.age === occPensionEarlyStartAge - 1);
        const atOcc = result.data.find(d => d.age === occPensionEarlyStartAge);
        if (beforeOcc && atOcc) {
          console.log('🔍 Merge check (Tjänstepension):', {
            age: occPensionEarlyStartAge,
            before: { 
              age: beforeOcc.age, 
              available: beforeOcc.available, 
              pension: beforeOcc.pension,
              occPension: beforeOcc.occPension || 0
            },
            at: { 
              age: atOcc.age, 
              available: atOcc.available, 
              pension: atOcc.pension,
              occPension: atOcc.occPension || 0
            },
            pensionDecreased: beforeOcc.pension > atOcc.pension,
            availableIncreased: atOcc.available > beforeOcc.available
          });
        }
      }
      
      // Verifiera IPS merge
      if (privatePensionAtStart > 0 && ipsEarlyStartAge > averageAge && ipsEarlyStartAge <= 100) {
        const beforeIps = result.data.find(d => d.age === ipsEarlyStartAge - 1);
        const atIps = result.data.find(d => d.age === ipsEarlyStartAge);
        if (beforeIps && atIps) {
          console.log('🔍 Merge check (IPS):', {
            age: ipsEarlyStartAge,
            before: { 
              age: beforeIps.age, 
              available: beforeIps.available, 
              pension: beforeIps.pension,
              privatePension: beforeIps.privatePension || 0
            },
            at: { 
              age: atIps.age, 
              available: atIps.available, 
              pension: atIps.pension,
              privatePension: atIps.privatePension || 0
            },
            pensionDecreased: beforeIps.pension > atIps.pension,
            availableIncreased: atIps.available > beforeIps.available
          });
        }
      }
      
      // Verifiera premiepension merge vid pensionsstart
      if (premiePensionAtStart > 0 && pensionAge > averageAge && pensionAge <= 100) {
        const beforePension = result.data.find(d => d.age === pensionAge - 1);
        const atPension = result.data.find(d => d.age === pensionAge);
        if (beforePension && atPension) {
          console.log('🔍 Merge check (Premiepension vid pensionsstart):', {
            age: pensionAge,
            before: { 
              age: beforePension.age, 
              available: beforePension.available, 
              pension: beforePension.pension,
              premiePension: beforePension.premiePension || 0
            },
            at: { 
              age: atPension.age, 
              available: atPension.available, 
              pension: atPension.pension,
              premiePension: atPension.premiePension || 0
            },
            pensionDecreased: beforePension.pension > atPension.pension,
            availableIncreased: atPension.available > beforePension.available
          });
        }
      }
    }
    
    return result;
  }, [
    availableAtStart,
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
    dSliderInflation,
    statePensionAtStart,
    statePensionContribMonthly,
    statePensionPayoutYears,
    dynamicFireResult.statePensionAnnualIncome,
    occPensionAtStart,
    premiePensionAtStart,
    privatePensionAtStart,
    occPensionContribMonthly,
    premiePensionContribMonthly,
    privatePensionContribMonthly,
    occPensionEarlyStartAge, // Primitivt värde
    ipsEarlyStartAge // Primitivt värde
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

  // Detect mobile for chart range
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Prepare chart data - limit to 80 years on mobile
  const chartData = useMemo(() => {
    const pensionAge = sliderPensionAge[0]; // Använd skalär
    const allData = simulation.data.map(d => {
      const isAfterPension = d.age >= pensionAge;
      return {
        ...d, // Sprid in alla fält från simuleringen (availableReturn, savingsContrib, netWithdrawal, osv)
        År: d.age,
        Tillgängligt: d.available,
        'Marknadsbaserad pension': d.pension, // Använd bakåtkompatibilitetsfältet (summan av occPension + premiePension + privatePension)
        'Statlig pension': isAfterPension ? (d.statePensionIncome || 0) : (d.statePensionCapital || 0), // Visa kapital före pension, inkomst efter
        Total: d.total,
      };
    });
    
    // Debug: Log när chartData uppdateras
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 chartData updated:', {
        dataPoints: allData.length,
        firstPension: allData.find(d => d['Marknadsbaserad pension'] > 0)?.År,
        lastPension: allData.filter(d => d['Marknadsbaserad pension'] > 0).pop()?.År,
        sampleData: allData.slice(0, 3).map(d => ({
          age: d.År,
          available: d.Tillgängligt,
          pension: d['Marknadsbaserad pension']
        }))
      });
    }
    
    return isMobile ? allData.filter(d => d.År <= 80) : allData;
  }, [simulation, isMobile, sliderPensionAge]); // Använd hela simulation-objektet för att säkerställa att React upptäcker ändringar
  
  const monthlySavingsMax = Math.max(dSliderMonthlySavings[0], 100000);
  const INPUT_MAX = 1000000;

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-4 md:py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-primary">FIRE-kalkylator</h1>
              <p className="text-sm md:text-base text-primary/70 mt-1">
                Simulera när du kan nå ekonomisk frihet enligt FIRE-principer
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => router.push('/dashboard/fire/info')}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Info className="w-4 h-4 mr-2" />
                Om beräkningen
              </Button>
            </div>
          </div>
          
          {/* Info Section om FIRE */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                    Vad är FIRE?
                  </h3>
                  <p className="text-sm text-primary/80 mb-3">
                    <strong>FIRE</strong> (Financial Independence, Retire Early) är en strategi för att nå ekonomisk frihet så att du kan välja när och hur du vill arbeta. Fokus ligger på frihet och valfrihet – inte bara "tidigt pensionerad". När du når FIRE har du tillräckligt kapital för att täcka dina utgifter utan att behöva arbeta heltid.
                  </p>
                  <p className="text-sm text-primary/80 mb-3">
                    <strong>Hur fungerar simulatorn?</strong> Den simulerar hur ditt kapital växer över tid baserat på ditt sparande, avkastning och utgifter. Den visar när du kan nå ekonomisk frihet enligt <strong>4%-regeln</strong> – att kunna leva på 4% av ditt kapital per år (vilket motsvarar 25 gånger dina årsutgifter). Simulatorn visar också hur kapitalet utvecklas genom både sparande och pension över din livstid.
                  </p>
                  <p className="text-sm text-primary/80 mb-3">
                    <strong>Bridge-period:</strong> Tiden mellan ekonomisk frihet och pension kallas "bridge-period" – när ditt tillgängliga kapital (exkl. pension) används för att täcka utgifter tills pensionen börjar. Under denna period växer dina pensionspengar medan du använder ditt övriga kapital. Ju längre bridge-period, desto mer kapital behöver du vid FIRE.
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <p className="text-sm font-semibold text-primary mb-2">
                      🌊 Coast FIRE
                    </p>
                    <p className="text-sm text-primary/80 mb-2">
                      <strong>Coast FIRE</strong> är en variant av FIRE för den som inte vill jobba ihjäl sig i unga år, utan hellre tar det lugnare men fortfarande siktar mot ekonomisk frihet. Idén är att du sparar och investerar tillräckligt tidigt så att du kan "coasta" mot full ekonomisk frihet – du jobbar deltid för att täcka utgifter, slutar spara, och låter ditt redan investerade kapital växa av sig självt.
                    </p>
                    <p className="text-sm text-primary/80">
                      <strong>Obs:</strong> Denna fristående kalkylator har inte stöd för Coast FIRE-simulering. Om du vill testa och simulera Coast FIRE kan du använda Förmögenhetskollen (se länk längre ner på sidan) där det finns fullt stöd för Coast FIRE med möjlighet att välja deltidsperiod och se hur det påverkar din ekonomiska frihet.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Info om Quick vs Avancerat */}
          <Card className="mb-4 bg-gray-50 border-gray-200">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-700">
                    <strong>Quick-läge:</strong> Fyll i grundläggande information (ålder, lön, sparande, kapital) och låt kalkylatorn beräkna resten automatiskt. Perfekt för en snabb översikt. <strong>Avancerat läge:</strong> Ange exakta värden för alla pensionshinkar och avsättningar individuellt. Byt läge med knappen nedan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Standalone Input Section - Ny refaktorerad version */}
          <FIREFormWrapper
            quickMode={quickMode}
            onModeChange={setQuickMode}
            onValuesChange={setFormValues}
          />
          
          {/* Behåll gammal form-sektion som fallback tills vidare (kommenterad ut) */}
          {false && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Dina grundvärden</CardTitle>
              {quickMode && (
                <p className="text-xs text-primary/70 mt-2 mb-3">
                  Fyll i det du vet så gissar vi på resten. Du kan alltid öppna avancerat sen.
                </p>
              )}
              <div className="mt-4 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={quickMode}
                    onChange={() => setQuickMode(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Snabb uppskattning</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={!quickMode}
                    onChange={() => setQuickMode(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Jag vill fylla i allt själv</span>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* A. Grunddata */}
                <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Grunddata</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="standalone-age" className="mb-2 block">Ålder</Label>
                    <Input
                      id="standalone-age"
                      type="number"
                      inputMode="numeric"
                      value={standaloneAge}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 18 && parseInt(val) <= 100)) {
                          setStandaloneAge(val);
                        }
                      }}
                      min={18}
                      max={100}
                      className="w-full bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pension-age-standalone" className="mb-2 block">Önskad pensionsålder</Label>
                    <Input
                      id="pension-age-standalone"
                      type="number"
                      inputMode="numeric"
                      value={sliderPensionAge[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 63;
                        if (val >= 55 && val <= 67) {
                          setSliderPensionAge([val]);
                        }
                      }}
                      min={55}
                      max={67}
                      className="w-full bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* B. Kassaflöde */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Kassaflöde</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="expenses-standalone-grund" className="block">Utgifter per månad (kr)</Label>
                      <InfoIcon 
                        title="Månadsutgifter"
                        description="Detta är dina totala månadsutgifter som du behöver täcka efter ekonomisk frihet.\n\nJu lägre dina utgifter, desto mindre kapital behöver du för att nå FIRE. Detta är en av de viktigaste faktorerna för att nå ekonomisk frihet tidigt.\n\n4%-regeln säger att du behöver 25 gånger dina årsutgifter i kapital. Om dina utgifter är 20 000 kr/mån (240 000 kr/år), behöver du 6 miljoner kr för att nå FIRE."
                      />
                    </div>
                    <Input
                      id="expenses-standalone-grund"
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
                      placeholder="30000"
                      className="w-full bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="savings-standalone-grund" className="mb-2 block">Sparande per månad (kr)</Label>
                    <Input
                      id="savings-standalone-grund"
                      type="text"
                      inputMode="numeric"
                      value={sliderMonthlySavings[0] === 0 ? '' : Math.floor(sliderMonthlySavings[0]).toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setSliderMonthlySavings([0]);
                        } else {
                          const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                          if (!isNaN(num) && num >= 0) {
                            setSliderMonthlySavings([Math.min(num, INPUT_MAX)]);
                          }
                        }
                      }}
                      placeholder="10000"
                      className="w-full bg-white"
                    />
                  </div>
                </div>
                
                {/* Snabbstart: Lön för att beräkna pensioner */}
                {quickMode && (
                  <div className="mt-4">
                    <Label htmlFor="quick-salary" className="mb-2 block">Bruttolön/mån (för att uppskatta pensionsavsättningar) (kr)</Label>
                    <Input
                      id="quick-salary"
                      type="text"
                      inputMode="numeric"
                      value={quickSalary}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s,]/g, '');
                        setQuickSalary(val);
                      }}
                      placeholder="40000"
                      className="w-full bg-white"
                    />
                    <p className="text-xs text-primary/60 mt-1">
                      {quickPensionCalculations ? (
                        <>
                          Beräknad statlig pension: {formatCurrency(quickPensionCalculations?.statePension || 0)}/mån. 
                          Marknadsbaserad pension: {formatCurrency(quickPensionCalculations?.marketPension || 0)}/mån.
                        </>
                      ) : (
                        'Vill du skriva in egna belopp? → avancerat'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* C. Tillgångar nu */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Tillgångar nu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="standalone-assets" className="mb-2 block">Tillgängligt kapital idag (kr)</Label>
                  <Input
                    id="standalone-assets"
                    type="text"
                    inputMode="numeric"
                    value={standaloneAssets}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s,]/g, '');
                      setStandaloneAssets(val);
                    }}
                    placeholder="500000"
                    className="w-full bg-white"
                  />
                  <p className="text-xs text-primary/60 mt-1">
                    Fonder, aktier, sparkonton, etc.
                  </p>
                </div>
                  
                  {/* Bostad (valfritt) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="include-housing"
                        checked={includeHousing}
                        onCheckedChange={setIncludeHousing}
                      />
                      <Label htmlFor="include-housing" className="cursor-pointer">
                        {quickMode ? 'Jag äger bostad' : 'Lägg till bostad i beräkningen'}
                      </Label>
                    </div>
                    {includeHousing && (
                      <>
                        {quickMode ? (
                          <div className="pl-8">
                            <Label htmlFor="housing-net" className="mb-1 block text-xs">Nettovärde bostad (värde - lån) (kr)</Label>
                            <Input
                              id="housing-net"
                              type="text"
                              inputMode="numeric"
                              value={(() => {
                                if (housingNet > 0) return Math.floor(housingNet).toString();
                                if (housingValue && housingLoan) {
                                  const val = toNumber(housingValue);
                                  const loan = toNumber(housingLoan);
                                  return (val - loan).toString();
                                }
                                return '';
                              })()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                const netValue = toNumber(val);
                                // Sätt värde och lån så att netto blir rätt
                                if (netValue > 0) {
                                  setHousingValue((netValue * 1.5).toString()); // Uppskatta värde
                                  setHousingLoan((netValue * 0.5).toString()); // Uppskatta lån
                                } else {
                                  setHousingValue('');
                                  setHousingLoan('');
                                }
                              }}
                              placeholder="1000000"
                              className="w-full bg-white text-sm"
                            />
                            <p className="text-xs text-primary/60 mt-1">
                              40% av nettovärdet läggs till i ditt tillgängliga kapital och får samma avkastning som övriga tillgångar.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 pl-8">
                <div>
                              <Label htmlFor="housing-value" className="mb-1 block text-xs">Bostadens värde (kr)</Label>
                              <Input
                                id="housing-value"
                                type="text"
                                inputMode="numeric"
                                value={housingValue}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d\s,]/g, '');
                                  setHousingValue(val);
                                }}
                                placeholder="3000000"
                                className="w-full bg-white text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="housing-loan" className="mb-1 block text-xs">Bolån (kr)</Label>
                              <Input
                                id="housing-loan"
                                type="text"
                                inputMode="numeric"
                                value={housingLoan}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d\s,]/g, '');
                                  setHousingLoan(val);
                                }}
                                placeholder="2000000"
                                className="w-full bg-white text-sm"
                              />
                            </div>
                          </div>
                        )}
                        {!quickMode && fireHousing > 0 && (
                          <p className="text-xs text-primary/60 pl-8">
                            {fireHousing > 0 ? `${formatCurrency(fireHousing)} (40% av nettovärde) läggs till i tillgängligt kapital. Det får samma avkastning som övriga tillgångar.` : ''}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* D. Pension nu */}
              {!quickMode && (
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-3">Pension nu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="standalone-pension" className="mb-2 block">Pensionskapital (låst) totalt (kr)</Label>
                  <Input
                    id="standalone-pension"
                    type="text"
                    inputMode="numeric"
                    value={standalonePension}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s,]/g, '');
                      setStandalonePension(val);
                    }}
                    placeholder="1000000"
                    className="w-full bg-white"
                  />
                  <p className="text-xs text-primary/60 mt-1">
                        Tjänstepension, premiepension, IPS
                  </p>
                </div>
                <div>
                      <Label htmlFor="standalone-pension-contrib" className="mb-2 block">Pensionsavsättning per månad totalt (kr)</Label>
                  <Input
                    id="standalone-pension-contrib"
                    type="text"
                    inputMode="numeric"
                    value={standalonePensionContrib}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s,]/g, '');
                      setStandalonePensionContrib(val);
                    }}
                    placeholder="0"
                    className="w-full bg-white"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-primary/60">
                      Månatlig avsättning till pension
                    </p>
                    <Link 
                      href="/salary" 
                      className="text-xs text-primary hover:text-primary/80 underline flex items-center gap-1 transition-colors whitespace-nowrap"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calculator className="w-3 h-3" />
                      Räkna ut
                    </Link>
                  </div>
                </div>
                  </div>
                  
                  {/* Expanderbar pensionsfördelning */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPensionDetails(!showPensionDetails)}
                      className="w-full justify-between text-sm"
                    >
                      <span>Visa detaljerad fördelning</span>
                      {showPensionDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    
                    {showPensionDetails && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                      <p className="text-xs text-primary/70 mb-3">
                        Fördela pensionskapitalet och avsättningarna. Om du inte fyller i detaljer fördelas automatiskt: Tjänstepension 70%, Premiepension 20%, IPS 10%.
                      </p>
                      
                      {/* Procentfördelning */}
                      <div className="grid grid-cols-3 gap-3">
                <div>
                          <Label htmlFor="occ-percent" className="mb-1 block text-xs">Tjänstepension (%)</Label>
                  <Input
                            id="occ-percent"
                            type="number"
                            value={occPensionPercent}
                    onChange={(e) => {
                              const val = parseInt(e.target.value) || 70;
                              if (val >= 0 && val <= 100) {
                                setOccPensionPercent(val);
                                // Justera de andra automatiskt
                                const remaining = 100 - val;
                                const premieRatio = premiePensionPercent / (premiePensionPercent + ipsPensionPercent || 1);
                                setPremiePensionPercent(Math.round(remaining * premieRatio));
                                setIpsPensionPercent(remaining - Math.round(remaining * premieRatio));
                              }
                            }}
                            min={0}
                            max={100}
                            className="w-full bg-white text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="premie-percent" className="mb-1 block text-xs">Premiepension (%)</Label>
                          <Input
                            id="premie-percent"
                            type="number"
                            value={premiePensionPercent}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 20;
                              if (val >= 0 && val <= 100) {
                                setPremiePensionPercent(val);
                                const remaining = 100 - occPensionPercent - val;
                                setIpsPensionPercent(Math.max(0, remaining));
                              }
                            }}
                            min={0}
                            max={100}
                            className="w-full bg-white text-sm"
                  />
                </div>
                <div>
                          <Label htmlFor="ips-percent" className="mb-1 block text-xs">IPS (%)</Label>
                  <Input
                            id="ips-percent"
                    type="number"
                            value={ipsPensionPercent}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 10;
                              if (val >= 0 && val <= 100) {
                                setIpsPensionPercent(val);
                                const remaining = 100 - occPensionPercent - val;
                                setPremiePensionPercent(Math.max(0, remaining));
                              }
                            }}
                            min={0}
                            max={100}
                            className="w-full bg-white text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Kapital idag */}
                      <div>
                        <h5 className="text-xs font-medium text-primary mb-2">Kapital idag (ändra om du vet)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="occ-capital" className="mb-1 block text-xs">Tjänstepension idag (kr)</Label>
                            <Input
                              id="occ-capital"
                              type="text"
                    inputMode="numeric"
                              value={occPensionCapital}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setOccPensionCapital(val);
                              }}
                              placeholder={formatCurrency(occPensionAtStart)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="premie-capital" className="mb-1 block text-xs">Premiepension idag (kr)</Label>
                            <Input
                              id="premie-capital"
                              type="text"
                              inputMode="numeric"
                              value={premiePensionCapital}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setPremiePensionCapital(val);
                              }}
                              placeholder={formatCurrency(premiePensionAtStart)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ips-capital" className="mb-1 block text-xs">IPS idag (kr)</Label>
                            <Input
                              id="ips-capital"
                              type="text"
                              inputMode="numeric"
                              value={ipsPensionCapital}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setIpsPensionCapital(val);
                              }}
                              placeholder={formatCurrency(privatePensionAtStart)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Avsättning per månad */}
                      <div>
                        <h5 className="text-xs font-medium text-primary mb-2">Avsättning per månad (ändra om du vet)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="occ-contrib" className="mb-1 block text-xs">Tjänstepension/mån (kr)</Label>
                            <Input
                              id="occ-contrib"
                              type="text"
                              inputMode="numeric"
                              value={occPensionContrib}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setOccPensionContrib(val);
                              }}
                              placeholder={formatCurrency(occPensionContribMonthly)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="premie-contrib" className="mb-1 block text-xs">Premiepension/mån (kr)</Label>
                            <Input
                              id="premie-contrib"
                              type="text"
                              inputMode="numeric"
                              value={premiePensionContrib}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setPremiePensionContrib(val);
                              }}
                              placeholder={formatCurrency(premiePensionContribMonthly)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ips-contrib" className="mb-1 block text-xs">IPS/mån (kr)</Label>
                            <Input
                              id="ips-contrib"
                              type="text"
                              inputMode="numeric"
                              value={ipsPensionContrib}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setIpsPensionContrib(val);
                              }}
                              placeholder={formatCurrency(privatePensionContribMonthly)}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              )}

              {/* E. Statlig pension */}
              {!quickMode && (
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-3">Statlig pension</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state-pension-contrib" className="mb-2 block">Statlig pensionsavsättning/mån (inkomstpension) (kr)</Label>
                    <Input
                      id="state-pension-contrib"
                      type="text"
                      inputMode="numeric"
                      value={statePensionContrib}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s,]/g, '');
                        setStatePensionContrib(val);
                      }}
                      placeholder="0"
                      className="w-full bg-white"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-primary/60">
                        Månatlig inkomstpensionsavsättning
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStatePensionCalc(!showStatePensionCalc)}
                        className="text-xs h-auto py-1 px-2"
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        Beräkna från lön
                      </Button>
                    </div>
                    
                    {showStatePensionCalc && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-primary/70 mb-2">Skriv din bruttolön så räknar vi fram ungefärlig statlig pensionsavsättning</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="state-calc-salary" className="mb-1 block text-xs">Bruttolön/mån (kr)</Label>
                            <Input
                              id="state-calc-salary"
                              type="text"
                              inputMode="numeric"
                              value={statePensionCalcSalary}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^\d\s,]/g, '');
                                setStatePensionCalcSalary(val);
                              }}
                              placeholder="30000"
                              className="w-full bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state-calc-age" className="mb-1 block text-xs">Ålder</Label>
                            <Input
                              id="state-calc-age"
                              type="number"
                              value={statePensionCalcAge || standaloneAge}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 18 && parseInt(val) <= 100)) {
                                  setStatePensionCalcAge(val);
                      }
                    }}
                    min={18}
                    max={100}
                              className="w-full bg-white text-sm"
                            />
                          </div>
                        </div>
                        {statePensionContribMonthly > 0 && (
                          <p className="text-xs text-green-700 mt-2 font-medium">
                            Beräknad: {formatCurrency(statePensionContribMonthly)}/månad
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="state-pension-capital" className="mb-2 block">Har du redan intjänad statlig pension? (kr)</Label>
                    <Input
                      id="state-pension-capital"
                      type="text"
                      inputMode="numeric"
                      value={statePensionCapital}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s,]/g, '');
                        setStatePensionCapital(val);
                      }}
                      placeholder="0"
                    className="w-full bg-white"
                  />
                    <p className="text-xs text-primary/60 mt-1">
                      Valfritt. Om tomt eller 0 växer pensionen bara med månatlig avsättning.
                    </p>
                </div>
              </div>
                </div>
              )}
              
              {/* Snabbstart: Visa avancerat-länk */}
              {quickMode && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setQuickMode(false)}
                    className="w-full"
                  >
                    Visa avancerat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 flex flex-col lg:block space-y-6">
            {/* FIRE Result Indicator */}
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
                    <div className={`text-sm ${
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
                          <div className="mt-3 pt-3 border-t border-red-200 bg-red-50/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-red-900 mb-2">För att det ska hålla till minst {sliderPensionAge[0] + 15} år behöver du antingen:</p>
                            <ul className="text-xs text-red-800 space-y-1 ml-4 list-disc">
                              <li>Minska utgifterna eller öka månadssparandet</li>
                              <li>Skjuta på pensionen till {Math.min(67, sliderPensionAge[0] + 2)} år</li>
                            </ul>
                          </div>
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
                    </div>
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
                      <span className="flex items-center gap-1">
                        4%-krav: {formatCurrency(requiredAtPensionLive)}
                        <InfoIcon
                          title="4%-kravet"
                          description="4%-kravet beräknas som: (Årsutgifter – Statlig pension) × 25\n\nDetta är det kapital du behöver vid pensionsstart för att kunna leva på 4% av kapitalet per år. Statlig pension dras av eftersom den minskar dina uttag från övrigt kapital.\n\n4%-regeln säger att du kan ta ut 4% av ditt kapital per år utan att riskera att det tar slut. Om dina årsutgifter är 240 000 kr och statlig pension ger 60 000 kr/år, behöver du (240 000 - 60 000) × 25 = 4 500 000 kr."
                        />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Dynamisk analys av grafen */}
                {effectiveFireYear !== null && simulation.capitalDepletedYear === null && (() => {
                  const fireAge = averageAge + effectiveFireYear;
                  const bridgeYears = sliderPensionAge[0] - fireAge;
                  const fireYearData = simulation.data.find(d => d.age === fireAge);
                  const pensionYearData = simulation.data.find(d => d.age === sliderPensionAge[0]);
                  const annualExpenses = monthlyExpenses * 12;
                  
                  // Beräkna uttagsnivå vid FIRE
                  const withdrawalRateAtFire = fireYearData && fireYearData.available > 0 && annualExpenses > 0
                    ? (annualExpenses / fireYearData.available) * 100
                    : null;
                  
                  // Beräkna kapitaltillväxt under bridge-perioden
                  const capitalGrowthDuringBridge = fireYearData && pensionYearData && fireYearData.available > 0
                    ? ((pensionYearData.available - fireYearData.available) / fireYearData.available) * 100
                    : null;
                  
                  // Hitta lägsta kapital under bridge-perioden
                  const bridgeData = simulation.data.filter(d => d.age >= fireAge && d.age <= sliderPensionAge[0]);
                  const minAvailableDuringBridge = bridgeData.length > 0 
                    ? Math.min(...bridgeData.map(d => d.available))
                    : null;
                  const minAvailableAge = minAvailableDuringBridge !== null
                    ? bridgeData.find(d => d.available === minAvailableDuringBridge)?.age || null
                    : null;
                  
                  // Beräkna hur mycket kapital som behöver växa
                  const capitalNeededToGrow = portfolioAtFire < requiredAtPensionLive
                    ? requiredAtPensionLive - portfolioAtFire
                    : null;
                  const growthNeededPercent = capitalNeededToGrow && portfolioAtFire > 0
                    ? (capitalNeededToGrow / portfolioAtFire) * 100
                    : null;
                  
                  // Beräkna genomsnittlig avkastning som behövs
                  const avgReturnNeeded = growthNeededPercent && bridgeYears > 0
                    ? (Math.pow(1 + growthNeededPercent / 100, 1 / bridgeYears) - 1) * 100
                    : null;
                  
                  return (
                    <div className={`mt-3 pt-3 border-t ${
                      fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                        ? 'border-green-200'
                        : 'border-orange-200'
                    }`}>
                      {/* Vad ser du i grafen just nu? */}
                      {bridgeYears > 0 && (
                        <div className="mb-3">
                          <p className={`text-xs font-semibold mb-2 ${
                            fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0]
                              ? 'text-green-800'
                              : 'text-orange-800'
                          }`}>
                            📊 Vad ser du i grafen just nu?
                          </p>
                          <div className="text-xs space-y-1.5">
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>blå linjen (Tillgängligt)</strong> visar ditt kapital som kan användas före pension. 
                              Vid {fireAge} år börjar du ta ut från denna linje för att täcka utgifter.
                            </p>
                            {capitalGrowthDuringBridge !== null && (
                              <p className={
                                capitalGrowthDuringBridge > 0 
                                  ? (fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700')
                                  : 'text-red-700'
                              }>
                                • Under bridge-perioden (mellan {fireAge}-{sliderPensionAge[0]} år, {bridgeYears} år) {capitalGrowthDuringBridge > 0 ? 'växer' : 'minskar'} ditt tillgängliga kapital med {Math.abs(capitalGrowthDuringBridge).toFixed(1)}%.
                                {capitalGrowthDuringBridge < 0 && (
                                  <span className="font-semibold text-red-800"> ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer.</span>
                                )}
                              </p>
                            )}
                            {minAvailableAge && minAvailableAge !== fireAge && minAvailableDuringBridge !== null && (
                              <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                                • Kapitalet når sitt lägsta värde vid {minAvailableAge} år ({formatCurrency(minAvailableDuringBridge)}), 
                                sedan växer det igen när uttagen minskar eller avkastningen ökar.
                              </p>
                            )}
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>gröna linjen (Marknadsbaserad pension)</strong> växer hela tiden tills den slås ihop med tillgängligt vid {sliderPensionAge[0]} år.
                            </p>
                            {dynamicFireResult?.statePensionAnnualIncome && dynamicFireResult.statePensionAnnualIncome > 0 && (
                              <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                                • Den <strong>blå streckade linjen (Statlig pension)</strong> visar inkomstpensionen som minskar ditt behov av uttag efter {sliderPensionAge[0]} år.
                              </p>
                            )}
                            <p className={fourPercentRuleMetYear !== null && fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700' : 'text-orange-700'}>
                              • Den <strong>svarta linjen (Total)</strong> visar summan av allt. Den ska överskrida 4%-kravet ({formatCurrency(requiredAtPensionLive)}) vid eller före {sliderPensionAge[0]} år.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Riskvarningar och vad man ska tänka på */}
                      {bridgeYears > 0 && (
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
                            {/* Withdrawal rate varning */}
                            {withdrawalRateAtFire !== null && (
                              <div className={withdrawalRateAtFire > 5 ? 'text-red-700 bg-red-50 p-2 rounded' : withdrawalRateAtFire > 4 ? 'text-orange-700 bg-orange-50 p-2 rounded' : 'text-green-700'}>
                                <p>
                                  <strong>Uttagsnivå (mellan {fireAge}-{sliderPensionAge[0]} år):</strong> Du tar ut {withdrawalRateAtFire.toFixed(1)}% per år från ditt tillgängliga kapital.
                                  {withdrawalRateAtFire > 5 && (
                                    <span className="block mt-1 font-semibold">⚠️ Detta är högt! Över 5% per år ökar risken att kapitalet tar slut. Överväg att spara mer eller jobba längre.</span>
                                  )}
                                  {withdrawalRateAtFire > 4 && withdrawalRateAtFire <= 5 && (
                                    <span className="block mt-1">💡 Detta är över den säkra 4%-regeln. Om marknaden går dåligt kan det bli tufft. Överväg en buffert eller högre avkastning.</span>
                                  )}
                                  {withdrawalRateAtFire <= 4 && (
                                    <span className="block mt-1">✅ Detta är inom den säkra 4%-regeln. Bra!</span>
                                  )}
                                </p>
                              </div>
                            )}
                            
                            {/* Capital needed to grow varning */}
                            {capitalNeededToGrow !== null && capitalNeededToGrow > 0 && (
                              <div className={avgReturnNeeded && avgReturnNeeded > 10 ? 'text-red-700 bg-red-50 p-2 rounded' : avgReturnNeeded && avgReturnNeeded > 7 ? 'text-orange-700 bg-orange-50 p-2 rounded' : 'text-blue-700 bg-blue-50 p-2 rounded'}>
                                <p>
                                  <strong>Stor tillväxt krävs (mellan {fireAge}-{sliderPensionAge[0]} år):</strong> Ditt kapital behöver växa med {growthNeededPercent?.toFixed(1)}% under bridge-perioden för att nå 4%-kravet.
                                  {avgReturnNeeded && avgReturnNeeded > 10 && (
                                    <span className="block mt-1 font-semibold">⚠️ Detta är mycket! Det kräver en genomsnittlig real avkastning på över {avgReturnNeeded.toFixed(1)}% per år. Överväg att spara mer.</span>
                                  )}
                                  {avgReturnNeeded && avgReturnNeeded > 7 && avgReturnNeeded <= 10 && (
                                    <span className="block mt-1">💡 Detta kräver en genomsnittlig real avkastning på {avgReturnNeeded.toFixed(1)}% per år, vilket är högt men möjligt med rätt investeringar.</span>
                                  )}
                                  {avgReturnNeeded && avgReturnNeeded <= 7 && (
                                    <span className="block mt-1">✅ Detta kräver en genomsnittlig real avkastning på {avgReturnNeeded.toFixed(1)}% per år, vilket är rimligt.</span>
                                  )}
                                </p>
                              </div>
                            )}
                            
                            {/* Capital buffer */}
                            {portfolioAtFire >= requiredAtPensionLive && (
                              <div className="text-green-700 bg-green-50 p-2 rounded">
                                <p>
                                  <strong>✅ Buffert:</strong> Din portfölj vid frihet överstiger redan 4%-kravet med {formatCurrency(portfolioAtFire - requiredAtPensionLive)}. 
                                  Detta ger dig en säkerhetsmarginal om marknaden går dåligt.
                                </p>
                              </div>
                            )}
                            
                            {/* 4% rule timing */}
                            {fourPercentRuleMetYear !== null && (
                              <div className={fourPercentRuleMetYear <= sliderPensionAge[0] ? 'text-green-700 bg-green-50 p-2 rounded' : 'text-orange-700 bg-orange-50 p-2 rounded'}>
                                <p>
                                  <strong>4%-regeln nås vid {fourPercentRuleMetYear} år</strong>
                                  {fourPercentRuleMetYear < fireAge ? (
                                    <span className="block mt-1">✅ Redan innan ekonomisk frihet! Du har en stor säkerhetsmarginal.</span>
                                  ) : fourPercentRuleMetYear === fireAge ? (
                                    <span className="block mt-1">✅ Exakt vid ekonomisk frihet! Perfekt timing.</span>
                                  ) : fourPercentRuleMetYear <= sliderPensionAge[0] ? (
                                    <span className="block mt-1">✅ Under bridge-perioden. Ditt kapital växer tillräckligt för hållbara uttag.</span>
                                  ) : (
                                    <span className="block mt-1">⚠️ Efter pensionsstart. Överväg att spara mer eller jobba längre.</span>
                                  )}
                                </p>
                              </div>
                            )}
                            
                            {/* General tips */}
                            <div className="text-gray-700 bg-gray-50 p-2 rounded">
                              <p className="font-medium mb-1">💡 Allmänna tips:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Ju lägre utgifter, desto mindre kapital behöver du. Överväg att minska utgifter för att nå FIRE tidigare.</li>
                                <li>Högre avkastning kan hjälpa, men kom ihåg att högre avkastning innebär högre risk.</li>
                                <li>Om du kan jobba längre eller spara mer, minskar risken betydligt.</li>
                                <li>Dessa beräkningar är baserade på antaganden – verkligheten kan avvika.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white rounded-lg border border-slate-200/40 p-4 md:p-6">
              <div className="h-[400px] md:h-[500px] lg:h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    key={`chart-${occPensionEarlyStartAge}-${ipsEarlyStartAge}-${sliderPensionAge[0]}`}
                    data={chartData}
                  >
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
                        
                        if (name === 'Tillgängligt') {
                          let details = formattedValue;
                          
                          // Kolla om tjänstepension eller IPS flyttas över detta år
                          const isOccPensionUnlockYear = age === occPensionEarlyStartAge;
                          const isIpsUnlockYear = age === ipsEarlyStartAge;
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
                          // Lägg till milstolpe-info
                          if (isAvailable4Percent) {
                            details += `\n\n⭐ Tillgängligt kapital når 4%-kravet vid denna ålder`;
                          }
                          if (isCapitalDepleted) {
                            details += `\n\n⚠️ Tillgängligt kapital tar slut vid denna ålder`;
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
                            const canOccBeUnlocked = age >= occPensionEarlyStartAge;
                            if (!canOccBeUnlocked || (payload.occPension !== undefined && payload.occPension > 0)) {
                              pensionParts.push('Tjänstepension');
                            }
                            
                            // Premiepension: alltid kvar före pensionsstart (kan inte överföras tidigt)
                            pensionParts.push('Premiepension');
                            
                            // IPS: visa om det inte kan ha överförts än, eller om det faktiskt finns kvar
                            const canIpsBeUnlocked = age >= ipsEarlyStartAge;
                            if (!canIpsBeUnlocked || (payload.privatePension !== undefined && payload.privatePension > 0)) {
                              pensionParts.push('IPS');
                            }
                            
                            // Visa resultatet
                            details += `\n${pensionParts.join(' + ')}`;
                          }
                          
                          // Visa avsättningar om de finns
                          const occContrib = payload.occPensionContrib || 0;
                          const premieContrib = payload.premiePensionContrib || 0;
                          const privateContrib = payload.privatePensionContrib || 0;
                          const totalContrib = occContrib + premieContrib + privateContrib;
                          
                          if (totalContrib > 0) {
                            const contribParts: string[] = [];
                            if (occContrib > 0) contribParts.push(`Tjänste: ${formatCurrency(occContrib)}`);
                            if (premieContrib > 0) contribParts.push(`Premie: ${formatCurrency(premieContrib)}`);
                            if (privateContrib > 0) contribParts.push(`IPS: ${formatCurrency(privateContrib)}`);
                            
                            if (contribParts.length > 0) {
                              details += `\n+ Avsättning: ${formatCurrency(totalContrib)}/år`;
                              if (contribParts.length > 1) {
                                details += `\n  (${contribParts.join(', ')})`;
                              }
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
                          return details;
                        } else if (name === 'Statlig pension' || name === 'Statlig pension (kapital → inkomst)') {
                          // Före pension: visa kapital och tillväxt
                          if (payload.statePensionCapital !== undefined && payload.statePensionCapital > 0) {
                            let details = formattedValue;
                            details += `\nInkomstpension (statlig)`;
                            if (payload.statePensionContrib !== undefined && payload.statePensionContrib > 0) {
                              details += `\n+ Avsättning: ${formatCurrency(payload.statePensionContrib)}`;
                            }
                            if (payload.statePensionReturn !== undefined && payload.statePensionReturn !== 0) {
                              // Använd realReturns.realReturnStatePension för avkastningsprocenten (samma som i integrerad version)
                              const statePensionPercent = (realReturns.realReturnStatePension * 100).toFixed(1);
                              details += `\n+ Avkastning (${statePensionPercent}%): ${formatCurrency(payload.statePensionReturn)}`;
                            } else if (payload.statePensionCapital > 0) {
                              // Visa avkastningsprocenten även om avkastningen är 0 (för att visa att det finns kapital)
                              const statePensionPercent = (realReturns.realReturnStatePension * 100).toFixed(1);
                              details += `\n+ Avkastning (${statePensionPercent}%): ${formatCurrency(0)}`;
                            }
                            return details;
                          }
                          // Efter pension: visa inkomst
                          if (payload.statePensionIncome !== undefined && payload.statePensionIncome > 0) {
                            // Använd payload.statePensionIncome direkt för att säkerställa rätt värde
                            const annualIncome = payload.statePensionIncome;
                            const monthlyIncome = annualIncome / 12;
                            let details = `${formatCurrency(annualIncome)}/år`;
                            details += `\n(${formatCurrency(monthlyIncome)}/mån)`;
                            details += `\nℹ️ Utbetalning per år (minskar uttag)`;
                            return details;
                          }
                          // Om inget kapital eller inkomst finns, visa ändå avkastningsprocenten om det finns avsättning
                          if (payload.statePensionContrib !== undefined && payload.statePensionContrib > 0) {
                            let details = formattedValue;
                            details += `\nInkomstpension (statlig)`;
                            details += `\n+ Avsättning: ${formatCurrency(payload.statePensionContrib)}`;
                            const statePensionPercent = (realReturns.realReturnStatePension * 100).toFixed(1);
                            details += `\n+ Avkastning (${statePensionPercent}%): ${formatCurrency(0)}`;
                            return details;
                          }
                          return formattedValue;
                        } else if (name === 'Total') {
                          let details = formattedValue;
                          const savingsTotal = (payload.savingsContrib || 0);
                          const returnsTotal = (payload.availableReturn || 0) + (payload.pensionReturn || 0);
                          if (savingsTotal > 0) details += `\n+ Insättningar: ${formatCurrency(savingsTotal)}`;
                          if (returnsTotal !== 0) {
                            details += `\n+ Avkastning: ${formatCurrency(returnsTotal)}`;
                          }
                          if (payload.netWithdrawal !== undefined && payload.netWithdrawal > 0) {
                            details += `\n- Utbetalningar: ${formatCurrency(payload.netWithdrawal)}/år`;
                          }
                          // Lägg till milstolpe-info
                          if (isTotal4Percent) {
                            details += `\n\n⭐ Totala kapitalet når 4%-kravet vid denna ålder`;
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
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', whiteSpace: 'pre-line' }}
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
                    
                    <Line 
                      type="monotone" 
                      dataKey="Statlig pension" 
                      stroke="#60a5fa" 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Statlig pension (kapital → inkomst)"
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
                      // Bridge-perioden börjar på FIRE-året (inte året efter)
                      return (
                        <ReferenceArea
                          key={`${fireAgeForArea}-${sliderPensionAge[0]}`}
                          x1={fireAgeForArea}
                          x2={sliderPensionAge[0]}
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="#f59e0b"
                          fillOpacity={0.1}
                        />
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
            
            {/* Start Age Slider */}
            {dynamicFireResult.yearsToFire !== null && (
              <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200 order-2 lg:order-none">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <Label className="text-sm font-medium">Startålder för ekonomisk frihet (simulering)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {manualFireYear !== null ? manualFireYear : averageAge + dynamicFireResult.yearsToFire} år
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
                  value={[manualFireYear !== null ? manualFireYear : averageAge + dynamicFireResult.yearsToFire]}
                  onValueChange={(vals) => setManualFireYear(vals[0])}
                  min={averageAge}
                  max={sliderPensionAge[0] - 1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Justera startålder för att se vad som händer om du väntar längre eller startar tidigare på din väg mot ekonomisk frihet
                </div>
              </div>
            )}
            
            {/* Controls - shown in chart column on mobile */}
            <div className="space-y-6 order-3 lg:hidden">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Justera antaganden</h3>
                {/* Same controls as dashboard version - I'll include the key ones */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Övriga tillgångar (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på övriga tillgångar"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på dina tillgängliga tillgångar - allt utom pensionssparande.\n\nJu högre avkastning, desto snabbare växer ditt kapital och desto tidigare kan du nå FIRE. Men högre avkastning innebär också högre risk.\n\nStandardvärdet är 7% nominell avkastning, vilket ger cirka 5% real avkastning efter inflation."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {sliderReturnAvailable[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnAvailable}
                    onValueChange={setSliderReturnAvailable}
                    min={-5}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnAvailable * 100).toFixed(1)}%
                  </div>
                </div>
                
                {/* Quick-läge: visa en slider för alla pensionsavkastningar */}
                {quickMode && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Pensionstillgångar (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på pensionstillgångar"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på alla dina pensionssparanden - tjänstepension, premiepension och IPS.\n\nPensionssparanden har ofta lägre avkastning än övriga tillgångar eftersom de ofta är mer konservativt förvaltade. Standardvärdet är 5% nominell avkastning.\n\nDetta reglage sätter avkastningen för alla pensionssparanden samtidigt."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {sliderReturnPension[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnPension}
                      onValueChange={(vals) => {
                        setSliderReturnPension(vals);
                        // Sätt alla tre pensionsreglagen samtidigt
                        setSliderReturnOccPension(vals);
                        setSliderReturnPremiePension(vals);
                        setSliderReturnIpsPension(vals);
                      }}
                    min={-5}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                      Real: {(realReturns.realReturnPension * 100).toFixed(1)}% (sätter alla pensionsavkastningar)
                  </div>
                </div>
                )}
                
                {/* Avancerat läge: visa tre separata sliders */}
                {!quickMode && (
                <div className="mb-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Tjänstepension (nominell)</Label>
                        <InfoIcon 
                          title="Avkastning på tjänstepension"
                          description="Detta är den förväntade årliga avkastningen (före inflation) på din tjänstepension.\n\nTjänstepension har ofta lägre avkastning än övriga tillgångar eftersom den ofta är mer konservativt förvaltad. Standardvärdet är 7% nominell avkastning."
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {sliderReturnOccPension[0].toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={sliderReturnOccPension}
                      onValueChange={setSliderReturnOccPension}
                      min={-5}
                      max={15}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Real: {(realReturns.realReturnOccPension * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Premiepension (nominell)</Label>
                        <InfoIcon 
                          title="Avkastning på premiepension"
                          description="Detta är den förväntade årliga avkastningen (före inflation) på din premiepension.\n\nPremiepension har ofta lägre avkastning än övriga tillgångar eftersom den ofta är mer konservativt förvaltad. Standardvärdet är 5% nominell avkastning."
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {sliderReturnPremiePension[0].toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={sliderReturnPremiePension}
                      onValueChange={setSliderReturnPremiePension}
                      min={-5}
                      max={15}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Real: {(realReturns.realReturnPremiePension * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">IPS (nominell)</Label>
                        <InfoIcon 
                          title="Avkastning på IPS"
                          description="Detta är den förväntade årliga avkastningen (före inflation) på ditt IPS (Individuellt Pensionssparande).\n\nIPS kan ha samma avkastning som övriga tillgångar eftersom du själv väljer hur det ska investeras. Standardvärdet är 7% nominell avkastning."
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {sliderReturnIpsPension[0].toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={sliderReturnIpsPension}
                      onValueChange={setSliderReturnIpsPension}
                      min={-5}
                      max={15}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Real: {(realReturns.realReturnPrivatePension * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                )}
                
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
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Pensionsstartålder</Label>
                      <InfoIcon 
                        title="Pensionsstartålder"
                        description="Detta är åldern när du planerar att börja ta ut din statliga pension och marknadsbaserade pensioner.\n\nBridge-perioden är tiden mellan när du når ekonomisk frihet (FIRE) och när pensionen börjar. Ju längre bridge-period, desto mer kapital behöver du vid FIRE för att täcka utgifterna.\n\nStandardvärdet är 63 år (om du är under 63) eller 67 år (om du är 63 eller äldre), vilket är den tidigaste åldern du kan ta ut statlig pension i Sverige. Du kan öka detta om du planerar att jobba längre.\n\nTjänstepension och IPS kan tas ut tidigare (från 55 år) via sliders längre ner."
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
                
                {/* Pensionsavsättning/mån */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-gray-700 block mb-1">
                    Pensionsavsättning/mån (från lön)
                  </Label>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(occPensionContribMonthly + premiePensionContribMonthly + privatePensionContribMonthly)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ange värde i "Dina grundvärden" ovan
                  </p>
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
                      <span className="text-sm font-medium">{occPensionEarlyStartAge} år</span>
                    </div>
                    <Slider
                      value={[occPensionEarlyStartAge]}
                      onValueChange={(next) => setOccPensionEarlyStartAge(next[0])}
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
                      <span className="text-sm font-medium">{ipsEarlyStartAge} år</span>
                    </div>
                    <Slider
                      value={[ipsEarlyStartAge]}
                      onValueChange={(next) => setIpsEarlyStartAge(next[0])}
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
              </div>
            </div>
            
            {/* Explanation and other sections */}
            <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3 order-4 lg:order-none">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Insättningar pågår tills du når ekonomisk frihet.</strong> Året du når ekonomisk frihet är sista året med insättningar, uttag startar året efter. 
                Efter brytet slutar pensionsinbetalningar, och endast avkastningen får pensionstillgångarna att växa.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Efter pensionsstart</strong> slås kapitalet ihop. Årliga uttag motsvarar utgifterna och görs från den sammanfogade portföljen.
                Hela poolen använder den avkastning som gäller efter att ekonomisk frihet nås (minst 7% nominell eller din ursprungliga om högre).
                <span className="text-xs text-gray-600 italic block mt-1">Notera: Detta är en förenkling av pensionsdelen för att göra det generellt och lättare att förstå och jobba med i simulatorn.</span>
                <span className="text-xs text-gray-600 italic block mt-1">Tänk på att pensionsdelen efter pension kan ha en lägre avkastning beroende på hur mycket av den som är inkomstpensionen, som då följer balansindex.</span>
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Avkastning efter ekonomisk frihet:</strong> När ekonomisk frihet uppnås höjs avkastningen på tillgängliga tillgångar till minst 7% nominell för att säkerställa 4%-regeln. Om din ursprungliga avkastning redan är högre än 7%, fortsätter du med den höga avkastningen. Om ekonomisk frihet inte är uppnåelig används din ursprungliga avkastning hela vägen till pension.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Viktad avkastning vid sammanslagning:</strong> När kapital slås ihop från flera källor (t.ex. när pensionsdelar blir uttagsbara eller vid pensionsstart) beräknas en gemensam avkastning som ett viktat snitt av delarna. Pensionsdelar som blir uttagsbara justeras först upp till simulatorns lägsta nivå för avkastning efter frihet (7% nominellt) innan viktningen, så att låga pensionsavkastningar inte drar ner hela portföljen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs text-gray-600">
                <div>
                  <div className="w-4 h-1 inline-block mr-2" style={{ backgroundColor: '#C47A2C' }}></div>
                  Tillgängligt = före pension
                </div>
                <div>
                  <div className="w-4 h-1 inline-block mr-2" style={{ backgroundColor: '#4A84C1' }}></div>
                  Låst = används vid pension
                </div>
                <div>
                  <div className="w-4 h-1 inline-block mr-2" style={{ backgroundColor: '#9ca3af' }}></div>
                  Total = summan
                </div>
                <div>
                  <div className="w-4 h-1 border-b-2 border-dashed inline-block mr-2" style={{ borderColor: '#0E5E4B' }}></div>
                  Grönt streck = 4%-krav vid pension
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <div className="w-6 h-4 inline-block mr-2" style={{ backgroundColor: '#f59e0b', opacity: 0.2 }}></div>
                  Orange skugga = Bridge-period (FIRE till pension)
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <div className="w-6 h-4 inline-block mr-2" style={{ backgroundColor: '#3b82f6', opacity: 0.08 }}></div>
                  Blå skugga = Pensionsperiod (från pensionsstart)
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls Sidebar - Desktop */}
          <div className="space-y-6 hidden lg:block">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Justera antaganden</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Övriga tillgångar (nominell)</Label>
                    <InfoIcon 
                      title="Avkastning på övriga tillgångar"
                      description="Detta är den förväntade årliga avkastningen (före inflation) på dina tillgängliga tillgångar - allt utom pensionssparande.\n\nJu högre avkastning, desto snabbare växer ditt kapital och desto tidigare kan du nå FIRE. Men högre avkastning innebär också högre risk.\n\nStandardvärdet är 7% nominell avkastning, vilket ger cirka 5% real avkastning efter inflation."
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {sliderReturnAvailable[0].toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={sliderReturnAvailable}
                  onValueChange={setSliderReturnAvailable}
                  min={-5}
                  max={15}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Real: {(realReturns.realReturnAvailable * 100).toFixed(1)}%
                </div>
              </div>
              
              {/* Quick-läge: visa en slider för alla pensionsavkastningar */}
              {quickMode && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Pensionstillgångar (nominell)</Label>
                    <InfoIcon 
                      title="Avkastning på pensionstillgångar"
                      description="Detta är den förväntade årliga avkastningen (före inflation) på alla dina pensionssparanden - tjänstepension, premiepension och IPS.\n\nPensionssparanden har ofta lägre avkastning än övriga tillgångar eftersom de ofta är mer konservativt förvaltade. Standardvärdet är 5% nominell avkastning.\n\nDetta reglage sätter avkastningen för alla pensionssparanden samtidigt."
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {sliderReturnPension[0].toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={sliderReturnPension}
                    onValueChange={(vals) => {
                      setSliderReturnPension(vals);
                      // Sätt alla tre pensionsreglagen samtidigt
                      setSliderReturnOccPension(vals);
                      setSliderReturnPremiePension(vals);
                      setSliderReturnIpsPension(vals);
                    }}
                  min={-5}
                  max={15}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnPension * 100).toFixed(1)}% (sätter alla pensionsavkastningar)
                </div>
              </div>
              )}
              
              {/* Avancerat läge: visa tre separata sliders */}
              {!quickMode && (
              <div className="mb-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Tjänstepension (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på tjänstepension"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på din tjänstepension.\n\nTjänstepension har ofta lägre avkastning än övriga tillgångar eftersom den ofta är mer konservativt förvaltad. Standardvärdet är 7% nominell avkastning."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {sliderReturnOccPension[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnOccPension}
                    onValueChange={setSliderReturnOccPension}
                    min={-5}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnOccPension * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Premiepension (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på premiepension"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på din premiepension.\n\nPremiepension har ofta lägre avkastning än övriga tillgångar eftersom den ofta är mer konservativt förvaltad. Standardvärdet är 5% nominell avkastning."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {sliderReturnPremiePension[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnPremiePension}
                    onValueChange={setSliderReturnPremiePension}
                    min={-5}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnPremiePension * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">IPS (nominell)</Label>
                      <InfoIcon 
                        title="Avkastning på IPS"
                        description="Detta är den förväntade årliga avkastningen (före inflation) på ditt IPS (Individuellt Pensionssparande).\n\nIPS kan ha samma avkastning som övriga tillgångar eftersom du själv väljer hur det ska investeras. Standardvärdet är 7% nominell avkastning."
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {sliderReturnIpsPension[0].toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={sliderReturnIpsPension}
                    onValueChange={setSliderReturnIpsPension}
                    min={-5}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Real: {(realReturns.realReturnPrivatePension * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              )}
              
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
              
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Pensionsstartålder</Label>
                      <InfoIcon 
                        title="Pensionsstartålder"
                        description="Detta är åldern när du planerar att börja ta ut din statliga pension och marknadsbaserade pensioner.\n\nBridge-perioden är tiden mellan när du når ekonomisk frihet (FIRE) och när pensionen börjar. Ju längre bridge-period, desto mer kapital behöver du vid FIRE för att täcka utgifterna.\n\nStandardvärdet är 63 år (om du är under 63) eller 67 år (om du är 63 eller äldre), vilket är den tidigaste åldern du kan ta ut statlig pension i Sverige. Du kan öka detta om du planerar att jobba längre.\n\nTjänstepension och IPS kan tas ut tidigare (från 55 år) via sliders längre ner."
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
              
              {/* Pensionsavsättning/mån */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-gray-700 block mb-1">
                  Pensionsavsättning/mån (från lön)
                </Label>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(occPensionContribMonthly + premiePensionContribMonthly + privatePensionContribMonthly)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ange värde i "Dina grundvärden" ovan
                </p>
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
                    <span className="text-sm font-medium">{occPensionEarlyStartAge} år</span>
                  </div>
                  <Slider
                    value={[occPensionEarlyStartAge]}
                    onValueChange={(next) => setOccPensionEarlyStartAge(next[0])}
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
                    <span className="text-sm font-medium">{ipsEarlyStartAge} år</span>
                  </div>
                  <Slider
                    value={[ipsEarlyStartAge]}
                    onValueChange={(next) => setIpsEarlyStartAge(next[0])}
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
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Real avkastning:</span>
                  <span className="text-lg font-bold text-blue-600">{(realReturns.realReturnAvailable * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Varningsbox - viktigt - ovanför reklam */}
          <div className="lg:col-span-2 mt-6 mb-6 p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
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

        {/* Promotion Banner - Flyttad till botten */}
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                  Vill du få en fullständig översikt över din ekonomi?
                </h3>
                <p className="text-sm text-primary/80 mb-4">
                  Med <strong>Förmögenhetskollen</strong> får du en komplett bild av din ekonomi: få en bättre uppfattning om din nettoförmögenhet, följ upp din väg mot ekonomisk frihet genom olika nivåer, analysera ditt sparande och mycket mer. Allt sparas lokalt i din webbläsare – ingen registrering krävs.
                </p>
                <ul className="text-sm text-primary/80 space-y-1 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Få en bättre uppfattning om alla dina tillgångar och skulder på ett ställe</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Följ upp din progress mot ekonomisk frihet genom 6 nivåer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Få insikter om ditt månatliga sparande och utveckling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Helt gratis och sparas lokalt – ingen registrering</span>
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
      </div>
    </div>
  );
}



