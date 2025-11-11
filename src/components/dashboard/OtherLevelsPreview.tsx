'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, ArrowRight, Lock, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getCurrentLevel, calculateDailySplurge, calculateMonthlySplurge, WEALTH_LEVELS } from '@/lib/wealth/calc';

interface OtherLevelsPreviewProps {
  currentNetWorth: number;
  isLocked?: boolean;
}

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

const LEVEL_DATA = {
  1: {
    name: 'Lön-till-lön',
    subtitle: 'Startpunkten – bygg stabilitet',
    icon: '🏃',
    gradient: 'from-gray-100 via-slate-50 to-gray-100',
    accentColor: 'gray',
    borderColor: 'border-gray-300/50',
    textColor: 'text-gray-700',
    headingColor: 'text-gray-900',
    advantages: ['Små framsteg ger enorm effekt', 'Märker snabbt förbättring'],
    challenges: ['Hög stress och beroende av andra', 'Ingen marginal för oväntade händelser']
  },
  2: {
    name: 'Matvarufrihet',
    subtitle: 'Stabilitetens mark – trygghet i vardagen',
    icon: '🏠',
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    accentColor: 'green',
    borderColor: 'border-emerald-300/50',
    textColor: 'text-emerald-700',
    headingColor: 'text-emerald-900',
    advantages: ['Stabilitet och trygghet', 'Kontroll över vardagen'],
    challenges: ['Risk för stagnation', 'Många fastnar här länge']
  },
  3: {
    name: 'Restaurangfrihet',
    subtitle: 'Du har vunnit pengaspelet i vardagen',
    icon: '🍝',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    accentColor: 'amber',
    borderColor: 'border-amber-300/50',
    textColor: 'text-amber-700',
    headingColor: 'text-amber-900',
    advantages: ['Verklig ekonomisk frihet', 'Du bestämmer över tiden'],
    challenges: ['Risk att tappa mål', 'Du är "klar" men vet inte nästa steg']
  },
  4: {
    name: 'Resefrihet',
    subtitle: 'Ekonomiskt oberoende – kapitalet växer snabbare',
    icon: '✈️',
    gradient: 'from-blue-50 via-cyan-50 to-indigo-50',
    accentColor: 'blue',
    borderColor: 'border-blue-300/50',
    textColor: 'text-blue-700',
    headingColor: 'text-blue-900',
    advantages: ['Total ekonomisk frihet', 'Välj tid och plats'],
    challenges: ['Svårt att känna mening', 'Kapitalet blir "för stort för att kännas"']
  },
  5: {
    name: 'Geografisk frihet',
    subtitle: 'Mer än du behöver – global frihet och flera hem',
    icon: '🌍',
    gradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    accentColor: 'purple',
    borderColor: 'border-purple-300/50',
    textColor: 'text-purple-700',
    headingColor: 'text-purple-900',
    advantages: ['Total frihet och inflytande', 'Resurser för att skapa förändring'],
    challenges: ['Isolering och oro', 'Rikedom utan glädje']
  },
  6: {
    name: 'Påverkansfrihet',
    subtitle: 'Resurser nog att påverka samhällen och generationer',
    icon: '🪶',
    gradient: 'from-indigo-50 via-purple-50 to-pink-50',
    accentColor: 'indigo',
    borderColor: 'border-indigo-300/50',
    textColor: 'text-indigo-700',
    headingColor: 'text-indigo-900',
    advantages: ['Total påverkan', 'Möjlighet att skapa gott i stor skala'],
    challenges: ['Extrem exponering', 'Ständig offentlighet och relationsrisker']
  }
};

