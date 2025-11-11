/**
 * Gemensamma hjälpfunktioner för FIRE-beräkningar
 */

import { toReal } from './calc';

/**
 * Konverterar real avkastning till nominell avkastning
 */
export function toNominal(real: number, inflation: number): number {
  return (1 + real) * (1 + inflation) - 1;
}

/**
 * Beräknar viktad avkastning när kapital slås ihop från flera källor.
 * Pensionsdelar som just blir uttagsbara höjs till minst MIN_POST_FIRE_NOMINAL.
 * 
 * @param availableNow - Tillgängligt kapital
 * @param availableReturn - Nominell avkastning för tillgängligt (redan justerad efter FIRE om tillämpligt)
 * @param occPensionNow - Tjänstepension som ska slås ihop
 * @param occReturn - Nominell avkastning för tjänstepension (innan bump)
 * @param premiePensionNow - Premiepension som ska slås ihop
 * @param premieReturn - Nominell avkastning för premiepension (innan bump)
 * @param privatePensionNow - IPS som ska slås ihop
 * @param privateReturn - Nominell avkastning för IPS (innan bump)
 * @param inflation - Inflation för att konvertera till real avkastning
 * @param minPostFireNominal - Minsta nominella avkastning efter FIRE (default 7%)
 * @param bumpOccPension - Om tjänstepension just blev uttagsbar (ska bumpas)
 * @param bumpPremiePension - Om premiepension just blev uttagsbar (ska bumpas)
 * @param bumpPrivatePension - Om IPS just blev uttagsbar (ska bumpas)
 * @returns Viktad real avkastning för den sammanslagna potten
 */
export function calculateWeightedReturnOnMerge(
  availableNow: number,
  availableReturn: number, // Nominell
  occPensionNow: number,
  occReturn: number, // Nominell
  premiePensionNow: number,
  premieReturn: number, // Nominell
  privatePensionNow: number,
  privateReturn: number, // Nominell
  inflation: number,
  minPostFireNominal: number = 0.07,
  bumpOccPension: boolean = false,
  bumpPremiePension: boolean = false,
  bumpPrivatePension: boolean = false
): number {
  // Bumpa upp pensionsdelar som just blev uttagsbara till minst minPostFireNominal
  const effOccReturn = bumpOccPension ? Math.max(occReturn, minPostFireNominal) : occReturn;
  const effPremieReturn = bumpPremiePension ? Math.max(premieReturn, minPostFireNominal) : premieReturn;
  const effPrivateReturn = bumpPrivatePension ? Math.max(privateReturn, minPostFireNominal) : privateReturn;
  
  // Beräkna totalt kapital
  const totalMerged = availableNow + occPensionNow + premiePensionNow + privatePensionNow;
  
  // Fallback om totalt kapital är 0 (bör inte hända, men defensiv kod)
  if (totalMerged <= 0) {
    return toReal(minPostFireNominal, inflation);
  }
  
  // Beräkna viktad nominell avkastning
  const weightedNominalReturn = (
    availableNow * availableReturn +
    occPensionNow * effOccReturn +
    premiePensionNow * effPremieReturn +
    privatePensionNow * effPrivateReturn
  ) / totalMerged;
  
  // Konvertera till real avkastning
  return toReal(weightedNominalReturn, inflation);
}

