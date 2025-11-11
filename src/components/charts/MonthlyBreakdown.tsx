/**
 * Månatlig uppdelning av förmögenhetsökning
 */

'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MonthlyIncreaseBreakdown, Asset, Liability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { calculateAutoReturns } from '@/lib/fire/calc';

interface MonthlyBreakdownProps {
  breakdown: MonthlyIncreaseBreakdown;
  assets?: Asset[];
  liabilities?: Liability[];
}

export default function MonthlyBreakdown({ breakdown, assets = [], liabilities = [] }: MonthlyBreakdownProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Separera statlig pension och de tre marknadsbaserade pensionskategorierna med sina avkastningar
  const publicPensionTotal = (breakdown.publicPensionContributions || 0) + (breakdown.publicPensionReturns || 0);
  const occPensionTotal = (breakdown.occupationalPensionContributions || 0) + (breakdown.occupationalPensionReturns || 0);
  const premiePensionTotal = (breakdown.premiePensionContributions || 0) + (breakdown.premiePensionReturns || 0);
  const privatePensionTotal = (breakdown.privatePensionContributions || 0) + (breakdown.privatePensionReturns || 0);
  
  // För bakåtkompatibilitet: räkna samman marknadsbaserad pension
  const marketPensionTotal = occPensionTotal + premiePensionTotal + privatePensionTotal;
  
  // Beräkna avkastning på icke-pensionstillgångar
  const nonPensionAssetReturns = (breakdown.assetReturns || 0) 
    - (breakdown.publicPensionReturns || 0) 
    - (breakdown.occupationalPensionReturns || 0)
    - (breakdown.premiePensionReturns || 0)
    - (breakdown.privatePensionReturns || 0);
  
  // Beräkna viktat avkastningssnitt för olika kategorier
  // Använd calculateAutoReturns för att få rätt nettovärde-baserad beräkning (samma som FIRE-simulatorn)
  const autoReturns = calculateAutoReturns(assets, 0.02, 0.07, liabilities);
  
  // För pensionstillgångar: använd enkel viktning (de påverkas inte av skulder)
  const calculateWeightedAPY = (categoryFilter: (cat: string) => boolean): number | null => {
    const filtered = assets.filter(asset => categoryFilter(asset.category));
    if (filtered.length === 0) return null;
    
    const totalValue = filtered.reduce((sum, asset) => sum + (asset.value || 0), 0);
    if (totalValue === 0) return null;
    
    const weightedSum = filtered.reduce((sum, asset) => {
      const apy = asset.expected_apy || 0;
      const value = asset.value || 0;
      return sum + (apy * value);
    }, 0);
    
    return (weightedSum / totalValue) * 100; // Konvertera till procent
  };
  
  const statePensionAPY = calculateWeightedAPY(cat => cat === 'Trygghetsbaserad pension (Statlig)');
  const occPensionAPY = calculateWeightedAPY(cat => {
    const catStr = cat as string;
    return catStr === 'Tjänstepension' || catStr === 'Marknadsbaserad pension' || catStr === 'Pensionssparande'; // Backward compatibility
  });
  const premiePensionAPY = calculateWeightedAPY(cat => cat === 'Premiepension');
  const privatePensionAPY = calculateWeightedAPY(cat => cat === 'Privat pensionssparande (IPS)');
  // För bakåtkompatibilitet
  const marketPensionAPY = calculateWeightedAPY(cat => {
    const catStr = cat as string;
    return catStr === 'Tjänstepension' || 
           catStr === 'Premiepension' || 
           catStr === 'Privat pensionssparande (IPS)' ||
           catStr === 'Marknadsbaserad pension' ||
           catStr === 'Pensionssparande';
  });
  
  // För övriga tillgångar: använd calculateAutoReturns för att få rätt nettovärde-baserad beräkning
  const otherAssetsAPY = Number.isFinite(autoReturns.nomAvailable) 
    ? autoReturns.nomAvailable * 100 
    : calculateWeightedAPY(cat => {
        const catStr = cat as string;
        return         catStr !== 'Trygghetsbaserad pension (Statlig)' && 
               catStr !== 'Tjänstepension' &&
               catStr !== 'Premiepension' &&
               catStr !== 'Privat pensionssparande (IPS)' &&
               catStr !== 'Marknadsbaserad pension' && // Backward compatibility
               catStr !== 'Pensionssparande'; // Backward compatibility
      });
  
  const data = [
    {
      name: 'Avkastning (övrigt)',
      value: nonPensionAssetReturns,
      color: '#0E5E4B', // success (grön) för positiv avkastning
    },
    {
      name: 'Amortering',
      value: breakdown.amortization,
      color: '#C47A2C', // amber – konsekvent med övriga accenter
    },
    {
      name: 'Statlig pension',
      value: publicPensionTotal,
      color: '#4A84C1', // info (blå) för statlig pension
    },
    {
      name: 'Tjänstepension',
      value: occPensionTotal,
      color: '#9333EA', // purple för tjänstepension
    },
    {
      name: 'Premiepension',
      value: premiePensionTotal,
      color: '#6366F1', // indigo för premiepension
    },
    {
      name: 'IPS',
      value: privatePensionTotal,
      color: '#8B5CF6', // violet för IPS
    },
    {
      name: 'Övrigt sparande',
      value: breakdown.otherSavings,
      color: '#001B2B', // primary
    },
  ].filter(item => item.value > 0); // Filtrera bort nollvärden
  
  const CustomTooltip = ({ active, payload }: any) => {
    // Prioritera hover (active) över tap/click (activeIndex)
    // På desktop fungerar hover, på mobil används activeIndex
    const shouldShow = active || (activeIndex !== null && !active);
    
    // Om hover är aktiv, använd hover-data
    if (active && payload && payload.length) {
      const hoverData = payload[0];
      const name = hoverData.name;
      let description = '';
      
      // Lägg till beskrivning för olika kategorier
      if (name === 'Statlig pension') {
        const contributions = breakdown.publicPensionContributions || 0;
        const returns = breakdown.publicPensionReturns || 0;
        const apyText = statePensionAPY !== null ? `\nAvkastning: ${statePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Tjänstepension') {
        const contributions = breakdown.occupationalPensionContributions || 0;
        const returns = breakdown.occupationalPensionReturns || 0;
        const apyText = occPensionAPY !== null ? `\nAvkastning: ${occPensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Premiepension') {
        const contributions = breakdown.premiePensionContributions || 0;
        const returns = breakdown.premiePensionReturns || 0;
        const apyText = premiePensionAPY !== null ? `\nAvkastning: ${premiePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'IPS') {
        const contributions = breakdown.privatePensionContributions || 0;
        const returns = breakdown.privatePensionReturns || 0;
        const apyText = privatePensionAPY !== null ? `\nAvkastning: ${privatePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Avkastning (övrigt)') {
        const apyText = otherAssetsAPY !== null ? `\nAvkastning: ${otherAssetsAPY.toFixed(1)}%` : '';
        description = `Avkastning från dina övriga tillgångar som fonder, aktier, bostäder, sparkonton och andra tillgångar (exklusive pensionstillgångar).${apyText}`;
      }
      
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-slate-200/40 rounded-2xl shadow-card">
          <p className="font-serif text-primary font-medium">{hoverData.name}</p>
          <p className="text-primary/70 font-semibold">{formatCurrency(hoverData.value)}/mån</p>
          {description && (
            <p className="text-primary/60 text-xs mt-1 whitespace-pre-line">{description}</p>
          )}
        </div>
      );
    }
    
    // Om tap/click är aktiv (och inte hover), använd activeIndex-data
    if (shouldShow && activeIndex !== null && data[activeIndex]) {
      const selectedData = data[activeIndex];
      const name = selectedData.name;
      let description = '';
      
      // Lägg till beskrivning för olika kategorier
      if (name === 'Statlig pension') {
        const contributions = breakdown.publicPensionContributions || 0;
        const returns = breakdown.publicPensionReturns || 0;
        const apyText = statePensionAPY !== null ? `\nAvkastning: ${statePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Tjänstepension') {
        const contributions = breakdown.occupationalPensionContributions || 0;
        const returns = breakdown.occupationalPensionReturns || 0;
        const apyText = occPensionAPY !== null ? `\nAvkastning: ${occPensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Premiepension') {
        const contributions = breakdown.premiePensionContributions || 0;
        const returns = breakdown.premiePensionReturns || 0;
        const apyText = premiePensionAPY !== null ? `\nAvkastning: ${premiePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'IPS') {
        const contributions = breakdown.privatePensionContributions || 0;
        const returns = breakdown.privatePensionReturns || 0;
        const apyText = privatePensionAPY !== null ? `\nAvkastning: ${privatePensionAPY.toFixed(1)}%` : '';
        description = `Bidrag: ${formatCurrency(contributions)}, Avkastning: ${formatCurrency(returns)}${apyText}`;
      } else if (name === 'Avkastning (övrigt)') {
        const apyText = otherAssetsAPY !== null ? `\nAvkastning: ${otherAssetsAPY.toFixed(1)}%` : '';
        description = `Avkastning från dina övriga tillgångar som fonder, aktier, bostäder, sparkonton och andra tillgångar (exklusive pensionstillgångar).${apyText}`;
      }
      
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-slate-200/40 rounded-2xl shadow-card">
          <p className="font-serif text-primary font-medium">{selectedData.name}</p>
          <p className="text-primary/70 font-semibold">{formatCurrency(selectedData.value)}/mån</p>
          {description && (
            <p className="text-primary/60 text-xs mt-1 whitespace-pre-line">{description}</p>
          )}
        </div>
      );
    }
    
    return null;
  };

  const handlePieClick = (data: any, index: number, e: any) => {
    e.stopPropagation(); // Förhindra att klicket bubblar upp
    // Toggle: om samma segment klickas igen, dölj tooltip
    // Detta är främst för mobil, på desktop fungerar hover
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  // Nollställ activeIndex när hover startar (för att låta hover ta över på desktop)
  const handleMouseEnter = () => {
    // På desktop, låt hover hantera tooltip
    // Vi behåller activeIndex för mobil, men hover prioriteras i CustomTooltip
  };

  const handleMouseLeave = () => {
    // När hover försvinner, behåll activeIndex om det är satt (för mobil)
    // Om activeIndex är satt men hover försvinner, behåll det för att visa tooltip på mobil
  };
  
  return (
    <div className="h-64" onClick={(e) => {
      // Om klicket inte är på själva Pie-komponenten, dölj tooltip
      if (activeIndex !== null && (e.target as HTMLElement).closest('.recharts-pie')) {
        // Klicket är på pie-chart, låt handlePieClick hantera det
        return;
      }
      // Annars dölj tooltip
      if (activeIndex !== null) {
        setActiveIndex(null);
      }
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            onClick={handlePieClick}
            // Sätt activeIndex bara när det inte finns hover (för mobil)
            // activeIndex blockeras när hover är aktiv eftersom Recharts prioriterar hover
            activeIndex={undefined}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{ cursor: 'pointer' }}
                // Dimma bara när activeIndex är satt OCH det inte är hover (för mobil)
                opacity={1}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            // Låt Recharts hantera hover naturligt, activeIndex hanteras i CustomTooltip
          />
          <Legend 
            formatter={(value: string) => {
              // Förbättra legend-labels för att vara mer tydliga
              if (value === 'Statlig pension') {
                return 'Statlig pension (Trygghetsbaserad)';
              } else if (value === 'Marknadsbaserad pension') {
                return 'Marknadsbaserad pension';
              }
              return value;
            }}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
