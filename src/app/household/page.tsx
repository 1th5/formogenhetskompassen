/**
 * Hushållsredigering - flikar för Personer, Tillgångar, Skulder
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { calculateNetWorth, getCurrentLevel } from '@/lib/wealth/calc';
import PersonForm from '@/components/household/PersonForm';
import AssetsForm from '@/components/household/AssetsForm';
import LiabilitiesForm from '@/components/household/LiabilitiesForm';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowLeft, Trash2, Wallet, TrendingDown, TrendingUp, Users, Coins, Landmark, FileEdit, AlertTriangle, Calculator, ExternalLink, CircleDollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function HouseholdPage() {
  const router = useRouter();
  const { draftHousehold, updatePersons, updateAssets, updateLiabilities, previousLevel, setPreviousLevel, setShouldAnimate, setCameFromOnboarding, clearDraft } = useHouseholdStore();
  const [activeTab, setActiveTab] = useState('assets');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  
  // Spara initial nettoförmögenhet när sidan öppnas för att kunna jämföra vid navigering
  const [initialNetWorth, setInitialNetWorth] = useState<number | null>(null);
  const [initialLevel, setInitialLevel] = useState<number | null>(null);
  
  // Kolla om det finns ett hushåll med minst en person
  const hasHousehold = draftHousehold && draftHousehold.persons && draftHousehold.persons.length > 0;
  
  // Spara initial värden när sidan laddas (bara första gången draftHousehold finns)
  useEffect(() => {
    if (draftHousehold && initialNetWorth === null) {
      const netWorth = calculateNetWorth(draftHousehold.assets || [], draftHousehold.liabilities || []);
      const level = getCurrentLevel(netWorth).level;
      setInitialNetWorth(netWorth);
      setInitialLevel(level);
    }
  }, [draftHousehold, initialNetWorth]);
  
  // Redirecta till dashboard om det inte finns något hushåll med minst en person
  useEffect(() => {
    if (!hasHousehold) {
      router.push('/dashboard');
    }
  }, [hasHousehold, router]);
  
  if (!hasHousehold) {
    return (
      <div className="min-h-screen bg-[var(--surface-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-primary/70">Laddar...</p>
        </div>
      </div>
    );
  }
  
  const handlePersonsUpdate = (data: any) => {
    // Spara nuvarande nivå och nettoförmögenhet FÖRE uppdateringen
    const currentBefore = useHouseholdStore.getState().draftHousehold;
    const prevLevelBefore = currentBefore ? (() => {
      const netWorth = calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []);
      return getCurrentLevel(netWorth).level;
    })() : 0;
    const prevNetWorthBefore = currentBefore ? calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []) : 0;
    
    updatePersons(data.persons);
    triggerAnimationIfNeeded(prevLevelBefore, prevNetWorthBefore);
  };
  
  const handleAssetsUpdate = (assets: any[]) => {
    // Spara nuvarande nivå och nettoförmögenhet FÖRE uppdateringen
    const currentBefore = useHouseholdStore.getState().draftHousehold;
    const prevLevelBefore = currentBefore ? (() => {
      const netWorth = calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []);
      return getCurrentLevel(netWorth).level;
    })() : 0;
    const prevNetWorthBefore = currentBefore ? calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []) : 0;
    
    updateAssets(assets);
    triggerAnimationIfNeeded(prevLevelBefore, prevNetWorthBefore);
  };
  
  const handleLiabilitiesUpdate = (liabilities: any[]) => {
    // Spara nuvarande nivå och nettoförmögenhet FÖRE uppdateringen
    const currentBefore = useHouseholdStore.getState().draftHousehold;
    const prevLevelBefore = currentBefore ? (() => {
      const netWorth = calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []);
      return getCurrentLevel(netWorth).level;
    })() : 0;
    const prevNetWorthBefore = currentBefore ? calculateNetWorth(currentBefore.assets || [], currentBefore.liabilities || []) : 0;
    
    updateLiabilities(liabilities);
    triggerAnimationIfNeeded(prevLevelBefore, prevNetWorthBefore);
  };
  
  const triggerAnimationIfNeeded = (prevLevelBefore: number, prevNetWorthBefore: number) => {
    // Vänta lite så att store hinner uppdateras
    setTimeout(() => {
      const current = useHouseholdStore.getState().draftHousehold;
      if (current) {
        const netWorth = calculateNetWorth(current.assets || [], current.liabilities || []);
        const newLevel = getCurrentLevel(netWorth).level;
        
        // Trigga animation om nivån ändrats ELLER om nettoförmögenheten ändrats signifikant (>100 kr)
        if (prevLevelBefore !== newLevel || Math.abs(prevNetWorthBefore - netWorth) > 100) {
          setPreviousLevel(prevLevelBefore);
          setShouldAnimate(true);
          setCameFromOnboarding(false);
        }
      }
    }, 100);
  };

  const handleDeleteHousehold = () => {
    clearDraft();
    setPreviousLevel(0);
    setShouldAnimate(false);
    setShowDeleteDialog(false);
    router.push('/dashboard');
  };

  const handleBackToDashboard = () => {
    // Kontrollera om något har ändrats innan navigering
    const current = useHouseholdStore.getState().draftHousehold;
    if (current) {
      const netWorth = calculateNetWorth(current.assets || [], current.liabilities || []);
      const currentLevel = getCurrentLevel(netWorth).level;
      
      // Jämför med initiala värden från när sidan öppnades
      if (initialNetWorth !== null && initialLevel !== null) {
        const levelChanged = initialLevel !== currentLevel;
        const netWorthChanged = Math.abs(initialNetWorth - netWorth) > 100;
        
        if (levelChanged || netWorthChanged) {
          setPreviousLevel(initialLevel);
          setShouldAnimate(true);
          setCameFromOnboarding(false);
        } else {
          // Inget har ändrats, sätt current level så animation inte triggas
          setPreviousLevel(currentLevel);
        }
      } else {
        // Fallback om initiala värden inte är sparade
        setPreviousLevel(currentLevel);
      }
    }
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-[var(--surface-bg)]">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-6xl">
        {/* Header med gradient och ikoner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-6 sm:p-8 mb-6 sm:mb-8 border border-primary/10">
          {/* Dekorativa bakgrundselement */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/5 to-primary/10 rounded-full -ml-12 -mb-12 blur-xl opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm flex-shrink-0">
                  <FileEdit className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary mb-2">Redigera hushåll</h1>
                  <p className="text-sm sm:text-base text-primary/70 max-w-2xl">
                    Uppdatera tillgångar, skulder och personuppgifter för att se din aktuella förmögenhetsbild
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                <Button 
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Ta bort hushåll
                </Button>
                <Button 
                  onClick={handleBackToDashboard}
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka till översikt
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Flikar med förbättrad design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-white/60 backdrop-blur-sm border border-primary/10 rounded-xl p-1.5 shadow-sm">
            <TabsTrigger 
              value="assets" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm py-3 px-2 sm:px-4 rounded-lg transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Tillgångar</span>
              <span className="sm:hidden">Tillg.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="liabilities" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm py-3 px-2 sm:px-4 rounded-lg transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-50 data-[state=active]:to-orange-50 data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
            >
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Skulder</span>
              <span className="sm:hidden">Skulder</span>
            </TabsTrigger>
            <TabsTrigger 
              value="persons" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm py-3 px-2 sm:px-4 rounded-lg transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-50 data-[state=active]:to-teal-50 data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Personer</span>
              <span className="sm:hidden">Pers.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-0">
            <Card className="border border-primary/10 shadow-card bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100/50">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif text-primary">Tillgångar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AssetsForm
                  assets={draftHousehold.assets}
                  onUpdate={handleAssetsUpdate}
                  liabilities={draftHousehold.liabilities}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="liabilities" className="mt-0">
            <Card className="border border-primary/10 shadow-card bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-red-50/50 via-white to-orange-50/50 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100/50">
                    <Landmark className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif text-primary">Skulder</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Varningar för lån vs tillgångar */}
                {(() => {
                  const housingAssets = (draftHousehold.assets || []).filter(
                    a => a.category === 'Bostad' || a.category === 'Semesterbostad'
                  ).reduce((sum, a) => sum + a.value, 0);
                  const housingLoans = (draftHousehold.liabilities || [])
                    .filter(l => l.liability_type === 'Bostadslån')
                    .reduce((sum, l) => sum + l.principal, 0);
                  const carAssets = (draftHousehold.assets || []).filter(
                    a => a.category === 'Bil'
                  ).reduce((sum, a) => sum + a.value, 0);
                  const carLoans = (draftHousehold.liabilities || [])
                    .filter(l => l.liability_type === 'Billån')
                    .reduce((sum, l) => sum + l.principal, 0);
                  
                  const housingWarning = housingLoans > housingAssets;
                  const carWarning = carLoans > carAssets;
                  
                  if (housingWarning || carWarning) {
                    return (
                      <div className="mb-6 space-y-3">
                        {housingWarning && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900 mb-1">
                                Varning: Bostadslån överstiger bostadstillgångar
                              </p>
                              <p className="text-xs text-yellow-700">
                                Dina bostadslån ({formatCurrency(housingLoans)}) är större än dina bostadstillgångar ({formatCurrency(housingAssets)}). 
                                Kontrollera att alla bostadslån är korrekt kategoriserade och att alla bostadstillgångar är registrerade.
                              </p>
                            </div>
                          </div>
                        )}
                        {carWarning && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900 mb-1">
                                Varning: Billån överstiger bilstillgångar
                              </p>
                              <p className="text-xs text-yellow-700">
                                Dina billån ({formatCurrency(carLoans)}) är större än dina bilstillgångar ({formatCurrency(carAssets)}). 
                                Kontrollera att alla billån är korrekt kategoriserade och att alla bilstillgångar är registrerade.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
                <LiabilitiesForm
                  liabilities={draftHousehold.liabilities}
                  onUpdate={handleLiabilitiesUpdate}
                  assets={draftHousehold.assets}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="persons" className="mt-0">
            <Card className="border border-primary/10 shadow-card bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/50 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100/50">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-xl font-serif text-primary">Personer som bidrar med avsättning från inkomst</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <PersonForm
                  onSave={handlePersonsUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Externa verktyg */}
        <Card className="mt-6 sm:mt-8 border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-200/60">
                <Calculator className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-sm sm:text-base text-slate-700 mb-1">Ytterligare kalkylatorer</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ytterligare verktyg som kan vara användbara, oberoende av Förmögenhetskollen
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
                onClick={() => router.push('/salary')}
                className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded bg-purple-50">
                    <CircleDollarSign className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Lönekalkylator</div>
                    <div className="text-xs text-slate-500 truncate">Efter skatt</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto p-0">
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-100 p-4 sm:p-6 border-b border-red-200/50">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-full bg-red-100 shadow-sm">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                </div>
                <DialogTitle className="font-serif text-red-900 text-lg sm:text-xl">
                  Ta bort hushåll
                </DialogTitle>
              </div>
              <DialogDescription className="text-red-800 text-sm sm:text-base leading-relaxed">
                Detta kommer att radera all hushållsdata permanent. Denna åtgärd kan inte ångras.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2 text-sm text-slate-700">
                  <p className="font-medium">Följande kommer att raderas:</p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    <li>Alla personer och deras inkomster</li>
                    <li>Alla tillgångar (pension, aktier, fonder, etc.)</li>
                    <li>Alla lån och skulder</li>
                    <li>All ekonomisk historik</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteHousehold}
                className="w-full sm:w-auto flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <Trash2 className="w-4 h-4" />
                Ja, ta bort permanent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
