# 🧭 Förmögenhetskollen

**Navigera hushållets ekonomi genom livets olika rikedomsnivåer.**

<!-- CI/CD test commit #2 -->

En pedagogisk webapp som hjälper hushåll att förstå sin ekonomiska ställning, följa sin utveckling och utforska livets rikedomsnivåer – inspirerad av Nick Maggiullis *The Wealth Ladder* och anpassad för svenska förhållanden.

## 🎯 Vad är Förmögenhetskollen?

Förmögenhetskollen är ett digitalt verktyg som visar din verkliga nettoförmögenhet – inklusive dolda pensionstillgångar som ofta glöms bort. Verktyget hjälper dig förstå din plats på *The Wealth Ladder* och ger insikter i hur du kan fortsätta växa ekonomiskt.

### ✨ Huvudfunktioner

- **📊 Dashboard** - Översikt över nettoförmögenhet, månatlig ökning, nuvarande rikedomsnivå och framsteg
- **🎯 Rikedomsnivåer** - 6 nivåer från "Lön-till-lön" till "Påverkansfrihet" med detaljerade insikter
- **👥 Hushållshantering** - Lägg till personer, tillgångar och skulder med pedagogiska guider
- **🔥 FIRE-simulator** - Simulera när du kan nå ekonomisk frihet enligt FIRE-principer (4%-regeln)
- **💰 Sparkalkylator** - Beräkna ränta-på-ränta med olika sparplaner och "what-if"-scenarier
- **💵 Lönekalkylator** - Räkna ut lön efter skatt och pensionsavsättningar
- **📈 Visualiseringar** - Progress-ring, fördelningsdiagram och månatlig uppdelning
- **💡 0,01%-regeln** - Förstå hållbar konsumtion baserat på din förmögenhet
- **🔒 Lokal datalagring** - All data sparas lokalt i din webbläsare (localStorage)

## 🚀 Snabbstart

### Förutsättningar

Innan du börjar, kontrollera att du har:

