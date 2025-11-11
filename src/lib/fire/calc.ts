/**
 * FIRE (Financial Independence, Retire Early) beräkningar
 * Förenklad uppskattning baserat på nettoförmögenhet, sparande och antaganden
 */

import { Asset, Liability, Person } from '@/lib/types';
import { toNominal, calculateWeightedReturnOnMerge } from './utils';
import { 
  calculatePublicPensionMonthlyAllocations,
  calculateOccupationalPensionMonthlyAllocations,
  calculatePremiePensionMonthlyAllocations,
  calculatePrivatePensionMonthlyAllocations
} from '@/lib/wealth/calc';

/**
 * Faktor för hur mycket av bostadens nettovärde som räknas som "frigörbart" i FIRE-beräkningar
 * 40% innebär att vi räknar med att bara en del av bostadskapitalet är lätt att frigöra
 */
const FIRE_HOUSING_FACTOR = 0.4;

/**
 * Simulerar bridge-perioden från FIRE till pension, med hänsyn till tidiga uttag av tjänstepension och IPS
 * Detta matchar logiken i simulatePortfolio för att säkerställa konsistens
 */
function simulateBridge(params: {
  testPortfolio: number;
  annualExpenses: number;
  ageAtFire: number;
  bridgeYearsExact: number;
  currentOccPension: number;
  currentPrivatePension: number;
  occPensionEarlyStartAge: number;
  ipsEarlyStartAge: number;
  realPostFireReturnAvailable: number;
  safeRealOccPension: number;
  safeRealPrivatePension: number;
  inflation: number;
}): {
  bridgeFailed: boolean;
  portfolioAtPension: number;
  remainingOccPension: number;
  remainingPrivatePension: number;
} {
  let portfolio = params.testPortfolio;
  let occPension = params.currentOccPension;
  let privatePension = params.currentPrivatePension;
  const bridgeEndAge = params.ageAtFire + params.bridgeYearsExact;
  let bridgeFailed = false;
  let currentAge = params.ageAtFire;
  let remainingBridge = params.bridgeYearsExact;
  
  // Håll koll på aktuell avkastning (kan uppdateras när mergning sker)
  let currentReturn = params.realPostFireReturnAvailable;

  // Identifiera alla uttag som kan ske under bridge-perioden (i kronologisk ordning)
  const unlockEvents: Array<{ age: number; type: 'occ' | 'ips' }> = [];
  
  if (occPension > 0 && currentAge < params.occPensionEarlyStartAge && params.occPensionEarlyStartAge <= bridgeEndAge) {
    unlockEvents.push({ age: params.occPensionEarlyStartAge, type: 'occ' });
  }
  
  if (privatePension > 0 && currentAge < params.ipsEarlyStartAge && params.ipsEarlyStartAge <= bridgeEndAge) {
    unlockEvents.push({ age: params.ipsEarlyStartAge, type: 'ips' });
  }
  
  // Sortera uttag i kronologisk ordning
  unlockEvents.sort((a, b) => a.age - b.age);

  // Hantera varje uttag i ordning
  for (const event of unlockEvents) {
    if (bridgeFailed || remainingBridge <= 0) break;
    
    const yearsUntilUnlock = event.age - currentAge;
    if (yearsUntilUnlock <= 0) continue; // Redan passerad
    
    // Simulera fram till uttag
    for (let y = 0; y < Math.floor(yearsUntilUnlock); y++) {
      portfolio = portfolio * (1 + currentReturn) - params.annualExpenses;
      if (portfolio <= 0) {
        bridgeFailed = true;
        portfolio = 0;
        break;
      }
    }
    
    // Simulera ev. delår fram till uttag
    if (!bridgeFailed) {
      const fractional = yearsUntilUnlock - Math.floor(yearsUntilUnlock);
      if (fractional > 0) {
        portfolio = portfolio * (1 + currentReturn * fractional) - params.annualExpenses * fractional;
        if (portfolio <= 0) {
          bridgeFailed = true;
          portfolio = 0;
        }
      }
    }
    
    if (bridgeFailed) break;
    
    // Väx pensionshinken fram till uttag och lägg till i portfolio
    // Beräkna viktad avkastning när pensionsdel mergas
    if (event.type === 'occ' && occPension > 0) {
      const occAtUnlock = occPension * Math.pow(1 + params.safeRealOccPension, yearsUntilUnlock);
      portfolio += occAtUnlock;
      
      // Beräkna viktad avkastning för den sammanslagna potten
      const POST_FIRE_NOMINAL_RETURN = 0.07;
      const portfolioBeforeMerge = portfolio - occAtUnlock;
      const currentReturnNom = toNominal(currentReturn, params.inflation);
      const occReturnNom = toNominal(params.safeRealOccPension, params.inflation);
      
      currentReturn = calculateWeightedReturnOnMerge(
        portfolioBeforeMerge,
        currentReturnNom,
        occAtUnlock,
        occReturnNom,
        0, 0, 0, 0,
        params.inflation,
        POST_FIRE_NOMINAL_RETURN,
        true,  // bumpOccPension
        false, false
      );
      
      occPension = 0;
    } else if (event.type === 'ips' && privatePension > 0) {
      const ipsAtUnlock = privatePension * Math.pow(1 + params.safeRealPrivatePension, yearsUntilUnlock);
      portfolio += ipsAtUnlock;
      
      // Beräkna viktad avkastning för den sammanslagna potten
      const POST_FIRE_NOMINAL_RETURN = 0.07;
      const portfolioBeforeMerge = portfolio - ipsAtUnlock;
      const currentReturnNom = toNominal(currentReturn, params.inflation);
      const ipsReturnNom = toNominal(params.safeRealPrivatePension, params.inflation);
      
      currentReturn = calculateWeightedReturnOnMerge(
        portfolioBeforeMerge,
        currentReturnNom,
        0, 0, 0, 0,
        ipsAtUnlock,
        ipsReturnNom,
        params.inflation,
        POST_FIRE_NOMINAL_RETURN,
        false, false,
        true   // bumpPrivatePension
      );
      
      privatePension = 0;
    }
    
    // Uppdatera ålder och kvarvarande bridge-tid
    currentAge = event.age;
    remainingBridge -= yearsUntilUnlock;
  }

  // Simulera kvarvarande bridge-tid (efter alla uttag)
  if (!bridgeFailed && remainingBridge > 0) {
    // Simulera hela år först
    for (let bridgeY = 0; bridgeY < Math.floor(remainingBridge); bridgeY++) {
      portfolio = portfolio * (1 + currentReturn) - params.annualExpenses;
      if (portfolio <= 0) {
        bridgeFailed = true;
        portfolio = 0;
        break;
      }
    }
    // Simulera ev. delår
    if (!bridgeFailed) {
      const fractional = remainingBridge - Math.floor(remainingBridge);
      if (fractional > 0) {
        portfolio = portfolio * (1 + currentReturn * fractional) - params.annualExpenses * fractional;
        if (portfolio <= 0) {
          bridgeFailed = true;
          portfolio = 0;
        }
      }
    }
  }

  return {
    bridgeFailed,
    portfolioAtPension: Math.max(0, portfolio),
    remainingOccPension: occPension,
    remainingPrivatePension: privatePension
  };
}

