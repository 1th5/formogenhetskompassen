'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AssetCategory, getDefaultReturnRate } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/format';

interface AssetWizardProps {
  onAddAsset: (asset: { category: AssetCategory; label: string; value: number; expected_apy: number }) => void;
  onSkip: () => void;
}

export default function AssetWizard({ onAddAsset, onSkip }: AssetWizardProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<AssetCategory | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<number | ''>('');

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = () => {
    if (category && label && value !== '' && value > 0) {
      onAddAsset({
        category,
        label,
        value: value as number,
        expected_apy: getDefaultReturnRate(category)
      });
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <Dialog open onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>🏠 Lägg till tillgång</DialogTitle>
          <DialogDescription>
            Låt oss hjälpa dig att lägga till din tillgång steg för steg.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full mb-4" />

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>1. Vilken typ av tillgång vill du lägga till?</Label>
              <p className="text-sm text-gray-600 mt-1">
                En tillgång är något du äger som har värde - hus, bil, pengar, fonder, etc.
              </p>
            </div>
            <RadioGroup value={category || ''} onValueChange={(value: AssetCategory) => setCategory(value)}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Bostad" id="category-bostad" />
                  <Label htmlFor="category-bostad" className="flex items-center space-x-2">
                    <span>🏠</span>
                    <span>Bostad</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Semesterbostad" id="category-semester" />
                  <Label htmlFor="category-semester" className="flex items-center space-x-2">
                    <span>🏖️</span>
                    <span>Semesterbostad</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Bil" id="category-bil" />
                  <Label htmlFor="category-bil" className="flex items-center space-x-2">
                    <span>🚗</span>
                    <span>Bil</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Fonder & Aktier" id="category-fonder" />
                  <Label htmlFor="category-fonder" className="flex items-center space-x-2">
                    <span>📈</span>
                    <span>Fonder & Aktier</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Sparkonto & Kontanter" id="category-sparkonto" />
                  <Label htmlFor="category-sparkonto" className="flex items-center space-x-2">
                    <span>💰</span>
                    <span>Sparkonto</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Tomt & Mark" id="category-tomt" />
                  <Label htmlFor="category-tomt" className="flex items-center space-x-2">
                    <span>🌲</span>
                    <span>Tomt & Mark</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Maskiner & Utrustning" id="category-maskiner" />
                  <Label htmlFor="category-maskiner" className="flex items-center space-x-2">
                    <span>🔧</span>
                    <span>Maskiner</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Fordon (övrigt)" id="category-fordon" />
                  <Label htmlFor="category-fordon" className="flex items-center space-x-2">
                    <span>🏍️</span>
                    <span>Fordon</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Ädelmetaller & Smycken" id="category-smycken" />
                  <Label htmlFor="category-smycken" className="flex items-center space-x-2">
                    <span>💎</span>
                    <span>Smycken</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Annat" id="category-annat" />
                  <Label htmlFor="category-annat" className="flex items-center space-x-2">
                    <span>❓</span>
                    <span>Annat</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Tips för tillgångar */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">💡 Tips för tillgångar</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Bostad:</strong> Villa, lägenhet, marknadsvärde idag</li>
                <li>• <strong>Semesterbostad:</strong> Sommarstuga, fritidshus, stuga</li>
                <li>• <strong>Bil:</strong> Personbil, marknadsvärde (inte nypris)</li>
                <li>• <strong>Fonder & Aktier:</strong> ISK, AF, fonder, aktier</li>
                <li>• <strong>Sparkonto:</strong> Bankkonto, räntekonto, kontanter</li>
                <li>• <strong>Trygghetsbaserad pension (Statlig):</strong> Inkomstpension från staten</li>
                <li>• <strong>Marknadsbaserad pension:</strong> Premiepension, tjänstepension, IPS</li>
                <li>• <strong>Tomt & Mark:</strong> Byggtomt, skogsmark, jordbruksmark</li>
                <li>• <strong>Maskiner:</strong> Traktor, verktyg, utrustning</li>
                <li>• <strong>Fordon:</strong> Motorcykel, båt, moped</li>
                <li>• <strong>Smycken:</strong> Guld, silver, ädelstenar</li>
                <li>• <strong>Annat:</strong> Samlarobjekt, konst, antikviteter</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label>2. Beskriv din tillgång</Label>
            <div>
              <Label htmlFor="asset-label">Beskrivning</Label>
              <Input
                id="asset-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={category === 'Bostad' ? 'T.ex. Villa i Stockholm' : 
                           category === 'Bil' ? 'T.ex. Volvo V70' :
                           category === 'Fonder & Aktier' ? 'T.ex. Avanza Global' :
                           'T.ex. Min tillgång'}
              />
              <p className="text-sm text-gray-500 mt-1">
                En kort beskrivning av din tillgång
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label>3. Vad är tillgången värd idag?</Label>
            <div>
              <Label htmlFor="asset-value">Värde (kr)</Label>
              <Input
                id="asset-value"
                type="number"
                value={value || ''}
                onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                placeholder={category === 'Bostad' ? '5000000' : 
                           category === 'Bil' ? '300000' :
                           category === 'Fonder & Aktier' ? '100000' :
                           '100000'}
              />
              <p className="text-sm text-gray-500 mt-1">
                Marknadsvärdet idag
              </p>
              {value !== '' && value > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Förhandsvisning:</strong> {formatCurrency(value)} med förväntad avkastning {Math.round(getDefaultReturnRate(category!) * 1000) / 10}% per år
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end">
          <div className="flex space-x-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Tillbaka
              </Button>
            )}
            {step === 1 && category && (
              <Button onClick={handleNext}>Nästa</Button>
            )}
            {step === 2 && label && (
              <Button onClick={handleNext}>Nästa</Button>
            )}
            {step === 3 && value !== '' && value > 0 && (
              <Button onClick={handleFinish}>
                Lägg till tillgång
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
