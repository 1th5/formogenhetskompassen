/**
 * Personer wizard-steg
 * Inline wizard för att lägga till personer med flera inkomster och pensionsavtal
 * Loopar tills man är klar
 */

'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Person, Income, PensionType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { CheckCircle, User, Plus, X } from 'lucide-react';
import { 
  calculatePersonNetIncome, 
  calculateHouseholdNetIncome 
} from '@/lib/wealth/tax-calc';
import { 
  calculatePublicPension, 
  calculateOccupationalPension, 
  calculateExtraPension,
  calculateIncomePension,
  calculatePremiePension
} from '@/lib/wealth/calc';
import { calculateAmortizationMonthly } from '@/lib/wealth/calc';

interface PersonsWizardStepProps {
  onComplete: (persons: Person[]) => void;
  onSkip: () => void;
  liabilities?: any[]; // För att kunna räkna amortering i sammanfattning
}

interface WizardStep {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    description?: string;
  }[];
}

const PENSION_STEPS: WizardStep[] = [
  {
    id: 'sector',
    question: 'Vilken typ av arbetsgivare har du?',
    options: [
      { id: 'private', label: 'Privat företag', description: 'T.ex. Volvo, IKEA, Spotify, startup' },
      { id: 'municipal', label: 'Kommun eller region', description: 'T.ex. Göteborgs stad, Region Stockholm' },
      { id: 'state', label: 'Statlig myndighet', description: 'T.ex. Skatteverket, Försäkringskassan' }
    ]
  },
  {
    id: 'position',
    question: 'Vad för typ av anställning har du?',
    options: [
      { id: 'white_collar', label: 'Tjänsteman', description: 'Kontorsarbete, chef, specialist, ingenjör' },
      { id: 'blue_collar', label: 'Arbetare', description: 'Produktion, lager, service, vård' }
    ]
  },
  {
    id: 'custom_agreement',
    question: 'Vill du använda standardavtalet eller ange ditt eget?',
    options: [
      { id: 'standard', label: 'Använd standardavtalet', description: 'Vi rekommenderar det bästa avtalet för din situation' },
      { id: 'custom', label: 'Ange mitt eget avtal', description: 'Jag vet vilket avtal jag har eller vill ange det manuellt' }
    ]
  }
];

function determinePensionType(answers: Record<string, string>, age: number): PensionType {
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
}

