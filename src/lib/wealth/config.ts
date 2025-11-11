/**
 * Konfiguration för förmögenhetsberäkningar
 * Läser från miljövariabler med fallback till standardvärden
 */

import { WealthConfig } from '@/lib/types';

/**
 * Hämtar konfiguration från miljövariabler med fallback
 */
export function getConfig(): WealthConfig {
  return {
    // Inkomstbasbelopp (IBB) per år (2025: 80 600 kr)
    IBB_ANNUAL: Number(process.env.NEXT_PUBLIC_IBB_ANNUAL) || 80600,
    
    // Allmän pensionsavsättning (18.5% av PGI)
    PUBLIC_PENSION_RATE: Number(process.env.NEXT_PUBLIC_PUBLIC_PENSION_RATE) || 0.185,
    
    // Premiepensionsavsättning (2.5% av PGI, del av allmän pension)
    PREMIEPENSION_RATE: Number(process.env.NEXT_PUBLIC_PREMIEPENSION_RATE) || 0.025,
    
    // Pensionsgrundande inkomst (93% av kvalificerad inkomst)
    PENSIONABLE_INCOME_RATE: Number(process.env.NEXT_PUBLIC_PENSIONABLE_INCOME_RATE) || 0.93,
    
    // Max pensionsgrundande inkomst (8.07 IBB per år)
    IBB_PENSION_CAP_MULTIPLIER: Number(process.env.NEXT_PUBLIC_IBB_PENSION_CAP_MULTIPLIER) || 8.07,
    
    // ITP1 lägre takt (4.5% upp till 7.5 IBB)
    ITP1_LOWER_RATE: Number(process.env.NEXT_PUBLIC_ITP1_LOWER_RATE) || 0.045,
    
    // ITP1 högre takt (30% över 7.5 IBB)
    ITP1_HIGHER_RATE: Number(process.env.NEXT_PUBLIC_ITP1_HIGHER_RATE) || 0.30,
    
    // ITP1 tak (7.5 IBB)
    ITP1_CAP_MULTIPLIER: Number(process.env.NEXT_PUBLIC_ITP1_CAP_MULTIPLIER) || 7.5,
    
    // Skatteparametrar 2025
    KOMMUNAL_SKATT_RATE: Number(process.env.NEXT_PUBLIC_KOMMUNAL_SKATT_RATE) || 0.315, // 31,5%
    STATLIG_SKATT_RATE: Number(process.env.NEXT_PUBLIC_STATLIG_SKATT_RATE) || 0.20, // 20%
    STATLIG_SKATT_SKIKTGRANS: Number(process.env.NEXT_PUBLIC_STATLIG_SKATT_SKIKTGRANS) || 625800, // Skiktgräns 2025 efter grundavdrag
    PUBLIC_SERVICE_MAX: Number(process.env.NEXT_PUBLIC_PUBLIC_SERVICE_MAX) || 1249, // Public service max 2025
    PUBLIC_SERVICE_RATE: Number(process.env.NEXT_PUBLIC_PUBLIC_SERVICE_RATE) || 0.01, // 1% av beskattningsbar inkomst
    PBB_ANNUAL: Number(process.env.NEXT_PUBLIC_PBB_ANNUAL) || 58800, // Prisbasbelopp 2025
  };
}

/**
 * Standard APY-värden för olika tillgångskategorier
 */
export const DEFAULT_APY = {
  'Ägodelar: Bil': -0.10,      // -10% per år (förlust)
  'Ägodelar: Hus': 0.02,       // +2% per år
  'Investeringar': 0.07,       // +7% per år
  'Kontanter': 0.00,           // 0% per år
  'Pensionssparande': 0.03,     // +3% per år
} as const;

/**
 * Standard amorteringstakt för skulder
 */
export const DEFAULT_AMORTIZATION_RATE = 0.02; // 2% per år
