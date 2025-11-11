/**
 * Beräkningslogik för förmögenhetskollen
 * Innehåller alla kärnberäkningar för förmögenhet, avkastning och nivåer
 */

import { 
  Person, 
  Income,
  Asset, 
  Liability, 
  WealthMetrics, 
  MonthlyIncreaseBreakdown,
  WealthLevel 
} from '@/lib/types';
import { getConfig, DEFAULT_APY } from './config';

/**
 * Rikedomsnivåer (Rikedomstrappan)
 */
export const WEALTH_LEVELS: WealthLevel[] = [
  {
    level: 1,
    name: 'Lön-till-lön',
    start: 0,
    next: 100_000,
    description: 'Överlevnadszonen - fokus på att bygga buffert och grundläggande behov',
    pros: 'Enkel budget, tydliga prioriteringar',
    cons: 'Begränsad flexibilitet, stress vid oväntade utgifter, behöver bygga buffert'
  },
  {
    level: 2,
    name: 'Matvarufrihet',
    start: 100_000,
    next: 1_000_000,
    description: 'Stabilitetens mark - trygghet i vardagen',
    pros: 'Buffert för oväntade utgifter, mindre stress',
    cons: 'Fortfarande begränsad i val av livsstil'
  },
  {
    level: 3,
    name: 'Restaurangfrihet',
    start: 1_000_000,
    next: 10_000_000,
    description: 'Komfortens slätt - bekvämlighet utan bekymmer',
    pros: 'Kan välja bekvämlighet, mindre oro för pengar',
    cons: 'Risk för livsstilsinflation'
  },
  {
    level: 4,
    name: 'Resefrihet',
    start: 10_000_000,
    next: 100_000_000,
    description: 'Utforskarnas horisont - geografisk frihet',
    pros: 'Kan resa fritt, arbeta var som helst',
    cons: 'Behöver hantera komplexitet i flera länder'
  },
  {
    level: 5,
    name: 'Geografisk frihet',
    start: 100_000_000,
    next: 1_000_000_000,
    description: 'Gränslöshetens öar - verklig frihet',
    pros: 'Fullständig geografisk frihet, kan påverka samhället',
    cons: 'Stora ansvar, komplexa investeringar'
  },
  {
    level: 6,
    name: 'Påverkansfrihet',
    start: 1_000_000_000,
    next: null,
    description: 'Ledarskapets topp - påverka världen',
    pros: 'Kan påverka samhället och världen',
    cons: 'Stora ansvar, offentlig uppmärksamhet'
  }
];

/**
 * Beräknar nettoförmögenhet
 */
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.principal, 0);
  return totalAssets - totalLiabilities;
}

/**
 * Beräknar månatlig avkastning från tillgångar (geometrisk)
 */
export function calculateAssetReturns(assets: Asset[]): number {
  return assets.reduce((sum, asset) => {
    // Geometrisk månatlig avkastning: (1 + apy)^(1/12) - 1
    const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
    return sum + (asset.value * monthlyRate);
  }, 0);
}

/**
 * Beräknar månatlig amortering (enkel formel: rate / 12)
 * OBS: Detta är en annan formel än calculateAmortizationMonthly som använder sammansatt ränta
 */
export function calculateAmortization(liabilities: Liability[]): number {
  return liabilities.reduce((sum, liability) => {
    return sum + (liability.principal * liability.amortization_rate_apy / 12);
  }, 0);
}

/**
 * Beräknar kvalificerad inkomst för en person (begränsad till max pensionsgrundande inkomst)
 * 
 * @param person Person med flera inkomster
 * @returns Kvalificerad månadsinkomst (begränsad till 8.07 IBB per månad)
 */
export function calculateQualifyingIncome(person: Person): number {
  const config = getConfig();

  // Summera bara pensiongrundande inkomster (job)
  const totalMonthlyIncome = person.incomes?.reduce((sum, income) => {
    return income.income_type === 'job' ? sum + income.monthly_income : sum;
  }, 0) || 0;

  // Skydda mot negativa värden
  const monthlyIncome = Math.max(totalMonthlyIncome, 0);

  // Max pensionsgrundande inkomst (8.07 IBB per år → per månad)
  const ibbMonthlyCap = (config.IBB_PENSION_CAP_MULTIPLIER * config.IBB_ANNUAL) / 12;

  // Begränsa till högsta pensionsgrundande inkomst
  return Math.min(monthlyIncome, ibbMonthlyCap);
}

/**
 * Beräknar allmän pensionsavsättning för en person
 * Enligt Pensionsmyndighetens modell och Excel-formel:
 * =AVRUNDA(0,185*0,93*MIN(D4;(8,07*$F$5)/12); 2)
 * 
 * @param person Person med flera inkomster
 * @returns Månatlig allmän pensionsavsättning i kr
 */
export function calculatePublicPension(person: Person): number {
  const config = getConfig();
  const qualifyingIncome = calculateQualifyingIncome(person);

  // PGI (93% av inkomst)
  const pensionableIncome = qualifyingIncome * config.PENSIONABLE_INCOME_RATE;

  // Allmän pensionsavsättning (18,5% av PGI)
  const publicPensionMonthly = pensionableIncome * config.PUBLIC_PENSION_RATE;

  // Avrunda till ören
  return Math.round(publicPensionMonthly * 100) / 100;
}

/**
 * Beräknar inkomstpension (statlig trygghetsbaserad del, exklusive premiepension)
 */
export function calculateIncomePension(person: Person): number {
  const config = getConfig();
  const qualifyingIncome = calculateQualifyingIncome(person);
  const pensionableIncome = qualifyingIncome * config.PENSIONABLE_INCOME_RATE;
  
  // Inkomstpension = Allmän pension - Premiepension
  // Allmän pension = 18.5%, Premiepension = 2.5%, så Inkomstpension = 16%
  const incomePensionRate = config.PUBLIC_PENSION_RATE - config.PREMIEPENSION_RATE;
  const incomePensionMonthly = pensionableIncome * incomePensionRate;
  
  return Math.round(incomePensionMonthly * 100) / 100;
}

/**
 * Beräknar premiepension (marknadsbaserad del av allmän pension)
 */