export default function OtherLevelsPreview({ currentNetWorth, isLocked = false }: OtherLevelsPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [randomExample, setRandomExample] = useState<string | null>(null);
  
  const currentLevel = getCurrentLevel(currentNetWorth);
  const currentLevelNumber = currentLevel.level;
  
  // Filtrera bort nuvarande nivå
  const otherLevels = WEALTH_LEVELS.filter(level => level.level !== currentLevelNumber);
  
  useEffect(() => {
    if (!isLocked && showPreview && otherLevels.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentPreviewIndex((prev) => (prev + 1) % otherLevels.length);
          setIsAnimating(false);
        }, 300);
      }, 10000); // 10 sekunder per nivå
      
      return () => clearInterval(interval);
    }
  }, [isLocked, showPreview, otherLevels.length]);
  
  // Compute preview data (always, even if not used)
  const currentPreview = otherLevels.length > 0 ? otherLevels[currentPreviewIndex] : null;
  const examples = currentPreview 
    ? (WEALTH_LEVEL_EXAMPLES[currentPreview.level as keyof typeof WEALTH_LEVEL_EXAMPLES] || [])
    : [];
  
  // Uppdatera random exempel när nivån ändras (måste vara före conditional returns)
  useEffect(() => {
    if (currentPreview && examples.length > 0) {
      const randomIndex = Math.floor(Math.random() * examples.length);
      setRandomExample(examples[randomIndex]);
    } else {
      setRandomExample(null);
    }
  }, [currentPreviewIndex, currentPreview?.level, examples.length]);
  
  // Visa låst version
  if (isLocked) {
    return (
      <Card className="opacity-60 border-2 border-dashed border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-center gap-2 text-center">
            <Lock className="w-5 h-5 text-primary/60" />
            <span className="font-serif">Andra nivåer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-primary/80">
              Låses upp på Nivå 1
            </p>
            <p className="text-xs text-primary/60">
              För att se andra rikedomsnivåer behöver du först skapa ett hushåll med minst en person.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const levelData = LEVEL_DATA[currentPreview?.level as keyof typeof LEVEL_DATA];

  if (!showPreview) {
    return (
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-bold text-primary mb-2">
            Utforska andra nivåer
          </h3>
          <p className="text-sm text-primary/70 mb-6 max-w-md mx-auto">
            Se vad som väntar på högre nivåer – få motivation och insikter om din resa mot ekonomisk frihet
          </p>
          <Button 
            onClick={() => setShowPreview(true)}
            variant="default"
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            <Sparkles className="w-4 h-4" />
            Visa andra nivåer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!levelData || !currentPreview) {
    return null;
  }

  return (
    <Card className={`relative overflow-hidden border-2 ${levelData.borderColor} bg-gradient-to-br ${levelData.gradient} transition-all duration-500 ${isAnimating ? 'opacity-75 scale-[0.98]' : 'opacity-100 scale-100'}`}>
      {/* Decorative background elements */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${levelData.gradient} opacity-20 blur-2xl`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr ${levelData.gradient} opacity-15 blur-xl`} />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`text-4xl sm:text-5xl flex-shrink-0`}>
              {levelData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className={`${levelData.headingColor} font-serif text-xl sm:text-2xl mb-1 flex items-center gap-2`}>
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Nivå {currentPreview.level}: {levelData.name}</span>
          </CardTitle>
              <p className={`text-sm ${levelData.textColor}/80 mt-1`}>
                {levelData.subtitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="text-primary/60 hover:text-primary flex-shrink-0"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        {/* Wealth Range Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            {formatCurrency(currentPreview.start)} – {currentPreview.next ? formatCurrency(currentPreview.next) : '+'}
          </Badge>
        </div>
        
        {/* Two Column Layout: Advantages & Challenges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Advantages */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <h4 className="font-semibold text-green-700 text-sm">Fördelar</h4>
            </div>
            <ul className="space-y-2">
              {levelData.advantages.map((advantage, idx) => (
                <li key={idx} className="text-xs text-primary/80 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                  <span>{advantage}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <h4 className="font-semibold text-orange-700 text-sm">Utmaningar</h4>
            </div>
            <ul className="space-y-2">
              {levelData.challenges.map((challenge, idx) => (
                <li key={idx} className="text-xs text-primary/80 flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Random 0.01% Inspiration Example */}
        {randomExample && (
          <div className="p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200/50 rounded-xl shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                  ✨
                </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  0,01%-inspiration
                </h4>
                <p className="text-sm text-primary/90 leading-relaxed font-medium">
                  {randomExample}
                </p>
              </div>
              </div>
            </div>
          )}
        
        {/* Level indicator dots */}
        <div className="flex justify-center gap-2 pt-2">
          {otherLevels.map((level, index) => {
            const dotLevelData = LEVEL_DATA[level.level as keyof typeof LEVEL_DATA];
            const activeDotColor = dotLevelData?.accentColor === 'gray' ? 'bg-gray-600' :
                                   dotLevelData?.accentColor === 'green' ? 'bg-green-600' :
                                   dotLevelData?.accentColor === 'amber' ? 'bg-amber-600' :
                                   dotLevelData?.accentColor === 'blue' ? 'bg-blue-600' :
                                   dotLevelData?.accentColor === 'purple' ? 'bg-purple-600' :
                                   'bg-indigo-600';
            
            return (
            <button
              key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentPreviewIndex(index);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentPreviewIndex 
                    ? `${activeDotColor} w-6 h-2` 
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Visa nivå ${otherLevels[index].level}`}
              />
            );
          })}
        </div>

        {/* Auto-rotate indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-primary/60 pt-2">
          <ArrowRight className="w-3 h-3" />
          <span>Byter automatiskt var 10:e sekund</span>
        </div>
      </CardContent>
    </Card>
  );
}
