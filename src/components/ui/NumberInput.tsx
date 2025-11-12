'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  id: string;
  label: string;
  value: number | '' | undefined | null;
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  placeholder?: string;
  allowDecimal?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  forceNumberType?: boolean; // För ålder/pensionsålder - använd type="number"
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  disabled = false,
  placeholder,
  allowDecimal = false,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  forceNumberType = false,
}: NumberInputProps) {
  // Lokal state för input-värdet för att tillåta fritt skrivande
  const [localValue, setLocalValue] = useState<string>(
    (value === '' || value === undefined || value === null) ? '' : String(value)
  );
  const [isFocused, setIsFocused] = useState(false);

  // Synka lokal state när prop-värdet ändras externt (bara om fältet inte är fokuserat)
  useEffect(() => {
    if (!isFocused) {
      const propValue = (value === '' || value === undefined || value === null) ? '' : String(value);
      if (propValue !== localValue) {
        setLocalValue(propValue);
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Tillåt tom sträng
    if (inputValue === '') {
      setLocalValue('');
      onChange('');
      return;
    }
    
    // För type="text" (när forceNumberType=false), tillåt användaren att skriva fritt
    // Filtrera bort icke-numeriska tecken (förutom decimaltecken om allowDecimal)
    let cleanedValue = inputValue;
    if (allowDecimal) {
      // Tillåt siffror, komma och punkt
      cleanedValue = inputValue.replace(/[^\d,.]/g, '');
    } else {
      // Bara siffror för heltal
      cleanedValue = inputValue.replace(/[^\d]/g, '');
    }
    
    // Uppdatera lokal state med det rensade värdet för att tillåta fritt skrivande
    setLocalValue(cleanedValue);
    
    // Om det inte finns några siffror kvar efter rensning, tillåt tom sträng
    if (cleanedValue === '') {
      onChange('');
      return;
    }
    
    // Parse till number
    const num = allowDecimal 
      ? parseFloat(cleanedValue.replace(',', '.'))
      : parseInt(cleanedValue, 10);
    
    if (isNaN(num)) {
      // Om parsing misslyckas helt, ignorera men behåll lokal state
      return;
    }
    
    // Clamp till min/max om satta, men bara om värdet är komplett (inte medan användaren skriver)
    // Tillåt partiella värden medan användaren skriver (t.ex. "1" medan de skriver "18")
    let clamped = num;
    
    if (min !== undefined && clamped < min) {
      // Om värdet är för lågt, tillåt användaren att fortsätta skriva om det är en partiell inmatning
      // (t.ex. om min är 18 och användaren skriver "1", låt dem fortsätta till "18")
      const minStr = String(min);
      const numStr = String(num);
      if (numStr.length < minStr.length || numStr === minStr.substring(0, numStr.length)) {
        // Detta är en partiell inmatning, tillåt den
        onChange(num);
        return;
      }
      // Annars clamp:a till min
      clamped = min;
      setLocalValue(String(clamped));
    }
    
    if (max !== undefined && clamped > max) {
      // För max, clamp:a direkt om värdet överskrider
      clamped = max;
      setLocalValue(String(clamped));
    }
    
    onChange(clamped);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // När användaren lämnar fältet, säkerställ att värdet är korrekt formaterat
    const propValue = (value === '' || value === undefined || value === null) ? '' : String(value);
    setLocalValue(propValue);
  };

  const displayValue = localValue;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm">
        {label}
        {suffix && <span className="ml-1 text-gray-500">{suffix}</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={forceNumberType ? 'number' : 'text'}
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          pattern={forceNumberType ? undefined : (allowDecimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*')}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={forceNumberType ? min : undefined}
          max={forceNumberType ? max : undefined}
          step={forceNumberType ? (step ?? 1) : undefined}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-white"
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

