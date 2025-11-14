'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Info, Sparkles, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getCurrentLevel, calculateDailySplurge, calculateMonthlySplurge } from '@/lib/wealth/calc';

interface WealthSplurgeCardProps {
  householdNetWorth: number;
  assets?: any[];
  persons?: any[];
}

const TOOLTIP_COPY = `0,01 %-regeln är ett tanke- och möjlighetsmedel baserat på förmögenhetens potentiella avkastning.

**Grundprincip:**
Regeln visar vad du *teoretiskt kan* lägga per dag baserat på din nettoförmögenhets potentiella avkastning (inte vad du måste eller ska spendera). 
Exempel: 100 000 kr ⇒ 10 kr/dag; 1 000 000 kr ⇒ 100 kr/dag.

**Matematisk grund:**
Regeln bygger på att förmögenheten i snitt kan skapa ~0,01 % per dag (~3,7 %/år). 
Detta är en insikt i förmögenhetens potential, inte en rekommendation att spendera.

**Viktiga förutsättningar:**
• Bygger på förmögenhetens potential, inte kontosaldot
• Kräver likvida medel eller aktivt månadssparande för faktisk användning
• Styr efter förmögenhet, inte inkomst (inkomster är mer nyckfulla över tid)

**Användning:**
Regeln är ett tanke- och beslutsstöd som hjälper dig förstå din förmögenhets potential och ge perspektiv på marginalbudgetering – 
inte ett krav eller en rekommendation att faktiskt spendera dessa belopp.`;

const LOCKED_TOOLTIP_COPY = `${TOOLTIP_COPY}\n\nNivå 1 handlar om trygghet och buffert. Lås upp 0,01 %-regeln när du når Nivå 2 (Matvarufrihet).`;

