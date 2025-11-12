# FIRE-kalkylator - Dokumentation

## Översikt

FIRE-kalkylatorn är en fristående kalkylator för att simulera när du kan nå ekonomisk frihet enligt FIRE-principer (Financial Independence, Retire Early). Kalkylatorn finns i två lägen: **Quick** (snabb uppskattning) och **Avancerat** (detaljerad inmatning).

## Quick-läge

Quick-läget är designat för snabb uppskattning med minimal inmatning. Målet är att kunna fylla i allt på under 30 sekunder.

### Inputfält i Quick

1. **Ålder (år)** - Din nuvarande ålder
2. **Önskad pensionsålder (år)** - Ålder när du vill gå i pension
3. **Bruttolön/mån** - Din månadslön före skatt
4. **Sparande/mån** - Totalt sparande per månad (inkl. amorteringar)
5. **Tillgängligt kapital idag** - Fonder, aktier, sparkonton, etc.
6. **Pensionskapital (låst) totalt** - Totalt pensionskapital (default: 500 000 kr)

### Automatiska beräkningar i Quick

#### Utgifter/mån
Utgifter beräknas automatiskt som:
```
Utgifter = Nettolön - Sparande
```

Nettolön beräknas från bruttolön med befintlig skattelogik (kommunal skatt, statlig skatt över tröskel, jobbskatteavdrag, etc.).

#### Pensionskapital - Auto-fördelning
Pensionskapitalet fördelas automatiskt enligt standardfördelning:
- **Tjänstepension**: 70%
- **Premiepension**: 20%
- **IPS**: 10%

Denna fördelning kan ses i "Visa detaljer"-sektionen men kan inte ändras i Quick-läget.

#### Pensionsavsättningar/mån - Auto-beräkning
Om bruttolön är angiven, beräknas pensionsavsättningar automatiskt:

- **Tjänstepension**: Beräknas enligt ITP1-regler (4.5% upp till 7.5 IBB, 30% över taket) eller annan pensionsmodell baserat på inkomst
- **Premiepension**: Beräknas som 2.5% av PGI (pensionsgrundande inkomst)
- **IPS**: Default 0 kr/mån
- **Statlig pension (inkomstpension)**: Beräknas som 16% av PGI

Om ingen lön är angiven, sätts alla pensionsavsättningar till 0.

### Visa detaljer
I Quick-läget finns en expanderbar sektion "Visa detaljer" som visar:
- Pensionskapital-fördelningen (TP/PP/IPS) i läs-läge
- Pensionsavsättningar/mån (om lön är angiven) i läs-läge

Detta ger insikt i hur värdena är fördelade utan att göra dem redigerbara.

## Avancerat-läge

Avancerat-läget ger full kontroll över alla värden. Alla belopp anges explicit per hink (ingen procentfördelning).

### Inputfält i Avancerat

#### Grunddata
- **Ålder (år)**
- **Önskad pensionsålder (år)**

#### Kassaflöde
- **Utgifter/mån** - Redigerbart (i Quick är detta beräknat)
- **Sparande/mån** - Totalt sparande per månad (inkl. amorteringar)

#### Tillgängligt kapital idag
- **Tillgängligt kapital (kr)** - Fonder, aktier, sparkonton, etc.

#### Marknadsbaserad pension - Kapital idag
- **Tjänstepension (kr)**
- **Premiepension (kr)**
- **IPS (kr)**

#### Marknadsbaserad pension - Avsättning per månad
- **Tjänstepension/mån (kr)**
- **Premiepension/mån (kr)**
- **IPS/mån (kr)**

#### Statlig pension
- **Statlig pension kapital (kr)**
- **Statlig pension/mån (kr)**

### Synkning från Quick till Avancerat

När användaren byter från Quick till Avancerat:

1. **Ålder och pensionsålder** - Kopieras direkt
2. **Utgifter/mån** - Sätts till beräknat värde (nettolön - sparande)
3. **Sparande/mån** - Kopieras direkt
4. **Tillgängligt kapital** - Kopieras från Quick
5. **Pensionskapital per hink** - Fördelas enligt 70/20/10 från totalsumman i Quick
6. **Pensionsavsättningar per hink** - Sätts till beräknade värden från Quick (om lön fanns)

Alla värden är redigerbara i Avancerat-läget.

### Synkning från Avancerat till Quick

När användaren byter från Avancerat tillbaka till Quick:

- Quick visar totalsumman av pensionskapital
- "Visa detaljer" visar den senaste fördelningen från Avancerat (i läs-läge)
- Ingen auto-överstyrning görs - Quick behåller sina värden

## Tekniska detaljer

### NumberInput-komponent

Alla numeriska inputs använder `NumberInput`-komponenten som:
- Döljer webkit-spinners för mobilvänlighet
- Stödjer både heltal och decimaltal
- Har stöd för min/max-validering
- Stödjer suffix (t.ex. "kr", "%")
- Tillåter tom sträng i state för bättre UX

### Validering

- **Ålder**: 18 ≤ ålder < 100
- **Pensionsålder**: 18 ≤ pensionsålder ≤ 75
- **Ålder < Pensionsålder**: Pensionsålder måste vara högre än ålder

Om validering misslyckas visas ett felmeddelande och "Beräkna"-knappen (om den finns) är disabled.

### Beräkningslogik

Kalkylatorn använder befintlig beräkningslogik från `lib/fire/calc.ts` och `lib/fire/simulate.ts`:

- `calculateFIRE()` - Beräknar när FIRE kan nås
- `simulatePortfolio()` - Simulerar kapitalutveckling år för år
- `calculateJobNetIncome()` - Beräknar nettolön från bruttolön
- `calculateOccupationalPension()` - Beräknar tjänstepensionsavsättning
- `calculatePremiePension()` - Beräknar premiepensionsavsättning
- `calculateIncomePension()` - Beräknar statlig pensionsavsättning

Form-värden mappas till beräkningslogiken enligt:

```typescript
monthlySavings = Quick/Avancerat "Sparande/mån"
customMonthlyExpenses = Quick: auto (nettolön - sparande), Avancerat: input
occPensionAtStart = Kapital per hink (Avancerat/Quick)
occPensionContribMonthly = Avsättning/mån per hink
pensionStartAge = Önskad pensionsålder
```

## Komponenter

### `components/fire/QuickForm.tsx`
Komponent för Quick-läget med förenklade inputs och automatiska beräkningar.

### `components/fire/AdvancedForm.tsx`
Komponent för Avancerat-läget med detaljerade inputs per hink.

### `components/fire/FIREFormWrapper.tsx`
Wrapper-komponent som hanterar state och synkning mellan Quick och Avancerat läge.

### `components/fire/InfoIcon.tsx`
Återanvändbar komponent för info-ikoner med tooltips.

### `components/ui/NumberInput.tsx`
Återanvändbar komponent för mobilvänlig numerisk input.

## Konstanter

Konstanter finns i `lib/fire/consts.ts`:

- `DEFAULT_PENSION_DISTRIBUTION`: { TP: 0.7, PP: 0.2, IPS: 0.1 }
- `QUICK_DEFAULT_LOCKED_PENSION`: 500_000
- `MIN_AGE`: 18
- `MAX_AGE`: 100
- `MIN_PENSION_AGE`: 18
- `MAX_PENSION_AGE`: 75

## Mobiloptimering

- Alla number inputs använder `inputMode="decimal"` eller `inputMode="numeric"` för mobilvänlighet
- Webkit-spinners är dolda via CSS
- Responsiv layout med grid-system
- Touch-vänliga knappar och inputs

