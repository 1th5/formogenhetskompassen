'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, CheckCircle, Info, PiggyBank, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getDefaultReturnRate } from '@/lib/types';

interface PensionHelpWizardProps {
  onAddPension: (pensionData: { label: string; value: number; expected_apy: number; category: 'Trygghetsbaserad pension (Statlig)' | 'Marknadsbaserad pension' }) => void;
  onSkip: () => void;
  open: boolean;
}

type PensionType = 'inkomstpension' | 'premiepension' | 'tjanstepension' | 'ips' | null;

export default function PensionHelpWizard({ onAddPension, onSkip, open }: PensionHelpWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedPensionType, setSelectedPensionType] = useState<PensionType>(null);
  const [pensionValue, setPensionValue] = useState<number | ''>('');
  const [pensionLabel, setPensionLabel] = useState('');

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    if (pensionValue !== '' && pensionValue > 0 && selectedPensionType) {
      let category: 'Trygghetsbaserad pension (Statlig)' | 'Marknadsbaserad pension';
      let defaultLabel = '';
      
      if (selectedPensionType === 'inkomstpension') {
        category = 'Trygghetsbaserad pension (Statlig)';
        defaultLabel = 'Inkomstpension (Statlig)';
      } else {
        category = 'Marknadsbaserad pension';
        if (selectedPensionType === 'premiepension') {
          defaultLabel = 'Premiepension';
        } else if (selectedPensionType === 'tjanstepension') {
          defaultLabel = 'Tjänstepension';
        } else {
          defaultLabel = 'IPS (Individuellt pensionssparande)';
        }
      }
      
      onAddPension({
        label: pensionLabel || defaultLabel,
        value: pensionValue as number,
        expected_apy: getDefaultReturnRate(category),
        category
      });
      // Reset state
      setStep(1);
      setSelectedPensionType(null);
      setPensionValue('');
      setPensionLabel('');
    }
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
          category: 'Marknadsbaserad pension' as const,
          where: 'Under "Allmän pension" → "Premiepension"',
          expectedReturn: '6% per år (marknadsbaserad avkastning)'
        };
      case 'tjanstepension':
        return {
          title: 'Tjänstepension',
          description: 'Din tjänstepension från arbetsgivaren via pensionsbolag (t.ex. ITP, SAF-LO, etc). Denna är marknadsbaserad och investeras mot börsen.',
          category: 'Marknadsbaserad pension' as const,
          where: 'Under "Tjänstepension" eller "Privat pension"',
          expectedReturn: '6% per år (marknadsbaserad avkastning)'
        };
      case 'ips':
        return {
          title: 'IPS (Individuellt pensionssparande)',
          description: 'Din privata IPS-pension som du själv betalar in till. Denna är marknadsbaserad och kan investeras mot börsen.',
          category: 'Marknadsbaserad pension' as const,
          where: 'På minpension.se under "IPS" eller på din banks webbplats',
          expectedReturn: '6% per år (marknadsbaserad avkastning)'
        };
      default:
        return null;
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 text-blue-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-primary mb-2">Hitta din pension på minpension.se</h3>
              <p className="text-sm sm:text-base text-primary/70 px-2">
                Vi hjälper dig att hitta din aktuella pension och lägga till den i systemet. Det finns olika typer som behöver registreras separat.
              </p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Vad behöver du?</h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>BankID för att logga in på minpension.se</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>10-15 minuter för att hitta alla pensionsdelar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Dina pensionsvärden från olika källor</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
                    <Info className="w-5 h-5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-purple-900 mb-3 text-sm sm:text-base">Olika typer av pension</h4>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ExternalLink className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-primary mb-2">Gå till minpension.se</h3>
              <p className="text-sm sm:text-base text-primary/70 px-2">
                Öppna en ny flik och gå till minpension.se för att logga in.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Button
                  variant="default"
                  className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  onClick={() => window.open('https://minpension.se', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Öppna minpension.se
                </Button>
              </div>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <h4 className="font-semibold text-green-900 mb-3 text-sm sm:text-base">Steg för steg:</h4>
                  <ol className="text-sm text-green-800 space-y-3">
                    <li className="flex items-start gap-3">
                      <Badge variant="secondary" className="w-7 h-7 p-0 flex items-center justify-center text-xs font-semibold bg-white border-green-300 text-green-700 flex-shrink-0 mt-0.5">1</Badge>
                      <span className="pt-0.5">Klicka på "Logga in"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="secondary" className="w-7 h-7 p-0 flex items-center justify-center text-xs font-semibold bg-white border-green-300 text-green-700 flex-shrink-0 mt-0.5">2</Badge>
                      <span className="pt-0.5">Välj "Logga in med BankID"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="secondary" className="w-7 h-7 p-0 flex items-center justify-center text-xs font-semibold bg-white border-green-300 text-green-700 flex-shrink-0 mt-0.5">3</Badge>
                      <span className="pt-0.5">Följ instruktionerna för BankID</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-primary mb-2">Välj vilken pensionsdel du vill lägga till</h3>
              <p className="text-sm sm:text-base text-primary/70 px-2">
                Välj vilken typ av pension du har hittat på minpension.se.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPensionType === 'inkomstpension'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPensionType('inkomstpension')}
              >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Building2 className="w-5 h-5 text-blue-700" />
                      </div>
                    <div>
                      <h4 className="font-medium text-primary mb-1 text-sm sm:text-base">Inkomstpension</h4>
                      <p className="text-xs sm:text-sm text-primary/70">Statlig, trygghetsbaserad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPensionType === 'premiepension'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPensionType('premiepension')}
              >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <PiggyBank className="w-5 h-5 text-green-700" />
                      </div>
                    <div>
                      <h4 className="font-medium text-primary mb-1 text-sm sm:text-base">Premiepension</h4>
                      <p className="text-xs sm:text-sm text-primary/70">Marknadsbaserad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPensionType === 'tjanstepension'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPensionType('tjanstepension')}
              >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <PiggyBank className="w-5 h-5 text-purple-700" />
                      </div>
                    <div>
                      <h4 className="font-medium text-primary mb-1 text-sm sm:text-base">Tjänstepension</h4>
                      <p className="text-xs sm:text-sm text-primary/70">Marknadsbaserad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPensionType === 'ips'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPensionType('ips')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <PiggyBank className="w-5 h-5 text-orange-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primary mb-1 text-sm sm:text-base">IPS</h4>
                      <p className="text-xs sm:text-sm text-primary/70">Individuellt pensionssparande</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedPensionType && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  {(() => {
                    const info = getPensionTypeInfo(selectedPensionType);
                    if (!info) return null;
                    return (
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">{info.title}</h4>
                        <p className="text-sm text-blue-800 mb-2">{info.description}</p>
                        <p className="text-sm text-blue-700"><strong>Var hittar jag det:</strong> {info.where}</p>
                        {selectedPensionType === 'ips' && (
                          <p className="text-xs text-blue-600 mt-2 italic">Om du inte hittar IPS på minpension.se, kolla på din banks webbplats istället.</p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 text-orange-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-primary mb-2">Lägg till din pension</h3>
              <p className="text-sm sm:text-base text-primary/70 px-2">
                Ange det pensionsvärde du hittade på minpension.se.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {selectedPensionType && (() => {
                const info = getPensionTypeInfo(selectedPensionType);
                if (!info) return null;
                return (
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-sm">
                    <CardContent className="p-4 sm:p-5">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Du lägger till: {info.title}</h4>
                      <p className="text-xs sm:text-sm text-purple-700">Förväntad avkastning: {info.expectedReturn}</p>
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="space-y-2">
                <Label htmlFor="pension-label" className="text-sm sm:text-base">
                  Beskrivning av pensionen (valfritt)
                </Label>
                <Input
                  id="pension-label"
                  type="text"
                  value={pensionLabel}
                  onChange={(e) => setPensionLabel(e.target.value)}
                  className="w-full bg-white"
                  placeholder={selectedPensionType ? getPensionTypeInfo(selectedPensionType)?.title : "Min pension"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pension-value" className="text-sm sm:text-base">
                  Total pensionsvärde (kr)
                </Label>
                <Input
                  id="pension-value"
                  type="number"
                  value={pensionValue}
                  onChange={(e) => setPensionValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white"
                  placeholder="500000"
                />
                <p className="text-xs sm:text-sm text-primary/60">
                  Ange värdet från minpension.se
                </p>
              </div>

              {pensionValue !== '' && pensionValue > 0 && selectedPensionType && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white border-2 border-green-300">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-green-900 text-sm sm:text-base">
                          Din pension: {formatCurrency(pensionValue as number)}
                        </span>
                        <p className="text-xs sm:text-sm text-green-700 mt-1">
                          Denna tillgång kommer att läggas till i ditt hushåll
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[720px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-4 sm:p-5 border-b border-primary/10">
          <DialogHeader className="gap-2">
            <DialogTitle className="flex items-center gap-3 font-serif text-primary text-lg sm:text-xl">
              <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm">
                <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              Hitta din pension
            </DialogTitle>
            <DialogDescription className="text-primary/70 text-sm sm:text-base">
              Vi hjälper dig att hitta din pension på minpension.se och lägga till den i systemet
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-primary/60 mb-1">
              <span>Steg {step} av {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="w-full h-2" />
          </div>

          {getStepContent()}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-primary/10">
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            {step > 1 && (
              <Button 
                variant="secondary" 
                onClick={handleBack}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka
              </Button>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            {step < totalSteps && (
              <Button 
                onClick={handleNext}
                disabled={step === 3 && !selectedPensionType}
                className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Nästa
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {step === totalSteps && (
              <Button 
                onClick={handleFinish} 
                disabled={pensionValue === '' || pensionValue <= 0 || !selectedPensionType}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Lägg till pension
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