export function calculatePremiePension(person: Person): number {
  const config = getConfig();
  const qualifyingIncome = calculateQualifyingIncome(person);
  const pensionableIncome = qualifyingIncome * config.PENSIONABLE_INCOME_RATE;
  
  // Premiepension = 2.5% av PGI
  const premiePensionMonthly = pensionableIncome * config.PREMIEPENSION_RATE;
  
  return Math.round(premiePensionMonthly * 100) / 100;
}

/**
 * Beräknar tjänstepensionsavsättning för en inkomst
 */
export function calculateOccupationalPensionForIncome(income: Income): number {
  const config = getConfig();
  const monthlyIncome = income.monthly_income;
  
  switch (income.pension_type) {
    case 'ITP1': {
      // ITP1: 4.5% upp till 7.5 IBB, 30% över 7.5 IBB
      const capMonthly = (config.ITP1_CAP_MULTIPLIER * config.IBB_ANNUAL) / 12;
      
      if (monthlyIncome <= capMonthly) {
        return monthlyIncome * config.ITP1_LOWER_RATE;
      } else {
        return capMonthly * config.ITP1_LOWER_RATE + 
               (monthlyIncome - capMonthly) * config.ITP1_HIGHER_RATE;
      }
    }
    
    case 'ITP2': {
      // ITP2: 2% av lönen för ITPK-delen (förmånsbestämd del utanför scope för MVP)
      return monthlyIncome * 0.02;
    }
    
    case 'SAF-LO': {
      // SAF-LO: 4.5% av lönen
      return monthlyIncome * 0.045;
    }
    
    case 'AKAP-KR': {
      // AKAP-KR: Kommun/region - 4.5% av lönen (generaliserat för MVP)
      return monthlyIncome * 0.045;
    }
    
    case 'PA16': {
      // PA16: Statlig anställning - 4.5% av lönen (generaliserat för MVP)
      return monthlyIncome * 0.045;
    }
    
    case 'Annat':
      // Om användaren valt belopp, använd det direkt
      if (income.tp_input_type === 'amount' && income.custom_tp_amount) {
        return income.custom_tp_amount;
      }
      // Annars använd procent av lönen
      // Normalisera custom_tp_rate: om tp_input_type är 'percentage' så betyder det att användaren
      // angivit det som procent. Om värdet är > 1, betyder det att det är i procent-format (10 för 10%)
      // och måste konverteras till decimal (0.1). Om värdet är <= 1, använd som decimal direkt.
      let tpRate = income.custom_tp_rate;
      if (tpRate === undefined || tpRate === null) {
        tpRate = 0;
      } else {
        tpRate = typeof tpRate === 'number' ? tpRate : parseFloat(String(tpRate));
        if (isNaN(tpRate)) tpRate = 0;
      }
      
      // custom_tp_rate sparas som decimal (0.1 för 10%), precis som expected_apy sparas som decimal (0.07 för 7%)
      // Data från store är alltid i decimal-format, men kan komma från formuläret i procent-format
      // Om värdet är > 1, det är i procent-format från formuläret (10 för 10%), konvertera till decimal (0.1)
      // Om värdet är <= 1, det kan vara antingen:
      //   - Decimal från store (0.1 för 10%) → använd som det är
      //   - Procent från formulär (0.1 för 0.1%) → dividera med 100 → 0.001
      // För att hantera detta, använder vi en heuristik:
      // - Om värdet är > 1, dividera med 100 (definitivt procent)
      // - Om värdet är <= 1 OCH > 0.01, använd som det är (antingen decimal eller liten procent som ska vara decimal)
      // - Om värdet är <= 0.01, dividera med 100 (det är troligen 0.1% från formulär, inte 1% decimal)
      // MEN: Detta är fortfarande osäkert. Den säkraste metoden är att alltid dividera om tp_input_type är 'percentage'
      // eftersom vi vet att om det är 'percentage', så är det alltid i procent-format från formuläret.
      // Men data från store har också tp_input_type: 'percentage' men värdet är i decimal.
      // 
      // FÖR NUVARANDE: Använd samma logik som normalizePersonForCalculation:
      // - Om värdet är > 1, dividera med 100 (definitivt procent)
      // - Om värdet är <= 1, använd som det är (antingen decimal eller liten procent)
      // Detta missar 0.1% från formulär, men det är bättre än att göra fel för alla andra värden.
      // Den bästa lösningen är att säkerställa att data alltid är i rätt format när den kommer hit.
      if (income.tp_input_type === 'percentage') {
        if (tpRate > 1) {
          // Procent-format från formuläret: 10 → 0.1
          tpRate = tpRate / 100;
        }
        // Om tpRate <= 1, använd som det är (antingen redan decimal från store eller liten procent)
        // OBS: Detta missar 0.1% från formulär, men det är bättre än att göra fel för alla andra värden
      }
      
      // Debug: Logga om värdet är suspekt (för hög tjänstepension)
      if (process.env.NODE_ENV === 'development' && monthlyIncome > 0) {
        const pensionAmount = monthlyIncome * tpRate;
        if (pensionAmount > monthlyIncome) {
          console.warn('⚠️ SUSPECTED ERROR: Tjänstepension större än lön!', {
            monthlyIncome,
            tpRate,
            tp_input_type: income.tp_input_type,
            pensionAmount,
            custom_tp_rate: income.custom_tp_rate
          });
        }
      }
      
      // Returnera månatlig tjänstepension: månadslön * decimal_rate
      // tpRate är nu alltid i decimal-format (0.1 för 10%), precis som expected_apy är i decimal-format (0.07 för 7%)
      return monthlyIncome * tpRate;
    
    default:
      return 0;
  }
}

/**
 * Normaliserar en persons income-data för beräkningar
 * Konverterar custom_tp_rate från procent till decimal om det kommer från formuläret
 * custom_tp_rate sparas som decimal (0.1 för 10%) i store, precis som expected_apy (0.07 för 7%)
 * Men i formuläret visas det som procent (10), precis som expected_apy_percent (7)
 * Om data kommer från formuläret (procent-format), konvertera till decimal för beräkningar
 */
