'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Linkedin } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] relative">
      {/* Bakgrundsbild med fade */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/design/bakgrund1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Overlay för ytterligare fade */}
      <div className="fixed inset-0 z-0 bg-[var(--surface-bg)]/60" />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-primary/70 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <img 
                  src="/design/app-icon-bw-1.png" 
                  alt="Förmögenhetskollen logotyp" 
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain relative z-10"
                  style={{ 
                    mixBlendMode: 'darken',
                    filter: 'contrast(1.1)'
                  }}
                />
              </div>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-900 mb-3">
              Om Förmögenhetskollen
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              Välkommen till en enklare väg att förstå din verkliga förmögenhet
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Om skaparen */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-primary mb-6">
                Om mig
              </h2>
              
              <div className="prose prose-sm sm:prose-base max-w-none text-neutral-700 space-y-4">
                <p className="leading-relaxed">
                  Jag heter <strong className="text-neutral-900">Tom Hansen</strong> och har arbetat med systemutveckling, arkitektur och AI i över tio år, bland annat som utvecklingschef på Viaduct AB.
                </p>
                
                <p className="leading-relaxed">
                  Jag bor med min sambo och våra fem barn utanför Eskilstuna – och det är just familjelivet som inspirerat mig till Förmögenhetskollen.
                </p>
                
                <p className="leading-relaxed">
                  Jag vill göra privatekonomi och förmögenhetsförståelse mer tillgängligt, även för den som inte har ekonomi som intresse.
                </p>
                
                <p className="leading-relaxed">
                  Med erfarenhet från banksektorn, AI-utveckling och datavetenskap vill jag bygga digitala verktyg som förenklar det svåra och väcker nyfikenhet – oavsett ålder.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/20 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-primary mb-6">
                Kontakt
              </h2>
              
              <p className="text-neutral-700 mb-6 leading-relaxed">
                Hör gärna av dig om du har idéer, konstruktiva förslag eller samarbetstankar kring ekonomi, teknik eller lärande – jag uppskattar varje perspektiv som kan bidra till att utveckla Förmögenhetskollen och framtidens digitala ekonomi-verktyg.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">E-post</p>
                    <a 
                      href="mailto:kontakt@formogenhetskollen.se" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      kontakt@formogenhetskollen.se
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Linkedin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">LinkedIn</p>
                    <a 
                      href="https://www.linkedin.com/in/tom-hansen-59579585" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      linkedin.com/in/tom-hansen-5957958
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Om Förmögenhetskollen */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-primary mb-6">
                Om Förmögenhetskollen
              </h2>
              
              <div className="prose prose-sm sm:prose-base max-w-none text-neutral-700 space-y-4">
                <p className="leading-relaxed">
                  Förmögenhetskollen är ett informations- och beräkningsverktyg som hjälper dig förstå din verkliga nettoförmögenhet – inklusive dolda pensionstillgångar som ofta glöms bort.
                </p>
                
                <p className="leading-relaxed">
                  Verktyget består av <strong className="text-neutral-900">förmögenhetskartläggning</strong>, där du registrerar alla tillgångar, skulder, inkomster och pensionsavtal. Det ger dig en <strong className="text-neutral-900">översikt över din nuvarande nivå</strong> enligt The Wealth Ladder, <strong className="text-neutral-900">FIRE-simulator</strong> för att se när du kan nå ekonomisk frihet, <strong className="text-neutral-900">sparkalkylator</strong> för att planera framtida tillväxt, och <strong className="text-neutral-900">0,01%-regeln</strong> som hjälper dig förstå hållbar konsumtion baserat på din förmögenhet.
                </p>
                
                <p className="leading-relaxed">
                  Verktyget är delvis inspirerat av <strong className="text-neutral-900">The Wealth Ladder</strong> av Nick Maggiulli och anpassat för svenska förhållanden. Syftet är att göra privatekonomi och förmögenhetsförståelse mer tillgängligt – även för den som inte har ekonomi som huvudintresse. Genom att inkludera pensionstillgångar som ofta glöms bort, får du en mer realistisk bild av din faktiska ekonomiska situation.
                </p>
                
                <p className="leading-relaxed">
                  Alla beräkningar bygger på generella antaganden och är avsedda för <strong className="text-neutral-900">insikt och reflektion</strong>, inte finansiell rådgivning.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tillbaka-knapp */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => router.back()}
              className="px-8 py-6 text-base"
            >
              Tillbaka
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

