/**
 * Specifik skuld-wizard-steg
 * Används för att fråga om lån kopplade till specifika tillgångar (bostad, bil)
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

interface SpecificLiabilityWizardStepProps {
  assetLabel: string;
  assetValue: number;
  liabilityType: LiabilityType;
  onComplete: (liability: Liability | null) => void;
  onSkip: () => void;
}

export default function SpecificLiabilityWizardStep({ 
  assetLabel, 
  assetValue, 
  liabilityType,
  onComplete, 
  onSkip 
}: SpecificLiabilityWizardStepProps) {
  const [hasLoan, setHasLoan] = useState<boolean | null>(null);
  const [label, setLabel] = useState('');
  const [principal, setPrincipal] = useState<number | ''>('');
  const [amortizationRate, setAmortizationRate] = useState<number>(DEFAULT_AMORTIZATION_RATE);
  
  const getLiabilityTypeLabel = () => {
    switch (liabilityType) {
      case 'Bostadslån': return 'bostadslån';
      case 'Billån': return 'billån';
      default: return 'lån';
    }
  };
  
  const handleComplete = () => {
    if (hasLoan === false) {
      onComplete(null);
      return;
    }
    
    if (principal !== '' && principal > 0 && label.trim()) {
      const newLiability: Liability = {
        id: Date.now().toString(),
        label: label.trim(),
        principal: principal as number,
        amortization_rate_apy: amortizationRate,
        liability_type: liabilityType
      };
      onComplete(newLiability);
    }
  };
  
  if (hasLoan === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-red-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Har du {getLiabilityTypeLabel()} på {assetLabel}?
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Värdet på {assetLabel} är {formatCurrency(assetValue)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={() => setHasLoan(true)}
            className="h-auto py-6 text-base"
          >
            Ja, jag har {getLiabilityTypeLabel()}
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              setHasLoan(false);
              onComplete(null);
            }}
            className="h-auto py-6 text-base"
          >
            Nej, hoppa över
          </Button>
        </div>
      </div>
    );
  }
  
  if (hasLoan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Lägg till {getLiabilityTypeLabel()}
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            För {assetLabel} ({formatCurrency(assetValue)})
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="liability-label" className="text-base">
              Beskrivning (t.ex. "{liabilityType === 'Bostadslån' ? 'Bostadslån' : 'Billån'}")
            </Label>
            <Input
              id="liability-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={liabilityType === 'Bostadslån' ? 'Bostadslån' : 'Billån'}
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
            {principal !== '' && principal > assetValue && (
              <p className="text-xs text-amber-600 mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ Lånebeloppet överstiger tillgångens värde. Detta är tillåtet men kan vara ovanligt.
              </p>
            )}
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
          
          {principal !== '' && principal > 0 && label.trim() && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">
                    {label}: {formatCurrency(principal as number)} ({(amortizationRate * 100).toFixed(1)}%/år)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setHasLoan(null)} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={principal === '' || principal <= 0 || !label.trim()}
            className="flex-1"
          >
            Fortsätt →
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}

