/**
 * Utility-funktioner för nummerhantering
 */

/**
 * Konverterar svenskformaterade belopp ("1 234,56" eller "1234.56") till JavaScript-nummer
 * Hanterar mellanslag, komma och punkt som decimalseparator
 */
export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // Ta bort mellanslag och ersätt komma med punkt
  const cleaned = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

