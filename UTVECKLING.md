# 🚀 Utvecklingsguide - Förmögenhetskollen

## 📋 Översikt

Förmögenhetskollen är en Next.js 16-applikation som hjälper hushåll att förstå sin ekonomiska ställning och navigera genom olika rikedomsnivåer.

## 🛠️ Lokal utveckling

### 1. Förutsättningar

- Node.js 18+ 
- npm eller yarn
- Git

### 2. Installation

```bash
# Klona projektet (om från git)
git clone <repository-url>
cd formogenhetskompassen-app

# Installera dependencies
npm install
```

### 3. Miljövariabler

Skapa en `.env.local` fil i projektets rot:

```bash
# Miljöindikator (viktigt för deployment)
# Sätt till "production" i produktion för att tillåta sökmotorer att indexera
# Lämna tom eller sätt till annat värde i test/preview för att blockera indexering
NEXT_PUBLIC_SITE_ENV=production                    # Eller lämna tom för test/preview

# Förmögenhetsberäkningar - konstanter (kan lämnas som default)
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
- **`NEXT_PUBLIC_SITE_ENV`**: Sätt till `"production"` endast när du är redo för produktion. I test/preview-läge (utan denna variabel eller med annat värde) kommer sökmotorer att blockeras från att indexera sidan via `robots.txt` och meta-taggar. Detta skyddar test/preview-domäner från att bli indexerade av Google och andra sökmotorer.

### 4. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### 5. Testa applikationen

1. **Onboarding-flöde:**
   - Gå till `/onboarding`
   - Börja med välkomststeg
   - Fyll i personer med inkomster och pensionsavtal
   - Ange pensionstillgångar per person (guidad mini-wizard)
   - Lägg till hushållets övriga tillgångar och skulder
   - Se sammanfattning och lås upp dashboarden

2. **Dashboard:**
   - Hero-sektion och välkomstsektion (endast när inget hushåll finns)
   - Se KPI:er och visualiseringar
   - Progress-ring visar framsteg mot nästa nivå
   - Fördelningsdiagram för tillgångar/skulder
   - FIRE-simulator med avancerade funktioner

3. **Hushållsredigering:**
   - Gå till `/household`
   - Redigera personer, tillgångar och skulder
   - Ändringar sparas automatiskt i localStorage

## 🏗️ Projektstruktur

```
src/
├── app/                          # Next.js App Router
│   ├── onboarding/              # Onboarding-flöde (7 steg)
│   │   └── page.tsx             # Huvudsida med steg-navigering
│   ├── dashboard/               # Huvuddashboard
│   │   ├── page.tsx             # KPI:er, hero-sektion, välkomstsektion
│   │   ├── fire/                # FIRE-simulator (integrated)
│   │   │   ├── page.tsx         # FIRE-kalkylator med avancerade funktioner
│   │   │   └── info/            # FIRE-beräkningar förklaring
│   │   └── savings/             # Sparkalkylator (integrated)
│   ├── fire/                    # Standalone FIRE-kalkylator
│   ├── savings/                 # Standalone sparkalkylator
│   ├── salary/                  # Standalone lönekalkylator
│   ├── household/               # Hushållsredigering
│   │   └── page.tsx             # Flikar för personer/tillgångar/skulder
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Startsida (redirectar)
├── components/                   # React-komponenter
│   ├── onboarding/              # Onboarding-steg
│   │   ├── new/                 # Nya onboarding-komponenter
│   │   │   ├── WelcomeStep.tsx  # Välkomststeg
│   │   │   ├── PersonsWizardStep.tsx  # Personer och inkomster
│   │   │   ├── PensionPerPersonStep.tsx  # Pensionstillgångar per person
│   │   │   ├── SummaryStep.tsx  # Sammanfattning
│   │   │   └── ...              # Övriga steg
│   │   └── OnboardingSectionProgress.tsx  # Progress-indikator
│   ├── dashboard/               # Dashboard-komponenter
│   │   ├── FIRECard.tsx         # FIRE-indikator
│   │   └── ...                  # Övriga dashboard-komponenter
│   ├── household/               # Hushållsformulär
│   │   ├── PersonForm.tsx       # Personer-redigering
│   │   ├── AssetsForm.tsx       # Tillgångar-redigering
│   │   └── LiabilitiesForm.tsx  # Skulder-redigering
│   ├── charts/                  # Diagram och visualiseringar
│   │   ├── ProgressRing.tsx     # Progress-ring (Recharts)
│   │   ├── WealthDistribution.tsx # Tillgångar vs skulder
│   │   └── MonthlyBreakdown.tsx # Månatlig uppdelning
│   └── ui/                      # shadcn/ui komponenter
├── lib/                         # Hjälpfunktioner
│   ├── wealth/                  # Förmögenhetsberäkningar
│   │   ├── config.ts            # Konfiguration och konstanter
│   │   └── calc.ts              # Beräkningslogik
│   ├── fire/                    # FIRE-beräkningar och simulering
│   │   ├── calc.ts              # FIRE-beräkningar (calculateFIRE)
│   │   ├── simulate.ts          # Portfölj-simulering (simulatePortfolio)
│   │   ├── validate.ts          # Validering av FIRE-år
│   │   └── utils.ts             # Gemensamma utility-funktioner
│   ├── stores/                  # State management
│   │   └── useHouseholdStore.ts # Zustand store för hushållsdata
│   ├── utils/                   # Utility-funktioner
│   │   └── format.ts            # Formatering av tal och text
│   └── types.ts                 # Huvudtyper och interfaces
└── components.json               # shadcn/ui konfiguration
```

## 🧮 Kärnfunktioner

### Beräkningar

Alla beräkningar finns i `src/lib/wealth/calc.ts`:

- **Nettoförmögenhet:** `Σ Tillgångar - Σ Skulder`
- **Månatlig ökning:** `Avkastning + Amortering + Pensionsavsättningar + Övrigt sparande`
- **Rikedomsnivåer:** 6 nivåer från "Lön-till-lön" till "Påverkansfrihet"
- **Hastighetsindex:** Hur snabbt hushållet rör sig mot nästa nivå

### State Management

Använder Zustand för lokal state management:

- **Draft-hushåll:** Sparas i localStorage
- **Onboarding-data:** Temporär data under onboarding
- **Formulär-state:** React Hook Form för alla formulär

### Visualiseringar

Använder Recharts för diagram:

- **Progress-ring:** Framsteg mot nästa nivå
- **Fördelningsdiagram:** Tillgångar vs skulder
- **Stapeldiagram:** Månatlig uppdelning

## 🔧 Utvecklingskommandon

```bash
# Utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Starta produktionsserver
npm start

