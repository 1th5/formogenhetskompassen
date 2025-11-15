'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateJobNetIncome } from '@/lib/wealth/tax-calc';
import { calculatePublicPension, calculateOccupationalPensionForIncome, calculateIncomePension, calculatePremiePension } from '@/lib/wealth/calc';
import { formatCurrency } from '@/lib/utils/format';
import { PensionType, Income } from '@/lib/types';
import { Calculator, AlertCircle, RotateCcw, TrendingUp, Wallet, ExternalLink, Home } from 'lucide-react';
import PensionWizardInline from '@/components/household/PensionWizardInline';

export default function SalaryCalculatorPage() {
  const router = useRouter();
  const [grossSalary, setGrossSalary] = useState<string>('');
  const [netSalary, setNetSalary] = useState<number | null>(null);
  const [showPension, setShowPension] = useState(false);
  const [age, setAge] = useState<string>('');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [pensionType, setPensionType] = useState<PensionType | null>(null);
  const [showPensionWizard, setShowPensionWizard] = useState(false);
  const [customTpRate, setCustomTpRate] = useState<string>('4.5');
  const [customTpInputType, setCustomTpInputType] = useState<'percentage' | 'amount'>('percentage');

  const handleGrossSalaryChange = (value: string) => {
    setGrossSalary(value);
    const numValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(numValue) && numValue > 0) {
      const net = calculateJobNetIncome(numValue);
      setNetSalary(net);
    } else {
      setNetSalary(null);
    }
  };

  const handleCalculatePension = () => {
    if (!age || !netSalary || !grossSalary) return;
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) return;
    const currentYear = new Date().getFullYear();
    const birthYearNum = currentYear - ageNum;
    setBirthYear(birthYearNum);
    setShowPensionWizard(true);
  };

  const handlePensionSelected = (selectedPensionType: PensionType) => {
    setPensionType(selectedPensionType);
    setShowPensionWizard(false);
  };

  const handleSkipPensionWizard = () => {
    setPensionType('Annat');
    setShowPensionWizard(false);
  };

  const handleReset = () => {
    setGrossSalary('');
    setNetSalary(null);
    setShowPension(false);
    setAge('');
    setBirthYear(null);
    setPensionType(null);
    setShowPensionWizard(false);
    setCustomTpRate('4.5');
    setCustomTpInputType('percentage');
  };

  // Beräkna pensionsavsättningar
  const incomePension = pensionType && grossSalary && netSalary
    ? (() => {
        const monthlyIncome = parseFloat(grossSalary.replace(/\s/g, '').replace(',', '.'));
        // Skapa en mock person med en jobb-inkomst för att använda calculateIncomePension
        const mockPerson = {
          name: 'Person',
          birth_year: birthYear || new Date().getFullYear() - 30,
          other_savings_monthly: 0,
          incomes: [{
            income_type: 'job' as const,
            monthly_income: monthlyIncome,
            pension_type: pensionType,
          }] as Income[],
        };
        return calculateIncomePension(mockPerson);
      })()
    : null;

  const premiePension = pensionType && grossSalary && netSalary
    ? (() => {
        const monthlyIncome = parseFloat(grossSalary.replace(/\s/g, '').replace(',', '.'));
        // Skapa en mock person med en jobb-inkomst för att använda calculatePremiePension
        const mockPerson = {
          name: 'Person',
          birth_year: birthYear || new Date().getFullYear() - 30,
          other_savings_monthly: 0,
          incomes: [{
            income_type: 'job' as const,
            monthly_income: monthlyIncome,
            pension_type: pensionType,
          }] as Income[],
        };
        return calculatePremiePension(mockPerson);
      })()
    : null;

  const totalPublicPension = (incomePension || 0) + (premiePension || 0);

  const occupationalPension = pensionType && grossSalary
    ? (() => {
        const monthlyIncome = parseFloat(grossSalary.replace(/\s/g, '').replace(',', '.'));
        const mockIncome: Income = {
          label: 'Lön',
          income_type: 'job',
          monthly_income: monthlyIncome,
          pension_type: pensionType,
          tp_input_type: pensionType === 'Annat' ? customTpInputType : undefined,
          custom_tp_rate: pensionType === 'Annat' && customTpInputType === 'percentage' 
            ? parseFloat(customTpRate) / 100 
            : undefined,
          custom_tp_amount: pensionType === 'Annat' && customTpInputType === 'amount'
            ? parseFloat(customTpRate.replace(/\s/g, '').replace(',', '.'))
            : undefined,
        };
        return calculateOccupationalPensionForIncome(mockIncome);
      })()
    : null;

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
              Lön efter skatt & pension
            </h1>
          </div>
          <p className="text-primary/70 text-sm sm:text-base max-w-2xl mx-auto">
            Räkna ut din nettolön och se uppskattade pensionsavsättningar. En enkel kalkylator som visar hur mycket du får ut efter skatt och hur mycket som sätts av till framtida pension.
          </p>
          <p className="text-xs text-primary/60 mt-2 italic max-w-2xl mx-auto">
            Observera: Denna kalkylator visar förenklade simuleringar baserade på dina inmatade antaganden. Resultaten är inte en prognos, garanti eller personlig ekonomisk rådgivning.
          </p>
        </div>

        {/* Info Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary/60 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary/80">
                <p className="font-medium mb-1">Viktigt att veta:</p>
                <p>Denna kalkylator ger en <strong>ungefärlig och förenklad</strong> beräkning. Den exakta skatten kan variera beroende på dina personliga omständigheter, kommun, eventuella skattereduktioner och andra faktorer. Använd resultatet som en vägledning, inte som en garanti eller personlig skatte- eller pensionsrådgivning.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-primary text-xl">Räkna ut din lön</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bruttolön Input */}
            <div>
              <Label htmlFor="gross-salary" className="text-base font-medium text-primary mb-2 block">
                Bruttolön per månad (kr, efter löneväxling)
              </Label>
              <Input
                id="gross-salary"
                type="text"
                value={grossSalary}
                onChange={(e) => handleGrossSalaryChange(e.target.value)}
                placeholder="30 000"
                className="text-lg"
              />
              <p className="text-xs text-primary/60 mt-1">
                Ange din bruttolön efter eventuell löneväxling (före skatt). Om du har löneväxling, dra av den från bruttolönen.
              </p>
            </div>

            {/* Netto Result */}
            {netSalary !== null && (
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-primary">Din nettolön per månad</Label>
                  <span className="text-3xl font-bold text-green-700">
                    {formatCurrency(netSalary)}
                  </span>
                </div>
                <p className="text-xs text-primary/70 mt-2">
                  Detta är en ungefärlig beräkning. Din faktiska nettolön kan variera.
                </p>
              </div>
            )}

            {/* Pension Section */}
            {netSalary !== null && (
              <div className="pt-6 border-t border-slate-200">
                {!showPension ? (
                  <Button
                    onClick={() => setShowPension(true)}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    Räkna ut pensionsavsättningar
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="age" className="text-base font-medium text-primary mb-2 block">
                        Din ålder
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        min="0"
                        max="120"
                        className="w-32"
                      />
                      <p className="text-xs text-primary/60 mt-1">
                        Ange din ålder för att bestämma rätt pensionsavtal
                      </p>
                    </div>

                    {age && parseInt(age) > 0 && !showPensionWizard && !pensionType && (
                      <Button
                        onClick={handleCalculatePension}
                        variant="default"
                        className="w-full sm:w-auto"
                      >
                        Välj pensionsavtal
                      </Button>
                    )}

                    {/* Inline Pension Guide */}
                    {showPensionWizard && birthYear && netSalary && (
                      <Card className="mt-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
                        <PensionWizardInline
                          birthYear={birthYear}
                          monthlyIncome={parseFloat(grossSalary.replace(/\s/g, '').replace(',', '.'))}
                          onSelectPension={handlePensionSelected}
                          onSkip={handleSkipPensionWizard}
                        />
                      </Card>
                    )}

                    {/* Custom TP Input for "Annat" */}
                    {pensionType === 'Annat' && (
                      <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <Label className="text-sm font-medium text-primary block mb-2">
                            Ange ditt tjänstepensionsavtal
                          </Label>
                          <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={customTpInputType === 'percentage'}
                                onChange={() => setCustomTpInputType('percentage')}
                                className="text-primary"
                              />
                              <span className="text-sm text-primary">Procent av lönen</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={customTpInputType === 'amount'}
                                onChange={() => setCustomTpInputType('amount')}
                                className="text-primary"
                              />
                              <span className="text-sm text-primary">Fast belopp</span>
                            </label>
                          </div>
                          <Input
                            type="text"
                            value={customTpRate}
                            onChange={(e) => setCustomTpRate(e.target.value)}
                            placeholder={customTpInputType === 'percentage' ? '4.5' : '2000'}
                            className="w-32"
                          />
                          <p className="text-xs text-primary/60 mt-1">
                            {customTpInputType === 'percentage' 
                              ? 'Ange procent (t.ex. 4.5 för 4,5%)' 
                              : 'Ange månadsbelopp i kr'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pension Results */}
                    {pensionType && incomePension !== null && premiePension !== null && occupationalPension !== null && 
                     (pensionType !== 'Annat' || (customTpRate && customTpRate.trim() !== '')) && (
                      <div className="mt-6 space-y-6">
                        {/* Header with reset button */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-serif font-semibold text-primary">Dina pensionsavsättningar</h3>
                          <Button
                            onClick={handleReset}
                            variant="secondary"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Kör om
                          </Button>
                        </div>

                        {/* Allmän pension section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1 w-8 bg-blue-500 rounded"></div>
                            <h4 className="text-base font-semibold text-primary">Allmän pension (statlig)</h4>
                          </div>
                          <p className="text-sm text-primary/70 mb-4">
                            Allmän pension är obligatorisk och dras automatiskt från din lön. Den består av två delar:
                          </p>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <Label className="text-sm font-semibold text-primary">
                                  Inkomstpension
                                </Label>
                                <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded">
                                  Trygghetsbaserad
                                </span>
                              </div>
                              <div className="text-3xl font-bold text-blue-700 mb-2">
                                {formatCurrency(incomePension)}
                              </div>
                              <p className="text-xs text-primary/70 leading-relaxed">
                                16% av din pensionsgrundande inkomst. Beloppet gäller upp till det så kallade PGI-taket (8,07 inkomstbasbelopp). Inkomst över taket ger inte extra inkomstpension. Denna del följer inkomstindex och justeras med balansindex vid behov. Den är mindre direkt marknadsberoende än premiepensionen, men framtida utveckling kan ändå bli både bättre och sämre än idag.
                              </p>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <Label className="text-sm font-semibold text-primary">
                                  Premiepension
                                </Label>
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-200 px-2 py-1 rounded">
                                  Marknadsbaserad
                                </span>
                              </div>
                              <div className="text-3xl font-bold text-indigo-700 mb-2">
                                {formatCurrency(premiePension)}
                              </div>
                              <p className="text-xs text-primary/70 leading-relaxed">
                                2,5% av din pensionsgrundande inkomst. Beloppet gäller upp till det så kallade PGI-taket (8,07 inkomstbasbelopp). Inkomst över taket ger inte extra premiepension. Denna del placeras i fonder som följer marknaden. Värdet kan både stiga och sjunka över tid beroende på hur marknaden utvecklas.
                              </p>
                            </div>
                          </div>

                          <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-base font-semibold text-primary">
                                Total allmän pension
                              </Label>
                              <span className="text-xs text-primary/60 bg-white/50 px-2 py-1 rounded">
                                18,5% totalt
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-blue-800">
                              {formatCurrency(totalPublicPension)}
                            </div>
                            <p className="text-xs text-primary/70 mt-2">
                              Detta är din totala månatliga avsättning till allmän pension. Beloppet är begränsat upp till 8,07 gånger inkomstbasbeloppet (IBB).
                            </p>
                          </div>
                        </div>

                        {/* Tjänstepension section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1 w-8 bg-purple-500 rounded"></div>
                            <h4 className="text-base font-semibold text-primary">Tjänstepension</h4>
                          </div>
                          <p className="text-sm text-primary/70 mb-4">
                            Tjänstepension är en extra pension som betalas utöver allmän pension, baserat på ditt kollektivavtal eller individuella avtal.
                          </p>
                          
                          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <Label className="text-base font-semibold text-primary">
                                Tjänstepension per månad
                              </Label>
                              <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded">
                                {pensionType === 'ITP1' ? 'ITP1' : 
                                pensionType === 'ITP2' ? 'ITP2' : 
                                pensionType === 'SAF-LO' ? 'SAF-LO' : 
                                pensionType === 'AKAP-KR' ? 'AKAP-KR' : 
                                pensionType === 'PA16' ? 'PA16' : 'Eget avtal'}
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-purple-700 mb-2">
                              {formatCurrency(occupationalPension)}
                            </div>
                            <p className="text-xs text-primary/70 leading-relaxed">
                              Baserat på ditt valda pensionsavtal. Tjänstepensionen betalas normalt av din arbetsgivare och baseras på din lön. Här visas en uppskattad månadsavsättning till tjänstepension.
                              {pensionType === 'ITP2' && (
                                <span className="block mt-1 italic">
                                  (ITP2 är förmånsbestämd och bygger inte på procent av lönen, men här visas en uppskattad månadsavsättning motsvarande dess värde omräknat till premiebaserad form.)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Total summary */}
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 shadow-md">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-lg font-semibold text-primary">
                              Total pensionsavsättning per månad
                            </Label>
                          </div>
                          <div className="text-4xl font-bold text-green-800 mb-3">
                            {formatCurrency(totalPublicPension + occupationalPension)}
                          </div>
                          <p className="text-sm text-primary/70 leading-relaxed">
                            Detta är den totala uppskattade pensionsavsättningen per månad, baserad på din lön och ditt pensionsavtal (allmän pension och tjänstepension). Beloppen dras inte direkt från din nettolön, utan visar hur mycket som sätts av till framtida pension.
                          </p>
                          {netSalary && (
                            <div className="mt-4 pt-4 border-t border-green-300 space-y-2">
                              <p className="text-xs text-primary/70">
                                <strong>Efter skatt:</strong> Du får ut cirka <strong className="text-green-800">{formatCurrency(netSalary)}</strong> per månad.
                              </p>
                              <p className="text-xs text-primary/70">
                                Pensionsavsättning per månad (allmän pension + tjänstepension): <strong className="text-green-800">{formatCurrency(totalPublicPension + occupationalPension)}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Promotion Banner */}
        <Card className="mt-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                  Vill du se hur din lön och pension påverkar din totala förmögenhet?
                </h3>
                <p className="text-sm text-primary/80 mb-4">
                  Med <strong>Förmögenhetskollen</strong> kan du koppla ihop din lön, dina pensionsavsättningar och ditt sparande med hela hushållets ekonomi. Du ser hur mycket som sätts av till pension, hur det påverkar din framtida nettoförmögenhet och vilken nivå du ligger på i Rikedomstrappan.
                </p>
                <ul className="text-sm text-primary/80 space-y-1 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Se en beräknad nettoförmögenhet för hela hushållet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Få överblick över pensionstillgångar och sparande</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Följ hur din ekonomi utvecklas månad för månad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary/80 mr-2">✓</span>
                    <span>Helt gratis, ingen inloggning – allt sparas lokalt</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="default"
                size="lg"
                className="w-full md:w-auto flex-shrink-0 bg-primary text-white hover:bg-primary/90"
              >
                Testa Förmögenhetskollen
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Ytterligare verktyg */}
        <div className="mt-8 mb-6">
          <div className="border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-200/60">
                <Calculator className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-sm sm:text-base text-slate-700 mb-1">Ytterligare verktyg</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ytterligare kalkylatorer som kan vara användbara
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/fire')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-blue-50">
                    <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">FIRE-kalkylator</div>
                    <div className="text-xs text-slate-500 truncate">Ekonomisk frihet</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/savings')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-green-50">
                    <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Sparkalkylator</div>
                    <div className="text-xs text-slate-500 truncate">Ränta på ränta</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-blue-50">
                    <Home className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Förmögenhetskollen</div>
                    <div className="text-xs text-slate-500 truncate">Dashboard</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