export default function PersonsWizardStep({ onComplete, onSkip, liabilities = [] }: PersonsWizardStepProps) {
  const [step, setStep] = useState<'intro' | 'person-details' | 'income-choice' | 'income-choice-type' | 'income-job' | 'income-other' | 'pension-wizard' | 'pension-custom' | 'salary-exchange' | 'savings'>('intro');
  const [persons, setPersons] = useState<Person[]>([]);
  
  // Current person being created
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 30);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currentIncomeIndex, setCurrentIncomeIndex] = useState<number | null>(null);
  const [incomeLabel, setIncomeLabel] = useState('');
  const [incomeAmount, setIncomeAmount] = useState<number | ''>('');
  const [incomeType, setIncomeType] = useState<'job' | 'other'>('job');
  
  const [pensionType, setPensionType] = useState<PensionType>('ITP1');
  const [pensionAnswers, setPensionAnswers] = useState<Record<string, string>>({});
  const [currentPensionStep, setCurrentPensionStep] = useState(0);
  const [customTpRate, setCustomTpRate] = useState<number | ''>('');
  const [customTpAmount, setCustomTpAmount] = useState<number | ''>('');
  const [tpInputType, setTpInputType] = useState<'percentage' | 'amount'>('percentage');
  const [salaryExchange, setSalaryExchange] = useState<number | ''>('');
  const [ipsMonthly, setIpsMonthly] = useState<number | ''>(0);
  const [otherSavings, setOtherSavings] = useState<number | ''>(0);
  
  const age = new Date().getFullYear() - birthYear;
  
  // Beräkna personsammanfattning för den person som skapas
  const personSummary = useMemo(() => {
    if (name.trim() === '') return null;
    
    // Skapa temporär person för beräkningar
    const tempPerson: Person = {
      id: 'temp',
      name: name.trim(),
      birth_year: birthYear,
      incomes: incomes,
      other_savings_monthly: otherSavings === '' ? 0 : otherSavings,
      ips_monthly: ipsMonthly === '' ? 0 : (ipsMonthly as number)
    };
    
    const personNetIncome = calculatePersonNetIncome(tempPerson);
    const pensionContributions = calculatePublicPension(tempPerson) + calculateOccupationalPension(tempPerson) + calculateExtraPension(tempPerson);
    const ipsAmount = ipsMonthly === '' ? 0 : (ipsMonthly as number);
    const otherSavingsAmount = otherSavings === '' ? 0 : otherSavings;
    const totalSavings = pensionContributions + ipsAmount + otherSavingsAmount;
    
    return {
      personNetIncome,
      pensionContributions,
      ipsAmount,
      otherSavingsAmount,
      totalSavings
    };
  }, [name, birthYear, incomes, otherSavings, ipsMonthly]);
  
  const handlePensionAnswer = (stepId: string, answerId: string, incomeIdx: number) => {
    const newAnswers = { ...pensionAnswers, [stepId]: answerId };
    setPensionAnswers(newAnswers);
    
      if (currentPensionStep === PENSION_STEPS.length - 1) {
      const determinedPensionType = determinePensionType(newAnswers, age);
      setPensionType(determinedPensionType);
      
      if (answerId === 'custom') {
        setStep('pension-custom');
      } else {
        setStep('salary-exchange');
      }
    } else {
      setCurrentPensionStep(currentPensionStep + 1);
    }
  };
  
  const handleAddIncome = () => {
    if (incomeAmount !== '' && incomeAmount > 0) {
      // Använd generiskt namn om inget anges
      const incomeNumber = incomes.length + 1;
      const defaultLabel = incomeType === 'job' ? `Jobb ${incomeNumber}` : `Inkomst ${incomeNumber}`;
      const finalLabel = incomeLabel.trim() || defaultLabel;
      
      const newIncome: Income = {
        id: Date.now().toString(),
        label: finalLabel,
        monthly_income: incomeAmount as number, // Alla inkomster sparas som månadsinkomst
        income_type: incomeType,
        pension_type: incomeType === 'job' ? pensionType : undefined,
        // Spara custom_tp_rate som decimal (0.1 för 10%), precis som expected_apy sparas som decimal (0.07 för 7%)
        // Användaren anger 10 för 10% i formuläret, vi sparar som 0.1 (decimal)
        custom_tp_rate: incomeType === 'job' && pensionType === 'Annat' && tpInputType === 'percentage' ? (customTpRate === '' ? undefined : (typeof customTpRate === 'number' ? customTpRate / 100 : undefined)) : undefined,
        custom_tp_amount: incomeType === 'job' && pensionType === 'Annat' && tpInputType === 'amount' ? (customTpAmount === '' ? undefined : customTpAmount) : undefined,
        tp_input_type: incomeType === 'job' && pensionType === 'Annat' ? tpInputType : undefined,
        salary_exchange_monthly: incomeType === 'job' ? (salaryExchange === '' || salaryExchange === 0 ? undefined : salaryExchange) : undefined
      };
      
      if (currentIncomeIndex !== null) {
        const updated = [...incomes];
        updated[currentIncomeIndex] = newIncome;
        setIncomes(updated);
      } else {
        setIncomes([...incomes, newIncome]);
      }
      
      setIncomeLabel('');
      setIncomeAmount('');
      setPensionType('ITP1');
      setPensionAnswers({});
      setCurrentPensionStep(0);
      setCustomTpRate('');
      setCustomTpAmount('');
      setSalaryExchange('');
      setCurrentIncomeIndex(null);
      // Gå alltid tillbaka till income-choice där man kan se listan och fortsätta
      setStep('income-choice');
    }
  };
  
  const handleAddPerson = () => {
    // Tillåt att lägga till person även om namnet inte är ifyllt, om det finns inkomster eller övrigt sparande
    if (incomes.length > 0 || otherSavings !== '' || (typeof otherSavings === 'number' && otherSavings === 0)) {
      // Använd generiskt namn om inget anges
      const personNumber = persons.length + 1;
      const finalName = name.trim() || `Person ${personNumber}`;
      
      const person: Person = {
        id: Date.now().toString(),
        name: finalName,
        birth_year: birthYear,
        incomes: incomes,
        other_savings_monthly: otherSavings === '' ? 0 : otherSavings,
        ips_monthly: ipsMonthly === '' ? 0 : (ipsMonthly as number)
      };
      
      setPersons(prev => [...prev, person]);
      
      // Reset
      setName('');
      setBirthYear(new Date().getFullYear() - 30);
      setIncomes([]);
      setIpsMonthly(0);
      setOtherSavings(0);
      setCurrentIncomeIndex(null);
      setStep('intro');
    }
  };
  
  const handleEditIncome = (index: number) => {
    const income = incomes[index];
    setIncomeLabel(income.label);
    setIncomeAmount(income.monthly_income);
    setIncomeType(income.income_type);
    setPensionType(income.pension_type || 'ITP1');
    setSalaryExchange(income.salary_exchange_monthly || '');
    setCurrentIncomeIndex(index);
    setStep(income.income_type === 'job' ? 'income-job' : 'income-other');
  };
  
  const handleRemoveIncome = (index: number) => {
    setIncomes(incomes.filter((_, i) => i !== index));
  };
  
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-blue-700" />
          </div>
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Vem ingår i hushållet?
          </h3>
          <p className="text-sm md:text-base text-primary/70 mb-4">
            Lägg till vuxna i hushållet med inkomst och tillgångar
          </p>
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-primary/80">
                Vi behöver veta vilka vuxna ni är för att kunna räkna pension, ålder vid ekonomisk frihet och rätt nivå i rikedomstrappan. Barn behöver inte läggas till.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {persons.length === 0 && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setStep('person-details')} className="flex-1">
                Lägg till person
              </Button>
            </div>
            <Card className="bg-amber-50 border-amber-200 mt-4">
              <CardContent className="p-4">
                <p className="text-sm text-amber-900">
                  <strong>Viktigt:</strong> Du måste lägga till minst en person för att slutföra onboardingen.
                </p>
              </CardContent>
            </Card>
          </>
        )}
        
        {persons.length > 0 && (() => {
          // Beräkna hushållssammanfattning
          const totalNetIncome = calculateHouseholdNetIncome(persons);
          const totalPensionContributions = persons.reduce((sum, p) => {
            return sum + calculatePublicPension(p) + calculateOccupationalPension(p) + calculateExtraPension(p);
          }, 0);
          const totalOtherSavings = persons.reduce((sum, p) => sum + (p.other_savings_monthly || 0), 0);
          const amortization = calculateAmortizationMonthly(liabilities || []);
          const totalSavings = totalPensionContributions + totalOtherSavings + amortization;
          const estimatedExpenses = Math.max(0, totalNetIncome - totalOtherSavings - amortization);
          
          return (
            <div className="pt-4 border-t">
              <p className="text-sm text-primary/70 mb-3">
                Du har lagt till {persons.length} person{persons.length > 1 ? 'er' : ''}:
              </p>
              <div className="space-y-2 mb-4">
                {persons.map((person, idx) => {
                  // Normalisera person-data: konvertera custom_tp_rate från procent till decimal om det är i procent-format
                  const normalizedPerson: Person = {
                    ...person,
                    incomes: person.incomes?.map(income => {
                      if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate > 1) {
                        return {
                          ...income,
                          custom_tp_rate: income.custom_tp_rate / 100
                        };
                      }
                      return income;
                    }) || []
                  };

                  const personNetIncome = calculatePersonNetIncome(normalizedPerson);
                  const incomePension = calculateIncomePension(normalizedPerson);
                  const premiePension = calculatePremiePension(normalizedPerson);
                  const occupationalPension = calculateOccupationalPension(normalizedPerson);
                  const salaryExchange = calculateExtraPension(normalizedPerson);
                  const ips = normalizedPerson.ips_monthly || 0;
                  const totalPension = incomePension + premiePension + occupationalPension + salaryExchange + ips;
                  
                  return (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">{person.name}</div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Nettoinkomst:</span>
                          <span className="font-medium text-green-600">{formatCurrency(personNetIncome)}/månad</span>
                        </div>
                        <div className="pl-2 space-y-1">
                          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Trygghetsbaserad</div>
                        <div className="flex justify-between pl-2">
                            <span className="text-xs">- Inkomstpension:</span>
                            <span className="font-medium text-xs">{formatCurrency(incomePension)}/månad</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mt-2">Marknadsbaserad</div>
                          <div className="flex justify-between pl-2">
                            <span className="text-xs">- Premiepension:</span>
                            <span className="font-medium text-xs">{formatCurrency(premiePension)}/månad</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-xs">- Tjänstepension:</span>
                          <span className="font-medium text-xs">{formatCurrency(occupationalPension)}/månad</span>
                        </div>
                        {salaryExchange > 0 && (
                          <div className="flex justify-between pl-2">
                            <span className="text-xs">- Löneväxling:</span>
                            <span className="font-medium text-xs">{formatCurrency(salaryExchange)}/månad</span>
                          </div>
                        )}
                          {ips > 0 && (
                            <div className="flex justify-between pl-2">
                              <span className="text-xs">- IPS:</span>
                              <span className="font-medium text-xs">{formatCurrency(ips)}/månad</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between pt-1 border-t border-blue-200">
                          <span className="text-xs">Totalt pensionsavsättningar:</span>
                          <span className="font-medium">{formatCurrency(totalPension)}/månad</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Övrigt sparande och investeringar:</span>
                          <span className="font-medium">{formatCurrency(person.other_savings_monthly || 0)}/månad</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-blue-200">
                          <span className="font-medium">Totalt sparande:</span>
                          <span className="font-medium">{formatCurrency(totalPension + (person.other_savings_monthly || 0))}/månad</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Hushållets totalsummering */}
              <Card className="bg-green-50 border-green-200 mb-4">
                <CardContent className="p-4 md:p-6">
                  <h4 className="font-medium text-green-900 mb-3">Hushållets totalsummering</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <span className="text-green-800 flex-shrink-0">Total nettoinkomst:</span>
                      <div className="flex flex-col sm:items-end">
                        <span className="font-medium text-green-700">
                          {formatCurrency(totalNetIncome)}/månad
                        </span>
                        <p className="text-xs text-green-600 mt-0.5">Uppskattning, kan variera</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-green-800 flex-shrink-0">Pensionsavsättningar:</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(totalPensionContributions)}/månad
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-green-800 flex-shrink-0">Övrigt sparande:</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(totalOtherSavings)}/månad
                      </span>
                    </div>
                    {amortization > 0 && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-green-800 flex-shrink-0">Amortering:</span>
                        <span className="font-medium text-green-700">
                          {formatCurrency(amortization)}/månad
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-2 border-t border-green-300">
                      <span className="font-medium text-green-900 flex-shrink-0">Totalt sparande:</span>
                      <span className="font-bold text-green-900">
                        {formatCurrency(totalSavings)}/månad
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 pt-2 border-t border-green-300">
                      <span className="text-green-800 flex-shrink-0">Uppskattade utgifter:</span>
                      <div className="flex flex-col sm:items-end">
                        <span className="font-medium text-blue-600">
                          {formatCurrency(estimatedExpenses)}/månad
                        </span>
                        <p className="text-xs text-green-600 mt-0.5">
                          Nettoinkomst − sparande − amortering
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setStep('person-details')} variant="secondary" className="flex-1">
                  Lägg till fler personer
                </Button>
                <Button 
                  onClick={() => {
                    if (persons.length === 0) {
                      // Visa varning
                      return;
                    }
                    onComplete(persons);
                  }} 
                  className="flex-1" 
                  disabled={persons.length === 0}
                >
                  Fortsätt till pensionstillgångar →
                </Button>
                {persons.length === 0 && (
                  <p className="text-xs text-primary/60 mt-2 text-center">
                    Du måste lägga till minst en person för att slutföra onboardingen
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
  
  if (step === 'person-details') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Grunduppgifter
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="person-name" className="text-base">Namn (valfritt)</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anna Andersson"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="person-birth-year" className="text-base">Födelsår</Label>
            <Input
              id="person-birth-year"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-primary/60 mt-1">
              Ålder: {age} år
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setStep('intro')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={() => setStep('income-choice')}
            className="flex-1"
          >
            Nästa →
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 'income-choice') {
    // Om det redan finns inkomster, visa bara listan och knappar (inte frågan igen)
    if (incomes.length > 0) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
              Inkomster
            </h3>
          </div>
          
          <div>
            <p className="text-sm text-primary/70 mb-3">
              Du har lagt till {incomes.length} inkomst{incomes.length > 1 ? 'er' : ''}:
            </p>
            <div className="space-y-2 mb-4">
              {incomes.map((income, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-green-900">{income.label}</div>
                    <div className="text-sm text-green-700">
                      {income.income_type === 'job' ? 'Jobb' : 'Övrig'} • {formatCurrency(income.income_type === 'other' ? income.monthly_income : income.monthly_income)}/mån
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditIncome(idx)}
                    >
                      Redigera
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveIncome(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                  // Gå direkt till val av inkomsttyp
                  setStep('income-choice-type');
                }} 
                variant="secondary" 
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Lägg till fler inkomster
              </Button>
              <Button onClick={() => setStep('savings')} className="flex-1">
                Fortsätt till sparande →
              </Button>
            </div>
          </div>
          
          <Button variant="secondary" onClick={() => setStep('person-details')} className="w-full">
            ← Tillbaka
          </Button>
        </div>
      );
    }
    
    // Visa frågan bara när det INTE finns inkomster ännu
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Inkomster
          </h3>
          <p className="text-sm text-primary/70 mb-6">
            Har {name || 'personen'} inkomster?
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => {
              setIncomeType('job');
              setStep('income-job');
            }}
            className="w-full h-auto py-6 text-base"
          >
            Ja, huvudjobb eller annat arbete
          </Button>
          
          <Button
            onClick={() => {
              setIncomeType('other');
              setStep('income-other');
            }}
            variant="secondary"
            className="w-full h-auto py-6 text-base whitespace-normal break-words text-left justify-start"
          >
            <span className="block sm:inline">
              Ja, övrig inkomst
              <span className="block sm:inline sm:ml-1">(t.ex. utdelning, hyresintäkt, bidrag)</span>
            </span>
          </Button>
          
          <Button
            onClick={() => setStep('savings')}
            variant="secondary"
            className="w-full h-auto py-6 text-base"
          >
            Nej, hoppa över inkomster
          </Button>
        </div>
        
        <Button variant="secondary" onClick={() => setStep('person-details')} className="w-full">
          ← Tillbaka
        </Button>
      </div>
    );
  }
  
  // Steg för val av inkomsttyp när man lägger till fler inkomster (utan frågan "Har personen inkomster?")
  if (step === 'income-choice-type') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Lägg till inkomst
          </h3>
          <p className="text-sm text-primary/70 mb-6">
            Vilken typ av inkomst vill du lägga till?
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => {
              setIncomeType('job');
              setStep('income-job');
            }}
            className="w-full h-auto py-6 text-base"
          >
            Huvudjobb eller annat arbete
          </Button>
          
          <Button
            onClick={() => {
              setIncomeType('other');
              setStep('income-other');
            }}
            variant="secondary"
            className="w-full h-auto py-6 text-base whitespace-normal break-words text-left justify-start"
          >
            <span className="block sm:inline">
              Övrig inkomst
              <span className="block sm:inline sm:ml-1">(t.ex. utdelning, hyresintäkt, bidrag)</span>
            </span>
          </Button>
        </div>
        
        <Button variant="secondary" onClick={() => {
          // Gå tillbaka till visning av befintliga inkomster
          setStep('income-choice');
        }} className="w-full">
          ← Tillbaka
        </Button>
      </div>
    );
  }
  
  if (step === 'income-job') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Jobbinkomst
          </h3>
          <p className="text-sm text-primary/70 mb-4">
            Du fyller i: <strong className="text-primary">{name || 'Person'}</strong>
          </p>
        </div>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-primary/80 mb-2">
              <strong>Viktigt:</strong> Ange din bruttolön (före skatt) <strong>efter eventuell löneväxling</strong>. Om du har löneväxling, dra av den från bruttolönen innan du anger beloppet här. Vi räknar automatiskt ut nettoinkomsten och skatten åt dig.
            </p>
            <p className="text-sm text-primary/80">
              Din inkomst styr hur mycket som sätts av till pension. Vi använder svenska nivåer (inkomstpension + premiepension + tjänstepension) för att räkna fram hushållets dolda förmögenhet.
            </p>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="income-label" className="text-base">Beskrivning (valfritt, t.ex. "Huvudjobb", "Deltidsjobb")</Label>
            <Input
              id="income-label"
              value={incomeLabel}
              onChange={(e) => setIncomeLabel(e.target.value)}
              placeholder="Huvudjobb"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="income-amount" className="text-base">Bruttolön (kr/månad, före skatt, efter löneväxling)</Label>
            <Input
              id="income-amount"
              type="number"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="30000"
              className="mt-2"
            />
            <p className="text-xs text-primary/60 mt-1">
              Ange din bruttolön efter eventuell löneväxling (före skatt). Om du har löneväxling, dra av den från bruttolönen. Vi räknar automatiskt ut nettoinkomsten åt dig.
            </p>
          </div>
          
          {incomeAmount !== '' && incomeAmount > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {incomeLabel.trim() || (incomeType === 'job' ? `Jobb ${incomes.length + 1}` : `Inkomst ${incomes.length + 1}`)}: {formatCurrency(incomeAmount as number)}/mån
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setStep('income-choice')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={() => {
              setCurrentPensionStep(0);
              setPensionAnswers({});
              setStep('pension-wizard');
            }}
            disabled={incomeAmount === '' || incomeAmount <= 0}
            className="flex-1"
          >
            Nästa: Pensionsavtal →
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 'income-other') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Övrig inkomst
          </h3>
          <p className="text-sm text-primary/70 mb-6">
            Övrig inkomst är redan efter skatt och anges som månadsbelopp
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="income-label-other" className="text-base">Beskrivning (valfritt, t.ex. "Hyresintäkt", "Bidrag")</Label>
            <Input
              id="income-label-other"
              value={incomeLabel}
              onChange={(e) => setIncomeLabel(e.target.value)}
              placeholder="Hyresintäkt"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="income-amount-other" className="text-base">Månadsinkomst (kr, efter skatt)</Label>
            <Input
              id="income-amount-other"
              type="number"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="10000"
              className="mt-2"
            />
          </div>
          
          {incomeAmount !== '' && incomeAmount > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {incomeLabel.trim() || (incomeType === 'job' ? `Jobb ${incomes.length + 1}` : `Inkomst ${incomes.length + 1}`)}: {formatCurrency(incomeAmount as number)}/mån
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setStep('income-choice')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={() => {
              handleAddIncome();
            }}
            disabled={incomeAmount === '' || incomeAmount <= 0}
            className="flex-1"
          >
            Lägg till inkomst
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 'pension-wizard') {
    const currentStepData = PENSION_STEPS[currentPensionStep];
    const incomeIdx = currentIncomeIndex !== null ? currentIncomeIndex : incomes.length;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            {currentStepData.question}
          </h3>
          <p className="text-xs text-primary/60 mt-1">
            Steg {currentPensionStep + 1} av {PENSION_STEPS.length}
          </p>
        </div>
        
        <div className="space-y-3">
          {currentStepData.options.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer border hover:border-primary/50 transition-all"
              onClick={() => handlePensionAnswer(currentStepData.id, option.id, incomeIdx)}
            >
              <CardContent className="p-4 md:p-6">
                <h4 className="font-medium text-primary mb-1">{option.label}</h4>
                {option.description && (
                  <p className="text-sm text-primary/70">{option.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Button variant="secondary" onClick={() => {
          if (currentPensionStep > 0) {
            setCurrentPensionStep(currentPensionStep - 1);
            const keys = Object.keys(pensionAnswers);
            const newAnswers = { ...pensionAnswers };
            delete newAnswers[keys[keys.length - 1]];
            setPensionAnswers(newAnswers);
          } else {
            setStep('income-job');
          }
        }} className="w-full">
          ← Tillbaka
        </Button>
      </div>
    );
  }
  
  if (step === 'pension-custom') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Anpassa pensionsavtal
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base">Hur vill du ange pensionsavtalet?</Label>
            <div className="flex gap-3 mt-2">
              <Button
                variant={tpInputType === 'percentage' ? 'default' : 'secondary'}
                onClick={() => setTpInputType('percentage')}
                className="flex-1"
              >
                Procent (%)
              </Button>
              <Button
                variant={tpInputType === 'amount' ? 'default' : 'secondary'}
                onClick={() => setTpInputType('amount')}
                className="flex-1"
              >
                Belopp (kr/mån)
              </Button>
            </div>
          </div>
          
          {tpInputType === 'percentage' ? (
            <div>
              <Label htmlFor="tp-rate" className="text-base">Tjänstepension i % av lön</Label>
              <Input
                id="tp-rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={customTpRate}
                onChange={(e) => setCustomTpRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="4.5"
                className="mt-2"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="tp-amount" className="text-base">Tjänstepension i kr/månad</Label>
              <Input
                id="tp-amount"
                type="number"
                value={customTpAmount}
                onChange={(e) => setCustomTpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2500"
                className="mt-2"
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => setStep('pension-wizard')} className="flex-1">
            ← Tillbaka
          </Button>
          <Button 
            onClick={() => setStep('salary-exchange')}
            className="flex-1"
          >
            Nästa →
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 'salary-exchange') {
    const incomeIdx = currentIncomeIndex !== null ? currentIncomeIndex : incomes.length;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Löneväxling
          </h3>
          <p className="text-sm text-primary/70 mb-6">
            Om du har löneväxling, ange den här. <strong>OBS:</strong> Bruttolönen du angav tidigare ska vara efter löneväxling (dvs. redan dragen av).
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="salary-exchange" className="text-base">Löneväxling till pension (kr/månad, valfritt)</Label>
            <Input
              id="salary-exchange"
              type="number"
              value={salaryExchange === '' ? '' : salaryExchange}
              onChange={(e) => {
                const val = e.target.value;
                setSalaryExchange(val === '' ? '' : Number(val));
              }}
              placeholder="0"
              className="mt-2"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              if (pensionType === 'Annat') {
                setStep('pension-custom');
              } else {
                setStep('pension-wizard');
              }
            }} 
            className="flex-1"
          >
            ← Tillbaka
          </Button>
          <Button 
            onClick={() => {
              handleAddIncome();
            }}
            className="flex-1"
          >
            Lägg till inkomst
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 'savings') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif text-primary mb-2">
            Sparande
          </h3>
          <p className="text-sm text-primary/70 mb-6">
            Ange hur mycket {name || 'personen'} sparar per månad
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ips-monthly" className="text-base">IPS-sparande (kr/månad, valfritt)</Label>
            <Input
              id="ips-monthly"
              type="number"
              value={ipsMonthly === '' ? '' : ipsMonthly}
              onChange={(e) => {
                const val = e.target.value;
                setIpsMonthly(val === '' ? '' : Number(val));
              }}
              placeholder="0"
              className="mt-2"
            />
            <p className="text-xs text-primary/60 mt-1">
              Individuellt pensionssparande. Från 2024 finns det ingen skattelättnad för IPS, men om du redan har det kan du ange det här.
            </p>
          </div>

          <div>
            <Label htmlFor="other-savings" className="text-base">Övrigt sparande och investeringar (kr/månad)</Label>
            <Input
              id="other-savings"
              type="number"
              value={otherSavings}
              onChange={(e) => setOtherSavings(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="5000"
              className="mt-2"
            />
            <p className="text-xs text-primary/60 mt-1">
              Allt som du lägger på ekonomiska investeringar: ISK, AF, KF, fonder, aktier, ETF:er, obligationer, räntefonder, sparkonto, kapitalförsäkring, fastigheter, crypto m.m.
            </p>
          </div>
          
          {/* Personsammanfattning */}
          {personSummary && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 md:p-6 space-y-3">
                <h4 className="font-medium text-blue-900 mb-3">Sammanfattning för {name || 'personen'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-blue-800 flex-shrink-0">Nettoinkomst:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(personSummary.personNetIncome)}/mån</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-blue-800 flex-shrink-0">Pensionsavsättningar:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(personSummary.pensionContributions)}/mån</span>
                  </div>
                  {personSummary.ipsAmount > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-blue-800 flex-shrink-0">IPS-sparande:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(personSummary.ipsAmount)}/mån</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-blue-800 flex-shrink-0">Övrigt sparande:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(personSummary.otherSavingsAmount)}/mån</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-2 border-t border-blue-300">
                    <span className="font-medium text-blue-900 flex-shrink-0">Totalt sparande:</span>
                    <span className="font-bold text-blue-900">{formatCurrency(personSummary.totalSavings)}/mån</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              if (incomes.length > 0) {
                setStep('income-choice');
              } else {
                setStep('income-choice-type');
              }
            }}
            className="flex-1"
          >
            ← Tillbaka
          </Button>
          <Button 
            onClick={handleAddPerson}
            disabled={incomes.length === 0 && otherSavings === '' && ipsMonthly === ''}
            className="flex-1"
          >
            Lägg till person
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}
