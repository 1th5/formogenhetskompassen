'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoIconProps {
  title: string;
  description: string;
}

export function InfoIcon({ title, description }: InfoIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.info-tooltip-container')) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTooltip]);

  return (
    <div className="relative info-tooltip-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 p-1 transition-colors cursor-help focus:outline-none"
        aria-label="Visa förklaring"
      >
        <Info className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 top-8 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-sm text-gray-700">
          <p className="font-medium mb-2">{title}</p>
          <div className="text-xs leading-relaxed">
            {description
              .replace(/\\n/g, '\n')
              .split('\n')
              .map((line, index, array) => {
                if (line === '' && index < array.length - 1) {
                  return <div key={index} className="mb-2" />;
                }
                if (line === '') {
                  return null;
                }
                return (
                  <p key={index} className={index > 0 && array[index - 1] === '' ? 'mt-2' : ''}>
                    {line}
                  </p>
                );
              })
              .filter(Boolean)}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="mt-3 text-primary hover:text-primary/80 text-xs font-medium"
          >
            Stäng
          </button>
        </div>
      )}
    </div>
  );
}

