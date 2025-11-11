'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, BookOpen, Target, Sparkles, Lock } from 'lucide-react';

interface CurrentLevelInsightProps {
  level: number;
  isLevelZero?: boolean;
}

const LEVEL_INSIGHTS = {
  1: {
    name: 'Lön-till-lön',
    wealthRange: '< 100 000 kr',
    usContext: {
      class: 'Lower class',
      percentage: 'ca 20% av hushållen',
      medianAge: '≈ 42 år'
    },
    description: 'Nivå 1 är den ekonomiska startlinjen. Här lever man från lön till lön, utan buffert och utan trygghet mot otur. De som befinner sig här är mest sårbara – de som inte bara påverkas av dåliga beslut, utan framför allt av dålig tur. Ett trasigt däck, en oväntad räkning eller en sjukdag kan starta en negativ spiral.',
    coreIdea: 'Atypical results require atypical actions.',
    coreStrategy: 'Du måste agera annorlunda för att ta dig upp – du kan inte bara "jobba hårdare".',
    strategy: 'Bygg redundans – skapa flera skyddsnät: ekonomiska, sociala och praktiska. En liten buffert, någon man kan låna bil av, ett extra jobb – allt räknas som kapital.',
    whatIsAmplified: 'Otur förstärks här – den slår hårdast mot de som har minst marginal. Det viktigaste måttet är inte avkastning utan antalet dagar man klarar sig utan ny inkomst.',
    advantages: [
      'Varje framsteg märks direkt',
      'Små steg ger störst effekt av alla nivåer',
      'Snabbt känna förändring',
      'Psykologiskt viktig: från "jag klarar mig inte" till "jag kan påverka min situation"'
    ],
    disadvantages: [
      'Hög stress och brist på kontroll',
      'Beroende av andra',
      'Ingen marginal för oväntade händelser',
      'Kan upplevas som hopplös'
    ],
    howToProgress: [
      'Skapa buffert på 10 000–30 000 kr på ett tryggt konto',
      'Undvik ny skuld',
      'Höj inkomsten genom fler timmar, extrajobb eller enklare uppdrag',
      'Motstå frestelsen att direkt höja livsstilen när inkomsten ökar',
      'Använd överskottet till buffert och skuldfrihet'
    ],
    swedishContext: 'Här befinner sig många unga, studenter och ensamstående låginkomsttagare. Det är helt normalt att börja här. Målet är dock att inte fastna. När du når cirka 100 000 kr i positiv nettoförmögenhet eller tre månaders utgifter sparade är du redo för nivå 2.',
    whenComplete: 'När du når cirka 100 000 kr i positiv nettoförmögenhet eller tre månaders utgifter sparade.',
    summary: 'Nivå 1 handlar om överlevnad, trygghet och första steget bort från slumpen. Du mäter framgång i frihet från oro, inte i pengar.'
  },
  2: {
    name: 'Matvarufrihet (vardagstrygghet)',
    wealthRange: '100 000 – 1 000 000 kr',
    usContext: {
      class: 'Working class',
      percentage: '20%',
      medianAge: '44 år'
    },
    description: 'När bufferten är på plats och vardagen fungerar har man nått nivå 2. Här kan man hantera oväntade utgifter och har ett andrum att börja planera framåt. Det är inte lyx, men det är frihet på mikronivå – att kunna gå in i mataffären och köpa vad du vill utan stress.',
    coreIdea: 'Learn today, earn forever.',
    coreStrategy: 'Här ger utbildning, fortbildning och kompetensutveckling den högsta möjliga avkastningen. Du kan inte längre spara dig rik – du måste höja inkomsten.',
    strategy: 'Bygg humankapital. Kurser, certifikat, digitala verktyg, förhandla lön, byta bransch – allt som ökar värdet på din tid. Börja investera: en enkel fondrobot eller global indexfond är fullt tillräckligt.',
    whatIsAmplified: 'Alternativkostnaderna – vad du inte gör börjar kosta mer än vad du gör. Att inte äga bostad, att inte investera, att stanna i ett jobb utan utveckling får större effekt på sikt.',
    advantages: [
      'Stabilitet och trygghet',
      'Kontroll över vardagen',
      'Känslan av framsteg',
      'Kan börja känna sig ekonomiskt "lugnad"'
    ],
    disadvantages: [
      'Risk för bekvämlighet – det känns tryggt så du slutar utvecklas',
      'Många fastnar här länge',
      'Stagnation om löneutveckling är låg eller boende för tungt'
    ],
    howToProgress: [
      'Spara minst 10% av inkomsten',
      'Öka inkomsterna årligen',
      'Automatisera överföringar till sparande',
      'Undvik att låta utgifter växa i samma takt som lönen',
      'Fortsätt investera smått men konsekvent'
    ],
    swedishContext: 'I Sverige kan du på denna nivå börja känna dig ekonomiskt "lugnad". Du är inte rik, men trygg. Ett hushåll med ca 0,5–1 miljon kr i nettoförmögenhet ligger redan över medianen.',
    whenComplete: 'När du har byggt humankapital, automatiserat sparande och börjar se investeringarna växa.',
    summary: 'Nivå 2 är stabilitetens zon. Du har andrum – men om du vill växa måste du börja jobba smartare, inte hårdare.'
  },
  3: {
    name: 'Restaurangfrihet',
    wealthRange: '1 – 10 miljoner kr',
    usContext: {
      class: 'Middle class (kärnmedelklass)',
      percentage: '≈ 40%',
      medianAge: '54 år'
    },
    description: 'Det här är den nivå där man har "vunnit pengaspelet" i samhällets ögon. De flesta i Sverige som når hit tillhör den övre medelklassen. Du kan gå på restaurang och beställa vad du vill utan att tänka på priset. Pengarna börjar jobba bättre än du själv.',
    coreIdea: 'Just keep buying.',
    coreStrategy: 'Fortsätt investera regelbundet i breda, inkomstproducerande tillgångar. Disciplin är nu viktigare än ambition.',
    strategy: 'Fortsätt månadsspara med automatisk överföring. Håll portföljen bred: indexfonder, global diversifiering. Rebalansera men försök inte tajma marknaden. Undvik livsstilsinflation – hus, bil och semester kan äta upp allt.',
    whatIsAmplified: 'Misstagens pris. Ett dåligt beslut kostar mycket mer i kronor än tidigare. Investeringsdisciplin är nu viktigare än ambition.',
    advantages: [
      'Verklig ekonomisk frihet',
      'Du bestämmer över tiden',
      'Social status och trygghet',
      'Många kan leva gott här hela livet'
    ],
    disadvantages: [
      'Risk att tappa riktning',
      'Pengarna växer, men meningen kan bli diffus',
      'Du är "klar" men vet inte vad nästa steg är'
    ],
    howToProgress: [
      'Låt kapitalet jobba i 10–20 år',
      'Behåll hög inkomstnivå',
      'Håll fast vid enkla regler',
      'Frigör kapital ur boendet (inte 60–70% i huset)',
      'Undvik livsstilsinflation'
    ],
    swedishContext: 'I Sverige innebär 1–10 miljoner kr att du tillhör den rikaste tredjedelen av hushållen. Här är man ofta "ekonomiskt trygg för livet" om man håller utgifterna rimliga.',
    whenComplete: 'När du känner att du har vunnit pengaspelet och kan leva bekvämt utan oro. De flesta kan leva hela livet lyckligt här.',
    summary: 'Nivå 3 är komfort, kontroll och balans. Du behöver inte klättra mer – men om du gör det, gör det för att du vill, inte för att du måste.'
  },
  4: {
    name: 'Resefrihet',
    wealthRange: '10 – 100 miljoner kr',
    usContext: {
      class: 'Upper middle class',
      percentage: '≈ 18%',
      medianAge: '62 år'
    },
    description: 'Det här är den punkt där de flesta skulle säga att du är rik. Du kan resa vart du vill, när du vill, och en dags rörelse på börsen påverkar mer än din månadslön. Detta är "freedom to choose time" – du styr själv.',
    coreIdea: 'What got you here won\'t get you there.',
    coreStrategy: 'Strategin som tog dig hit räcker inte längre. För att gå vidare krävs helt nya verktyg – inte bara hög lön och sparsamhet, utan företagande, investeringar i bolag eller arv.',
    strategy: 'Låt portföljen arbeta – "coast FIRE" är fullt möjligt. Professionalisera ekonomi: rådgivare, bolagsstruktur, riskspridning. Minska koncentrationsrisk, diversifiera globalt. Reflektera: Vad vill du med friheten?',
    whatIsAmplified: 'Kapitalets kraft. Avkastningen dominerar inkomsten; små procentuella svängningar påverkar ekonomin mer än arbete gör. Portföljbeslut, skatt och psykologi blir viktigare än arbete.',
    advantages: [
      'Total ekonomisk frihet',
      'Välj tid och plats',
      'Flexibilitet och trygghet',
      'Kan leva utan arbete om man vill'
    ],
    disadvantages: [
      'Svårt att känna mening',
      'Kapitalet blir "för stort för att kännas"',
      'Svårare att känna konkret påverkan'
    ],
    howToProgress: [
      'Kräver oftast eget företag och lyckad exit',
      'Inte realistiskt för de flesta via lönearbete',
      'Om du försöker – var medveten om risk och syfte',
      'Håll riskerna låga, diversifiera',
      'Definiera vad "tillräckligt" betyder för dig'
    ],
    swedishContext: 'I Sverige betyder 10–100 miljoner kr att du är ekonomiskt oberoende. Du kan leva var du vill, resa, byta jobb eller inte jobba alls. Det är här FIRE-drömmen slutar. De flesta stannar här – och det räcker långt.',
    whenComplete: 'När du har vunnit spelet. Du har full ekonomisk frihet. Nästa steg handlar inte om pengar, utan om mening.',
    summary: 'Nivå 4 är frihetens topp. Du har vunnit spelet. Nästa steg handlar inte om pengar, utan om mening.'
  },
  5: {
    name: 'Geografisk frihet',
    wealthRange: '100 – 1 000 miljoner kr',
    usContext: {
      class: 'Upper class',
      percentage: '≈ 1,9%',
      medianAge: '64 år'
    },
    description: 'På denna nivå är förmögenheten så stor att den påverkar livet mer än du själv gör. Du kan äga flera bostäder globalt, starta företag bara för att du vill, och dina investeringar skapar mer kapital än du kan konsumera. Pengar börjar skapa problem istället för att lösa dem.',
    coreIdea: 'Only the paranoid survive.',
    coreStrategy: 'Det handlar nu om att skydda det du byggt. De flesta som kommit hit gjorde det genom koncentration – ett eget företag, en stor ägarpost. Men för att behålla rikedom krävs det motsatta: diversifiering.',
    strategy: 'Sprid riskerna, sälj delar av ägande, skapa balans. Bygg en professionell struktur (holding, familjekontor, rådgivare). Planera arv, skatter och succession. Ge mening: engagera dig i filantropi eller samhällsprojekt.',
    whatIsAmplified: 'Risk för övermod och koncentration. De som kom hit via ett bolag har ofta allt i samma korg. Behov av struktur och balans för att undvika förlust.',
    advantages: [
      'Total frihet och inflytande',
      'Resurser för att skapa förändring',
      'Global frihet',
      'Flera hem och oberoende ekonomi'
    ],
    disadvantages: [
      'Isolering och oro',
      'Rikedom utan glädje',
      'Förlorad mening',
      'Risk för "rikedom utan glädje"'
    ],
    howToProgress: [
      'Endast genom entreprenörskap, innovation eller extremt goda marknadsförhållanden',
      'Statistiskt sett faller lika många tillbaka till nivå 4 som tar sig upp',
      'Säkra arv, diversifiera',
      'Gör skillnad med kapitalet'
    ],
    swedishContext: 'I Sverige motsvarar det här några tusen personer. Du är bland de rikaste 0,1%. Fokusera på hållbar rikedom – hur du förvaltar och ger vidare, snarare än att växa.',
    whenComplete: 'När du har mer än du behöver och kapitalet försörjer generationer. Fokusera på hållbar rikedom.',
    summary: 'Nivå 5 är rikedom på systemnivå. Pengarna jobbar för världen lika mycket som för dig.'
  },
  6: {
    name: 'Påverkansfrihet',
    wealthRange: '> 1 miljard kr',
    usContext: {
      class: 'The super-rich',
      percentage: '≈ 0,1% (ca 11 000 hushåll)',
      medianAge: '66 år'
    },
    description: 'Detta är toppen av trappan. Färre än 0,1% av hushållen når hit. Här kan du påverka samhällen, politik och kultur – ditt kapital räcker i generationer. Detta är nivån där pengar inte längre är ett mål utan ett verktyg.',
    coreIdea: 'Legacy = Action × Wealth.',
    coreStrategy: 'Din påverkan avgörs inte bara av pengarna, utan av vad du gör med dem. Ditt arv definieras av vad du gör med resurserna.',
    strategy: 'Bygg stiftelser och filantropiska strukturer. Säkra familjens värderingar och sammanhållning. Fokusera på utbildning och etik i nästa generation. Använd kapitalet för långsiktig samhällsnytta.',
    whatIsAmplified: 'Ansvar och påverkan. Varje beslut påverkar många liv. Frågor handlar om arv, mening och ansvar snarare än rikedom.',
    advantages: [
      'Obegränsad frihet',
      'Möjlighet att skapa positiv påverkan i stor skala',
      'Kan påverka samhällen och generationer',
      'Resurser nog att forma framtiden'
    ],
    disadvantages: [
      'Ständig exponering',
      'Förlust av privatliv',
      'Risk för arvskonflikter',
      'Relationsrisker'
    ],
    howToProgress: [
      'Nästa steg är inte ekonomiskt, utan existentiellt',
      'Lev dina värderingar – låt ditt arv bli din påverkan',
      'Fokusera på meningsfullt arv snarare än mer rikedom'
    ],
    swedishContext: 'I svensk kontext handlar det om miljardärer, familjestiftelser och entreprenörer med global påverkan. På den här nivån är nästa steg inte ekonomiskt, utan existentiellt.',
    whenComplete: 'När du har definierat ditt arv och påverkan. Pengarna räcker för alltid – frågan är vad du vill att de ska räcka till.',
    summary: 'Nivå 6 handlar inte längre om rikedom, utan om ansvar, arv och mening. Pengarna räcker för alltid – frågan är vad du vill att de ska räcka till.'
  }
};

