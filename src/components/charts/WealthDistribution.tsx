/**
 * Förmögenhetsfördelning - tillgångar vs skulder
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Asset, Liability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';

interface WealthDistributionProps {
  assets: Asset[];
  liabilities: Liability[];
}

export default function WealthDistribution({ assets, liabilities }: WealthDistributionProps) {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.principal, 0);
  
  const data = [
    {
      name: 'Tillgångar',
      value: totalAssets,
      color: '#0E5E4B', // success
    },
    {
      name: 'Skulder',
      value: totalLiabilities,
      color: '#C88C3C', // danger (varm röd/terracotta)
    },
  ];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-slate-200/40 rounded-2xl shadow-card">
          <p className="font-serif text-primary">{label}</p>
          <p className="text-primary/70">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 24, left: 56, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD3" />
          <XAxis dataKey="name" stroke="#001B2B" tick={{ fill: '#001B2B' }} />
          <YAxis width={72} tickFormatter={(value) => formatCurrency(value)} stroke="#001B2B" tick={{ fill: '#001B2B' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8,8,0,0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