function normalizePersonForCalculation(person: Person): Person {
  if (!person || !person.incomes) return person;
  
  return {
    ...person,
    incomes: person.incomes.map(income => {
      // Om tp_input_type är 'percentage' och custom_tp_rate finns, konvertera från procent till decimal om det behövs
      // Data från store är redan i decimal (0.1), men data från formuläret kan vara i procent (10)
      if (income.tp_input_type === 'percentage' && income.custom_tp_rate !== undefined && income.custom_tp_rate !== null) {
        const rate = typeof income.custom_tp_rate === 'number' 
          ? income.custom_tp_rate 
          : parseFloat(String(income.custom_tp_rate));
        
        if (!isNaN(rate)) {
          // Om värdet är större än 1, det är definitivt i procent-format från formuläret (10 för 10%), konvertera till decimal (0.1)
          if (rate > 1) {
            return {
              ...income,
              custom_tp_rate: rate / 100
            };
          }
          // Om värdet är <= 1, det kan vara antingen:
          //   - Decimal från store (0.1 för 10%) → använd som det är
          //   - Procent från formulär (0.1 för 0.1%) → dividera med 100 → 0.001
          // Eftersom vi inte kan skilja säkert, använder vi en heuristik:
          // Om värdet är mycket litet (<= 0.01), det är troligen ett procent-värde från formulär (0.1% = 0.1 → 0.001)
          // Men detta är osäkert. Den säkraste metoden är att förlita oss på att data från store är korrekt
          // och att calculateOccupationalPensionForIncome har fallback-normalisering.
          // För nu, använd värdet som det är om det är <= 1 (antingen decimal eller liten procent)
        }
      }
      return income;
    })
  };
}

/**
 * Beräknar tjänstepension för en person baserat på inkomster
 * Normaliserar person-data först för att säkerställa korrekt beräkning
 */
export function calculateOccupationalPension(person: Person): number {
  if (!person || !person.incomes) return 0;
  
  // VIKTIGT: Normalisera person-data FÖRST för att säkerställa korrekt beräkning
  // Detta konverterar custom_tp_rate från procent (10) till decimal (0.1) om det behövs
  const normalizedPerson = normalizePersonForCalculation(person);
  
  // Debug: Logga normalisering för att verifiera att det fungerar (bara i development)
  if (process.env.NODE_ENV === 'development') {
    person.incomes?.forEach(income => {
      if (income.income_type === 'job' && income.pension_type === 'Annat' && income.tp_input_type === 'percentage') {
        const original = income.custom_tp_rate;
        const normalized = normalizedPerson.incomes?.find(i => i.id === income.id)?.custom_tp_rate;
        if (original !== normalized && original !== undefined && normalized !== undefined) {
          console.debug('🔧 Normalized custom_tp_rate for calculation:', { 
            original, 
            normalized, 
            monthlyIncome: income.monthly_income,
            expectedPension: (income.monthly_income || 0) * (normalized as number)
          });
        }
      }
    });
  }
  
  return normalizedPerson.incomes?.reduce((total, income) => {
    // Bara beräkna tjänstepension för jobb-inkomster
    if (income.income_type === 'job') {
      // calculateOccupationalPensionForIncome har också normalisering som fallback,
      // men vi normaliserar redan här så den bör få decimal-format
      const result = calculateOccupationalPensionForIncome(income);
      return total + result;
    }
    return total;
  }, 0) || 0;
}

/**
 * Beräknar extra pensionsavsättning för en person
 * Inkluderar löneväxling per inkomst (bara från jobb-inkomster)
 */
export function calculateExtraPension(person: Person): number {
  // Löneväxling från jobb-inkomster
  const salaryExchange = person.incomes?.reduce((sum, income) => {
    if (income.income_type === 'job') {
      return sum + (income.salary_exchange_monthly || 0);
    }
    return sum;
  }, 0) || 0;
  
  return salaryExchange;
}

/**
 * Beräknar totala inkomster för en person (både jobb och andra)
 * Konverterar årsinkomster till månadsinkomster för andra inkomster
 */
export function calculateTotalIncome(person: Person): number {
  return person.incomes?.reduce((sum, income) => {
    if (income.income_type === 'other') {
      // Konvertera årsinkomst till månadsinkomst
      return sum + (income.monthly_income / 12);
    }
    return sum + income.monthly_income;
  }, 0) || 0;
}

/**
 * Beräknar jobb-inkomster för en person
 */
export function calculateJobIncome(person: Person): number {
  return person.incomes?.reduce((sum, income) => {
    return income.income_type === 'job' ? sum + income.monthly_income : sum;
  }, 0) || 0;
}

/**
 * Beräknar andra inkomster för en person (konverterar årsinkomster till månadsinkomster)
 */
export function calculateOtherIncome(person: Person): number {
  return person.incomes?.reduce((sum, income) => {
    if (income.income_type === 'other') {
      // Konvertera årsinkomst till månadsinkomst
      return sum + (income.monthly_income / 12);
    }
    return sum;
  }, 0) || 0;
}

/**
 * Beräknar totala månatliga avsättningar för alla personer
 */
export function calculateMonthlyContributions(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((sum, person) => {
    // Använd samma uppdelning som calculatePersonsMonthlyAllocations för konsistens
    const incomePension = calculateIncomePension(person); // Statlig inkomstpension
    const premiePension = calculatePremiePension(person); // Premiepension
    const occupationalPension = calculateOccupationalPension(person); // Tjänstepension
    const extraPension = calculateExtraPension(person); // Löneväxling
    const ips = person.ips_monthly || 0; // IPS-spar
    const otherSavings = person.other_savings_monthly || 0; // Övrigt sparande
    
    return sum + incomePension + premiePension + occupationalPension + extraPension + ips + otherSavings;
  }, 0);
}

/**
 * Beräknar total månatlig ökning
 * Använder calculateAssetsMonthlyReturn för att ta hänsyn till nettovärden per kategori
 */
export function calculateMonthlyIncrease(
  assets: Asset[],
  liabilities: Liability[],
  persons: Person[]
): number {
  const assetReturns = calculateAssetsMonthlyReturn(assets, liabilities);
  const amortization = calculateAmortization(liabilities);
  const contributions = calculateMonthlyContributions(persons);
  
  return assetReturns + amortization + contributions;
}

/**
 * Hittar aktuell rikedomsnivå baserat på nettoförmögenhet
 */
export function getCurrentLevel(netWorth: number): WealthLevel {
  // Hantera negativ nettoförmögenhet explicit - returnera nivå 1
  if (netWorth < 0) {
    return WEALTH_LEVELS[0];
  }
  
  const level = WEALTH_LEVELS.find(l => 
    netWorth >= l.start && (l.next === null || netWorth < l.next)
  );
  
  return level || WEALTH_LEVELS[WEALTH_LEVELS.length - 1];
}

