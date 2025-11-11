/**
 * TypeScript interfaces för Förmögenhetskollen
 * Definierar alla datamodeller som används i applikationen
 */

// Pensionstyper som stöds
export type PensionType = 'ITP1' | 'ITP2' | 'SAF-LO' | 'AKAP-KR' | 'PA16' | 'Annat';

// Kategorier för tillgångar
export type AssetCategory = 
  | 'Bostad' 
  | 'Semesterbostad'
  | 'Bil' 
  | 'Fonder & Aktier' 
  | 'Sparkonto & Kontanter' 
  | 'Trygghetsbaserad pension (Statlig)'
  | 'Tjänstepension'
  | 'Premiepension'
  | 'Privat pensionssparande (IPS)'
  | 'Marknadsbaserad pension' // Backward compatibility - mappas till 'Tjänstepension'
  | 'Tomt & Mark'
  | 'Maskiner & Utrustning'
  | 'Fordon (övrigt)'
  | 'Ädelmetaller & Smycken'
  | 'Annat';

// Inkomst för en person (kan vara pensiongrundande eller ej)
export interface Income {
  id?: string;
  label: string; // T.ex. "Huvudjobb", "Uthyrning av stuga", "Utdelning", "Ränta"
  monthly_income: number;
  income_type: 'job' | 'other'; // Om det är ett jobb (pensiongrundande) eller annan inkomst
  pension_type?: PensionType; // Bara för jobb-inkomster
  custom_tp_rate?: number; // Används bara om pension_type === 'Annat' och tp_input_type === 'percentage'
  custom_tp_amount?: number; // Används bara om pension_type === 'Annat' och tp_input_type === 'amount'
  tp_input_type?: 'percentage' | 'amount'; // Används bara om pension_type === 'Annat'
  salary_exchange_monthly?: number; // Löneväxling till pension för denna inkomst (bara för jobb)
}

// Person i hushållet
export interface Person {
  id?: string;
  name: string;
  birth_year: number;
  incomes: Income[]; // Flera pensiongrundande inkomster
  other_savings_monthly: number;
  ips_monthly?: number; // IPS (Individuellt pensionssparande) månadsavsättning
}

// Tillgång
export interface Asset {
  id?: string;
  category: AssetCategory;
  label: string;
  value: number;
  expected_apy: number; // Förväntad årlig avkastning (0.07 = 7%)
}

// Standardavkastningssatser för olika tillgångskategorier
export function getDefaultReturnRate(category: AssetCategory): number {
  switch (category) {
    case 'Bostad':
      return 0.02; // 2% - historisk bostadsprisutveckling
    case 'Semesterbostad':
      return 0.02; // 2% - liknande bostadsprisutveckling
    case 'Bil':
      return -0.11; // -11% - bilen tappar värde över tid
    case 'Fonder & Aktier':
      return 0.07; // 7% - långsiktig marknadsavkastning
    case 'Sparkonto & Kontanter':
      return 0.03; // 3% - ränta på sparkonto
    case 'Trygghetsbaserad pension (Statlig)':
      return 0.03; // 3% - statlig pension har låg avkastning (baserat på inkomstindexering)
    case 'Tjänstepension':
      return 0.07; // 7% - tjänstepension kan investeras mot börsen
    case 'Premiepension':
      return 0.07; // 7% - premiepension kan investeras mot börsen
    case 'Privat pensionssparande (IPS)':
      return 0.07; // 7% - IPS kan investeras mot börsen
    case 'Marknadsbaserad pension': // Backward compatibility
      return 0.07; // 7% - marknadsbaserad pensionsavkastning (kan investeras mot börsen)
    case 'Tomt & Mark':
      return 0.02; // 2% - konservativ marknadsutveckling
    case 'Maskiner & Utrustning':
      return -0.05; // -5% - utrustning föråldras
    case 'Fordon (övrigt)':
      return -0.08; // -8% - fordon tappar värde
    case 'Ädelmetaller & Smycken':
      return 0.04; // 4% - guld och ädelmetaller
    case 'Annat':
      return 0.00; // 0% - neutral för okända tillgångar
    default:
      return 0.00;
  }
}

