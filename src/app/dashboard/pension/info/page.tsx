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
              Denna guide förklarar de olika pensionstyperna, hur de fungerar och vad du bör tänka på.
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
                Statlig pension är grunden i det svenska pensionssystemet. Den finansieras genom allmänna pensionsavgifter 
                som betalas av alla som arbetar i Sverige. Din inkomstpension byggs upp baserat på dina pensiongrundande inkomster 
                under hela ditt arbetsliv.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>18,5% av din pensiongrundande inkomst (PGI) går till pension</li>
                <li>16% går till inkomstpension (statlig pension)</li>
                <li>2,5% går till premiepension (se nedan)</li>
                <li>Pensionen växer med inkomstindexering, vilket ger en låg men stabil avkastning (cirka 2-3% per år)</li>
                <li>Du kan börja ta ut pensionen från 63 års ålder</li>
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
                    För privatanställda tjänstemän. Vanligtvis 4,5% av lönen upp till 7,5 IBB, 
                    plus 30% av lönen över taket.
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
                    För arbetare i privat sektor. Vanligtvis 4,5% av lönen.
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2">PA16</Badge>
                  <p className="text-sm text-primary/80">
                    För statligt anställda. Vanligtvis 4,5% av lönen.
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
                  <p className="font-semibold text-blue-900 mb-1">Tips för bättre avkastning</p>
                  <p className="text-sm text-blue-800">
                    Tjänstepensionen kan ge en betydligt högre avkastning än statlig pension om du väljer rätt fonder. 
                    Över tid kan skillnaden bli mycket stor. Tänk på att sprida risken och välj fonder med låga avgifter.
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
                <p className="text-sm text-primary/60 mt-1">Marknadsbaserad del av statlig pension</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                Premiepension är den del av din statliga pension (2,5% av PGI) som investeras i fonder. 
                Till skillnad från inkomstpensionen kan du själv välja hur premiepensionen ska investeras.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>2,5% av din pensiongrundande inkomst går till premiepension</li>
                <li>Du kan välja fonder själv eller låta den förvaltas automatiskt (AP7 Såfa)</li>
                <li>Premiepensionen kan inte tas ut tidigt - den växer till pensionsstart (vanligtvis 63 år)</li>
                <li>Avkastningen beror på dina fondval och marknadsutveckling</li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 mb-1">AP7 Såfa - Ett bra val</p>
                  <p className="text-sm text-emerald-800 mb-2">
                    Om du inte vill välja fonder själv är AP7 Såfa (Sveriges Automatiska Alternativ) ett utmärkt val. 
                    Det är en automatisk fond som anpassar risken baserat på din ålder - högre risk när du är ung, 
                    lägre risk när du närmar dig pension.
                  </p>
                  <p className="text-sm text-emerald-800">
                    AP7 Såfa har historiskt sett gett bra avkastning med låga avgifter, vilket gör den till ett 
                    populärt val för många svenskar.
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
                <p className="text-sm text-primary/60 mt-1">Privat pensionssparande med skatteförmåner</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Vad är det?</h3>
              <p className="text-primary/80 leading-relaxed">
                IPS är ett privat pensionssparande som du själv betalar in till. Det ger skatteförmåner genom 
                att du får skattereduktion på insättningarna. IPS kan vara ett bra komplement till dina övriga pensioner.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hur fungerar det?</h3>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>Du betalar in pengar själv (max 35% av din pensiongrundande inkomst, med ett tak)</li>
                <li>Du får skattereduktion på insättningarna (upp till 75% av insättningen)</li>
                <li>Du väljer själv hur pengarna ska investeras (fonder, aktier, etc.)</li>
                <li>Du kan ta ut IPS från 55 års ålder</li>
                <li>Vid uttag beskattas pengarna som inkomst</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">När är IPS värt det?</p>
                  <p className="text-sm text-purple-800 mb-2">
                    IPS kan vara särskilt värdefullt om du har hög inkomst och vill spara mer till pension. 
                    Skatteförmånen gör att du får mer för pengarna, men tänk på att pengarna är låsta tills 
                    du är 55 år. Om du behöver pengarna tidigare kan det vara bättre att spara på ett vanligt 
                    ISK-konto istället.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Varför är IPS inte lika förmånligt längre?</p>
                  <p className="text-sm text-amber-800 mb-2">
                    IPS har blivit mindre förmånligt av tre huvudskäl:
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1.5 list-disc list-inside ml-2">
                    <li>
                      <strong>ISK är bättre:</strong> ISK (Investeringssparkonto) ger ofta lägre skatt och du kan spara hur mycket du vill. 
                      IPS har en maxgräns per år.
                    </li>
                    <li>
                      <strong>Låsta pengar:</strong> Pengarna i IPS är låsta tills du är 55 år. Med ISK kan du ta ut pengarna när du vill.
                    </li>
                    <li>
                      <strong>Mindre skatteförmån:</strong> Skattereduktionen på IPS har minskat över tid.
                    </li>
                  </ul>
                  <p className="text-sm text-amber-800 mt-2">
                    <strong>Rekommendation:</strong> För de flesta är ISK ett bättre val. IPS kan vara värt att överväga om du har mycket hög inkomst 
                    och redan sparar mycket på ISK, eller om du specifikt vill ha pengarna låsta tills 55 års ålder.
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
                  <strong>Risk:</strong> När du är ung kan du ta mer risk (högre andel aktier/fonder). 
                  När du närmar dig pension bör du minska risken.
                </li>
                <li>
                  <strong>Avgifter:</strong> Låga avgifter gör stor skillnad över tid. 
                  Jämför avgifter när du väljer fonder.
                </li>
                <li>
                  <strong>Kontroll:</strong> Ta kontroll över dina pensioner. Välj fonder aktivt, 
                  eller låt dem förvaltas automatiskt med ett bra val som AP7 Såfa.
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-primary/80 leading-relaxed">
                <strong className="text-primary">Viktigt:</strong> Denna guide är en förenkling av det svenska pensionssystemet. 
                Verkligheten kan vara mer komplex, och regler kan ändras över tid. 
                För specifik rådgivning om din pensionssituation, kontakta en auktoriserad pensionsrådgivare eller 
                Pensionsmyndigheten.
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

