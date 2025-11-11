/**
 * Steg 2: Lägg till tillgångar
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Asset, AssetCategory, getDefaultReturnRate } from '@/lib/types';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { formatCurrency } from '@/lib/utils/format';
import AssetWizard from '@/components/ui/AssetWizard';
import PensionHelpWizard from '@/components/ui/PensionHelpWizard';

const assetSchema = z.object({
  category: z.enum(['Bostad', 'Semesterbostad', 'Bil', 'Fonder & Aktier', 'Sparkonto & Kontanter', 'Trygghetsbaserad pension (Statlig)', 'Marknadsbaserad pension', 'Tomt & Mark', 'Maskiner & Utrustning', 'Fordon (övrigt)', 'Ädelmetaller & Smycken', 'Annat'] as const),
  label: z.string().min(1, 'Beskrivning krävs'),
  value: z.number().min(0, 'Värde kan inte vara negativt'),
  expected_apy: z.number().min(-1).max(1, 'APY måste vara mellan -100% och 100%')
});

const formSchema = z.object({
  assets: z.array(assetSchema)
});

type FormData = z.infer<typeof formSchema>;

interface AssetsStepProps {
  onNext: (data: { assets: Asset[] }) => void;
  onPrevious: () => void;
}

export default function AssetsStep({ onNext, onPrevious }: AssetsStepProps) {
  const { getOnboardingData } = useHouseholdStore();
  const initialData = getOnboardingData();
  const [showWizard, setShowWizard] = useState(false);
  const [showPensionHelp, setShowPensionHelp] = useState(false);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: initialData.assets.length > 0 ? initialData.assets : []
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assets'
  });

  const watchedAssets = watch('assets');

  const handleWizardAdd = (asset: { category: AssetCategory; label: string; value: number; expected_apy: number }) => {
    append(asset);
    setShowWizard(false);
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };

  const handlePensionHelpAdd = (pensionData: { label: string; value: number; expected_apy: number; category: 'Trygghetsbaserad pension (Statlig)' | 'Marknadsbaserad pension' }) => {
    append({
      category: pensionData.category as AssetCategory,
      label: pensionData.label,
      value: pensionData.value,
      expected_apy: pensionData.expected_apy
    });
    setShowPensionHelp(false);
  };

  const handlePensionHelpSkip = () => {
    setShowPensionHelp(false);
  };
  
  const onSubmit = (data: FormData) => {
    onNext({ assets: data.assets });
  };
  
  const addAsset = () => {
    setShowWizard(true);
  };
  
  const updateCategory = (index: number, category: AssetCategory) => {
    setValue(`assets.${index}.category`, category);
    setValue(`assets.${index}.expected_apy`, getDefaultReturnRate(category));
  };
  
  const totalValue = watchedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  // Visa PensionHelpWizard automatiskt när användaren kommer hit första gången
  useEffect(() => {
    const hasNoAssets = watchedAssets.length === 0 || watchedAssets.every(asset => asset.value === 0);
    if (hasNoAssets && !showPensionHelp && !showWizard) {
      setShowPensionHelp(true);
    }
  }, [watchedAssets, showPensionHelp, showWizard]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Tillgång {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="secondary"
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
                  <Label htmlFor={`assets.${index}.category`}>Kategori</Label>
                  <Select
                    value={watchedAssets[index]?.category}
                    onValueChange={(value) => updateCategory(index, value as AssetCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bostad">🏠 Bostad</SelectItem>
                      <SelectItem value="Semesterbostad">🏖️ Semesterbostad</SelectItem>
                      <SelectItem value="Bil">🚗 Bil</SelectItem>
                      <SelectItem value="Fonder & Aktier">📈 Fonder & Aktier</SelectItem>
                      <SelectItem value="Sparkonto & Kontanter">💰 Sparkonto & Kontanter</SelectItem>
                      <SelectItem value="Trygghetsbaserad pension (Statlig)">🏛️ Trygghetsbaserad pension (Statlig)</SelectItem>
                      <SelectItem value="Marknadsbaserad pension">📊 Marknadsbaserad pension</SelectItem>
                      <SelectItem value="Tomt & Mark">🌲 Tomt & Mark</SelectItem>
                      <SelectItem value="Maskiner & Utrustning">🔧 Maskiner & Utrustning</SelectItem>
                      <SelectItem value="Fordon (övrigt)">🏍️ Fordon (övrigt)</SelectItem>
                      <SelectItem value="Ädelmetaller & Smycken">💎 Ädelmetaller & Smycken</SelectItem>
                      <SelectItem value="Annat">❓ Annat</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Välj typ av tillgång
                  </p>
                </div>
                
                <div>
                  <Label htmlFor={`assets.${index}.label`}>Beskrivning</Label>
                  <Input
                    id={`assets.${index}.label`}
                    {...control.register(`assets.${index}.label`)}
                    placeholder="T.ex. Volvo V70, ISK-portfölj, Sparkonto"
                  />
                  {errors.assets?.[index]?.label && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.assets[index]?.label?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`assets.${index}.value`}>Värde (kr)</Label>
                  <Input
                    id={`assets.${index}.value`}
                    type="number"
                    {...control.register(`assets.${index}.value`, { valueAsNumber: true })}
                    placeholder="500000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Marknadsvärde idag
                  </p>
                  {errors.assets?.[index]?.value && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.assets[index]?.value?.message}
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
          <CardTitle className="text-lg">Summering tillgångar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Beskrivning</TableHead>
                <TableHead className="text-right">Värde</TableHead>
                <TableHead className="text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchedAssets.map((asset, index) => (
                <TableRow key={index}>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.label}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(asset.value || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(asset.expected_apy * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell colSpan={3}>Totalt</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalValue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Felmeddelanden */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">Vänligen korrigera följande fel:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.assets?.map((assetError, index) => (
              <li key={index}>
                Tillgång {index + 1}: {Object.values(assetError || {}).map(error => error?.message).filter(Boolean).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={addAsset}
          >
            + Lägg till tillgång
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPensionHelp(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            🏦 Hitta min pension
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onPrevious}>
            ← Tillbaka
          </Button>
          <Button 
            type="submit"
            disabled={Object.keys(errors).length > 0}
          >
            Fortsätt till skulder →
          </Button>
        </div>
      </div>

      {/* Asset Wizard Modal */}
      {showWizard && (
        <AssetWizard
          onAddAsset={handleWizardAdd}
          onSkip={handleWizardSkip}
        />
      )}

      {/* Pension Help Wizard Modal */}
      {showPensionHelp && (
        <PensionHelpWizard
          onAddPension={handlePensionHelpAdd}
          onSkip={handlePensionHelpSkip}
          open={showPensionHelp}
        />
      )}
    </form>
  );
}
