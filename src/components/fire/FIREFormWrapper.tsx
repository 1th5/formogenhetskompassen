'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickForm, QuickFormData } from './QuickForm';
import { AdvancedForm, AdvancedFormData } from './AdvancedForm';
import { DEFAULT_PENSION_DISTRIBUTION, QUICK_DEFAULT_LOCKED_PENSION } from '@/lib/fire/consts';
import { calculateJobNetIncome } from '@/lib/wealth/tax-calc';
import { calculateOccupationalPension, calculatePremiePension, calculateIncomePension } from '@/lib/wealth/calc';

export interface FIREFormValues {
  // Gemensamma
  age: number;
  pensionAge: number;
  monthlyExpenses: number;
  monthlySavings: number;
  availableCapital: number;
  // Pensionskapital
  occPensionCapital: number;
  premiePensionCapital: number;
  ipsPensionCapital: number;
  // Pensionsavsättningar
  occPensionContrib: number;
  premiePensionContrib: number;
  ipsPensionContrib: number;
  // Statlig pension
  statePensionCapital: number;
  statePensionContrib: number;
}

interface FIREFormWrapperProps {
  quickMode: boolean;
  onModeChange: (quick: boolean) => void;
  onValuesChange: (values: FIREFormValues) => void;
}

export function FIREFormWrapper({ quickMode, onModeChange, onValuesChange }: FIREFormWrapperProps) {
  // Quick form state
  const [quickData, setQuickData] = useState<QuickFormData>({
    age: 40,
    pensionAge: 63,
    grossSalary: '',
    monthlySavings: '',
    totalPensionCapital: QUICK_DEFAULT_LOCKED_PENSION,
    availableCapital: 300000,
  });

  // Advanced form state
  const [advancedData, setAdvancedData] = useState<AdvancedFormData>({
    age: 40,
    pensionAge: 63,
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

  // Synka från Quick till Advanced när man byter läge (endast vid lägesbyte)
  const prevQuickModeRef = useRef(quickMode);
  useEffect(() => {
    // Kör bara när man byter från Quick till Advanced
    const wasQuickMode = prevQuickModeRef.current;
    const isNowAdvanced = !quickMode;
    
    // Uppdatera ref först
    prevQuickModeRef.current = quickMode;
    
    if (wasQuickMode && isNowAdvanced) {
      // Beräkna utgifter från Quick (nettolön - sparande)
      const netSalary = quickData.grossSalary !== '' && quickData.grossSalary > 0
        ? calculateJobNetIncome(quickData.grossSalary)
        : 0;
      const calculatedExpenses = netSalary > 0 && typeof quickData.monthlySavings === 'number'
        ? Math.max(0, netSalary - quickData.monthlySavings)
        : (typeof advancedData.monthlyExpenses === 'number' && advancedData.monthlyExpenses > 0)
          ? advancedData.monthlyExpenses
          : 30000;

      // Fördela pensionskapital enligt default-fördelning (endast marknadsbaserad pension)
      const totalPension = typeof quickData.totalPensionCapital === 'number' && quickData.totalPensionCapital > 0
        ? quickData.totalPensionCapital
        : QUICK_DEFAULT_LOCKED_PENSION;

      // Beräkna pensionsavsättningar från lön om lön finns
      let occContrib = 0;
      let premieContrib = 0;
      let stateContrib = 0;

      if (quickData.grossSalary !== '' && quickData.grossSalary > 0) {
        const mockPerson = {
          name: 'Person',
          birth_year: new Date().getFullYear() - (typeof quickData.age === 'number' ? quickData.age : 40),
          incomes: [{
            id: '1',
            label: 'Lön',
            monthly_income: quickData.grossSalary,
            income_type: 'job' as const,
            pension_type: 'ITP1' as const
          }],
          other_savings_monthly: 0
        };

        occContrib = calculateOccupationalPension(mockPerson);
        premieContrib = calculatePremiePension(mockPerson);
        stateContrib = calculateIncomePension(mockPerson);
      }

      // Beräkna nya värden
      const newAdvancedData = {
        age: typeof quickData.age === 'number' ? quickData.age : 40,
        pensionAge: typeof quickData.pensionAge === 'number' ? quickData.pensionAge : 63,
        monthlyExpenses: calculatedExpenses,
        monthlySavings: typeof quickData.monthlySavings === 'number' ? quickData.monthlySavings : 10000,
        availableCapital: typeof quickData.availableCapital === 'number' && quickData.availableCapital > 0 ? quickData.availableCapital : 300000,
        occPensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.TP,
        premiePensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.PP,
        ipsPensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.IPS,
        occPensionContrib: occContrib,
        premiePensionContrib: premieContrib,
        ipsPensionContrib: 0, // Default 0 i Quick
        statePensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.STATE, // Fördela del till statlig pension (grundbelopp)
        statePensionContrib: stateContrib,
      };

      // Shallow-compare för att undvika onödiga uppdateringar
      const hasChanged = Object.keys(newAdvancedData).some(key => {
        const typedKey = key as keyof typeof newAdvancedData;
        return advancedData[typedKey] !== newAdvancedData[typedKey];
      });

      if (hasChanged) {
        setAdvancedData(newAdvancedData);
      }
    }
  }, [quickMode, quickData.age, quickData.pensionAge, quickData.grossSalary, quickData.monthlySavings, quickData.totalPensionCapital, quickData.availableCapital]);

  // Konvertera form data till FIREFormValues och skicka till parent
  const fireValues = useMemo((): FIREFormValues => {
    if (quickMode) {
      // Från Quick: beräkna utgifter och fördela pensionskapital
      const netSalary = quickData.grossSalary !== '' && quickData.grossSalary > 0
        ? calculateJobNetIncome(quickData.grossSalary)
        : 0;
      const calculatedExpenses = netSalary > 0 && typeof quickData.monthlySavings === 'number'
        ? Math.max(0, netSalary - quickData.monthlySavings)
        : 30000;

      const totalPension = typeof quickData.totalPensionCapital === 'number' && quickData.totalPensionCapital > 0
        ? quickData.totalPensionCapital
        : QUICK_DEFAULT_LOCKED_PENSION;

      // Beräkna pensionsavsättningar
      let occContrib = 0;
      let premieContrib = 0;
      let stateContrib = 0;

      if (quickData.grossSalary !== '' && quickData.grossSalary > 0) {
        const mockPerson = {
          name: 'Person',
          birth_year: new Date().getFullYear() - (typeof quickData.age === 'number' ? quickData.age : 40),
          incomes: [{
            id: '1',
            label: 'Lön',
            monthly_income: quickData.grossSalary,
            income_type: 'job' as const,
            pension_type: 'ITP1' as const
          }],
          other_savings_monthly: 0
        };

        occContrib = calculateOccupationalPension(mockPerson);
        premieContrib = calculatePremiePension(mockPerson);
        stateContrib = calculateIncomePension(mockPerson);
      }

      return {
        age: typeof quickData.age === 'number' ? quickData.age : 40,
        pensionAge: typeof quickData.pensionAge === 'number' ? quickData.pensionAge : 63,
        monthlyExpenses: calculatedExpenses,
        monthlySavings: typeof quickData.monthlySavings === 'number' ? quickData.monthlySavings : 10000,
        availableCapital: typeof quickData.availableCapital === 'number' && quickData.availableCapital > 0 ? quickData.availableCapital : 300000,
        occPensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.TP,
        premiePensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.PP,
        ipsPensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.IPS,
        occPensionContrib: occContrib,
        premiePensionContrib: premieContrib,
        ipsPensionContrib: 0,
        statePensionCapital: totalPension * DEFAULT_PENSION_DISTRIBUTION.STATE, // Fördela del till statlig pension (grundbelopp)
        statePensionContrib: stateContrib,
      };
    } else {
      // Från Advanced: använd direkt
      return {
        age: typeof advancedData.age === 'number' ? advancedData.age : 40,
        pensionAge: typeof advancedData.pensionAge === 'number' ? advancedData.pensionAge : 63,
        monthlyExpenses: typeof advancedData.monthlyExpenses === 'number' ? advancedData.monthlyExpenses : 30000,
        monthlySavings: typeof advancedData.monthlySavings === 'number' ? advancedData.monthlySavings : 10000,
        availableCapital: typeof advancedData.availableCapital === 'number' ? advancedData.availableCapital : 0,
        occPensionCapital: typeof advancedData.occPensionCapital === 'number' ? advancedData.occPensionCapital : 0,
        premiePensionCapital: typeof advancedData.premiePensionCapital === 'number' ? advancedData.premiePensionCapital : 0,
        ipsPensionCapital: typeof advancedData.ipsPensionCapital === 'number' ? advancedData.ipsPensionCapital : 0,
        occPensionContrib: typeof advancedData.occPensionContrib === 'number' ? advancedData.occPensionContrib : 0,
        premiePensionContrib: typeof advancedData.premiePensionContrib === 'number' ? advancedData.premiePensionContrib : 0,
        ipsPensionContrib: typeof advancedData.ipsPensionContrib === 'number' ? advancedData.ipsPensionContrib : 0,
        statePensionCapital: typeof advancedData.statePensionCapital === 'number' ? advancedData.statePensionCapital : 0,
        statePensionContrib: typeof advancedData.statePensionContrib === 'number' ? advancedData.statePensionContrib : 0,
      };
    }
  }, [quickMode, quickData, advancedData]);

  // Skicka värden till parent när de ändras
  useEffect(() => {
    onValuesChange(fireValues);
  }, [fireValues, onValuesChange]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Dina grundvärden</CardTitle>
        {quickMode && (
          <p className="text-xs text-primary/70 mt-2 mb-3">
            Fyll i det du vet så fyller vi i rimliga standardvärden åt dig. Du kan alltid öppna avancerat läge senare.
          </p>
        )}
        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={quickMode}
              onChange={() => onModeChange(true)}
              className="w-4 h-4"
            />
            <span className="text-sm">Snabb uppskattning</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={!quickMode}
              onChange={() => onModeChange(false)}
              className="w-4 h-4"
            />
            <span className="text-sm">Jag vill fylla i allt själv</span>
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {quickMode ? (
          <QuickForm
            data={quickData}
            onChange={setQuickData}
            onOpenAdvanced={() => onModeChange(false)}
          />
        ) : (
          <AdvancedForm
            data={advancedData}
            onChange={setAdvancedData}
          />
        )}
      </CardContent>
    </Card>
  );
}

