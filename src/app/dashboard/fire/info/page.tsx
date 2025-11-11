'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import { calculateAutoReturns, toReal } from '@/lib/fire/calc';
import { calculatePersonNetIncome } from '@/lib/wealth/tax-calc';
import { 
  calculateMonthlyPensionContributions, 
  calculateAmortizationMonthly,
  calculateOccupationalPensionMonthlyAllocations,
  calculatePremiePensionMonthlyAllocations,
  calculatePrivatePensionMonthlyAllocations,
  calculatePublicPensionMonthlyAllocations
} from '@/lib/wealth/calc';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { ArrowLeft } from 'lucide-react';

export default function FIREInfoPage() {
  const router = useRouter();
  const { draftHousehold } = useHouseholdStore();
  
  // Beräkna värden från hushåll (samma som på fire-sidan)
  const { 
    assets, 
    persons, 
    liabilities, 
    averageAge,
    monthlySavings,
    amortizationMonthly,
    pensionContribMonthly,
    occPensionContribMonthly,
    premiePensionContribMonthly,
    privatePensionContribMonthly,
    publicPensionContribMonthly,
    monthlyExpenses,
    realReturns,
    sliderPensionAge,
    sliderMonthlySavings,
    requiredAtPensionLive,
    dSliderInflation
  } = useMemo(() => {
    if (!draftHousehold || !draftHousehold.persons || draftHousehold.persons.length === 0) {
      return {
        assets: [],
        persons: [],
        liabilities: [],
        averageAge: 40,
        monthlySavings: 0,
        amortizationMonthly: 0,
        pensionContribMonthly: 0,
        occPensionContribMonthly: 0,
        premiePensionContribMonthly: 0,
        privatePensionContribMonthly: 0,
        publicPensionContribMonthly: 0,
        monthlyExpenses: 40000,
        realReturns: { realReturnAvailable: 0.054, realReturnPension: 0.039, realPostFireReturnAvailable: 0.047 },
        sliderPensionAge: [63],
        sliderMonthlySavings: [0],
        requiredAtPensionLive: 0,
        dSliderInflation: [2]
      };
    }

    const assets = draftHousehold.assets || [];
    const liabilities = draftHousehold.liabilities || [];
    const persons = draftHousehold.persons || [];
    
    const averageAge = persons.reduce((sum, p) => {
      const age = p.birth_year ? new Date().getFullYear() - p.birth_year : 40;
      return sum + age;
    }, 0) / persons.length;
    const monthlySavings = persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
    const amortizationMonthly = calculateAmortizationMonthly(liabilities);
    const pensionContribMonthly = calculateMonthlyPensionContributions(persons);
    
    // Beräkna separata pensionsavsättningar
    const occPensionContribMonthly = calculateOccupationalPensionMonthlyAllocations(persons);
    const premiePensionContribMonthly = calculatePremiePensionMonthlyAllocations(persons);
    const privatePensionContribMonthly = calculatePrivatePensionMonthlyAllocations(persons);
    const publicPensionContribMonthly = calculatePublicPensionMonthlyAllocations(persons);
    
    const totalNetIncomeMonthly = persons.reduce((sum, p) => sum + (calculatePersonNetIncome(p) || 0), 0);
    const totalMonthlySavings = monthlySavings + amortizationMonthly;
    const customMonthlyExpenses = Math.max(0, totalNetIncomeMonthly - totalMonthlySavings);
    
    const autoReturns = calculateAutoReturns(assets, 0.02, 0.07, draftHousehold?.liabilities || []);
    const realReturnAvailable = autoReturns.realReturnAvailable || 0.054;
    // Beräkna genomsnittlig marknadsbaserad pensionsavkastning för display
    const avgMarketPensionReturn = (
      (autoReturns.realReturnOccPension || 0.039) +
      (autoReturns.realReturnPremiePension || 0.039) +
      (autoReturns.realReturnPrivatePension || 0.039)
    ) / 3;
    const realReturnStatePension = autoReturns.realReturnStatePension || 0.01;
    const inflation = 0.02;
    const realPostFireReturnAvailable = Math.max(toReal(0.07, inflation), realReturnAvailable);
    
    const sliderMonthlySavings = [totalMonthlySavings];
    const sliderPensionAge = [63];
    const monthlyExpenses = customMonthlyExpenses || 40000;
    const requiredAtPensionLive = monthlyExpenses * 12 * 25;
    const dSliderInflation = [2];
    
    return {
      assets,
      persons,
      liabilities,
      averageAge,
      monthlySavings,
      amortizationMonthly,
      pensionContribMonthly,
      occPensionContribMonthly,
      premiePensionContribMonthly,
      privatePensionContribMonthly,
      publicPensionContribMonthly,
      monthlyExpenses,
      realReturns: {
        realReturnAvailable,
        realReturnPension: avgMarketPensionReturn, // Genomsnitt för display
        realReturnStatePension,
        realPostFireReturnAvailable
      },
      sliderPensionAge,
      sliderMonthlySavings,
      requiredAtPensionLive,
      dSliderInflation
    };
  }, [draftHousehold]);

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-4 md:py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="secondary" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-primary">Om FIRE-beräkningen</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-200/40 p-4 md:p-6 lg:p-8">
          <div className="space-y-6 md:space-y-8 text-sm text-primary/80">
            {/* Introduktion till ekonomisk frihet */}
            <section className="bg-accent/10 p-4 md:p-6 rounded-lg border border-accent/30">
              <h3 className="text-xl font-serif text-primary mb-3">Vad är ekonomisk frihet?</h3>
              <p className="leading-relaxed mb-3 text-primary/80">
                Ekonomisk frihet handlar om att ha tillräckligt med kapital för att kunna leva livet på dina egna villkor – utan att behöva vara beroende av din lön eller månadsinkomst.
              </p>
              <p className="leading-relaxed mb-3 text-primary/80">
                Det handlar inte nödvändigtvis om att sluta jobba tidigt, utan om att skapa trygghet, frihet och tid att göra det du verkligen vill. Att kunna välja arbete, byta karriär, eller lägga mer tid på familj, passioner och det som ger dig mening i livet.
              </p>
              <p className="leading-relaxed text-sm text-primary/70 italic">
                Beräkningen är baserad på FIRE-principer (Financial Independence, Retire Early), men fokus är på frihet och valfrihet – inte bara "tidigt pensionerad".
              </p>
              <p className="leading-relaxed mt-3 text-primary/80">
                Detta verktyg hjälper dig att förstå din faktiska förmögenhet och beräknar när du potentiellt kan uppnå ekonomisk frihet baserat på dina tillgångar, sparande och utgifter.
              </p>
            </section>
            
            {/* Grundprinciper */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Grundprinciper</h3>
              <div className="space-y-3 leading-relaxed">
                {/* Grundprincipen bakom FIRE */}
                <div className="bg-success/10 p-4 rounded-lg border border-success/30">
                  <p className="font-medium text-success mb-2">💡 Kärnan i FIRE</p>
                  <p className="text-primary/80 mb-2">
                    Kärnan i FIRE är balansen mellan sparande, utgifter och avkastning. Genom att leva under dina tillgångar och investera skillnaden växer ditt kapital över tid genom ränta-på-ränta-effekten.
                  </p>
                  <p className="text-primary/80">
                    När ditt investerade kapital kan täcka dina utgifter – utan att du behöver jobba – har du nått ekonomisk frihet. Det är då du har FIRE: tillräckligt för att leva, oavsett inkomst.
                  </p>
                </div>
                
                <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                  <p className="font-medium text-info mb-2">📊 Allt räknas i dagens penningvärde (realt)</p>
                  <p className="text-primary/80">
                    Detta verktyg konverterar nominell avkastning till real avkastning genom att justera för inflation. Detta gör att beräkningarna inte påverkas av penningvärdets förändring över tid.
                  </p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-slate-200/40">
                  <p className="font-medium text-primary mb-2">💰 Tre + statlig "hinkar" för kapital</p>
                  <p className="text-primary/80 mb-2">
                    Vi delar upp ditt kapital i tre marknadsbaserade hinkar plus statlig pension som behandlas olika:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-primary/80">
                    <li><strong>Tillgängligt kapital:</strong> Övriga tillgångar (fonder, aktier, sparkonton, bostad) som du kan använda före pension. Bostaden räknas med till 40% av nettovärdet eftersom allt bostadskapital inte alltid är lätt att frigöra. Andra skulder än bostadslån fördelas först proportionellt över alla positiva tillgångar, sedan räknas 40% av bostadens nettovärde med.</li>
                    <li><strong>Marknadsbaserad pension (tre separata hinkar):</strong> 
                      <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                        <li><strong>Tjänstepension:</strong> Låst tills pensionsåldern (eller tidigare om du väljer att börja ta ut från 55 år)</li>
                        <li><strong>Premiepension:</strong> Låst tills pensionsåldern</li>
                        <li><strong>IPS (Privat pensionssparande):</strong> Låst tills pensionsåldern (eller tidigare om du väljer att börja ta ut från 55 år)</li>
                      </ul>
                      Dessa tre hinkar växer var för sig med sina egna avkastningar och inbetalningar. Vid pensionsstart slås de ihop med tillgängligt kapital.
                    </li>
                    <li><strong>Statlig pension (inkomstpension):</strong> Den statliga inkomstpensionen växer fram till pensionsstart, sedan utbetalas den som en årlig inkomst som minskar ditt behov av uttag från portföljen.</li>
                  </ul>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/30">
                  <p className="font-medium text-primary mb-2">📈 Viktad avkastning per hink</p>
                  <p className="text-primary/80 mb-2">
                    Varje "hink" har sin egen beräknad avkastning baserat på dina faktiska tillgångar och deras förväntade avkastning. Beräkningen tar hänsyn till:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-primary/80">
                    <li><strong>Nettovärden:</strong> För tillgängligt kapital räknas vi med nettovärden (tillgångar minus relaterade skulder). Till exempel: bostad minus bostadslån, bil minus billån.</li>
                    <li><strong>Proportionell fördelning:</strong> Övriga skulder (som inte är kopplade till specifika tillgångar) fördelas proportionellt över alla positiva nettovärden (bostad, bil, övriga tillgångar).</li>
                    <li><strong>Viktat snitt:</strong> Avkastningen beräknas som ett viktat snitt baserat på varje tillgångs värde och förväntad avkastning.</li>
                  </ul>
                  <p className="text-primary/80 mt-2">
                    Detta ger en mer realistisk bild än att använda en genomsnittlig avkastning för allt.
                  </p>
                </div>
                
                {/* Ränta-på-ränta */}
                <div className="bg-white/70 p-4 rounded-lg border border-slate-200/40">
                  <p className="font-medium text-primary mb-2">⚡ Ränta-på-ränta – varför tid är din bästa vän</p>
                  <p className="text-primary/80 mb-2">
                    Ränta-på-ränta är den starkaste kraften i FIRE. När du investerar får du avkastning på både ditt ursprungliga belopp och den avkastning du redan fått. Med tiden växer effekten exponentiellt – varje år växer "snöbollen" snabbare.
                  </p>
                  <p className="text-primary/80 font-medium">
                    Ju tidigare du börjar, desto mindre behöver du spara varje månad. Tiden gör det mesta av jobbet åt dig.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Hur vi beräknar */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Hur beräknar vi när du kan nå ekonomisk frihet?</h3>
              
              <div className="space-y-4">
                {/* Startvärden */}
                <div className="border-l-4 border-info pl-4">
                  <h4 className="font-serif text-primary mb-2">1. Startvärden</h4>
                  <p className="leading-relaxed text-primary/80">
                    Vi börjar med din nuvarande nettoförmögenhet uppdelad i tre marknadsbaserade hinkar plus statlig pension:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><strong>Tillgängligt kapital:</strong> Tillgångar som inte är pensionslåsta (fonder, aktier, sparkonton, bostad) minus skulder. Andra skulder än bostadslån fördelas först proportionellt över alla positiva tillgångar, sedan räknas 40% av bostadens nettovärde med.</li>
                    <li><strong>Marknadsbaserad pension (tre separata hinkar):</strong> 
                      <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                        <li><strong>Tjänstepension:</strong> Växer med egen avkastning och inbetalningar tills pensionsåldern (eller tidigare uttag från 55 år)</li>
                        <li><strong>Premiepension:</strong> Växer med egen avkastning och inbetalningar tills pensionsåldern</li>
                        <li><strong>IPS (Privat pensionssparande):</strong> Växer med egen avkastning och inbetalningar tills pensionsåldern (eller tidigare uttag från 55 år)</li>
                      </ul>
                    </li>
                    <li><strong>Statlig pension (inkomstpension):</strong> Den statliga inkomstpensionen som växer fram till pensionsstart och sedan utbetalas som inkomst.</li>
                  </ul>
                </div>
                
                {/* Månatliga insättningar */}
                <div className="border-l-4 border-success pl-4">
                  <h4 className="font-serif text-primary mb-2">2. Månatliga insättningar tills ekonomisk frihet</h4>
                  <p className="leading-relaxed text-primary/80">
                    Varje månad tills ekonomisk frihet nås:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><strong>Sparande:</strong> {formatCurrency(sliderMonthlySavings[0])}/mån (inkluderar {formatCurrency(amortizationMonthly)}/mån i amortering) går till tillgängligt kapital</li>
                    <li><strong>Marknadsbaserad pensionsavsättning (tre separata hinkar):</strong> 
                      <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                        <li><strong>Tjänstepension:</strong> {formatCurrency(occPensionContribMonthly)}/mån baserat på dina löneinkomster</li>
                        <li><strong>Premiepension:</strong> {formatCurrency(premiePensionContribMonthly)}/mån (obligatorisk del av allmän pension)</li>
                        <li><strong>IPS (Privat pensionssparande):</strong> {formatCurrency(privatePensionContribMonthly)}/mån baserat på dina registrerade IPS-inbetalningar</li>
                      </ul>
                    </li>
                    <li><strong>Statlig pensionsavsättning:</strong> {formatCurrency(publicPensionContribMonthly)}/mån går till inkomstpensionen (den statliga delen)</li>
                  </ul>
                  <p className="text-xs text-primary/70 mt-2 italic">
                    Obs: Amortering räknas både som sparande (ökar nettoförmögenheten) och reducerar utgifter. Pensionsavsättningarna delas automatiskt upp mellan de tre marknadsbaserade pensionskategorierna och statlig pension baserat på dina registrerade inkomster.
                  </p>
                </div>
                
                {/* Avkastningar */}
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-serif text-primary mb-2">3. Avkastning på kapital</h4>
                  <p className="leading-relaxed mb-2 text-primary/80">
                    Varje år växer kapitalet med beräknad real avkastning (nominell avkastning minus inflation):
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Tillgängligt kapital:</strong> {(realReturns.realReturnAvailable * 100).toFixed(1)}% real (tills ekonomisk frihet nås). Beräknas från nettovärden per kategori (bostad, bil, övrigt) med proportionell fördelning av övriga skulder.</li>
                    <li><strong>Marknadsbaserad pension (tre separata avkastningar):</strong> 
                      <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                        <li><strong>Tjänstepension:</strong> Beräknas som viktat snitt från dina tjänstepensionstillgångar</li>
                        <li><strong>Premiepension:</strong> Beräknas som viktat snitt från dina premiepensionstillgångar</li>
                        <li><strong>IPS (Privat pensionssparande):</strong> Beräknas som viktat snitt från dina IPS-tillgångar</li>
                      </ul>
                      I manuellt läge kan du justera avkastningen för varje kategori separat i simulatorn.
                    </li>
                    <li><strong>Statlig pension:</strong> {((realReturns.realReturnStatePension || 0.01) * 100).toFixed(1)}% real (default 3% nominell om inga tillgångar finns). Följer balansindex och är generellt lägre än marknadsbaserad pension.</li>
                  </ul>
                    <p className="text-xs text-primary/70 mt-2">
                    I automode räknas avkastning per hink ut automatiskt. I manuellt läge visas tre separata reglage för tjänstepension, premiepension och IPS – de styr respektive hink i simuleringen.
                  </p>
                </div>
                
                {/* Utgifter */}
                <div className="border-l-4 border-danger pl-4">
                  <h4 className="font-serif text-primary mb-2">4. Beräknade utgifter</h4>
                  <p className="leading-relaxed text-primary/80">
                    Månadsutgifter beräknas som: <strong>Nettoinkomst − Sparande − Amortering</strong>
                  </p>
                  <p className="text-sm mt-2 text-primary/80">
                    Du kan justera detta manuellt i simulatorn. Just nu: <strong>{formatCurrency(monthlyExpenses)}/mån</strong>
                  </p>
                </div>
                
                {/* Kriterier för ekonomisk frihet */}
                <div className="border-l-4 border-accent pl-4 bg-accent/10 p-4 rounded-r-lg">
                  <h4 className="font-serif text-primary mb-2">5. Kriterier för ekonomisk frihet – båda måste uppfyllas</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium mb-1">🌉 Bro till pension</p>
                      <p className="leading-relaxed text-primary/80">
                        Tillgängligt kapital måste räcka att täcka dina årliga utgifter ({formatCurrency(monthlyExpenses * 12)}) varje år från det år du når ekonomisk frihet fram till pensionsåldern {sliderPensionAge[0]} år, <strong>utan att ta slut</strong>.
                      </p>
                      <p className="text-xs text-primary/70 mt-1 italic">
                        Detta testas genom att simulera år-för-år med beräknad avkastning och uttag.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">📊 4%-krav vid pension</p>
                      <p className="leading-relaxed text-primary/80">
                        Vid pensionsstart måste minst <strong>{formatCurrency(requiredAtPensionLive)}</strong> finnas tillgängligt.
                      </p>
                      <p className="text-xs text-primary/70 mt-1 italic">
                        Detta motsvarar 25 års utgifter ({formatCurrency(monthlyExpenses * 12 * 25)}) enligt 4%-regeln, <strong>minus</strong> den statliga pensionen som utbetalas som inkomst. Om du har statlig pension som ger inkomst minskar därför behovet av kapital.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fyraprocentregeln - detaljerad förklaring */}
                <div className="bg-info/10 p-4 rounded-lg border border-info/30 mt-4">
                  <h5 className="font-semibold text-info mb-2">Fyraprocentregeln – ett riktmärke, inte en garanti</h5>
                  <p className="text-primary/80 text-sm leading-relaxed mb-2">
                    Regeln bygger på forskning som visar att om du tar ut cirka 4% av ditt investerade kapital per år (inflationsjusterat) så har pengarna historiskt räckt i minst 30 år.
                  </p>
                  <p className="text-primary/80 text-sm leading-relaxed mb-2">
                    Men – det är just en <strong>tum-regel</strong>, baserad på historiska data från aktie- och obligationsmarknader. Framtida avkastning kan variera, och verkligheten påverkas av inflation, skatter, avgifter och individuella val.
                  </p>
                  <p className="text-primary/80 text-sm leading-relaxed">
                    I denna simulator används regeln för att uppskatta när ditt kapital kan klara sig "för evigt" – men det är bara ett stöd för att förstå din ekonomiska bana, inte ett facit.
                  </p>
                </div>
              </div>
            </section>
            
                {/* Faser efter ekonomisk frihet */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Faserna efter att du nått ekonomisk frihet</h3>
              
              <div className="space-y-4">
                {/* Bridge-period */}
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/30">
                  <h4 className="font-serif text-primary mb-2">🌉 Bridge-period (ekonomisk frihet → Pension)</h4>
                  <ul className="list-disc list-inside space-y-2 text-primary/80">
                    <li><strong>Pensionsinbetalningar stoppas</strong> – inga nya insättningar till pension (året du når ekonomisk frihet är sista året med inbetalningar)</li>
                    <li><strong>Lever på tillgängligt kapital</strong> – årliga uttag motsvarar dina utgifter</li>
                    <li><strong>Pension växer endast med avkastning</strong> – de tre pensionshinkarna (tjänstepension, premiepension, IPS) fortsätter växa med sina respektive reala avkastningar</li>
                    <li><strong>Tidiga uttag:</strong> Om du väljer att börja ta ut tjänstepension eller IPS från 55 år, flyttas dessa belopp över till tillgängligt kapital vid den åldern. Om du tar ut t.ex. tjänstepension redan vid 55 räknar simulatorn med att du därefter inte fortsätter betala in på just den tjänstepensionen, utan att de pengarna i stället hamnar i ditt vanliga sparande.</li>
                    <li><strong>Avkastning på tillgängligt:</strong> {realReturns.realPostFireReturnAvailable > toReal(0.07, dSliderInflation[0] / 100) 
                      ? `${(realReturns.realPostFireReturnAvailable * 100).toFixed(1)}% real (behåller din höga avkastning)`
                      : `${(toReal(0.07, dSliderInflation[0] / 100) * 100).toFixed(1)}% real (minst 7% nominell)`}</li>
                    <li><strong>Normal årsövergång:</strong> I själva FIRE-beräkningen används en halvårs-buffert för att hitta året då du kan sluta, men i den år-för-år-grafen efteråt används en normal årsövergång för att den ska bli lättare att läsa.</li>
                  </ul>
                </div>
                
                {/* Coast FIRE */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-serif text-primary mb-2">🌊 Coast FIRE – en mjukare väg till ekonomisk frihet</h4>
                  <p className="leading-relaxed mb-3 text-primary/80">
                    Coast FIRE är en variant av FIRE för den som inte vill jobba ihjäl sig i unga år, utan hellre tar det lugnare men fortfarande siktar mot ekonomisk frihet.
                  </p>
                  <div className="space-y-2 mb-3">
                    <p className="font-medium text-primary mb-2">Idén:</p>
                    <p className="text-primary/80">
                      Du sparar och investerar tillräckligt tidigt i livet så att du kan "coasta" mot full ekonomisk frihet. Om du slutar spara nytt kapital idag, kommer ditt redan investerade kapital växa av sig självt (tack vare ränta-på-ränta) tills du når FIRE-målet vid pension.
                    </p>
                  </div>
                  <div className="space-y-2 mb-3">
                    <p className="font-medium text-primary mb-2">I denna simulator:</p>
                    <ul className="list-disc list-inside space-y-1 text-primary/80">
                      <li><strong>Inga uttag från kapital</strong> – under Coast FIRE-perioden görs inga uttag från tillgängligt kapital</li>
                      <li><strong>Inget nytt sparande</strong> – allt sparande stoppas under Coast FIRE-perioden</li>
                      <li><strong>Reducerad pensionsavsättning</strong> – pensionsavsättningarna fortsätter men räknas om baserat på en lägre pensionsgrundande inkomst (sänkt med samma procent som sparandet var i procent av (sparande + utgifter), och löneväxling tas bort)</li>
                      <li><strong>Deltidsarbete</strong> – du jobbar deltid för att täcka dina utgifter, men behöver inte spara mer</li>
                      <li><strong>Kapitalet växer</strong> – ditt investerade kapital fortsätter växa med avkastning, medan du "coastar" mot målet</li>
                    </ul>
                  </div>
                  <p className="text-xs text-primary/70 mt-3 italic">
                    Coast FIRE-perioden visas i grafen som ett markerat område (grön skugga) under bridge-perioden. När Coast FIRE-perioden är slut, återgår du till normala uttag från tillgängligt kapital.
                  </p>
                </div>
                
                {/* Efter pension */}
                <div className="bg-success/10 p-4 rounded-lg border border-success/30">
                  <h4 className="font-serif text-success mb-2">🎯 Efter pensionsstart</h4>
                  <ul className="list-disc list-inside space-y-2 text-primary/80">
                    <li><strong>Sammanslagning:</strong> Tillgängligt kapital och de tre marknadsbaserade pensionshinkarna (tjänstepension, premiepension, IPS) växer det året och slås sedan ihop till en portfölj vid pensionsstart</li>
                    <li><strong>Statlig pension som inkomst:</strong> Den statliga inkomstpensionen utbetalas som en årlig inkomst (t.ex. över 20 år vid 63 års ålder). Denna inkomst minskar ditt behov av uttag från portföljen.</li>
                    <li><strong>Årliga uttag:</strong> Motsvarar dina utgifter <strong>minus</strong> statlig pension och görs från den sammanfogade portföljen</li>
                    <li><strong>Avkastning:</strong> Hela poolen växer med samma avkastning som tillgängliga tillgångar hade efter ekonomisk frihet ({realReturns.realPostFireReturnAvailable > toReal(0.07, dSliderInflation[0] / 100) 
                      ? `${(realReturns.realPostFireReturnAvailable * 100).toFixed(1)}% real`
                      : `${(toReal(0.07, dSliderInflation[0] / 100) * 100).toFixed(1)}% real (7% nominell minimum)`})</li>
                    <li><strong>4%-regeln:</strong> Portföljen är dimensionerad för att kunna ta ut 4% per år teoretiskt i evighet, med hänsyn till att statlig pension täcker en del av utgifterna</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Avkastning efter ekonomisk frihet - detaljerad förklaring */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Avkastning efter ekonomisk frihet</h3>
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/30">
                <p className="leading-relaxed mb-3 text-primary/80">
                  När ekonomisk frihet uppnås höjs avkastningen på tillgängliga tillgångar till <strong>minst 7% nominell</strong> för att kunna testa 4%-uttag på ett konsekvent sätt.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Regler:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Om din ursprungliga reala avkastning är <strong>högre än 7% nominell</strong> → behåller du din höga avkastning</li>
                    <li>Om din ursprungliga reala avkastning är <strong>lägre än 7% nominell</strong> → höjs den till 7% nominell</li>
                    <li>När en låst pensionsdel blir uttagsbar och flyttas till den vanliga portföljen höjs dess avkastning i simuleringen till minst den nivå som används efter FIRE (7% nominellt), så att låsta delar med låg avkastning inte drar ned hela portföljen. När kapital slås ihop från flera källor beräknas en gemensam avkastning som ett viktat snitt av delarna.</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Det holistiska perspektivet */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Det holistiska perspektivet</h3>
              <div className="bg-white/70 p-5 rounded-lg border border-slate-200/40">
                <p className="leading-relaxed mb-3 text-primary/80">
                  FIRE handlar inte bara om pengar. Det är ett sätt att tänka kring livets resurser – tid, energi och värderingar.
                </p>
                <p className="leading-relaxed mb-3 text-primary/80">
                  Målet är inte bara att "inte behöva jobba", utan att leva mer medvetet: att kunna välja arbete, skapa trygghet för familjen, eller ge utrymme åt passioner.
                </p>
                <p className="leading-relaxed font-medium text-primary">
                  Ekonomisk frihet ger handlingsfrihet – inte krav på att sluta jobba, utan möjligheten att göra det du verkligen vill.
                </p>
                <p className="leading-relaxed mt-3 text-sm text-primary/80">
                  Detta verktyg hjälper dig att få en tydlig bild av din ekonomiska verklighet så att du kan fatta medvetna beslut om hur du vill leva ditt liv.
                </p>
              </div>
            </section>
            
            {/* Vad ingår */}
            <section>
              <h3 className="text-xl font-serif text-primary mb-3">Vad ingår i beräkningen?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-lg border border-slate-200/40">
                  <p className="font-semibold text-primary mb-2">✅ Data från ditt hushåll</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-primary/80">
                    <li>Tillgångar (värde + förväntad APY)</li>
                    <li>Skulder och amortering</li>
                    <li>Inkomster</li>
                    <li>Pensionsavsättningar</li>
                    <li>Ålder för hushållets medlemmar</li>
                    <li>Tidiga uttagsåldrar för tjänstepension och IPS</li>
                  </ul>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-slate-200/40">
                  <p className="font-semibold text-primary mb-2">⚙️ Beräkningar och antaganden</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-primary/80">
                    <li>Skatter baserat på svenska skattetabeller</li>
                    <li>Nettoinkomst efter skatt</li>
                    <li>Viktad avkastning från tillgångar</li>
                    <li>Real avkastning (nominell − inflation)</li>
                    <li>Konfigurerbar inflation, pensionsålder, utgifter</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Varning */}
            <section className="bg-warning/10 p-4 rounded-lg border border-warning/30">
              <p className="leading-relaxed mb-2 text-primary/80">
                <strong className="text-warning">⚠️ Viktigt:</strong> FIRE bygger på antaganden om avkastning, inflation och livslängd. Historisk avkastning är ingen garanti för framtiden.
              </p>
              <p className="leading-relaxed text-primary/80">
                Använd denna simulering som ett verktyg för att förstå och planera, inte som en exakt prognos. Det verkliga målet är att skapa frihet, inte perfektion.
              </p>
            </section>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button onClick={() => router.back()}>Tillbaka</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

