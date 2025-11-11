'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, Building2, Briefcase, Settings, Sparkles, CheckCircle2, X } from 'lucide-react';
import { PensionType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';

interface PensionWizardProps {
  birthYear: number;
  monthlyIncome: number;
  onSelectPension: (pensionType: PensionType) => void;
  onSkip: () => void;
  open: boolean;
}

interface WizardStep {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    description?: string;
    pensionType?: PensionType;
    icon?: React.ReactNode;
    gradient?: string;
    color?: string;
  }[];
}

export default function PensionWizard({ birthYear, monthlyIncome, onSelectPension, onSkip, open }: PensionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const age = new Date().getFullYear() - birthYear;

  // Återställ wizard när den öppnas
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setAnswers({});
      setSelectedOption(null);
    }
  }, [open]);

  const steps: WizardStep[] = [
    {
      id: 'sector',
      question: 'Vilken typ av arbetsgivare har du?',
      options: [
        {
          id: 'private',
          label: 'Privat företag',
          description: 'T.ex. Volvo, IKEA, Spotify, startup',
          icon: <Building2 className="w-5 h-5" />,
          gradient: 'from-blue-50 to-indigo-50',
          color: 'blue'
        },
        {
          id: 'municipal',
          label: 'Kommun eller region',
          description: 'T.ex. Göteborgs stad, Region Stockholm',
          icon: <Building2 className="w-5 h-5" />,
          gradient: 'from-emerald-50 to-teal-50',
          color: 'emerald'
        },
        {
          id: 'state',
          label: 'Statlig myndighet',
          description: 'T.ex. Skatteverket, Försäkringskassan',
          icon: <Building2 className="w-5 h-5" />,
          gradient: 'from-purple-50 to-violet-50',
          color: 'purple'
        }
      ]
    },
    {
      id: 'position',
      question: 'Vad för typ av anställning har du?',
      options: [
        {
          id: 'white_collar',
          label: 'Tjänsteman',
          description: 'Kontorsarbete, chef, specialist, ingenjör',
          icon: <Briefcase className="w-5 h-5" />,
          gradient: 'from-amber-50 to-orange-50',
          color: 'amber'
        },
        {
          id: 'blue_collar',
          label: 'Arbetare',
          description: 'Produktion, lager, service, vård',
          icon: <Briefcase className="w-5 h-5" />,
          gradient: 'from-slate-50 to-gray-50',
          color: 'slate'
        }
      ]
    },
    {
      id: 'custom_agreement',
      question: 'Vill du använda standardavtalet eller ange ditt eget?',
      options: [
        {
          id: 'standard',
          label: 'Använd standardavtalet',
          description: 'Vi rekommenderar det bästa avtalet för din situation',
          icon: <Sparkles className="w-5 h-5" />,
          gradient: 'from-green-50 to-emerald-50',
          color: 'green'
        },
        {
          id: 'custom',
          label: 'Ange mitt eget avtal',
          description: 'Jag vet vilket avtal jag har eller vill ange det manuellt',
          icon: <Settings className="w-5 h-5" />,
          gradient: 'from-slate-50 to-gray-50',
          color: 'slate'
        }
      ]
    }
  ];

  const handleAnswer = (stepId: string, answerId: string) => {
    setSelectedOption(answerId);
    const newAnswers = { ...answers, [stepId]: answerId };
    setAnswers(newAnswers);

    // Om vi har svarat på alla steg, bestäm pensionsavtal
    if (currentStep === steps.length - 1) {
      const pensionType = determinePensionType(newAnswers, age);
      onSelectPension(pensionType);
    } else {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
      }, 300);
    }
  };

  const determinePensionType = (answers: Record<string, string>, age: number): PensionType => {
    const sector = answers.sector;
    const position = answers.position;
    const customAgreement = answers.custom_agreement;

    // Om användaren valde att ange eget avtal
    if (customAgreement === 'custom') {
      return 'Annat';
    }

    // Privat sektor
    if (sector === 'private') {
      if (position === 'white_collar') {
        // Tjänsteman i privat sektor - ITP1 eller ITP2 baserat på ålder
        return age >= 45 ? 'ITP2' : 'ITP1'; // Född 1978- = ITP2, född 1979+ = ITP1
      } else {
        // Arbetare i privat sektor
        return 'SAF-LO';
      }
    }

    // Kommun/region
    if (sector === 'municipal') {
      return 'AKAP-KR';
    }

    // Statlig
    if (sector === 'state') {
      return 'PA16';
    }

    // Fallback
    return 'Annat';
  };

  const getPensionDescription = (pensionType: PensionType): string => {
    switch (pensionType) {
      case 'ITP1':
        return 'ITP1 - Privat sektor (född 1979+)';
      case 'ITP2':
        return 'ITP2 - Privat sektor (född 1978-)';
      case 'SAF-LO':
        return 'SAF-LO - Industri/arbetare';
      case 'AKAP-KR':
        return 'AKAP-KR - Kommun/region';
      case 'PA16':
        return 'PA16 - Statlig anställning';
      default:
        return 'Annat avtal';
    }
  };

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: 'bg-gradient-to-r from-primary to-primary/90',
        border: 'border-primary',
        iconBg: 'bg-white/20',
        iconText: 'text-white',
        text: 'text-white',
        textSecondary: 'text-white/90'
      };
    }
    
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          border: 'border-blue-200/50',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-700',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          border: 'border-emerald-200/50',
          iconBg: 'bg-emerald-100',
          iconText: 'text-emerald-700',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
          border: 'border-purple-200/50',
          iconBg: 'bg-purple-100',
          iconText: 'text-purple-700',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
      case 'amber':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          border: 'border-amber-200/50',
          iconBg: 'bg-amber-100',
          iconText: 'text-amber-700',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
          border: 'border-green-200/50',
          iconBg: 'bg-green-100',
          iconText: 'text-green-700',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
      default:
        return {
          bg: 'bg-white/60 backdrop-blur-sm',
          border: 'border-primary/20',
          iconBg: 'bg-primary/10',
          iconText: 'text-primary',
          text: 'text-primary',
          textSecondary: 'text-primary/70'
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent 
        className="rounded-2xl overflow-hidden bg-white sm:max-w-[640px]"
        style={{
          maxWidth: '95vw',
          width: '95vw',
        }}
      >
        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-4 sm:p-5 border-b border-primary/10">
          <DialogHeader className="gap-2">
            <DialogTitle className="flex items-center gap-3 font-serif text-primary text-lg sm:text-xl">
              <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm">
                <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              Pension Wizard
            </DialogTitle>
            <DialogDescription className="text-primary/70 text-sm sm:text-base">
              Hjälper dig hitta rätt pensionsavtal baserat på din situation
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto overflow-x-hidden">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-primary/60">
              <span>Steg {currentStep + 1} av {steps.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full h-2" />
          </div>

          {/* Current step */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif text-primary">
              {currentStepData.question}
            </h3>
            
            <div className="space-y-3">
              {currentStepData.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const colors = getColorClasses(option.color || 'default', isSelected);
                
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? `${colors.bg} ${colors.border} shadow-md scale-[1.02]`
                        : `${colors.bg} ${colors.border} hover:shadow-sm hover:scale-[1.01]`
                    }`}
                    onClick={() => handleAnswer(currentStepData.id, option.id)}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${colors.iconBg}`}>
                          <div className={colors.iconText}>
                            {option.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className={`font-semibold text-sm sm:text-base ${colors.text}`}>
                            {option.label}
                          </div>
                          {option.description && (
                            <div className={`text-xs sm:text-sm leading-relaxed ${colors.textSecondary}`}>
                              {option.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${colors.text}`} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* User info */}
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-primary">Din information:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-primary/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">Ålder:</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm bg-white/60 backdrop-blur-sm">
                    {age} år
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">Lön:</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm bg-white/60 backdrop-blur-sm">
                    {formatCurrency(monthlyIncome)}/månad
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-primary/10">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sm text-primary/70 hover:text-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Hoppa över wizard - välj manuellt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
