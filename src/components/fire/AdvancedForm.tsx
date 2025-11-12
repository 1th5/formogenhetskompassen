'use client';

import { useMemo } from 'react';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import { InfoIcon } from './InfoIcon';
import { MIN_AGE, MAX_AGE, MIN_PENSION_AGE, MAX_PENSION_AGE } from '@/lib/fire/consts';
import { formatCurrency } from '@/lib/utils/format';

export interface AdvancedFormData {
  age: number | '';
  pensionAge: number | '';
  monthlyExpenses: number | '';
  monthlySavings: number | '';
  // Pensionskapital per hink
  occPensionCapital: number | '';
  premiePensionCapital: number | '';
  ipsPensionCapital: number | '';
  // Pensionsavsättningar per månad per hink
  occPensionContrib: number | '';
  premiePensionContrib: number | '';
  ipsPensionContrib: number | '';
  // Statlig pension
  statePensionCapital: number | '';
  statePensionContrib: number | '';
  // Tillgängligt kapital
  availableCapital: number | '';
}

export interface AdvancedFormProps {
  data: AdvancedFormData;
  onChange: (data: AdvancedFormData) => void;
}

export function AdvancedForm({ data, onChange }: AdvancedFormProps) {
  const handleChange = (field: keyof AdvancedFormData, value: number | '') => {
    onChange({ ...data, [field]: value });
  };

  // Validering (pensionsålder valideras via slider längre ner)
  const isValid = useMemo(() => {
    const age = typeof data.age === 'number' ? data.age : 0;
    
    return age >= MIN_AGE && age < MAX_AGE;
  }, [data.age]);

  return (
    <div className="space-y-6">
      {/* Ålder */}
      <div>
        <NumberInput
          id="advanced-age"
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

      {/* Kassaflöde */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Kassaflöde</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-expenses" className="text-sm">Utgifter/mån</Label>
              <InfoIcon
                title="Månadsutgifter"
                description="Dina totala månadsutgifter som du behöver täcka efter ekonomisk frihet.\n\nJu lägre dina utgifter, desto mindre kapital behöver du för att nå FIRE."
              />
            </div>
            <NumberInput
              id="advanced-expenses"
              label=""
              value={data.monthlyExpenses}
              onChange={(v) => handleChange('monthlyExpenses', v)}
              min={0}
              suffix="kr"
              placeholder="30000"
              aria-label="Utgifter per månad"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-savings" className="text-sm">Sparande/mån (total, inkl. amorteringar)</Label>
              <InfoIcon
                title="Sparande per månad"
                description="Totalt sparande per månad, inklusive amorteringar på lån."
              />
            </div>
            <NumberInput
              id="advanced-savings"
              label=""
              value={data.monthlySavings}
              onChange={(v) => handleChange('monthlySavings', v)}
              min={0}
              suffix="kr"
              placeholder="10000"
              aria-label="Sparande per månad"
            />
          </div>
        </div>
      </div>

      {/* Tillgängligt kapital */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Tillgängligt kapital idag</h4>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="advanced-available" className="text-sm">Tillgängligt kapital (kr)</Label>
          <InfoIcon
            title="Tillgängligt kapital"
            description="Fonder, aktier, sparkonton, etc. som du kan använda för FIRE."
          />
        </div>
        <NumberInput
          id="advanced-available"
          label=""
          value={data.availableCapital}
          onChange={(v) => handleChange('availableCapital', v)}
          min={0}
          suffix="kr"
          placeholder="500000"
          aria-label="Tillgängligt kapital idag"
        />
      </div>

      {/* Marknadsbaserad pension - Kapital */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Marknadsbaserad pension - Kapital idag</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-occ-capital" className="text-sm">Tjänstepension (kr)</Label>
              <InfoIcon
                title="Tjänstepension kapital"
                description="Ditt nuvarande kapital i tjänstepension."
              />
            </div>
            <NumberInput
              id="advanced-occ-capital"
              label=""
              value={data.occPensionCapital}
              onChange={(v) => handleChange('occPensionCapital', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Tjänstepension kapital"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-premie-capital" className="text-sm">Premiepension (kr)</Label>
              <InfoIcon
                title="Premiepension kapital"
                description="Ditt nuvarande kapital i premiepension."
              />
            </div>
            <NumberInput
              id="advanced-premie-capital"
              label=""
              value={data.premiePensionCapital}
              onChange={(v) => handleChange('premiePensionCapital', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Premiepension kapital"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-ips-capital" className="text-sm">IPS (kr)</Label>
              <InfoIcon
                title="IPS kapital"
                description="Ditt nuvarande kapital i IPS (Individuellt Pensionssparande)."
              />
            </div>
            <NumberInput
              id="advanced-ips-capital"
              label=""
              value={data.ipsPensionCapital}
              onChange={(v) => handleChange('ipsPensionCapital', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="IPS kapital"
            />
          </div>
        </div>
        {/* Totalsumma för marknadsbaserat kapital */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Totalt marknadsbaserat kapital:</span>
            <span className="font-semibold">
              {formatCurrency(
                (typeof data.occPensionCapital === 'number' ? data.occPensionCapital : 0) +
                (typeof data.premiePensionCapital === 'number' ? data.premiePensionCapital : 0) +
                (typeof data.ipsPensionCapital === 'number' ? data.ipsPensionCapital : 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Marknadsbaserad pension - Avsättningar */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Marknadsbaserad pension - Avsättning per månad</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-occ-contrib" className="text-sm">Tjänstepension/mån (kr)</Label>
              <InfoIcon
                title="Tjänstepension avsättning"
                description="Belopp per månad som arbetsgivare/allmän pension sätter av. Kan anges manuellt om du vet exakt."
              />
            </div>
            <NumberInput
              id="advanced-occ-contrib"
              label=""
              value={data.occPensionContrib}
              onChange={(v) => handleChange('occPensionContrib', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Tjänstepension avsättning per månad"
              aria-describedby="advanced-occ-contrib-help"
            />
            <p id="advanced-occ-contrib-help" className="sr-only">
              Belopp per månad som arbetsgivare/allmän pension sätter av. Kan anges manuellt om du vet exakt.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-premie-contrib" className="text-sm">Premiepension/mån (kr)</Label>
              <InfoIcon
                title="Premiepension avsättning"
                description="Belopp per månad som allmän pension sätter av. Kan anges manuellt om du vet exakt."
              />
            </div>
            <NumberInput
              id="advanced-premie-contrib"
              label=""
              value={data.premiePensionContrib}
              onChange={(v) => handleChange('premiePensionContrib', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Premiepension avsättning per månad"
              aria-describedby="advanced-premie-contrib-help"
            />
            <p id="advanced-premie-contrib-help" className="sr-only">
              Belopp per månad som allmän pension sätter av. Kan anges manuellt om du vet exakt.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-ips-contrib" className="text-sm">IPS/mån (kr)</Label>
              <InfoIcon
                title="IPS avsättning"
                description="Belopp per månad som du sparar i IPS. Kan anges manuellt om du vet exakt."
              />
            </div>
            <NumberInput
              id="advanced-ips-contrib"
              label=""
              value={data.ipsPensionContrib}
              onChange={(v) => handleChange('ipsPensionContrib', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="IPS avsättning per månad"
              aria-describedby="advanced-ips-contrib-help"
            />
            <p id="advanced-ips-contrib-help" className="sr-only">
              Belopp per månad som du sparar i IPS. Kan anges manuellt om du vet exakt.
            </p>
          </div>
        </div>
        {/* Totalsumma för marknadsbaserade avsättningar */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Totalt marknadsbaserade avsättningar:</span>
            <span className="font-semibold">
              {formatCurrency(
                (typeof data.occPensionContrib === 'number' ? data.occPensionContrib : 0) +
                (typeof data.premiePensionContrib === 'number' ? data.premiePensionContrib : 0) +
                (typeof data.ipsPensionContrib === 'number' ? data.ipsPensionContrib : 0)
              )}
              <span className="text-gray-500 font-normal">/mån</span>
            </span>
          </div>
        </div>
      </div>

      {/* Statlig pension */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3">Statlig pension</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-state-capital" className="text-sm">Statlig pension kapital (kr)</Label>
              <InfoIcon
                title="Statlig pension kapital"
                description="Ditt nuvarande kapital i statlig pension (inkomstpension)."
              />
            </div>
            <NumberInput
              id="advanced-state-capital"
              label=""
              value={data.statePensionCapital}
              onChange={(v) => handleChange('statePensionCapital', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Statlig pension kapital"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="advanced-state-contrib" className="text-sm">Statlig pension/mån (kr)</Label>
              <InfoIcon
                title="Statlig pension avsättning"
                description="Belopp per månad som allmän pension sätter av. Kan anges manuellt om du vet exakt."
              />
            </div>
            <NumberInput
              id="advanced-state-contrib"
              label=""
              value={data.statePensionContrib}
              onChange={(v) => handleChange('statePensionContrib', v)}
              min={0}
              suffix="kr"
              placeholder="0"
              aria-label="Statlig pension avsättning per månad"
              aria-describedby="advanced-state-contrib-help"
            />
            <p id="advanced-state-contrib-help" className="sr-only">
              Belopp per månad som allmän pension sätter av. Kan anges manuellt om du vet exakt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