/**
 * Beräknar progress inom aktuell nivå (0-1)
 */
export function calculateProgress(netWorth: number, level: WealthLevel): number {
  // Negativ förmögenhet = 0% progress
  if (netWorth < 0) return 0;
  
  if (level.next === null) return 1; // Högsta nivån
  
  const range = level.next - level.start;
  const progress = (netWorth - level.start) / range;
  
  return Math.max(0, Math.min(1, progress));
}

/**
 * Input-typer för kompoundad hastighetsberäkning
 */
export type SpeedInputs = {
  netWorth: number;                // NW0 (kr)
  target: number;                  // nästa nivå (kr)
  assetsMonthlyReturn: number;     // kr/mån från avkastning
  flatMonthlyContrib: number;      // c = amort + pension+spar (kr/mån), EXKL avkastning
};

const EPS = 1e-6;

/**
 * Beräknar månader till mål med kompoundad tillväxt
 * NW_{t+1} = NW_t * (1 + g) + c
 * där g = assetsMonthlyReturn / netWorth och c = flatMonthlyContrib
 */
export function estimateMonthsToTargetCompounded({
  netWorth,
  target,
  assetsMonthlyReturn,
  flatMonthlyContrib,
}: SpeedInputs): number {
  if (target <= netWorth) return 0;

  // g = "procentuell" månadsavkastning på nuvarande NW
  const g = netWorth > 0 ? Math.max(assetsMonthlyReturn / netWorth, 0) : 0;

  const c = flatMonthlyContrib; // kan vara 0 eller mer; om <0 blir det längre tid/omöjligt

  // Specialfall: ingen avkastning
  if (g <= EPS) {
    if (c <= 0) return Infinity;
    return (target - netWorth) / c; // månader
  }

  // Allmän lösning:
  const num = c + g * target;
  const den = c + g * netWorth;
  if (den <= 0 || num <= 0) return Infinity;

  const ratio = num / den;
  const ln1pg = Math.log(1 + g);
  if (ln1pg <= 0) return Infinity;

  const n = Math.log(ratio) / ln1pg; // månader
  return n < 0 ? 0 : n;
}

/**
 * Beräknar hastighetsindex baserat på kompoundad modell
 * Tar hänsyn till positionen i nuvarande nivå
 */
export function speedIndexCompounded(
  nMonths: number, 
  currentProgress: number
): number {
  // Om nMonths är Infinity eller inte är ett giltigt nummer, returnera 0 (ingen hastighet)
  if (!isFinite(nMonths) || nMonths <= 0) return 0;
  
  // Beräkna hur många månader som redan "använts" i nuvarande nivå
  const monthsUsedInCurrentLevel = currentProgress * 120; // 120 månader = medianen per nivå
  
  // Beräkna återstående månader i nuvarande nivå
  const remainingMonthsInCurrentLevel = 120 - monthsUsedInCurrentLevel;
  
  // Om återstående månader är 0 eller negativa, returnera 0
  if (remainingMonthsInCurrentLevel <= 0) return 0;
  
  // Hastighetsindex = Återstående tid i nuvarande nivå ÷ Beräknad tid till nästa nivå
  const index = remainingMonthsInCurrentLevel / nMonths;
  
  // Säkerställ att resultatet är ett giltigt nummer
  return isFinite(index) ? index : 0;
}

/**
 * Hjälpfunktion: bryt ut g och c från komponenter
 * Separerar statlig pension och marknadsbaserad pension med sina avkastningar
 */
export function decomposeGrowth(
  netWorth: number,
  assetsMonthlyReturn: number,
  amortizationMonthly: number,
  personsMonthlyAllocations: number,
  assets?: Asset[],
  persons?: Person[],
  liabilities?: Liability[]
): { g: number; c: number } {
  // Om assets och persons finns, separera pensionerna
  if (assets && persons) {
    // Separera avkastningar
    const publicPensionReturns = calculatePublicPensionReturns(assets);
    const marketPensionReturns = calculateMarketPensionReturns(assets);
    const nonPensionAssetReturns = calculateNonPensionAssetReturns(assets, liabilities || []);
    
    // Separera månadsavsättningar
    const publicPensionContributions = calculatePublicPensionMonthlyAllocations(persons);
    const marketPensionContributions = calculateMarketPensionMonthlyAllocations(persons);
    const otherSavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    
    // Beräkna total avkastning: övriga tillgångar + statlig pension (2%) + marknadsbaserad pension (viktat snitt)
    // Statlig pension växer med sin egen avkastning (2%), marknadsbaserad med viktat snitt
    const totalAssetReturns = nonPensionAssetReturns + publicPensionReturns + marketPensionReturns;
    
    // Total månadsbidrag: amortering + statlig pensionsavsättning + marknadsbaserad pensionsavsättning + övrigt sparande
    const totalMonthlyContrib = amortizationMonthly + publicPensionContributions + marketPensionContributions + otherSavings;
    
    // g = procentuell månadsavkastning på netWorth
    const g = netWorth > 0 ? Math.max(totalAssetReturns / netWorth, 0) : 0;
    const c = Math.max(totalMonthlyContrib, 0);
    
    return { g, c };
  }
  
  // Fallback till enklare beräkning (bakåtkompatibilitet)
  const g = netWorth > 0 ? Math.max(assetsMonthlyReturn / netWorth, 0) : 0;
  const c = Math.max(amortizationMonthly + personsMonthlyAllocations, 0);
  return { g, c };
}

/**
 * Beräknar hastighetsindex (hur snabbt hushållet rör sig mot nästa nivå)
 * Använder kompoundad modell med ränta-på-ränta-effekt
 * Tar hänsyn till positionen i nuvarande nivå
 */
