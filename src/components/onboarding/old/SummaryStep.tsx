/**
 * Steg 4: Sammanfattning och spara
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { calculateWealthMetrics, WEALTH_LEVELS } from '@/lib/wealth/calc';
import { formatCurrency, formatMonthlyIncrease, formatYears } from '@/lib/utils/format';
import { Person, Asset, Liability } from '@/lib/types';

interface SummaryStepProps {
  onComplete: (data: { persons: Person[]; assets: Asset[]; liabilities: Liability[] }) => void;
  onPrevious: () => void;
}

export default function SummaryStep({ onComplete, onPrevious }: SummaryStepProps) {
  const router = useRouter();
  const { getOnboardingData } = useHouseholdStore();
  const data = getOnboardingData();
  
  // Beräkna förmögenhetsmått
  const metrics = calculateWealthMetrics(data.assets, data.liabilities, data.persons);
  const currentLevel = WEALTH_LEVELS.find(level => level.level === metrics.currentLevel);
  
  const handleComplete = () => {
    onComplete(data);
    router.push('/dashboard');
  };
  
  const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.principal, 0);
  
  return (
    <div className="space-y-6">
      {/* Sammanfattning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👥 Personer ({data.persons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.persons.map((person, index) => {
                // Beräkna total inkomst från alla personens inkomster
                const totalIncome = person.incomes?.reduce((sum, income) => {
                  if (income.income_type === 'job') {
                    return sum + income.monthly_income;
                  } else {
                    return sum + (income.monthly_income / 12);
                  }
                }, 0) || 0;
                
                return (
                  <div key={index} className="flex justify-between">
                    <span>{person.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(totalIncome)}/mån
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Tillgångar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💰 Tillgångar ({data.assets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.assets.map((asset, index) => (
                <div key={index} className="flex justify-between">
                  <span>{asset.label}</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(asset.value)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 font-semibold">
                Totalt: {formatCurrency(totalAssets)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Skulder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📉 Skulder ({data.liabilities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.liabilities.map((liability, index) => (
                <div key={index} className="flex justify-between">
                  <span>{liability.label}</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(liability.principal)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 font-semibold">
                Totalt: {formatCurrency(totalLiabilities)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Förmögenhetsmått */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Förmögenhetsmått</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Nettoförmögenhet:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(metrics.netWorth)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Månatlig ökning:</span>
                <span className="font-semibold text-green-600">
                  {formatMonthlyIncrease(metrics.increasePerMonth)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nuvarande nivå:</span>
                <span className="font-semibold">
                  Nivå {metrics.currentLevel} - {currentLevel?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hastighet:</span>
                <span className={`font-semibold ${
                  metrics.speedIndex >= 1 ? 'text-green-600' : 
                  metrics.speedIndex >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.speedText}
                </span>
              </div>
              {metrics.yearsToNextLevel && (
                <div className="flex justify-between">
                  <span>Tid till nästa nivå:</span>
                  <span className="font-semibold">
                    {formatYears(metrics.yearsToNextLevel)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Aktuell nivå beskrivning */}
      {currentLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              🗺️ Nivå {currentLevel.level}: {currentLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{currentLevel.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">✅ Fördelar</h4>
                <p className="text-sm text-gray-600">{currentLevel.pros}</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">⚠️ Utmaningar</h4>
                <p className="text-sm text-gray-600">{currentLevel.cons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Knappar */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          ← Tillbaka
        </Button>
        
        <Button onClick={handleComplete}>
          Klar - Gå till översikt
        </Button>
      </div>
    </div>
  );
}
