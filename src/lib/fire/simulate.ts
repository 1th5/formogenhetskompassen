/**
 * Simulerar portföljutveckling år-för-år för FIRE-visualisering
 */

import { toReal } from './calc';
import { toNominal, calculateWeightedReturnOnMerge } from './utils';

export interface YearData {
  year: number;
  age: number;
  available: number;
  pension: number; // Totalt marknadsbaserad pension (för bakåtkompatibilitet)
  total: number;
  netWithdrawal?: number;
  savingsContrib?: number; // Sparande som fylls på
  pensionContrib?: number; // Totalt marknadsbaserad pensionsavsättning (för bakåtkompatibilitet)
  availableReturn?: number; // Avkastning på tillgängligt
  pensionReturn?: number; // Totalt avkastning på marknadsbaserad pension (för bakåtkompatibilitet)
  statePensionCapital?: number; // Statlig pensionskapital (fram till pensionsstart)
  statePensionIncome?: number; // Årlig utbetalning från statlig pension (efter pensionsstart)
  statePensionContrib?: number; // Statlig pensionsavsättning (inkomstpension)
  statePensionReturn?: number; // Avkastning på statlig pension
  // Nya separata pensionsfält
  occPension?: number; // Tjänstepension
  premiePension?: number; // Premiepension
  privatePension?: number; // IPS
  occPensionContrib?: number; // Tjänstepensionsavsättning
  premiePensionContrib?: number; // Premiepensionsavsättning
  privatePensionContrib?: number; // IPS-avsättning
  occPensionReturn?: number; // Avkastning på tjänstepension
  premiePensionReturn?: number; // Avkastning på premiepension
  privatePensionReturn?: number; // Avkastning på IPS
}

export interface FIRESimulation {
  data: YearData[];
  fireYear: number | null;
  pensionStartYear: number;
  requiredAtPension: number;
  capitalDepletedYear: number | null; // Ålder när kapitalet når 0
}

