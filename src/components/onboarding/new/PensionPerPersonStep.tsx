/**
 * Pensionstillgångar per person - Guidad wizard
 * Delar upp pensionen i delsteg: inkomstpension → premiepension → tjänstepension → IPS
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Asset, Person } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { getDefaultReturnRate } from '@/lib/types';
import { ExternalLink, CheckCircle, ArrowRight, ArrowLeft, Info, PiggyBank, Shield } from 'lucide-react';

interface PensionPerPersonStepProps {
  persons: Person[];
  currentPersonIndex: number;
  onComplete: (pensionAssets: Asset[]) => void;
  onBack: () => void;
  onNextPerson?: () => void;
  onSkip?: () => void;
}

type PensionSubStep = 'intro' | 'inkomstpension' | 'premiepension' | 'tjanstepension' | 'ips' | 'summary';

export default function PensionPerPersonStep({
  persons,
  currentPersonIndex,
  onComplete,
  onBack,
  onNextPerson,
  onSkip
}: PensionPerPersonStepProps) {
  const currentPerson = persons[currentPersonIndex];
  const [currentSubStep, setCurrentSubStep] = useState<PensionSubStep>('intro');
  const [pensionAssets, setPensionAssets] = useState<Asset[]>([]);
  
  const [inkomstpensionValue, setInkomstpensionValue] = useState<number | ''>('');
  const [premiepensionValue, setPremiepensionValue] = useState<number | ''>('');
  const [tjanstepensionValue, setTjanstepensionValue] = useState<number | ''>('');
  const [ipsValue, setIpsValue] = useState<number | ''>('');

  const hasMorePersons = currentPersonIndex < persons.length - 1;

  // Reset input-fält när person ändras (men behåll pensionAssets)
  useEffect(() => {
    setCurrentSubStep('intro');
    setInkomstpensionValue('');
    setPremiepensionValue('');
    setTjanstepensionValue('');
    setIpsValue('');
  }, [currentPersonIndex]);

  const handleAddPension = (type: 'inkomstpension' | 'premiepension' | 'tjanstepension' | 'ips', value: number) => {
    if (value <= 0) return;

    let category: 'Trygghetsbaserad pension (Statlig)' | 'Tjänstepension' | 'Premiepension' | 'Privat pensionssparande (IPS)';
    let label = '';
    let personLabel = currentPerson.name || `Person ${currentPersonIndex + 1}`;

    if (type === 'inkomstpension') {
      category = 'Trygghetsbaserad pension (Statlig)';
      label = `Inkomstpension - ${personLabel}`;
    } else if (type === 'premiepension') {
      category = 'Premiepension';
      label = `Premiepension - ${personLabel}`;
    } else if (type === 'tjanstepension') {
      category = 'Tjänstepension';
      label = `Tjänstepension - ${personLabel}`;
    } else {
      category = 'Privat pensionssparande (IPS)';
      label = `IPS - ${personLabel}`;
    }

    const newAsset: Asset = {
      id: `${type}-${currentPersonIndex}-${Date.now()}`,
      category,
      label,
      value,
      expected_apy: getDefaultReturnRate(category)
    };

    setPensionAssets(prev => {
      // Ta bort tidigare pension av samma typ för denna person om den finns
      const filtered = prev.filter(a => {
        // Behåll bara pensionsassets som INTE tillhör denna person eller som är av annan typ
        const isThisPerson = a.label.includes(personLabel);
        const isSameType = a.category === category;
        return !(isThisPerson && isSameType);
      });
      return [...filtered, newAsset];
    });
  };

  const handleNextSubStep = () => {
    switch (currentSubStep) {
      case 'intro':
        setCurrentSubStep('inkomstpension');
        break;
      case 'inkomstpension':
        if (inkomstpensionValue !== '' && inkomstpensionValue > 0) {
          handleAddPension('inkomstpension', inkomstpensionValue);
        }
        setCurrentSubStep('premiepension');
        break;
      case 'premiepension':
        if (premiepensionValue !== '' && premiepensionValue > 0) {
          handleAddPension('premiepension', premiepensionValue);
        }
        setCurrentSubStep('tjanstepension');
        break;
      case 'tjanstepension':
        if (tjanstepensionValue !== '' && tjanstepensionValue > 0) {
          handleAddPension('tjanstepension', tjanstepensionValue);
        }
        setCurrentSubStep('ips');
        break;
      case 'ips':
        if (ipsValue !== '' && ipsValue > 0) {
          handleAddPension('ips', ipsValue);
        }
        setCurrentSubStep('summary');
        break;
      case 'summary':
        // Samla alla pensionsassets för denna person
        const currentPersonAssets = pensionAssets.filter(a => 
          a.label.includes(currentPerson.name || `Person ${currentPersonIndex + 1}`)
        );
        onComplete(currentPersonAssets);
        break;
    }
  };

  const handleBackSubStep = () => {
    switch (currentSubStep) {
      case 'inkomstpension':
        setCurrentSubStep('intro');
        break;
      case 'premiepension':
        setCurrentSubStep('inkomstpension');
        break;
      case 'tjanstepension':
        setCurrentSubStep('premiepension');
        break;
      case 'ips':
        setCurrentSubStep('tjanstepension');
        break;
      case 'summary':
        setCurrentSubStep('ips');
        break;
      default:
        onBack();
    }
  };

  const getSubStepTitle = () => {
    switch (currentSubStep) {
      case 'intro': return 'Pensionstillgångar';
      case 'inkomstpension': return 'Inkomstpension (Statlig)';
      case 'premiepension': return 'Premiepension';
      case 'tjanstepension': return 'Tjänstepension';
      case 'ips': return 'IPS (Privat pensionssparande)';
      case 'summary': return 'Sammanfattning';
      default: return '';
    }
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <PiggyBank className="w-8 h-8 text-blue-700" />
        </div>
        <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
          Hitta din pension på minpension.se
        </h3>
        <p className="text-sm md:text-base text-primary/70 mb-6">
          Nu tar vi det du redan har tjänat in. Vi guidar dig genom att hitta alla delar av din pension.
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 md:p-6">
          <h4 className="font-medium text-blue-900 mb-3">Vad behöver du?</h4>
          <ul className="text-sm md:text-base text-blue-800 space-y-2">
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>BankID för att logga in på minpension.se</span>
            </li>
            <li className="flex items-center gap-2">
              <span>•</span>
              <span>10-15 minuter för att hitta alla pensionsdelar</span>
            </li>
            <li className="flex items-center gap-2">
              <span>•</span>
              <span>Dina pensionsvärden från olika källor</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="default"
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          onClick={() => window.open('https://minpension.se', '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
          Öppna minpension.se
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary mb-2">💡 Varför pensionen är viktig</p>
              <p className="text-sm text-primary/80 mb-2">
                I genomsnitt ligger en stor del av svenskarnas förmögenhet i pensionssystemet.
              </p>
              <p className="text-sm text-primary/80 mb-2">
                Därför blir bilden skev om man bara tittar på sparkontot.
              </p>
              <p className="text-sm text-primary/80">
                När vi lägger ihop allt – precis som i The Wealth Ladder – får du se din verkliga nivå.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button onClick={handleNextSubStep} className="w-full sm:w-auto">
          Börja med inkomstpension
        </Button>
      </div>
    </div>
  );

  const renderPensionInput = (
    type: 'inkomstpension' | 'premiepension' | 'tjanstepension' | 'ips',
    value: number | '',
    setValue: (val: number | '') => void,
    title: string,
    description: string,
    whereToFind: string,
    insight: string
  ) => {
    const existingAsset = pensionAssets.find(a => 
      a.label.includes(currentPerson.name || `Person ${currentPersonIndex + 1}`) &&
      ((type === 'inkomstpension' && a.category === 'Trygghetsbaserad pension (Statlig)') ||
       (type === 'premiepension' && a.category === 'Premiepension') ||
       (type === 'tjanstepension' && a.category === 'Tjänstepension') ||
       (type === 'ips' && a.category === 'Privat pensionssparande (IPS)'))
    );
    const displayValue = existingAsset ? existingAsset.value : (value !== '' ? value : '');

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary mb-2">{title}</p>
              <p className="text-sm text-primary/80 mb-3">{description}</p>
            </div>
          </div>
          
          <div className="bg-white/60 p-3 rounded border border-blue-200/50">
            <p className="text-xs font-medium text-primary/90 mb-2">Var hittar jag detta?</p>
            <p className="text-xs text-primary/70 mb-2">{whereToFind}</p>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 mt-2"
              onClick={() => window.open('https://minpension.se', '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
              Öppna minpension.se
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`pension-${type}`}>
            Belopp (kr)
          </Label>
          <Input
            id={`pension-${type}`}
            type="number"
            value={displayValue}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseFloat(e.target.value);
              setValue(val);
            }}
            placeholder="0"
            className="text-lg"
          />
          {displayValue !== '' && displayValue > 0 && (
            <p className="text-sm text-primary/70">
              {formatCurrency(displayValue as number)}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={handleBackSubStep} className="flex-1 sm:flex-initial">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          <Button onClick={handleNextSubStep} className="flex-1 sm:flex-initial">
            {type === 'ips' ? 'Visa sammanfattning' : 'Nästa'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const totalPension = pensionAssets
      .filter(a => a.label.includes(currentPerson.name || `Person ${currentPersonIndex + 1}`))
      .reduce((sum, a) => sum + a.value, 0);

    return (
      <div className="space-y-4">
        <div className="bg-success/10 p-4 rounded-lg border border-success/30">
          <p className="font-medium text-primary mb-3">
            ✅ Pensionstillgångar för {currentPerson.name || `Person ${currentPersonIndex + 1}`}
          </p>
          <div className="space-y-2">
            {pensionAssets
              .filter(a => a.label.includes(currentPerson.name || `Person ${currentPersonIndex + 1}`))
              .map(asset => (
                <div key={asset.id} className="flex justify-between items-center text-sm">
                  <span className="text-primary/80">{asset.label.split(' - ')[0]}</span>
                  <span className="font-medium text-primary">{formatCurrency(asset.value)}</span>
                </div>
              ))}
            <div className="pt-2 border-t border-success/30 flex justify-between items-center">
              <span className="font-medium text-primary">Totalt</span>
              <span className="font-semibold text-primary text-lg">{formatCurrency(totalPension)}</span>
            </div>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-primary/80">
              💡 Nu kan vi räkna in din dolda förmögenhet.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={handleBackSubStep} className="flex-1 sm:flex-initial">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          {hasMorePersons && onNextPerson ? (
            <Button onClick={() => {
              onComplete(pensionAssets);
              onNextPerson();
            }} className="flex-1 sm:flex-initial">
              Nästa person
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => onComplete(pensionAssets)} className="flex-1 sm:flex-initial">
              Klar
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-primary/70 mb-1">
          Du fyller i: <strong className="text-primary">{currentPerson.name || `Person ${currentPersonIndex + 1}`}</strong>
        </p>
        <h3 className="text-xl font-serif text-primary">{getSubStepTitle()}</h3>
      </div>

      {currentSubStep === 'intro' && renderIntro()}
      {currentSubStep === 'inkomstpension' && renderPensionInput(
        'inkomstpension',
        inkomstpensionValue,
        setInkomstpensionValue,
        'Inkomstpension (Statlig)',
        'Detta är din statliga del – alla som jobbat har den.',
        'På minpension.se under "Allmän pension" → "Inkomstpension"',
        'Detta är din statliga del – alla som jobbat har den.'
      )}
      {currentSubStep === 'premiepension' && renderPensionInput(
        'premiepension',
        premiepensionValue,
        setPremiepensionValue,
        'Premiepension',
        'Detta är den marknadsbaserade delen som kan växa mest.',
        'På minpension.se under "Allmän pension" → "Premiepension"',
        'Detta är den marknadsbaserade delen som kan växa mest.'
      )}
      {currentSubStep === 'tjanstepension' && renderPensionInput(
        'tjanstepension',
        tjanstepensionValue,
        setTjanstepensionValue,
        'Tjänstepension',
        'Din tjänstepension från arbetsgivaren via pensionsbolag.',
        'På minpension.se under "Tjänstepension" eller "Privat pension"',
        'Din tjänstepension från arbetsgivaren via pensionsbolag.'
      )}
      {currentSubStep === 'ips' && renderPensionInput(
        'ips',
        ipsValue,
        setIpsValue,
        'IPS (Privat pensionssparande)',
        'Din privata IPS-pension som du själv betalar in till.',
        'På minpension.se under "IPS" eller på din banks webbplats',
        'Din privata IPS-pension som du själv betalar in till.'
      )}
      {currentSubStep === 'summary' && renderSummary()}
    </div>
  );
}