/**
 * Parsar APY från olika format (tal, sträng med %, komma som decimaltecken)
 */
function parseApy(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    // Om det är heltal > 1, tolka som procent, annars låt det vara
    if (Number.isInteger(raw) && raw > 1) {
      return raw / 100;
    }
    return raw > 1 ? raw / 100 : raw;
  }

  if (typeof raw === 'string') {
    const s = raw.trim().replace(',', '.');
    const match = s.match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const n = parseFloat(match[0]);
    // Tillåt även negativa avkastningar (t.ex. bilen -11%)
    // Om det innehåller % eller är heltal > 1, tolka som procent
    if (s.includes('%')) return n / 100;
    if (Number.isInteger(n) && n > 1) return n / 100;
    return n;
  }

  return null;
}

/**
 * Beräknar viktad nominell avkastning för tillgångar som matchar predicate
 */
function weightedNominalReturn(assets: Asset[], predicate: (a: Asset) => boolean): number {
  const included = assets
    .filter(predicate)
    .map(a => ({
      value: Number(a.value) || 0,
      apy: parseApy(a.expected_apy)
    }))
    .filter(x => x.value > 0 && x.apy !== null && !Number.isNaN(x.apy as number));

  const total = included.reduce((sum, x) => sum + x.value, 0);
  if (total <= 0) return NaN;

  const weightedSum = included.reduce((sum, x) => sum + x.value * (x.apy as number), 0);
  return weightedSum / total;
}

/**
 * Konverterar nominell avkastning till real avkastning
 */
export function toReal(nominal: number, inflation: number): number {
  if (1 + inflation === 0) return 0;
  return ((1 + nominal) / (1 + inflation)) - 1;
}

/**
 * Beräknar automatiska reala avkastningar per hink baserat på tillgångar
 * Uppdaterad för att använda nettovärden per kategori (tillgångar minus relaterade skulder)
 */
