/**
 * Boende-wizard-steg
 * Enkelt steg för att lägga till boende
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
import { Home, CheckCircle } from 'lucide-react';

interface HousingWizardStepProps {
  onComplete: (asset: Asset | null) => void;
  onSkip: () => void;
}

export default function HousingWizardStep({ onComplete, onSkip }: HousingWizardStepProps) {
  const [hasHousing, setHasHousing] = useState<boolean | null>(null);
  const [housingType, setHousingType] = useState<'bostad' | 'semesterbostad' | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<number | ''>('');
  
  const handleComplete = () => {
    if (hasHousing === false) {
      onComplete(null);
      return;
    }
    
    if (housingType && value !== '' && value > 0) {
      const category: AssetCategory = housingType === 'bostad' ? 'Bostad' : 'Semesterbostad';
      // Använd generiskt namn om inget anges
      const defaultLabel = housingType === 'bostad' ? 'Bostad 1' : 'Semesterbostad 1';
      const finalLabel = label.trim() || defaultLabel;
      
      const asset: Asset = {
        id: Date.now().toString(),
        category,
        label: finalLabel,
        value: value as number,
        expected_apy: getDefaultReturnRate(category)
      };
      onComplete(asset);
    }
  };
  
  if (hasHousing === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-purple-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Äger du ditt boende eller annan bostad?
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Lägg till din bostadsrätt, hus, fritidshus eller annat boende
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={() => setHasHousing(true)}
            className="h-auto py-6 text-base"
          >
            Ja, jag äger mitt boende
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setHasHousing(true)}
            className="h-auto py-6 text-base"
          >
            Ja, jag äger annan bostad
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              setHasHousing(false);
              onComplete(null);
            }}
            className="h-auto py-6 text-base sm:col-span-2"
          >
            Nej, hoppa över
          </Button>
        </div>
      </div>
    );
  }
  
  if (hasHousing && housingType === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Vilken typ av boende?
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer border hover:border-primary/50 transition-all"
            onClick={() => setHousingType('bostad')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🏠</div>
              <h4 className="font-medium text-primary">Bostad</h4>
              <p className="text-sm text-primary/70">
                Huvudbostad, bostadsrätt, hus
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer border hover:border-primary/50 transition-all"
            onClick={() => setHousingType('semesterbostad')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🏡</div>
              <h4 className="font-medium text-primary">Semesterbostad</h4>
              <p className="text-sm text-primary/70">
                Fritidshus, stuga
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Button variant="secondary" onClick={() => setHasHousing(null)} className="w-full">
          ← Tillbaka
        </Button>
      </div>
    );
  }
  
  if (hasHousing && housingType) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Lägg till {housingType === 'bostad' ? 'bostad' : 'semesterbostad'}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="housing-label" className="text-base">
              Beskrivning (valfritt, t.ex. "Bostadsrätt på Södermalm", "Fritidshus i Småland")
            </Label>
            <Input
              id="housing-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={housingType === 'bostad' ? 'Bostadsrätt på Södermalm' : 'Fritidshus i Småland'}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="housing-value" className="text-base">Värdering (kr)</Label>
            <Input
              id="housing-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="3000000"
              className="mt-2"
            />
            <p className="text-sm text-primary/60 mt-1">
              Använd aktuellt marknadsvärde eller senaste taxeringsvärde
            </p>
          </div>
          
          {value !== '' && value > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {label.trim() || (housingType === 'bostad' ? 'Bostad 1' : 'Semesterbostad 1')}: {formatCurrency(value as number)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setHousingType(null)} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={value === '' || value <= 0}
            className="flex-1"
          >
            Fortsätt till övriga tillgångar →
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}

