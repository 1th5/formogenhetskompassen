/**
 * Formulär för redigering av skulder
 */

'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Liability, LiabilityType, Asset } from '@/lib/types';
import { DEFAULT_AMORTIZATION_RATE } from '@/lib/wealth/config';
import { formatCurrency } from '@/lib/utils/format';

// Schema för formulär (använder procent)
const liabilityFormSchema = z.object({
  label: z.string().min(1, 'Beskrivning krävs'),
  principal: z.number().min(0, 'Huvudbelopp kan inte vara negativt'),
  amortization_rate_apy_percent: z.number().min(0).max(100, 'Amorteringstakt måste vara mellan 0% och 100%'),
  liability_type: z.enum(['Bostadslån', 'Billån', 'Annat'])
});

const formSchema = z.object({
  liabilities: z.array(liabilityFormSchema)
});

type FormData = z.infer<typeof formSchema>;

interface LiabilitiesFormProps {
  liabilities: Liability[];
  onUpdate: (liabilities: Liability[]) => void;
  assets?: Asset[]; // Tillgångar för att visa varningar
}

export default function LiabilitiesForm({ liabilities, onUpdate, assets = [] }: LiabilitiesFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  // Konvertera från decimal till procent för formuläret
  const formLiabilities = liabilities.map(liability => ({
    ...liability,
    amortization_rate_apy_percent: (liability.amortization_rate_apy || 0) * 100,
    liability_type: liability.liability_type || 'Annat' // Default till 'Annat' för gamla skulder
  }));
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liabilities: formLiabilities.length > 0 ? formLiabilities : []
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'liabilities'
  });
  
  const watchedLiabilities = watch('liabilities');
  
  const onSubmit = (data: FormData) => {
    // Konvertera från procent till decimaler för sparning
    const liabilitiesWithDecimals = data.liabilities.map(liability => ({
      label: liability.label,
      principal: liability.principal,
      amortization_rate_apy: liability.amortization_rate_apy_percent / 100,
      liability_type: liability.liability_type
    }));
    onUpdate(liabilitiesWithDecimals);
    
    // Visa bekräftelse
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const addLiability = () => {
    append({
      label: '',
      principal: 0,
      amortization_rate_apy_percent: DEFAULT_AMORTIZATION_RATE * 100,
      liability_type: 'Annat' as LiabilityType
    });
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
                  <Label htmlFor={`liabilities.${index}.liability_type`}>Typ av lån *</Label>
                  <select
                    id={`liabilities.${index}.liability_type`}
                    {...control.register(`liabilities.${index}.liability_type`)}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Bostadslån">Bostadslån</option>
                    <option value="Billån">Billån</option>
                    <option value="Annat">Annat</option>
                  </select>
                  {errors.liabilities?.[index]?.liability_type && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.liabilities[index]?.liability_type?.message}
                    </p>
                  )}
                </div>
                
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
                  {/* Varning om skulden överstiger tillgångar av samma typ */}
                  {(() => {
                    const liabilityType = watchedLiabilities[index]?.liability_type;
                    const principal = watchedLiabilities[index]?.principal || 0;
                    
                    if (liabilityType === 'Bostadslån' && principal > 0) {
                      const housingAssets = assets.filter(
                        a => a.category === 'Bostad' || a.category === 'Semesterbostad'
                      ).reduce((sum, a) => sum + a.value, 0);
                      const otherHousingLoans = watchedLiabilities
                        .filter((l, i) => i !== index && l.liability_type === 'Bostadslån')
                        .reduce((sum, l) => sum + (l.principal || 0), 0);
                      const totalHousingLoans = otherHousingLoans + principal;
                      
                      if (totalHousingLoans > housingAssets) {
                        return (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-800">
                              ⚠️ Totalt bostadslån ({formatCurrency(totalHousingLoans)}) överstiger bostadstillgångar ({formatCurrency(housingAssets)})
                            </p>
                          </div>
                        );
                      }
                    }
                    
                    if (liabilityType === 'Billån' && principal > 0) {
                      const carAssets = assets.filter(
                        a => a.category === 'Bil'
                      ).reduce((sum, a) => sum + a.value, 0);
                      const otherCarLoans = watchedLiabilities
                        .filter((l, i) => i !== index && l.liability_type === 'Billån')
                        .reduce((sum, l) => sum + (l.principal || 0), 0);
                      const totalCarLoans = otherCarLoans + principal;
                      
                      if (totalCarLoans > carAssets) {
                        return (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-800">
                              ⚠️ Totalt billån ({formatCurrency(totalCarLoans)}) överstiger bilstillgångar ({formatCurrency(carAssets)})
                            </p>
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  })()}
                </div>
                
                <div>
                  <Label htmlFor={`liabilities.${index}.amortization_rate_apy_percent`}>
                    Amorteringstakt per år (%)
                  </Label>
                  <Input
                    id={`liabilities.${index}.amortization_rate_apy_percent`}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    inputMode="decimal"
                    {...control.register(`liabilities.${index}.amortization_rate_apy_percent`, { 
                      valueAsNumber: true,
                      onChange: (e) => {
                        const value = e.target.value;
                        // Begränsa till max 1 decimal
                        if (value.includes('.')) {
                          const parts = value.split('.');
                          if (parts[1] && parts[1].length > 1) {
                            e.target.value = `${parts[0]}.${parts[1].slice(0, 1)}`;
                          }
                        }
                      }
                    })}
                    placeholder="2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ange i procent (t.ex. 2 för 2% per år)
                  </p>
                  {errors.liabilities?.[index]?.amortization_rate_apy_percent && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.liabilities[index]?.amortization_rate_apy_percent?.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summering */}
      {watchedLiabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summering skulder</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead className="text-right">Huvudbelopp</TableHead>
                  <TableHead className="text-right">Amorteringstakt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchedLiabilities.map((liability, index) => (
                  <TableRow key={index}>
                    <TableCell>{liability.liability_type || 'Annat'}</TableCell>
                    <TableCell>{liability.label}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(liability.principal || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(watchedLiabilities[index]?.amortization_rate_apy_percent || 0).toFixed(1)}%
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
          <Button
            type="button"
            variant="outline"
            onClick={addLiability}
          >
            + Lägg till skuld
          </Button>
          
          <Button type="submit" className={showSuccess ? 'bg-green-600 hover:bg-green-700' : ''}>
            {showSuccess ? '✓ Sparat' : 'Spara ändringar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