export function calculateAutoReturns(assets: Asset[], inflation: number, fallbackNominal: number = 0.07, liabilities: Liability[] = []) {
  // Säkerställ att liabilities är en array
  const safeLiabilities = Array.isArray(liabilities) ? liabilities : [];
  
  // Beräkna nettovärden per kategori
  // 1. Bostadstillgångar (Bostad + Semesterbostad) minus bostadslån
  const housingAssets = assets.filter(a => a.category === 'Bostad' || a.category === 'Semesterbostad');
  const housingLoans = safeLiabilities.filter(l => l.liability_type === 'Bostadslån');
  let housingNetValue = Math.max(0, housingAssets.reduce((sum, a) => sum + a.value, 0) - 
                          housingLoans.reduce((sum, l) => sum + l.principal, 0));
  
  // 2. Bilstillgångar minus billån
  const carAssets = assets.filter(a => a.category === 'Bil');
  const carLoans = safeLiabilities.filter(l => l.liability_type === 'Billån');
  let carNetValue = Math.max(0, carAssets.reduce((sum, a) => sum + a.value, 0) - 
                      carLoans.reduce((sum, l) => sum + l.principal, 0));
  
  // 3. Övriga tillgångar (allt utom bostad, semesterbostad, bil och pension)
  const otherAssets = assets.filter(a => {
    const cat = a.category as string;
    return cat !== 'Bostad' && 
           cat !== 'Semesterbostad' && 
           cat !== 'Bil' &&
           cat !== 'Tjänstepension' &&
           cat !== 'Premiepension' &&
           cat !== 'Privat pensionssparande (IPS)' &&
           cat !== 'Trygghetsbaserad pension (Statlig)';
  });
  const otherAssetsTotal = otherAssets.reduce((sum, a) => sum + a.value, 0);
  let otherNetValue = Math.max(0, otherAssetsTotal);
  
  // 4. Övriga skulder (alla som inte är bostadslån eller billån) - fördela över alla positiva korgar
  const otherLiabilities = safeLiabilities.filter(l => 
    l.liability_type !== 'Bostadslån' && l.liability_type !== 'Billån'
  );
  const otherLiabilitiesTotal = otherLiabilities.reduce((sum, l) => sum + l.principal, 0);
  
  // Fördela övriga skulder proportionellt över alla positiva korgar
  if (otherLiabilitiesTotal > 0) {
    const totalPositiveNetValue = housingNetValue + carNetValue + otherNetValue;
    if (totalPositiveNetValue > 0) {
      // Beräkna proportionell fördelning
      const housingProportion = housingNetValue / totalPositiveNetValue;
      const carProportion = carNetValue / totalPositiveNetValue;
      const otherProportion = otherNetValue / totalPositiveNetValue;
      
      // Dra av proportionellt från varje korg
      housingNetValue = Math.max(0, housingNetValue - (otherLiabilitiesTotal * housingProportion));
      carNetValue = Math.max(0, carNetValue - (otherLiabilitiesTotal * carProportion));
      otherNetValue = Math.max(0, otherNetValue - (otherLiabilitiesTotal * otherProportion));
    } else {
      // Om alla korgar är negativa eller noll, sätt allt till 0
      housingNetValue = 0;
      carNetValue = 0;
      otherNetValue = 0;
    }
  }
  
  // För FIRE: räkna bara med en del av bostadens nettovärde (40% är "frigörbart")
  // Om housingNetValue <= 0, blir fireHousing också 0 (ingen ändring)
  const fireHousing = housingNetValue > 0 ? housingNetValue * FIRE_HOUSING_FACTOR : 0;
  
  // Beräkna totalt nettovärde för tillgängliga tillgångar (exkl. pension)
  // Använd fireHousing istället för full housingNetValue för FIRE-beräkningar
  const totalAvailableNetValue = fireHousing + carNetValue + otherNetValue;
  
  // Beräkna viktad nominell avkastning baserat på nettovärden
  // Om totalt nettovärde är noll (allt belånat), använd hårdkodad 7% på likvida/finansiella tillgångar
  let nomAvailable = NaN;
  if (totalAvailableNetValue > 0) {
    let weightedSum = 0;
    
    // Bostadstillgångar (använd fireHousing som vikt för FIRE-beräkningar)
    if (fireHousing > 0) {
      const housingSum = housingAssets.reduce((sum, a) => sum + a.value, 0);
      const housingWeightedReturn = housingSum > 0
        ? housingAssets.reduce((sum, a) => {
            const apy = parseApy(a.expected_apy);
            return sum + (a.value * (apy || 0));
          }, 0) / housingSum
        : 0;
      weightedSum += fireHousing * housingWeightedReturn;
    }
    
    // Bilstillgångar (använd nettovärde om positivt)
    if (carNetValue > 0) {
      const carSum = carAssets.reduce((sum, a) => sum + a.value, 0);
      const carWeightedReturn = carSum > 0
        ? carAssets.reduce((sum, a) => {
            const apy = parseApy(a.expected_apy);
            return sum + (a.value * (apy || 0));
          }, 0) / carSum
        : 0;
      weightedSum += carNetValue * carWeightedReturn;
    }
    
    // Övriga tillgångar minus övriga skulder
    if (otherNetValue > 0) {
      const otherWeightedReturn = otherAssetsTotal > 0
        ? otherAssets.reduce((sum, a) => {
            const apy = parseApy(a.expected_apy);
            return sum + (a.value * (apy || 0));
          }, 0) / otherAssetsTotal
        : 0;
      weightedSum += otherNetValue * otherWeightedReturn;
    }
    
    nomAvailable = weightedSum / totalAvailableNetValue;
  } else {
    // Alla korgar är 0 (allt belånat) → använd hårdkodad 7% på likvida/finansiella tillgångar
    // Likvida/finansiella tillgångar: Fonder & Aktier, Sparkonto & Kontanter
    const liquidAssets = assets.filter(a => {
      const cat = a.category as string;
      return cat === 'Fonder & Aktier' || cat === 'Sparkonto & Kontanter';
    });
    
    if (liquidAssets.length > 0) {
      // Beräkna viktad avkastning på likvida tillgångar, fallback till 7% om ingen APY finns
      const liquidTotal = liquidAssets.reduce((sum, a) => sum + a.value, 0);
      if (liquidTotal > 0) {
        const liquidWeightedSum = liquidAssets.reduce((sum, a) => {
          const apy = parseApy(a.expected_apy);
          return sum + (a.value * (apy !== null ? apy : fallbackNominal));
        }, 0);
        nomAvailable = liquidWeightedSum / liquidTotal;
      } else {
        nomAvailable = fallbackNominal;
      }
    } else {
      // Inga likvida tillgångar → använd fallback 7%
      nomAvailable = fallbackNominal;
    }
  }
  // Tjänstepension
  const nomOccPension = weightedNominalReturn(assets, a => a.category === 'Tjänstepension');
  
  // Premiepension
  const nomPremiePension = weightedNominalReturn(assets, a => a.category === 'Premiepension');
  
  // Privat pensionssparande (IPS)
  const nomPrivatePension = weightedNominalReturn(assets, a => a.category === 'Privat pensionssparande (IPS)');
  
  // Statlig pension (fallback till 3% nominellt om ingen finns)
  const nomStatePension = weightedNominalReturn(assets, a => a.category === 'Trygghetsbaserad pension (Statlig)');
  
  // Konvertera till reala avkastningar, använd fallback om ingen tillgång matchar
  const realReturnAvailable = Number.isFinite(nomAvailable) 
    ? toReal(nomAvailable, inflation) 
    : toReal(fallbackNominal, inflation);
    
  const realReturnOccPension = Number.isFinite(nomOccPension) 
    ? toReal(nomOccPension, inflation) 
    : toReal(fallbackNominal, inflation);
    
  const realReturnPremiePension = Number.isFinite(nomPremiePension) 
    ? toReal(nomPremiePension, inflation) 
    : toReal(fallbackNominal, inflation);
    
  const realReturnPrivatePension = Number.isFinite(nomPrivatePension) 
    ? toReal(nomPrivatePension, inflation) 
    : toReal(fallbackNominal, inflation);
  
  // För statlig pension: fallback till 3% nominellt om ingen tillgång finns
  const STATE_PENSION_FALLBACK_NOMINAL = 0.03;
  const realReturnStatePension = Number.isFinite(nomStatePension)
    ? toReal(nomStatePension, inflation)
    : toReal(STATE_PENSION_FALLBACK_NOMINAL, inflation);
  
  return {
    realReturnAvailable,
    realReturnOccPension,
    realReturnPremiePension,
    realReturnPrivatePension,
    realReturnStatePension,
    nomAvailable: Number.isFinite(nomAvailable) ? nomAvailable : fallbackNominal,
    nomOccPension: Number.isFinite(nomOccPension) ? nomOccPension : fallbackNominal,
    nomPremiePension: Number.isFinite(nomPremiePension) ? nomPremiePension : fallbackNominal,
    nomPrivatePension: Number.isFinite(nomPrivatePension) ? nomPrivatePension : fallbackNominal,
    nomStatePension: Number.isFinite(nomStatePension) ? nomStatePension : STATE_PENSION_FALLBACK_NOMINAL,
  };
}

