/**
 * Förenklad skatteberäkning för jobb-inkomster
 * Använder schablonvärden för kommunal och statlig skatt
 */

import { getConfig } from './config';

/**
 * Beräknar grundavdrag baserat på årsinkomst (förenklad schablon 2025)
 * Schablon: min 15k, max 30k, fasa ned mellan 200k–700k
 */
function calculateGrundavdrag(annualIncome: number): number {
  if (annualIncome <= 200000) return 30000;
  if (annualIncome >= 700000) return 15000;
  
  const t = (annualIncome - 200000) / 500000; // Progress från 0 till 1
  return Math.round(30000 - t * 15000);
}

/**
 * Beräknar jobbskatteavdrag baserat på årsinkomst (förenklad schablon 2025)
 * Skattereduktion på kommunalskatten
 */
function calculateJobbskatteavdrag(annualIncome: number): number {
  // Förenklad schablon för jobbskatteavdrag 2025
  if (annualIncome < 200000) return 0;
  if (annualIncome >= 500000) return 12000;
  
  // Linjär ökning 200k-500k
  return Math.round(12000 * ((annualIncome - 200000) / 300000));
}

/**
 * Beräknar ungefärlig nettoinkomst för jobb-inkomst
 * 
 * @param monthlyGrossIncome Brutto månadsinkomst
 * @returns Netto månadsinkomst efter skatt
 */
export function calculateJobNetIncome(monthlyGrossIncome: number): number {
  const config = getConfig();
  const annualGrossIncome = monthlyGrossIncome * 12;
  
  // 1. Grundavdrag
  const grundavdrag = calculateGrundavdrag(annualGrossIncome);
  const beskattningsbarInkomst = Math.max(0, annualGrossIncome - grundavdrag);
  
  // 2. Kommunal skatt på beskattningsbar inkomst
  const kommunalSkatt = beskattningsbarInkomst * config.KOMMUNAL_SKATT_RATE;
  
  // 3. Statlig skatt på beskattningsbar inkomst (över skiktgränsen)
  let statligSkatt = 0;
  if (beskattningsbarInkomst > config.STATLIG_SKATT_SKIKTGRANS) {
    statligSkatt = (beskattningsbarInkomst - config.STATLIG_SKATT_SKIKTGRANS) * config.STATLIG_SKATT_RATE;
  }
  
  // 4. Jobbskatteavdrag
  const jobbskatteavdrag = calculateJobbskatteavdrag(annualGrossIncome);
  
  // 5. Public service-avgift (2025: 1% av beskattningsbar inkomst, max 1 249 kr/år)
  const publicServiceAvgift = Math.min(
    config.PUBLIC_SERVICE_MAX,
    Math.floor(beskattningsbarInkomst * config.PUBLIC_SERVICE_RATE)
  );
  
  // Total skatt
  const totalAnnualTax = kommunalSkatt + statligSkatt - jobbskatteavdrag + publicServiceAvgift;
  const netAnnualIncome = annualGrossIncome - totalAnnualTax;
  
  return netAnnualIncome / 12; // Netto per månad
}

/**
 * Beräknar total nettoinkomst för en person
 * 
 * @param person Person med inkomster
 * @returns Total netto månadsinkomst för personen
 */
export function calculatePersonNetIncome(person: { incomes?: Array<{ income_type: 'job' | 'other'; monthly_income: number }> }): number {
  if (!person.incomes || person.incomes.length === 0) {
    return 0;
  }
  
  return person.incomes.reduce((total, income) => {
    if (income.income_type === 'job') {
      // Jobb-inkomst: räkna om efter skatt
      return total + calculateJobNetIncome(income.monthly_income);
    } else {
      // Övrig inkomst: redan efter skatt
      // Konvertera årsinkomst till månadsinkomst
      return total + (income.monthly_income / 12);
    }
  }, 0);
}

/**
 * Beräknar total nettoinkomst för hushållet
 * 
 * @param persons Array av personer
 * @returns Total netto månadsinkomst för hushållet
 */
export function calculateHouseholdNetIncome(persons: Array<{ incomes?: Array<{ income_type: 'job' | 'other'; monthly_income: number }> }>): number {
  return persons.reduce((total, person) => {
    return total + calculatePersonNetIncome(person);
  }, 0);
}

