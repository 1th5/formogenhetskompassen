/**
 * Övriga tillgångar wizard-steg
 * Låter välja mellan alla övriga kategorier och loopar tills klar
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
import { CheckCircle } from 'lucide-react';

interface OtherInvestmentsWizardStepProps {
  onComplete: (assets: Asset[]) => void;
  onSkip: () => void;
}

// Alla tillgångskategorier inklusive boende
const ALL_CATEGORIES: { value: AssetCategory; label: string; icon: string; description: string }[] = [
  { value: 'Bostad', label: 'Bostad', icon: '🏠', description: 'Huvudbostad, bostadsrätt, hus' },
  { value: 'Semesterbostad', label: 'Semesterbostad', icon: '🏡', description: 'Fritidshus, stuga' },
  { value: 'Bil', label: 'Bil', icon: '🚗', description: 'Personbil, lastbil, motorcykel' },
  { value: 'Tomt & Mark', label: 'Tomt & Mark', icon: '🏞️', description: 'Tomt, skog, jordbruksmark' },
  { value: 'Maskiner & Utrustning', label: 'Maskiner & Utrustning', icon: '⚙️', description: 'Företagsutrustning, maskiner' },
  { value: 'Fordon (övrigt)', label: 'Fordon (övrigt)', icon: '🚢', description: 'Båt, flygplan, övrigt fordon' },
  { value: 'Ädelmetaller & Smycken', label: 'Ädelmetaller & Smycken', icon: '💎', description: 'Guld, silver, smycken' },
  { value: 'Annat', label: 'Annat', icon: '📦', description: 'Övriga tillgångar' }
];

export default function OtherInvestmentsWizardStep({ onComplete, onSkip }: OtherInvestmentsWizardStepProps) {
  const [step, setStep] = useState<'intro' | 'select-category' | 'input'>('intro');
  const [otherInvestments, setOtherInvestments] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<number | ''>('');
  
  const handleAddInvestment = () => {
    if (value !== '' && value > 0 && selectedCategory) {
      // Använd generiskt namn baserat på kategori om inget anges
      const categoryLabel = ALL_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Tillgång';
      const investmentNumber = otherInvestments.filter(a => a.category === selectedCategory).length + 1;
      const defaultLabel = `${categoryLabel} ${investmentNumber}`;
      const finalLabel = label.trim() || defaultLabel;
      
      const newAsset: Asset = {
        id: Date.now().toString(),
        category: selectedCategory,
        label: finalLabel,
        value: value as number,
        expected_apy: getDefaultReturnRate(selectedCategory)
      };
      
      setOtherInvestments(prev => [...prev, newAsset]);
      setLabel('');
      setValue('');
      setSelectedCategory(null);
      setStep('intro');
    }
  };
  
  const handleMoreInvestments = () => {
    setStep('intro');
    setSelectedCategory(null);
    setLabel('');
    setValue('');
  };
  
  const handleFinish = () => {
    onComplete(otherInvestments);
  };
  
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Övriga tillgångar
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Lägg till bil, tomt, maskiner eller andra tillgångar
          </p>
        </div>
        
        {otherInvestments.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setStep('select-category')} className="flex-1">
              Lägg till tillgång
            </Button>
            <Button variant="secondary" onClick={onSkip} className="flex-1">
              Hoppa över
            </Button>
          </div>
        )}
        
        {otherInvestments.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {otherInvestments.length} tillgång{otherInvestments.length > 1 ? 'ar' : ''}:
            </p>
            <div className="space-y-2">
              {otherInvestments.map((asset, idx) => (
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
              <Button onClick={() => setStep('select-category')} variant="secondary" className="flex-1">
                Lägg till fler tillgångar
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Fortsätt till lån och skulder →
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (step === 'select-category') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Välj kategori
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Vilken typ av investering vill du lägga till?
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {ALL_CATEGORIES.map((cat) => (
            <Card 
              key={cat.value}
              className={`cursor-pointer transition-all ${
                selectedCategory === cat.value 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'border hover:border-primary/50'
              }`}
              onClick={() => {
                setSelectedCategory(cat.value);
                setStep('input');
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="text-2xl md:text-3xl mb-2">{cat.icon}</div>
                <h4 className="font-medium text-primary mb-1">{cat.label}</h4>
                <p className="text-sm text-primary/70">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
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
          Lägg till {ALL_CATEGORIES.find(c => c.value === selectedCategory)?.label?.toLowerCase()}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="other-label" className="text-base">Beskrivning (valfritt)</Label>
          <Input
            id="other-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="T.ex. Volvo V70, Guldmynt, Moped"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="other-value" className="text-base">Värde (kr)</Label>
          <Input
            id="other-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="50000"
            className="mt-2"
          />
        </div>
        
        {value !== '' && value > 0 && (() => {
          const categoryLabel = ALL_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Tillgång';
          const investmentNumber = otherInvestments.filter(a => a.category === selectedCategory).length + 1;
          const displayLabel = label.trim() || `${categoryLabel} ${investmentNumber}`;
          return (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {displayLabel}: {formatCurrency(value as number)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => setStep('select-category')} className="flex-1">
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
      
      {otherInvestments.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-sm text-primary/70 mb-3">
            Du har lagt till {otherInvestments.length} tillgång{otherInvestments.length > 1 ? 'ar' : ''}:
          </p>
          <div className="space-y-2 mb-4">
            {otherInvestments.map((asset, idx) => (
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
            <Button onClick={() => setStep('select-category')} variant="secondary" className="flex-1">
              Lägg till fler tillgångar
            </Button>
            <Button onClick={handleFinish} className="flex-1">
              Fortsätt till lån och skulder →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