export function calculateSpeedIndex(
  netWorth: number, 
  monthlyIncrease: number, 
  level: WealthLevel,
  assetsMonthlyReturn: number,
  amortizationMonthly: number,
  personsMonthlyAllocations: number,
  assets?: Asset[],
  persons?: Person[],
  liabilities?: Liability[]
): number {
  if (level.next === null) return 0; // Högsta nivån
  
  // Om det inte finns någon tillväxt alls (netWorth = 0 och monthlyIncrease = 0), returnera 0
  if (Math.abs(netWorth) < 1 && Math.abs(monthlyIncrease) < 1) {
    return 0;
  }
  
  // Använd separerade pensionstyper om assets och persons finns
  const { g, c } = decomposeGrowth(netWorth, assetsMonthlyReturn, amortizationMonthly, personsMonthlyAllocations, assets, persons, liabilities);
  
  // Beräkna total avkastning för estimateMonthsToTargetCompounded
  const totalAssetReturns = assets && persons 
    ? (() => {
        const publicPensionReturns = calculatePublicPensionReturns(assets);
        const marketPensionReturns = calculateMarketPensionReturns(assets);
        const nonPensionAssetReturns = calculateNonPensionAssetReturns(assets, liabilities || []);
        return nonPensionAssetReturns + publicPensionReturns + marketPensionReturns;
      })()
    : assetsMonthlyReturn;
  
  const nMonths = estimateMonthsToTargetCompounded({
    netWorth,
    target: level.next,
    assetsMonthlyReturn: totalAssetReturns,
    flatMonthlyContrib: c,
  });
  
  // Om nMonths är Infinity (ingen möjlighet att nå målet med nuvarande förutsättningar), returnera 0
  if (!isFinite(nMonths) || nMonths <= 0) {
    return 0;
  }
  
  // Beräkna progress inom nuvarande nivå
  const currentProgress = calculateProgress(netWorth, level);
  
  return speedIndexCompounded(nMonths, currentProgress);
}

/**
 * Beräknar år till nästa nivå med kompoundad tillväxt
 */
export function calculateYearsToNextLevel(
  netWorth: number, 
  monthlyIncrease: number, 
  level: WealthLevel,
  assetsMonthlyReturn: number,
  amortizationMonthly: number,
  personsMonthlyAllocations: number,
  assets?: Asset[],
  persons?: Person[],
  liabilities?: Liability[]
): number | null {
  if (level.next === null) return null;
  
  // Använd separerade pensionstyper om assets och persons finns
  const { g, c } = decomposeGrowth(netWorth, assetsMonthlyReturn, amortizationMonthly, personsMonthlyAllocations, assets, persons, liabilities);
  
  // Beräkna total avkastning för estimateMonthsToTargetCompounded
  const totalAssetReturns = assets && persons 
    ? (() => {
        const publicPensionReturns = calculatePublicPensionReturns(assets);
        const marketPensionReturns = calculateMarketPensionReturns(assets);
        const nonPensionAssetReturns = calculateNonPensionAssetReturns(assets, liabilities || []);
        return nonPensionAssetReturns + publicPensionReturns + marketPensionReturns;
      })()
    : assetsMonthlyReturn;
  
  const nMonths = estimateMonthsToTargetCompounded({
    netWorth,
    target: level.next,
    assetsMonthlyReturn: totalAssetReturns,
    flatMonthlyContrib: c,
  });
  
  if (!isFinite(nMonths) || nMonths <= 0) return null;
  
  return nMonths / 12; // Konvertera till år
}

/**
 * Formaterar tid till nästa nivå på ett tydligt sätt
 */
export function formatTimeToNextLevel(years: number | null): string {
  if (years === null) return 'Okänt';
  
  // Hantera negativa värden
  if (years <= 0) return 'Redan nådd';
  
  const yearsOnly = Math.floor(years);
  const monthsOnly = Math.round((years - yearsOnly) * 12);
  
  if (years < 1) {
    return `${Math.round(years * 12)} månader`;
  } else if (monthsOnly === 0) {
    return `${yearsOnly} år`;
  } else {
    return `${yearsOnly} år och ${monthsOnly} månader`;
  }
}

/**
 * Klassificerar hastighet baserat på speedIndex
 * Jämför med medianen (10 år per nivå)
 */
export function getSpeedText(speedIndex: number): 'Mycket snabb' | 'Snabb' | 'Normal' | 'Långsam' {
  // Hantera Infinity och NaN
  if (!isFinite(speedIndex) || speedIndex <= 0) return 'Långsam';
  
  if (speedIndex >= 2) return 'Mycket snabb'; // ≤ 5 år
  if (speedIndex >= 1) return 'Snabb'; // ≤ 10 år
  if (speedIndex >= 0.5) return 'Normal'; // 10-20 år
  return 'Långsam'; // > 20 år
}

/**
 * Ger hastighetsetikett och färg baserat på speedIndex
 */
export function speedLabelColor(speedIndex: number): { label: string; color: "green"|"yellow"|"orange"|"red" } {
  if (!isFinite(speedIndex)) return { label: "Ej nåbart", color: "red" };
  if (speedIndex >= 2) return { label: "Utmärkt (≤ 5 år)", color: "green" };
  if (speedIndex >= 1) return { label: "Bra (≤ 10 år)", color: "yellow" };
  if (speedIndex >= 0.5) return { label: "OK (10–20 år)", color: "orange" };
  return { label: "Långsam (> 20 år)", color: "red" };
}

/**
 * Ger en pedagogisk förklaring av hastigheten
 */
export function getSpeedExplanation(speedIndex: number): string {
  if (speedIndex >= 2) return 'Just nu går du 2x snabbare än genomsnittet för de som lyckas ta sig till nästa nivå (10 år per nivå). Beräkningen tar hänsyn till exponentiell tillväxt - ju mer förmögenhet, desto snabbare växer den';
  if (speedIndex >= 1.5) return 'Just nu går du 1.5x snabbare än genomsnittet för de som lyckas ta sig till nästa nivå (10 år per nivå). Beräkningen tar hänsyn till exponentiell tillväxt - ju mer förmögenhet, desto snabbare växer den';
  if (speedIndex >= 0.5) return 'Just nu går du ungefär i genomsnittlig takt för de som lyckas ta sig till nästa nivå (10 år per nivå). Beräkningen tar hänsyn till exponentiell tillväxt - ju mer förmögenhet, desto snabbare växer den';
  return 'Just nu går du långsammare än genomsnittet för de som lyckas ta sig till nästa nivå (10 år per nivå). Beräkningen tar hänsyn till exponentiell tillväxt - ju mer förmögenhet, desto snabbare växer den';
}

/**
 * Beräknar månatlig avkastning från tillgångar
 * Separerar statlig pension, marknadsbaserad pension och övriga tillgångar
 */
