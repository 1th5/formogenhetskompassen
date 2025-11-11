/**
 * Spar och investeringar wizard-steg
 * Först beskriver att man behöver kolla banken
 * Sen låter välja mellan spar/kontanter eller aktier/fonder
 * Loopar tills man är klar
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Asset, AssetCategory } from '@/lib/types';
import { getDefaultReturnRate } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { CheckCircle, Building2 } from 'lucide-react';

interface SavingsInvestmentWizardStepProps {
  onComplete: (assets: Asset[]) => void;
  onSkip: () => void;
}

export default function SavingsInvestmentWizardStep({ onComplete, onSkip }: SavingsInvestmentWizardStepProps) {
  const [step, setStep] = useState<'intro' | 'choose-type' | 'input'>('intro');
  const [savingsInvestments, setSavingsInvestments] = useState<Asset[]>([]);
  const [selectedType, setSelectedType] = useState<'savings' | 'stocks' | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<number | ''>('');
  
  const handleAddInvestment = () => {
    if (value !== '' && value > 0 && selectedType) {
      const category: AssetCategory = selectedType === 'savings' 
        ? 'Sparkonto & Kontanter' 
        : 'Fonder & Aktier';
      
      // Använd generiskt namn om inget anges
      const investmentNumber = savingsInvestments.length + 1;
      const defaultLabel = selectedType === 'savings' ? `Investeringar ${investmentNumber}` : `Investeringar ${investmentNumber}`;
      const finalLabel = label.trim() || defaultLabel;
      
      const newAsset: Asset = {
        id: Date.now().toString(),
        category,
        label: finalLabel,
        value: value as number,
        expected_apy: getDefaultReturnRate(category)
      };
      
      setSavingsInvestments(prev => [...prev, newAsset]);
      setLabel('');
      setValue('');
      setSelectedType(null);
      setStep('intro');
    }
  };
  
  const handleMoreInvestments = () => {
    setStep('intro');
    setSelectedType(null);
    setLabel('');
    setValue('');
  };
  
  const handleFinish = () => {
    onComplete(savingsInvestments);
  };
  
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-green-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Spar och investeringar på börsen
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Lägg till dina bankinvesteringar - sparkonton, fonder och aktier.
          </p>
        </div>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <h4 className="font-medium text-blue-900 mb-2">Vad behöver du göra?</h4>
            <p className="text-sm md:text-base text-blue-800 mb-3">
              Logga in på din bank och hitta:
            </p>
            <ul className="text-sm md:text-base text-blue-800 space-y-2">
              <li>• Sparkonton och belopp</li>
              <li>• Fonder och deras värde</li>
              <li>• Aktier och deras värde</li>
              <li>• Övriga tillgångar via banken</li>
            </ul>
          </CardContent>
        </Card>
        
        {savingsInvestments.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setStep('choose-type')} className="flex-1">
              Börja lägga till
            </Button>
            <Button variant="secondary" onClick={onSkip} className="flex-1">
              Hoppa över
            </Button>
          </div>
        )}
        
        {savingsInvestments.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {savingsInvestments.length} tillgång{savingsInvestments.length > 1 ? 'ar' : ''}:
            </p>
            <div className="space-y-2">
              {savingsInvestments.map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-green-900 block">{asset.label}</span>
                    <span className="text-sm text-green-700">{asset.category}</span>
                  </div>
                  <span className="text-green-700 font-medium">{formatCurrency(asset.value)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button onClick={() => setStep('choose-type')} variant="secondary" className="flex-1">
                Lägg till fler tillgångar
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Fortsätt till boende →
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (step === 'choose-type') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Vilken typ av investering?
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Välj typen av investering du vill lägga till
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedType === 'savings' 
                ? 'border-2 border-primary bg-primary/5' 
                : 'border hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedType('savings');
              setStep('input');
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-medium text-primary mb-1">Spar och kontanter</h4>
              <p className="text-sm text-primary/70">
                Sparkonton, lönekonto med överskott, kontanter
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${
              selectedType === 'stocks' 
                ? 'border-2 border-primary bg-primary/5' 
                : 'border hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedType('stocks');
              setStep('input');
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium text-primary mb-1">Aktier & Fonder</h4>
              <p className="text-sm text-primary/70">
                Fonder, aktier, ETF:er via banken
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Button variant="secondary" onClick={() => setStep('intro')} className="w-full">
          ← Tillbaka
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
          Lägg till {selectedType === 'savings' ? 'spar/kontanter' : 'aktier & fonder'}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="investment-label" className="text-base">
            Beskrivning (valfritt, t.ex. "Nordea sparkonto", "Avanza fonder")
          </Label>
          <Input
            id="investment-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={selectedType === 'savings' ? 'Nordea sparkonto' : 'Avanza fonder'}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="investment-value" className="text-base">Värde (kr)</Label>
          <Input
            id="investment-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="100000"
            className="mt-2"
          />
        </div>
        
        {value !== '' && value > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  {label.trim() || `Investeringar ${savingsInvestments.length + 1}`}: {formatCurrency(value as number)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => setStep('choose-type')} className="flex-1">
          ← Tillbaka
        </Button>
        <Button 
          onClick={handleAddInvestment}
          disabled={value === '' || value <= 0}
          className="flex-1"
        >
          Lägg till tillgång
        </Button>
      </div>
      
      {savingsInvestments.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-sm text-primary/70 mb-3">
            Du har lagt till {savingsInvestments.length} tillgång{savingsInvestments.length > 1 ? 'ar' : ''}:
          </p>
          <div className="space-y-2 mb-4">
            {savingsInvestments.map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <span className="font-medium text-green-900 block">{asset.label}</span>
                  <span className="text-sm text-green-700">{asset.category}</span>
                </div>
                <span className="text-green-700 font-medium">{formatCurrency(asset.value)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setStep('choose-type')} variant="secondary" className="flex-1">
              Lägg till fler tillgångar
            </Button>
            <Button onClick={handleFinish} className="flex-1">
              Fortsätt till boende →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

