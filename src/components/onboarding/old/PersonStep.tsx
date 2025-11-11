/**
 * Steg 1: Lägg till personer i hushållet
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Person, Income, PensionType } from '@/lib/types';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { calculatePublicPension, calculateOccupationalPension, calculateExtraPension, calculateTotalIncome, calculateJobIncome, calculateOtherIncome, calculateAmortizationMonthly } from '@/lib/wealth/calc';
import { calculatePersonNetIncome, calculateHouseholdNetIncome } from '@/lib/wealth/tax-calc';
import { formatCurrency } from '@/lib/utils/format';
import PensionPreview from '@/components/ui/PensionPreview';
import PensionWizard from '@/components/ui/PensionWizard';
import PersonWizard from '@/components/ui/PersonWizard';

const incomeSchema = z.object({
  label: z.string().min(1, 'Beskrivning krävs'),
  monthly_income: z.number().min(0, 'Inkomst kan inte vara negativ'),
  income_type: z.enum(['job', 'other']),
  pension_type: z.enum(['ITP1', 'ITP2', 'SAF-LO', 'AKAP-KR', 'PA16', 'Annat'] as const).optional(),
  custom_tp_rate: z.number().min(0).max(1).optional(),
  custom_tp_amount: z.number().min(0).optional(),
  tp_input_type: z.enum(['percentage', 'amount']).optional(),
  salary_exchange_monthly: z.number().min(0).optional(),
});

const personSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  birth_year: z.number().min(1920, 'Födelseår måste vara efter 1920').max(2008, 'Minst 16 år'),
  incomes: z.array(incomeSchema).min(1, 'Minst en inkomst krävs'),
  extra_pension_monthly: z.number().min(0).optional(),
  extra_pension_return: z.number().min(0).max(1).optional(),
  other_savings_monthly: z.number().min(0, 'Sparande kan inte vara negativt')
});

const formSchema = z.object({
  persons: z.array(personSchema).min(1, 'Minst en person krävs')
});

type FormData = z.infer<typeof formSchema>;

interface PersonStepProps {
  onNext: (data: FormData) => void;
  onPrevious?: () => void;
}

export default function PersonStep({ onNext, onPrevious }: PersonStepProps) {
  const { getOnboardingData } = useHouseholdStore();
  const initialData = getOnboardingData();
  const [showWizard, setShowWizard] = useState<{personIndex: number, incomeIndex: number} | null>(null); // Index för vilken person och inkomst som visar wizard
  const [showPersonWizard, setShowPersonWizard] = useState(false); // Visa PersonWizard
  const [collapsedPersons, setCollapsedPersons] = useState<Record<number, boolean>>({}); // Vilka personer som är fällda ihop
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      persons: initialData.persons.length > 0 ? initialData.persons.map(person => ({
        ...person,
        incomes: person.incomes || []
      })) : []
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'persons'
  });
  
  const watchedPersons = watch('persons');

  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const onSubmit = (data: FormData) => {
    onNext(data);
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
    // Säkerställ att personen har minst en inkomst
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
    if (currentIncomes.length <= 1) return; // Behåll minst en inkomst
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
            <Card key={field.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {isClient ? (watchedPersons[index]?.name || `Person ${index + 1}`) : `Person ${index + 1}`}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCollapsed(index)}
                      className="text-gray-600 hover:text-gray-800 text-xs"
                    >
                      {collapsedPersons[index] ? 'Visa detaljer' : 'Dölj detaljer'}
                    </Button>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Ta bort
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {!collapsedPersons[index] && (
                <CardContent className="space-y-6">
                {/* Grunduppgifter */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Grunduppgifter</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`persons.${index}.name`} className="text-xs">Namn</Label>
                      <Input
                        id={`persons.${index}.name`}
                        {...control.register(`persons.${index}.name`)}
                        placeholder="Anna Andersson"
                        className="h-9 text-sm"
                      />
                      {errors.persons?.[index]?.name && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.persons[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`persons.${index}.birth_year`} className="text-xs">Födelseår</Label>
                      <Input
                        id={`persons.${index}.birth_year`}
                        type="number"
                        {...control.register(`persons.${index}.birth_year`, { valueAsNumber: true })}
                        min="1920"
                        max={currentYear > 0 ? currentYear - 16 : 2008}
                        placeholder="1985"
                        className="h-9 text-sm"
                      />
                      {isClient && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ålder: {watchedPersons[index]?.birth_year ? currentYear - watchedPersons[index].birth_year : '--'} år
                        </p>
                      )}
                      {errors.persons?.[index]?.birth_year && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.persons[index]?.birth_year?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inkomster */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inkomster & pension</h4>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => addIncome(index)}
                      className="text-xs h-7"
                    >
                      + Inkomst
                    </Button>
                  </div>
                  
                  {(watchedPersons[index]?.incomes || []).map((income, incomeIndex) => (
                    <Card key={incomeIndex} className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {incomeIndex + 1}
                              </div>
                              <h5 className="font-medium text-sm">{income.label || `Inkomst ${incomeIndex + 1}`}</h5>
                              <Badge variant={income.income_type === 'job' ? 'default' : 'secondary'} className="text-xs">
                                {income.income_type === 'job' ? 'Jobb' : 'Övrigt'}
                              </Badge>
                            </div>
                            {watchedPersons[index]?.incomes?.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIncome(index, incomeIndex)}
                                className="text-red-500 hover:text-red-700 h-7 text-xs"
                              >
                                Ta bort
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.label`} className="text-xs">Beskrivning</Label>
                              <Input
                                id={`persons.${index}.incomes.${incomeIndex}.label`}
                                {...control.register(`persons.${index}.incomes.${incomeIndex}.label`)}
                                placeholder="Huvudjobb"
                                className="h-9 text-sm"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.monthly_income`} className="text-xs">
                                {income.income_type === 'job' ? 'Månad (före skatt)' : 'År (efter skatt)'}
                              </Label>
                              <Input
                                id={`persons.${index}.incomes.${incomeIndex}.monthly_income`}
                                type="number"
                                {...control.register(`persons.${index}.incomes.${incomeIndex}.monthly_income`, { valueAsNumber: true })}
                                placeholder={income.income_type === 'job' ? '30000' : '600000'}
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>

                          {/* Inkomsttyp */}
                          <div>
                            <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.income_type`} className="text-xs">Typ av inkomst</Label>
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
                              <SelectTrigger id={`persons.${index}.incomes.${incomeIndex}.income_type`} className="h-9 text-sm">
                                <SelectValue placeholder="Välj typ" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="job">Jobb (pensiongrundande)</SelectItem>
                                <SelectItem value="other">Annan inkomst (ej pensiongrundande)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Pensionsavtal - bara för jobb-inkomster */}
                          {income.income_type === 'job' && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.pension_type`} className="text-xs">Tjänstepensionsavtal</Label>
                              {canShowWizard(index) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowWizard({personIndex: index, incomeIndex: incomeIndex})}
                                  className="text-xs h-6 text-blue-600 hover:text-blue-700"
                                >
                                  Hjälp mig välja
                                </Button>
                              )}
                            </div>
                            <Select
                              value={income.pension_type || ''}
                              onValueChange={(value) => {
                                setValue(`persons.${index}.incomes.${incomeIndex}.pension_type`, value as PensionType);
                                if (value === 'Annat') {
                                  setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, 'percentage');
                                  setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, 0.10);
                                } else {
                                  setValue(`persons.${index}.incomes.${incomeIndex}.tp_input_type`, undefined);
                                  setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, undefined);
                                  setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, undefined);
                                }
                              }}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Välj avtal" />
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
                                      setValue(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, 0.10);
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
                                  <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`}>Egen tjänstepensionsprocent</Label>
                                  <Input
                                    id={`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    {...control.register(`persons.${index}.incomes.${incomeIndex}.custom_tp_rate`, { valueAsNumber: true })}
                                    placeholder="0.10"
                                  />
                                  <p className="text-sm text-gray-500 mt-1">
                                    Ange som decimal (0.10 = 10%)
                                  </p>
                                </div>
                              )}
                              
                              {income.tp_input_type === 'amount' && (
                                <div>
                                  <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`}>Egen tjänstepensionsbelopp</Label>
                                  <Input
                                    id={`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`}
                                    type="number"
                                    {...control.register(`persons.${index}.incomes.${incomeIndex}.custom_tp_amount`, { valueAsNumber: true })}
                                    placeholder="5000"
                                  />
                                  <p className="text-sm text-gray-500 mt-1">
                                    Belopp per månad i kronor
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Löneväxling till pension - bara för jobb-inkomster */}
                          {income.income_type === 'job' && (
                          <div>
                            <Label htmlFor={`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`} className="text-xs">Löneväxling till pension (valfritt)</Label>
                            <Input
                              id={`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`}
                              type="number"
                              {...control.register(`persons.${index}.incomes.${incomeIndex}.salary_exchange_monthly`, { valueAsNumber: true })}
                              placeholder="0"
                              className="h-9 text-sm"
                            />
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

                {/* Övrigt sparande */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Övrigt sparande</h4>
                  <div>
                    <Label htmlFor={`persons.${index}.other_savings_monthly`}>Övrigt sparande per månad</Label>
                    <Input
                      id={`persons.${index}.other_savings_monthly`}
                      type="number"
                      {...control.register(`persons.${index}.other_savings_monthly`, { valueAsNumber: true })}
                      placeholder="5000"
                    />
                      <p className="text-sm text-gray-500 mt-1">
                        ISK, AF, KF, fonder, aktier, ETF:er, obligationer, räntefonder, sparkonto, kapitalförsäkring, privat pensionssparande, fastigheter, crypto, stöd, donationer etc.
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
                  const totalIncome = calculateTotalIncome(person);
                  const jobIncome = calculateJobIncome(person);
                  const otherIncome = calculateOtherIncome(person);
                  const otherIncomeAnnual = person.incomes?.filter(income => income.income_type === 'other').reduce((sum, income) => sum + income.monthly_income, 0) || 0;
                  const publicPension = calculatePublicPension(person);
                  const occupationalPension = calculateOccupationalPension(person);
                  const extraPension = calculateExtraPension(person);
                  const totalPension = publicPension + occupationalPension + extraPension;
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/30 last:border-b-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm">{person.name || `Person ${index + 1}`}</h4>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs">
                          <div className="min-w-0">
                            <span className="text-gray-600">Netto:</span>
                            <span className="ml-1 font-medium text-green-600">{formatCurrency(calculatePersonNetIncome(person))}/mån</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-gray-600">Pension:</span>
                            <span className="ml-1 font-medium">{formatCurrency(totalPension)}/mån</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-gray-600">Sparande:</span>
                            <span className="ml-1 font-medium">{formatCurrency(person.other_savings_monthly || 0)}/mån</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Hushållets totalsummering */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Hushållets totalsummering</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total nettoinkomst:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatCurrency(calculateHouseholdNetIncome(watchedPersons))}/månad
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">Uppskattning, kan variera</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total pension:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(watchedPersons.reduce((sum, person) => 
                          sum + calculatePublicPension(person) + calculateOccupationalPension(person) + calculateExtraPension(person), 0
                        ))}/månad
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Övrigt sparande:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(watchedPersons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0))}/månad
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Uppskattade utgifter:</span>
                      {(() => {
                        const amortizationMonthly = calculateAmortizationMonthly(getOnboardingData().liabilities || []);
                        const netMonthly = calculateHouseholdNetIncome(watchedPersons);
                        const otherSavings = watchedPersons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
                        const expenses = Math.max(0, netMonthly - otherSavings - amortizationMonthly);
                        return (
                          <>
                            <span className="ml-2 font-medium text-blue-600">{formatCurrency(expenses)}/månad</span>
                            <p className="text-xs text-gray-500 mt-0.5">Nettoinkomst − sparande − amortering (amortering räknas som sparande)</p>
                          </>
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

        <div className="flex justify-between">
          <div className="flex justify-between items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setShowPersonWizard(true)}
              className="border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="text-xl mr-2">+</span>
              Lägg till person med inkomster och sparande
            </Button>
          </div>
          <div className="flex gap-2">
            {onPrevious && (
              <Button type="button" variant="secondary" onClick={onPrevious}>
                ← Tillbaka
              </Button>
            )}
            <Button type="submit">
              Klar - Gå till översikt →
            </Button>
          </div>
        </div>
      </form>

      {/* Person Wizard Modal */}
      {showPersonWizard && (
        <PersonWizard
          onAddPerson={handleAddPerson}
          onSkip={handleSkipPersonWizard}
        />
      )}

      {/* Pension Wizard Modal */}
      <PensionWizard
        open={showWizard !== null}
        birthYear={showWizard !== null ? (watchedPersons[showWizard.personIndex]?.birth_year || 1985) : 1985}
        monthlyIncome={showWizard !== null ? (watchedPersons[showWizard.personIndex]?.incomes?.[showWizard.incomeIndex]?.monthly_income || 0) : 0}
        onSelectPension={handleWizardSelect}
        onSkip={handleWizardSkip}
      />
    </>
  );
}