export function calculateAssetsMonthlyReturn(assets: Asset[], liabilities: Liability[] = []): number {
  // Beräkna nettovärden per kategori (samma logik som calculateAutoReturns)
  // 1. Bostadstillgångar (Bostad + Semesterbostad) minus bostadslån
  const housingAssets = assets.filter(a => a.category === 'Bostad' || a.category === 'Semesterbostad');
  const housingLoans = liabilities.filter(l => l.liability_type === 'Bostadslån');
  let housingNetValue = Math.max(0, housingAssets.reduce((sum, a) => sum + a.value, 0) - 
                          housingLoans.reduce((sum, l) => sum + l.principal, 0));
  
  // 2. Bilstillgångar minus billån
  const carAssets = assets.filter(a => a.category === 'Bil');
  const carLoans = liabilities.filter(l => l.liability_type === 'Billån');
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
           cat !== 'Marknadsbaserad pension' && // Backward compatibility
           cat !== 'Trygghetsbaserad pension (Statlig)' &&
           cat !== 'Pensionssparande'; // Backward compatibility
  });
  const otherAssetsTotal = otherAssets.reduce((sum, a) => sum + a.value, 0);
  let otherNetValue = Math.max(0, otherAssetsTotal);
  
  // 4. Övriga skulder (alla som inte är bostadslån eller billån) - fördela över alla positiva korgar
  const otherLiabilities = liabilities.filter(l => 
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
  
  // Beräkna månatlig avkastning baserat på nettovärden
  let totalMonthlyReturn = 0;
  
  // Bostadstillgångar (använd nettovärde om positivt)
  if (housingNetValue > 0 && housingAssets.length > 0) {
    const housingTotalValue = housingAssets.reduce((sum, a) => sum + a.value, 0);
    if (housingTotalValue > 0) {
      const housingMonthlyReturn = housingAssets.reduce((sum, asset) => {
    const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
  }, 0);
      // Proportera avkastningen baserat på nettovärdet
      totalMonthlyReturn += (housingMonthlyReturn / housingTotalValue) * housingNetValue;
    }
}

  // Bilstillgångar (använd nettovärde om positivt)
  if (carNetValue > 0 && carAssets.length > 0) {
    const carTotalValue = carAssets.reduce((sum, a) => sum + a.value, 0);
    if (carTotalValue > 0) {
      const carMonthlyReturn = carAssets.reduce((sum, asset) => {
        const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
      }, 0);
      // Proportera avkastningen baserat på nettovärdet
      totalMonthlyReturn += (carMonthlyReturn / carTotalValue) * carNetValue;
    }
  }
  
  // Övriga tillgångar minus övriga skulder
  if (otherNetValue > 0 && otherAssets.length > 0) {
    const otherMonthlyReturn = otherAssets.reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
    // Proportera avkastningen baserat på nettovärdet
    if (otherAssetsTotal > 0) {
      totalMonthlyReturn += (otherMonthlyReturn / otherAssetsTotal) * otherNetValue;
    }
  }
  
  // Om alla korgar är 0 (allt belånat), använd likvida/finansiella tillgångar
  const totalAvailableNetValue = housingNetValue + carNetValue + otherNetValue;
  if (totalAvailableNetValue <= 0) {
    const liquidAssets = assets.filter(a => {
      const cat = a.category as string;
      return cat === 'Fonder & Aktier' || cat === 'Sparkonto & Kontanter';
    });
    if (liquidAssets.length > 0) {
      totalMonthlyReturn = liquidAssets.reduce((sum, asset) => {
        const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
      }, 0);
    }
  }
  
  // Lägg till pensionstillgångar (de påverkas inte av skulder)
  const pensionAssets = assets.filter(a => {
    const cat = a.category as string;
    return cat === 'Tjänstepension' ||
           cat === 'Premiepension' ||
           cat === 'Privat pensionssparande (IPS)' ||
           cat === 'Marknadsbaserad pension' || // Backward compatibility
           cat === 'Pensionssparande' ||        // Backward compatibility
           cat === 'Trygghetsbaserad pension (Statlig)';
  });
  const pensionMonthlyReturn = pensionAssets.reduce((sum, asset) => {
    const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
    return sum + (asset.value * monthlyRate);
  }, 0);
  
  return totalMonthlyReturn + pensionMonthlyReturn;
}

/**
 * Beräknar månatlig avkastning från statliga pensionstillgångar
 */
export function calculatePublicPensionAssetsMonthlyReturn(assets: Asset[]): number {
  return calculatePublicPensionReturns(assets);
}

/**
 * Beräknar månatlig avkastning från marknadsbaserade pensionstillgångar (viktat snitt)
 */
export function calculateMarketPensionAssetsMonthlyReturn(assets: Asset[]): number {
  return calculateMarketPensionReturns(assets);
}

/**
 * Beräknar månatlig amortering med sammansatt ränta (Math.pow(1 + rate, 1/12) - 1)
 * OBS: Detta är en annan formel än calculateAmortization som använder enkel division (rate / 12)
 * Denna funktion används för hastighetsberäkningar där sammansatt ränta är viktigare
 */
export function calculateAmortizationMonthly(liabilities: Liability[]): number {
  return liabilities.reduce((total, liability) => {
    const monthlyRate = Math.pow(1 + liability.amortization_rate_apy, 1/12) - 1;
    return total + (liability.principal * monthlyRate);
  }, 0);
}

/**
 * Beräknar månatliga pensions- och sparavsättningar från personer
 */
export function calculatePersonsMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    // Inkomstpension (statlig) + premiepension + tjänstepension + övrigt sparande + extra pension + IPS
    const incomePension = calculateIncomePension(person);
    const premiePension = calculatePremiePension(person);
    const occupationalPension = calculateOccupationalPension(person);
    const otherSavings = person.other_savings_monthly || 0;
    const extraPension = calculateExtraPension(person);
    const ips = person.ips_monthly || 0;
    return total + incomePension + premiePension + occupationalPension + otherSavings + extraPension + ips;
  }, 0);
}

/**
 * Beräknar månadsvis statlig pensionsavsättning (inkomstpension)
 */
export function calculatePublicPensionMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    return total + calculateIncomePension(person);
  }, 0);
}

/**
 * Beräknar månadsvis marknadsbaserad pensionsavsättning (premiepension + tjänstepension + IPS)
 * För bakåtkompatibilitet
 */