export interface FIREResult {
  yearsToFire: number | null;
  estimatedAge: number | null;
  portfolioAtFire: number;
  requiredAtPension: number;
  currentMonthlyExpenses: number;
  availableAtStart: number;
  statePensionAtStart: number;
  isAchievable: boolean;
  warnings: string[];
  realReturnAvailable: number;
  realReturnStatePension: number;
  statePensionAnnualIncome?: number; // Årlig utbetalning från statlig pension efter pensionsstart
  statePensionPayoutYears?: number; // Antal år statlig pension betalas ut
}


/**
 * Delar upp förmögenheten i fyra hinkar: tillgänglig, tjänstepension, premiepension, IPS, statlig pension
 * Lägger till guard om pensions­tillgångar överstiger net worth
 */
function splitPortfolio(assets: Asset[], totalNetWorth: number): { 
  available: number; 
  occPension: number; // Tjänstepension
  premiePension: number; // Premiepension
  privatePension: number; // IPS
  statePension: number; // Statlig pension
  warnings: string[] 
} {
  const warnings: string[] = [];
  
  // Räkna tjänstepensionstillgångar
  const occPensionAssets = assets
    .filter(asset => asset.category === 'Tjänstepension')
    .reduce((sum, asset) => sum + asset.value, 0);
  
  // Räkna premiepensionstillgångar
  const premiePensionAssets = assets
    .filter(asset => asset.category === 'Premiepension')
    .reduce((sum, asset) => sum + asset.value, 0);
  
  // Räkna IPS-tillgångar
  const privatePensionAssets = assets
    .filter(asset => asset.category === 'Privat pensionssparande (IPS)')
    .reduce((sum, asset) => sum + asset.value, 0);
  
  // Räkna statliga pensionsstillgångar
  const statePensionAssets = assets
    .filter(asset => asset.category === 'Trygghetsbaserad pension (Statlig)')
    .reduce((sum, asset) => sum + asset.value, 0);
  
  // Totalt marknadsbaserad pension (summan av de tre marknadsbaserade kategorierna)
  const marketPensionAssets = occPensionAssets + premiePensionAssets + privatePensionAssets;
  
  // Tillgänglig förmögenhet = allt utom alla pensionskategorier (clamp till 0)
  let available = totalNetWorth - marketPensionAssets - statePensionAssets;
  
  if (available < 0) {
    warnings.push('Pensionstillgångar överstiger övriga tillgångar; tillgänglig portfölj satt till 0.');
    available = 0;
  }
  
  return { 
    available, 
    occPension: occPensionAssets,
    premiePension: premiePensionAssets,
    privatePension: privatePensionAssets,
    statePension: statePensionAssets,
    warnings 
  };
}

/**
 * Beräknar antal år statlig pension betalas ut baserat på pensionsålder
 * Default 20 år vid 63, minskar lite om högre pensionsålder
 */
function calculateStatePensionPayoutYears(pensionStartAge: number): number {
  const DEFAULT_AGE = 63;
  const DEFAULT_YEARS = 20;
  
  if (pensionStartAge <= DEFAULT_AGE) {
    return DEFAULT_YEARS;
  }
  
  // För varje år över 63, minska med ~0.5 år (linjär approximation)
  const yearsOver = pensionStartAge - DEFAULT_AGE;
  const payoutYears = Math.max(15, DEFAULT_YEARS - (yearsOver * 0.5));
  
  return Math.round(payoutYears);
}

/**
 * Beräknar månatliga utgifter: nettoinkomst - månadssparande
 * netIncomeFn är obligatorisk och får inte inkludera pension före pensionsstart
 */
function calculateMonthlyExpenses(
  persons: Person[], 
  netIncomeFn: (person: Person) => number
): number {
  const totalNetIncome = persons.reduce((sum, person) => {
    const income = netIncomeFn(person);
    return sum + (Number.isFinite(income) ? income : 0);
  }, 0);
  
  const totalSavings = persons.reduce((sum, person) => {
    const savings = person.other_savings_monthly || 0;
    return sum + (Number.isFinite(savings) ? savings : 0);
  }, 0);
  
  return Math.max(0, totalNetIncome - totalSavings);
}

/**
 * Beräknar FIRE med korrekt logik
 * 
 * OBS: Här räknar vi med 40% av bostadskapitalet som "frigörbart" för FIRE-beräkningar,
 * så available ≠ totalNetWorth - pension. Detta görs för att bostadskapitalet inte är
 * lika lätt att frigöra som övriga tillgångar.
 */
