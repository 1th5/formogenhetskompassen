'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Person, Income, PensionType } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/format';
import { Users, Building2, Briefcase, Settings, Sparkles, CheckCircle2, X, ArrowLeft, ArrowRight, Calendar, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';

interface PersonWizardInlineProps {
  onAddPerson: (person: Person) => void;
  onSkip: () => void;
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

export default function PersonWizardInline({ onAddPerson, onSkip }: PersonWizardInlineProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 30);
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');
  const [pensionType, setPensionType] = useState<PensionType>('ITP1');
  const [customTpRate, setCustomTpRate] = useState<number | ''>('');
  const [customTpAmount, setCustomTpAmount] = useState<number | ''>('');
  const [tpInputType, setTpInputType] = useState<'percentage' | 'amount'>('percentage');
  const [salaryExchange, setSalaryExchange] = useState<number | ''>('');
  const [otherSavings, setOtherSavings] = useState<number | ''>('');
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const age = new Date().getFullYear() - birthYear;
  const totalSteps = 7;
  const progressPercentage = (step / totalSteps) * 100;

  // Pensionsavtalswizard steg
  const pensionSteps: WizardStep[] = [
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

  const handlePensionWizardAnswer = (stepId: string, answerId: string) => {
    setSelectedOption(answerId);
    const newAnswers = { ...wizardAnswers, [stepId]: answerId };
    setWizardAnswers(newAnswers);

    // Om vi har svarat på alla steg, bestäm pensionsavtal
    if (step === 5) {
      const determinedPensionType = determinePensionType(newAnswers, age);
      setPensionType(determinedPensionType);
      setTimeout(() => {
        setStep(6);
        setSelectedOption(null);
      }, 300);
    } else {
      setTimeout(() => {
        setStep(step + 1);
        setSelectedOption(null);
      }, 300);
    }
  };

  const determinePensionType = (answers: Record<string, string>, age: number): PensionType => {
    const sector = answers.sector;
    const position = answers.position;
    const customAgreement = answers.custom_agreement;

    if (customAgreement === 'custom') {
      return 'Annat';
    }

    if (sector === 'private') {
      if (position === 'white_collar') {
        return age >= 45 ? 'ITP2' : 'ITP1';
      } else {
        return 'SAF-LO';
      }
    }

    if (sector === 'municipal') {
      return 'AKAP-KR';
    }

    if (sector === 'state') {
      return 'PA16';
    }

    return 'Annat';
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Skapa person och lägg till
      const person: Person = {
        name,
        birth_year: birthYear,
        incomes: [{
          id: Date.now().toString(),
          label: 'Huvudjobb',
          monthly_income: monthlyIncome === '' ? 0 : monthlyIncome,
          income_type: 'job',
          pension_type: pensionType,
          custom_tp_rate: pensionType === 'Annat' && tpInputType === 'percentage' ? (customTpRate === '' ? undefined : (typeof customTpRate === 'number' ? customTpRate / 100 : undefined)) : undefined,
          custom_tp_amount: pensionType === 'Annat' && tpInputType === 'amount' ? (customTpAmount === '' ? undefined : customTpAmount) : undefined,
          tp_input_type: pensionType === 'Annat' ? tpInputType : undefined,
          salary_exchange_monthly: salaryExchange === '' ? undefined : salaryExchange
        }],
        other_savings_monthly: otherSavings === '' ? 0 : otherSavings
      };
      onAddPerson(person);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setSelectedOption(null);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Grunduppgifter';
      case 2: return 'Huvudjobb';
      case 3: return 'Pensionsavtal - Arbetsgivare';
      case 4: return 'Pensionsavtal - Anställning';
      case 5: return 'Pensionsavtal - Standard eller eget';
      case 6: return 'Pensionsavtal - Anpassning';
      case 7: return 'Övrigt sparande';
      default: return 'Sammanfattning';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Låt oss börja med grunduppgifterna';
      case 2: return 'Berätta om ditt huvudjobb';
      case 3: return 'Vilken typ av arbetsgivare har du?';
      case 4: return 'Vad för typ av anställning har du?';
      case 5: return 'Vill du använda standardavtalet eller ange ditt eget?';
      case 6: return 'Anpassa ditt pensionsavtal';
      case 7: return 'Övrigt sparande per månad';
      default: return 'Kontrollera att allt ser rätt ut';
    }
  };

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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Namn
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="T.ex. Anna Andersson"
                className="text-base"
              />
            </div>
            <div>
              <Label htmlFor="birthYear" className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Födelseår
              </Label>
              <Input
                id="birthYear"
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                min="1920"
                max={new Date().getFullYear() - 16}
                className="text-base"
              />
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs sm:text-sm bg-primary/10 text-primary">
                  Ålder: {age} år
                </Badge>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="monthlyIncome" className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Månadslön (före skatt)
              </Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="30000"
                className="text-base"
              />
              <p className="text-xs sm:text-sm text-primary/60 mt-2">
                Din månadslön före skatt
              </p>
            </div>
          </div>
        );

      case 3:
      case 4:
      case 5:
        const currentPensionStep = pensionSteps[step - 3];
        return (
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif text-primary">
              {currentPensionStep.question}
            </h3>
            <div className="space-y-3">
              {currentPensionStep.options.map((option) => {
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
                    onClick={() => handlePensionWizardAnswer(currentPensionStep.id, option.id)}
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
        );

      case 6:
        return (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-primary">Valt pensionsavtal:</span>
                </div>
                <div className="text-sm sm:text-base text-primary font-medium">
                  {pensionType === 'ITP1' && 'ITP1 - Privat sektor (född 1979+)'}
                  {pensionType === 'ITP2' && 'ITP2 - Privat sektor (född före 1979)'}
                  {pensionType === 'SAF-LO' && 'SAF-LO - Privat sektor (kollektivavtal)'}
                  {pensionType === 'AKAP-KR' && 'AKAP-KR - Kommun/Region'}
                  {pensionType === 'PA16' && 'PA16 - Statlig anställning'}
                  {pensionType === 'Annat' && 'Annat - Eget avtal'}
                </div>
              </CardContent>
            </Card>

            {pensionType === 'Annat' && (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm sm:text-base font-semibold text-primary">Anpassa ditt avtal</h4>
                <div>
                  <Label htmlFor="tpInputType" className="text-sm sm:text-base">Välj hur du vill ange tjänstepension</Label>
                  <Select
                    value={tpInputType}
                    onValueChange={(value: 'percentage' | 'amount') => setTpInputType(value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Procent av lönen</SelectItem>
                      <SelectItem value="amount">Fast belopp per månad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tpInputType === 'percentage' && (
                  <div>
                    <Label htmlFor="customTpRate" className="text-sm sm:text-base">Procent av lönen</Label>
                    <Input
                      id="customTpRate"
                      type="number"
                      value={customTpRate}
                      onChange={(e) => setCustomTpRate(e.target.value === '' ? '' : Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="10"
                      className="mt-2 text-base"
                    />
                    <p className="text-xs sm:text-sm text-primary/60 mt-2">
                      Ange procent (t.ex. 10 för 10%)
                    </p>
                  </div>
                )}

                {tpInputType === 'amount' && (
                  <div>
                    <Label htmlFor="customTpAmount" className="text-sm sm:text-base">Belopp per månad</Label>
                    <Input
                      id="customTpAmount"
                      type="number"
                      value={customTpAmount}
                      onChange={(e) => setCustomTpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      min="0"
                      placeholder="1000"
                      className="mt-2 text-base"
                    />
                    <p className="text-xs sm:text-sm text-primary/60 mt-2">
                      Ange månadsbelopp i kr
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="salaryExchange" className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Löneväxling till pension
              </Label>
              <Input
                id="salaryExchange"
                type="number"
                value={salaryExchange}
                onChange={(e) => setSalaryExchange(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                placeholder="0"
                className="text-base"
              />
              <p className="text-xs sm:text-sm text-primary/60 mt-2">
                Extra pensionsavsättning genom löneväxling (valfritt)
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="otherSavings" className="text-sm sm:text-base font-semibold text-primary mb-2 flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Övrigt sparande per månad (kr)
              </Label>
              <Input
                id="otherSavings"
                type="number"
                value={otherSavings}
                onChange={(e) => setOtherSavings(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                placeholder="5000"
                className="text-base"
              />
              <p className="text-xs sm:text-sm text-primary/60 mt-2">
                ISK, fonder, aktier, sparkonto, privat pensionssparande etc.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-primary mb-4 text-base sm:text-lg">Sammanfattning</h4>
                <div className="space-y-2 text-sm sm:text-base text-primary/80">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Namn:</span>
                    <span>{name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ålder:</span>
                    <span>{age} år</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Månadslön:</span>
                    <span>{formatCurrency(monthlyIncome === '' ? 0 : monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pensionsavtal:</span>
                    <span>{pensionType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Löneväxling:</span>
                    <span>{formatCurrency(salaryExchange === '' ? 0 : salaryExchange)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Övrigt sparande:</span>
                    <span>{formatCurrency(otherSavings === '' ? 0 : otherSavings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim() !== '';
      case 2: return monthlyIncome !== '' && monthlyIncome > 0;
      case 3:
      case 4:
      case 5: return true;
      case 6: return true;
      case 7: return true;
      default: return true;
    }
  };

  return (
    <CardContent className="p-4 sm:p-6">
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-4 sm:p-5 border-b border-primary/10 mb-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-primary text-lg sm:text-xl">Lägg till person i hushållet</h3>
              <p className="text-primary/70 text-sm sm:text-base">
                Vi guidar dig genom att lägga till en person med alla deras inkomster och pensionsavtal
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-primary/70 hover:text-primary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm text-primary/60">
            <span>Steg {step} av {totalSteps}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>

        {/* Step title and description */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-serif text-primary">
            {getStepTitle()}
          </h3>
          <p className="text-sm sm:text-base text-primary/70">
            {getStepDescription()}
          </p>
        </div>

        {/* Step content */}
        {renderStepContent()}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between w-full gap-2 sm:gap-3 pt-6 border-t border-primary/10 mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="text-sm sm:text-base text-primary/70 hover:text-primary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tillbaka</span>
        </Button>
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sm sm:text-base text-primary/70 hover:text-primary"
          >
            Hoppa över
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="text-sm sm:text-base px-4 sm:px-6 flex items-center gap-2"
          >
            {step === totalSteps ? (
              <>
                <span>Lägg till person</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Nästa</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </CardContent>
  );
}