# Linting
npm run lint

# TypeScript check
npm run type-check
```

## 🐛 Felsökning

### Vanliga problem

1. **"location is not defined"** - Varning under build, påverkar inte funktionalitet
2. **Formulär-validering** - Kontrollera att alla required-fält är ifyllda
3. **LocalStorage** - Rensa browser data om data inte uppdateras

### Debug-tips

1. **React DevTools** - Inspektera komponenter och state
2. **Browser DevTools** - Kontrollera localStorage och console
3. **Network tab** - Se API-anrop (när Supabase är konfigurerat)

## 🚀 Deployment

### Vercel (rekommenderat)

1. Pusha kod till GitHub
2. Koppla repository till Vercel
3. Konfigurera miljövariabler i Vercel dashboard
4. Deploya automatiskt

### Lokal produktion

```bash
npm run build
npm start
```

### Miljövariabler för produktion

Samma som för utveckling, men med `NEXT_PUBLIC_SITE_ENV` satt till `"production"`:

```bash
# Viktigt: Sätt till "production" för att tillåta sökmotorer att indexera
NEXT_PUBLIC_SITE_ENV=production

# Övriga miljövariabler (samma som för utveckling)
NEXT_PUBLIC_IBB_ANNUAL=80600
# ... etc
```

**OBS:** I Vercel preview/test-läge ska du **INTE** sätta `NEXT_PUBLIC_SITE_ENV=production`. Lämna den tom eller sätt till annat värde för att blockera sökmotorer från att indexera test-domäner.

## 📈 Nästa steg

### Kort sikt (MVP+)
- [x] Omarbetad onboarding-wizard med storytelling
- [x] Hero-sektion på dashboard
- [x] Viktad avkastning vid sammanslagning av pensionshinkar
- [x] Tidiga uttag av tjänstepension och IPS
- [x] Pedagogiska info-ikoner i FIRE-kalkylatorn
- [x] Förbättrade tooltips med dynamiskt innehåll
- [ ] Supabase integration för persistent data
- [ ] Användarautentisering och kontohantering
- [ ] Server Actions för CRUD-operationer
- [ ] Förbättrade visualiseringar

### Lång sikt
- [ ] Historik över förmögenhetsutveckling
- [ ] AI-baserad förmögenhetscoach
- [ ] Delad vy mellan makar
- [ ] Mobilapp (React Native)

## 🤝 Bidrag

1. Forka projektet
2. Skapa feature branch (`git checkout -b feature/amazing-feature`)
3. Commita ändringar (`git commit -m 'Add amazing feature'`)
4. Pusha till branch (`git push origin feature/amazing-feature`)
5. Skapa Pull Request

## 📞 Support

För frågor eller problem:
1. Kontrollera denna dokumentation
2. Sök i GitHub issues
3. Skapa nytt issue med detaljerad beskrivning