// Låntyp/kategori
export type LiabilityType = 'Bostadslån' | 'Billån' | 'Annat';

// Skuld
export interface Liability {
  id?: string;
  label: string;
  principal: number; // Huvudbelopp
  amortization_rate_apy: number; // Amorteringstakt per år (0.02 = 2%)
  liability_type: LiabilityType; // Typ av lån
}

// Hushåll
export interface Household {
  id?: string;
  name: string;
  persons: Person[];
  assets: Asset[];
  liabilities: Liability[];
  created_at?: string;
}

// Användare
export interface User {
  id: string;
  handle: string; // Anonymt användarnamn (t.ex. "TryggaRav-842")
  created_at: string;
}

// Rikedomsnivåer
export interface WealthLevel {
  level: number;
  name: string;
  start: number;
  next: number | null; // null för högsta nivån
  description: string;
  pros: string;
  cons: string;
}

// Beräknade värden för dashboard
export interface WealthMetrics {
  netWorth: number;
  increasePerMonth: number;
  currentLevel: number;
  progress: number; // 0-1
  speedIndex: number;
  speedText: 'Mycket snabb' | 'Snabb' | 'Normal' | 'Långsam';
  yearsToNextLevel: number | null;
  nextLevelTarget: number | null; // Målbelopp för nästa nivå
}

// Komponenter av månatlig ökning
export interface MonthlyIncreaseBreakdown {
  assetReturns: number;
  amortization: number;
  pensionContributions: number; // Totalt pensionsbidrag (för bakåtkompatibilitet)
  otherSavings: number;
  publicPensionContributions: number; // Statlig pension (inkomstpension)
  publicPensionReturns: number; // Avkastning på statlig pension
  marketPensionContributions: number; // Marknadsbaserad pension (premiepension + tjänstepension + IPS) - för bakåtkompatibilitet
  marketPensionReturns: number; // Avkastning på marknadsbaserad pension - för bakåtkompatibilitet
  // Nya separata pensionskategorier
  occupationalPensionContributions: number; // Tjänstepension
  occupationalPensionReturns: number; // Avkastning på tjänstepension
  premiePensionContributions: number; // Premiepension
  premiePensionReturns: number; // Avkastning på premiepension
  privatePensionContributions: number; // Privat pensionssparande (IPS)
  privatePensionReturns: number; // Avkastning på IPS
}

// Konfiguration för beräkningar
export interface WealthConfig {
  IBB_ANNUAL: number;
  PUBLIC_PENSION_RATE: number;
  PREMIEPENSION_RATE: number; // 2.5% av PGI (del av allmän pension)
  PENSIONABLE_INCOME_RATE: number; // 0.93 (93% av inkomst)
  IBB_PENSION_CAP_MULTIPLIER: number; // 8.07 (max pensionsgrundande inkomst)
  ITP1_LOWER_RATE: number;
  ITP1_HIGHER_RATE: number;
  ITP1_CAP_MULTIPLIER: number;
  KOMMUNAL_SKATT_RATE: number;
  STATLIG_SKATT_RATE: number;
  STATLIG_SKATT_SKIKTGRANS: number;
  PUBLIC_SERVICE_MAX: number;
  PUBLIC_SERVICE_RATE: number;
  PBB_ANNUAL: number;
}

// Formulärdata för onboarding
export interface OnboardingData {
  persons: Person[];
  assets: Asset[];
  liabilities: Liability[];
}

// Auth data
export interface AuthData {
  user: User | null;
  household: Household | null;
  isLoading: boolean;
}

// Local storage keys
export const STORAGE_KEYS = {
  DRAFT_HOUSEHOLD: 'formogenhetskompassen_draft_household',
  USER_SESSION: 'formogenhetskompassen_user_session'
} as const;
