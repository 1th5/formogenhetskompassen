/**
 * Utility-funktioner för formatering av tal och text
 */

/**
 * Formaterar belopp som svenska kronor
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formaterar belopp som svenska kronor med decimaler
 */
export function formatCurrencyWithDecimals(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formaterar procent
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formaterar år
 */
export function formatYears(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} månad${months !== 1 ? 'er' : ''}`;
  }
  
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  
  if (months === 0) {
    return `${wholeYears} år`;
  }
  
  return `${wholeYears} år och ${months} månad${months !== 1 ? 'er' : ''}`;
}

/**
 * Formaterar stora tal med K/M/B suffix
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formaterar månatlig ökning med +/- prefix
 */
export function formatMonthlyIncrease(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount));
  return amount >= 0 ? `+${formatted}/mån` : `-${formatted}/mån`;
}

/**
 * Genererar anonymt användarnamn
 */
export function generateAnonymousUsername(): string {
  const adjectives = [
    'Trygga', 'Kloka', 'Stabila', 'Visa', 'Modiga', 'Trogna', 'Roliga', 'Snälla',
    'Tålmodiga', 'Ärliga', 'Glada', 'Kärleksfulla', 'Omhändertagande', 'Stolta',
    'Optimistiska', 'Balanserade', 'Framgångsrika', 'Lyckliga', 'Fokuserade'
  ];
  
  const nouns = [
    'Räv', 'Björn', 'Hund', 'Katt', 'Örn', 'Varg', 'Häst', 'Delfin', 'Tiger',
    'Lejon', 'Falk', 'Uggla', 'Panda', 'Val', 'Haj', 'Delfin', 'Fisk', 'Fågel',
    'Kanin', 'Hare', 'Ekorre', 'Mård', 'Lodjur', 'Löpare', 'Springare'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}-${number}`;
}

/**
 * Validerar om användarnamn är tillgängligt (enkelt format-check)
 */
export function isValidUsername(username: string): boolean {
  // Tillåter bokstäver, siffror och bindestreck
  return /^[a-zA-Z0-9-]+$/.test(username) && username.length >= 3 && username.length <= 20;
}

/**
 * Formaterar progress som procent
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

/**
 * Hämtar färg baserat på hastighetsindex
 */
export function getSpeedColor(speedIndex: number): string {
  // brand-aligned semantic colors
  if (speedIndex >= 2) return 'text-success';       // mycket snabb
  if (speedIndex >= 1) return 'text-info';          // snabb
  if (speedIndex >= 0.5) return 'text-warning';     // medel
  return 'text-danger';                              // långsam
}

/**
 * Hämtar bakgrundsfärg baserat på hastighetsindex
 * Diskret men tydlig färgläggning enligt nordisk premium-profil
 * Använder rgba direkt för att säkerställa att färgerna appliceras korrekt
 */
export function getSpeedBgColor(speedIndex: number): string {
  // Konverterar hex till rgba med opacity
  // success: #0E5E4B -> rgb(14, 94, 75)
  if (speedIndex >= 2) return '!bg-[rgba(14,94,75,0.20)] !border-[rgba(14,94,75,0.45)]'; // success - grön
  // info: #4A84C1 -> rgb(74, 132, 193)
  if (speedIndex >= 1) return '!bg-[rgba(74,132,193,0.20)] !border-[rgba(74,132,193,0.45)]'; // info - blå
  // warning: #C47A2C -> rgb(196, 122, 44)
  if (speedIndex >= 0.5) return '!bg-[rgba(196,122,44,0.20)] !border-[rgba(196,122,44,0.45)]'; // warning - orange
  // danger: #C88C3C -> rgb(200, 140, 60)
  return '!bg-[rgba(200,140,60,0.20)] !border-[rgba(200,140,60,0.45)]'; // danger - guld
}
