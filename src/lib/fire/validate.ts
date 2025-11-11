import { FIREResult } from './calc';
import { simulatePortfolio } from './simulate';
import { calculateAutoReturns, toReal } from './calc';
import { Asset, Person, Liability } from '@/lib/types';
import { calculateAmortizationMonthly, calculateMarketPensionMonthlyAllocations, calculatePublicPensionMonthlyAllocations } from '@/lib/wealth/calc';
import { calculatePersonNetIncome } from '@/lib/wealth/tax-calc';

interface FindSafeFireYearInput {
  baseResult: FIREResult;
  assets: Asset[];
  liabilities: Liability[];
  persons: Person[];
  totalNetWorth: number;
  inflation?: number;
  pensionStartAge?: number;
  maxAdditionalYears?: number;
}

/**
 * Validerar och hittar ett säkert FIRE-år genom att testa simuleringen.
 * Om baseResult.yearsToFire leder till att kapitalet tar slut före pension,
 * testar vi med +1, +2, ... år tills vi hittar ett som håller.
 * 
 * @returns FIREResult med korrigerat yearsToFire om ett säkert år hittades,
 * annars ett resultat markerat som ej uppnåeligt.
 */
export function findSafeFireYear({
  baseResult,
  assets,
  liabilities,
  persons,
  totalNetWorth,
  inflation = 0.02,
  pensionStartAge = 63,
  maxAdditionalYears = 10
}: FindSafeFireYearInput): FIREResult {
  // Om baseResult redan är ej uppnåeligt, returnera det direkt
  if (!baseResult.isAchievable || baseResult.yearsToFire === null) {
    return baseResult;
  }

  // Beräkna grundläggande värden (samma som i simulatorn)
  const monthlySavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
  const amortizationMonthly = calculateAmortizationMonthly(liabilities);
  const totalMonthlySavings = monthlySavings + amortizationMonthly;

  const marketPensionContribMonthly = calculateMarketPensionMonthlyAllocations(persons);
  const statePensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);

  const autoReturns = calculateAutoReturns(assets, inflation, 0.07, liabilities);

  const totalNetIncomeMonthly = persons.reduce((sum, p) => sum + (calculatePersonNetIncome(p) || 0), 0);
  const customMonthlyExpenses = Math.max(0, totalNetIncomeMonthly - totalMonthlySavings);

  const averageAge = persons.length > 0
    ? Math.round(persons.reduce((sum, p) => {
        const age = new Date().getFullYear() - p.birth_year;
        return sum + age;
      }, 0) / persons.length)
    : 40;

  // Beräkna 4%-krav med statlig pension
  const annualExpenses = customMonthlyExpenses * 12;
  const statePensionIncome = baseResult.statePensionAnnualIncome || 0;
  const requiredAtPension = Math.max(0, (annualExpenses - statePensionIncome) * 25);

  // Hämta statlig pensionsdata från baseResult
  const statePensionAtStart = baseResult.statePensionAtStart ?? 0;
  const statePensionPayoutYears = baseResult.statePensionPayoutYears ?? 20;
  const statePensionAnnualIncome = baseResult.statePensionAnnualIncome ?? 0;

  // Testa baseResult.yearsToFire och sedan +1, +2, ... år
  for (let i = 0; i <= maxAdditionalYears; i++) {
    const candidateYearsToFire = baseResult.yearsToFire + i;
    const candidateFireAge = averageAge + candidateYearsToFire;

    // Stoppa om kandidatåldern >= pensionsålder
    if (candidateFireAge >= pensionStartAge) {
      break;
    }

    // Kör simulering med samma parametrar som i simulatorn
    const simulation = simulatePortfolio(
      baseResult.availableAtStart,
      baseResult.pensionLockedAtStart,
      totalMonthlySavings,
      autoReturns.realReturnAvailable,
      autoReturns.realReturnPension,
      customMonthlyExpenses * 12,
      averageAge,
      pensionStartAge,
      requiredAtPension,
      candidateYearsToFire,
      0, // monthlyPensionAfterTax
      marketPensionContribMonthly,
      inflation,
      false, // useCoastFire
      0, // coastFireYears
      0, // coastFirePensionContribMonthly
      statePensionAtStart,
      autoReturns.realReturnStatePension,
      statePensionContribMonthly,
      statePensionPayoutYears,
      statePensionAnnualIncome
    );

    // Om kapitalet inte tar slut, eller tar slut efter pension, är detta ett säkert år
    if (simulation.capitalDepletedYear === null || simulation.capitalDepletedYear >= pensionStartAge) {
      return {
        ...baseResult,
        yearsToFire: candidateYearsToFire,
        estimatedAge: candidateFireAge
      };
    }
  }

  // Om inget år hittades som håller, markera som ej uppnåeligt
  return {
    ...baseResult,
    isAchievable: false,
    yearsToFire: null,
    estimatedAge: null,
    warnings: [
      ...baseResult.warnings,
      'Kapitalet tar slut före pensionsålder även med upp till ' + maxAdditionalYears + ' år extra.'
    ]
  };
}

