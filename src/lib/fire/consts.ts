/**
 * Konstanter för FIRE-kalkylatorn
 */

// Default-fördelning av pensionskapital i Quick-läge
export const DEFAULT_PENSION_DISTRIBUTION = {
  TP: 0.60,  // Tjänstepension: 60%
  PP: 0.20,  // Premiepension: 20%
  IPS: 0.10, // IPS: 10%
  STATE: 0.10, // Statlig pension: 10% (grundbelopp)
} as const;

// Default pensionskapital i Quick-läge (låst)
export const QUICK_DEFAULT_LOCKED_PENSION = 500_000;

// Validering: ålder och pensionsålder
export const MIN_AGE = 18;
export const MAX_AGE = 67; // Max ålder är 67 år
export const MIN_PENSION_AGE = 18;
export const MAX_PENSION_AGE = 75;

// Default-värden
export const DEFAULT_AGE = 40;
export const DEFAULT_PENSION_AGE = 63;

