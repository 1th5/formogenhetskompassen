/**
 * Komponent för att visa förhandsvisning av pensionsavsättningar
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatePublicPension, calculateOccupationalPension, calculateExtraPension, calculateIncomePension, calculatePremiePension } from '@/lib/wealth/calc';
import { Person } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';

interface PensionPreviewProps {
  person: Partial<Person>;
}

export default function PensionPreview({ person }: PensionPreviewProps) {
  const [calculations, setCalculations] = useState({
    incomePension: 0,
    premiePension: 0,
    occupationalPension: 0,
    extraPension: 0,
    ips: 0,
    totalPension: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !person || !person.incomes) return;

    // Normalisera person-data: konvertera custom_tp_rate från procent till decimal
    // VIKTIGT: I PensionPreview kommer person-data från formulär, så custom_tp_rate är ALLTID i procent-format
    // Input är procent: 10 för 10%, 0.1 för 0.1%
    // Vi måste ALLTID dividera med 100 för att få decimal: 10 → 0.1, 0.1 → 0.001
    const normalizedPerson: Person = {
      ...(person as Person),
      incomes: (person as Person).incomes?.map(income => {
        if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
          const rate = typeof income.custom_tp_rate === 'number' ? income.custom_tp_rate : parseFloat(String(income.custom_tp_rate));
          if (!isNaN(rate)) {
            // Data från formulär är alltid i procent-format, dividera med 100
            // 10 → 0.1 (10% → 0.1 decimal)
            // 0.1 → 0.001 (0.1% → 0.001 decimal)
            return {
              ...income,
              custom_tp_rate: rate / 100
            };
          }
        }
        return income;
      }) || []
    };

    // Beräkna pensionsavsättningar med normaliserad data
    const incomePension = calculateIncomePension(normalizedPerson);
    const premiePension = calculatePremiePension(normalizedPerson);
    const occupationalPension = calculateOccupationalPension(normalizedPerson);
    const extraPension = calculateExtraPension(normalizedPerson);
    const ips = normalizedPerson.ips_monthly || 0;
    const totalPension = incomePension + premiePension + occupationalPension + extraPension + ips;

    setCalculations({
      incomePension,
      premiePension,
      occupationalPension,
      extraPension,
      ips,
      totalPension
    });
  }, [
    isClient,
    person,
    person?.birth_year,
    person?.incomes,
    // Inkludera alla relevanta fält från incomes
    person?.incomes?.map(income => income.monthly_income).join(','),
    person?.incomes?.map(income => income.pension_type).join(','),
    person?.incomes?.map(income => income.custom_tp_rate).join(','),
    person?.incomes?.map(income => income.custom_tp_amount).join(','),
    person?.incomes?.map(income => income.tp_input_type).join(','),
    person?.incomes?.map(income => income.salary_exchange_monthly).join(','),
    (person as Person)?.ips_monthly
  ]);

  // Beräkna total månadsinkomst
  const totalMonthlyIncome = person?.incomes?.reduce((sum, income) => sum + income.monthly_income, 0) || 0;

  // Visa inte om ingen lön är angiven, saknar incomes eller om vi inte är på klienten än
  if (totalMonthlyIncome <= 0 || !isClient || !person?.incomes || person.incomes.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          Pensionsavsättningar per månad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trygghetsbaserad pension</div>
          <div className="flex justify-between items-center pl-2">
            <span className="text-sm text-gray-600">Inkomstpension (Statlig)</span>
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(calculations.incomePension)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marknadsbaserad pension</div>
          <div className="flex justify-between items-center pl-2">
            <span className="text-sm text-gray-600">Premiepension</span>
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(calculations.premiePension)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center pl-2">
            <span className="text-sm text-gray-600">Tjänstepension</span>
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(calculations.occupationalPension)}
            </Badge>
          </div>

          {calculations.extraPension > 0 && (
            <div className="flex justify-between items-center pl-2">
              <span className="text-sm text-gray-600">Löneväxling</span>
              <Badge variant="secondary" className="font-mono">
                {formatCurrency(calculations.extraPension)}
              </Badge>
            </div>
          )}

          {calculations.ips > 0 && (
            <div className="flex justify-between items-center pl-2">
              <span className="text-sm text-gray-600">IPS</span>
              <Badge variant="secondary" className="font-mono">
                {formatCurrency(calculations.ips)}
              </Badge>
            </div>
          )}
        </div>

        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">Totalt</span>
            <Badge variant="default" className="font-mono">
              {formatCurrency(calculations.totalPension)}
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Baserat på {formatCurrency(totalMonthlyIncome)}/månad
        </div>
      </CardContent>
    </Card>
  );
}