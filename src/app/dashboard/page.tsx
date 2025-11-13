/**
 * Dashboard - Huvudvy för förmögenhetskollen
 * Visar KPI:er, progress-ring och visualiseringar
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useHouseholdStore } from '@/lib/stores/useHouseholdStore';
import { calculateWealthMetrics, calculateMonthlyIncreaseBreakdown, WEALTH_LEVELS, formatTimeToNextLevel, getSpeedExplanation, getCurrentLevel, calculateNetWorth } from '@/lib/wealth/calc';
import { getConfig } from '@/lib/wealth/config';
import { getDefaultReturnRate } from '@/lib/types';
import { formatCurrency, formatMonthlyIncrease, getSpeedColor, getSpeedBgColor, formatYears } from '@/lib/utils/format';
import ProgressRing from '@/components/charts/ProgressRing';
import { ResponsiveContainer, PieChart, Pie } from 'recharts';
import WealthDistribution from '@/components/charts/WealthDistribution';
import MonthlyBreakdown from '@/components/charts/MonthlyBreakdown';
import WealthSplurgeCard from '@/components/dashboard/WealthSplurgeCard';
import OtherLevelsPreview from '@/components/dashboard/OtherLevelsPreview';
import FIRECard from '@/components/dashboard/FIRECard';
import CurrentLevelInsight from '@/components/dashboard/CurrentLevelInsight';
import { TrendingUp, Wallet, Gauge, ArrowUpRight, Sparkles, Zap, Coins, CircleDollarSign, Landmark, Calculator, ExternalLink, ArrowDown, ArrowUp, ChevronDown, BookOpen, Target, BarChart3, TrendingDown, AlertTriangle } from 'lucide-react';
import SavingsCard from '@/components/dashboard/SavingsCard';
import PensionOverviewCard from '@/components/dashboard/PensionOverviewCard';

export default function DashboardPage() {
  const router = useRouter();
  const { draftHousehold, shouldAnimate, setShouldAnimate, previousLevel, cameFromOnboarding, setPreviousLevel, setCameFromOnboarding } = useHouseholdStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showSpeedExplain, setShowSpeedExplain] = useState(false);
  const [showWealthModal, setShowWealthModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showMonthlyExplain, setShowMonthlyExplain] = useState(false);
  
  // Animation states
  const [animatedNetWorth, setAnimatedNetWorth] = useState(0);
  const [animationLevel, setAnimationLevel] = useState(0);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Welcome section states
  const [showWelcomeSection, setShowWelcomeSection] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [showScrollUpButton, setShowScrollUpButton] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [skipButtonOpacity, setSkipButtonOpacity] = useState(0);
  const welcomeSectionRef = useRef<HTMLDivElement>(null);
  const welcomeTitleRef = useRef<HTMLHeadingElement>(null);
  const dashboardSectionRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  
  // Hero section states
  const [showHeroSection, setShowHeroSection] = useState(true);
  const [showHeroScrollUpButton, setShowHeroScrollUpButton] = useState(false);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const heroScrollLockRef = useRef(false);
  
  // Kolla om det finns ett hushåll med minst en person
  const hasHousehold = draftHousehold && draftHousehold.persons && draftHousehold.persons.length > 0;
  const isLevelZero = !hasHousehold;
  
  // Visa välkomstsektionen första gången om inget hushåll finns
  // Om man har ett hushåll, börja direkt med välkomstsektionen dold
  useEffect(() => {
    if (isLevelZero && !hasSeenWelcome) {
      // Första gången utan hushåll - visa välkomstsektionen och hero-sektionen
      setShowWelcomeSection(true);
      setShowHeroSection(true);
      setHasSeenWelcome(true);
      // showSkipButton och skipButtonOpacity hanteras av scroll-hanteraren
      // Scrolla till toppen när välkomstsektionen visas första gången
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 100);
    } else if (!isLevelZero) {
      // Om man har ett hushåll - göm välkomstsektionen och hero-sektionen direkt
      setShowWelcomeSection(false);
      setShowHeroSection(false);
      scrollLockRef.current = false; // Lås inte scroll när man har hushåll
      heroScrollLockRef.current = false;
    }
  }, [isLevelZero, hasSeenWelcome]);
  
  
  // Hantera scroll upp till välkomstsektionen och hero-sektionen
  const handleScrollUp = () => {
    scrollLockRef.current = false;
    heroScrollLockRef.current = false;
    setShowWelcomeSection(true);
    // Visa hero-sektionen bara om isLevelZero är true
    if (isLevelZero) {
      setShowHeroSection(true);
    }
    // showSkipButton och skipButtonOpacity hanteras av scroll-hanteraren
    // Vänta lite så att sektionen renderas, sedan scrolla med animation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Hantera fade-in/fade-out för "Hoppa över"-knappen baserat på scroll-position
  // Knappen ska fadea in när man skrollar ner förbi "Välkommen till Förmögenhetskollen"-texten
  // och fadea ut när man skrollar upp över den texten
  useEffect(() => {
    if (!showWelcomeSection) {
      setShowSkipButton(false);
      setSkipButtonOpacity(0);
      return;
    }
    
    const handleScroll = () => {
      const welcomeTitleElement = welcomeTitleRef.current;
      if (!welcomeTitleElement) {
        setShowSkipButton(false);
        setSkipButtonOpacity(0);
        return;
      }
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const titleTop = welcomeTitleElement.offsetTop;
      const titleBottom = titleTop + welcomeTitleElement.offsetHeight;
      
      // Beräkna om titeln har passerat toppen av skärmen
      const titleHasPassed = scrollY > titleBottom;
      
      if (titleHasPassed) {
        // Fadea in knappen när titeln har passerat
        setShowSkipButton(true);
        // Använd en smooth transition för opacity
        const fadeInProgress = Math.min(1, (scrollY - titleBottom) / 100);
        setSkipButtonOpacity(fadeInProgress);
      } else {
        // Fadea ut knappen när man scrollar upp över titeln
        const fadeOutProgress = Math.max(0, 1 - (titleBottom - scrollY) / 100);
        setSkipButtonOpacity(fadeOutProgress);
        if (fadeOutProgress <= 0) {
          setShowSkipButton(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Kolla initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showWelcomeSection]);
  
  // Lyssna på scroll-event för att detektera när välkomstsektionen och hero-sektionen går förbi
  useEffect(() => {
    if ((!showWelcomeSection && !showHeroSection) || (scrollLockRef.current && heroScrollLockRef.current)) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Debounce scroll-events
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if ((scrollLockRef.current && !showWelcomeSection) || (heroScrollLockRef.current && !showHeroSection)) return;
        
        const heroElement = heroSectionRef.current;
        const welcomeElement = welcomeSectionRef.current;
        
        // Hitta den sista synliga sektionens botten
        let lastVisibleBottom = 0;
        if (showHeroSection && heroElement) {
          lastVisibleBottom = Math.max(lastVisibleBottom, heroElement.offsetTop + heroElement.offsetHeight);
        }
        if (showWelcomeSection && welcomeElement) {
          lastVisibleBottom = Math.max(lastVisibleBottom, welcomeElement.offsetTop + welcomeElement.offsetHeight);
        }
        
        if (lastVisibleBottom === 0) return;
        
        const scrollY = window.scrollY;
        
        // Om användaren scrollat ned så att den sista synliga sektionens nederkant har passerat skärmens övre del
        if (scrollY > lastVisibleBottom) {
          // Spara nuvarande scroll-position och dashboardens offset
          const currentScrollY = window.scrollY;
          const dashboardElement = dashboardSectionRef.current;
          const dashboardTop = dashboardElement?.offsetTop || 0;
          
          // Beräkna den visuella positionen relativt dashboarden
          const visualOffset = currentScrollY - lastVisibleBottom;
          
          // Dölj både hero-sektionen och välkomstsektionen
          if (showHeroSection) {
            setShowHeroSection(false);
            heroScrollLockRef.current = true;
          }
          if (showWelcomeSection) {
            setShowWelcomeSection(false);
            scrollLockRef.current = true;
          }
          
          // Återställ scroll-positionen efter att DOM har uppdaterats
          // så att användaren är på samma visuella position
          setTimeout(() => {
            if (dashboardElement) {
              const newScrollY = dashboardTop + visualOffset;
              window.scrollTo({ top: newScrollY, behavior: 'auto' });
            }
          }, 0);
        }
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [showWelcomeSection, showHeroSection]);

  // Lyssna på scroll för att visa/dölja "Om Förmögenhetskollen"-knappen
  useEffect(() => {
    if (showWelcomeSection || showHeroSection) {
      setShowScrollUpButton(false);
      setShowHeroScrollUpButton(false);
      return;
    }
    
    const handleScroll = () => {
      const dashboardElement = dashboardSectionRef.current;
      if (!dashboardElement) return;
      
      const scrollY = window.scrollY;
      const dashboardTop = dashboardElement.offsetTop;
      // Visa knappen när man är mycket nära toppen av dashboarden (0-40px från toppen)
      // Försvinner direkt när man scrollar bortom denna punkt
      const threshold = 30;
      
      // Kontrollera om vi är inom threshold-området
      const isWithinThreshold = scrollY >= dashboardTop && scrollY <= dashboardTop + threshold;
      
      setShowScrollUpButton(isWithinThreshold);
      setShowHeroScrollUpButton(isWithinThreshold);
    };
    
    // Kontrollera initial position
    handleScroll();
    
    // Använd requestAnimationFrame för smidigare uppdateringar
    let rafId: number | null = null;
    const throttledHandleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [showWelcomeSection, showHeroSection]);
  
  // Beräkna riktiga metrics
  useEffect(() => {
    if (isLevelZero) {
      // Nivå 0: tomt hushåll
      setMetrics({
        netWorth: 0,
        increasePerMonth: 0,
        currentLevel: 0,
        progress: 0,
        speedIndex: 0,
        speedText: 'Normal' as const,
        yearsToNextLevel: null,
        nextLevelTarget: 0
      });
      setBreakdown({
        assetReturns: 0,
        amortization: 0,
        pensionContributions: 0,
        otherSavings: 0,
        publicPensionContributions: 0,
        publicPensionReturns: 0,
        marketPensionContributions: 0,
        marketPensionReturns: 0
      });
      setAnimatedNetWorth(0);
      setAnimationLevel(0);
    } else if (draftHousehold) {
    // Beräkna förmögenhetsmått
    const wealthMetrics = calculateWealthMetrics(
        draftHousehold.assets || [],
        draftHousehold.liabilities || [],
        draftHousehold.persons || []
    );
    
    const monthlyBreakdown = calculateMonthlyIncreaseBreakdown(
        draftHousehold.assets || [],
        draftHousehold.liabilities || [],
        draftHousehold.persons || []
    );
    
    setMetrics(wealthMetrics);
    setBreakdown(monthlyBreakdown);
      
      // Starta animation om shouldAnimate är true
      if (shouldAnimate && wealthMetrics.netWorth !== 0) {
        const targetNetWorth = wealthMetrics.netWorth;
        const targetLevel = wealthMetrics.currentLevel;
        const startLevel = previousLevel !== null ? previousLevel : 0;
        
        // Bestäm duration baserat på om det är en nivåökning
        // 5 sekunder om nivå höjts (eller första onboarding från nivå 0), annars 3 sekunder
        const isLevelIncrease = targetLevel > startLevel;
        const isFirstOnboarding = cameFromOnboarding && startLevel === 0;
        const duration = (isLevelIncrease || isFirstOnboarding) ? 5 : 3;
        
        // Stoppa eventuell pågående animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        setAnimatedNetWorth(0);
        setAnimationLevel(startLevel);
        startTimeRef.current = performance.now();
        
        const animate = (currentTime: number) => {
          if (!startTimeRef.current) {
            startTimeRef.current = currentTime;
          }
          
          const elapsed = (currentTime - startTimeRef.current) / 1000; // sekunder
          const progress = Math.min(elapsed / duration, 1);
          
          // Logaritmisk easing för större siffror
          // Använd exponentiell easing: easeOutExpo för att få snabb start och långsam avslutning
          const easedProgress = 1 - Math.pow(2, -10 * progress);
          
          // Räkna ut värdet baserat på logaritmisk skala
          const absTarget = Math.abs(targetNetWorth);
          const sign = targetNetWorth >= 0 ? 1 : -1;
          
          // Om target är 0 eller mycket liten, använd linjär interpolation
          let currentValue: number;
          if (absTarget < 1000) {
            currentValue = absTarget * easedProgress * sign;
          } else {
            // Logaritmisk interpolation för större värden
            const logStart = Math.log10(1);
            const logEnd = Math.log10(Math.max(1, absTarget));
            const logCurrent = logStart + (logEnd - logStart) * easedProgress;
            currentValue = Math.pow(10, logCurrent) * sign;
          }
          
          setAnimatedNetWorth(currentValue);
          
          // Uppdatera nivå baserat på animerat värde
          const currentLevelObj = getCurrentLevel(currentValue);
          setAnimationLevel(currentLevelObj.level);
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Animation klar
            setAnimatedNetWorth(targetNetWorth);
            setAnimationLevel(targetLevel);
            setShouldAnimate(false);
            
            // Visa dialog baserat på omständigheter
            if (cameFromOnboarding && previousLevel === 0) {
              // Första registreringen
              setShowWelcomeDialog(true);
            } else if (previousLevel !== null && targetLevel > previousLevel) {
              // Höjt sig en nivå
              setShowCongratsDialog(true);
            }
            
            // Rensa flaggor
            setPreviousLevel(targetLevel);
            setCameFromOnboarding(false);
            animationRef.current = null;
            startTimeRef.current = null;
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Ingen animation, sätt direkt
        setAnimatedNetWorth(wealthMetrics.netWorth);
        setAnimationLevel(wealthMetrics.currentLevel);
      }
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draftHousehold, isLevelZero, shouldAnimate, previousLevel, cameFromOnboarding, setShouldAnimate, setPreviousLevel, setCameFromOnboarding]);
  
  // Scrolla till toppen när man kommer från onboarding
  useEffect(() => {
    if (cameFromOnboarding) {
      // Scrolla omedelbart till toppen
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Säkerställ att vi är i toppen även efter render
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      
      // Ytterligare säkerhetscheck efter lite längre tid
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  }, [cameFromOnboarding]);
  
  if (!metrics) {
    return (
      <div className="min-h-screen bg-[var(--surface-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary/70">Laddar översikt...</p>
        </div>
      </div>
    );
  }
  
  // Använd animationLevel om animation pågår, annars metrics.currentLevel
  const displayLevel = shouldAnimate ? animationLevel : metrics.currentLevel;
  const displayNetWorth = shouldAnimate ? animatedNetWorth : metrics.netWorth;
  const currentLevel = displayLevel === 0 ? null : WEALTH_LEVELS.find(level => level.level === displayLevel);
  
  // Welcome section content
  const welcomeContent = (
    <div 
      ref={welcomeSectionRef} 
      className="min-h-screen bg-[var(--surface-bg)] relative"
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-6xl">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-8 sm:mb-10">
            <img 
              src="/design/app-icon-bw-1.png" 
              alt="Förmögenhetskollen logotyp" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
              style={{ 
                mixBlendMode: 'darken'
              }}
            />
          </div>
          <h1 
            ref={welcomeTitleRef}
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-900 mb-4"
          >
            Välkommen till Förmögenhetskollen
          </h1>
          <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto font-light mb-6">
            Din verkliga förmögenhet – inklusive dina dolda pensionstillgångar
          </p>
          
          {/* Hook-text */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-neutral-900 leading-tight mb-3">
              Har du koll på din faktiska förmögenhet?
            </p>
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Många missar dolda värden som kan förändra den ekonomiska helhetsbilden. <span className="font-semibold text-neutral-900">Skrolla ner och kör Förmögenhetskollen</span> – få en grov översikt på under 5 minuter.
            </p>
          </div>
          
          {/* Hoppa över-knapp för mobil - fixed och följer med, fadeas in/ut baserat på scroll */}
          {showSkipButton && (
            <div 
              className="fixed top-4 left-1/2 -translate-x-1/2 z-30 sm:hidden transition-opacity duration-300"
              style={{ opacity: skipButtonOpacity }}
            >
              <Button
                onClick={() => {
                  const dashboardElement = dashboardSectionRef.current;
                  if (dashboardElement) {
                    setShowWelcomeSection(false);
                    setShowHeroSection(false);
                    scrollLockRef.current = true;
                    heroScrollLockRef.current = true;
                    setTimeout(() => {
                      window.scrollTo({ top: dashboardElement.offsetTop, behavior: 'smooth' });
                    }, 100);
                  }
                }}
                variant="ghost"
                className="text-xs text-primary/60 hover:text-primary/80 border border-primary/20 hover:border-primary/40 bg-white/70 backdrop-blur-sm shadow-sm"
                size="sm"
              >
                Hoppa över →
              </Button>
            </div>
          )}
        </div>

        <div id="about-fk" className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8 md:p-10 space-y-8 sm:space-y-10 mb-8">
          <div className="prose prose-sm sm:prose-base max-w-none text-neutral-700">
            {/* Intro */}
            <p className="leading-relaxed text-lg mb-6">
              Tänk dig att du tror att du har <strong className="text-neutral-900 font-semibold">500 000 kr</strong> – men att du i själva verket har <strong className="text-neutral-900 font-semibold">2,5 miljoner</strong>. Så kan det se ut när pensionen räknas med. I Sverige är pensionen ofta en stor del av hushållets ekonomiska trygghet, och en betydande del av hushållens finansiella tillgångar ligger i pensionssparande – men den syns sällan i vardagsekonomin.
            </p>
            <p className="leading-relaxed text-lg mb-6">
              <strong className="text-neutral-900 font-semibold">Förmögenhetskollen</strong> hjälper dig att se hela bilden – alla tillgångar, skulder och dolda värden – så att du förstår din faktiska nettoförmögenhet och vilken nivå du ligger på i <em className="text-neutral-900 font-semibold">Rikedomstrappan</em>.
            </p>
            <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-400 mb-6">
              <p className="text-sm leading-relaxed text-neutral-700">
                <strong className="text-neutral-900">Viktigt att veta:</strong> Förmögenhetskollen ger en <strong className="text-neutral-900">förenklad bild</strong> av hushållets förmögenhet, tillgångar, skulder, inkomster och annat. Vi gör <strong className="text-neutral-900">generella antaganden och förenklingar</strong> för att du snabbt ska få en grov översikt över din ekonomiska situation. Förmögenhetskollen tar inte hänsyn till alla delar av din privatekonomi och ska inte ses som personlig ekonomisk rådgivning. Det gör att du kan få värdefulla insikter på <strong className="text-neutral-900">under 5 minuter</strong> – även om alla detaljer inte är perfekta.
              </p>
            </div>

            {/* Sverige vs USA */}
            <div className="bg-neutral-900 rounded-lg p-6 sm:p-8 mb-6 text-white">
              <h2 className="font-serif text-2xl sm:text-3xl mb-4">Sverige vs USA – de dolda rikedomarna</h2>
              <p className="leading-relaxed text-base sm:text-lg mb-6">
                I USA tjänar många högre löner, men måste själva spara till sjukvård, utbildning och pension. I Sverige är en stor del av vår ekonomiska trygghet redan inbyggd – men vi ser den sällan.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 font-semibold"></th>
                      <th className="text-left py-3 px-4 font-semibold">Sverige</th>
                      <th className="text-left py-3 px-4 font-semibold">USA</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/90">
                    <tr className="border-b border-white/10">
                      <td className="py-3 px-4 font-medium">Pensionstillgångar</td>
                      <td className="py-3 px-4">Stor del av hushållets ekonomiska trygghet via allmän pension och tjänstepension (en betydande del av hushållens finansiella tillgångar är pensionssparande)</td>
                      <td className="py-3 px-4">Kombination av offentlig pension (Social Security) och i hög grad eget sparande i t.ex. 401(k) och IRA. Sparandet är mer individuellt och ojämnt fördelat</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 px-4 font-medium">Sparande till pension</td>
                      <td className="py-3 px-4">Stora automatiska pensionsavsättningar via allmän pension (18,5% av pensionsgrundande inkomst) och tjänstepension från arbetsgivare (ofta 4,5–30% av vissa lönedelar)</td>
                      <td className="py-3 px-4">Frivilligt och ojämnt fördelat</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 px-4 font-medium">Sjukvård & utbildning</td>
                      <td className="py-3 px-4">Skattefinansierat</td>
                      <td className="py-3 px-4">Till stor del privat finansiering (försäkringar, avgifter, lån)</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 px-4 font-medium">Synlig förmögenhet</td>
                      <td className="py-3 px-4">Lägre men mer stabil</td>
                      <td className="py-3 px-4">Högre men sårbar</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Dold rikedom</td>
                      <td className="py-3 px-4">Ja – stor del av tryggheten ligger i allmän pension och tjänstepension som inte syns på vanliga konton</td>
                      <td className="py-3 px-4">Delvis – offentlig pension (Social Security) finns, men en stor del av pensionskapitalet bygger på eget sparande i 401(k)/IRA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="leading-relaxed text-base sm:text-lg">
                <strong className="font-semibold">Poängen:</strong> En svensk med 500 000 kr på kontot kan, när pensionen räknas in, i vissa fall ha en total ekonomisk trygghet som grovt kan jämföras med en amerikan med 2–3 miljoner kronor. Det är en förenklad illustration – inte en exakt jämförelse.
              </p>
            </div>

            {/* The Wealth Ladder */}
            <div className="bg-neutral-50 rounded-lg p-5 sm:p-6 border-l-4 border-neutral-900 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 mb-3 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-neutral-900" />
                Vad är The Wealth Ladder?
              </h2>
              <p className="leading-relaxed text-neutral-700 text-base mb-4">
                Idén kommer från ekonomen och författaren <strong className="text-neutral-900 font-semibold">Nick Maggiulli</strong>. Han visar att rikedom växer i steg – inte linjärt. Varje nivå kräver ungefär <strong className="text-neutral-900 font-semibold">tio gånger större nettoförmögenhet</strong> än den föregående, och varje steg förändrar både livsstil och strategi för dina pengar.
              </p>
            </div>

            {/* Wealth Ladder Table */}
            <div className="overflow-x-auto my-6">
              <p className="text-sm text-neutral-600 mb-3 italic">
                Nivåerna är teoretiska intervall och ska ses som ett sätt att förstå olika rikedomsnivåer – inte som mål eller rekommendationer.
              </p>
              <table className="w-full border-collapse border border-neutral-200 rounded-lg text-sm">
                <thead>
                  <tr className="bg-neutral-900">
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Nivå</th>
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Förmögenhet (SEK)</th>
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Svensk benämning</th>
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Typisk samhällsklass (USA)</th>
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">% av hushåll (USA)¹</th>
                    <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Typisk ålder²</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">1</td>
                    <td className="px-4 py-3 text-neutral-700">0 – 100 000 kr</td>
                    <td className="px-4 py-3 text-neutral-700">Lön-till-lön</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Lägre klass</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">ca 20%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">20–30 år</td>
                  </tr>
                  <tr className="bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">2</td>
                    <td className="px-4 py-3 text-neutral-700">100 000 – 1 miljon kr</td>
                    <td className="px-4 py-3 text-neutral-700">Matvarufrihet</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Arbetarklass</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">ca 20%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">30–40 år</td>
                  </tr>
                  <tr className="bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">3</td>
                    <td className="px-4 py-3 text-neutral-700">1 – 10 miljoner kr</td>
                    <td className="px-4 py-3 text-neutral-700">Restaurangfrihet</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Medelklass</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">ca 40%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">40–50 år</td>
                  </tr>
                  <tr className="bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">4</td>
                    <td className="px-4 py-3 text-neutral-700">10 – 100 miljoner kr</td>
                    <td className="px-4 py-3 text-neutral-700">Resefrihet</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Övre medelklass</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">ca 18%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">50–60 år</td>
                  </tr>
                  <tr className="bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">5</td>
                    <td className="px-4 py-3 text-neutral-700">100 – 1 000 miljoner kr</td>
                    <td className="px-4 py-3 text-neutral-700">Geografisk frihet</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Övre klass</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">≈ 2%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">60+ år</td>
                  </tr>
                  <tr className="bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">6</td>
                    <td className="px-4 py-3 text-neutral-700">&gt; 1 miljard kr</td>
                    <td className="px-4 py-3 text-neutral-700">Påverkansfrihet</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">Superrika</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">&lt; 0,1%</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">60+ år</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-neutral-500 mt-3 italic">
                ¹ Grova uppskattningar av andel amerikanska hushåll i respektive förmögenhetsintervall baserat på <em>Federal Reserve SCF 2022</em> och Maggiullis tolkning i <em>The Wealth Ladder</em> (2025). Detta är en fördelning av nuvarande hushåll, inte livstidssannolikhet.<br />
                ² Indikativa åldersintervall baserade på median nettoförmögenhet per ålder (SCF 2022 via Fidelity/OfDollarsAndData) och en grov mappning mot nivåerna.
              </p>
            </div>

            {/* Genomsnittlig nettoförmögenhet i USA */}
            <div className="bg-neutral-50 rounded-lg p-5 sm:p-6 border-l-4 border-neutral-900 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 mb-3 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-neutral-900" />
                Genomsnittlig nettoförmögenhet i USA – referensdata
              </h2>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-neutral-200 rounded-lg text-sm">
                  <thead>
                    <tr className="bg-neutral-900">
                      <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Åldersgrupp</th>
                      <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Median (USD)</th>
                      <th className="border-b border-neutral-700 px-4 py-3 text-left font-semibold text-white">Källa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                      <td className="px-4 py-3 text-neutral-700">Under 35 år</td>
                      <td className="px-4 py-3 text-neutral-700">39 000 USD <span className="text-neutral-500">(≈ 390 000 kr)</span></td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">Fidelity 2024 (SCF 2022)</td>
                    </tr>
                    <tr className="bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors border-b border-neutral-100">
                      <td className="px-4 py-3 text-neutral-700">35–44 år</td>
                      <td className="px-4 py-3 text-neutral-700">135 600 USD <span className="text-neutral-500">(≈ 1,36 milj kr)</span></td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">Fidelity 2024 (SCF 2022)</td>
                    </tr>
                    <tr className="bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                      <td className="px-4 py-3 text-neutral-700">45–54 år</td>
                      <td className="px-4 py-3 text-neutral-700">247 200 USD <span className="text-neutral-500">(≈ 2,47 milj kr)</span></td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">Fidelity 2024 (SCF 2022)</td>
                    </tr>
                    <tr className="bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors border-b border-neutral-100">
                      <td className="px-4 py-3 text-neutral-700">55–64 år</td>
                      <td className="px-4 py-3 text-neutral-700">364 500 USD <span className="text-neutral-500">(≈ 3,65 milj kr)</span></td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">Fidelity 2024 (SCF 2022)</td>
                    </tr>
                    <tr className="bg-white hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-700">65–74 år</td>
                      <td className="px-4 py-3 text-neutral-700">409 900 USD <span className="text-neutral-500">(≈ 4,10 milj kr)</span></td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">Fidelity 2024 (SCF 2022)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-neutral-500 italic">
                <em>(Median ger en mer typisk bild än medelvärden, som ofta dras upp av de allra rikaste.)</em>
              </p>
            </div>

            {/* Vad du får när du testar */}
            <div className="bg-neutral-50 rounded-lg p-5 sm:p-6 border-l-4 border-neutral-900 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 mb-3 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-neutral-900" />
                Vad du får när du testar
              </h2>
              <p className="leading-relaxed text-neutral-700 text-base mb-4">
                När du har fyllt i dina tillgångar, skulder och pensionsrätter får du:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 text-base ml-2">
                <li><strong className="text-neutral-900 font-semibold">Din beräknade nivå</strong> – en ungefärlig placering i <em>Rikedomstrappan</em></li>
                <li><strong className="text-neutral-900 font-semibold">Hastighet mot nästa steg</strong> – hur snabbt din förmögenhet växer</li>
                <li><strong className="text-neutral-900 font-semibold">Fördelning av tillgångar</strong> – bostad, sparande, pension</li>
                <li><strong className="text-neutral-900 font-semibold">FIRE-indikator</strong> – simulerar vid vilket ungefärligt läge ditt kapital kan räcka längre, givet dina antaganden</li>
                <li><strong className="text-neutral-900 font-semibold">0,01%-regeln</strong> – en teoretisk tumregel för hur mycket konsumtion som kan vara hållbar utifrån din förmögenhet</li>
                <li><strong className="text-neutral-900 font-semibold">Exempel på vanliga fokusområden på olika nivåer</strong> – från ökad trygghet till mer frihetsinriktad planering</li>
              </ul>
              <p className="leading-relaxed text-neutral-700 text-base mt-4">
                Allt på under <strong className="text-neutral-900 font-semibold">5 minuter</strong>.
              </p>
            </div>

            {/* FIRE-simulatorer och sparkalkylatorer */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 sm:p-6 border-l-4 border-blue-600 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 mb-3 flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                Simulera ekonomisk frihet och räkna på sparande
              </h2>
              <p className="leading-relaxed text-neutral-700 text-base mb-4">
                Förmögenhetskollen innehåller två kraftfulla verktyg för att simulera olika scenarier för din ekonomiska framtid:
              </p>
              <div className="space-y-4 mb-4">
                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    FIRE-simulator (Financial Independence, Retire Early)
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-700 mb-2">
                    En interaktiv simulator som visar en uppskattning av när du kan nå ekonomisk frihet. Verktyget delar upp ditt kapital i separata "hinkar" och simulerar utvecklingen över tid:
                  </p>
                  <ul className="text-sm text-neutral-700 space-y-1 ml-6 list-disc">
                    <li><strong>Tillgängligt kapital</strong> – kan användas före pension (40 % av bostadsnettot räknas med)</li>
                    <li><strong>Marknadsbaserad pension</strong> – tjänstepension och IPS/privata pensionsförsäkringar (kan ofta tas ut från 55 år, beroende på avtal)</li>
                    <li><strong>Statlig pension</strong> – inkomstpension och premiepension (kan tas ut tidigast ca 63–64 år beroende på födelseår)</li>
                    <li><strong>Viktade avkastningar</strong> – beräknas automatiskt per kategori, men kan justeras manuellt</li>
                    <li><strong>Bridge-period</strong> – visar tiden mellan FIRE och pensionsstart</li>
                    <li><strong>Coast FIRE</strong> – låter dig testa deltidsarbete med lägre pensionsavsättningar</li>
                    <li><strong>Validering</strong> – säkerställer att ditt valda FIRE-år faktiskt håller i simuleringen</li>
                  </ul>
                  <p className="text-sm leading-relaxed text-neutral-700 mt-3">
                    <strong className="text-neutral-900">Interaktiv graf:</strong> Följ hur ditt kapital utvecklas år för år med separata linjer för varje kategori. Justera avkastning, inflation, utgifter och sparande i realtid och se direkt hur det påverkar vägen mot ekonomisk frihet.
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-700 mt-2">
                    <strong className="text-neutral-900">Svensk kontext:</strong> Simulatorn är anpassad till det svenska pensionssystemet med separata beräkningar för inkomstpension, premiepension, tjänstepension och IPS. Statlig pension hanteras som en livränteliknande utbetalning efter pensionsstart.
                  </p>
                  <p className="text-xs text-neutral-600 italic mt-3 pt-3 border-t border-blue-200">
                    <em>Resultaten är endast simuleringar baserade på dina inmatade antaganden och ska inte ses som någon garanti eller personlig rekommendation.</em>
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    Sparkalkylator (ränta-på-ränta)
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-700 mb-2">
                    Räkna på hur ditt sparande växer över tid med avkastning och regelbundna insättningar. Verktyget visar bland annat:
                  </p>
                  <ul className="text-sm text-neutral-700 space-y-1 ml-6 list-disc">
                    <li>hur kapitalet växer år för år med ränta-på-ränta</li>
                    <li>jämförelser mellan olika sparstrategier (trygg, aggressiv, passiv)</li>
                    <li>"vad händer om"-scenarier (t.ex. öka sparandet efter 5 år)</li>
                    <li>milstolpar som "första miljonen" eller när avkastningen överstiger dina insättningar</li>
                    <li>interaktiva grafer med hover-effekter för detaljerad information</li>
                    <li>resultat både i nominella och inflationsjusterade värden</li>
                  </ul>
                  <p className="text-sm leading-relaxed text-neutral-700 mt-3">
                    <strong className="text-neutral-900">Perfekt för svenskar</strong> som vill se hur deras månadssparande i fonder och aktier kan utvecklas över tid. Anpassa avkastning, sparbelopp och tidshorisont för att testa olika scenarier.
                  </p>
                  <p className="text-xs text-neutral-600 italic mt-3 pt-3 border-t border-blue-200">
                    <em>Beräkningarna är exempelbaserade och tar inte hänsyn till risken i olika sparformer eller din fulla ekonomiska situation.</em>
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 mt-4">
                Båda verktygen är tillgängliga direkt i appen när du har registrerat ditt hushåll, och även som fristående kalkylatorer för dem som bara vill testa utan att registrera sig.
              </p>
            </div>

            {/* 0.01%-regeln */}
            <div className="bg-neutral-50 rounded-lg p-5 sm:p-6 border-l-4 border-neutral-900 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 mb-3 flex items-center gap-3">
                <CircleDollarSign className="w-5 h-5 text-neutral-900" />
                0,01%-regeln – konsumera efter förmögenhet, inte lön
              </h2>
              <p className="leading-relaxed text-neutral-700 text-base mb-3">
                Enligt Nick Maggiulli kan det vara hjälpsamt att låta konsumtionen ta hänsyn till din förmögenhet – inte bara din lön. Det är ett sätt att resonera kring balansen mellan sparande och konsumtion, inte en regel som passar alla. Regeln bygger på antagandet att din förmögenhet i snitt kan växa med cirka 3–4 % per år, vilket motsvarar ungefär 0,01 % per dag.
              </p>
              <p className="text-sm text-neutral-600 italic">
                I appen kan du se en teoretisk uppskattning av hur mycket du skulle kunna konsumera per dag enligt 0,01%-regeln, baserat på din beräknade nettoförmögenhet. Beräkningen är förenklad och inte ett personligt råd.
              </p>
              <p className="text-xs text-neutral-600 italic mt-3 pt-3 border-t border-neutral-200">
                <em>Detta är en förenklad simulering och ska inte ses som personlig ekonomisk rådgivning.</em>
              </p>
            </div>

            {/* Viktigt att veta */}
            <div className="bg-neutral-100 rounded-lg p-5 sm:p-6 my-6 border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-neutral-700" />
                Viktigt att veta
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 mb-2">
                Förmögenhetskollen är ett <strong className="text-neutral-900">informations- och beräkningsverktyg</strong> – inte en finansiell rådgivningstjänst. Alla siffror bygger på offentliga data och rimliga antaganden. Historisk avkastning är ingen garanti för framtida resultat, och Förmögenhetskollen står inte under Finansinspektionens tillsyn. Verktyget tar inte hänsyn till alla detaljer i din ekonomiska situation och den information som visas är inte individuellt anpassad rådgivning. Använd Förmögenhetskollen för <strong className="text-neutral-900">insikt och reflektion</strong>, inte som underlag för enskilda investeringsbeslut.
              </p>
              <p className="text-sm leading-relaxed text-neutral-600 mt-3">
                <strong className="text-neutral-900">Observera:</strong> Förmögenhetskollen tillhandahåller all information för allmän spridning. Verktyget är inte utformat enligt reglerna för finansiell rådgivning och ska inte betraktas som finansiell rådgivning enligt Lag (2003:862) om finansiell rådgivning till konsumenter. Verktyget är inte direkt anpassat för personer som aktivt studerar med studielån eller som är pensionerade, eftersom dessa livssituationer kan ha unika ekonomiska förutsättningar som inte fullt ut beaktas i de generella antagandena.
              </p>
            </div>

            {/* Källor */}
            <div className="bg-neutral-50 rounded-lg p-5 sm:p-6 border-l-4 border-neutral-900 mb-6">
              <h3 className="font-semibold text-neutral-900 mb-3 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-700" />
                Källor och inspiration
              </h3>
              <ul className="text-sm leading-relaxed text-neutral-700 space-y-1">
                <li>• Nick Maggiulli – <em>The Wealth Ladder</em> (2025), <em>Just Keep Buying</em> (2022)</li>
                <li>• Federal Reserve SCF 2022</li>
                <li>• Fidelity Investments – <em>Average Net Worth by Age</em> (2024)</li>
                <li>• OfDollarsAndData – <em>Net Worth by Age Calculator</em> (2024)</li>
                <li>• RikaTillsammans – <em>Svensk tolkning av The Wealth Ladder</em> (2024)</li>
                <li>• Egna analyser och omräkningar till svenska förhållanden</li>
              </ul>
            </div>

            {/* Om och kontakt */}
            <div className="text-center mb-8 sm:mb-12">
              <Button
                variant="ghost"
                onClick={() => router.push('/about')}
                className="text-primary/70 hover:text-primary text-sm sm:text-base"
              >
                Om Förmögenhetskollen och kontakt
              </Button>
            </div>

            {/* Sluttext */}
            <div className="text-center mt-8 mb-6">
              <p className="leading-relaxed text-lg text-neutral-900 font-semibold mb-2">
                Förmögenhetskollen – se hela bilden av din förmögenhet.
              </p>
              <p className="leading-relaxed text-base text-neutral-700 mb-8">
                Din förmögenhet kan vara större än du tror.
              </p>
              
              {/* Scroll-indikator */}
              <div className="flex flex-col items-center gap-3 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 font-medium">
                  Redo att komma igång?
                </p>
                <div className="flex flex-col items-center gap-2 animate-bounce">
                  <ChevronDown className="w-6 h-6 text-primary" />
                  <span className="text-xs text-neutral-500">Scrolla ned för att börja</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
  
  // Beräkna temporära metrics för animationen
  const displayMetrics = shouldAnimate && draftHousehold ? (() => {
    // Beräkna temporära metrics baserat på animerad nettoförmögenhet
    const tempLevel = getCurrentLevel(displayNetWorth);
    const tempMetrics = calculateWealthMetrics(
      draftHousehold.assets || [],
      draftHousehold.liabilities || [],
      draftHousehold.persons || []
    );
    // Överskriv med animerade värden och beräkna speedIndex baserat på animerad nivå
    return {
      ...tempMetrics,
      netWorth: displayNetWorth,
      currentLevel: displayLevel,
      // Beräkna progress baserat på animerad nivå och nettoförmögenhet
      progress: tempLevel.next !== null && tempLevel.next > tempLevel.start 
        ? Math.max(0, Math.min(1, (displayNetWorth - tempLevel.start) / (tempLevel.next - tempLevel.start)))
        : 1
    };
  })() : metrics;
  
  // Bestäm om kort ska vara låsta baserat på animationLevel
  const effectiveIsLevelZero = displayLevel === 0;
  const LEVEL_BOX_CONTENT: Record<number, { heading: string; lines: string[]; focus: string }> = {
    1: {
      heading: 'Nivå 1 – Lön till lön',
      lines: [
        'Trygghet saknas – buffert är första steget.',
        'Pengarna tar slut före månaden gör det.',
        'Otur förstärks – minsta motgång kan bli kris.'
      ],
      focus: 'Fokus: skapa trygghet och buffert.'
    },
    2: {
      heading: 'Nivå 2 – Matvarufrihet (vardagstrygghet)',
      lines: [
        'Ekonomin står stadigt – nu kan du börja växa.',
        'Du klarar oväntade utgifter utan stress.',
        'Kan handla fritt i matbutiken utan oro.'
      ],
      focus: 'Fokus: jobba smartare och börja spara långsiktigt.'
    },
    3: {
      heading: 'Nivå 3 – Restaurangfrihet',
      lines: [
        'Livet flyter – pengarna börjar jobba för dig.',
        'Ekonomin fungerar och du har valfrihet i vardagen.',
        'Du kan unna dig utan oro.'
      ],
      focus: 'Fokus: låta kapitalet växa och hitta balans i livet.'
    },
    4: {
      heading: 'Nivå 4 – Resefrihet',
      lines: [
        'Fri att resa, fri att välja – men vad vill du egentligen?',
        'Pengar styr inte längre vardagen.',
        'Du kan resa när och vart du vill.'
      ],
      focus: 'Fokus: meningsfullhet, inte bara tillväxt.'
    },
    5: {
      heading: 'Nivå 5 – Geografisk frihet',
      lines: [
        'Du kan bo var du vill – nu handlar det om mening.',
        'Full kontroll över plats och tid.',
        'Pengar löser sällan problem – de skapar ibland nya.'
      ],
      focus: 'Fokus: bevara, diversifiera och hitta balans.'
    },
    6: {
      heading: 'Nivå 6 – Påverkansfrihet',
      lines: [
        'Du har allt – nu handlar det om avtrycket du lämnar.',
        'Du kan påverka världen och forma framtiden.',
        'Pengar spelar liten roll – inflytande större.'
      ],
      focus: 'Fokus: ge vidare och skapa bestående värde.'
    }
  };
  
  // Hero section - visas endast om isLevelZero och showHeroSection är true
  const heroSection = isLevelZero && showHeroSection ? (
    <div 
      ref={heroSectionRef}
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-slate-200/60"
    >
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Copy */}
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary/60 uppercase tracking-wide">Förmögenhetskollen</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary leading-tight">
                Se hur förmögen du är – inte bara vad du har på kontot.
              </h1>
            </div>
            <p className="text-base sm:text-lg text-primary/80 leading-relaxed">
              Många svenskar underskattar sin verkliga förmögenhet eftersom pensionen inte syns i vardagsekonomin. Förmögenhetskollen gör en förenklad uppskattning av din totala förmögenhet – statlig pension, tjänstepension, bostad, sparande och skulder – och visar en beräknad placering i Rikedomstrappan (The Wealth Ladder).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push('/onboarding')} 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Kom igång – fyll i ditt hushåll
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => {
                  const aboutSection = document.getElementById('about-fk');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="w-full sm:w-auto border border-primary/30 hover:border-primary/50 text-primary hover:bg-primary/5 bg-white/50"
              >
                Visa hur det funkar
              </Button>
            </div>
            <p className="text-sm text-primary/70 pt-2">
              Se din beräknade nivå, en uppskattad månatlig förändring – och en simulerad bild av om du är på väg mot större ekonomisk frihet.
            </p>
          </div>

          {/* Right side - Mock dashboard cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary/50 bg-primary/5 px-2 py-1 rounded-full">
                Exempeldata
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Card 1: Nettoförmögenhet */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary/60" />
                      <h3 className="text-sm font-medium text-primary/70">Nettoförmögenhet</h3>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-primary mb-1">2 450 000 kr</p>
                  <p className="text-xs text-primary/60">inkl. pension och bostad</p>
                </CardContent>
              </Card>

              {/* Card 2: Din nivå */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary/60" />
                      <h3 className="text-sm font-medium text-primary/70">Din nivå</h3>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-primary mb-1">Nivå 3</p>
                  <p className="text-xs text-primary/60">Restaurangfrihet</p>
                </CardContent>
              </Card>

              {/* Card 3: Månatlig ökning */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary/60" />
                      <h3 className="text-sm font-medium text-primary/70">Månatlig ökning</h3>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-primary mb-1">+6 200 kr/mån</p>
                  <p className="text-xs text-primary/60">pension + sparande + amortering + avkastning</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-[var(--surface-bg)]">
      {/* Hero Section - visas endast om isLevelZero */}
      {heroSection}
      
      {/* Welcome Section - visas endast om isLevelZero och inte scrollat ned */}
      {showWelcomeSection && welcomeContent}
      
      {/* Dashboard Section */}
      <div ref={dashboardSectionRef} className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-16 md:pt-20 pb-4 sm:pb-6 md:pb-8 max-w-6xl">
        {/* Scroll Up Button - visas bara när man är i toppen av dashboarden */}
        {!showWelcomeSection && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto w-[90%] sm:w-auto max-w-[calc(100%-2rem)] transition-opacity duration-300 ${
            showScrollUpButton ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            <button
              onClick={handleScrollUp}
              className="group flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/30 hover:border-primary/50 w-full sm:w-auto cursor-pointer"
              aria-label="Visa välkomstinformation"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap">Om Förmögenhetskollen</span>
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            </button>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center flex-shrink-0">
              <img 
                src="/design/app-icon-bw-1.png" 
                alt="Förmögenhetskollen logotyp" 
                className="w-full h-full object-contain"
                style={{ 
                  mixBlendMode: 'darken'
                }}
              />
            </div>
          <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 text-primary">Förmögenhetskollen</h1>
              <p className="font-sans text-xs sm:text-sm text-primary/70">
                {effectiveIsLevelZero ? 'Du har inte skapat ett hushåll än' : draftHousehold?.name || 'Mitt hushåll'}
            </p>
          </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {effectiveIsLevelZero ? (
              <Button onClick={() => router.push('/onboarding')} size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 whitespace-normal sm:whitespace-nowrap bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Kom igång - Fyll i dina uppgifter →
              </Button>
            ) : (
              <Button onClick={() => router.push('/household')} className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 hover:shadow-md transition-all duration-300">
            Redigera hushåll
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => router.push('/about')}
              className="text-primary/70 hover:text-primary text-sm sm:text-base px-2 sm:px-3 py-2 sm:py-3 hidden sm:flex"
            >
              Om
          </Button>
          </div>
        </div>
        
        {/* Kom igång-banner när nivå 0 */}
        {effectiveIsLevelZero && (
          <Card className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full -ml-12 -mb-12"></div>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
              </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl font-serif text-primary mb-2">Välkommen till Förmögenhetskollen!</h3>
                  <p className="text-xs sm:text-sm md:text-base text-primary/80 mb-3 sm:mb-4">
                    För att komma igång och se din ekonomiska position behöver du först fylla i dina uppgifter. 
                    Detta inkluderar tillgångar, skulder och personer med inkomster i hushållet.
                  </p>
                  <p className="text-xs sm:text-sm text-primary/70">
                    När du har fyllt i dina uppgifter kommer du att se din nettoförmögenhet, nuvarande rikedomsnivå och framsteg mot nästa nivå.
                  </p>
              </div>
              </div>
            </CardContent>
          </Card>
        )}
          
        {/* Huvud-KPI:er */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
          {/* Nettoförmögenhet */}
          <Card
            className={`order-1 relative overflow-hidden transition-all duration-300 ${
              effectiveIsLevelZero 
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-slate-50 to-slate-100' 
                : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50'
            }`}
            onClick={() => !effectiveIsLevelZero && setShowWealthModal(true)}
            role={effectiveIsLevelZero ? undefined : "button"}
            aria-label={effectiveIsLevelZero ? undefined : "Visa förmögenhetsfördelning"}
          >
            {!effectiveIsLevelZero && (
              <div className="absolute -top-2 -right-2 opacity-10">
                <Coins className="w-24 h-24 text-primary" />
              </div>
            )}
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-primary/60" />
                <CardTitle className="font-serif text-primary text-base sm:text-lg">Nettoförmögenhet</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
              <div className={`font-sans font-semibold tabular-nums text-primary break-words text-center sm:text-left ${
                displayLevel === 6
                  ? 'text-lg sm:text-xl md:text-2xl'
                  : displayLevel >= 4 
                  ? 'text-xl sm:text-2xl md:text-3xl' 
                  : 'text-2xl sm:text-3xl md:text-4xl'
              }`}>
                {effectiveIsLevelZero ? '—' : formatCurrency(displayNetWorth)}
              </div>
              {effectiveIsLevelZero && (
                <p className="text-xs text-primary/60 mt-2">Låses upp på Nivå 1</p>
              )}
              <div className="mt-3 text-xs font-sans text-primary/70 text-center sm:text-left space-y-1">
                <p className="font-sans text-xs uppercase tracking-wide text-primary/70 mb-1">Består av</p>
                <p className="text-xs">✓ Alla tillgångar (sparkonto, fonder, aktier)</p>
                <p className="text-xs">✓ Pensionstillgångar</p>
                <p className="text-xs">✓ Fastigheter, bil, m.m.</p>
                <p className="text-xs mt-1">- Alla skulder (lån, krediter)</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Nuvarande nivå */}
          <Card
            className={`order-2 md:order-3 relative overflow-hidden text-center transition-all duration-300 ${
              effectiveIsLevelZero 
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-slate-50 to-slate-100' 
                : `cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                  displayLevel === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200/50' :
                  displayLevel === 2 ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/50' :
                  displayLevel === 3 ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/50' :
                  displayLevel === 4 ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/50' :
                  displayLevel === 5 ? 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200/50' :
                  'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200/50'
                }`
            }`}
            onClick={() => !effectiveIsLevelZero && setShowLevelsModal(true)}
            role={effectiveIsLevelZero ? undefined : "button"}
            aria-label={effectiveIsLevelZero ? undefined : "Visa nivåinformation"}
          >
            {!effectiveIsLevelZero && (
              <div className="absolute -top-2 -right-2 opacity-10">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
            )}
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary/60" />
                <CardTitle className="font-serif text-primary text-base sm:text-lg">Nuvarande nivå</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
              <div className="text-lg sm:text-xl font-serif text-primary font-bold">
                {effectiveIsLevelZero ? 'Nivå 0' : `Nivå ${displayLevel}`}
              </div>
              <div className="text-xs sm:text-sm font-sans text-primary/70 mt-1">
                {effectiveIsLevelZero ? 'Inget hushåll skapat' : currentLevel?.name}
              </div>
              {!effectiveIsLevelZero && LEVEL_BOX_CONTENT[displayLevel] && (
                <div className="mt-3 text-center sm:text-left">
                  <div className="text-xs uppercase tracking-wide text-primary/70 mb-1">BESKRIVNING</div>
                  <div className="text-xs font-sans text-primary/70 space-y-1">
                    <p className="text-primary font-medium mb-1 text-xs sm:text-sm">{LEVEL_BOX_CONTENT[displayLevel].heading}</p>
                    {LEVEL_BOX_CONTENT[displayLevel].lines.map((line, idx) => (
                      <p key={idx} className="text-xs">✓ {line}</p>
                    ))}
                    <p className="mt-1 text-xs">
                      <span className="font-medium text-primary">{LEVEL_BOX_CONTENT[displayLevel].focus.split(':')[0]}:</span>
                      {' '}{LEVEL_BOX_CONTENT[displayLevel].focus.split(':').slice(1).join(':').trim()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Månatlig ökning */}
          <Card
            className={`order-3 md:order-2 relative overflow-hidden text-center transition-all duration-300 ${
              effectiveIsLevelZero 
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-slate-50 to-slate-100' 
                : `cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                  displayMetrics.increasePerMonth >= 0 
                    ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200/50' 
                    : 'bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border-red-200/50'
                }`
            }`}
            onClick={() => !effectiveIsLevelZero && setShowMonthlyModal(true)}
            role={effectiveIsLevelZero ? undefined : "button"}
            aria-label={effectiveIsLevelZero ? undefined : "Visa månatlig ökning"}
          >
            {!effectiveIsLevelZero && (
              <div className="absolute -top-3 -right-0 opacity-10">
                <TrendingUp className={`w-24 h-24 ${displayMetrics.increasePerMonth >= 0 ? 'text-success' : 'text-danger rotate-180'}`} />
              </div>
            )}
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className={`w-4 h-4 ${effectiveIsLevelZero ? 'text-primary/60' : (displayMetrics.increasePerMonth >= 0 ? 'text-success' : 'text-danger')}`} style={{ marginTop: '3px' }} />
                <CardTitle className="font-serif text-primary text-base sm:text-lg">Månatlig ökning</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
              <div className={`text-lg sm:text-xl md:text-2xl font-bold break-words flex items-center justify-center gap-2 ${
                effectiveIsLevelZero ? 'text-primary/40' : (displayMetrics.increasePerMonth >= 0 ? 'text-success' : 'text-danger')
              }`}>
                {effectiveIsLevelZero ? '—' : formatMonthlyIncrease(displayMetrics.increasePerMonth)}
              </div>
              {effectiveIsLevelZero && (
                <p className="text-xs text-primary/60 mt-2">Låses upp på Nivå 1</p>
              )}
              <div className="mt-3 text-xs font-sans text-primary/70 text-center sm:text-left space-y-1">
                <p className="text-xs uppercase tracking-wide text-primary/70 mb-1">Består av</p>
                <p className="text-xs">✓ Avkastning på tillgångar</p>
                <p className="text-xs">✓ Automatiska pensionsavsättningar</p>
                <p className="text-xs">✓ Löneväxling till pension</p>
                <p className="text-xs">✓ Övrigt månadssparande</p>
                <p className="text-xs">✓ Amorteringar på skulder</p>
                <p className="text-xs mt-2 italic text-primary/60">• Uppskattad månatlig ökning av nettoförmögenheten</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Hastighet */}
          <Card
            className={`order-4 relative overflow-hidden text-center transition-all duration-300 ${
              effectiveIsLevelZero 
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-slate-50 to-slate-100' 
                : displayLevel === 6
                ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-200/50'
                : `${getSpeedBgColor(displayMetrics.speedIndex)} cursor-pointer hover:shadow-lg hover:scale-[1.02] border-opacity-50`
            }`}
            onClick={() => {
              if (!effectiveIsLevelZero) {
                setShowSpeedModal(true);
              }
            }}
            role={effectiveIsLevelZero ? undefined : "button"}
            aria-label={effectiveIsLevelZero ? undefined : "Visa hastighetsinformation"}
          >
            {!effectiveIsLevelZero && displayLevel !== 6 && (
              <div className="absolute top-2 -right-2 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
            )}
            {!effectiveIsLevelZero && displayLevel === 6 && (
              <div className="absolute top-2 -right-2 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
            )}
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gauge className={`w-4 h-4 ${effectiveIsLevelZero ? 'text-primary/60' : getSpeedColor(displayMetrics.speedIndex)}`} />
                <CardTitle className="font-serif text-primary text-base sm:text-lg">Hastighet</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
              {displayLevel === 6 ? (
                <>
                  <div className="text-base sm:text-lg font-sans font-semibold text-primary flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Toppen nådd
              </div>
              <div className="text-xs font-sans text-primary/70 mt-1">
                    Du har nått den högsta nivån. Hastighet är inte längre relevant – nu handlar det om påverkan och avtryck du lämnar.
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-lg sm:text-xl font-serif font-bold flex items-center justify-center gap-2 ${effectiveIsLevelZero ? 'text-primary/40' : getSpeedColor(displayMetrics.speedIndex)}`}>
                    {!effectiveIsLevelZero && <Zap className="w-4 h-4" />}
                    <span className="font-serif">{effectiveIsLevelZero ? '—' : displayMetrics.speedText}</span>
              </div>
              <div className="text-xs font-sans text-primary/70 mt-1">
                    {effectiveIsLevelZero ? 'Låses upp på Nivå 1' : getSpeedExplanation(displayMetrics.speedIndex)}
              </div>
              {metrics.yearsToNextLevel && (
                    <div className="text-xs sm:text-sm font-sans text-primary mt-2 font-medium flex items-center justify-center gap-1">
                  {formatYears(metrics.yearsToNextLevel)} till nästa nivå
                </div>
              )}
              {metrics.nextLevelTarget && (
                    <div className="text-xs font-sans text-primary/70 mt-1 break-words">
                  Mål: {formatCurrency(metrics.nextLevelTarget)}
                </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Din nivå - detaljerad insikt */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <CurrentLevelInsight level={displayLevel} isLevelZero={effectiveIsLevelZero} />
        </div>
        
        {/* 0,01 %-regeln kort */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <WealthSplurgeCard 
            householdNetWorth={displayNetWorth}
            assets={effectiveIsLevelZero ? [] : (draftHousehold?.assets || [])}
            persons={effectiveIsLevelZero ? [] : (draftHousehold?.persons || [])}
          />
        </div>
        
        {/* FIRE Card */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div id="fire-card">
          <FIRECard
              assets={effectiveIsLevelZero ? [] : (draftHousehold?.assets || [])}
              liabilities={effectiveIsLevelZero ? [] : (draftHousehold?.liabilities || [])}
              persons={effectiveIsLevelZero ? [] : (draftHousehold?.persons || [])}
              totalNetWorth={displayNetWorth}
              currentLevel={displayLevel}
            />
          </div>
        </div>
        
        {/* Sparande kort */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <SavingsCard
            assets={effectiveIsLevelZero ? [] : (draftHousehold?.assets || [])}
            liabilities={effectiveIsLevelZero ? [] : (draftHousehold?.liabilities || [])}
            persons={effectiveIsLevelZero ? [] : (draftHousehold?.persons || [])}
            totalNetWorth={displayNetWorth}
            isLocked={effectiveIsLevelZero}
          />
        </div>
        
        {/* Pensionstillgångar kort */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <PensionOverviewCard
            assets={effectiveIsLevelZero ? [] : (draftHousehold?.assets || [])}
            persons={effectiveIsLevelZero ? [] : (draftHousehold?.persons || [])}
            isLocked={effectiveIsLevelZero}
          />
        </div>
        
        {/* Förmögenhetsfördelning flyttad till modal */}
        
        {/* Månatlig uppdelning flyttad till modal */}
        
        {/* Andra nivåer preview */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <OtherLevelsPreview currentNetWorth={displayNetWorth} isLocked={effectiveIsLevelZero} />

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
          
          {/* Om-knapp för mobil - utanför boxen */}
          <Button
            variant="secondary"
            onClick={() => router.push('/about')}
            className="flex items-center justify-between gap-2 h-auto py-3 px-4 border border-slate-300/60 hover:border-slate-400 hover:bg-slate-100/50 sm:hidden w-full mt-4"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded bg-slate-50">
                <BookOpen className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">Om Förmögenhetskollen</div>
                <div className="text-xs text-slate-500 truncate">Kontakt och info</div>
              </div>
            </div>
          </Button>
              </div>

        {/* Nivåer - modal */}
        <Dialog open={showLevelsModal} onOpenChange={setShowLevelsModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-[760px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
            <div className="bg-white p-4 sm:p-5 border-b border-slate-200/40">
              <DialogHeader className="gap-1">
                <DialogTitle className="font-serif text-primary text-lg sm:text-xl">Nivåerna i Förmögenhetskollen</DialogTitle>
                <DialogDescription className="text-primary/70 text-xs sm:text-sm">En översikt från skör ekonomi till påverkan och arv</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 max-h-[75vh] overflow-y-auto">
              {[
                {
                  level: 1,
                  title: 'Nivå 1 – Lön till lön',
                  intro: 'Ekonomin är skör och fokus ligger på att skapa trygghet och andrum.',
                  body:
                    'Här börjar den ekonomiska resan. Pengarna räcker precis till vardagen och oväntade kostnader kan ställa till det rejält. Målet här är inte att spara eller investera, utan att skapa trygghet och få koll på ekonomin. En liten buffert gör stor skillnad – den minskar stressen och ger utrymme att börja tänka längre fram.',
                  focus: 'Skapa stabilitet och buffert.',
                  lesson: 'Ditt nätverk och dina relationer är din viktigaste tillgång.'
                },
                {
                  level: 2,
                  title: 'Nivå 2 – Matvarufrihet (vardagstrygghet)',
                  intro: 'Grunden är lagd – du kan andas ut, planera framåt och börja växa.',
                  body:
                    'Nu finns ett lugn. Du klarar oväntade utgifter och kan börja se framåt. Det handlar inte längre om att jobba mer, utan smartare – kanske utbilda sig, byta jobb eller förhandla lön. Enkla vanor som regelbundet sparande och ökad inkomst lägger grunden för framtida frihet.',
                  focus: 'Höj inkomster och bygg långsiktiga vanor.',
                  lesson: 'Din förmåga att tjäna pengar är din största tillgång.'
                },
                {
                  level: 3,
                  title: 'Nivå 3 – Restaurangfrihet',
                  intro: 'Ekonomin fungerar och pengarna börjar arbeta för dig, inte tvärtom.',
                  body:
                    'Livet känns stabilt och du har råd att njuta av det. Du kan unna dig utan oro och låta investeringarna börja växa på riktigt. Det här är nivån där många väljer att stanna – trygg, bekväm och tillräcklig för ett rikt liv i balans.',
                  focus: 'Låt pengarna växa och njut av livet.',
                  lesson: 'Pengar är bäst när de arbetar åt dig.'
                },
                {
                  level: 4,
                  title: 'Nivå 4 – Resefrihet',
                  intro: 'Pengar styr inte längre vardagen – nu handlar det om tid och mening.',
                  body:
                    'Du kan resa när du vill och välja hur du vill leva. Ekonomin rullar av sig själv, men nya frågor dyker upp: Vad vill jag använda min tid till? Vad känns meningsfullt nu? Här skiftar fokus från att tjäna till att leva.',
                  focus: 'Prioritera tid, hälsa och relationer.',
                  lesson: 'Det som tog dig hit tar dig inte vidare.'
                },
                {
                  level: 5,
                  title: 'Nivå 5 – Geografisk frihet',
                  intro: 'Frihet på riktigt – du styr var och hur du vill leva, men söker balans.',
                  body:
                    'Du kan bo var du vill och forma ditt liv som du vill. Pengar är inte längre målet, men kan skapa nya problem. Nu handlar det om att skydda det du byggt, behålla fötterna på jorden och hitta mening bortom siffrorna.',
                  focus: 'Bevara, förenkla och hitta balans.',
                  lesson: 'Frihet utan riktning blir tomhet.'
                },
                {
                  level: 6,
                  title: 'Nivå 6 – Påverkansfrihet',
                  intro: 'Här handlar rikedom inte längre om pengar, utan om arv och påverkan.',
                  body:
                    'Du har makt att påverka andra och bidra till något större. Pengar gör liten skillnad här – det handlar mer om inflytande, ansvar och värderingar. Att använda sin förmögenhet klokt blir den nya meningen med rikedom.',
                  focus: 'Använd resurserna för gott.',
                  lesson: 'Rikedom mäts i avtryck, inte i siffror.'
                }
              ].map((lvl) => (
                <section key={lvl.level} className={`space-y-2 rounded-xl p-0`}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-primary text-lg">{lvl.title}</h3>
                    {metrics.currentLevel === lvl.level && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Din nivå</span>
                    )}
                  </div>
                  <p className="text-sm text-primary/80">{lvl.intro}</p>
                  <p className="text-sm text-primary/80">{lvl.body}</p>
                  <p className="text-sm text-primary/90"><span className="font-medium">Fokus:</span> {lvl.focus}</p>
                  <p className="text-xs text-primary/70">Lärdom: {lvl.lesson}</p>
                </section>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Hastighet/Framsteg - modal */}
        <Dialog open={showSpeedModal} onOpenChange={setShowSpeedModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-[720px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
            <div className="bg-white p-4 sm:p-5 border-b border-slate-200/40">
              <DialogHeader className="gap-1">
                <DialogTitle className="font-serif text-primary text-lg sm:text-xl">
                  {displayLevel === 6 ? 'Toppen nådd' : 'Framsteg mot nästa nivå'}
                </DialogTitle>
                <DialogDescription className="text-primary/70 text-xs sm:text-sm">
                  {displayLevel === 6 
                    ? 'Du har nått den högsta nivån. Hastighet är inte längre relevant – nu handlar det om påverkan och avtryck du lämnar.'
                    : 'Hur långt du kommit och hur snabbt du rör dig'}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-center">
                {displayLevel === 6 ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{ name: 'Framsteg', value: 100, fill: '#EADBB6' }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-serif text-primary">
                          100%
                        </div>
                        <div className="text-sm text-primary/70 text-center">
                          Toppen nådd
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-serif text-primary">
                        Nivå 6
                      </div>
                    </div>
                  </div>
                ) : (
                <ProgressRing
                  progress={metrics.progress}
                  currentLevel={metrics.currentLevel}
                  yearsToNext={metrics.yearsToNextLevel}
                  nextLevelTarget={metrics.nextLevelTarget}
                />
                )}
              </div>
              {displayLevel !== 6 && (
              <div className="text-center">
                <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${getSpeedBgColor(metrics.speedIndex)} ${getSpeedColor(metrics.speedIndex)}`}>
                  Hastighet: {metrics.speedText}
                </span>
              </div>
              )}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setShowSpeedExplain(!showSpeedExplain)}
                >
                  {showSpeedExplain ? 'Dölj beräkningsmetod' : 'Visa hur hastighet beräknas'}
                </button>
              </div>
              {showSpeedExplain && (
                <div className="bg-white rounded-lg border border-slate-200/60 p-4 text-left">
                  <h4 className="font-serif text-primary mb-3 text-sm">Hur vi beräknar din hastighet</h4>
                  <p className="text-xs text-primary/80 mb-3">
                    Vi räknar ut hur lång tid det tar för dig att nå nästa ekonomiska nivå. För att göra det tittar vi på:
                  </p>
                  <ul className="list-disc list-inside text-xs text-primary/80 space-y-1.5 mb-3 ml-2">
                    <li><strong>Din nuvarande ekonomi:</strong> Vad du äger minus vad du är skyldig (din nettoförmögenhet).</li>
                    <li><strong>Hur mycket du ökar din förmögenhet varje månad:</strong> Detta inkluderar pengar du sparar, amorterar på lån, sätter av till pension, och vad dina investeringar tjänar.</li>
                    <li><strong>Hur mycket dina tillgångar förväntas växa:</strong> Den avkastning vi antar att dina pengar ger.</li>
                  </ul>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-primary mb-1.5">Ränta-på-ränta-effekten (snöbollseffekten):</p>
                    <p className="text-xs text-primary/80">
                      Vår beräkning tar hänsyn till att dina pengar växer på ett smart sätt. Det betyder att du inte bara får avkastning på det du ursprungligen investerade, utan också på den avkastning du redan har tjänat. Det är som en snöboll som rullar nerför en backe – ju större den blir, desto snabbare växer den! Detta gör att din förmögenhet växer snabbare över tid.
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-primary mb-1.5">Jämförelse med andra:</p>
                    <p className="text-xs text-primary/80">
                      Vi jämför sedan din beräknade tid med ett genomsnitt baserat på hur lång tid det historiskt har tagit för de som faktiskt tagit sig vidare till nästa nivå. Vår riktlinje är att det tar cirka 10 år per nivå – men detta gäller endast för dem som lyckats ta sig vidare, inte för alla som någonsin varit eller är på nivån. Ditt hastighetsindex visar hur snabb du är jämfört med detta genomsnitt – ju högre index, desto snabbare rör du dig.
                    </p>
                  </div>
                    {metrics.yearsToNextLevel && (
                    <p className="text-xs text-primary/80 mb-3">
                      <strong>Din uppskattade tid just nu:</strong> {formatYears(metrics.yearsToNextLevel)}.
                    </p>
                    )}
                  {metrics.currentLevel === 4 && (
                    <div className="mt-3 text-xs text-primary/80">
                      <p className="font-medium text-primary">Obs för nivå 4 → 5</p>
                      <p>
                        Få tar språnget från nivå 4 till 5. Strategin som tog dig till nivå 4 (inkomst, karriär, sparvanor) är ofta <em>annan</em> än den som krävs för nästa steg. Att ta sig från nivå 4 till 5 kräver att du går från att förvalta kapital till att äga, bygga eller skala något som växer snabbare än du själv kan jobba. På nivå 4 är du redan rik – du kan göra nästan allt pengar kan bidra till. Fokus blir riktning och mening snarare än mer av samma.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-primary/70 mt-2">Beräkningen bygger på dina antaganden och är vägledande, inte ett löfte.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Nettoförmögenhet - modal */}
        <Dialog open={showWealthModal} onOpenChange={setShowWealthModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-[900px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
            <div className="bg-white p-4 sm:p-5 border-b border-slate-200/40">
              <DialogHeader className="gap-1">
                <DialogTitle className="font-serif text-primary text-lg sm:text-xl">Förmögenhetsfördelning</DialogTitle>
                <DialogDescription className="text-primary/70 text-xs sm:text-sm">Tillgångar och skulder som utgör din nettoförmögenhet</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 max-h-[75vh] overflow-y-auto">
              <WealthDistribution
                assets={draftHousehold?.assets || []}
                liabilities={draftHousehold?.liabilities || []}
              />
              <div className="bg-white rounded-lg border border-slate-200/60 p-4 text-left">
                <h4 className="font-serif text-primary mb-2 text-sm">Hur vi definierar nettoförmögenhet</h4>
                <p className="text-sm text-primary/80 mb-2">Enligt The Wealth Ladder beräknas nettoförmögenhet som:</p>
                <p className="text-sm font-medium text-primary">Nettoförmögenhet = Tillgångar – Skulder</p>
                <p className="text-xs text-primary/80 mt-2">Tillgångar omfattar allt du äger – bostad, investeringar, pensioner, sparande, företag, kontanter och liknande. Skulder är allt du är skyldig: bolån, billån, studielån, kreditkortsskulder och andra åtaganden.</p>
                <p className="text-xs text-primary/80 mt-3">Nick Maggiulli förklarar att nettoförmögenheten är det mest rättvisande måttet på var du faktiskt står ekonomiskt. Inkomst visar bara ett flöde – hur mycket som kommer in varje månad – medan nettoförmögenheten visar hur mycket du faktiskt äger och kontrollerar över tid.</p>
                <ul className="list-disc list-inside text-xs text-primary/80 mt-3 space-y-1">
                  <li>gör det möjligt att jämföra olika livssituationer oberoende av yrke eller inkomst,</li>
                  <li>tydliggör att strategin måste förändras när tillgångarna växer,</li>
                  <li>och ger en mer stabil bild av ekonomin än inkomsten, som kan svänga snabbt.</li>
                </ul>
                <p className="text-xs text-primary/90 mt-3"><span className="font-medium">Kort sagt:</span> din nettoförmögenhet visar din verkliga ekonomiska position – inte bara din lön.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Månatlig ökning - modal */}
        <Dialog open={showMonthlyModal} onOpenChange={setShowMonthlyModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-[900px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
            <div className="bg-white p-4 sm:p-5 border-b border-slate-200/40">
              <DialogHeader className="gap-1">
                <DialogTitle className="font-serif text-primary text-lg sm:text-xl">Månatlig ökning</DialogTitle>
                <DialogDescription className="text-primary/70 text-xs sm:text-sm">Visar vad som driver din ökning varje månad</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 max-h-[75vh] overflow-y-auto">
              <p className="text-sm text-primary/80">
                Din månatliga ökning består av avkastning på tillgångar, amorteringar, pensionsavsättningar och annat sparande.
                Pensionsavsättningarna är uppdelade i <strong>statlig trygghetsbaserad pension</strong> (inkomstpension) och 
                <strong> marknadsbaserad pension</strong> (premiepension, tjänstepension, IPS) med olika avkastningsprocentsatser.
              </p>
              <MonthlyBreakdown 
                breakdown={breakdown} 
                assets={draftHousehold?.assets || []}
                liabilities={draftHousehold?.liabilities || []}
              />
              <div className="text-center text-sm text-primary">
                Totalt per månad: <span className="font-semibold">{formatMonthlyIncrease(metrics.increasePerMonth)}</span>
              </div>
              <div className="pt-2 text-center">
                <button
                  type="button"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setShowMonthlyExplain(!showMonthlyExplain)}
                >
                  {showMonthlyExplain ? 'Dölj beräkningsmetod' : 'Visa hur ökningen beräknas'}
                </button>
              </div>
              {showMonthlyExplain && (
                <div className="bg-white rounded-lg border border-slate-200/60 p-4 text-left text-xs text-primary/80 space-y-3">
                  <p><span className="font-medium text-primary">Formel:</span> Ökning/mån = Avkastning (övrigt) + Amortering + Statlig pension (bidrag + avkastning) + Marknadsbaserad pension (bidrag + avkastning) + Övrigt sparande</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-primary mb-1">Avkastning (övrigt):</p>
                      <p className="pl-2">Beräknas från dina tillgångars förväntade APY och aktuella värde (exklusive pensionstillgångar).</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-primary mb-1">Statlig pension (Trygghetsbaserad):</p>
                      <p className="pl-2 mb-1">Inkluderar:</p>
                      <ul className="list-disc list-inside pl-4 space-y-0.5">
                        <li>Inkomstpension (automatisk avsättning {(() => {
                          const config = getConfig();
                          const incomePensionRate = (config.PUBLIC_PENSION_RATE - config.PREMIEPENSION_RATE) * 100;
                          return incomePensionRate.toFixed(1);
                        })()}% av pensionsgrundande inkomst)</li>
                        <li>Avkastning på statliga pensionstillgångar ({(() => {
                          // Beräkna faktiskt viktat snitt baserat på användarens tillgångar
                          const publicPensionAssets = (draftHousehold?.assets || []).filter(
                            asset => asset.category === 'Trygghetsbaserad pension (Statlig)'
                          );
                          if (publicPensionAssets.length === 0) {
                            return `${Math.round(getDefaultReturnRate('Trygghetsbaserad pension (Statlig)') * 100)}% per år (default)`;
                          }
                          const totalValue = publicPensionAssets.reduce((sum, asset) => sum + asset.value, 0);
                          if (totalValue === 0) {
                            return `${Math.round(getDefaultReturnRate('Trygghetsbaserad pension (Statlig)') * 100)}% per år (default)`;
                          }
                          const weightedAverage = publicPensionAssets.reduce(
                            (sum, asset) => sum + (asset.value / totalValue) * asset.expected_apy,
                            0
                          );
                          return `${Math.round(weightedAverage * 1000) / 10}% per år (viktat snitt baserat på dina tillgångar)`;
                        })()})</li>
                  </ul>
                      <p className="pl-2 mt-1 text-primary/70">Denna del är trygghetsbaserad och har låg men stabil avkastning.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-primary mb-1">Marknadsbaserad pension:</p>
                      <p className="pl-2 mb-1">Inkluderar:</p>
                      <ul className="list-disc list-inside pl-4 space-y-0.5">
                        <li>Premiepension (automatisk avsättning {(() => {
                          const config = getConfig();
                          const premiePensionRate = config.PREMIEPENSION_RATE * 100;
                          return premiePensionRate.toFixed(1);
                        })()}% av pensionsgrundande inkomst)</li>
                        <li>Tjänstepension (beroende på avtal)</li>
                        <li>Löneväxling (valfritt)</li>
                        <li>IPS - Individuellt pensionssparande (valfritt)</li>
                        <li>Avkastning på marknadsbaserade pensionstillgångar ({(() => {
                          // Beräkna faktiskt viktat snitt baserat på användarens tillgångar
                          const marketPensionAssets = (draftHousehold?.assets || []).filter(
                            asset => asset.category === 'Marknadsbaserad pension'
                          );
                          if (marketPensionAssets.length === 0) {
                            return `${Math.round(getDefaultReturnRate('Marknadsbaserad pension') * 100)}% per år (viktat snitt, default)`;
                          }
                          const totalValue = marketPensionAssets.reduce((sum, asset) => sum + asset.value, 0);
                          if (totalValue === 0) {
                            return `${Math.round(getDefaultReturnRate('Marknadsbaserad pension') * 100)}% per år (viktat snitt, default)`;
                          }
                          const weightedAverage = marketPensionAssets.reduce(
                            (sum, asset) => sum + (asset.value / totalValue) * asset.expected_apy,
                            0
                          );
                          return `${Math.round(weightedAverage * 1000) / 10}% per år (viktat snitt baserat på dina tillgångar)`;
                        })()})</li>
                      </ul>
                      <p className="pl-2 mt-1 text-primary/70">Denna del kan investeras mot börsen och har högre men mer variabel avkastning.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-primary mb-1">Amortering:</p>
                      <p className="pl-2">Planerade amorteringar på skulder – minskar skulder och höjer nettoförmögenheten.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-primary mb-1">Övrigt sparande:</p>
                      <p className="pl-2">Manuellt sparande utanför pension, såsom ISK, fonder, aktier, sparkonto m.m.</p>
                    </div>
                  </div>
                  
                  <p className="pt-2 border-t border-slate-200/60">Värdena bygger på dina inlagda hushållsuppgifter och avrundas till närmaste krona. Avkastningar beräknas månadsvis baserat på årliga APY-värden.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Welcome Dialog - första registreringen */}
        <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-[480px] rounded-lg overflow-hidden bg-white mx-2 sm:mx-auto border border-primary/10 shadow-sm">
            <DialogHeader>
              <DialogTitle className="sr-only">På översikten kan du följa</DialogTitle>
            </DialogHeader>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-primary mb-1">På översikten kan du följa:</h3>
                  <ul className="text-sm text-primary/70 space-y-1.5 list-disc list-inside mt-2">
                    <li>Din nuvarande nettoförmögenhet och nivå</li>
                    <li>Hur snabbt din förmögenhet växer varje månad</li>
                    <li>Din hastighet mot nästa nivå</li>
                    <li>Vägen mot ekonomisk frihet (FIRE)</li>
                    <li>0,01%-regeln för daglig marginal</li>
                  </ul>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={() => setShowWelcomeDialog(false)} 
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  Stäng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Congrats Dialog - höjt sig en nivå */}
        <Dialog open={showCongratsDialog} onOpenChange={setShowCongratsDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-[540px] rounded-2xl overflow-hidden bg-white mx-2 sm:mx-auto">
            <div className="bg-white p-4 sm:p-5 border-b border-slate-200/40">
              <DialogHeader className="gap-1">
                <DialogTitle className="font-serif text-primary text-lg sm:text-xl">Nivåhöjning</DialogTitle>
                <DialogDescription className="text-primary/70 text-xs sm:text-sm">
                  Du har nått {currentLevel ? `Nivå ${displayLevel}: ${currentLevel.name}` : `Nivå ${displayLevel}`}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              <p className="text-sm text-primary/70">
                Fortsätt på samma väg och utforska vad din nya nivå innebär.
              </p>
              <div className="pt-2">
                <Button onClick={() => setShowCongratsDialog(false)} className="w-full">
                  Fortsätt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