export function calculateMarketPensionMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    const premiePension = calculatePremiePension(person);
    const occupationalPension = calculateOccupationalPension(person);
    const extraPension = calculateExtraPension(person);
    const ips = person.ips_monthly || 0;
    return total + premiePension + occupationalPension + extraPension + ips;
  }, 0);
}

/**
 * Beräknar månadsvis tjänstepensionsavsättning (tjänstepension + löneväxling)
 */
export function calculateOccupationalPensionMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    const occupationalPension = calculateOccupationalPension(person);
    const extraPension = calculateExtraPension(person); // Löneväxling ingår i tjänstepension
    return total + occupationalPension + extraPension;
  }, 0);
}

/**
 * Beräknar månadsvis premiepensionsavsättning
 */
export function calculatePremiePensionMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    const premiePension = calculatePremiePension(person);
    return total + premiePension;
  }, 0);
}

/**
 * Beräknar månadsvis privat pensionssparande (IPS)
 */
export function calculatePrivatePensionMonthlyAllocations(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((total, person) => {
    const ips = person.ips_monthly || 0;
    return total + ips;
  }, 0);
}

/**
 * Huvudfunktion som beräknar alla förmögenhetsmått
 */
export function calculateWealthMetrics(
  assets: Asset[],
  liabilities: Liability[],
  persons: Person[]
): WealthMetrics {
  const netWorth = calculateNetWorth(assets, liabilities);
  const monthlyIncrease = calculateMonthlyIncrease(assets, liabilities, persons);
  const currentLevel = getCurrentLevel(netWorth);
  const progress = calculateProgress(netWorth, currentLevel);
  
  // Beräkna komponenter för kompoundad hastighetsberäkning
  const assetsMonthlyReturn = calculateAssetsMonthlyReturn(assets, liabilities);
  const amortizationMonthly = calculateAmortizationMonthly(liabilities);
  const personsMonthlyAllocations = calculatePersonsMonthlyAllocations(persons);
  
  const speedIndex = calculateSpeedIndex(
    netWorth, 
    monthlyIncrease, 
    currentLevel,
    assetsMonthlyReturn,
    amortizationMonthly,
    personsMonthlyAllocations,
    assets, // Skicka med assets för att separera pensionstyper
    persons, // Skicka med persons för att separera pensionsavsättningar
    liabilities // Skicka med liabilities för att beräkna nettovärden
  );
  const speedText = getSpeedText(speedIndex);
  const yearsToNextLevel = calculateYearsToNextLevel(
    netWorth, 
    monthlyIncrease, 
    currentLevel,
    assetsMonthlyReturn,
    amortizationMonthly,
    personsMonthlyAllocations,
    assets, // Skicka med assets för att separera pensionstyper
    persons, // Skicka med persons för att separera pensionsavsättningar
    liabilities // Skicka med liabilities för att beräkna nettovärden
  );
  
  return {
    netWorth,
    increasePerMonth: monthlyIncrease,
    currentLevel: currentLevel.level,
    progress,
    speedIndex,
    speedText,
    yearsToNextLevel,
    nextLevelTarget: currentLevel.next
  };
}

/**
 * Beräknar månatlig avkastning från statliga pensionstillgångar
 */
export function calculatePublicPensionReturns(assets: Asset[]): number {
  return assets
    .filter(asset => asset.category === 'Trygghetsbaserad pension (Statlig)')
    .reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
}

/**
 * Beräknar månatlig avkastning från marknadsbaserade pensionstillgångar
 * För bakåtkompatibilitet - räknar samman alla marknadsbaserade pensioner
 */
export function calculateMarketPensionReturns(assets: Asset[]): number {
  return assets
    .filter(asset => {
      const cat = asset.category as string;
      return cat === 'Marknadsbaserad pension' || 
             cat === 'Tjänstepension' || 
             cat === 'Premiepension' || 
             cat === 'Privat pensionssparande (IPS)' ||
             cat === 'Pensionssparande'; // Backward compatibility
    })
    .reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
}

/**
 * Beräknar månatlig avkastning från tjänstepensionstillgångar
 */
export function calculateOccupationalPensionReturns(assets: Asset[]): number {
  return assets
    .filter(asset => {
      const cat = asset.category as string;
      return cat === 'Tjänstepension' || 
             cat === 'Marknadsbaserad pension' || // Backward compatibility
             cat === 'Pensionssparande'; // Backward compatibility
    })
    .reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
}

/**
 * Beräknar månatlig avkastning från premiepensionstillgångar
 */
export function calculatePremiePensionReturns(assets: Asset[]): number {
  return assets
    .filter(asset => asset.category === 'Premiepension')
    .reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
}

/**
 * Beräknar månatlig avkastning från privat pensionssparande (IPS)
 */
export function calculatePrivatePensionReturns(assets: Asset[]): number {
  return assets
    .filter(asset => asset.category === 'Privat pensionssparande (IPS)')
    .reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
}

/**
 * Beräknar månatlig avkastning från icke-pensionstillgångar
 */
