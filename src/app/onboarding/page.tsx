/**
 * Ny onboarding - Förbättrad struktur med storytelling och micro-insights
 * Ny ordning: Välkommen → Personer → Inkomst → Pension → Tillgångar → Skulder → Sammanfattning
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { Asset, Liability, Person } from '@/lib/types';
import WelcomeStep from '@/components/onboarding/new/WelcomeStep';
import PersonsWizardStep from '@/components/onboarding/new/PersonsWizardStep';
import PensionPerPersonStep from '@/components/onboarding/new/PensionPerPersonStep';
import SavingsInvestmentWizardStep from '@/components/onboarding/new/SavingsInvestmentWizardStep';
import HousingWizardStep from '@/components/onboarding/new/HousingWizardStep';
import OtherInvestmentsWizardStep from '@/components/onboarding/new/OtherInvestmentsWizardStep';
import LiabilitiesWizardStep from '@/components/onboarding/new/LiabilitiesWizardStep';
import SummaryStep from '@/components/onboarding/new/SummaryStep';
import OnboardingSectionProgress from '@/components/onboarding/OnboardingSectionProgress';
import SpecificLiabilityWizardStep from '@/components/onboarding/new/SpecificLiabilityWizardStep';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Lightbulb } from 'lucide-react';

type WizardSection = 
  | 'welcome'
  | 'persons'
  | 'income' // Inkomst & avtal per person (hanteras i PersonsWizardStep)
  | 'pension-per-person'
  | 'savings-investments' 
  | 'housing' 
  | 'housing-loan'
  | 'other-investments' 
  | 'car-loan'
  | 'liabilities' 
  | 'summary';

const TOTAL_STEPS = 8; // welcome, persons, pension-per-person, savings-investments, housing, other-investments, liabilities, summary

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboardingData } = useHouseholdStore();
  
  // State för samlad data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [pensionAssets, setPensionAssets] = useState<Asset[]>([]);
  
  // State för wizard-navigation
  const [currentSection, setCurrentSection] = useState<WizardSection>('welcome');
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  // Mappa steg till sektioner för progress-tracking
  const getSectionForStep = (step: WizardSection): 'people' | 'assets' | 'debts' => {
    if (step === 'welcome' || step === 'persons' || step === 'pension-per-person') {
      return 'people';
    }
    if (step === 'savings-investments' || step === 'housing' || step === 'housing-loan' || 
        step === 'other-investments' || step === 'car-loan') {
      return 'assets';
    }
    return 'debts';
  };
  
  // Kolla om vi lämnar en sektion när vi går framåt
  const checkAndMarkSectionComplete = (previousStep: WizardSection, newStep: WizardSection) => {
    const previousSection = getSectionForStep(previousStep);
    const newSection = getSectionForStep(newStep);
    
    // Om vi går från en sektion till en annan, markera den förra som klar
    if (previousSection !== newSection) {
      setCompletedSections(prev => {
        if (!prev.includes(previousSection)) {
          return [...prev, previousSection];
        }
        return prev;
      });
    }
  };
  
  // Wrapper för setCurrentSection som också kollar completion
  const setCurrentSectionWithTracking = (newSection: WizardSection) => {
    const previousSection = currentSection;
    checkAndMarkSectionComplete(previousSection, newSection);
    setCurrentSection(newSection);
  };
  
  // Håll koll på senaste tillgången för att kunna visa specifika lån
  const [lastHousingAsset, setLastHousingAsset] = useState<Asset | null>(null);
  const [lastCarAsset, setLastCarAsset] = useState<Asset | null>(null);
  
  // Progress calculation
  const getProgress = () => {
    const sectionOrder: WizardSection[] = [
      'welcome',
      'persons',
      'pension-per-person',
      'savings-investments',
      'housing',
      'other-investments',
      'liabilities',
      'summary'
    ];
    const currentIndex = sectionOrder.indexOf(currentSection);
    
    // Justera för substeg
    if (currentSection === 'housing-loan') {
      return (sectionOrder.indexOf('housing') + 1.5) / TOTAL_STEPS * 100;
    }
    if (currentSection === 'car-loan') {
      return (sectionOrder.indexOf('other-investments') + 1.5) / TOTAL_STEPS * 100;
    }
    
    if (currentIndex === -1) {
      return 0;
    }
    
    return ((currentIndex + 1) / TOTAL_STEPS) * 100;
  };
  
  const getStepNumber = () => {
    const sectionOrder: WizardSection[] = [
      'welcome',
      'persons',
      'pension-per-person',
      'savings-investments',
      'housing',
      'other-investments',
      'liabilities',
      'summary'
    ];
    const currentIndex = sectionOrder.indexOf(currentSection);
    
    if (currentIndex === -1) {
      // För substeg som inte finns i huvudordningen
      if (currentSection === 'housing-loan') {
        return sectionOrder.indexOf('housing') + 1;
      }
      if (currentSection === 'car-loan') {
        return sectionOrder.indexOf('other-investments') + 1;
      }
      return 0;
    }
    
    return currentIndex + 1;
  };
  
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'welcome': return 'Välkommen';
      case 'persons': return 'Personer';
      case 'income': return 'Inkomst & avtal';
      case 'pension-per-person': return 'Pensionstillgångar';
      case 'savings-investments': return 'Spar och investeringar';
      case 'housing': return 'Boende';
      case 'housing-loan': return 'Bostadslån';
      case 'other-investments': return 'Övriga tillgångar';
      case 'car-loan': return 'Billån';
      case 'liabilities': return 'Övriga lån och skulder';
      case 'summary': return 'Sammanfattning';
      default: return '';
    }
  };

  // Handlers
  const handleWelcomeNext = () => {
    setCurrentSectionWithTracking('persons');
  };

  const handlePersonsComplete = (newPersons: Person[]) => {
    setPersons(newPersons);
    if (newPersons.length > 0) {
      setCurrentPersonIndex(0);
      setCurrentSectionWithTracking('pension-per-person');
    }
  };

  const handlePensionPerPersonComplete = (newPensionAssets: Asset[]) => {
    // Uppdatera pensionAssets med de nya (ta bort gamla för samma person om de finns)
    setPensionAssets(prev => {
      const currentPerson = persons[currentPersonIndex];
      const personLabel = currentPerson.name || `Person ${currentPersonIndex + 1}`;
      
      // Ta bort alla pensionsassets för denna person
      const filtered = prev.filter(a => !a.label.includes(personLabel));
      
      // Lägg till de nya
      return [...filtered, ...newPensionAssets];
    });
    
    // Om det finns fler personer, gå till nästa person
    if (currentPersonIndex < persons.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    } else {
      // Alla personer är klara, gå till tillgångar
      // PensionAssets är redan uppdaterade i state, så vi behöver bara gå vidare
      setCurrentSectionWithTracking('savings-investments');
    }
  };

  const handlePensionNextPerson = () => {
    if (currentPersonIndex < persons.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    }
  };

  const handleSavingsInvestmentComplete = (newAssets: Asset[]) => {
    setAssets(prev => [...prev, ...newAssets]);
    setCurrentSectionWithTracking('housing');
  };
  
  const handleHousingComplete = (housingAsset: Asset | null) => {
    if (housingAsset) {
      setAssets(prev => [...prev, housingAsset]);
      setLastHousingAsset(housingAsset);
      setCurrentSectionWithTracking('housing-loan');
    } else {
      setCurrentSectionWithTracking('other-investments');
    }
  };
  
  const handleHousingLoanComplete = (liability: Liability | null) => {
    if (liability) {
      setLiabilities(prev => [...prev, liability]);
    }
    setCurrentSectionWithTracking('other-investments');
  };
  
  const handleOtherInvestmentsComplete = (newAssets: Asset[]) => {
    setAssets(prev => {
      const updated = [...prev, ...newAssets];
      const carAssets = newAssets.filter(a => a.category === 'Bil');
      if (carAssets.length > 0) {
        setLastCarAsset(carAssets[carAssets.length - 1]);
        setCurrentSectionWithTracking('car-loan');
      } else {
        setCurrentSectionWithTracking('liabilities');
      }
      return updated;
    });
  };
  
  const handleCarLoanComplete = (liability: Liability | null) => {
    if (liability) {
      setLiabilities(prev => [...prev, liability]);
    }
    setCurrentSectionWithTracking('liabilities');
  };
  
  const handleLiabilitiesComplete = (newLiabilities: Liability[]) => {
    setLiabilities(prev => [...prev, ...newLiabilities]);
    // Markera debts-sektionen som klar när vi går till summary
    setCompletedSections(prev => {
      if (!prev.includes('debts')) {
        return [...prev, 'debts'];
      }
      return prev;
    });
    setCurrentSection('summary');
  };

  const handleSummaryComplete = () => {
    // Spara all data och gå till dashboard
    // Kombinera alla assets (inklusive pensionsassets)
    const allAssets = [...assets, ...pensionAssets];
    
    setOnboardingData({
      persons,
      assets: allAssets,
      liabilities
    });
    
    // Sätt flaggor för animation
    const { setPreviousLevel, setShouldAnimate, setCameFromOnboarding } = useHouseholdStore.getState();
    setPreviousLevel(0);
    setShouldAnimate(true);
    setCameFromOnboarding(true);
    
    // Scrolla till toppen innan navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    router.push('/dashboard');
    
    // Säkerställ att vi scrollar till toppen efter navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSkipSection = () => {
    const nextSection: Record<WizardSection, WizardSection> = {
      'welcome': 'persons',
      'persons': 'pension-per-person',
      'income': 'pension-per-person',
      'pension-per-person': 'savings-investments',
      'savings-investments': 'housing',
      'housing': 'other-investments',
      'housing-loan': 'other-investments',
      'other-investments': 'liabilities',
      'car-loan': 'liabilities',
      'liabilities': 'summary',
      'summary': 'summary'
    };
    
    // Om vi hoppar över liabilities, markera debts-sektionen som klar
    if (currentSection === 'liabilities') {
      setCompletedSections(prev => {
        if (!prev.includes('debts')) {
          return [...prev, 'debts'];
        }
        return prev;
      });
    }
    
    setCurrentSectionWithTracking(nextSection[currentSection]);
  };
  
  const goToPreviousSection = () => {
    if (currentSection === 'housing-loan') {
      setCurrentSection('housing');
      return;
    }
    if (currentSection === 'car-loan') {
      setCurrentSection('other-investments');
      return;
    }
    if (currentSection === 'pension-per-person') {
      if (currentPersonIndex > 0) {
        setCurrentPersonIndex(currentPersonIndex - 1);
      } else {
        setCurrentSection('persons');
      }
      return;
    }
    
    const sectionOrder: WizardSection[] = [
      'welcome',
      'persons',
      'pension-per-person',
      'savings-investments',
      'housing',
      'other-investments',
      'liabilities',
      'summary'
    ];
    const currentIndex = sectionOrder.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sectionOrder[currentIndex - 1]);
    }
  };
  
  const canGoBack = () => {
    return currentSection !== 'welcome';
  };

  const renderMicroInsight = (insight: string | React.ReactNode, icon?: React.ReactNode) => (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {icon || <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
          {typeof insight === 'string' ? (
            <p className="text-sm text-primary/80">{insight}</p>
          ) : (
            <div className="flex-1">{insight}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-4 md:py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center justify-center mb-4 md:mb-6">
            <img 
              src="/design/app-icon-bw-1.png" 
              alt="Förmögenhetskollen logotyp" 
              className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              style={{ 
                mixBlendMode: 'darken'
              }}
            />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary mb-1">
            Förmögenhetskollen
          </h1>
          <p className="font-sans text-sm md:text-base text-primary/70">
            Låt oss bygga din ekonomiska karta tillsammans
          </p>
        </div>
        
        {/* Section Progress */}
        {currentSection !== 'welcome' && (
          <OnboardingSectionProgress 
            currentSection={currentSection}
            completedSections={completedSections as ('people' | 'assets' | 'debts')[]}
          />
        )}
        
        {/* Progress bar */}
        {currentSection !== 'welcome' && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                Steg {getStepNumber()} av {TOTAL_STEPS}: {getSectionTitle()}
              </span>
              <span className="text-sm text-primary/70">{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}
        
        {/* Navigation buttons */}
        {canGoBack() && (
          <div className="mb-4">
            <Button 
              variant="secondary" 
              onClick={goToPreviousSection}
              className="w-full sm:w-auto"
            >
              ← Tillbaka till föregående steg
            </Button>
          </div>
        )}
        
        {/* Wizard content */}
        <Card className="mb-4">
          {currentSection !== 'welcome' && (
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl">
                {getSectionTitle()}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className="p-4 md:p-6">
            {currentSection === 'welcome' && (
              <WelcomeStep onNext={handleWelcomeNext} />
            )}
            
            {currentSection === 'persons' && (
              <>
                {renderMicroInsight(
                  <>
                    <p className="font-medium text-primary mb-2">Tänk om din verkliga förmögenhet är större än du tror?</p>
                    <p className="text-sm text-primary/80 mb-2">
                      I Sverige ligger ofta en stor del av hushållets rikedom i pensioner – men många ser dem inte som tillgångar.
                    </p>
                    <p className="text-sm text-primary/80">
                      Här börjar vi med personerna i hushållet, så vi kan räkna rätt på pension, ålder och ekonomisk frihet för just er.
                    </p>
                  </>
                )}
                <PersonsWizardStep
                  onComplete={handlePersonsComplete}
                  onSkip={handleSkipSection}
                  liabilities={liabilities}
                />
              </>
            )}
            
            {currentSection === 'pension-per-person' && persons.length > 0 && (
              <>
                {renderMicroInsight('Enligt Nick Maggiulli, skaparen av The Wealth Ladder, underskattar de flesta sin verkliga förmögenhet – ofta med 1–2 nivåer – eftersom pensionen inte räknas med.')}
                {renderMicroInsight('Tänk dig att du tror att du har 500 000 kr – men i verkligheten 2,5 miljoner. Så ser det ofta ut när pensionen räknas in.')}
                <PensionPerPersonStep
                  persons={persons}
                  currentPersonIndex={currentPersonIndex}
                  onComplete={handlePensionPerPersonComplete}
                  onBack={goToPreviousSection}
                  onNextPerson={handlePensionNextPerson}
                  onSkip={handleSkipSection}
                />
              </>
            )}
            
            {currentSection === 'savings-investments' && (
              <>
                {renderMicroInsight('För många svenskar är bostaden deras största tillgång – ofta mer värd än allt sparande tillsammans.')}
                {renderMicroInsight('En svensk med 500 000 kr på kontot kan i verkligheten ha samma totala rikedom som en amerikan med 2–3 miljoner.')}
                <SavingsInvestmentWizardStep
                  onComplete={handleSavingsInvestmentComplete}
                  onSkip={handleSkipSection}
                />
              </>
            )}
            
            {currentSection === 'housing' && (
              <>
                {renderMicroInsight('💬 Nu tittar vi på allt du äger – ditt hem, bilen, sparandet och andra tillgångar. Många blir förvånade över hur mycket av deras förmögenhet som faktiskt finns i boendet.')}
                <HousingWizardStep
                  onComplete={handleHousingComplete}
                  onSkip={handleSkipSection}
                />
              </>
            )}
            
            {currentSection === 'housing-loan' && lastHousingAsset && (
              <SpecificLiabilityWizardStep
                assetLabel={lastHousingAsset.label}
                assetValue={lastHousingAsset.value}
                liabilityType="Bostadslån"
                onComplete={handleHousingLoanComplete}
                onSkip={handleSkipSection}
              />
            )}
            
            {currentSection === 'other-investments' && (
              <OtherInvestmentsWizardStep
                onComplete={handleOtherInvestmentsComplete}
                onSkip={handleSkipSection}
              />
            )}
            
            {currentSection === 'car-loan' && lastCarAsset && (
              <SpecificLiabilityWizardStep
                assetLabel={lastCarAsset.label}
                assetValue={lastCarAsset.value}
                liabilityType="Billån"
                onComplete={handleCarLoanComplete}
                onSkip={handleSkipSection}
              />
            )}
            
            {currentSection === 'liabilities' && (
              <>
                {renderMicroInsight('Att ha lån betyder inte att du ligger efter – det handlar om balansen mellan tillgångar och skulder.')}
                {renderMicroInsight('Lån kan vara en hävstång: om tillgången växer mer än räntan du betalar, ökar din förmögenhet snabbare.')}
                <LiabilitiesWizardStep
                  onComplete={handleLiabilitiesComplete}
                  onSkip={handleSkipSection}
                />
              </>
            )}
            
            {currentSection === 'summary' && (
              <SummaryStep
                persons={persons}
                assets={[...assets, ...pensionAssets]}
                liabilities={liabilities}
                onComplete={handleSummaryComplete}
                onBack={goToPreviousSection}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
