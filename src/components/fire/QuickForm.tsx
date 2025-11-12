'use client';

import { useState, useMemo, useEffect } from 'react';
import { NumberInput } from '@/components/ui/NumberInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';
import { calculateJobNetIncome } from '@/lib/wealth/tax-calc';
import { calculateOccupationalPension, calculatePremiePension, calculateIncomePension } from '@/lib/wealth/calc';
import { DEFAULT_PENSION_DISTRIBUTION, QUICK_DEFAULT_LOCKED_PENSION, MIN_AGE, MAX_AGE, MIN_PENSION_AGE, MAX_PENSION_AGE } from '@/lib/fire/consts';
import { InfoIcon } from './InfoIcon';
import { ChevronDown } from 'lucide-react';

export interface QuickFormData {
  age: number | '';
  pensionAge: number | '';
  grossSalary: number | '';
  monthlySavings: number | '';
  totalPensionCapital: number | '';
  availableCapital: number | '';
}

export interface QuickFormProps {
  data: QuickFormData;
  onChange: (data: QuickFormData) => void;
  onOpenAdvanced: () => void;
}

export function QuickForm({ data, onChange, onOpenAdvanced }: QuickFormProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Beräkna nettolön från bruttolön
  const netSalary = useMemo(() => {
    if (data.grossSalary === '' || data.grossSalary === 0) return 0;
    return calculateJobNetIncome(data.grossSalary);
  }, [data.grossSalary]);

  // Beräkna utgifter automatiskt: nettolön - sparande
  const calculatedExpenses = useMemo(() => {
    if (netSalary === 0 || data.monthlySavings === '') return 0;
    const savings = typeof data.monthlySavings === 'number' ? data.monthlySavings : 0;
    return Math.max(0, netSalary - savings);
  }, [netSalary, data.monthlySavings]);

  // Beräkna pensionsavsättningar från lön (om lön finns)
  const pensionContributions = useMemo(() => {
    if (data.grossSalary === '' || data.grossSalary === 0) {
      return {
        occPension: 0,
        premiePension: 0,
        ipsPension: 0,
        statePension: 0,
      };
    }

    const mockPerson = {
      name: 'Person',
      birth_year: new Date().getFullYear() - (typeof data.age === 'number' ? data.age : 40),
      incomes: [{
        id: '1',
        label: 'Lön',
        monthly_income: data.grossSalary,
        income_type: 'job' as const,
        pension_type: 'ITP1' as const
      }],
      other_savings_monthly: 0
    };

    const occPension = calculateOccupationalPension(mockPerson);
    const premiePension = calculatePremiePension(mockPerson);
    const statePension = calculateIncomePension(mockPerson);
    
    // IPS är default 0 i Quick
    return {
      occPension,
      premiePension,
      ipsPension: 0,
      statePension,
    };
  }, [data.grossSalary, data.age]);

  // Fördela pensionskapital enligt default-fördelning
  const pensionDistribution = useMemo(() => {
    const total = typeof data.totalPensionCapital === 'number' && data.totalPensionCapital > 0
      ? data.totalPensionCapital
      : QUICK_DEFAULT_LOCKED_PENSION;
    
    return {
      occPension: total * DEFAULT_PENSION_DISTRIBUTION.TP,
      premiePension: total * DEFAULT_PENSION_DISTRIBUTION.PP,
      ipsPension: total * DEFAULT_PENSION_DISTRIBUTION.IPS,
      statePension: total * DEFAULT_PENSION_DISTRIBUTION.STATE, // Fördela del till statlig pension (grundbelopp)
    };
  }, [data.totalPensionCapital]);

  // Validering (pensionsålder valideras via slider längre ner)
  const isValid = useMemo(() => {
    const age = typeof data.age === 'number' ? data.age : 0;
    
    return age >= MIN_AGE && age < MAX_AGE;
  }, [data.age]);

  const handleChange = (field: keyof QuickFormData, value: number | '') => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Ålder */}
      <div>
        <NumberInput
          id="quick-age"
          label="Ålder"
          value={data.age}
          onChange={(v) => handleChange('age', v)}
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          forceNumberType={false}
          aria-label="Din nuvarande ålder"
        />
        <p className="text-xs text-gray-500 mt-1">
          Önskad pensionsålder justeras automatiskt baserat på din ålder och kan ändras med slidern längre ner på sidan.
        </p>
      </div>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          ⚠️ Ålder måste vara mellan {MIN_AGE} och {MAX_AGE} år.
        </div>
      )}

      {/* Bruttolön */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="quick-gross-salary" className="text-sm">Bruttolön/mån</Label>
          <InfoIcon
            title="Bruttolön"
            description="Din månadslön före skatt. Används för att beräkna nettolön och pensionsavsättningar automatiskt."
          />
        </div>
        <NumberInput
          id="quick-gross-salary"
          label=""
          value={data.grossSalary}
          onChange={(v) => handleChange('grossSalary', v)}
          min={0}
          suffix="kr"
          placeholder="45000"
          aria-label="Bruttolön per månad"
        />
        {netSalary > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            Beräknad nettolön: {formatCurrency(netSalary)}/mån
          </p>
        )}
      </div>

      {/* Sparande/mån */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="quick-savings" className="text-sm">Sparande/mån (total, inkl. amorteringar)</Label>
          <InfoIcon
            title="Sparande per månad"
            description="Totalt sparande per månad, inklusive amorteringar på lån. Detta är beloppet som går till investeringar och skuldbetalningar."
          />
        </div>
        <NumberInput
          id="quick-savings"
          label=""
          value={data.monthlySavings}
          onChange={(v) => handleChange('monthlySavings', v)}
          min={0}
          suffix="kr"
          placeholder="5000"
          aria-label="Sparande per månad"
        />
      </div>

      {/* Utgifter (beräknade, readonly) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm">Utgifter/mån (beräknat)</Label>
          <InfoIcon
            title="Utgifter per månad"
            description="Beräknas automatiskt som: Nettolön - Sparande. Detta är beloppet du behöver täcka efter ekonomisk frihet. I avancerat läge kan du redigera detta värde manuellt."
          />
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-sm font-medium text-gray-900">
            {calculatedExpenses > 0 ? formatCurrency(calculatedExpenses) : '–'} <span className="text-gray-500 font-normal">/ mån</span>
          </div>
          {calculatedExpenses > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              = Nettolön ({formatCurrency(netSalary)}) - Sparande ({formatCurrency(typeof data.monthlySavings === 'number' ? data.monthlySavings : 0)})
            </p>
          )}
          {calculatedExpenses === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Fyll i bruttolön och sparande för att få en automatisk uppskattning av utgifter.
            </p>
          )}
        </div>
      </div>

      {/* Tillgängligt kapital */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="quick-available-capital" className="text-sm">Tillgängligt kapital idag</Label>
          <InfoIcon
            title="Tillgängligt kapital"
            description="Fonder, aktier, sparkonton, etc. som du kan använda för FIRE."
          />
        </div>
        <NumberInput
          id="quick-available-capital"
          label=""
          value={data.availableCapital}
          onChange={(v) => handleChange('availableCapital', v)}
          min={0}
          suffix="kr"
          placeholder="300000"
          aria-label="Tillgängligt kapital idag"
        />
      </div>

      {/* Pensionskapital totalt */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="quick-pension-capital" className="text-sm">Pensionskapital (låst) totalt</Label>
          <InfoIcon
            title="Pensionskapital"
            description="Totalt pensionskapital som är låst tills pensionsstart. Fördelas automatiskt enligt 65% Tjänstepension, 20% Premiepension, 10% IPS, 5% Statlig pension (grundbelopp). Statlig pensionsavsättning beräknas även från lön."
          />
        </div>
        <NumberInput
          id="quick-pension-capital"
          label=""
          value={data.totalPensionCapital}
          onChange={(v) => handleChange('totalPensionCapital', v)}
          min={0}
          suffix="kr"
          placeholder={QUICK_DEFAULT_LOCKED_PENSION.toString()}
          aria-label="Totalt pensionskapital"
        />
      </div>

      {/* Visa detaljer - Enkel expanderbar sektion */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-gray-50"
        >
          <span className="text-sm">Visa detaljer</span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 transition-transform duration-200', showDetails && 'rotate-180')}
          />
        </button>
        {showDetails && (
          <div className="p-4 border-t">
            <Card className="bg-gray-50">
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Pensionskapital (fördelning)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tjänstepension:</span>
                      <span className="font-medium">{formatCurrency(pensionDistribution.occPension)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premiepension:</span>
                      <span className="font-medium">{formatCurrency(pensionDistribution.premiePension)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IPS:</span>
                      <span className="font-medium">{formatCurrency(pensionDistribution.ipsPension)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Statlig pension (inkomstpension):</span>
                      <span className="font-medium">{formatCurrency(pensionDistribution.statePension)}</span>
                    </div>
                  </div>
                </div>

                {data.grossSalary !== '' && data.grossSalary > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Pensionsavsättningar/mån (beräknat)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tjänstepension:</span>
                        <span className="font-medium">{formatCurrency(pensionContributions.occPension)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Premiepension:</span>
                        <span className="font-medium">{formatCurrency(pensionContributions.premiePension)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IPS:</span>
                        <span className="font-medium">{formatCurrency(pensionContributions.ipsPension)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span>Statlig pension (inkomstpension):</span>
                        <span className="font-medium">{formatCurrency(pensionContributions.statePension)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Öppna avancerat */}
      <Button
        onClick={onOpenAdvanced}
        variant="secondary"
        className="w-full"
      >
        Öppna avancerat för att redigera detaljer
      </Button>
    </div>
  );
}