export default function CurrentLevelInsight({ level, isLevelZero = false }: CurrentLevelInsightProps) {
  if (isLevelZero || !level || level === 0) {
    return (
      <Card className="relative overflow-visible border-0 shadow-lg opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary/60" />
            </div>
            <span>Din nivå</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-6 h-6" />
              <span className="text-lg font-medium">Lås upp på Nivå 1</span>
            </div>
            <p className="text-sm text-gray-600">
              För att se detaljerad information om din nivå behöver du först skapa ett hushåll med minst en person.
            </p>
            <Badge variant="secondary" className="text-xs">
              Baserat på din nettoförmögenhet
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insight = LEVEL_INSIGHTS[level as keyof typeof LEVEL_INSIGHTS];
  if (!insight) return null;

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return { gradient: 'from-gray-100 via-slate-50 to-gray-100', accent: 'gray', border: 'border-gray-300/50', text: 'text-gray-700' };
      case 2: return { gradient: 'from-emerald-50 via-green-50 to-teal-50', accent: 'emerald', border: 'border-emerald-300/50', text: 'text-emerald-700' };
      case 3: return { gradient: 'from-amber-50 via-yellow-50 to-orange-50', accent: 'amber', border: 'border-amber-300/50', text: 'text-amber-700' };
      case 4: return { gradient: 'from-blue-50 via-cyan-50 to-indigo-50', accent: 'blue', border: 'border-blue-300/50', text: 'text-blue-700' };
      case 5: return { gradient: 'from-purple-50 via-violet-50 to-fuchsia-50', accent: 'purple', border: 'border-purple-300/50', text: 'text-purple-700' };
      case 6: return { gradient: 'from-indigo-50 via-purple-50 to-pink-50', accent: 'indigo', border: 'border-indigo-300/50', text: 'text-indigo-700' };
      default: return { gradient: 'from-gray-50 to-gray-100', accent: 'gray', border: 'border-gray-300/50', text: 'text-gray-700' };
    }
  };

  const colors = getLevelColor(level);

  return (
    <Card className={`relative overflow-hidden border-2 ${colors.border} bg-gradient-to-br ${colors.gradient}`}>
      {/* Decorative background elements */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br ${colors.gradient} opacity-20 blur-2xl`} />
      <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr ${colors.gradient} opacity-15 blur-xl`} />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
            <MapPin className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <CardTitle className={`${colors.text} font-serif text-xl sm:text-2xl mb-1`}>
              Din nivå: {insight.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {insight.wealthRange}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {insight.usContext.class} (USA)
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        {/* Nivåbeskrivning */}
        <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/20">
          <p className="text-sm text-primary/90 leading-relaxed">
            {insight.description}
          </p>
        </div>

        {/* Huvudidé & Strategi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex items-start gap-3 mb-3">
              <Lightbulb className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${colors.text} mb-1.5`}>
                  Huvudidé
                </h4>
                <p className="text-xs text-primary/90 italic leading-relaxed">
                  "{insight.coreIdea}"
                </p>
                <p className="text-xs text-primary/70 mt-2 leading-relaxed">
                  {insight.coreStrategy}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex items-start gap-3 mb-3">
              <Target className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${colors.text} mb-1.5`}>
                  Strategi
                </h4>
                <p className="text-xs text-primary/90 leading-relaxed">
                  {insight.strategy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vad som förstärks */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <BookOpen className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${colors.text} mb-1.5`}>
                Vad man ska tänka på
              </h4>
              <p className="text-xs text-primary/90 leading-relaxed">
                {insight.whatIsAmplified}
              </p>
            </div>
          </div>
        </div>

        {/* Fördelar & Nackdelar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <h4 className="font-semibold text-green-700 text-sm">Fördelar</h4>
            </div>
            <ul className="space-y-2">
              {insight.advantages.map((advantage, idx) => (
                <li key={idx} className="text-xs text-primary/80 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                  <span>{advantage}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <h4 className="font-semibold text-orange-700 text-sm">Utmaningar</h4>
            </div>
            <ul className="space-y-2">
              {insight.disadvantages.map((disadvantage, idx) => (
                <li key={idx} className="text-xs text-primary/80 flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠</span>
                  <span>{disadvantage}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hur man tar sig vidare */}
        <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <TrendingUp className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${colors.text} mb-2`}>
                Hur man tar sig vidare
              </h4>
              <ul className="space-y-1.5">
                {insight.howToProgress.map((step, idx) => (
                  <li key={idx} className="text-xs text-primary/90 flex items-start gap-2">
                    <ArrowRight className={`w-3 h-3 ${colors.text} mt-0.5 flex-shrink-0`} />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Svensk kontext */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${colors.text} mb-1.5`}>
                Svensk kontext
              </h4>
              <p className="text-xs text-primary/90 leading-relaxed mb-2">
                {insight.swedishContext}
              </p>
              <div className="mt-2 pt-2 border-t border-primary/20">
                <p className="text-xs text-primary/70 italic">
                  <strong>När kan du känna dig "klar":</strong> {insight.whenComplete}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sammanfattning */}
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-primary/30">
          <p className="text-sm text-primary/90 leading-relaxed font-medium text-center">
            {insight.summary}
          </p>
        </div>

        {/* USA-kontext (diskret) */}
        <div className="text-center">
          <p className="text-xs text-primary/50">
            USA-kontext: {insight.usContext.percentage} • {insight.usContext.medianAge} • Baserat på Nick Maggiulli's Wealth Ladder
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