export function calculateFIRE(
  assets: Asset[],
  persons: Person[],
  totalNetWorth: number,
  monthlySavings: number,
  realReturnAvailable: number,
  pensionStartAge: number = 63,
  monthlyPensionAfterTax: number = 0,
  netIncomeFn: (person: Person) => number,
  customMonthlyExpenses?: number,
  inflation: number = 0.02,
  liabilities: Liability[] = [],
  realReturnOccPension?: number,
  realReturnPremiePension?: number,
  realReturnPrivatePension?: number,
  realReturnStatePension?: number,
  occPensionContribMonthly?: number,
  premiePensionContribMonthly?: number,
  privatePensionContribMonthly?: number,
  occPensionEarlyStartAge: number = 55,
  ipsEarlyStartAge: number = 55
): FIREResult {
  // Beräkna automatiska avkastningar om de inte angivits
  const autoReturns = calculateAutoReturns(assets, inflation, 0.07, liabilities);
  const safeRealStatePension = realReturnStatePension !== undefined 
    ? Math.max(realReturnStatePension, -0.5)
    : Math.max(autoReturns.realReturnStatePension, -0.5);
  
  // Separata pensionsavkastningar (använd auto-beräknade om inte angivna)
  const safeRealOccPension = realReturnOccPension !== undefined
    ? Math.max(realReturnOccPension, -0.5)
    : Math.max(autoReturns.realReturnOccPension, -0.5);
  const safeRealPremiePension = realReturnPremiePension !== undefined
    ? Math.max(realReturnPremiePension, -0.5)
    : Math.max(autoReturns.realReturnPremiePension, -0.5);
  const safeRealPrivatePension = realReturnPrivatePension !== undefined
    ? Math.max(realReturnPrivatePension, -0.5)
    : Math.max(autoReturns.realReturnPrivatePension, -0.5);
  
  // Clamp avkastningar för stabilitet (förhindra negativa värden som kraschar simuleringen)
  const safeRealAvailable = Math.max(realReturnAvailable, -0.5); // minst -50%
  
  const warnings: string[] = [];
  
  // Beräkna nuvarande ålder
  const currentYear = new Date().getFullYear();
  const averageAge = persons.length > 0 
    ? Math.round(persons.reduce((sum, p) => {
        const age = currentYear - p.birth_year;
        return sum + age;
      }, 0) / persons.length)
    : 40;
  
  // Validera indata
  if (monthlySavings <= 0) {
    warnings.push('Inget månadssparande – beräkningen utgår enbart från befintligt kapital.');
  }
  
  if (realReturnAvailable <= 0) {
    warnings.push('Real avkastning för tillgängliga tillgångar ≤ 0 – simuleringen blir pessimistisk/ogiltig');
  }
  
  // Dela upp portföljen i separata pensionshinkar
  const { available, occPension, premiePension, privatePension, statePension, warnings: splitWarnings } = splitPortfolio(assets, totalNetWorth);
  warnings.push(...splitWarnings);
  
  // För FIRE: justera available för att bara räkna med 40% av bostadens nettovärde
  // Beräkna bostadens nettovärde (samma logik som i calculateAutoReturns)
  const housingAssets = assets.filter(a => a.category === 'Bostad' || a.category === 'Semesterbostad');
  const housingLoans = liabilities.filter(l => l.liability_type === 'Bostadslån');
  let housingNetValue = Math.max(0, housingAssets.reduce((sum, a) => sum + a.value, 0) - 
                          housingLoans.reduce((sum, l) => sum + l.principal, 0));
  
  // Fördela övriga skulder proportionellt (samma logik som i calculateAutoReturns)
  const carAssets = assets.filter(a => a.category === 'Bil');
  const carLoans = liabilities.filter(l => l.liability_type === 'Billån');
  let carNetValue = Math.max(0, carAssets.reduce((sum, a) => sum + a.value, 0) - 
                      carLoans.reduce((sum, l) => sum + l.principal, 0));
  
  const otherAssets = assets.filter(a => {
    const cat = a.category as string;
    return cat !== 'Bostad' && 
           cat !== 'Semesterbostad' && 
           cat !== 'Bil' &&
           cat !== 'Tjänstepension' &&
           cat !== 'Premiepension' &&
           cat !== 'Privat pensionssparande (IPS)' &&
           cat !== 'Trygghetsbaserad pension (Statlig)';
  });
  const otherAssetsTotal = otherAssets.reduce((sum, a) => sum + a.value, 0);
  let otherNetValue = Math.max(0, otherAssetsTotal);
  
  const otherLiabilities = liabilities.filter(l => 
    l.liability_type !== 'Bostadslån' && l.liability_type !== 'Billån'
  );
  const otherLiabilitiesTotal = otherLiabilities.reduce((sum, l) => sum + l.principal, 0);
  
  if (otherLiabilitiesTotal > 0) {
    const totalPositiveNetValue = housingNetValue + carNetValue + otherNetValue;
    if (totalPositiveNetValue > 0) {
      const housingProportion = housingNetValue / totalPositiveNetValue;
      const carProportion = carNetValue / totalPositiveNetValue;
      const otherProportion = otherNetValue / totalPositiveNetValue;
      
      housingNetValue = Math.max(0, housingNetValue - (otherLiabilitiesTotal * housingProportion));
      carNetValue = Math.max(0, carNetValue - (otherLiabilitiesTotal * carProportion));
      otherNetValue = Math.max(0, otherNetValue - (otherLiabilitiesTotal * otherProportion));
    } else {
      housingNetValue = 0;
      carNetValue = 0;
      otherNetValue = 0;
    }
  }
  
  // Beräkna fireHousing (40% av bostadens nettovärde)
  const fireHousing = housingNetValue > 0 ? housingNetValue * FIRE_HOUSING_FACTOR : 0;
  
  // Justera available: available från splitPortfolio inkluderar redan bostaden som del av totalNetWorth
  // Vi behöver justera så att bara fireHousing (40%) räknas med istället för hela housingNetValue
  // Eftersom available redan inkluderar bostaden minus skulder, justerar vi genom att:
  // dra bort (housingNetValue - fireHousing) = housingNetValue * (1 - FIRE_HOUSING_FACTOR)
  const housingAdjustment = housingNetValue > 0 ? housingNetValue * (1 - FIRE_HOUSING_FACTOR) : 0;
  const adjustedAvailable = Math.max(0, available - housingAdjustment);
  
  let availableAtStart = adjustedAvailable;
  let occPensionAtStart = occPension;
  let premiePensionAtStart = premiePension;
  let privatePensionAtStart = privatePension;
  let statePensionAtStart = statePension;
  
  // Beräkna separata pensionsavsättningar
  const statePensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);
  const calculatedOccContrib = calculateOccupationalPensionMonthlyAllocations(persons);
  const calculatedPremieContrib = calculatePremiePensionMonthlyAllocations(persons);
  const calculatedPrivateContrib = calculatePrivatePensionMonthlyAllocations(persons);
  
  // Använd angivna värden om de finns, annars använd beräknade
  const effectiveOccContrib = occPensionContribMonthly !== undefined 
    ? occPensionContribMonthly 
    : calculatedOccContrib;
  const effectivePremieContrib = premiePensionContribMonthly !== undefined
    ? premiePensionContribMonthly
    : calculatedPremieContrib;
  const effectivePrivateContrib = privatePensionContribMonthly !== undefined
    ? privatePensionContribMonthly
    : calculatedPrivateContrib;
  
  // Effektiva värden för sparande och pensionsavsättningar (kan ändras när mergning sker)
  let effectiveMonthlySavings = monthlySavings;
  let effectiveOccContribLocal = effectiveOccContrib;
  let effectivePremieContribLocal = effectivePremieContrib;
  let effectivePrivateContribLocal = effectivePrivateContrib;
  
  // Om hushållet redan passerat pensionsstart: lås inte marknadsbaserad pension
  // Statlig pension behandlas som utbetalning, inte kapital (hanteras senare)
  if (averageAge >= pensionStartAge) {
    availableAtStart += occPensionAtStart + premiePensionAtStart + privatePensionAtStart;
    occPensionAtStart = 0;
    premiePensionAtStart = 0;
    privatePensionAtStart = 0;
    // Statlig pension behandlas som utbetalning, läggs inte till kapital
    warnings.push('Pensionsålder redan passerad – marknadsbaserad pension behandlas som tillgänglig');
  }
  
  // Beräkna månadsutgifter
  const monthlyExpenses = customMonthlyExpenses ?? calculateMonthlyExpenses(persons, netIncomeFn);
  const annualExpenses = monthlyExpenses * 12;
  
  const annualPension = monthlyPensionAfterTax * 12;
  
  // Beräkna utbetalningsår för statlig pension
  const statePensionPayoutYears = calculateStatePensionPayoutYears(pensionStartAge);
  
  // Antal år till pension
  const yearsToPension = Math.max(0, pensionStartAge - averageAge);
  
  // Beräkna statlig pensionsväxt fram till pension (om vi inte redan är där)
  // OBS: Väx även om startvärdet är 0 - månadsavsättningen bygger upp pensionen
  let statePensionAtPension = statePensionAtStart;
  let statePensionAnnualIncome = 0;
  
  if (yearsToPension > 0) {
    // Väx statlig pension fram till pensionsstart (från startvärdet + månadsavsättningar)
    for (let year = 0; year < yearsToPension; year++) {
      statePensionAtPension = statePensionAtPension * (1 + safeRealStatePension) + (statePensionContribMonthly * 12);
    }
    // Beräkna årlig utbetalning
    if (statePensionAtPension > 0) {
      statePensionAnnualIncome = statePensionAtPension / statePensionPayoutYears;
    }
  } else if (averageAge >= pensionStartAge) {
    // Om vi redan är vid pension: beräkna utbetalning direkt
    if (statePensionAtStart > 0) {
      statePensionAnnualIncome = statePensionAtStart / statePensionPayoutYears;
    }
  }
  
  // Trivial pass om inga utgifter
  if (annualExpenses === 0) {
    return {
      yearsToFire: 0,
      estimatedAge: averageAge,
      portfolioAtFire: availableAtStart,
      requiredAtPension: 0,
      currentMonthlyExpenses: monthlyExpenses,
      availableAtStart,
      statePensionAtStart,
      isAchievable: true,
      warnings: [...warnings, 'Inga utgifter registrerade – FIRE är redan nått'],
      realReturnAvailable,
      realReturnStatePension: safeRealStatePension,
      statePensionAnnualIncome: statePensionAnnualIncome > 0 ? statePensionAnnualIncome : undefined,
      statePensionPayoutYears: statePensionAnnualIncome > 0 ? statePensionPayoutYears : undefined
    };
  }
  
  // Krav vid pension (4%-regeln) - ta hänsyn till både statlig pension och annan pension
  const totalPensionIncome = annualPension + statePensionAnnualIncome;
  let requiredAtPension = Math.max(0, (annualExpenses - totalPensionIncome) * 25);
  
  if (totalPensionIncome >= annualExpenses) {
    requiredAtPension = 0;
    warnings.push('Total pension (statlig + annan) ≥ utgifter → krav vid pension = 0');
  }
  
  // Om redan passerat pension: hoppa över bro-testet
  if (averageAge >= pensionStartAge) {
    // Kontrollera bara 4%-testet
    // Vid pensionsålder är alla marknadsbaserade pensioner redan tillgängliga (de lades till i availableAtStart ovan)
    const totalAtPension = availableAtStart;
    
    if (totalAtPension >= requiredAtPension) {
      return {
        yearsToFire: 0,
        estimatedAge: averageAge,
        portfolioAtFire: availableAtStart,
        requiredAtPension: requiredAtPension,
        currentMonthlyExpenses: monthlyExpenses,
        availableAtStart,
        statePensionAtStart,
        isAchievable: true,
        warnings,
        realReturnAvailable,
        realReturnStatePension: safeRealStatePension,
        statePensionAnnualIncome: statePensionAnnualIncome > 0 ? statePensionAnnualIncome : undefined,
        statePensionPayoutYears: statePensionAnnualIncome > 0 ? statePensionPayoutYears : undefined
      };
    } else {
      return {
        yearsToFire: null,
        estimatedAge: null,
        portfolioAtFire: 0,
        requiredAtPension: requiredAtPension,
        currentMonthlyExpenses: monthlyExpenses,
        availableAtStart,
        statePensionAtStart,
        isAchievable: false,
        warnings: [...warnings, 'FIRE ej uppnåeligt med nuvarande antaganden'],
        realReturnAvailable,
        realReturnStatePension: safeRealStatePension,
        statePensionAnnualIncome: statePensionAnnualIncome > 0 ? statePensionAnnualIncome : undefined,
        statePensionPayoutYears: statePensionAnnualIncome > 0 ? statePensionPayoutYears : undefined
      };
    }
  }
  
  // Simulera år-för-år med korrekt uppbyggnad (bygg vidare mellan åren)
  let currentAvailable = availableAtStart;
  let currentOccPension = occPensionAtStart;
  let currentPremiePension = premiePensionAtStart;
  let currentPrivatePension = privatePensionAtStart;
  let currentStatePension = statePensionAtStart;
  
  // Håll koll på viktad avkastning efter sammanslagning
  // null = inget sammanslaget än, använd individuella avkastningar
  let mergedRealReturn: number | null = null;
  
  // Håll koll på om pensionsdelar redan har blivit uttagsbara
  let occPensionUnlocked = false;
  let privatePensionUnlocked = false;
  
  for (let year = 0; year <= yearsToPension; year++) {
    const currentAge = averageAge + year;
    
    // Tillgänglig portfölj: väx med sparande + avkastning för tillgängliga tillgångar
    // Notera: inkluderar sparande i FIRE-året (man slutar jobba i slutet av året)
    // Använd viktad avkastning om kapitalet redan är sammanslaget (t.ex. tidiga uttag)
    const effectiveAvailableReturn = mergedRealReturn !== null 
      ? mergedRealReturn 
      : safeRealAvailable;
    currentAvailable = currentAvailable * (1 + effectiveAvailableReturn) + (effectiveMonthlySavings * 12);
    
    // Separata pensionshinkar: väx med respektive avsättning + avkastning (fram till FIRE)
    currentOccPension = currentOccPension * (1 + safeRealOccPension) + (effectiveOccContribLocal * 12);
    currentPremiePension = currentPremiePension * (1 + safeRealPremiePension) + (effectivePremieContribLocal * 12);
    currentPrivatePension = currentPrivatePension * (1 + safeRealPrivatePension) + (effectivePrivateContribLocal * 12);
    
    // Statlig pension: väx med inkomstpensionsavsättning + avkastning (fram till pension)
    currentStatePension = currentStatePension * (1 + safeRealStatePension) + (statePensionContribMonthly * 12);
    
    // Tidiga uttag: tjänstepension och IPS kan tas ut från vald ålder (default 55)
    // Premiepension flyttas aldrig före pensionsålder - den växer hela vägen till pensionsstart
    const occPensionJustUnlocked = currentAge >= occPensionEarlyStartAge && currentOccPension > 0 && !occPensionUnlocked;
    const privatePensionJustUnlocked = currentAge >= ipsEarlyStartAge && currentPrivatePension > 0 && !privatePensionUnlocked;
    
    if (currentAge >= occPensionEarlyStartAge && currentOccPension > 0) {
      // Beräkna viktad avkastning när tjänstepension slås ihop
      // VIKTIGT: Vikta bara de delar som faktiskt mergas (currentAvailable + currentOccPension)
      // Premiepension och IPS ska INTE vara med eftersom de fortfarande är låsta
      if (occPensionJustUnlocked) {
        // Konvertera real avkastningar till nominella för beräkning
        const currentAvailableReturnNom = toNominal(effectiveAvailableReturn, inflation);
        const nomOccReturn = toNominal(safeRealOccPension, inflation);
        
        const POST_FIRE_NOMINAL_RETURN = 0.07;
        mergedRealReturn = calculateWeightedReturnOnMerge(
          currentAvailable,
          currentAvailableReturnNom,
          currentOccPension,      // Just unlocked - ska mergas
          nomOccReturn,
          0,                       // premiePension - INTE med än, fortfarande låst
          0,
          0,                       // privatePension - INTE med än, fortfarande låst
          0,
          inflation,
          POST_FIRE_NOMINAL_RETURN,
          true,                    // bumpOccPension
          false,                   // bumpPremiePension
          false                    // bumpPrivatePension
        );
      }
      
      currentAvailable += currentOccPension;
      currentOccPension = 0;
      occPensionUnlocked = true;
      
      // Om vi fortfarande är i fasen före FIRE/pension där vi annars hade fortsatt betala in pension,
      // då ska vi flytta månatlig tjänstepensionsavsättning till vanligt spar
      if (year < yearsToPension) {
        // Öka månadssparandet med det som tidigare gick till tjänstepension
        effectiveMonthlySavings += effectiveOccContribLocal;
        // Stoppa framtida tjänstepensionsinbetalningar
        effectiveOccContribLocal = 0;
      }
    }
    
    if (currentAge >= ipsEarlyStartAge && currentPrivatePension > 0) {
      // Beräkna viktad avkastning när IPS slås ihop
      // VIKTIGT: Vikta bara de delar som faktiskt mergas (currentAvailable + currentPrivatePension)
      // Om occPension redan är upplåst är den redan i currentAvailable, så den är med automatiskt
      // Premiepension ska INTE vara med eftersom den fortfarande är låst
      if (privatePensionJustUnlocked) {
        // Konvertera real avkastningar till nominella för beräkning
        const currentAvailableReturnNom = toNominal(
          mergedRealReturn !== null ? mergedRealReturn : effectiveAvailableReturn,
          inflation
        );
        const nomPrivateReturn = toNominal(safeRealPrivatePension, inflation);
        
        const POST_FIRE_NOMINAL_RETURN = 0.07;
        mergedRealReturn = calculateWeightedReturnOnMerge(
          currentAvailable,
          currentAvailableReturnNom,
          0,                       // occPension - redan i currentAvailable om upplåst, annars 0
          0,
          0,                       // premiePension - INTE med än, fortfarande låst
          0,
          currentPrivatePension,   // Just unlocked - ska mergas
          nomPrivateReturn,
          inflation,
          POST_FIRE_NOMINAL_RETURN,
          false,                   // bumpOccPension (redan upplåst om den fanns)
          false,                   // bumpPremiePension
          true                     // bumpPrivatePension
        );
      }
      
      currentAvailable += currentPrivatePension;
      currentPrivatePension = 0;
      privatePensionUnlocked = true;
      
      // Om vi fortfarande är i fasen före FIRE/pension där vi annars hade fortsatt betala in pension,
      // då ska vi flytta månatlig IPS-avsättning till vanligt spar
      if (year < yearsToPension) {
        // Öka månadssparandet med det som tidigare gick till IPS
        effectiveMonthlySavings += effectivePrivateContribLocal;
        // Stoppa framtida IPS-inbetalningar
        effectivePrivateContribLocal = 0;
      }
    }
    
    // Kontrollera FIRE-kriterier
    // 1. Bridge till pension: kan tillgänglig portfölj täcka utgifter?
    // Notera: bridge-testet börjar året EFTER FIRE-året (konsistent med simulatePortfolio)
    const bridgeYearsExact = Math.max(0, yearsToPension - year - 1);
    
    // Beräkna post-FIRE-räntan först (samma som simuleringen använder)
    // Använd viktad avkastning om kapitalet redan är sammanslaget, annars standard post-FIRE avkastning
    const POST_FIRE_NOMINAL_RETURN = 0.07;
    const basePostFireReturn = Math.max(
      toReal(POST_FIRE_NOMINAL_RETURN, inflation),
      safeRealAvailable
    );
    const realPostFireReturnAvailable = mergedRealReturn !== null 
      ? mergedRealReturn 
      : basePostFireReturn;
    
    let testPortfolio = currentAvailable * (1 + realPostFireReturnAvailable); // Normal övergång, ingen halvårsbuffert
    
    // Simulera bridge-perioden med hänsyn till tidiga uttag av tjänstepension och IPS
    const ageAtFire = averageAge + year;
    const bridgeResult = simulateBridge({
      testPortfolio,
      annualExpenses,
      ageAtFire,
      bridgeYearsExact,
      currentOccPension,
      currentPrivatePension,
      occPensionEarlyStartAge,
      ipsEarlyStartAge,
      realPostFireReturnAvailable,
      safeRealOccPension,
      safeRealPrivatePension,
      inflation
    });
    
    const bridgeFailed = bridgeResult.bridgeFailed;
    const remainingAtPension = bridgeResult.portfolioAtPension;
    // Uppdatera pensionsvärden baserat på vad som faktiskt hände under bridge
    const remainingOccPension = bridgeResult.remainingOccPension;
    const remainingPrivatePension = bridgeResult.remainingPrivatePension;
    
    // 2. Krav vid pension: finns tillräckligt kvar?
    if (!bridgeFailed) {
      // Marknadsbaserade pensionstillgångarna växer under bridge-perioden
      // Varje pensionshink växer med sin egen avkastning
      // Premiepension växer hela vägen till pensionsålder (ingen tidig uttag möjlig)
      let premiePensionGrown = currentPremiePension * Math.pow(1 + safeRealPremiePension, bridgeYearsExact);
      
      // Tjänstepension och IPS kan ha tagits ut tidigt under bridge-perioden
      // Använd de uppdaterade värdena från bridge-simuleringen
      // Om de tagits ut tidigt (remainingOccPension/remainingPrivatePension = 0) är de redan inkluderade i remainingAtPension
      // Om de inte tagits ut, växer de hela bridge-perioden
      const occPensionGrown = remainingOccPension > 0 
        ? remainingOccPension * Math.pow(1 + safeRealOccPension, bridgeYearsExact)
        : 0;
      const privatePensionGrown = remainingPrivatePension > 0
        ? remainingPrivatePension * Math.pow(1 + safeRealPrivatePension, bridgeYearsExact)
        : 0;
      
      // Totalt marknadsbaserad pension vid pensionsstart
      const pensionGrown = occPensionGrown + premiePensionGrown + privatePensionGrown;
      
      // Statlig pension växer också under bridge-perioden (men används som utbetalning, inte kapital)
      const statePensionGrownAtPension = currentStatePension * Math.pow(1 + safeRealStatePension, bridgeYearsExact);
      const statePensionAnnualIncomeAtPension = statePensionGrownAtPension > 0 
        ? statePensionGrownAtPension / statePensionPayoutYears 
        : 0;
      
      // Justera requiredAtPension med den faktiska statliga pensionsinkomsten vid pensionsstart
      // (den kan vara högre än den initiala beräkningen eftersom pensionen växer under bridge-perioden)
      const totalPensionIncomeAtPension = annualPension + statePensionAnnualIncomeAtPension;
      const adjustedRequiredAtPension = Math.max(0, (annualExpenses - totalPensionIncomeAtPension) * 25);
      
      const totalAtPension = remainingAtPension + pensionGrown;
      
      // FIRE uppnås om båda kriterier är uppfyllda (använd justerat krav)
      if (totalAtPension >= adjustedRequiredAtPension) {
        return {
          yearsToFire: year,
          estimatedAge: averageAge + year,
          portfolioAtFire: currentAvailable,
          requiredAtPension: adjustedRequiredAtPension,
          currentMonthlyExpenses: monthlyExpenses,
          availableAtStart,
          statePensionAtStart,
          isAchievable: true,
          warnings,
          realReturnAvailable,
          realReturnStatePension: safeRealStatePension,
          statePensionAnnualIncome: statePensionAnnualIncomeAtPension > 0 ? statePensionAnnualIncomeAtPension : undefined,
          statePensionPayoutYears: statePensionAnnualIncomeAtPension > 0 ? statePensionPayoutYears : undefined
        };
      }
    }
  }
  
  // Om vi inte hittade ett FIRE-år - beräkna statlig pension vid pensionsstart ändå
  // OBS: currentStatePension är redan uppräknad till pensionsstart via loopen ovan, multiplicera inte igen
  const finalStatePensionAtPension = currentStatePension;
  const finalStatePensionAnnualIncome = finalStatePensionAtPension > 0 
    ? finalStatePensionAtPension / statePensionPayoutYears 
    : 0;
  
  return {
    yearsToFire: null,
    estimatedAge: null,
    portfolioAtFire: 0,
    requiredAtPension: requiredAtPension,
    currentMonthlyExpenses: monthlyExpenses,
    availableAtStart,
    statePensionAtStart,
    isAchievable: false,
    warnings: [...warnings, 'FIRE ej uppnåeligt med nuvarande antaganden'],
    realReturnAvailable,
    realReturnStatePension: safeRealStatePension,
    statePensionAnnualIncome: finalStatePensionAnnualIncome > 0 ? finalStatePensionAnnualIncome : undefined,
    statePensionPayoutYears: finalStatePensionAnnualIncome > 0 ? statePensionPayoutYears : undefined
  };
}
