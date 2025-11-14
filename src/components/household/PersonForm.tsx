/**
 * Formulär för redigering av personer
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Person, Income, PensionType } from '@/lib/types';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { calculatePublicPension, calculateOccupationalPension, calculateExtraPension, calculateTotalIncome, calculateJobIncome, calculateOtherIncome, calculateAmortizationMonthly, calculateIncomePension, calculatePremiePension } from '@/lib/wealth/calc';
import { calculatePersonNetIncome, calculateHouseholdNetIncome } from '@/lib/wealth/tax-calc';
import { formatCurrency } from '@/lib/utils/format';
import PensionPreview from '@/components/ui/PensionPreview';
import PersonWizardInline from '@/components/household/PersonWizardInline';
import PensionWizardInline from '@/components/household/PensionWizardInline';

const incomeSchema = z.object({
  label: z.string().min(1, 'Beskrivning krävs'),
  monthly_income: z.number().min(0, 'Inkomst kan inte vara negativ'),
  income_type: z.enum(['job', 'other']),
  pension_type: z.enum(['ITP1', 'ITP2', 'SAF-LO', 'AKAP-KR', 'PA16', 'Annat'] as const).optional(),
  custom_tp_rate: z.number().min(0).max(100).optional(), // Acceptera procent (0-100) som konverteras till decimal i onSubmit
  custom_tp_amount: z.number().min(0).optional(),
  tp_input_type: z.enum(['percentage', 'amount']).optional(),
  salary_exchange_monthly: z.number().min(0).optional(),
});

const personSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  birth_year: z.number()
    .min(1920, 'Födelseår måste vara efter 1920')
    .max(2008, 'Minst 16 år')
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      return age <= 64;
    }, {
      message: 'Appen är anpassad för personer som inte aktivt har pension. Beräkningar och funktioner är designade för personer som vill veta mer om sin framtida pension. Personen får inte vara över 64 år.'
    }),
  incomes: z.array(incomeSchema).min(1, 'Minst en inkomst krävs'),
  other_savings_monthly: z.number().min(0, 'Sparande kan inte vara negativt'),
  ips_monthly: z.number().min(0, 'IPS kan inte vara negativt').optional()
});

const formSchema = z.object({
  persons: z.array(personSchema).min(1, 'Minst en person krävs')
});

interface PersonFormProps {
  onSave: (data: any) => void;
}

export default function PersonForm({ onSave }: PersonFormProps) {
  const { draftHousehold, updatePersons } = useHouseholdStore();
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [showPersonWizard, setShowPersonWizard] = useState(false);
  const [collapsedPersons, setCollapsedPersons] = useState<Record<number, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWizard, setShowWizard] = useState<{personIndex: number, incomeIndex: number} | null>(null);
  const personWizardRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit, watch, setValue, reset, trigger, getValues, formState: { errors } } = useForm<{
    persons: Person[];
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      persons: []
    }
  });
  
  // Ladda data när komponenten mountas eller när draftHousehold ändras
  // Konvertera custom_tp_rate från decimal (sparat format) till procent (visningsformat)
  // Detta är EXAKT samma mönster som expected_apy -> expected_apy_percent i AssetsForm
  useEffect(() => {
    if (draftHousehold?.persons && Array.isArray(draftHousehold.persons)) {
      reset({
        persons: draftHousehold.persons.map((person: Person) => ({
          ...person,
          incomes: (person.incomes || []).map((income: Income) => {
            // Om tp_input_type är 'percentage' och custom_tp_rate finns, konvertera från decimal till procent för visning
            // Data sparas som decimal (0.1 = 10%), precis som expected_apy sparas som decimal (0.07 = 7%)
            // Vi konverterar till procent (10) för formuläret, precis som expected_apy -> expected_apy_percent (7)
            if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
              const rate = typeof income.custom_tp_rate === 'number' ? income.custom_tp_rate : parseFloat(String(income.custom_tp_rate));
              if (!isNaN(rate)) {
                // VIKTIGT: Input-fältet visar ALLTID procent (10 för 10%, 0.1 för 0.1%)
                // Store sparas ALLTID som decimal (0.1 för 10%, 0.001 för 0.1%)
                // Konvertera från decimal (store) till procent (input): multiplicera med 100
                // Store är alltid decimal: 0.1 (10%) → 10 (procent för input)
                // Store är alltid decimal: 0.001 (0.1%) → 0.1 (procent för input)
                // Om värdet är > 1, det är redan i procent-format (kan hända om data inte sparades korrekt), använd som det är
                // Om värdet är <= 1, det är i decimal-format från store, konvertera till procent
                const percentRate = rate > 1 ? rate : rate * 100;
                
                // Debug: Logga konvertering
                if (process.env.NODE_ENV === 'development') {
                  console.log('🔄 PersonForm: Converting decimal to percent for display', {
                    originalFromStore: rate,
                    convertedToPercent: percentRate,
                    wasAlreadyPercent: rate > 1,
                    incomeLabel: income.label
                  });
                }
                
                return {
                  ...income,
                  custom_tp_rate: percentRate
                };
              }
            }
            return income;
          })
        }))
      });
    }
  }, [draftHousehold, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'persons'
  });

  const watchedPersons = watch('persons');

  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const onSubmit = (data: { persons: Person[] }) => {
    // Konvertera custom_tp_rate från procent till decimal för sparning
    // Detta är EXAKT samma mönster som expected_apy_percent -> expected_apy i AssetsForm
    // VIKTIGT: Input-fältet visar ALLTID procent (10 för 10%, 0.1 för 0.1%)
    // Vi konverterar till decimal för store (0.1 för 10%, 0.001 för 0.1%)
    const processedData = {
      persons: data.persons.map(person => ({
        ...person,
        incomes: person.incomes?.map(income => {
          // Om tp_input_type är 'percentage' och custom_tp_rate finns, konvertera från procent till decimal
          // Input visar procent: 10 för 10%, 0.1 för 0.1%
          // Store sparas som decimal: 0.1 för 10%, 0.001 för 0.1%
          if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
            const rate = typeof income.custom_tp_rate === 'number' ? income.custom_tp_rate : parseFloat(String(income.custom_tp_rate));
            if (!isNaN(rate)) {
              // Input är alltid i procent-format från formuläret: dividera med 100 för att få decimal
              // 10 → 0.1 (10% → 0.1 decimal)
              // 0.1 → 0.001 (0.1% → 0.001 decimal)
              // Om värdet är > 1, det är i procent-format från input (10 → 0.1)
              // Om värdet är <= 1, det kan vara i procent-format från input (0.1% → 0.001) ELLER decimal från store (0.1 för 10%)
              // För att vara säker, om värdet är <= 1 och ser ut som en decimal från store, använd det som det är
              // Men eftersom input ALLTID är i procent-format, ska vi alltid dividera med 100
              // Problemet: Om värdet redan är decimal (0.1) och vi dividerar med 100, blir det 0.001 (fel!)
              // Lösning: Vi vet att input ALLTID är i procent-format, så om värdet är <= 1, betyder det 0.1% (procent)
              // Detta är korrekt för 0.1% → 0.001 decimal
              // Men om värdet är 0.1 i input och användaren menar 10%, så måste det vara 10 i input, inte 0.1
              // Så input är ALLTID i procent-format: 10 för 10%, 0.1 för 0.1%
              // Därför dividerar vi alltid med 100
              const decimalRate = rate / 100;
              
              // Debug: Logga konvertering
              if (process.env.NODE_ENV === 'development') {
                console.log('💾 PersonForm: Converting percent to decimal for storage', {
                  percentInput: rate,
                  decimalStored: decimalRate,
                  incomeLabel: income.label
                });
              }
              
              return {
                ...income,
                custom_tp_rate: decimalRate
              };
            }
          }
          return income;
        }) || []
      })) || []
    };
    
    onSave(processedData);
    
    // Visa bekräftelse
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleWizardSelect = (pensionType: PensionType) => {
    if (showWizard) {
      setValue(`persons.${showWizard.personIndex}.incomes.${showWizard.incomeIndex}.pension_type`, pensionType);
      setShowWizard(null);
    }
  };

  const handleWizardSkip = () => {
    setShowWizard(null);
  };

  const canShowWizard = (index: number): boolean => {
    if (!isClient) return false;
    const person = watchedPersons[index];
    return !!(person?.birth_year && person?.incomes && person.incomes.length > 0);
  };

  const handleAddPerson = (person: Person) => {
    if (!person.incomes || person.incomes.length === 0) {
      person.incomes = [{
        id: Date.now().toString(),
        label: 'Huvudjobb',
        monthly_income: 0,
        income_type: 'job',
        pension_type: 'ITP1' as PensionType,
      }];
    }
    append(person);
    setShowPersonWizard(false);
  };

  const handleSkipPersonWizard = () => {
    setShowPersonWizard(false);
  };

  const addEmptyPerson = () => {
    const emptyPerson: Person = {
      name: '',
      birth_year: new Date().getFullYear() - 30,
      incomes: [{
        id: Date.now().toString(),
        label: 'Huvudjobb',
        monthly_income: 0,
        income_type: 'job',
        pension_type: 'ITP1' as PensionType,
      }],
      other_savings_monthly: 0
    };
    append(emptyPerson);
  };

  const addIncome = (personIndex: number) => {
    const newIncome: Income = {
      id: Date.now().toString(),
      label: '',
      monthly_income: 0,
      income_type: 'job', // Default till jobb
      pension_type: 'ITP1' as PensionType,
    };
    const currentIncomes = watchedPersons[personIndex]?.incomes || [];
    setValue(`persons.${personIndex}.incomes`, [...currentIncomes, newIncome]);
  };

  const removeIncome = (personIndex: number, incomeIndex: number) => {
    const currentIncomes = watchedPersons[personIndex]?.incomes || [];
    if (currentIncomes.length <= 1) return;
    const updatedIncomes = currentIncomes.filter((_, i) => i !== incomeIndex);
    setValue(`persons.${personIndex}.incomes`, updatedIncomes);
  };

  const toggleCollapsed = (personIndex: number) => {
    setCollapsedPersons(prev => ({
      ...prev,
      [personIndex]: !prev[personIndex]
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {isClient ? fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {isClient ? (watchedPersons[index]?.name || `Person ${index + 1}`) : `Person ${index + 1}`}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCollapsed(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {collapsedPersons[index] ? '▼' : '▲'}
                    </Button>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Ta bort
                    </Button>
                  )}
                </div>
              </CardHeader>
              {!collapsedPersons[index] && (
                <CardContent className="space-y-6">
                  {/* Grunduppgifter */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Grunduppgifter</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`persons.${index}.name`}>Namn</Label>
                        <Input
                          id={`persons.${index}.name`}
                          {...control.register(`persons.${index}.name`)}
                          placeholder="T.ex. Anna Andersson"
                        />
                        {errors.persons?.[index]?.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.persons[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`persons.${index}.birth_year`}>Födelseår</Label>
                        <Input
                          id={`persons.${index}.birth_year`}
                          type="number"
                          {...control.register(`persons.${index}.birth_year`, { valueAsNumber: true })}
                          min="1920"
                          max={currentYear > 0 ? currentYear - 16 : 2008}
                          placeholder="1985"
                        />
                        {isClient && (
                          <p className="text-sm text-gray-500 mt-1">
                            Ålder: {watchedPersons[index]?.birth_year ? currentYear - watchedPersons[index].birth_year : '--'} år
                          </p>
                        )}
                        {isClient && watchedPersons[index]?.birth_year && (currentYear - watchedPersons[index].birth_year) > 64 && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 font-medium mb-1">
                              ⚠️ Åldersbegränsning
                            </p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                              Appen är anpassad för personer som inte aktivt har pension. Beräkningar och funktioner är designade för personer som vill veta mer om sin framtida pension. Personen får inte vara över 64 år.
                            </p>
                          </div>
                        )}
                        {errors.persons?.[index]?.birth_year && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.persons[index]?.birth_year?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inkomster */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Pensiongrundande inkomster</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => addIncome(index)}
                      >
                        + Lägg till inkomst
                      </Button>
                    </div>

                    {(watchedPersons[index]?.incomes || []).map((income, incomeIndex) => (
                      <Card key={incomeIndex} className="border-l-4 border-l-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">Inkomst {incomeIndex + 1}</h5>
                              {watchedPersons[index]?.incomes?.length > 1 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => removeIncome(index, incomeIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Ta bort
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.label`}>Beskrivning</Label>
                                <Input
                                  id={`persons.${index}.incomes.${incomeIndex}.label`}
                                  {...control.register(`persons.${index}.incomes.${incomeIndex}.label`)}
                                  placeholder="T.ex. Huvudjobb, Uthyrning av stuga, Utdelning"
                                />
                                {errors.persons?.[index]?.incomes?.[incomeIndex]?.label && (
                                  <p className="text-sm text-red-600 mt-1">
                                    {errors.persons[index]?.incomes?.[incomeIndex]?.label?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.monthly_income`}>
                                  {income.income_type === 'job' ? 'Månadsbelopp (före skatt)' : 'Årsbelopp (efter skatt)'}
                                </Label>
                                <Input
                                  id={`persons.${index}.incomes.${incomeIndex}.monthly_income`}
                                  type="number"
                                  {...control.register(`persons.${index}.incomes.${incomeIndex}.monthly_income`, { valueAsNumber: true })}
                                  placeholder={income.income_type === 'job' ? '30000' : '600000'}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                  {income.income_type === 'job' 
                                    ? 'Månadslön från arbete (före skatt, beräknas automatiskt)'
                                    : 'Årsinkomst efter skatt (t.ex. uthyrning, utdelning, ränta - ange redan skattad inkomst)'
                                  }
                                </p>
                                {errors.persons?.[index]?.incomes?.[incomeIndex]?.monthly_income && (
                                  <p className="text-sm text-red-600 mt-1">
                                    {errors.persons[index]?.incomes?.[incomeIndex]?.monthly_income?.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Inkomsttyp */}
                            <div>
                              <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.income_type`}>Typ av inkomst</Label>
                              <Select
                                value={income.income_type || 'job'}
                                onValueChange={(value: 'job' | 'other') => {
                                  setValue(`persons.${index}.incomes.${incomeIndex}.income_type`, value);
                                  // Om det inte är jobb, rensa pensionsrelaterade fält
                                  if (value === 'other') {
                                    setValue(`persons.${index}.incomes.${incomeIndex}.pension_type`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`, undefined);
                                  } else {
                                    // Om det är jobb, sätt default pensionsavtal
                                    setValue(`persons.${index}.incomes.${incomeIndex}.pension_type`, 'ITP1');
                                  }
                                }}
                              >
                                <SelectTrigger id={`persons.${index}.incomes.${incomeIndex}.income_type`}>
                                  <SelectValue placeholder="Välj typ av inkomst" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="job">Jobb (pensiongrundande)</SelectItem>
                                  <SelectItem value="other">Annan inkomst (ej pensiongrundande)</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-gray-500 mt-1">
                                {income.income_type === 'job' 
                                  ? 'Pensiongrundande inkomst från arbete'
                                  : 'Uthyrning, utdelning, ränta, etc.'
                                }
                              </p>
                            </div>

                            {/* Pensionsavtal - bara för jobb-inkomster */}
                            {income.income_type === 'job' && (
                            <div id={`pension-select-${index}-${incomeIndex}`}>
                              <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.pension_type`}>Tjänstepensionsavtal</Label>
                              <Select
                                value={income.pension_type || ''}
                                onValueChange={(value) => {
                                  setValue(`persons.${index}.incomes.${incomeIndex}.pension_type`, value as PensionType);
                                  if (value === 'Annat') {
                                    setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, 'percentage');
                                    setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, 10); // 10% som standard
                                  } else {
                                    setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, undefined);
                                    setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, undefined);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Välj pensionsavtal" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ITP1">ITP1 (Privat sektor, född 1979+)</SelectItem>
                                  <SelectItem value="ITP2">ITP2 (ITPK-delen)</SelectItem>
                                  <SelectItem value="SAF-LO">SAF-LO (Fackligt avtal)</SelectItem>
                                  <SelectItem value="AKAP-KR">AKAP-KR (Kommun/Region)</SelectItem>
                                  <SelectItem value="PA16">PA16 (Statlig anställning)</SelectItem>
                                  <SelectItem value="Annat">Annat (Eget avtal)</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2 mt-2">
                                {canShowWizard(index) && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setShowWizard({personIndex: index, incomeIndex: incomeIndex});
                                    }}
                                  >
                                    🏠 Hjälp mig välja
                                  </Button>
                                )}
                              </div>
                              
                              {/* Inline Pension Guide */}
                              {showWizard?.personIndex === index && showWizard?.incomeIndex === incomeIndex && (
                                <Card className="mt-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
                                  <PensionWizardInline
                                    birthYear={watchedPersons[index]?.birth_year || 1985}
                                    monthlyIncome={watchedPersons[index]?.incomes?.[incomeIndex]?.monthly_income || 0}
                                    onSelectPension={handleWizardSelect}
                                    onSkip={handleWizardSkip}
                                  />
                                </Card>
                              )}
                            </div>
                            )}

                            {/* Anpassa ditt avtal (för Annat) */}
                            {income.pension_type === 'Annat' && (
                              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-600">Anpassa ditt avtal</h5>
                                <div>
                                  <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.tp_input_type`}>Välj hur du vill ange tjänstepension</Label>
                                  <Select
                                    value={income.tp_input_type || 'percentage'}
                                    onValueChange={(value) => {
                                      setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, value as 'percentage' | 'amount');
                                      if (value === 'percentage') {
                                        setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, 10); // 10% som standard
                                      } else if (value === 'amount') {
                                        setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, 1000);
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Välj typ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">Procent av lönen</SelectItem>
                                      <SelectItem value="amount">Fast belopp per månad</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {(income.tp_input_type === 'percentage' || income.tp_input_type === undefined) && (
                                  <div>
                                    <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`}>Tjänstepension i % av lön</Label>
                                    <Input
                                      id={`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`}
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="100"
                                      {...control.register(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, { valueAsNumber: true })}
                                      placeholder="10"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                      Ange procent (t.ex. 10 för 10%)
                                    </p>
                                    {errors.persons?.[index]?.incomes?.[incomeIndex]?.custom_tp_rate && (
                                      <p className="text-sm text-red-600 mt-1">
                                        {errors.persons[index]?.incomes?.[incomeIndex]?.custom_tp_rate?.message}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {income.tp_input_type === 'amount' && (
                                  <div>
                                    <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`}>Egen tjänstepensionsbelopp</Label>
                                    <Input
                                      id={`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`}
                                      type="number"
                                      {...control.register(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, { valueAsNumber: true })}
                                      min="0"
                                      placeholder="1000"
                                    />
                                    {errors.persons?.[index]?.incomes?.[incomeIndex]?.custom_tp_amount && (
                                      <p className="text-sm text-red-600 mt-1">
                                        {errors.persons[index]?.incomes?.[incomeIndex]?.custom_tp_amount?.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Löneväxling till pension - bara för jobb-inkomster */}
                            {income.income_type === 'job' && (
                            <div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`}>Löneväxling till pension</Label>
                                <span className="text-xs text-gray-500">Valfritt</span>
                              </div>
                              <Input
                                id={`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`}
                                type="number"
                                {...control.register(`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`, { valueAsNumber: true })}
                                placeholder="0"
                              />
                              <p className="text-xs text-gray-500">
                                Extra pensionsavsättning genom löneväxling för denna inkomst
                              </p>
                            </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pensionspreview */}
                  {isClient && watchedPersons[index] && (
                    <PensionPreview person={watchedPersons[index]} />
                  )}

                  {/* IPS (Individuellt pensionssparande) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">IPS (Individuellt pensionssparande)</h4>
                    <div>
                      <Label htmlFor={`persons.${index}.ips_monthly`}>IPS-avsättning per månad (valfritt)</Label>
                      <Input
                        id={`persons.${index}.ips_monthly`}
                        type="number"
                        {...control.register(`persons.${index}.ips_monthly`, { valueAsNumber: true })}
                        placeholder="0"
                      />
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-amber-800">
                          <strong>⚠️ IPS rekommenderas inte längre:</strong> Från 2024 finns det ingen skattelättnad för IPS. Det är oftast bättre att spara i ISK eller Kapitalförsäkring istället. Om du redan har IPS kan du fortsätta, men överväg att avsluta den.
                        </p>
                      </div>
                      {errors.persons?.[index]?.ips_monthly && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.persons[index]?.ips_monthly?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Övrigt sparande */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Övrigt sparande och investeringar</h4>
                    <div>
                      <Label htmlFor={`persons.${index}.other_savings_monthly`}>Övrigt sparande och investeringar per månad</Label>
                      <Input
                        id={`persons.${index}.other_savings_monthly`}
                        type="number"
                        {...control.register(`persons.${index}.other_savings_monthly`, { valueAsNumber: true })}
                        placeholder="5000"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Allt som du lägger på ekonomiska investeringar: ISK, AF, KF, fonder, aktier, ETF:er, obligationer, räntefonder, sparkonto, kapitalförsäkring, fastigheter, crypto m.m.
                      </p>
                      {errors.persons?.[index]?.other_savings_monthly && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.persons[index]?.other_savings_monthly?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )) : (
            <div className="text-center py-8 text-gray-500">
              Laddar...
            </div>
          )}
        </div>

        {/* Sammanfattning av hushållet */}
        {isClient && watchedPersons.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Hushållets sammanfattning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {watchedPersons.map((person, index) => {
                  // Normalisera person-data: konvertera custom_tp_rate från procent till decimal
                  // VIKTIGT: Data från formuläret (watchedPersons) är ALLTID i procent-format (10 för 10%, 0.1 för 0.1%)
                  // Vi måste ALLTID konvertera till decimal för beräkningar (10 → 0.1, 0.1 → 0.001)
                  const normalizedPerson: Person = {
                    ...person,
                    incomes: person.incomes?.map(income => {
                      // Om tp_input_type är 'percentage' och custom_tp_rate finns, konvertera från procent till decimal
                      // Input är alltid procent: 10 för 10%, 0.1 för 0.1%
                      // Decimal för beräkning: 0.1 för 10%, 0.001 för 0.1%
                      if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
                        const rate = typeof income.custom_tp_rate === 'number' ? income.custom_tp_rate : parseFloat(String(income.custom_tp_rate));
                        if (!isNaN(rate)) {
                          // Input är ALLTID i procent-format från formuläret, dividera med 100 för att få decimal
                          // 10 → 0.1 (10% → 0.1 decimal)
                          // 0.1 → 0.001 (0.1% → 0.001 decimal)
                          const decimalRate = rate / 100;
                          
                          // Debug: Logga normalisering
                          if (process.env.NODE_ENV === 'development') {
                            console.log('🔧 PersonForm: Normalizing custom_tp_rate', {
                              originalPercent: rate,
                              normalizedDecimal: decimalRate,
                              monthlyIncome: income.monthly_income,
                              expectedPension: (income.monthly_income || 0) * decimalRate
                            });
                          }
                          return {
                            ...income,
                            custom_tp_rate: decimalRate
                          };
                        }
                      }
                      return income;
                    }) || []
                  };

                  const totalIncome = calculateTotalIncome(normalizedPerson);
                  const jobIncome = calculateJobIncome(normalizedPerson);
                  const otherIncome = calculateOtherIncome(normalizedPerson);
                  const otherIncomeAnnual = normalizedPerson.incomes?.filter(income => income.income_type === 'other').reduce((sum, income) => sum + income.monthly_income, 0) || 0;
                  const incomePension = calculateIncomePension(normalizedPerson);
                  const premiePension = calculatePremiePension(normalizedPerson);
                  const occupationalPension = calculateOccupationalPension(normalizedPerson);
                  const extraPension = calculateExtraPension(normalizedPerson);
                  const ips = normalizedPerson.ips_monthly || 0;
                  const totalPension = incomePension + premiePension + occupationalPension + extraPension + ips;
                  
                  // Debug: Logga om tjänstepensionen är suspekt
                  if (process.env.NODE_ENV === 'development' && occupationalPension > jobIncome && jobIncome > 0) {
                    console.warn('⚠️ PersonForm: Tjänstepension större än lön!', {
                      person: person.name,
                      jobIncome,
                      occupationalPension,
                      totalPension,
                      incomes: person.incomes?.map(i => ({
                        monthly_income: i.monthly_income,
                        pension_type: i.pension_type,
                        tp_input_type: i.tp_input_type,
                        custom_tp_rate: i.custom_tp_rate
                      }))
                    });
                  }
                  
                  return (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium text-gray-800">{person.name || `Person ${index + 1}`}</h4>
                      <div className="space-y-2 mt-2 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <span className="text-gray-600 flex-shrink-0">Nettoinkomst:</span>
                          <div className="flex flex-col sm:items-end">
                            <span className="font-medium text-green-600">{formatCurrency(calculatePersonNetIncome(person))}/månad</span>
                          <p className="text-xs text-gray-500 mt-0.5">Uppskattning, kan variera</p>
                        </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-gray-600 flex-shrink-0">Total pension:</span>
                          <span className="font-medium">{formatCurrency(totalPension)}/månad</span>
                        </div>
                        <div className="pl-4 space-y-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Trygghetsbaserad</div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pl-2">
                            <span className="text-xs text-gray-500 flex-shrink-0">- Inkomstpension:</span>
                            <span className="text-xs font-medium">{formatCurrency(incomePension)}/månad</span>
                          </div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Marknadsbaserad</div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pl-2">
                            <span className="text-xs text-gray-500 flex-shrink-0">- Premiepension:</span>
                            <span className="text-xs font-medium">{formatCurrency(premiePension)}/månad</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pl-2">
                            <span className="text-xs text-gray-500 flex-shrink-0">- Tjänstepension:</span>
                            <span className="text-xs font-medium">{formatCurrency(occupationalPension)}/månad</span>
                          </div>
                          {extraPension > 0 && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pl-2">
                              <span className="text-xs text-gray-500 flex-shrink-0">- Löneväxling:</span>
                              <span className="text-xs font-medium">{formatCurrency(extraPension)}/månad</span>
                            </div>
                          )}
                          {ips > 0 && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pl-2">
                              <span className="text-xs text-gray-500 flex-shrink-0">- IPS:</span>
                              <span className="text-xs font-medium">{formatCurrency(ips)}/månad</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-gray-600 flex-shrink-0">Övrigt sparande och investeringar:</span>
                          <span className="font-medium">{formatCurrency(person.other_savings_monthly || 0)}/månad</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-gray-600 flex-shrink-0">Totalt sparande:</span>
                          <span className="font-medium">{formatCurrency(totalPension + (person.other_savings_monthly || 0))}/månad</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Hushållets totalsummering */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Hushållets totalsummering</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <span className="text-gray-600 flex-shrink-0">Total nettoinkomst:</span>
                      <div className="flex flex-col sm:items-end">
                        <span className="font-medium text-green-600">
                        {formatCurrency(calculateHouseholdNetIncome(watchedPersons))}/månad
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">Uppskattning, kan variera</p>
                    </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-gray-600 flex-shrink-0">Total pension:</span>
                      <span className="font-medium">
                        {formatCurrency(watchedPersons.reduce((sum, person) => {
                          // Normalisera person-data för beräkningar
                          // VIKTIGT: Data från watchedPersons (formulär) är ALLTID i procent-format
                          // Vi måste ALLTID dividera med 100 för att få decimal (10 → 0.1, 0.1 → 0.001)
                          const normalizedPerson: Person = {
                            ...person,
                            incomes: person.incomes?.map(income => {
                              if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
                                const rate = typeof income.custom_tp_rate === 'number' ? income.custom_tp_rate : parseFloat(String(income.custom_tp_rate));
                                if (!isNaN(rate)) {
                                  // Data från formulär är alltid i procent-format, dividera med 100
                                  return {
                                    ...income,
                                    custom_tp_rate: rate / 100
                                  };
                                }
                              }
                              return income;
                            }) || []
                          };
                          return sum + calculatePublicPension(normalizedPerson) + calculateOccupationalPension(normalizedPerson) + calculateExtraPension(normalizedPerson);
                        }, 0))}/månad
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-gray-600 flex-shrink-0">Övrigt sparande och investeringar:</span>
                      <span className="font-medium">
                        {formatCurrency(watchedPersons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0))}/månad
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <span className="text-gray-600 flex-shrink-0">Uppskattade utgifter:</span>
                      {(() => {
                        const amortizationMonthly = calculateAmortizationMonthly((useHouseholdStore.getState().draftHousehold?.liabilities) || []);
                        const netMonthly = calculateHouseholdNetIncome(watchedPersons);
                        const otherSavings = watchedPersons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
                        const expenses = Math.max(0, netMonthly - otherSavings - amortizationMonthly);
                        return (
                          <div className="flex flex-col sm:items-end">
                            <span className="font-medium text-blue-600">{formatCurrency(expenses)}/månad</span>
                            <p className="text-xs text-gray-500 mt-0.5">Nettoinkomst − sparande − amortering (amortering räknas som sparande)</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    * Nettoinkomst = brutto (job) efter skatt + övrigt (efter skatt)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ändringar sparade!
            </div>
          )}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
                variant="secondary"
              onClick={() => {
                setShowPersonWizard(true);
                // Scrolla till guiden efter en kort delay för att säkerställa att DOM:en har uppdaterats
                setTimeout(() => {
                  personWizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              + Lägg till person (Guide)
            </Button>
            <Button
              type="button"
                variant="secondary"
              onClick={addEmptyPerson}
            >
              + Lägg till person (Tom)
            </Button>
          </div>
            <Button type="submit" className={showSuccess ? 'bg-green-600 hover:bg-green-700' : ''}>
              {showSuccess ? '✓ Sparat' : 'Spara ändringar'}
          </Button>
          </div>
        </div>
      </form>

      {/* Person Guide Inline */}
      {showPersonWizard && (
        <div ref={personWizardRef} className="mt-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 mb-6">
            <PersonWizardInline
              onAddPerson={handleAddPerson}
              onSkip={handleSkipPersonWizard}
            />
          </Card>
        </div>
      )}

    </>
  );
}