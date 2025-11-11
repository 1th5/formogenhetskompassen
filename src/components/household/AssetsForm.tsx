/**
 * Formulär för redigering av tillgångar
 */

'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Asset, AssetCategory, Liability } from '@/lib/types';
import PensionHelpWizard from '@/components/ui/PensionHelpWizard';
import { getDefaultReturnRate } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { calculateAutoReturns } from '@/lib/fire/calc';

// Schema för formulär (använder procent)
const assetFormSchema = z.object({
  category: z.enum(['Bostad', 'Semesterbostad', 'Bil', 'Fonder & Aktier', 'Sparkonto & Kontanter', 'Trygghetsbaserad pension (Statlig)', 'Tjänstepension', 'Premiepension', 'Privat pensionssparande (IPS)', 'Marknadsbaserad pension', 'Tomt & Mark', 'Maskiner & Utrustning', 'Fordon (övrigt)', 'Ädelmetaller & Smycken', 'Annat'] as const),
  label: z.string().min(1, 'Beskrivning krävs'),
  value: z.number().min(0, 'Värde kan inte vara negativt'),
  expected_apy_percent: z.number().min(-100).max(100, 'APY måste vara mellan -100% och 100%')
});

// Schema för data (använder decimaler som tidigare)
const assetSchema = z.object({
  category: z.enum(['Bostad', 'Semesterbostad', 'Bil', 'Fonder & Aktier', 'Sparkonto & Kontanter', 'Trygghetsbaserad pension (Statlig)', 'Tjänstepension', 'Premiepension', 'Privat pensionssparande (IPS)', 'Marknadsbaserad pension', 'Tomt & Mark', 'Maskiner & Utrustning', 'Fordon (övrigt)', 'Ädelmetaller & Smycken', 'Annat'] as const),
  label: z.string().min(1, 'Beskrivning krävs'),
  value: z.number().min(0, 'Värde kan inte vara negativt'),
  expected_apy: z.number().min(-1).max(1, 'APY måste vara mellan -100% och 100%')
});

const formSchema = z.object({
  assets: z.array(assetFormSchema)
});

type FormData = z.infer<typeof formSchema>;

interface AssetsFormProps {
  assets: Asset[];
  onUpdate: (assets: Asset[]) => void;
  liabilities?: Liability[];
}

