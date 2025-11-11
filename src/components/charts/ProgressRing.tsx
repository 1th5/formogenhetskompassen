/**
 * Progress ring för att visa framsteg mot nästa nivå
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatYears, formatCurrency } from '@/lib/utils/format';
import { getProgressTheme } from '@/lib/progressTheme';

interface ProgressRingProps {
  progress: number;
  currentLevel: number;
  yearsToNext: number | null;
  nextLevelTarget?: number | null;
}

export default function ProgressRing({ progress, currentLevel, yearsToNext, nextLevelTarget }: ProgressRingProps) {
  // Map progress to color: low → muted blue/teal, mid → green, high → amber, near goal → light gold
  const ringColor = progress >= 0.9
    ? '#EADBB6'
    : progress >= 0.6
      ? '#C47A2C'
      : progress >= 0.25
        ? '#0E5E4B'
        : '#6A7174';

  const data = [
    { name: 'Framsteg', value: progress * 100, fill: ringColor },
    { name: 'Kvar', value: (1 - progress) * 100, fill: '#E7DFD3' }
  ];
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centrerad text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-serif text-primary">
            {Math.round(progress * 100)}%
          </div>
          <div className="text-sm text-primary/70 text-center">
            mot nivå {currentLevel + 1}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-serif text-primary">
          Nivå {currentLevel}
        </div>
        {yearsToNext && (
          <div className="text-sm text-primary/70">
            {formatYears(yearsToNext)} till nästa nivå
          </div>
        )}
        {nextLevelTarget && (
          <div className="text-xs text-primary/60 mt-1">
            Mål: {formatCurrency(nextLevelTarget)}
          </div>
        )}
      </div>
    </div>
  );
}