export function calculateNonPensionAssetReturns(assets: Asset[], liabilities: Liability[] = []): number {
  // Använd samma logik som calculateAssetsMonthlyReturn men exkludera pension
  // Beräkna nettovärden per kategori
  // 1. Bostadstillgångar (Bostad + Semesterbostad) minus bostadslån
  const housingAssets = assets.filter(a => a.category === 'Bostad' || a.category === 'Semesterbostad');
  const housingLoans = liabilities.filter(l => l.liability_type === 'Bostadslån');
  let housingNetValue = Math.max(0, housingAssets.reduce((sum, a) => sum + a.value, 0) - 
                          housingLoans.reduce((sum, l) => sum + l.principal, 0));
  
  // 2. Bilstillgångar minus billån
  const carAssets = assets.filter(a => a.category === 'Bil');
  const carLoans = liabilities.filter(l => l.liability_type === 'Billån');
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
           cat !== 'Marknadsbaserad pension' && // Backward compatibility
           cat !== 'Trygghetsbaserad pension (Statlig)' &&
           cat !== 'Pensionssparande'; // Backward compatibility
  });
  const otherAssetsTotal = otherAssets.reduce((sum, a) => sum + a.value, 0);
  let otherNetValue = Math.max(0, otherAssetsTotal);
  
  // 4. Övriga skulder (alla som inte är bostadslån eller billån) - fördela över alla positiva korgar
  const otherLiabilities = liabilities.filter(l => 
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
  
  // Beräkna månatlig avkastning baserat på nettovärden
  let totalMonthlyReturn = 0;
  
  // Bostadstillgångar (använd nettovärde om positivt)
  if (housingNetValue > 0 && housingAssets.length > 0) {
    const housingTotalValue = housingAssets.reduce((sum, a) => sum + a.value, 0);
    if (housingTotalValue > 0) {
      const housingMonthlyReturn = housingAssets.reduce((sum, asset) => {
        const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
      }, 0);
      totalMonthlyReturn += (housingMonthlyReturn / housingTotalValue) * housingNetValue;
    }
  }
  
  // Bilstillgångar (använd nettovärde om positivt)
  if (carNetValue > 0 && carAssets.length > 0) {
    const carTotalValue = carAssets.reduce((sum, a) => sum + a.value, 0);
    if (carTotalValue > 0) {
      const carMonthlyReturn = carAssets.reduce((sum, asset) => {
        const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
      }, 0);
      totalMonthlyReturn += (carMonthlyReturn / carTotalValue) * carNetValue;
    }
  }
  
  // Övriga tillgångar minus övriga skulder
  if (otherNetValue > 0 && otherAssets.length > 0) {
    const otherMonthlyReturn = otherAssets.reduce((sum, asset) => {
      const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
      return sum + (asset.value * monthlyRate);
    }, 0);
    if (otherAssetsTotal > 0) {
      totalMonthlyReturn += (otherMonthlyReturn / otherAssetsTotal) * otherNetValue;
    }
  }
  
  // Om alla korgar är 0 (allt belånat), använd likvida/finansiella tillgångar
  const totalAvailableNetValue = housingNetValue + carNetValue + otherNetValue;
  if (totalAvailableNetValue <= 0) {
    const liquidAssets = assets.filter(a => {
      const cat = a.category as string;
      return (cat === 'Fonder & Aktier' || cat === 'Sparkonto & Kontanter');
    });
    if (liquidAssets.length > 0) {
      totalMonthlyReturn = liquidAssets.reduce((sum, asset) => {
        const monthlyRate = Math.pow(1 + asset.expected_apy, 1/12) - 1;
        return sum + (asset.value * monthlyRate);
      }, 0);
    }
  }
  
  return totalMonthlyReturn;
}

/**
 * Beräknar uppdelning av månatlig ökning
 */
export function calculateMonthlyIncreaseBreakdown(
  assets: Asset[],
  liabilities: Liability[],
  persons: Person[]
): MonthlyIncreaseBreakdown {
  if (!persons || !Array.isArray(persons)) {
    return {
      assetReturns: 0,
      amortization: 0,
      pensionContributions: 0,
      otherSavings: 0,
      publicPensionContributions: 0,
      publicPensionReturns: 0,
      marketPensionContributions: 0,
      marketPensionReturns: 0,
      occupationalPensionContributions: 0,
      occupationalPensionReturns: 0,
      premiePensionContributions: 0,
      premiePensionReturns: 0,
      privatePensionContributions: 0,
      privatePensionReturns: 0
    };
  }
  
  // Separera statlig pension (inkomstpension)
  const publicPensionContributions = calculatePublicPensionMonthlyAllocations(persons);
  
  // Separera marknadsbaserade pensionsavsättningar
  const occupationalPensionContributions = calculateOccupationalPensionMonthlyAllocations(persons);
  const premiePensionContributions = calculatePremiePensionMonthlyAllocations(persons);
  const privatePensionContributions = calculatePrivatePensionMonthlyAllocations(persons);
  
  // Totalt marknadsbaserad pension (för bakåtkompatibilitet)
  const marketPensionContributions = occupationalPensionContributions + premiePensionContributions + privatePensionContributions;
  
  // Totalt pensionsbidrag (för bakåtkompatibilitet)
  const pensionContributions = publicPensionContributions + marketPensionContributions;
  
  // Beräkna övrigt sparande separat
  const otherSavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
  
  // Separera avkastningar på pensionstillgångar
  const publicPensionReturns = calculatePublicPensionReturns(assets);
  const occupationalPensionReturns = calculateOccupationalPensionReturns(assets);
  const premiePensionReturns = calculatePremiePensionReturns(assets);
  const privatePensionReturns = calculatePrivatePensionReturns(assets);
  
  // Totalt marknadsbaserad pensionsavkastning (för bakåtkompatibilitet)
  const marketPensionReturns = occupationalPensionReturns + premiePensionReturns + privatePensionReturns;
  
  const nonPensionAssetReturns = calculateNonPensionAssetReturns(assets, liabilities);
  
  // Total asset returns (för bakåtkompatibilitet)
  const assetReturns = nonPensionAssetReturns + publicPensionReturns + marketPensionReturns;
  
  return {
    assetReturns,
    amortization: calculateAmortization(liabilities),
    pensionContributions,
    otherSavings,
    publicPensionContributions,
    publicPensionReturns,
    marketPensionContributions,
    marketPensionReturns,
    occupationalPensionContributions,
    occupationalPensionReturns,
    premiePensionContributions,
    premiePensionReturns,
    privatePensionContributions,
    privatePensionReturns
  };
}

/**
 * Beräknar månadsvis pensionsavsättning för hushållet
 */
export function calculateMonthlyPensionContributions(persons: Person[]): number {
  if (!persons || !Array.isArray(persons)) {
    return 0;
  }
  return persons.reduce((sum, person) => {
    const publicPension = calculatePublicPension(person);
    const occupationalPension = calculateOccupationalPension(person);
    const extraPension = calculateExtraPension(person);
    return sum + publicPension + occupationalPension + extraPension;
  }, 0);
}


/**
 * Beräknar daglig marginal enligt 0,01 %-regeln
 * @param netWorth Nettoförmögenhet i SEK
 * @returns Daglig marginal i SEK
 */
export function calculateDailySplurge(netWorth: number): number {
  return Math.round(netWorth * 0.0001);
}

/**
 * Beräknar månatlig marginal enligt 0,01 %-regeln
 * @param netWorth Nettoförmögenhet i SEK
 * @returns Månatlig marginal i SEK
 */
export function calculateMonthlySplurge(netWorth: number): number {
  return Math.round(netWorth * 0.0001 * 30);
}
