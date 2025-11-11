/**
 * Steg 3: Lägg till skulder
 */

'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Liability } from '@/lib/types';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { formatCurrency } from '@/lib/utils/format';
import { DEFAULT_AMORTIZATION_RATE } from '@/lib/wealth/config';
import LiabilityWizard from '@/components/ui/LiabilityWizard';

const liabilitySchema = z.object({
  label: z.string().min(1, 'Beskrivning krävs'),
  principal: z.number().min(0, 'Huvudbelopp kan inte vara negativt'),
  amortization_rate_apy: z.number().min(0).max(1, 'Amorteringstakt måste vara mellan 0% och 100%')
});

const formSchema = z.object({
  liabilities: z.array(liabilitySchema)
});

type FormData = z.infer<typeof formSchema>;

interface LiabilitiesStepProps {
  onNext: (data: { liabilities: Liability[] }) => void;
  onPrevious: () => void;
}

export default function LiabilitiesStep({ onNext, onPrevious }: LiabilitiesStepProps) {
  const { getOnboardingData } = useHouseholdStore();
  const initialData = getOnboardingData();
  const [showWizard, setShowWizard] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liabilities: initialData.liabilities.length > 0 ? initialData.liabilities : []
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'liabilities'
  });

  const watchedLiabilities = watch('liabilities');

  const handleWizardAdd = (liability: { label: string; principal: number; amortization_rate_apy: number }) => {
    append(liability);
    setShowWizard(false);
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };
  
  const onSubmit = (data: FormData) => {
    onNext({ liabilities: data.liabilities });
  };
  
  const addLiability = () => {
    setShowWizard(true);
  };
  
  const totalPrincipal = watchedLiabilities.reduce((sum, liability) => sum + (liability.principal || 0), 0);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Skuld {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Ta bort
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`liabilities.${index}.label`}>Beskrivning</Label>
                  <Input
                    id={`liabilities.${index}.label`}
                    {...control.register(`liabilities.${index}.label`)}
                    placeholder="T.ex. Bostadslån, Billån, Studielån"
                  />
                  {errors.liabilities?.[index]?.label && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.liabilities[index]?.label?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`liabilities.${index}.principal`}>Huvudbelopp (kr)</Label>
                  <Input
                    id={`liabilities.${index}.principal`}
                    type="number"
                    {...control.register(`liabilities.${index}.principal`, { valueAsNumber: true })}
                    placeholder="2000000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Kvarvarande skuld (inte månadskostnad)
                  </p>
                  {errors.liabilities?.[index]?.principal && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.liabilities[index]?.principal?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`liabilities.${index}.amortization_rate_apy`}>
                    Amorteringstakt per år
                  </Label>
                  <Input
                    id={`liabilities.${index}.amortization_rate_apy`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...control.register(`liabilities.${index}.amortization_rate_apy`, { valueAsNumber: true })}
                    placeholder="0.02"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ange som decimal (0.02 = 2% per år)
                  </p>
                  {errors.liabilities?.[index]?.amortization_rate_apy && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.liabilities[index]?.amortization_rate_apy?.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summering */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summering skulder</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beskrivning</TableHead>
                <TableHead className="text-right">Huvudbelopp</TableHead>
                <TableHead className="text-right">Amorteringstakt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchedLiabilities.map((liability, index) => (
                <TableRow key={index}>
                  <TableCell>{liability.label}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(liability.principal || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {((liability.amortization_rate_apy || 0) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Totalt</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalPrincipal)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addLiability}
        >
          + Lägg till skuld
        </Button>
        
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onPrevious}>
            ← Tillbaka
          </Button>
          <Button type="submit">
            Fortsätt till sammanfattning →
          </Button>
        </div>
      </div>

      {/* Liability Wizard Modal */}
      {showWizard && (
        <LiabilityWizard
          onAddLiability={handleWizardAdd}
          onSkip={handleWizardSkip}
        />
      )}
    </form>
  );
}
