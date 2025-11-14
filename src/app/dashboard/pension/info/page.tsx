'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Landmark, 
  PiggyBank, 
  Wallet,
  TrendingUp,
  Info,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PensionInfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">
            Pension i Sverige
          </h1>
          <p className="text-primary/70 text-lg">
            En guide till de olika pensionstyperna och hur de fungerar
          </p>
        </div>

        {/* Inledning */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <p className="text-primary/80 leading-relaxed">
              Sveriges pensionssystem består av flera delar som tillsammans bildar din totala pension. 
              Förståelsen för hur dessa delar fungerar är avgörande för att kunna planera din ekonomiska framtid. 
              Denna guide förklarar de olika pensionstyperna, hur de fungerar och vad som kan vara bra att känna till.
            </p>
          </CardContent>
        </Card>

        {/* Statlig pension */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Statlig pension (Inkomstpension)</CardTitle>
                <p className="text-sm text-primary/60 mt-1">Trygghetsbaserad pension</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                Statlig pension är grunden i det svenska pensionssystemet. Den finansieras genom arbetsgivaravgifter och den allmänna pensionsavgiften som tas ut på arbetsinkomster 
                som betalas av alla som arbetar i Sverige. Din inkomstpension byggs upp baserat på dina pensiongrundande inkomster 
                under hela ditt arbetsliv.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>18,5 % av din pensiongrundande inkomst (PGI) går till pension</li>
                <li>16 % går till inkomstpension (statlig pension)</li>
                <li>2,5 % går till premiepension (se nedan)</li>
                <li>Inkomstpensionen följer ett inkomstindex som speglar den genomsnittliga löneutvecklingen i Sverige minus en s.k. norm. Historiskt har detta gett en viss real tillväxt över tid, men framtida utveckling är osäker. I Förmögenhetskollen används en förenklad antagen avkastning för att kunna göra beräkningar.</li>
                <li>Du kan börja ta ut pensionen från lägsta uttagsålder (ca 63 år idag, beroende på födelseår)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Viktigt att veta</p>
                  <p className="text-sm text-amber-800">
                    Statlig pension är inte garanterad på samma sätt som den gamla allmänna pensionen. 
                    Den anpassas automatiskt baserat på förväntad livslängd och ekonomiska förhållanden. 
                    Detta kallas för "balansering" och kan påverka din utbetalning.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tjänstepension */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Tjänstepension</CardTitle>
                <p className="text-sm text-primary/60 mt-1">Marknadsbaserad pension via arbetsgivare</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                Tjänstepension är en extra pension som din arbetsgivare betalar in åt dig utöver den statliga pensionen. 
                Detta är en viktig del av din totala pension och kan variera beroende på vilket kollektivavtal du har.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Vanliga pensionsavtal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2">ITP1</Badge>
                  <p className="text-sm text-primary/80">
                    För privatanställda tjänstemän. Vanligtvis 4,5 % av lönen upp till 7,5 IBB, 
                    plus 30 % av lönen över taket.
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2">ITP2</Badge>
                  <p className="text-sm text-primary/80">
                    För privatanställda tjänstemän med högre löner. Inkluderar både premiebestämd 
                    och förmånsbestämd del.
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2">SAF-LO</Badge>
                  <p className="text-sm text-primary/80">
                    För arbetare i privat sektor. Vanligtvis 4,5 % av lönen.
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2">PA16</Badge>
                  <p className="text-sm text-primary/80">
                    För statligt anställda. Vanligtvis 4,5 % av lönen.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>Din arbetsgivare betalar in en procent av din lön till tjänstepension</li>
                <li>Beloppet investeras i fonder som du kan välja (eller låta förvaltas automatiskt)</li>
                <li>Du kan ofta ta ut tjänstepensionen från 55 års ålder</li>
                <li>Avkastningen beror på dina fondval och marknadsutveckling</li>
                <li>Löneväxling kan öka din tjänstepension ytterligare</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Faktorer som kan påverka avkastningen</p>
                  <p className="text-sm text-blue-800 mb-2">
                    Avkastningen i tjänstepensionen påverkas bland annat av vilka fonder som väljs, risknivå och avgifter. I många informationskällor lyfts spridning av risk och låga avgifter fram som faktorer som på sikt kan påverka utfallet. Vad som är lämpligt beror på din riskvilja, ålder och totala ekonomi.
                  </p>
                  <p className="text-xs text-blue-700 italic">
                    Detta är allmänt hållen information och inte en rekommendation att välja en viss fond eller strategi.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premiepension */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Landmark className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Premiepension</CardTitle>
                <p className="text-sm text-primary/60 mt-1">Marknadsbaserad pension</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                Premiepension är den del av din statliga pension (2,5 % av PGI) som investeras i fonder. 
                Till skillnad från inkomstpensionen kan du själv välja hur premiepensionen ska investeras.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>2,5 % av din pensiongrundande inkomst går till premiepension</li>
                <li>Du kan välja fonder själv eller låta den förvaltas automatiskt (AP7 Såfa)</li>
                <li>Premiepensionen kan inte tas ut före den lägsta uttagsålder som gäller för din årskull (idag ofta omkring 63–65 år)</li>
                <li>Avkastningen beror på dina fondval och marknadsutveckling</li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 mb-1">AP7 Såfa - Ett standardalternativ</p>
                  <p className="text-sm text-emerald-800 mb-2">
                    AP7 Såfa är det statliga standardalternativet för premiepensionen. I officiell information beskrivs det ofta som ett automatiskt alternativ där risken anpassas efter ålder och där avgiften är relativt låg. Historisk avkastning har tidvis varit hög, men framtida utveckling är osäker. Detta är ingen rekommendation att välja AP7 Såfa; du behöver själv ta ställning till vilket alternativ som passar dig.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Viktigt att veta</p>
                  <p className="text-sm text-amber-800">
                    Om du inte väljer fonder själv förvaltas premiepensionen automatiskt i AP7 Såfa. 
                    Detta är ofta ett bra val, men det kan vara värt att kolla dina alternativ om du vill 
                    ha mer kontroll eller en annan riskprofil.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IPS */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <PiggyBank className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">IPS (Individuellt Pensionssparande)</CardTitle>
                <p className="text-sm text-primary/60 mt-1">Äldre sparform med begränsade skattefördelar idag</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                IPS är en form av privat pensionssparande där pengarna är låsta till pensionsålder. Nyteckning och insättningar är i dag begränsade, och de tidigare generella skatteavdragen för privat pensionssparande har till stor del tagits bort. I vissa särskilda situationer kan avdragsrätt fortfarande finnas (t.ex. om du saknar tjänstepension), men reglerna är mer begränsade än tidigare.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>Du betalar in pengar själv till ett IPS-konto.</li>
                <li>Pengarna är låsta till tidigast 55 års ålder (exakt ålder beror på avtalet och gällande regler).</li>
                <li>Du väljer själv hur pengarna ska investeras (t.ex. fonder eller andra värdepapper).</li>
                <li>Vid uttag beskattas utbetalningarna som inkomst.</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Viktigt</p>
                  <p className="text-sm text-amber-800 mb-2">
                    Reglerna för IPS och avdragsrätt har ändrats flera gånger. Kontrollera alltid aktuella regler hos Skatteverket eller Pensionsmyndigheten om du funderar på att använda IPS.
                  </p>
                  <p className="text-sm text-amber-800">
                    För många löntagare används i dag i första hand tjänstepension och långsiktigt sparande på t.ex. ISK. IPS kan vara aktuellt i mer specifika situationer – kontrollera med Skatteverket eller rådgivare.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sammanfattning */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Sammanfattning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Hur tänker man kring pension?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>
                  <strong>Diversifiering:</strong> En bra pensionsportfölj innehåller en mix av olika pensionstyper. 
                  Statlig pension ger trygghet, medan marknadsbaserade pensioner kan ge högre avkastning.
                </li>
                <li>
                  <strong>Tid:</strong> Ju tidigare du börjar spara, desto mer växer pengarna. 
                  Ränta-på-ränta-effekten är kraftfull över lång tid.
                </li>
                <li>
                  <strong>Risk:</strong> I många allmänna pensionsguider nämns ofta att yngre sparare ibland väljer en högre andel aktier/fonder, medan risken gradvis minskas när pensionen närmar sig. Det är dock ingen regel som passar alla.
                </li>
                <li>
                  <strong>Avgifter:</strong> Låga avgifter gör stor skillnad över tid. 
                  Jämförelse av avgifter när man väljer fonder är ett vanligt fokus i allmänna sparguider.
                </li>
                <li>
                  <strong>Kontroll:</strong> Du har möjlighet att själv välja fonder eller låta dem förvaltas automatiskt, beroende på hur aktiv du vill vara. Olika alternativ passar olika personer.
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-primary/80 leading-relaxed mb-2">
                <strong className="text-primary">Viktigt:</strong> Denna guide är en förenkling av det svenska pensionssystemet. 
                Verkligheten kan vara mer komplex, och regler kan ändras över tid. 
                För specifik rådgivning om din pensionssituation, kontakta en auktoriserad pensionsrådgivare eller 
                Pensionsmyndigheten.
              </p>
              <p className="text-xs text-primary/70 italic">
                Denna sammanfattning är allmänt hållen och inte anpassad till din situation. För frågor om din specifika pension bör du kontakta Pensionsmyndigheten, ditt tjänstepensionsbolag eller en auktoriserad rådgivare.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referenser */}
        <Card className="mb-6 bg-slate-50/50 border-slate-200/60">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Referenser</p>
            <div className="space-y-1.5 text-xs text-gray-500 leading-relaxed">
              <p>
                • Pensionsmyndigheten: <a href="https://www.pensionsmyndigheten.se" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary underline">pensionsmyndigheten.se</a>
              </p>
              <p>
                • ITP1 och ITP2: Information om tjänstepension för privatanställda tjänstemän
              </p>
              <p>
                • SAF-LO: Kollektivavtal för arbetare i privat sektor
              </p>
              <p>
                • AP7 Såfa: <a href="https://www.ap7.se" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary underline">ap7.se</a> - Sveriges Automatiska Alternativ för premiepension
              </p>
              <p>
                • IPS (Individuellt Pensionssparande): Skatteverket och Pensionsmyndigheten
              </p>
              <p className="pt-2 text-gray-400 italic">
                Information baserad på allmänt tillgängliga källor och kan ändras över tid. 
                Kontakta Pensionsmyndigheten eller en auktoriserad pensionsrådgivare för specifik rådgivning.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tillbaka-knapp */}
        <div className="text-center">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

