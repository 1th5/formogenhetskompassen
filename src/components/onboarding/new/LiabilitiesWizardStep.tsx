/**
 * Lån och skulder wizard-steg
 * Loopar tills man är klar
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Liability, LiabilityType } from '@/lib/types';
import { DEFAULT_AMORTIZATION_RATE } from '@/lib/wealth/config';
import { formatCurrency } from '@/lib/utils/format';
import { CheckCircle, CreditCard } from 'lucide-react';

interface LiabilitiesWizardStepProps {
  onComplete: (liabilities: Liability[]) => void;
  onSkip: () => void;
}

export default function LiabilitiesWizardStep({ onComplete, onSkip }: LiabilitiesWizardStepProps) {
  const [step, setStep] = useState<'intro' | 'input'>('intro');
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [label, setLabel] = useState('');
  const [principal, setPrincipal] = useState<number | ''>('');
  const [amortizationRate, setAmortizationRate] = useState<number>(DEFAULT_AMORTIZATION_RATE);
  const [liabilityType, setLiabilityType] = useState<LiabilityType>('Annat');
  
  const handleAddLiability = () => {
    if (principal !== '' && principal > 0) {
      // Använd generiskt namn baserat på typ om inget anges
      const liabilityNumber = liabilities.filter(l => l.liability_type === liabilityType).length + 1;
      const defaultLabel = liabilityType === 'Bostadslån' ? `Bostadslån ${liabilityNumber}` :
                          liabilityType === 'Billån' ? `Billån ${liabilityNumber}` :
                          `Skuld ${liabilityNumber}`;
      const finalLabel = label.trim() || defaultLabel;
      
      const newLiability: Liability = {
        id: Date.now().toString(),
        label: finalLabel,
        principal: principal as number,
        amortization_rate_apy: amortizationRate,
        liability_type: liabilityType
      };
      
      setLiabilities(prev => [...prev, newLiability]);
      setLabel('');
      setPrincipal('');
      setAmortizationRate(DEFAULT_AMORTIZATION_RATE);
      setLiabilityType('Annat');
      setStep('intro');
    }
  };
  
  const handleMoreLiabilities = () => {
    setStep('intro');
    setLabel('');
    setPrincipal('');
    setAmortizationRate(DEFAULT_AMORTIZATION_RATE);
    setLiabilityType('Annat');
  };
  
  const handleFinish = () => {
    onComplete(liabilities);
  };
  
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-red-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Övriga lån och skulder
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Lägg till övriga lån och skulder - krediter, privatlån, studielån m.m.
          </p>
        </div>
        
        {liabilities.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setStep('input')} className="flex-1">
              Lägg till lån
            </Button>
            <Button variant="secondary" onClick={onSkip} className="flex-1">
              Hoppa över
            </Button>
          </div>
        )}
        
        {liabilities.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {liabilities.length} lån/skuld{liabilities.length > 1 ? 'er' : ''}:
            </p>
            <div className="space-y-2">
              {liabilities.map((liability, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <span className="font-medium text-red-900 block">{liability.label}</span>
                    <span className="text-sm text-red-700">
                      Amortering: {(liability.amortization_rate_apy * 100).toFixed(1)}% per år
                    </span>
                  </div>
                  <span className="text-red-700 font-medium">{formatCurrency(liability.principal)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button onClick={() => setStep('input')} variant="secondary" className="flex-1">
                Lägg till fler lån
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Fortsätt till sammanfattning →
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
          Lägg till lån eller skuld
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="liability-type" className="text-base">Typ av lån</Label>
          <select
            id="liability-type"
            value={liabilityType}
            onChange={(e) => setLiabilityType(e.target.value as LiabilityType)}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Bostadslån">Bostadslån</option>
            <option value="Billån">Billån</option>
            <option value="Annat">Annat</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="liability-label" className="text-base">
            Beskrivning (valfritt, t.ex. "Bostadslån", "Billån", "Kreditkort")
          </Label>
          <Input
            id="liability-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Bostadslån"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="liability-principal" className="text-base">Kvarvarande belopp (kr)</Label>
          <Input
            id="liability-principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="2000000"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="liability-rate" className="text-base">
            Amorteringstakt (% per år)
          </Label>
          <Input
            id="liability-rate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            inputMode="decimal"
            value={amortizationRate * 100}
            onChange={(e) => {
              const value = e.target.value;
              // Begränsa till max 1 decimal
              let processedValue = value;
              if (value.includes('.')) {
                const parts = value.split('.');
                if (parts[1] && parts[1].length > 1) {
                  processedValue = `${parts[0]}.${parts[1].slice(0, 1)}`;
                }
              }
              setAmortizationRate(processedValue === '' ? 0 : Number(processedValue) / 100);
            }}
            className="mt-2"
          />
          <p className="text-sm text-primary/60 mt-1">
            Standard är {DEFAULT_AMORTIZATION_RATE * 100}% per år
          </p>
        </div>
        
        {principal !== '' && principal > 0 && (() => {
          const liabilityNumber = liabilities.filter(l => l.liability_type === liabilityType).length + 1;
          const defaultLabel = liabilityType === 'Bostadslån' ? `Bostadslån ${liabilityNumber}` :
                              liabilityType === 'Billån' ? `Billån ${liabilityNumber}` :
                              `Skuld ${liabilityNumber}`;
          const displayLabel = label.trim() || defaultLabel;
          return (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">
                    {displayLabel}: {formatCurrency(principal as number)} ({(amortizationRate * 100).toFixed(1)}%/år)
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => setStep('intro')} className="flex-1">
          ← Tillbaka
        </Button>
        <Button 
          onClick={handleAddLiability}
          disabled={principal === '' || principal <= 0}
          className="flex-1"
        >
          Lägg till lån
        </Button>
      </div>
    </div>
  );
}

