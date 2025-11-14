'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PiggyBank } from 'lucide-react';

export default function SavingsInfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard?scrollTo=savings')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2 flex items-center gap-3">
            <PiggyBank className="w-8 h-8 text-emerald-600" />
            Kom igång med sparande (ISK och buffert)
          </h1>
          <p className="text-primary/70 text-lg">
            En enkel guide för att välja mellan fond (ISK) och sparkonto utifrån din tidshorisont – och hur du startar på några minuter.
          </p>
        </div>

        <div className="space-y-6">
          {/* Vad är ISK? */}
          <Card className="bg-white border-slate-200/60">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-primary mb-3">Vad är ISK?</h2>
              <p className="text-primary/80 mb-3 leading-relaxed">
                ISK är ett konto som i många informationskällor förklaras som anpassat för långsiktigt sparande. Skatten tas ut som en årlig schablon i stället för kapitalvinstskatt. Om ISK är lämpligt för dig beror på din totala ekonomi och dina mål.
              </p>
              <p className="text-primary/70 leading-relaxed">
                Du kan öppna ISK hos din bank eller en nätbank. Hela processen tar oftast bara några minuter med BankID och du styr månadssparandet själv.
              </p>
            </CardContent>
          </Card>

          {/* Fördelar och Exempel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">Fördelar</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• Låg, förutsägbar skatt</li>
                  <li>• Ingen vinstskatt vid försäljning</li>
                  <li>• Enkelt att månadsspara</li>
                  <li>• Passar för sparande som inte behövs i närtid</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-3">Exempel på investeringar</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• Breda indexfonder (global/USA)</li>
                  <li>• Ev. komplettera med Sverige</li>
                  <li>• Låga avgifter kan vara viktigt – avgiften är en säker kostnad</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tidshorisont */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">Tidshorisont – fond eller sparkonto?</h2>
              <p className="text-sm text-blue-900 leading-relaxed">
                Ett vanligt sätt att resonera i allmänna sparguider är att pengar som inte behövs i närtid ibland placeras i fonder via t.ex. ISK, medan pengar som kan behövas snart ofta ligger kvar på sparkonto. Vad som passar dig beror på din risknivå, buffert och tidshorisont.
              </p>
            </CardContent>
          </Card>

          {/* Kom igång */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-3">Kom igång – 4 steg</h2>
              <ol className="list-decimal ml-5 text-sm text-amber-900 space-y-2 leading-relaxed">
                <li>Välj bank eller nätbank</li>
                <li>Öppna ISK-konto – det går snabbt med BankID</li>
                <li>Ställ in månadssparande</li>
                <li>Som exempel nämns ofta i sparguider en global indexfond med låg avgift (t.ex. under 0,4 %) som ett alternativ för långsiktigt sparande. Detta är endast ett exempel och inte en rekommendation – välj själv det som passar din situation och risknivå.</li>
              </ol>
            </CardContent>
          </Card>

          {/* Fondrobot */}
          <Card className="bg-white border-slate-200/60">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-primary mb-3">Fondrobot – ett alternativ</h2>
              <p className="text-primary/80 text-sm leading-relaxed">
                En fondrobot kan vara ett sätt att komma igång om du vill ha automatisk fördelning och återbalansering. Titta på avgiften och välj ett paket som passar din situation och risknivå.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mt-6 bg-slate-50/50 border-slate-200/60">
          <CardContent className="p-4">
            <p className="text-xs text-primary/60 italic leading-relaxed">
              Den här guiden beskriver vanliga sparformer på en generell nivå. Informationen är inte anpassad till din situation och ska inte ses som personlig finansiell rådgivning eller rekommendation att välja en viss bank, fond eller sparprodukt.
            </p>
          </CardContent>
        </Card>

        {/* Tillbaka-knapp */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push('/dashboard?scrollTo=savings')}
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