export default function AssetsForm({ assets, onUpdate, liabilities = [] }: AssetsFormProps) {
  const [openPensionWizard, setOpenPensionWizard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Konvertera från decimal till procent för formuläret
  // Round to 1 decimal to avoid floating point precision issues (7% → 7.0, not 7.000000000000001)
  const formAssets = assets.map(asset => ({
    ...asset,
    expected_apy_percent: Math.round((asset.expected_apy || 0) * 1000) / 10
  }));
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: formAssets.length > 0 ? formAssets : []
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assets'
  });
  
  const watchedAssets = watch('assets');
  
  const onSubmit = (data: FormData) => {
    // Konvertera från procent till decimaler för sparning
    // Round to avoid floating point precision issues
    const assetsWithDecimals = data.assets.map(asset => ({
      category: asset.category,
      label: asset.label,
      value: asset.value,
      expected_apy: Math.round((asset.expected_apy_percent / 100) * 10000) / 10000
    }));
    onUpdate(assetsWithDecimals);
    
    // Visa bekräftelse
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const addAsset = () => {
    append({
      category: 'Sparkonto & Kontanter' as AssetCategory,
      label: '',
      value: 0,
      // Round to 1 decimal to avoid floating point precision issues
      expected_apy_percent: Math.round(getDefaultReturnRate('Sparkonto & Kontanter') * 1000) / 10
    });
  };
  
  const updateCategory = (index: number, category: AssetCategory) => {
    setValue(`assets.${index}.category`, category);
    // Round to 1 decimal to avoid floating point precision issues
    setValue(`assets.${index}.expected_apy_percent`, Math.round(getDefaultReturnRate(category) * 1000) / 10);
  };
  
  const totalValue = watchedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  // Beräkna viktat avkastningssnitt för olika kategorier
  // Använd samma logik som calculateAutoReturns för att ta hänsyn till nettovärden och skulder
  const calculateWeightedAPY = (categoryFilter: (cat: string) => boolean): number | null => {
    const filtered = watchedAssets.filter(asset => categoryFilter(asset.category));
    if (filtered.length === 0) return null;
    
    const totalValue = filtered.reduce((sum, asset) => sum + (asset.value || 0), 0);
    if (totalValue === 0) return null;
    
    const weightedSum = filtered.reduce((sum, asset) => {
      const apy = asset.expected_apy_percent || 0;
      const value = asset.value || 0;
      return sum + (apy * value);
    }, 0);
    
    return weightedSum / totalValue;
  };
  
  // För pensionstillgångar: använd enkel viktning (de påverkas inte av skulder)
  const statePensionAPY = calculateWeightedAPY(cat => cat === 'Trygghetsbaserad pension (Statlig)');
  // Beräkna separata pensionsavkastningar
  const occPensionAPY = calculateWeightedAPY(cat => {
    const catStr = cat as string;
    return catStr === 'Tjänstepension' || catStr === 'Marknadsbaserad pension'; // Backward compatibility
  });
  const premiePensionAPY = calculateWeightedAPY(cat => cat === 'Premiepension');
  const privatePensionAPY = calculateWeightedAPY(cat => cat === 'Privat pensionssparande (IPS)');
  // Totalt marknadsbaserad pension (för bakåtkompatibilitet)
  const marketPensionAPY = calculateWeightedAPY(cat => {
    const catStr = cat as string;
    return catStr === 'Tjänstepension' || 
           catStr === 'Premiepension' || 
           catStr === 'Privat pensionssparande (IPS)' ||
           catStr === 'Marknadsbaserad pension';
  });
  
  // För övriga tillgångar: använd calculateAutoReturns för att få rätt nettovärde-baserad beräkning
  // Konvertera watchedAssets till Asset-format (expected_apy som decimal)
  const assetsForCalculation: Asset[] = watchedAssets.map(asset => ({
    ...asset,
    expected_apy: (asset.expected_apy_percent || 0) / 100
  }));
  
  // Använd calculateAutoReturns med default inflation 2% för att få nominella avkastningar
  const autoReturns = calculateAutoReturns(assetsForCalculation, 0.02, 0.07, liabilities);
  const otherAssetsAPY = Number.isFinite(autoReturns.nomAvailable) 
    ? autoReturns.nomAvailable * 100 
    : calculateWeightedAPY(cat => 
        cat !== 'Trygghetsbaserad pension (Statlig)' && 
        cat !== 'Tjänstepension' &&
        cat !== 'Premiepension' &&
        cat !== 'Privat pensionssparande (IPS)' &&
        cat !== 'Marknadsbaserad pension' // Backward compatibility
      );
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* CTA till pensions-wizard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-primary/70">
          Lägg till ditt pensionssparande smidigt via guiden.
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="default" onClick={() => setOpenPensionWizard(true)}>
            Hitta din pension
          </Button>
        </div>
      </div>
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
                      <SelectItem value="Tjänstepension">💼 Tjänstepension</SelectItem>
                      <SelectItem value="Premiepension">📈 Premiepension</SelectItem>
                      <SelectItem value="Privat pensionssparande (IPS)">💰 Privat pensionssparande (IPS)</SelectItem>
                      <SelectItem value="Marknadsbaserad pension">📊 Marknadsbaserad pension (bakåtkompatibilitet)</SelectItem>
                      <SelectItem value="Tomt & Mark">🌳 Tomt & Mark</SelectItem>
                      <SelectItem value="Maskiner & Utrustning">⚙️ Maskiner & Utrustning</SelectItem>
                      <SelectItem value="Fordon (övrigt)">🚛 Fordon (övrigt)</SelectItem>
                      <SelectItem value="Ädelmetaller & Smycken">💎 Ädelmetaller & Smycken</SelectItem>
                      <SelectItem value="Annat">📦 Annat</SelectItem>
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
                
                <div>
                  <Label htmlFor={`assets.${index}.expected_apy_percent`}>
                    Förväntad årlig avkastning (%)
                  </Label>
                  <Input
                    id={`assets.${index}.expected_apy_percent`}
                    type="number"
                    step="0.1"
                    min="-100"
                    max="100"
                    inputMode="decimal"
                    {...control.register(`assets.${index}.expected_apy_percent`, { 
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
                    placeholder="7"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ange i procent (t.ex. 7 för 7% per år)
                  </p>
                  {errors.assets?.[index]?.expected_apy_percent && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.assets[index]?.expected_apy_percent?.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summering */}
      {watchedAssets.length > 0 && (
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
                      {(watchedAssets[index]?.expected_apy_percent || 0).toFixed(1)}%
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
            
            {/* Viktat avkastningssnitt per kategori */}
            {(statePensionAPY !== null || marketPensionAPY !== null || otherAssetsAPY !== null) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-primary mb-3">Viktat avkastningssnitt</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {statePensionAPY !== null && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">Inkomstpension</p>
                      <p className="text-lg font-bold text-blue-900">{statePensionAPY.toFixed(1)}%</p>
                      <p className="text-xs text-blue-600 mt-1">Trygghetsbaserad pension (Statlig)</p>
                    </div>
                  )}
                  {occPensionAPY !== null && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-700 font-medium mb-1">Tjänstepension</p>
                      <p className="text-lg font-bold text-purple-900">{occPensionAPY.toFixed(1)}%</p>
                    </div>
                  )}
                  {premiePensionAPY !== null && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-xs text-indigo-700 font-medium mb-1">Premiepension</p>
                      <p className="text-lg font-bold text-indigo-900">{premiePensionAPY.toFixed(1)}%</p>
                    </div>
                  )}
                  {privatePensionAPY !== null && (
                    <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                      <p className="text-xs text-violet-700 font-medium mb-1">Privat pensionssparande (IPS)</p>
                      <p className="text-lg font-bold text-violet-900">{privatePensionAPY.toFixed(1)}%</p>
                    </div>
                  )}
                  {marketPensionAPY !== null && (occPensionAPY === null && premiePensionAPY === null && privatePensionAPY === null) && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-700 font-medium mb-1">Marknadsbaserad pension</p>
                      <p className="text-lg font-bold text-purple-900">{marketPensionAPY.toFixed(1)}%</p>
                      <p className="text-xs text-purple-600 mt-1">Premiepension, tjänstepension, IPS (bakåtkompatibilitet)</p>
                    </div>
                  )}
                  {otherAssetsAPY !== null && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">Övriga tillgångar</p>
                      <p className="text-lg font-bold text-green-900">{otherAssetsAPY.toFixed(1)}%</p>
                      <p className="text-xs text-green-600 mt-1">Fonder, aktier, bostäder, etc.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            variant="secondary"
            onClick={addAsset}
          >
            + Lägg till tillgång
          </Button>
          
          <Button type="submit" className={showSuccess ? 'bg-green-600 hover:bg-green-700' : ''}>
            {showSuccess ? '✓ Sparat' : 'Spara ändringar'}
          </Button>
        </div>
      </div>

      {/* Pension wizard dialog */}
      <PensionHelpWizard
        open={openPensionWizard}
        onSkip={() => setOpenPensionWizard(false)}
        onAddPension={({ label, value, expected_apy, category }) => {
          append({
            category: category as AssetCategory,
            label,
            value,
            // Round to 1 decimal to avoid floating point precision issues (7% → 7.0, not 7.000000000000001)
            expected_apy_percent: Math.round(expected_apy * 1000) / 10, // Konvertera decimal till procent
          });
          setOpenPensionWizard(false);
        }}
      />
    </form>
  );
}
