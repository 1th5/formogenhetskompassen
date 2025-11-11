/**
 * Welcome step - Första steget i onboarding
 * Visar vad användaren får och varför det är värt att fylla i allt
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, BarChart3, Lightbulb, Target } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="text-primary/70 hover:text-primary"
        >
          Tillbaka
        </Button>
      </div>
      {/* Welcome header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-primary mb-2">
          Välkommen
        </h2>
        <p className="text-sm md:text-base text-primary/70">
          Låt oss tillsammans upptäcka din verkliga förmögenhet
        </p>
      </div>

      {/* Main benefits */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-primary">Tänk om du redan är miljonär – utan att veta om det.</p>
            <p className="text-sm text-primary/70 mt-1">
              När din pension räknas in visar det sig ofta att förmögenheten är flera gånger större än du trodde.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-primary">Vi räknar ut din rikedomsnivå.</p>
            <p className="text-sm text-primary/70 mt-1">
              Baserat på The Wealth Ladder delar vi in förmögenhet i nivåer och visar var du befinner dig.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-primary">Du får en dashboard som visar hur snabbt du rör dig uppåt.</p>
            <p className="text-sm text-primary/70 mt-1">
              Allt räknas i dagens penningvärde – du kan jämföra dig över tid.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-primary">Experimentera med ekonomisk frihet enligt FIRE-principer.</p>
            <p className="text-sm text-primary/70 mt-1">
              Simulera olika sparstrategier och se när du kan leva på dina tillgångar – helt på dina egna villkor.
            </p>
          </div>
        </div>
      </div>

      {/* Fact box */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary mb-1">Varför frågar vi om pension?</p>
              <p className="text-sm text-primary/80">
                I Sverige ligger ofta en stor del av hushållets förmögenhet i pension – därför frågar vi om den också.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-xs text-primary/70">
                <strong className="text-primary/80">🔒 Dina uppgifter är säkra:</strong> All data lagras lokalt i din webbläsare och delas aldrig med någon. Du har full kontroll över dina uppgifter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="pt-4 flex justify-center">
        <Button onClick={onNext} className="w-full sm:w-auto text-sm sm:text-base">
          <span className="sm:hidden">Kom igång</span>
          <span className="hidden sm:inline">Här börjar du – Fyll i hushållets personer och inkomster</span>
        </Button>
      </div>
    </div>
  );
}