- **Node.js 18+** - [Ladda ner här](https://nodejs.org/)
- **npm** (kommer med Node.js) eller **pnpm** eller **yarn**
- **Git** - [Ladda ner här](https://git-scm.com/)
- **En webbläsare** (Chrome, Firefox, Safari, Edge)

### 1. Klona projektet

```bash
git clone <repository-url>
cd formogenhetskompassen
```

### 2. Installera dependencies

```bash
npm install
```

### 3. Konfigurera miljövariabler (valfritt)

Skapa en `.env.local` fil i projektets rot:

```bash
# Miljöindikator (viktigt för deployment)
# Sätt till "production" i produktion för att tillåta sökmotorer att indexera
# Lämna tom eller sätt till annat värde i test/preview för att blockera indexering
NEXT_PUBLIC_SITE_ENV=production                    # Eller lämna tom för test/preview

# Förmögenhetsberäkningar - konstanter (kan lämnas som default)
# Dessa värden används för pensions- och skatteberäkningar
# Alla värden är konfigurerade för 2025 års regler

# Inkomstbasbelopp och pensionsparametrar
NEXT_PUBLIC_IBB_ANNUAL=80600                    # Inkomstbasbelopp 2025 (kr/år)
NEXT_PUBLIC_PUBLIC_PENSION_RATE=0.185          # Allmän pensionsavsättning (18.5%)
NEXT_PUBLIC_PREMIEPENSION_RATE=0.025           # Premiepensionsavsättning (2.5%, del av allmän pension)
NEXT_PUBLIC_PENSIONABLE_INCOME_RATE=0.93       # Pensionsgrundande inkomst (93% av kvalificerad inkomst)
NEXT_PUBLIC_IBB_PENSION_CAP_MULTIPLIER=8.07    # Max pensionsgrundande inkomst (8.07 IBB per år)

# Tjänstepensionsavtal
NEXT_PUBLIC_ITP1_LOWER_RATE=0.045              # ITP1 lägre takt (4.5% upp till 7.5 IBB)
NEXT_PUBLIC_ITP1_HIGHER_RATE=0.30              # ITP1 högre takt (30% över 7.5 IBB)
NEXT_PUBLIC_ITP1_CAP_MULTIPLIER=7.5            # ITP1 tak (7.5 IBB)

# Skatteparametrar 2025
NEXT_PUBLIC_KOMMUNAL_SKATT_RATE=0.315          # Kommunal + regionalskatt (31.5%)
NEXT_PUBLIC_STATLIG_SKATT_RATE=0.20            # Statlig skatt (20%)
NEXT_PUBLIC_STATLIG_SKATT_SKIKTGRANS=625800    # Skiktgräns statlig skatt 2025 efter grundavdrag (kr/år)
NEXT_PUBLIC_PUBLIC_SERVICE_MAX=1249            # Public service-avgift max 2025 (kr/år)
NEXT_PUBLIC_PUBLIC_SERVICE_RATE=0.01           # Public service-avgift (1% av beskattningsbar inkomst)
NEXT_PUBLIC_PBB_ANNUAL=58800                   # Prisbasbelopp 2025 (kr/år)
```

**OBS:** 
- Om du inte skapar `.env.local` kommer appen att använda standardvärdena som är inbyggda i koden
- Alla värden är konfigurerade för 2025 års regler och kan uppdateras årligen
- Dessa miljövariabler är endast för beräkningar och krävs inte för att appen ska fungera
- **`NEXT_PUBLIC_SITE_ENV`**: Sätt till `"production"` endast när du är redo för produktion. I test/preview-läge (utan denna variabel eller med annat värde) kommer sökmotorer att blockeras från att indexera sidan via `robots.txt` och meta-taggar.

### 4. Starta utvecklingsservern

```bash
npm run dev
```

### 5. Öppna i webbläsaren

Gå till [http://localhost:3000](http://localhost:3000)

**OBS:** Data sparas lokalt i din webbläsare. Om du rensar cache/cookies försvinner data.

## 🏗️ Projektstruktur

```
formogenhetskompassen/
├── src/                               # App-kod
│   ├── app/                          # Next.js App Router
│   │   ├── about/                    # Om-sida och kontakt
│   │   ├── dashboard/                # Dashboard med alla features
│   │   │   ├── fire/                 # FIRE-simulator (integrated)
│   │   │   └── savings/              # Sparkalkylator (integrated)
│   │   ├── fire/                     # Standalone FIRE-kalkylator
│   │   ├── savings/                  # Standalone sparkalkylator
│   │   ├── salary/                   # Standalone lönekalkylator
│   │   ├── household/                # Redigera hushåll
│   │   ├── onboarding/               # Onboarding-flöde
│   │   └── pension-wizard/           # Pension-guide (standalone)
│   ├── components/                   # React-komponenter
│   │   ├── dashboard/                # Dashboard-komponenter
│   │   ├── household/                # Hushållsformulär
│   │   ├── onboarding/               # Onboarding-steg
│   │   ├── charts/                   # Diagram och visualiseringar
│   │   └── ui/                       # shadcn/ui komponenter
│   └── lib/                          # Hjälpfunktioner
│       ├── wealth/                   # Förmögenhetsberäkningar
│       ├── fire/                     # FIRE-beräkningar och simulering
│       ├── tax/                      # Skatteberäkningar
│       ├── stores/                   # State management (Zustand)
│       └── utils/                    # Utility-funktioner
├── public/                           # Statiska filer
│   └── design/                       # Grafik och ikoner
├── styles/                           # CSS-tokens och teman
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind CSS konfiguration
├── tsconfig.json                     # TypeScript konfiguration
└── README.md                         # Denna fil
```

## 🧮 Så här fungerar det

### 1. Onboarding

En omfattande wizard som guidar dig genom att registrera hushållets ekonomi med storytelling och micro-insights:

1. **👋 Välkommen** - Introduktion till appen och vad du får ut av den
2. **👥 Personer** - Lägg till vuxna i hushållet med inkomst och tillgångar
3. **💼 Inkomst & avtal per person** - Bruttolön (efter löneväxling), pensionsavtal (ITP1, SAF-LO, etc.), IPS och övrigt sparande
4. **🏦 Pensionstillgångar per person** - Guidad mini-wizard för varje person:
   - Inkomstpension (statlig)
   - Premiepension
   - Tjänstepension
   - IPS/privat pensionssparande
   - Med länkar till minpension.se för att hämta exakta värden
5. **💰 Hushållets övriga tillgångar** - Bostad, bil, sparande, fonder, aktier, etc.
6. **📉 Skulder och lån** - Bostadslån, billån, kreditkort, etc. (automatiskt kopplat till bostad/bil)
7. **📊 Sammanfattning** - Översikt över allt innan dashboarden låses upp

### 2. Dashboard

Huvudvyn visar:

- **Hero-sektion** (endast när inget hushåll finns) - Visuell introduktion med exempeldata och tydlig CTA
- **Välkomstsektion** (endast när inget hushåll finns) - Omfattande information om The Wealth Ladder, Sverige vs USA, och hur appen fungerar
- **Nettoförmögenhet** - Total förmögenhet minus skulder
- **Månatlig ökning** - Hur mycket förmögenheten växer per månad (avkastning + amortering + sparande)
- **Nuvarande nivå** - Din plats på The Wealth Ladder (1-6)
- **Hastighet** - Hur snabbt du närmar dig nästa nivå
- **Progress-ring** - Visuellt framsteg mot nästa nivå
- **0,01%-regeln** - Hållbar daglig konsumtion baserat på förmögenhet
- **FIRE-indikator** - När du kan nå ekonomisk frihet
- **Visualiseringar** - Fördelningsdiagram och månatlig uppdelning

### 3. FIRE-simulator

Simulera när du kan nå ekonomisk frihet enligt FIRE-principer:

- **4%-regeln** - Beräkning baserad på årliga utgifter
- **Bridge-period** - Tiden mellan FIRE och pensionsstart (visuellt markerad i grafen)
- **Coast FIRE** - Valfri funktion för deltidsarbete under bridge-perioden (visuellt markerad i grön färg)
- **Tidiga uttag** - Börja ta ut tjänstepension och/eller IPS från 55 år
- **Viktad avkastning** - När pensionshinkar slås ihop beräknas en viktad avkastning baserad på de faktiska delarna
- **Omdirigering av bidrag** - När en pensionshink mergas tidigt (före FIRE) flyttas månatliga bidrag automatiskt till vanligt sparande
- **Pensionsperiod** - Visuellt markerad i blå färg från pensionsstart och framåt
- **Interaktiv graf** - Se hur kapitalet utvecklas över tid med detaljerade tooltips
- **Pedagogiska info-ikoner** - Förklaringar för alla reglage och parametrar
- **Justerbar parametrar** - Avkastning, utgifter, pensionsålder (minst 63 år), tidiga uttag, etc.
- **Förbättrade tooltips** - Visar faktisk avkastningsprocent per år och när pensionsdelar flyttas över
- **Tillgänglig som** - Integrerad i dashboard och standalone-kalkylator

### 4. Sparkalkylator

Beräkna ränta-på-ränta med avancerade funktioner:

- **Flera sparplaner** - Jämför "trygg", "aggressiv" och "passiv indexfond"
- **"What-if"-scenarier** - Se vad som händer om du ökar sparandet
- **Interaktiv graf** - Hover för detaljer och milstolpar
- **Milstolps-spårning** - "Första miljonen", "100 000 kr i avkastning", etc.
- **Animerad tillväxt** - Visuell representation av kapitalväxt
- **Inflation** - Valfri inkludering av inflation i beräkningar
- **Tillgänglig som** - Integrerad i dashboard och standalone-kalkylator

### 5. Lönekalkylator

Räkna ut lön efter skatt och pensionsavsättningar:

- **Nettoinkomst** - Direkt beräkning efter skatt
- **Skatteförklaring** - Kommunal, statlig och public service-avgift
- **Pensionsavsättningar** - Offentlig och tjänstepension
- **Pension-guide** - Hjälp att hitta rätt pensionsavtal
- **Standalone** - Fungerar oberoende av hushållsdata

### 6. Rikedomsnivåer (The Wealth Ladder)

1. **Nivå 1: Lön-till-lön** (0 - 100 000 kr) - Överlevnadszonen
2. **Nivå 2: Matvarufrihet** (100 000 - 1 000 000 kr) - Stabilitetens mark
3. **Nivå 3: Restaurangfrihet** (1 000 000 - 10 000 000 kr) - Komfortens slätt
4. **Nivå 4: Resefrihet** (10 000 000 - 100 000 000 kr) - Utforskarnas horisont
5. **Nivå 5: Geografisk frihet** (100 000 000 - 1 000 000 000 kr) - Gränslöshetens öar
6. **Nivå 6: Påverkansfrihet** (1 000 000 000+ kr) - Ledarskapets topp

Varje nivå inkluderar:
- **Beskrivning** - Vad nivån innebär
- **Fördelar och nackdelar** - Faktorer att tänka på
- **0,01%-inspiration** - Exempel på hur man kan använda förmögenheten
- **Strategier** - Tips för att nå nästa nivå

## 🛠️ Utveckling

### Kommandon

```bash
# Utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Starta produktionsserver
npm start

# Linting
npm run lint
```

### Teknisk stack

- **Next.js 16** - React framework med App Router
- **TypeScript** - Typad JavaScript
- **React 19** - UI-bibliotek
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Komponentbibliotek (Radix UI)
- **Zustand** - State management med localStorage persistence
- **React Hook Form** - Formulärhantering
- **Zod** - Schema-validering
- **Recharts** - Diagram och visualiseringar
- **Lucide React** - Ikoner

### Datasparande

**MVP-versionen använder lokal datalagring:**

- **Zustand persist** - Automatisk sparning till localStorage
- **Ingen backend krävs** - Alla funktioner fungerar offline
- **Ingen användarautentisering** - Data är lokal per webbläsare
- **Data försvinner vid** - Rensning av cache/cookies eller inkognito-läge

**Framtida utveckling:**
- Supabase-integration för persistent data (valfritt)
- Användarautentisering och kontohantering
- Datasynkronisering mellan enheter

## 🚀 Deployment

### Vercel (rekommenderat)

1. **Pusha kod till GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Koppla till Vercel**
   - Gå till [vercel.com](https://vercel.com)
   - Klicka "New Project"
   - Välj ditt GitHub-repository
   - Klicka "Deploy"

3. **Konfigurera miljövariabler** (valfritt)
   - I Vercel dashboard, gå till Settings → Environment Variables
   - Lägg till miljövariabler från `.env.local` om du vill anpassa standardvärdena
   - **Viktigt för sökmotorer**: Sätt `NEXT_PUBLIC_SITE_ENV=production` endast i produktion. I preview/test-läge (utan denna variabel) kommer sökmotorer att blockeras från att indexera sidan.

4. **Redeploya**
   - Vercel deployar automatiskt vid varje push
   - Eller klicka "Redeploy" i dashboard

### Lokal produktion

```bash
npm run build
npm start
```

## 📊 Beräkningar och Formler

Förmögenhetskollen använder avancerade matematiska modeller för att beräkna hushållets ekonomiska ställning och framtida utveckling.

### 🏦 Grundläggande Förmögenhetsberäkningar

#### **Nettoförmögenhet**
```
Nettoförmögenhet = Σ Tillgångar - Σ Skulder
```

#### **Månatlig Förmögenhetsökning**
```
Månatlig ökning = Avkastning + Amortering + Pensionsavsättningar + Övrigt sparande
```

### 💰 Pensionsberäkningar

#### **Allmän Pensionsavsättning**
```
Allmän pension = 18,5% × 93% × MIN(total månadslön, 8,07 × IBB ÷ 12)
```

#### **Tjänstepensionsavsättningar**

**ITP1 (Privatanställda):**
- Upp till 7,5 IBB: 4,5% av lönen
- Över 7,5 IBB: 30% av lönen

**ITP2 (ITPK-delen):** 2% av lönen

**SAF-LO, AKAP-KR, PA16:** 4,5% av lönen

**Annat (Eget avtal):** Användarens val (procent eller fast belopp)

### 📈 Avkastningsberäkningar

#### **Geometrisk Månatlig Avkastning**
```
Månatlig avkastning = (1 + Årlig avkastning)^(1/12) - 1
```

#### **Standardavkastningar per Tillgångstyp**
- **Bostad:** 2,0% per år
- **Bil:** -10,0% per år (värdeminskning)
- **Fonder & Aktier:** 7,0% per år
- **Sparkonto:** 3,0% per år
- **Pensionssparande:** 3,0% per år
- **Tomt & Mark:** 2,0% per år
- **Maskiner & Utrustning:** 0,0% per år
- **Fordon (övrigt):** -5,0% per år
- **Ädelmetaller & Smycken:** 5,0% per år

### ⚡ Hastighetsberäkningar (Kompoundad Modell)

#### **Hastighetsindex**
```
Hastighetsindex = Återstående månader i nuvarande nivå ÷ Beräknade månader till nästa nivå
```

**Klassificering:**
- **≥ 2,0:** Mycket snabb (≤ 5 år)
- **≥ 1,0:** Snabb (≤ 10 år)
- **≥ 0,5:** Normal (10-20 år)
- **< 0,5:** Långsam (> 20 år)

#### **Kompoundad Tillväxtmodell**
```
NW_{t+1} = NW_t × (1 + g) + c
```

Där:
- **g** = Månatlig avkastningsprocent
- **c** = Månatliga bidrag (amortering + pensionsavsättningar + övrigt sparande)
- **NW_t** = Nettoförmögenhet vid tidpunkt t

### 🔥 FIRE-beräkningar

#### **4%-regeln**
```
FIRE-kapital = Årliga utgifter ÷ 0,04
```

#### **Simulering**
- Simulerar kapitalutveckling från nuvarande tillgångar
- Inkluderar månatliga bidrag och avkastning
- Räknar med bridge-period till pensionsstart
- Valfri Coast FIRE med deltidsarbete
- **Viktad avkastning vid sammanslagning**: När pensionshinkar (tjänstepension, IPS) slås ihop med tillgängligt kapital beräknas en viktad avkastning. Pensionsdelar som just blir uttagsbara höjs till minst 7% nominell avkastning innan viktning.
- **Omdirigering av bidrag**: När en pensionshink mergas tidigt (före FIRE/pension) flyttas de månatliga bidragen automatiskt till vanligt sparande för att undvika bidrag till en "nollad" hink.
- **Tidiga uttag**: Tjänstepension och IPS kan tas ut från 55 år och flyttas till tillgängligt kapital.

### 💡 0,01%-regeln

#### **Hållbar Daglig Konsumtion**
```
Daglig konsumtion = Nettoförmögenhet × 0,0001
```

Regeln visar vad du *teoretiskt kan* lägga per dag baserat på förmögenhetens potentiella avkastning (~3,7%/år = 0,01%/dag).

## 🎨 Design och UX

### Grafisk profil

- **Nordic premium** - Ren, minimalistisk design
- **Serif-typsnitt** - DM Serif Display för rubriker
- **Sans-serif** - Inter för brödtext
- **Neutrala färger** - Beige, grå, svart med accentfärger
- **Responsiv design** - Fungerar på desktop, tablet och mobil

### Användarupplevelse

- **Pedagogiska guider** - Step-by-step-wizards för komplexa uppgifter med micro-insights
- **Hero-sektion** - Visuell introduktion med exempeldata för nya användare
- **Scroll-hantering** - Hero- och välkomstsektioner döljs/visas tillsammans vid scrollning
- **Info-ikoner** - Pedagogiska tooltips för alla reglage och parametrar
- **Tooltips och förklaringar** - Tydlig information om beräkningar med dynamiskt innehåll
- **Visuell feedback** - Animationer och övergångar
- **Mobiloptimering** - Anpassad layout för små skärmar med "Hoppa över"-knapp

## ⚠️ Viktiga disclaimers

**Förmögenhetskollen är ett informations- och beräkningsverktyg**, inte en finansiell rådgivningstjänst.

- Alla siffror bygger på offentliga data och rimliga antaganden
- Historisk avkastning är ingen garanti för framtida resultat
- Förmögenhetskollen står inte under Finansinspektionens tillsyn
- Använd appen för **insikt och reflektion**, inte för investeringsbeslut
- Verktyget är inte direkt anpassat för personer som aktivt studerar med studielån eller som är pensionerade

## 🤝 Bidrag

1. Forka projektet
2. Skapa feature branch (`git checkout -b feature/amazing-feature`)
3. Commita ändringar (`git commit -m 'Add amazing feature'`)
4. Pusha till branch (`git push origin feature/amazing-feature`)
5. Skapa Pull Request

## 📄 Licens

MIT License - se [LICENSE](LICENSE) fil för detaljer.

## 🆘 Support

För frågor eller problem:
1. Kontrollera denna dokumentation
2. Sök i GitHub issues
3. Skapa nytt issue med detaljerad beskrivning
4. Kontakta via [Om-sidan](/about) i appen

## 🎯 Roadmap

### Kort sikt
- [x] Lokal datalagring (MVP)
- [x] FIRE-simulator med Coast FIRE
- [x] Sparkalkylator med flera planer
- [x] Lönekalkylator
- [x] Standalone-kalkylatorer
- [x] Omarbetad onboarding-wizard med storytelling
- [x] Hero-sektion på dashboard
- [x] Viktad avkastning vid sammanslagning av pensionshinkar
- [x] Tidiga uttag av tjänstepension och IPS
- [x] Pedagogiska info-ikoner i FIRE-kalkylatorn
- [x] Förbättrade tooltips med dynamiskt innehåll
- [ ] Förbättrade visualiseringar

### Lång sikt
- [ ] Supabase integration för persistent data (valfritt)
- [ ] Användarautentisering och kontohantering
- [ ] Historik över förmögenhetsutveckling
- [ ] Datasynkronisering mellan enheter
- [ ] Mobilapp (React Native)

---

**Förmögenhetskollen visar vägen, men det är du och ditt hushåll som bestämmer riktningen.**