export function simulatePortfolio(
  availableAtStart: number,
  pensionLockedAtStart: number, // Totalt marknadsbaserad pension (för bakåtkompatibilitet)
  monthlySavings: number,
  realReturnAvailable: number, // Real avkastning för tillgängliga tillgångar (pre-FIRE)
  realReturnPension: number, // Real avkastning för marknadsbaserad pension (för bakåtkompatibilitet)
  annualExpenses: number,
  averageAge: number,
  pensionStartAge: number,
  requiredAtPension: number, // Används inte i simuleringen, bara med för signaturen
  fireYear: number | null,
  monthlyPensionAfterTax: number = 0,
  // OBS: pensionContribMonthly ignoreras om de tre separata pensionsavsättningarna (occPensionContribMonthly, 
  // premiePensionContribMonthly, privatePensionContribMonthly) används. Lämnad för bakåtkompatibilitet.
  pensionContribMonthly: number = 0,
  inflation: number,
  useCoastFire: boolean = false,
  coastFireYears: number = 0,
  // `coastFirePensionContribMonthly` förväntas redan vara nedräknad i UI
  // utifrån "full inkomst = utgifter + spar" → "coast = bara utgifter".
  coastFirePensionContribMonthly: number = 0,
  statePensionAtStart: number = 0, // Statlig pensionskapital vid start
  realReturnStatePension: number = 0.01, // Real avkastning för statlig pension (default ~3% nominellt - 2% inflation)
  statePensionContribMonthly: number = 0, // Statlig pensionsavsättning (inkomstpension)
  statePensionPayoutYears: number = 20, // Antal år statlig pension betalas ut
  statePensionAnnualIncome: number = 0, // Årlig utbetalning från statlig pension (efter pensionsstart)
  // Nya parametrar för separata pensionskategorier
  occPensionAtStart: number = 0, // Tjänstepension vid start
  premiePensionAtStart: number = 0, // Premiepension vid start
  privatePensionAtStart: number = 0, // IPS vid start
  realReturnOccPension?: number, // Real avkastning för tjänstepension
  realReturnPremiePension?: number, // Real avkastning för premiepension
  realReturnPrivatePension?: number, // Real avkastning för IPS
  occPensionContribMonthly?: number, // Månatlig tjänstepensionsavsättning (normal)
  premiePensionContribMonthly?: number, // Månatlig premiepensionsavsättning (normal)
  privatePensionContribMonthly?: number, // Månatlig IPS-avsättning (normal)
  // Separata Coast FIRE-pensionsavsättningar (används bara under Coast FIRE-perioden)
  coastFireOccPensionContribMonthly?: number, // Månatlig tjänstepensionsavsättning under Coast FIRE
  coastFirePremiePensionContribMonthly?: number, // Månatlig premiepensionsavsättning under Coast FIRE
  coastFirePrivatePensionContribMonthly?: number, // Månatlig IPS-avsättning under Coast FIRE
  occPensionEarlyStartAge: number = 55, // Tidig uttagsålder för tjänstepension (default 55 för bakåtkompatibilitet)
  ipsEarlyStartAge: number = 55 // Tidig uttagsålder för IPS (default 55 för bakåtkompatibilitet)
): FIRESimulation {
  // Clamp avkastningar för stabilitet (förhindra negativa värden som kraschar simuleringen)
  const safeRealAvailable = Math.max(realReturnAvailable, -0.5); // minst -50%
  const safeRealPension = Math.max(realReturnPension, -0.5); // minst -50%
  const safeRealStatePension = Math.max(realReturnStatePension, -0.5); // minst -50%
  
  // Separata pensionsavkastningar (använd realReturnPension som fallback om inte angivna)
  const safeRealOccPension = realReturnOccPension !== undefined 
    ? Math.max(realReturnOccPension, -0.5) 
    : safeRealPension;
  const safeRealPremiePension = realReturnPremiePension !== undefined
    ? Math.max(realReturnPremiePension, -0.5)
    : safeRealPension;
  const safeRealPrivatePension = realReturnPrivatePension !== undefined
    ? Math.max(realReturnPrivatePension, -0.5)
    : safeRealPension;
  
  // Separata pensionsavsättningar - UI skickar in respektive månadsavsättning (normal)
  // Om det inte finns så är det bara 0 (ingen gissning om fördelning)
  const normalOccContrib = occPensionContribMonthly ?? 0;
  const normalPremieContrib = premiePensionContribMonthly ?? 0;
  const normalPrivateContrib = privatePensionContribMonthly ?? 0;
  
  // Coast FIRE-pensionsavsättningar (används bara under Coast FIRE-perioden)
  const coastOccContrib = coastFireOccPensionContribMonthly ?? normalOccContrib;
  const coastPremieContrib = coastFirePremiePensionContribMonthly ?? normalPremieContrib;
  const coastPrivateContrib = coastFirePrivatePensionContribMonthly ?? normalPrivateContrib;
  
  // UI skickar redan in tre separata startvärden (occ, premie, IPS)
  // Vi behöver inte bakåtkompatibel auto-split
  const effectiveOccPensionAtStart = occPensionAtStart;
  const effectivePremiePensionAtStart = premiePensionAtStart;
  const effectivePrivatePensionAtStart = privatePensionAtStart;
  const data: YearData[] = [];
  const currentYear = new Date().getFullYear();
  const pensionStartYear = currentYear + (pensionStartAge - averageAge);
  
  // Dynamisk avkastning efter FIRE: minst 7% nominell, annars behåll ursprunglig
  // Men bara OM FIRE faktiskt uppnåtts (fireYear !== null)
  const POST_FIRE_NOMINAL_RETURN = 0.07;
  const realPostFireReturnAvailable = fireYear !== null
    ? Math.max(toReal(POST_FIRE_NOMINAL_RETURN, inflation), safeRealAvailable)
    : safeRealAvailable;
  
  // DEBUG: Logga avkastningsvärden (avrunda för att undvika floating point precision-problem)
  // Kommenterad ut för produktion - använd process.env.NODE_ENV !== 'production' om du vill behålla det
  // console.log('DEBUG simulatePortfolio:', {
  //   realReturnAvailable: Math.round(realReturnAvailable * 10000) / 100,
  //   realPostFireReturnAvailable: Math.round(realPostFireReturnAvailable * 10000) / 100,
  //   inflation: Math.round(inflation * 10000) / 100,
  //   POST_FIRE_NOMINAL_RETURN: Math.round(POST_FIRE_NOMINAL_RETURN * 10000) / 100,
  //   usingHigher: realPostFireReturnAvailable > toReal(POST_FIRE_NOMINAL_RETURN, inflation),
  //   statePensionAtStart,
  //   realReturnStatePension: Math.round(realReturnStatePension * 10000) / 100
  // });
  
  // Simulera portföljen
  let available = availableAtStart;
  let occPension = effectiveOccPensionAtStart;
  let premiePension = effectivePremiePensionAtStart;
  let privatePension = effectivePrivatePensionAtStart;
  let statePensionCapital = statePensionAtStart;
  
  // För bakåtkompatibilitet: behåll pension som totalt marknadsbaserad
  let pension = pensionLockedAtStart;
  const yearsToPension = Math.max(0, pensionStartAge - averageAge);
  
  // Håll koll på viktad avkastning efter sammanslagning
  // null = inget sammanslaget än, använd individuella avkastningar
  let mergedRealReturn: number | null = null;
  
  // Håll koll på om pensionsdelar redan har blivit uttagsbara
  let occPensionUnlocked = false;
  let premiePensionUnlocked = false;
  let privatePensionUnlocked = false;
  
  // Effektiva värden för sparande och pensionsavsättningar (kan ändras när mergning sker)
  let effectiveMonthlySavings = monthlySavings;
  let effectiveOccContrib = normalOccContrib;
  let effectivePremieContrib = normalPremieContrib;
  let effectivePrivateContrib = normalPrivateContrib;
  
  // Beräkna statlig pensionsutbetalning om den inte redan är angiven
  // (om den är 0, betyder det att vi inte har någon statlig pension eller att den inte har växt tillräckligt)
  let effectiveStatePensionAnnualIncome = statePensionAnnualIncome;
  let remainingStatePensionYears: number | null = null; // Räknare för kvarvarande utbetalningsår
  if (effectiveStatePensionAnnualIncome === 0 && statePensionAtStart > 0) {
    // Beräkna växt fram till pension
    let statePensionAtPension = statePensionAtStart;
    for (let year = 0; year < yearsToPension; year++) {
      statePensionAtPension = statePensionAtPension * (1 + safeRealStatePension) + (statePensionContribMonthly * 12);
    }
    effectiveStatePensionAnnualIncome = statePensionAtPension / statePensionPayoutYears;
  }
  // Om statePensionAnnualIncome redan är angiven (från calculateFIRE), starta räknaren vid pensionsstart
  // (Detta hanteras i loopen vid year === yearsToPension, men vi säkerställer att vi har rätt värde här också)
  
  // Simulera från år 0 fram till 25 år efter pension
  const maxYear = yearsToPension + 25;
  
  for (let year = 0; year <= maxYear; year++) {
    const age = averageAge + year;
    let netWithdrawal = 0;
    let savingsContrib = 0;
    let pensionContrib = 0;
    let availableReturn = 0;
    let pensionReturn = 0;
    let statePensionReturn = 0;
    let statePensionContrib = 0;
    let statePensionIncomeValue = 0;
    
    // Separata pensionsvariabler
    let occPensionReturn = 0;
    let premiePensionReturn = 0;
    let privatePensionReturn = 0;
    let occPensionContrib = 0;
    let premiePensionContrib = 0;
    let privatePensionContrib = 0;
    
    // Helper för att beräkna total marknadsbaserad pension (för bakåtkompatibilitet)
    const totalMarketPension = () => occPension + premiePension + privatePension;
    
    if (year === 0) {
      // Startvärden
      pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
      data.push({
        year,
        age,
        available,
        pension,
        total: available + pension + statePensionCapital,
        statePensionCapital: statePensionCapital > 0 ? statePensionCapital : undefined,
        occPension: occPension > 0 ? occPension : undefined,
        premiePension: premiePension > 0 ? premiePension : undefined,
        privatePension: privatePension > 0 ? privatePension : undefined
      });
      continue;
    }
    
    // Beräkna lägen för detta år
    const reachedFire = fireYear !== null && year > fireYear;
    const isFireYear = fireYear !== null && year === fireYear;
    const isAtOrAfterPension = year >= yearsToPension;
    
    // Kontrollera om pensionsdelar just blir uttagsbara
    const occPensionJustUnlocked = age >= occPensionEarlyStartAge && occPension > 0 && !occPensionUnlocked;
    const privatePensionJustUnlocked = age >= ipsEarlyStartAge && privatePension > 0 && !privatePensionUnlocked;
    
    if (age >= occPensionEarlyStartAge && occPension > 0) {
      // Beräkna viktad avkastning när tjänstepension slås ihop
      // VIKTIGT: Vikta bara de delar som faktiskt mergas (available + occPension)
      // Premiepension och IPS ska INTE vara med eftersom de fortfarande är låsta
      if (occPensionJustUnlocked) {
        // Konvertera real avkastningar till nominella för beräkning
        const currentAvailableReturn = mergedRealReturn !== null
          ? toNominal(mergedRealReturn, inflation)
          : toNominal(
              reachedFire || isFireYear ? realPostFireReturnAvailable : safeRealAvailable,
              inflation
            );
        const nomOccReturn = toNominal(safeRealOccPension, inflation);
        
        mergedRealReturn = calculateWeightedReturnOnMerge(
          available,
          currentAvailableReturn,
          occPension,      // Just unlocked - ska mergas
          nomOccReturn,
          0,               // premiePension - INTE med än, fortfarande låst
          0,
          0,               // privatePension - INTE med än, fortfarande låst
          0,
          inflation,
          POST_FIRE_NOMINAL_RETURN,
          true,            // bumpOccPension
          false,           // bumpPremiePension
          false            // bumpPrivatePension
        );
      }
      
      available += occPension;
      occPension = 0;
      occPensionUnlocked = true;
      
      // Om vi fortfarande är i fasen före FIRE/pension där vi annars hade fortsatt betala in pension,
      // då ska vi flytta månatlig tjänstepensionsavsättning till vanligt spar
      if (!isAtOrAfterPension && !reachedFire && !isFireYear) {
        // Öka månadssparandet med det som tidigare gick till tjänstepension
        effectiveMonthlySavings += effectiveOccContrib;
        // Stoppa framtida tjänstepensionsinbetalningar
        effectiveOccContrib = 0;
      }
    }
    
    if (age >= ipsEarlyStartAge && privatePension > 0) {
      // Beräkna viktad avkastning när IPS slås ihop
      // VIKTIGT: Vikta bara de delar som faktiskt mergas (available + privatePension)
      // Om occPension redan är upplåst är den redan i available, så den är med automatiskt
      // Premiepension ska INTE vara med eftersom den fortfarande är låst
      if (privatePensionJustUnlocked) {
        // Konvertera real avkastningar till nominella för beräkning
        const currentAvailableReturn = mergedRealReturn !== null
          ? toNominal(mergedRealReturn, inflation)
          : toNominal(
              reachedFire || isFireYear ? realPostFireReturnAvailable : safeRealAvailable,
              inflation
            );
        const nomPrivateReturn = toNominal(safeRealPrivatePension, inflation);
        
        mergedRealReturn = calculateWeightedReturnOnMerge(
          available,
          currentAvailableReturn,
          0,               // occPension - redan i available om upplåst, annars 0
          0,
          0,               // premiePension - INTE med än, fortfarande låst
          0,
          privatePension,  // Just unlocked - ska mergas
          nomPrivateReturn,
          inflation,
          POST_FIRE_NOMINAL_RETURN,
          false,           // bumpOccPension (redan upplåst om den fanns)
          false,           // bumpPremiePension
          true             // bumpPrivatePension
        );
      }
      
      available += privatePension;
      privatePension = 0;
      privatePensionUnlocked = true;
      
      // Om vi fortfarande är i fasen före FIRE/pension där vi annars hade fortsatt betala in pension,
      // då ska vi flytta månatlig IPS-avsättning till vanligt spar
      if (!isAtOrAfterPension && !reachedFire && !isFireYear) {
        // Öka månadssparandet med det som tidigare gick till IPS
        effectiveMonthlySavings += effectivePrivateContrib;
        // Stoppa framtida IPS-inbetalningar
        effectivePrivateContrib = 0;
      }
    }
    
    // Uppdatera totalt marknadsbaserad pension för bakåtkompatibilitet
    pension = occPension + premiePension + privatePension;
    
    if (isAtOrAfterPension) {
      // Efter pension: sammanfoga hinkarna
      if (year === yearsToPension) {
        // Sammanfoga med normal övergång: helt års avkastning innan sammanslagning
        const effectiveAvailableReturn = mergedRealReturn !== null 
          ? mergedRealReturn 
          : (reachedFire || isFireYear ? realPostFireReturnAvailable : safeRealAvailable);
        const growAvail  = available * effectiveAvailableReturn;
        // Varje pensionshink växer med sin egen avkastning
        const growOccPension = occPension * safeRealOccPension;
        const growPremiePension = premiePension * safeRealPremiePension;
        const growPrivatePension = privatePension * safeRealPrivatePension;
        const growPension = growOccPension + growPremiePension + growPrivatePension;
        // Statlig pension växer också sista året
        const growStatePension = statePensionCapital * safeRealStatePension;
        statePensionCapital = statePensionCapital + growStatePension + (statePensionContribMonthly * 12);
        // Konvertera statlig pension till årlig utbetalning
        effectiveStatePensionAnnualIncome = statePensionCapital / statePensionPayoutYears;
        remainingStatePensionYears = statePensionPayoutYears; // Starta räknaren
        statePensionCapital = 0; // Från och med nu är det utbetalning, inte kapital
        
        // Beräkna viktad avkastning när allt slås ihop vid pensionsstart
        // Om det finns pensionsdelar kvar som ska mergas (t.ex. premiepension som alltid mergas vid pensionsstart)
        // så gör vi alltid en omräkning, även om mergedRealReturn redan är satt
        if (occPension > 0 || premiePension > 0 || privatePension > 0) {
          // Konvertera real avkastningar till nominella för beräkning
          // Om mergedRealReturn redan är satt (t.ex. från tidigare unlock av tjänstepension/IPS), använd den
          // Annars använd effectiveAvailableReturn
          const currentAvailableReturn = mergedRealReturn !== null
            ? toNominal(mergedRealReturn, inflation)
            : toNominal(effectiveAvailableReturn, inflation);
          const nomOccReturn = toNominal(safeRealOccPension, inflation);
          const nomPremieReturn = toNominal(safeRealPremiePension, inflation);
          const nomPrivateReturn = toNominal(safeRealPrivatePension, inflation);
          
          mergedRealReturn = calculateWeightedReturnOnMerge(
            available + growAvail,
            currentAvailableReturn,
            occPension + growOccPension,
            nomOccReturn,
            premiePension + growPremiePension,
            nomPremieReturn,
            privatePension + growPrivatePension,
            nomPrivateReturn,
            inflation,
            POST_FIRE_NOMINAL_RETURN,
            !occPensionUnlocked && (occPension + growOccPension) > 0, // bumpOccPension om inte redan upplåst
            !premiePensionUnlocked && (premiePension + growPremiePension) > 0, // bumpPremiePension om inte redan upplåst
            !privatePensionUnlocked && (privatePension + growPrivatePension) > 0 // bumpPrivatePension om inte redan upplåst
          );
        }
        
        available = available + growAvail + (occPension + growOccPension) + (premiePension + growPremiePension) + (privatePension + growPrivatePension);
        occPension = 0;
        premiePension = 0;
        privatePension = 0;
        pension = 0;
        premiePensionUnlocked = true; // Premiepension blir alltid upplåst vid pensionsstart
      }
      
      // Efter sammanfogning: hantera retirement pool med viktad avkastning
      const annualPension = monthlyPensionAfterTax * 12;
      
      // Beräkna statlig pensionsinkomst baserat på kvarvarande år
      // ✅ använd befintlig variabel, skapa inte en ny med let
      if (remainingStatePensionYears !== null && remainingStatePensionYears > 0) {
        statePensionIncomeValue = effectiveStatePensionAnnualIncome;
        remainingStatePensionYears -= 1;
      } else {
        statePensionIncomeValue = 0;
      }
      
      // Inkludera statlig pension i total pensionsinkomst
      const totalPensionIncome = annualPension + statePensionIncomeValue;
      const netAnnualWithdrawal = Math.max(0, annualExpenses - totalPensionIncome);
      
      // Använd viktad avkastning om kapitalet är sammanslaget, annars använd standard post-FIRE avkastning
      const effectiveReturn = mergedRealReturn !== null 
        ? mergedRealReturn 
        : realPostFireReturnAvailable;
      availableReturn = available * effectiveReturn;
      available = available + availableReturn - netAnnualWithdrawal;
      netWithdrawal = netAnnualWithdrawal;
      
      // Clamp till 0 för visuell representation
      available = Math.max(1e-6, available);
    } else if (isFireYear) {
      // FIRE-året: sista året med sparande, ingen uttag än
      // Använd viktad avkastning om kapitalet redan är sammanslaget
      const effectiveAvailableReturn = mergedRealReturn !== null 
        ? mergedRealReturn 
        : safeRealAvailable;
      availableReturn = available * effectiveAvailableReturn;
      occPensionReturn = occPension * safeRealOccPension;
      premiePensionReturn = premiePension * safeRealPremiePension;
      privatePensionReturn = privatePension * safeRealPrivatePension;
      pensionReturn = occPensionReturn + premiePensionReturn + privatePensionReturn; // För bakåtkompatibilitet
      statePensionReturn = statePensionCapital * safeRealStatePension;
      savingsContrib = effectiveMonthlySavings * 12;
      // FIRE-året: använd effektiva pensionsavsättningar (kan vara nollställda om mergning skett tidigare)
      occPensionContrib = effectiveOccContrib * 12;
      premiePensionContrib = effectivePremieContrib * 12;
      privatePensionContrib = effectivePrivateContrib * 12;
      pensionContrib = occPensionContrib + premiePensionContrib + privatePensionContrib; // För bakåtkompatibilitet
      statePensionContrib = statePensionContribMonthly * 12;
      
      available = available + availableReturn + savingsContrib;
      occPension = occPension + occPensionReturn + occPensionContrib;
      premiePension = premiePension + premiePensionReturn + premiePensionContrib;
      privatePension = privatePension + privatePensionReturn + privatePensionContrib;
      pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
      statePensionCapital = statePensionCapital + statePensionReturn + statePensionContrib;
      
    } else if (reachedFire) {
      // Mellan FIRE och pension
      const prevAvailable = available;
      const prevOccPension = occPension;
      const prevPremiePension = premiePension;
      const prevPrivatePension = privatePension;

      // Kontrollera om vi är i Coast FIRE-perioden
      const isInCoastFire = useCoastFire && fireYear !== null && coastFireYears > 0 && 
        (year > fireYear && year <= fireYear + coastFireYears);

      const isFirstBridgeYear = fireYear !== null && year === fireYear + 1;

      // Använd viktad avkastning om kapitalet redan är sammanslaget
      const effectiveAvailableReturn = mergedRealReturn !== null 
        ? mergedRealReturn 
        : realPostFireReturnAvailable;

      if (isInCoastFire) {
        // 🔸 Coast FIRE-period: ingen uttag, inget sparande, reducerad pensionsavsättning
        availableReturn = prevAvailable * effectiveAvailableReturn;
        occPensionReturn = occPension * safeRealOccPension;
        premiePensionReturn = premiePension * safeRealPremiePension;
        privatePensionReturn = privatePension * safeRealPrivatePension;
        pensionReturn = occPensionReturn + premiePensionReturn + privatePensionReturn; // För bakåtkompatibilitet
        statePensionReturn = statePensionCapital * safeRealStatePension;
        
        // Ingen uttag, inget sparande
        available = prevAvailable + availableReturn;
        occPension = occPension + occPensionReturn;
        premiePension = premiePension + premiePensionReturn;
        privatePension = privatePension + privatePensionReturn;
        pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
        statePensionCapital = statePensionCapital + statePensionReturn;
        
        // Reducerad pensionsavsättning (endast om inte vid pensionsålder)
        if (!isAtOrAfterPension) {
          // Coast FIRE: använd reducerade pensionsavsättningar (men respektera om de redan är nollställda)
          occPensionContrib = effectiveOccContrib > 0 ? coastOccContrib * 12 : 0;
          premiePensionContrib = effectivePremieContrib > 0 ? coastPremieContrib * 12 : 0;
          privatePensionContrib = effectivePrivateContrib > 0 ? coastPrivateContrib * 12 : 0;
          pensionContrib = occPensionContrib + premiePensionContrib + privatePensionContrib; // För bakåtkompatibilitet
          occPension = occPension + occPensionContrib;
          premiePension = premiePension + premiePensionContrib;
          privatePension = privatePension + privatePensionContrib;
          pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
          // Statlig pensionsavsättning fortsätter (inkomstpension är obligatorisk)
          statePensionContrib = statePensionContribMonthly * 12;
          statePensionCapital = statePensionCapital + statePensionContrib;
        }
        
        netWithdrawal = 0; // Ingen uttag
        savingsContrib = 0; // Inget sparande
      } else if (isFirstBridgeYear) {
        // 🔸 Första bridge-året: normal övergång med helt års avkastning och uttag
        availableReturn = prevAvailable * effectiveAvailableReturn;
        occPensionReturn = occPension * safeRealOccPension;
        premiePensionReturn = premiePension * safeRealPremiePension;
        privatePensionReturn = privatePension * safeRealPrivatePension;
        pensionReturn = occPensionReturn + premiePensionReturn + privatePensionReturn; // För bakåtkompatibilitet
        statePensionReturn = statePensionCapital * safeRealStatePension;

        available = prevAvailable + availableReturn - annualExpenses;
        occPension = occPension + occPensionReturn; // Ingen marknadsbaserad pensionsinbetalning efter FIRE
        premiePension = premiePension + premiePensionReturn;
        privatePension = privatePension + privatePensionReturn;
        pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
        statePensionCapital = statePensionCapital + statePensionReturn; // Statlig pensionsavsättning fortsätter (obligatorisk)

        netWithdrawal = annualExpenses;
      } else {
        // 🔸 Vanligt bridge-år: helt år
        availableReturn = prevAvailable * effectiveAvailableReturn;
        occPensionReturn = occPension * safeRealOccPension;
        premiePensionReturn = premiePension * safeRealPremiePension;
        privatePensionReturn = privatePension * safeRealPrivatePension;
        pensionReturn = occPensionReturn + premiePensionReturn + privatePensionReturn; // För bakåtkompatibilitet
        statePensionReturn = statePensionCapital * safeRealStatePension;

        available = prevAvailable + availableReturn - annualExpenses;
        occPension = occPension + occPensionReturn;
        premiePension = premiePension + premiePensionReturn;
        privatePension = privatePension + privatePensionReturn;
        pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
        statePensionCapital = statePensionCapital + statePensionReturn; // Statlig pensionsavsättning fortsätter (obligatorisk)

        netWithdrawal = annualExpenses;
      }

      // Clamp för visuell stabilitet (använd epsilon för att undvika blinkande "Kapital förbrukat"-etikett)
      available = Math.max(1e-6, available);
      occPension = Math.max(0, occPension);
      premiePension = Math.max(0, premiePension);
      privatePension = Math.max(0, privatePension);
      pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
      statePensionCapital = Math.max(0, statePensionCapital);
    } else {
      // Före FIRE: tillgänglig växer med sparande + avkastning, pension växer med inbetalningar + avkastning
      const prevAvailable = available;
      const prevOccPension = occPension;
      const prevPremiePension = premiePension;
      const prevPrivatePension = privatePension;
      const prevStatePension = statePensionCapital;
      
      // Använd viktad avkastning om kapitalet redan är sammanslaget (t.ex. tidiga uttag)
      const effectiveAvailableReturn = mergedRealReturn !== null 
        ? mergedRealReturn 
        : safeRealAvailable;
      availableReturn = prevAvailable * effectiveAvailableReturn;
      occPensionReturn = prevOccPension * safeRealOccPension;
      premiePensionReturn = prevPremiePension * safeRealPremiePension;
      privatePensionReturn = prevPrivatePension * safeRealPrivatePension;
      pensionReturn = occPensionReturn + premiePensionReturn + privatePensionReturn; // För bakåtkompatibilitet
      statePensionReturn = prevStatePension * safeRealStatePension;
      
      savingsContrib = effectiveMonthlySavings * 12;
      // Före FIRE: använd effektiva pensionsavsättningar (kan vara nollställda om mergning skett tidigare)
      occPensionContrib = effectiveOccContrib * 12;
      premiePensionContrib = effectivePremieContrib * 12;
      privatePensionContrib = effectivePrivateContrib * 12;
      pensionContrib = occPensionContrib + premiePensionContrib + privatePensionContrib; // För bakåtkompatibilitet
      statePensionContrib = statePensionContribMonthly * 12;
      
      available = prevAvailable + availableReturn + savingsContrib;
      occPension = prevOccPension + occPensionReturn + occPensionContrib;
      premiePension = prevPremiePension + premiePensionReturn + premiePensionContrib;
      privatePension = prevPrivatePension + privatePensionReturn + privatePensionContrib;
      pension = totalMarketPension(); // Uppdatera för bakåtkompatibilitet
      statePensionCapital = prevStatePension + statePensionReturn + statePensionContrib;
    }
    
    // Uppdatera totalt marknadsbaserad pension för bakåtkompatibilitet
    pension = occPension + premiePension + privatePension;
    
    // Spara datapunkt med clamped värden för visuell representation
    data.push({
      year,
      age,
      available: Math.max(1e-6, available),
      pension: Math.max(1e-6, pension),
      total: Math.max(1e-6, available + pension + (statePensionCapital > 0 ? statePensionCapital : 0) + (statePensionIncomeValue > 0 ? statePensionIncomeValue : 0)),
      netWithdrawal,
      savingsContrib,
      pensionContrib,
      availableReturn,
      pensionReturn,
      statePensionCapital: statePensionCapital > 0 ? statePensionCapital : undefined,
      statePensionIncome: statePensionIncomeValue > 0 ? statePensionIncomeValue : undefined,
      statePensionContrib: statePensionContrib > 0 ? statePensionContrib : undefined,
      statePensionReturn: statePensionReturn !== 0 ? statePensionReturn : undefined,
      // Separata pensionsfält
      occPension: occPension > 0 ? occPension : undefined,
      premiePension: premiePension > 0 ? premiePension : undefined,
      privatePension: privatePension > 0 ? privatePension : undefined,
      occPensionContrib: occPensionContrib > 0 ? occPensionContrib : undefined,
      premiePensionContrib: premiePensionContrib > 0 ? premiePensionContrib : undefined,
      privatePensionContrib: privatePensionContrib > 0 ? privatePensionContrib : undefined,
      occPensionReturn: occPensionReturn !== 0 ? occPensionReturn : undefined,
      premiePensionReturn: premiePensionReturn !== 0 ? premiePensionReturn : undefined,
      privatePensionReturn: privatePensionReturn !== 0 ? privatePensionReturn : undefined
    });
  }
  
  // Hitta när kapitalet når 0 (för etikett)
  const capitalDepletedYear = data.find(d => d.available <= 1e-6 && d.age > averageAge)?.age || null;
  
  return {
    data,
    fireYear,
    pensionStartYear,
    requiredAtPension,
    capitalDepletedYear
  };
}