const WEALTH_LEVEL_EXAMPLES = {
  2: [
    'Smygstarta lyxfrukost: gör egen "hotellfrukost" hemma med nybryggt kaffe, croissant och juice i glasflaska',
    'Köp doftljus som luktar som din drömsemester – varje gång du tänder det får du fem sekunders semester',
    'Låt någon annan tvätta bilen för första gången',
    'Testa vinprovning på Systembolaget eller hemma med vänner – blindtesta budget vs premium',
    'Beställ hem färska örter i kruka – och känn dig som kock varje gång du lagar mat',
    'Unna dig: en frukost på café innan jobbet – börja dagen som på semester 🥐☕',
    'Unna dig: beställ hem städning en gång – känn hur lugnet sprider sig hemma 🧽',
    'Unna dig: en bättre kudde eller täcke för verklig sömnlyx 💤',
    'Unna dig: boka in en vardagsmiddag på favoritrestaurangen mitt i veckan 🍝',
    'Unna dig: en blomsterprenumeration som påminner dig om att du kan 🌸',
    'Köp färska bär eller bättre kaffe i stället för budgetalternativet',
    'Byt ut ett slitet vardagsplagg mot något som känns riktigt bra',
    'Betala för kollektivtrafik + tillägg (plats, express) när du vill ha bekvämlighet',
    'Testa ett bättre schampo, hudvård eller rakprodukt',
    'Lägg till en liten bukett blommor på veckohandlingen',
    'Swisha till en väns välgörenhetsinsamling utan att tänka efter',
    'Uppgradera matlådan till lunch ute någon gång i veckan',
    'Köp premium-versionen av din favoritapp eller streamingtjänst',
    'Lägg till bärbara hörlurar av bättre kvalitet',
    'Bjud en vän på fika spontant – "för att du kan"',
    'Byt ut en vardagsstress mot bekvämlighet – t.ex. hemleverans av matvaror',
    'Skapa trygghet i hemmet: brandvarnare, bättre lås eller extra försäkring',
    'Planera in en "fridag" i månaden – en dag helt fri från måsten',
    'Gå på enklare spa eller badhus en gång i månaden',
    'Uppgradera små hemelektronikprylar (vattenkokare, brödrost, router)',
    'Börja en mini-spartradition – t.ex. spara 10 % av din 0,01 %-summa till framtida upplevelser'
  ],
  3: [
    'Ta in på hotell i din egen stad – med room service och ingen disk',
    'Anordna "egen kockduell" hemma med vänner – vinnaren får bjuda nästa gång',
    'Köp ett hantverk från en lokal kreatör bara för att du gillar det',
    'Testa en ny transport varje månad – elcykel, elspark, tåg i förstaklass',
    'Ha en "frukostdejt" mitt i veckan på stan – låtsas att du är på semester',
    'Unna dig: boka bord på en White Guide-restaurang bara för att 🍷',
    'Unna dig: köp vin eller öl du alltid velat prova, inte bara "det vanliga" 🍾',
    'Unna dig: åk på en mathelg till Köpenhamn eller Göteborg 🍽️',
    'Unna dig: anlita städhjälp 1 gång i månaden för att slippa vardagsröran 🧹',
    'Unna dig: investera i ett hantverk – ett svenskt designobjekt du älskar 🪞',
    'Välj vinlistans rekommendation utan att kolla priset',
    'Ta taxi hem i regnet i stället för att vänta på bussen',
    'Uppgradera köksutrustningen – kniv, panna, kaffekvarn',
    'Gå på bio med snacks och dryck – inte bara filmen',
    'Unna dig färska blommor hemma varje vecka',
    'Boka massage eller ansiktsbehandling månadsvis',
    'Lägg till "business-class-känsla" i vardagen – bättre sängkläder, handdukar',
    'Investera i en kvalitetsjacka eller skor som håller i åratal',
    'Ge dig själv "fri middag" en gång i veckan: beställ vad du vill',
    'Delta i en hobbykurs (foto, vin, keramik) för nöjets skull',
    'Prova en ny restaurang i månaden – upplev mat som kultur, inte kostnad',
    'Gör en "kulinarisk helg" hemma: laga lyxmiddag med bra råvaror och musik',
    'Unna dig att bjuda hem vänner och stå för allt – njut av generositeten',
    'Ta in på hotell i en annan svensk stad över helgen',
    'Köp årskort till gym/spa/klubb du verkligen trivs på',
    'Uppgradera till bekvämt arbetsredskap hemma – höj-/sänkbart bord, bra stol, skärm'
  ],
  4: [
    'Låt någon planera hela din semester – du får bara veta destinationen på flygplatsen',
    'Boka in dig på en tystnadsretreat i en vecka – bara du, naturen och tankarna',
    'Bjud familjen på "överraskningsvecka" – de får bara veta vädret, inte vart ni ska',
    'Skapa din egen signaturrätt – ta hjälp av en kock och döp den efter dig',
    'Gör ett "personligt träningsläger" – hyr PT, kock och massör i en vecka',
    'Leasa en liten segelbåt en sommar och lär dig segla med familjen längs kusten',
    'Boka in en privatkonsert hemma i trädgården med en artist du älskar',
    'Låt en reseplanerare skräddarsy en sexmånaders jorden-runt-resa där du bara packar väskan',
    'Anlita en designer för att skapa din drömträdgård med utekök, spa och vinterträd',
    'Gör en "100-minuterslista" – 10 drömmar à 10 minuter vardera och upplev dem alla på ett år (helikoptertur, privat middag, ridtur på stranden …)',
    'Unna dig: ta med familjen till fjällen – men bo bekvämt i stället för trångt 🎿',
    'Unna dig: boka en långhelg i en europeisk stad du aldrig varit i 🗺️',
    'Unna dig: hyr in en fotograf under en resa – skapa livets fotoalbum 📸',
    'Unna dig: boka hem spa-personal för en kväll – massage i vardagsrummet 💆‍♀️',
    'Unna dig: hyr en weekendbil du drömt om och kör längs kusten 🚗💨',
    'Uppgradera flyg till business / lounge / sen utcheckning',
    'Boka weekendresa på hotell du verkligen gillar – inte bara "prisvärt"',
    'Anlita städ- eller trädgårdshjälp regelbundet',
    'Testa catering eller privatkock till middagar hemma',
    'Boka PT eller personlig yogalärare',
    'Köp presentkort på upplevelser till familjen',
    'Outsourca däckbyte, flytt eller reparationer',
    'Hyr fotograf för familjeporträtt',
    'Prioritera "tid": express-service, leverans hem, premium-support',
    'Låt någon planera resan åt dig – professionell reseplanerare',
    'Spontan weekendresa med partnern – boka utan att jämföra priser',
    'Ta in på hotell i din egen stad en natt – känn dig som turist hemma',
    'Köp tillbaka tid: låt någon annan göra din "måste-lista"',
    'Hyra fjällstuga eller sommarhus en vecka extra per år',
    'Testa "bleisure" – förläng jobbresor till semester',
    'Arrangera en mini-familjeresa och stå för kostnaden själv'
  ],
  5: [
    'Köp en liten stuga i en by du gillar bara för att du alltid kan återvända dit',
    'Anordna "familjens egna Oscarsgala" – hyr lokal, klä upp er, dela ut priser',
    'Flyg in din favoritkock från utlandet för en middag hemma',
    'Låt barnen välja resmål för hela familjen – oavsett var det blir',
    'Hyr ett boutiquehotell i en vecka för vänner och bekanta – skapa ert eget miniuniversum',
    'Unna dig: hyr ett hus i Toscana i en månad och ta med vänner 🍇',
    'Unna dig: anlita en personlig kock för en vecka – ät som på retreat 👨‍🍳',
    'Unna dig: skapa ditt eget "Think Week" – hyr en stuga och reflektera 📖',
    'Unna dig: boka in familj och vänner på ett boutiquehotell för en helg tillsammans 🏨',
    'Unna dig: bjud in en inspirerande gästföreläsare till ditt hem eller företag 🎤',
    'Hyra eller äga bostad på flera platser (t.ex. sommarhus utomlands)',
    'Engagera personlig assistent / livs-concierge',
    'Finansiera micro-filantropiprojekt: t.ex. stipendier, lokal idrott',
    'Hälso-optimering: årlig executive-screening eller hälsoteam',
    'Bygga ett eget hemmakontor med ljudisolering och ljusdesign',
    'Boka "once-in-a-lifetime"-upplevelser: safari, rymdflyg, dykresor',
    'Skapa minnesprojekt: familjeresa för 10–15 personer',
    'Köpa in utbildning, mentorskap eller rådgivning på toppnivå',
    'Donera anonymt till ändamål du bryr dig om – skapa glädje direkt',
    'Säkra digital och fysisk trygghet – IT-säkerhet, hemövervakning',
    'Leva 3 månader om året på annan plats – prova nytt klimat eller kultur',
    'Starta en liten fond för att stötta unga entreprenörer eller kreatörer',
    'Bygga en plats som bär ditt namn – park, stipendium eller konstverk'
  ],
  6: [
    'Bjud in forskare, artister och entreprenörer till ett "framtidsforum" i ditt hem',
    'Skapa ett "drömår" där du bor på sex platser i världen och bjuder in vänner att hälsa på',
    'Starta en podcast eller dokumentärserie som lyfter idéer du tror på',
    'Bygg ett "livsarkiv" – låt en filmskapare dokumentera din historia, dina lärdomar och ditt arv',
    'Skapa ett familjeäventyr där ni tillsammans väljer tre projekt att förändra världen med',
    'Unna dig: starta en fond som hjälper människor att förverkliga sina idéer 🌱',
    'Unna dig: skapa en privat retreat där du bjuder in människor som inspirerar dig 🌄',
    'Unna dig: bygg ett "family legacy project" – en film, bok eller dokumentär 🎬',
    'Unna dig: stöd en svensk konstnär, forskare eller innovatör du tror på 🎨',
    'Unna dig: skapa ett stipendium i ditt namn som förändrar någon annans liv 🎓',
    'Finansiera konstnärsresidens eller samhällsprojekt',
    'Starta stiftelse i familjens namn',
    'Anlita kurator, livscoach, familjerådgivare kontinuerligt',
    'Stödja forskning eller social innovation',
    'Etablera utbildnings- eller klimatfond',
    'Ta in hushålls- eller livslogistik-team för fri tid',
    'Skapa generationsprojekt: skriv familjebok, digitalt arv',
    'Investera i kulturella tillgångar (musik, film, litteratur)',
    'Privat retreat med experter på hälsa, livsbalans och mening',
    'Donera "opportunistiskt" – finansiera någon annans start, konst eller idé',
    'Bygg ett familjeråd som träffas årligen för att styra långsiktig påverkan',
    'Skapa stipendium eller pris som uppmuntrar innovation du tror på',
    'Finansiera en utbildningsväg eller inkubator – lämna ett avtryck i framtiden'
  ]
};

