/**
 * Pensionswizard-steg - Guiderar genom de olika pensionstyperna
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Asset } from '@/lib/types';
import { ExternalLink, CheckCircle, PiggyBank, Info, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getDefaultReturnRate } from '@/lib/types';

interface PensionWizardStepProps {
  onComplete: (pensionAssets: Asset[]) => void;
  onSkip: () => void;
}

type PensionType = 'inkomstpension' | 'premiepension' | 'tjanstepension' | 'ips' | null;

export default function PensionWizardStep({ onComplete, onSkip }: PensionWizardStepProps) {
  const [pensions, setPensions] = useState<Asset[]>([]);
  const [currentStep, setCurrentStep] = useState<'intro' | 'guide' | 'input' | 'choose-type'>('intro');
  const [currentPensionType, setCurrentPensionType] = useState<PensionType>(null);
  const [pensionLabel, setPensionLabel] = useState('');
  const [pensionValue, setPensionValue] = useState<number | ''>('');
  
  const handleAddPension = () => {
    if (pensionValue !== '' && pensionValue > 0 && currentPensionType) {
      let category: 'Trygghetsbaserad pension (Statlig)' | 'Tjänstepension' | 'Premiepension' | 'Privat pensionssparande (IPS)';
      let defaultLabel = '';
      
      if (currentPensionType === 'inkomstpension') {
        category = 'Trygghetsbaserad pension (Statlig)';
        defaultLabel = 'Inkomstpension (Statlig)';
      } else if (currentPensionType === 'premiepension') {
        category = 'Premiepension';
        defaultLabel = 'Premiepension';
      } else if (currentPensionType === 'tjanstepension') {
        category = 'Tjänstepension';
        defaultLabel = 'Tjänstepension';
      } else {
        category = 'Privat pensionssparande (IPS)';
        defaultLabel = 'IPS (Individuellt pensionssparande)';
      }
      
      const newPension: Asset = {
        id: Date.now().toString(),
        category,
        label: pensionLabel || defaultLabel,
        value: pensionValue as number,
        expected_apy: getDefaultReturnRate(category)
      };
      setPensions(prev => [...prev, newPension]);
      setPensionLabel('');
      setPensionValue('');
      setCurrentPensionType(null);
      setCurrentStep('choose-type');
    }
  };
  
  const handleFinishPensions = () => {
    onComplete(pensions);
  };

  const getPensionTypeInfo = (type: PensionType) => {
    switch (type) {
      case 'inkomstpension':
        return {
          title: 'Inkomstpension (Statlig)',
          description: 'Din statliga inkomstpension från det allmänna pensionssystemet. Denna växer baserat på dina inbetalningar och är trygghetsbaserad.',
          category: 'Trygghetsbaserad pension (Statlig)' as const,
          where: 'Under "Allmän pension" → "Inkomstpension"',
          expectedReturn: '2% per år (baserat på inkomstindexering)'
        };
      case 'premiepension':
        return {
          title: 'Premiepension',
          description: 'Din premiepension som du själv kan välja fonder för. Denna är marknadsbaserad och kan investeras mot börsen.',
          category: 'Premiepension' as const,
          where: 'Under "Allmän pension" → "Premiepension"',
          expectedReturn: '7% per år (marknadsbaserad avkastning)'
        };
      case 'tjanstepension':
        return {
          title: 'Tjänstepension',
          description: 'Din tjänstepension från arbetsgivaren via pensionsbolag (t.ex. ITP, SAF-LO, etc). Denna är marknadsbaserad och investeras mot börsen.',
          category: 'Tjänstepension' as const,
          where: 'Under "Tjänstepension" eller "Privat pension"',
          expectedReturn: '7% per år (marknadsbaserad avkastning)'
        };
      case 'ips':
        return {
          title: 'IPS (Individuellt pensionssparande)',
          description: 'Din privata IPS-pension som du själv betalar in till. Denna är marknadsbaserad och kan investeras mot börsen.',
          category: 'Privat pensionssparande (IPS)' as const,
          where: 'På minpension.se under "IPS" eller på din banks webbplats',
          expectedReturn: '6% per år (marknadsbaserad avkastning)'
        };
      default:
        return null;
    }
  };
  
  if (currentStep === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="w-7 h-7 text-blue-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Hitta din pension på minpension.se
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Vi guidar dig genom att hitta alla delar av din pension. Det finns olika typer som behöver registreras separat.
          </p>
        </div>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <h4 className="font-medium text-blue-900 mb-3">Vad behöver du?</h4>
            <ul className="text-sm md:text-base text-blue-800 space-y-2">
              <li>• BankID för att logga in på minpension.se</li>
              <li>• 10-15 minuter för att hitta alla pensionsdelar</li>
              <li>• Dina pensionsvärden från olika källor</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-3">Olika typer av pension</h4>
                <div className="space-y-3 text-sm text-purple-800">
                  <div>
                    <strong>🏛️ Trygghetsbaserad pension (Statlig):</strong>
                    <p className="mt-1">Din inkomstpension från det allmänna pensionssystemet. Denna växer baserat på dina inbetalningar och är garanterad av staten. Avkastning: ~2% per år.</p>
                  </div>
                  <div>
                    <strong>📊 Marknadsbaserad pension:</strong>
                    <p className="mt-1">Pension som investeras mot börsen och kan växa mer. Inkluderar premiepension, tjänstepension och IPS. Avkastning: ~6% per år.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {pensions.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setCurrentStep('choose-type')}
              className="flex-1"
            >
              Ja, låt mig börja
            </Button>
            <Button 
              variant="secondary"
              onClick={onSkip}
              className="flex-1"
            >
              Hoppa över detta
            </Button>
          </div>
        )}
        
        {pensions.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {pensions.length} pension{pensions.length > 1 ? 'er' : ''}:
            </p>
            <div className="space-y-2">
              {pensions.map((pension, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-green-900 block">{pension.label}</span>
                    <span className="text-sm text-green-700">{pension.category}</span>
                  </div>
                  <span className="text-green-700 font-medium">{formatCurrency(pension.value)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button onClick={() => setCurrentStep('choose-type')} variant="secondary" className="flex-1">
                Lägg till fler pensioner
              </Button>
              <Button onClick={handleFinishPensions} className="flex-1">
                Fortsätt till nästa steg →
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'choose-type') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Vilken pensionsdel vill du lägga till?
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Välj vilken typ av pension du vill registrera nu. Du kan lägga till flera efter varandra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer transition-all border-2 hover:border-primary/50"
            onClick={() => {
              setCurrentPensionType('inkomstpension');
              setCurrentStep('guide');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">Inkomstpension</h4>
                  <p className="text-sm text-primary/70">Statlig, trygghetsbaserad pension</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all border-2 hover:border-primary/50"
            onClick={() => {
              setCurrentPensionType('premiepension');
              setCurrentStep('guide');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <PiggyBank className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">Premiepension</h4>
                  <p className="text-sm text-primary/70">Marknadsbaserad, från allmän pension</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all border-2 hover:border-primary/50"
            onClick={() => {
              setCurrentPensionType('tjanstepension');
              setCurrentStep('guide');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <PiggyBank className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">Tjänstepension</h4>
                  <p className="text-sm text-primary/70">Marknadsbaserad, från arbetsgivaren</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all border-2 hover:border-primary/50"
            onClick={() => {
              setCurrentPensionType('ips');
              setCurrentStep('guide');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <PiggyBank className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">IPS</h4>
                  <p className="text-sm text-primary/70">Individuellt pensionssparande</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setCurrentStep('intro')} className="flex-1">
            ← Tillbaka
          </Button>
          {pensions.length > 0 && (
            <Button onClick={handleFinishPensions} className="flex-1">
              Klar med pensioner →
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (currentStep === 'guide' && currentPensionType) {
    const info = getPensionTypeInfo(currentPensionType);
    if (!info) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Hitta din {info.title}
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            {info.description}
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => window.open('https://minpension.se', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Öppna minpension.se
          </Button>
        </div>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 md:p-6">
            <h4 className="font-medium text-green-900 mb-3">Steg för steg:</h4>
            <ol className="text-sm md:text-base text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Logga in på minpension.se med BankID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Hitta {info.where}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Notera värdet för {info.title}</span>
              </li>
              {currentPensionType === 'ips' && (
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Om du inte hittar IPS på minpension.se, kolla på din banks webbplats istället</span>
                </li>
              )}
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Förväntad avkastning</h4>
                <p className="text-sm text-blue-800">
                  {info.expectedReturn}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setCurrentStep('choose-type')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button onClick={() => setCurrentStep('input')} className="flex-1">
            Jag har hittat värdet →
          </Button>
        </div>
      </div>
    );
  }
  
  if (currentStep === 'input' && currentPensionType) {
    const info = getPensionTypeInfo(currentPensionType);
    if (!info) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Lägg till din {info.title}
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            Ange värdet du hittade på minpension.se
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pension-label" className="text-base">Beskrivning (valfritt)</Label>
            <Input
              id="pension-label"
              value={pensionLabel}
              onChange={(e) => setPensionLabel(e.target.value)}
              placeholder={info.title}
              className="mt-2"
            />
            <p className="text-sm text-primary/60 mt-1">
              Vi förfyller med "{info.title}" om du inte anger något
            </p>
          </div>
          
          <div>
            <Label htmlFor="pension-value" className="text-base">Värde (kr)</Label>
            <Input
              id="pension-value"
              type="number"
              value={pensionValue}
              onChange={(e) => setPensionValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="500000"
              className="mt-2"
            />
            <p className="text-sm text-primary/60 mt-1">
              Ange värdet från minpension.se
            </p>
          </div>
          
          {pensionValue !== '' && pensionValue > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {pensionLabel || info.title}: {formatCurrency(pensionValue as number)}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Typ: {info.category} • Förväntad avkastning: {info.expectedReturn}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setCurrentStep('guide')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={handleAddPension}
            disabled={pensionValue === '' || pensionValue <= 0}
            className="flex-1"
          >
            Lägg till pension
          </Button>
        </div>
        
        {pensions.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {pensions.length} pension{pensions.length > 1 ? 'er' : ''}:
            </p>
            <div className="space-y-2 mb-4">
              {pensions.map((pension, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-green-900 block">{pension.label}</span>
                    <span className="text-sm text-green-700">{pension.category}</span>
                  </div>
                  <span className="text-green-700 font-medium">{formatCurrency(pension.value)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setCurrentStep('choose-type')} variant="secondary" className="flex-1">
                Lägg till fler pensioner
              </Button>
              <Button onClick={handleFinishPensions} className="flex-1">
                Fortsätt till nästa steg →
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
}
