'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { getCurrentLevel } from '@/lib/wealth/calc';
import { calculateAmortizationMonthly } from '@/lib/wealth/calc';
import { Person, Asset, Liability } from '@/lib/types';
import { PiggyBank, TrendingUp, Target, Sparkles, Lock } from 'lucide-react';

interface SavingsCardProps {
  assets: Asset[];
  liabilities: Liability[];
  persons: Person[];
  totalNetWorth: number;
  isLocked?: boolean;
}

export default function SavingsCard({ assets, liabilities, persons, totalNetWorth, isLocked = false }: SavingsCardProps) {
  const router = useRouter();
  const [showISKGuide, setShowISKGuide] = useState(false);

  // Beräkna nuvarande månadssparande
  const monthlySavings = useMemo(() => {
    return persons.reduce((sum, person) => sum + (person.other_savings_monthly || 0), 0);
  }, [persons]);

  const amortizationMonthly = useMemo(() => {
    return calculateAmortizationMonthly(liabilities);
  }, [liabilities]);

  const totalMonthlySavings = monthlySavings + amortizationMonthly;

  // Beräkna nettoinkomst för att räkna ut sparkvot
  const netIncome = useMemo(() => {
    return persons.reduce((sum, person) => {
      const personNetIncome = person.incomes?.reduce((incomeSum, income) => {
        if (income.monthly_income) {
          return incomeSum + income.monthly_income;
        }
        return incomeSum;
      }, 0) || 0;
      return sum + personNetIncome;
    }, 0);
  }, [persons]);

  // Sparkvot
  const savingsRate = netIncome > 0 ? (totalMonthlySavings / netIncome) * 100 : 0;

  // Bestäm vilken nivå användaren är på
  const currentLevel = getCurrentLevel(totalNetWorth);
  const isLevel1 = currentLevel.level === 1;
  const isLevel2 = currentLevel.level === 2;
  const isLevel3Plus = currentLevel.level >= 3;

  // Likvida vs totala tillgångar
  const totalAssetValue = useMemo(() => assets.reduce((s,a)=> s + (a.value || 0), 0), [assets]);
  const liquidValue = useMemo(() => assets
    .filter(a => ['Fonder & Aktier','Sparkonto & Kontanter'].includes(a.category as any))
    .reduce((s,a)=> s + (a.value || 0), 0), [assets]);
  const liquidRatio = totalAssetValue > 0 ? liquidValue / totalAssetValue : 0;
  const shouldShowSavingsNudge = useMemo(() => {
    return currentLevel.level <= 3 && savingsRate < 5 && ((liquidRatio < 0.3) || (totalAssetValue < 100000));
  }, [currentLevel.level, savingsRate, liquidRatio, totalAssetValue]);

  // Bestäm meddelande och stil baserat på nivå
  const messageInfo = useMemo(() => {
    if (isLevel1) {
      return {
        title: 'Bygg din buffert',
        message: 'Varje månad du sparar bygger trygghet och ger dig möjlighet till framtida frihet.',
        color: 'amber',
        icon: PiggyBank,
        badge: 'Kom igång',
        encouragement: totalMonthlySavings === 0 
          ? 'Börja med att sätta undan en liten summa varje månad – varje steg räknas!'
          : `Bra start! Du sparar redan ${formatCurrency(totalMonthlySavings)}/månad.`
      };
    } else if (isLevel2) {
      return {
        title: 'Mot ekonomisk trygghet',
        message: 'Ditt sparande växer och ger dig större möjligheter och valfrihet.',
        color: 'green',
        icon: Target,
        badge: 'På väg!',
        encouragement: `Fortsätt spara ${formatCurrency(totalMonthlySavings)}/månad för att nå nästa nivå.`
      };
    } else {
      return {
        title: 'Mot ekonomisk frihet',
        message: 'Ränta-på-ränta-effekten accelererar – ditt sparande får växa allt snabbare över tid.',
        color: 'emerald',
        icon: Sparkles,
        badge: 'Fantastiskt!',
        encouragement: `Med ${formatCurrency(totalMonthlySavings)}/månad och ränta-på-ränta bygger du snabbt framtid.`
      };
    }
  }, [isLevel1, isLevel2, isLevel3Plus, totalMonthlySavings]);

  // Sparkvot info för styling
  const savingsRateInfo = useMemo(() => {
    if (savingsRate >= 30) {
      return {
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50 border-emerald-300',
        borderClass: 'border-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badge: 'Utmärkt!'
      };
    } else if (savingsRate >= 20) {
      return {
        colorClass: 'text-green-700',
        bgClass: 'bg-green-50 border-green-300',
        borderClass: 'border-green-300',
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
        badge: 'Mycket bra!'
      };
    } else if (savingsRate >= 10) {
      return {
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50 border-blue-300',
        borderClass: 'border-blue-300',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        badge: 'Bra!'
      };
    } else if (savingsRate >= 5) {
      return {
        colorClass: 'text-amber-700',
        bgClass: 'bg-amber-50 border-amber-300',
        borderClass: 'border-amber-300',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        badge: 'På väg!'
      };
    } else if (savingsRate > 0) {
      return {
        colorClass: 'text-orange-700',
        bgClass: 'bg-orange-50 border-orange-300',
        borderClass: 'border-orange-300',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
        badge: 'Början!'
      };
    } else {
      return {
        colorClass: 'text-gray-700',
        bgClass: 'bg-gray-50 border-gray-300',
        borderClass: 'border-gray-300',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        badge: 'Kom igång'
      };
    }
  }, [savingsRate]);

  // Visa låst version om isLocked är true
  if (isLocked) {
    return (
      <Card className="relative overflow-visible border-0 shadow-lg opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
              <PiggyBank className="w-5 h-5 text-primary/60" />
            </div>
            <span>Ditt sparande</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-6 h-6" />
              <span className="text-lg font-medium">Lås upp på Nivå 1</span>
            </div>
            <p className="text-sm text-gray-600">
              För att se ditt sparande och beräkna framtida tillväxt behöver du först skapa ett hushåll med minst en person.
            </p>
            <Badge variant="secondary" className="text-xs">
              Baserat på din nettoförmögenhet
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card id="savings-card" className={`relative overflow-visible border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
        savingsRate >= 30 ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50' :
        savingsRate >= 20 ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50' :
        savingsRate >= 10 ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' :
        savingsRate >= 5 ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50' :
        savingsRate > 0 ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50' :
        'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
      }`}>
        {shouldShowSavingsNudge && (
          <div className="absolute top-4 right-4 z-30">
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-card px-3 py-2">
              <div className="relative group w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-help">
                <span className="text-primary">💡</span>
                <div className="pointer-events-none absolute right-0 top-9 hidden group-hover:block whitespace-normal break-words bg-white border border-slate-200/70 rounded-lg shadow-md text-[10px] text-primary/80 px-3 py-2 w-[320px] z-40">
                  Börja spara regelbundet och bygg upp likvida tillgångar – då blir 0,01%-potten mer användbar i vardagen. Små steg räcker för att komma igång.
                </div>
              </div>
              <span className="hidden sm:block text-xs font-medium text-primary">Tips</span>
              <button
                onClick={() => setShowISKGuide(true)}
                className="inline-flex items-center rounded-full bg-primary text-white px-3 py-1.5 text-xs shadow-sm hover:bg-primary/90 hover:shadow-md cursor-pointer"
              >
                Kom igång
              </button>
            </div>
          </div>
        )}
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow ${
                messageInfo.color === 'emerald' ? 'shadow-lg' : 'shadow'
              }`}>
                <messageInfo.icon className={`w-6 h-6 ${savingsRateInfo.colorClass}`} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Ditt sparande
                </CardTitle>
                <p className="text-xs text-gray-600 mt-0.5">
                  {messageInfo.title}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Nuvarande sparande */}
          <div className="text-center py-2">
            <div className={`text-4xl md:text-5xl font-extrabold mb-1 ${savingsRateInfo.colorClass} drop-shadow-sm`}>
              {formatCurrency(totalMonthlySavings)}
            </div>
            <p className="text-sm text-gray-600 mb-2">per månad</p>
            <p className="text-xs text-primary/60 mb-3">
              Månadsökningen består av amorteringar (som ökar din nettoförmögenhet) och annat sparande som registrerats i hushållet (exklusive pensionsavsättningar).
            </p>
            
            {/* Sparkvot */}
            <div className={`inline-block px-4 py-2 rounded-lg border-2 mb-3 ${savingsRateInfo.bgClass} ${savingsRateInfo.borderClass}`}>
              <p className="text-xs text-gray-600 mb-1">Sparkvot</p>
              <div className={`text-3xl font-bold ${savingsRateInfo.colorClass}`}>
                {savingsRate.toFixed(1)} %
              </div>
            <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${savingsRateInfo.badgeClass}`}>
                {savingsRateInfo.badge}
              </div>
            </div>

          {/* Progressbar borttagen enligt önskemål */}
        </div>

        {/* Disclaimer */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-primary/60 italic text-center">
            Sparkvotsbedömningarna är förenklade och baserade på allmän praxis — individuell situation kan variera.
          </p>
        </div>

          {/* Uppmuntring */}
          <div className={`${savingsRateInfo.bgClass} backdrop-blur-sm p-4 rounded-xl border-2 ${savingsRateInfo.borderClass} shadow-sm`}>
            <p className={`text-sm ${savingsRateInfo.colorClass} leading-relaxed text-center font-medium`}>
              {savingsRate === 0 
                ? messageInfo.encouragement
                : savingsRate < 5
                ? messageInfo.encouragement + ' Din sparkvot är ' + savingsRate.toFixed(1) + ' % – en målsättning på 10–20 % ger snabbare framsteg.'
                : messageInfo.encouragement
              }
            </p>
          </div>

          {/* CTA-knapp - alltid tydlig kontrast */}
          <Button
            onClick={() => router.push('/dashboard/savings')}
            variant="default"
            className="w-full font-semibold transition-all duration-300 shadow-card rounded-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Se ränta-på-ränta effekt
          </Button>
        </CardContent>
      </Card>

      {/* ISK-guide dialog */}
      <Dialog open={showISKGuide} onOpenChange={setShowISKGuide}>
        <DialogContent showCloseButton={true} className="sm:max-w-[720px] w-[95vw] h-[90vh] overflow-hidden p-0 rounded-2xl">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-t-2xl border-b border-slate-200/40">
            <div className="flex items-start justify-between">
              <DialogHeader className="gap-1">
                <DialogTitle className="text-2xl font-serif text-primary flex items-center gap-3">
                  <PiggyBank className="w-7 h-7 text-emerald-600" />
                  Kom igång med sparande (ISK och buffert)
                </DialogTitle>
                <p className="text-primary/70 mt-1 text-sm">
                  En enkel guide för att välja mellan fond (ISK) och sparkonto utifrån din tidshorisont – och hur du startar på några minuter.
                </p>
              </DialogHeader>
            </div>
          </div>
          {/* Scrollable body */}
          <div className="p-6 overflow-y-auto h-[calc(90vh-72px)] pb-24">
            <div className="space-y-6">
                <div className="bg-white/90 border border-slate-200/60 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-primary mb-2">Vad är ISK?</h4>
                  <p className="text-primary/80 mb-2">ISK är ett konto som i många informationskällor förklaras som anpassat för långsiktigt sparande. Skatten tas ut som en årlig schablon i stället för kapitalvinstskatt. Om ISK är lämpligt för dig beror på din totala ekonomi och dina mål.</p>
                  <p className="text-primary/70">Du kan öppna ISK hos din bank eller en nätbank. Hela processen tar oftast bara några minuter med BankID och du styr månadssparandet själv.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-bold text-green-900 mb-2">Fördelar</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Låg, förutsägbar skatt</li>
                      <li>• Ingen vinstskatt vid försäljning</li>
                      <li>• Enkelt att månadsspara</li>
                      <li>• Passar för sparande som inte behövs i närtid</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 className="font-bold text-purple-900 mb-2">Exempel på investeringar</h5>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Breda indexfonder (global/USA)</li>
                      <li>• Ev. komplettera med Sverige</li>
                      <li>• Låga avgifter kan vara viktigt – avgiften är en säker kostnad</li>
                    </ul>
                  </div>
                </div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Tidshorisont – fond eller sparkonto?</h4>
                  <p className="text-sm text-blue-900">Ett vanligt sätt att resonera i allmänna sparguider är att pengar som inte behövs i närtid ibland placeras i fonder via t.ex. ISK, medan pengar som kan behövas snart ofta ligger kvar på sparkonto. Vad som passar dig beror på din risknivå, buffert och tidshorisont.</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                  <h4 className="text-lg font-semibold text-amber-900 mb-2">Kom igång – 4 steg</h4>
                  <ol className="list-decimal ml-5 text-sm text-amber-900 space-y-1">
                    <li>Välj bank eller nätbank</li>
                    <li>Öppna ISK-konto – det går snabbt med BankID</li>
                    <li>Ställ in månadssparande</li>
                    <li>Som exempel nämns ofta i sparguider en global indexfond med låg avgift (t.ex. under 0,4 %) som ett alternativ för långsiktigt sparande. Detta är endast ett exempel och inte en rekommendation – välj själv det som passar din situation och risknivå.</li>
                  </ol>
                </div>
                <div className="bg-white/90 border border-slate-200/60 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-primary mb-2">Fondrobot – ett alternativ</h4>
                  <p className="text-primary/80 text-sm">En fondrobot kan vara ett sätt att komma igång om du vill ha automatisk fördelning och återbalansering. Titta på avgiften och välj ett paket som passar din situation och risknivå.</p>
                </div>
            </div>
          </div>
          {/* Disclaimer */}
          <div className="px-6 pt-4 pb-2 border-t border-slate-200/60 bg-white/95 backdrop-blur-sm">
            <p className="text-xs text-primary/60 italic text-center">
              Den här guiden beskriver vanliga sparformer på en generell nivå. Informationen är inte anpassad till din situation och ska inte ses som personlig finansiell rådgivning eller rekommendation att välja en viss bank, fond eller sparprodukt.
            </p>
          </div>
          {/* Footer docked inside dialog content */}
          <div className="px-6 pb-4 pt-3 bg-white/95 backdrop-blur-sm">
            <div className="flex gap-3">
              <button onClick={() => setShowISKGuide(false)} className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm">Stäng</button>
              <button onClick={() => { setShowISKGuide(false); router.push('/household'); }} className="flex-1 rounded-full bg-primary text-white px-4 py-2 text-sm">Lägg till sparande</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