export default function WealthSplurgeCard({ householdNetWorth, assets = [], persons = [] }: WealthSplurgeCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [visibleExamples, setVisibleExamples] = useState(0);
  const [shuffledExamples, setShuffledExamples] = useState<string[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  
  const currentLevel = getCurrentLevel(householdNetWorth);
  const wealthLevel = currentLevel.level;
  const isLevelZero = householdNetWorth === 0;
  const isLocked = wealthLevel === 1 || isLevelZero;
  
  const dailySplurge = calculateDailySplurge(householdNetWorth);
  const monthlySplurge = calculateMonthlySplurge(householdNetWorth);
  // Likvida tillgångar: fonder & aktier + sparkonto & kontanter
  const liquidCategories = ['Fonder & Aktier', 'Sparkonto & Kontanter'];
  const liquidWealth = assets
    .filter(a => liquidCategories.includes(a.category))
    .reduce((sum, a) => sum + (a.value || 0), 0);
  const liquidDailySplurge = calculateDailySplurge(liquidWealth);
  const liquidMonthlySplurge = calculateMonthlySplurge(liquidWealth);

  // Fokus-vy (total eller likvid) med persistens
  const [focus, setFocus] = useState<'total' | 'liquid'>(() => {
    if (typeof window === 'undefined') return 'total';
    return (localStorage.getItem('splurgeFocus') as 'total' | 'liquid') || 'total';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('splurgeFocus', focus);
    }
  }, [focus]);
  
  const examples = WEALTH_LEVEL_EXAMPLES[wealthLevel as keyof typeof WEALTH_LEVEL_EXAMPLES] || [];
  
  // Calculate total monthly savings (accessible throughout component)
  const totalMonthlySavings = persons.reduce((sum, person) => 
    sum + (person.other_savings_monthly || 0), 0
  );

  // In denna version visar vi alltid den positiva visningen (inte varningsläge)
  
  // Shuffle examples when opening
  useEffect(() => {
    if (showExamples && examples.length > 0) {
      // Shuffle the examples array
      const shuffled = [...examples].sort(() => Math.random() - 0.5);
      setShuffledExamples(shuffled);
      setCurrentBatch(0);
      setVisibleExamples(0);
    } else {
      setShuffledExamples([]);
      setCurrentBatch(0);
      setVisibleExamples(0);
    }
  }, [showExamples, examples.length]);

  // Animate examples appearing one by one
  useEffect(() => {
    if (showExamples && shuffledExamples.length > 0) {
      const batchSize = 4;
      const startIndex = currentBatch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, shuffledExamples.length);
      
      setVisibleExamples(0);
      const interval = setInterval(() => {
        setVisibleExamples(prev => {
          const targetCount = endIndex - startIndex;
          if (prev < targetCount) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1000); // 1000ms between each example for more reward-like feeling
      
      return () => clearInterval(interval);
    }
  }, [showExamples, shuffledExamples.length, currentBatch]);

  return (
    <Card className={`relative ${isLocked ? 'opacity-60' : ''}`}>
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                0,01 %-regeln
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                daglig marginal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTooltip(!showTooltip)}
              className="h-6 w-6 p-0"
            >
              <Info className="w-4 h-4" />
            </Button>
            {!isLocked && examples.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowExamples(!showExamples);
                  setButtonClicked(true);
                  setTimeout(() => setButtonClicked(false), 600);
                }}
                className={`text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 ${
                  buttonClicked ? 'animate-pulse scale-110' : ''
                }`}
              >
                ✨ Inspiration
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {isLocked ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-6 h-6" />
              <span className="text-lg font-medium">
                {isLevelZero ? 'Lås upp på Nivå 1' : 'Lås upp på Nivå 2 (≥ 100 000 kr)'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {isLevelZero 
                ? 'För att se 0,01%-regeln behöver du först skapa ett hushåll med minst en person.'
                : 'Regeln aktiveras när du når Matvarufrihet.'}
            </p>
            {!isLevelZero && (
              <p className="text-xs text-gray-500 mt-2">
                Nivå 1 handlar om att bygga buffert och grundläggande trygghet. Fokusera på att skapa en ekonomisk säkerhetsmarginal här.
              </p>
            )}
            <Badge variant="secondary" className="text-xs">
              Baserat på din nettoförmögenhet
            </Badge>
          </div>
        ) : (
          // Active state - professional with clear explanation
          <div className="space-y-4">
            {/* Belopp med klickbar sekundär siffra och fokus överst */}
            <div className="text-center space-y-1">
              {focus === 'total' ? (
                <>
                  <div className="text-4xl font-bold text-green-600">{formatCurrency(dailySplurge)}/dag</div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFocus('liquid')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFocus('liquid')}
                    className="text-xl text-primary/60 cursor-pointer hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 group"
                    aria-label="Visa likvida 0,01 %"
                  >
                    {formatCurrency(liquidDailySplurge)}/dag
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">Baserat på din nettoförmögenhet</Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-green-600">{formatCurrency(liquidDailySplurge)}/dag</div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFocus('total')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFocus('total')}
                    className="text-xl text-primary/60 cursor-pointer hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 group"
                    aria-label="Visa total 0,01 %"
                  >
                    {formatCurrency(dailySplurge)}/dag
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">Baserat på likvida tillgångar (fonder & sparkonto)</Badge>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              {focus === 'total' ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  0,01 %-regeln baserat på hela din nettoförmögenhet visar en uppskattad daglig marginal du kan unna dig givet antagandena om avkastning och förmögenhetsutveckling – om antagandena om avkastning håller.
                </p>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  Likvida 0,01 %-regeln utgår bara från fonder/aktier och sparkonto. Det ger en mer praktisk bild av vad som kan nyttjas direkt.
                </p>
              )}
            </div>
            
            <p className="text-sm text-gray-500 text-center italic">
              Regeln hjälper dig förstå förmögenhetens potential – använd den som ett tanke- och beslutsstöd, inte som ett krav.
            </p>
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="mt-4 bg-white/90 backdrop-blur-sm border border-slate-200/40 rounded-2xl shadow-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">
                i
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-primary text-xl mb-2">Vad är 0,01 %-regeln?</h4>
                <p className="text-sm text-primary/70 mb-4">Ett diskret beslutsstöd som visar en ungefärlig daglig 'marginal' baserat på förmögenhet – inte ett köptvång eller en regel du måste följa.</p>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-primary mb-1">Grundprincip</h5>
                    <p className="text-sm text-primary/80">
                      Du kan lägga 0,01 % av din nettoförmögenhet per dag på små uppgraderingar – utöver din vanliga spend.
                      Exempel: 100 000 kr ⇒ 10 kr/dag; 1 000 000 kr ⇒ 100 kr/dag.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-primary mb-1">Matematisk grund</h5>
                    <p className="text-sm text-primary/80">
                      Förmögenheten kan i snitt skapa ~0,01 % per dag (~3,7 %/år). Potten påverkar därför inte den långsiktiga banan.
                      <span className="block mt-1 italic">(Baseras på ett teoretiskt antagande om ca 3,7 % årlig avkastning = 0,01 % per dag.)</span>
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-primary mb-1">Viktiga förutsättningar</h5>
                    <ul className="text-sm text-primary/80 space-y-1">
                      <li>✓ Bygger på förmögenhetens potential, inte kontosaldo</li>
                      <li>✓ Kräver likvida medel eller aktivt månadssparande</li>
                      <li>✓ Styr efter förmögenhet, inte inkomst (inkomst är mer nyckfull över tid)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-primary mb-1">Användning</h5>
                    <p className="text-sm text-primary/80">
                      Hjälper dig att unna dig små lyx – utan att äventyra förmögenhetsuppbyggnaden – och ger balans i vardagen.
                    </p>
                  </div>
                  {isLocked && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Nivå 1:</strong> Bygg buffert först. Regeln låses upp på Nivå 2 (Matvarufrihet).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        {showExamples && shuffledExamples.length > 0 && (
          <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-900 text-lg">
                ✨ Inspiration för Nivå {wealthLevel}
              </h4>
              {visibleExamples < 4 && (
                <div className="ml-auto">
                  <div className="flex items-center gap-1 text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Laddar inspirationer...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shuffledExamples.slice(0, (currentBatch * 4) + visibleExamples).map((example, index) => (
                <div 
                  key={`${currentBatch}-${index}`}
                  className="p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-left-2 bounce-in"
                  style={{ 
                    animationDelay: '0ms',
                    animationDuration: '600ms'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0 animate-in zoom-in-50 duration-300 shadow-lg">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-800 leading-relaxed">{example}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load more button */}
            {visibleExamples === 4 && (currentBatch * 4) + 4 < shuffledExamples.length && (
              <div className="mt-4 text-center">
                <div className="mb-2">
                  <p className="text-sm text-purple-700 font-medium">
                    {shuffledExamples.length - ((currentBatch * 4) + 4)} fler inspirationer väntar! 🎯
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setCurrentBatch(prev => prev + 1);
                    setVisibleExamples(0);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ladda fler inspirationer
                </Button>
              </div>
            )}
            
            {/* All loaded message */}
            {visibleExamples === 4 && (currentBatch * 4) + 4 >= shuffledExamples.length && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium animate-in fade-in-50 slide-in-from-bottom-2">
                  <Sparkles className="w-4 h-4" />
                  Alla inspirationer laddade! 🎉
                </div>
              </div>
            )}
          </div>
        )}

        {/* ISK Guide Modal borttagen i denna version */}
      </CardContent>
    </Card>
  );
}
