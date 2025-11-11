'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/format';

interface LiabilityWizardProps {
  onAddLiability: (liability: { label: string; principal: number; amortization_rate_apy: number }) => void;
  onSkip: () => void;
}

export default function LiabilityWizard({ onAddLiability, onSkip }: LiabilityWizardProps) {
  const [step, setStep] = useState(1);
  const [liabilityType, setLiabilityType] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [principal, setPrincipal] = useState<number | ''>('');
  const [amortizationRate, setAmortizationRate] = useState<number>(0.02); // 2% default

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = () => {
    if (label && principal !== '' && principal > 0) {
      onAddLiability({
        label,
        principal: principal as number,
        amortization_rate_apy: amortizationRate
      });
    }
  };

  const getDefaultAmortizationRate = (type: string): number => {
    switch (type) {
      case 'Bostadslån':
        return 0.02; // 2% - standard bostadslån
      case 'Bil':
        return 0.05; // 5% - bil lån
      case 'Konsumtionslån':
        return 0.08; // 8% - konsumtionslån
      case 'Kreditkort':
        return 0.15; // 15% - kreditkort
      case 'Studielån':
        return 0.01; // 1% - studielån
      case 'Annat':
        return 0.05; // 5% - generisk amorteringstakt
      default:
        return 0.02;
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <Dialog open onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>💳 Lägg till skuld</DialogTitle>
          <DialogDescription>
            Låt oss hjälpa dig att lägga till din skuld steg för steg.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full mb-4" />

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>1. Vilken typ av skuld vill du lägga till?</Label>
              <p className="text-sm text-gray-600 mt-1">
                En skuld är pengar du är skyldig - lån, kreditkort, räkningar, etc.
              </p>
            </div>
            <RadioGroup value={liabilityType || ''} onValueChange={(value) => {
              setLiabilityType(value);
              setAmortizationRate(getDefaultAmortizationRate(value));
            }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Bostadslån" id="liability-bostad" />
                  <Label htmlFor="liability-bostad" className="flex items-center space-x-2">
                    <span>🏠</span>
                    <span>Bostadslån</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Bil" id="liability-bil" />
                  <Label htmlFor="liability-bil" className="flex items-center space-x-2">
                    <span>🚗</span>
                    <span>Bil</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Konsumtionslån" id="liability-konsumtion" />
                  <Label htmlFor="liability-konsumtion" className="flex items-center space-x-2">
                    <span>💳</span>
                    <span>Konsumtionslån</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Kreditkort" id="liability-kreditkort" />
                  <Label htmlFor="liability-kreditkort" className="flex items-center space-x-2">
                    <span>💳</span>
                    <span>Kreditkort</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Studielån" id="liability-studie" />
                  <Label htmlFor="liability-studie" className="flex items-center space-x-2">
                    <span>🎓</span>
                    <span>Studielån</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Annat" id="liability-annat" />
                  <Label htmlFor="liability-annat" className="flex items-center space-x-2">
                    <span>❓</span>
                    <span>Annat</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Tips för skulder */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips för skulder</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Bostadslån:</strong> Bolån, pantbrev, lagfart</li>
                <li>• <strong>Bil:</strong> Billån, leasing, restvärde</li>
                <li>• <strong>Konsumtionslån:</strong> Personliga lån, blancolån</li>
                <li>• <strong>Kreditkort:</strong> Utstående belopp (inte kreditgräns)</li>
                <li>• <strong>Studielån:</strong> CSN-lån, utbildningslån</li>
                <li>• <strong>Annat:</strong> Familjelån, skulder till vänner</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label>2. Beskriv din skuld</Label>
            <div>
              <Label htmlFor="liability-label">Beskrivning</Label>
              <Input
                id="liability-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={liabilityType === 'Bostadslån' ? 'T.ex. Bolån på villa' : 
                           liabilityType === 'Bil' ? 'T.ex. Billån på Volvo' :
                           liabilityType === 'Konsumtionslån' ? 'T.ex. Personligt lån' :
                           liabilityType === 'Kreditkort' ? 'T.ex. Visa-kort' :
                           liabilityType === 'Studielån' ? 'T.ex. CSN-lån' :
                           'T.ex. Min skuld'}
              />
              <p className="text-sm text-gray-500 mt-1">
                En kort beskrivning av din skuld
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label>3. Vad är skulden värd idag?</Label>
            <div>
              <Label htmlFor="liability-principal">Skuldbelopp (kr)</Label>
              <Input
                id="liability-principal"
                type="number"
                value={principal || ''}
                onChange={(e) => setPrincipal(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                placeholder={liabilityType === 'Bostadslån' ? '3000000' : 
                           liabilityType === 'Bil' ? '200000' :
                           liabilityType === 'Konsumtionslån' ? '50000' :
                           liabilityType === 'Kreditkort' ? '15000' :
                           liabilityType === 'Studielån' ? '100000' :
                           '50000'}
              />
              <p className="text-sm text-gray-500 mt-1">
                Det utestående beloppet idag
              </p>
              
              <div className="mt-4">
                <Label htmlFor="liability-rate">Årlig amorteringstakt (%)</Label>
                <Input
                  id="liability-rate"
                  type="number"
                  step="0.1"
                  value={amortizationRate * 100}
                  onChange={(e) => setAmortizationRate((parseFloat(e.target.value) || 0) / 100)}
                  placeholder="2.0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Årlig amorteringstakt på skulden (2.0 = 2% per år)
                </p>
              </div>
              
              {principal !== '' && principal > 0 && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Förhandsvisning:</strong> {formatCurrency(principal)} med {amortizationRate * 100}% årlig amorteringstakt
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end">
          <div className="flex space-x-2">
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack}>
                Tillbaka
              </Button>
            )}
            {step === 1 && liabilityType && (
              <Button onClick={handleNext}>Nästa</Button>
            )}
            {step === 2 && label && (
              <Button onClick={handleNext}>Nästa</Button>
            )}
            {step === 3 && principal !== '' && principal > 0 && (
              <Button onClick={handleFinish}>
                Lägg till skuld
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
