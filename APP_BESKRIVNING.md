# Förmögenhetskollen – Appbeskrivning

## Om skaparen

Jag är en systemutvecklare med 15 års erfarenhet, som har utvecklat system åt banker och har ett stort intresse för privatekonomi. Jag är **inte** en ekonomisk rådgivare och har därför inte juridisk rätt att ge ekonomisk rådgivning. Däremot kan jag presentera fakta och information.

Jag har lyssnat mycket på podden Rikatillsammans och har läst Nick Maggiullis bok "The Wealth Ladder", vilket har inspirerat mig i utvecklingen av denna app. Appen är tänkt att ge vanliga svenskar bättre koll på sin faktiska förmögenhet och vad som faktiskt finns i sina pensionstillgångar. Jag vill göra det enkelt att få lite bättre koll på vad pensionen är och fungerar för en vanlig svensk (och jämföra lite hur det är för människor i USA).

Appen kommer att innehålla annonser för att kunna försörja sig själv, men det är **inte** huvudsyftet att detta ska vara kommersiellt. Allt ska vara **gratis för användaren**. Jag själv har inget företag och gör detta som **hobby**.

---

## Vad är Förmögenhetskollen?

Förmögenhetskollen är en pedagogisk webapplikation som hjälper svenska hushåll att förstå sin totala ekonomiska ställning, följa sin utveckling över tid och utforska livets olika rikedomsnivåer. Appen är inspirerad av Nick Maggiullis koncept "The Wealth Ladder" och anpassad för svenska förhållanden, inklusive det svenska pensionssystemet.

### Syfte

Appens huvudsyfte är att:
- Ge vanliga svenskar bättre koll på sin **faktiska förmögenhet** – inklusive pensionstillgångar som ofta glöms bort
- Visa hur pensionen fungerar och vad den faktiskt är värd
- Jämföra svenska förhållanden med amerikanska (där mycket av inspirationen kommer ifrån)
- Hjälpa användare att förstå sin plats på "The Wealth Ladder" (Rikedomstrappan)
- Ge insikter i hur förmögenheten växer över tid och vad som påverkar den

### Målgrupp

Appen riktar sig till:
- **Svenskar i åldern 16-64 år** (appen är inte anpassad för personer som aktivt har pension eller studerar med studielån)
- Ensamhushåll eller familjer
- Personer som är intresserade av sin ekonomi men inte nödvändigtvis experter
- De som vill få en helhetsbild utan att behöva koppla bankkonton
- De som vill förstå hushållets ekonomiska riktning snarare än bara se saldon

---

## Huvudappen: Förmögenhetskollen

### Översikt

Förmögenhetskollen är huvudapplikationen där användare registrerar sitt hushåll, ser sin totala förmögenhet och följer sin utveckling över tid. Appen består av flera delar som tillsammans bildar en komplett bild av hushållets ekonomi.

### Flöde och funktioner

#### 1. Onboarding (Registrering)

När användare först kommer till appen går de igenom en omfattande onboarding-process som guidar dem steg för steg:

**Steg 1: Välkommen**
- Introduktion till appen och vad användaren får ut av den
- Förklaring av konceptet "The Wealth Ladder"
- Information om varför pension är viktigt att inkludera

**Steg 2: Personer**
- Lägg till vuxna personer i hushållet
- För varje person anges:
  - Namn (valfritt)
  - Födelseår (max 64 år)
  - Inkomster (flera inkomster kan läggas till per person)
  - Pensionsavtal (ITP1, ITP2, SAF-LO, AKAP-KR, PA16, eller eget avtal)
  - Löneväxling (om tillämpligt)
  - IPS (Individuellt Pensionssparande)
  - Övrigt sparande per månad

**Steg 3: Pensionstillgångar per person**
- För varje person registreras pensionstillgångar:
  - Inkomstpension (statlig pension)
  - Premiepension
  - Tjänstepension
  - IPS/privat pensionssparande
- Guidad wizard som hjälper användaren att hitta rätt information
- Länkar till minpension.se för att hämta exakta värden

**Steg 4: Spar och investeringar**
- Registrera hushållets övriga tillgångar:
  - Sparkonton
  - Fonder och aktier
  - Andra investeringar

**Steg 5: Boende**
- Registrera bostad (om ägd)
- Värde och förväntad avkastning
- Om bostad registreras, följer automatiskt fråga om bostadslån

**Steg 6: Övriga tillgångar**
- Bil (om ägd)
- Om bil registreras, följer automatiskt fråga om billån
- Andra tillgångar (tomt, mark, ädelmetaller, etc.)

**Steg 7: Övriga lån och skulder**
- Kreditkort
- Studielån
- Andra skulder

**Steg 8: Sammanfattning**
- Översikt över allt som registrerats
- Möjlighet att gå tillbaka och ändra
- När användaren är klar, låses dashboarden upp

**Viktigt:** Om användaren redan har ett registrerat hushåll och försöker starta en ny onboarding, visas en dialog som frågar om de vill ta bort det befintliga hushållet. Om de väljer nej, skickas de till dashboarden. Om de väljer ja, raderas all data och de kan starta om.

#### 2. Dashboard (Huvudvy)

Dashboarden är hjärtat i appen och visar hushållets ekonomiska ställning:

**Hero-sektion (endast när inget hushåll finns)**
- Visuell introduktion med exempeldata
- Tydlig call-to-action för att starta onboarding
- Förklarar vad appen gör och varför den är användbar

**Välkomstsektion (endast när inget hushåll finns)**
- Omfattande information om The Wealth Ladder
- Jämförelse mellan Sverige och USA
- Förklaring av hur appen fungerar
- Inspiration från Nick Maggiullis bok

**När hushåll är registrerat visar dashboarden:**

**Nettoförmögenhet**
- Total förmögenhet minus alla skulder
- Stort, tydligt visat belopp
- Inkluderar alla tillgångar inklusive pension

**Månatlig ökning**
- Hur mycket förmögenheten växer per månad
- Uppdelat i:
  - Avkastning på tillgångar
  - Amortering på lån
  - Pensionsavsättningar
  - Övrigt sparande

**Nuvarande nivå (The Wealth Ladder)**
- Visar hushållets plats på rikedomstrappan (nivå 1-6):
  1. **Lön-till-lön** (0 - 100 000 kr) - Överlevnadszonen
  2. **Matvarufrihet** (100 000 - 1 000 000 kr) - Stabilitetens mark
  3. **Restaurangfrihet** (1 000 000 - 10 000 000 kr) - Komfortens slätt
  4. **Resefrihet** (10 000 000 - 100 000 000 kr) - Utforskarnas horisont
  5. **Geografisk frihet** (100 000 000 - 1 000 000 000 kr) - Gränslöshetens öar
  6. **Påverkansfrihet** (1 000 000 000+ kr) - Ledarskapets topp

**Framsteg mot nästa nivå**
- Progress-ring som visar hur nära nästa nivå användaren är
- Procentuellt framsteg
- Beräknad tid till nästa nivå baserat på nuvarande hastighet

**Hastighet**
- Hur snabbt hushållet närmar sig nästa nivå
- Klassificering: Mycket snabb (≤5 år), Snabb (≤10 år), Normal (10-20 år), Långsam (>20 år)

**0,01%-regeln**
- Visar hållbar daglig konsumtion baserat på förmögenhet
- Teoretiskt vad man kan lägga per dag baserat på förmögenhetens potentiella avkastning

**FIRE-indikator**
- Visar när hushållet kan nå ekonomisk frihet enligt FIRE-principer
- Baserat på 4%-regeln och nuvarande utgifter

**Visualiseringar**
- Fördelningsdiagram över tillgångar
- Månatlig uppdelning av ökningen
- Progress-ringar och grafer

**Pensionskort**
- Översikt över alla pensionstillgångar
- Beräkning av framtida värde vid 67 års ålder
- Riskjustering: Om snittålder < 65 år och avkastning > 5%, begränsas avkastningen till max 4% för åren 60-67
- Inflationsjustering: Switch för att välja mellan nominell och real avkastning (2% inflation)
- Månadsutbetalning över 25 år om totalbeloppet fördelas jämnt
- Information om olika pensionstyper (statlig, premiepension, tjänstepension, IPS)

#### 3. Hushållsredigering

Användare kan när som helst redigera sitt hushåll:
- Lägga till/ta bort personer
- Uppdatera inkomster och pensionsavtal
- Lägga till/ta bort tillgångar
- Uppdatera skulder
- Alla ändringar sparas automatiskt lokalt

#### 4. FIRE-simulator (Integrerad i dashboard)

FIRE-simulatorn hjälper användare att simulera när de kan nå ekonomisk frihet:

**Funktioner:**
- **4%-regeln**: Beräkning baserad på årliga utgifter
- **Bridge-period**: Tiden mellan FIRE och pensionsstart (visuellt markerad i grafen)
- **Coast FIRE**: Valfri funktion för deltidsarbete under bridge-perioden
- **Tidiga uttag**: Börja ta ut tjänstepension och/eller IPS från 55 år
- **Viktad avkastning**: När pensionshinkar slås ihop beräknas en viktad avkastning
- **Omdirigering av bidrag**: När en pensionshink mergas tidigt flyttas månatliga bidrag automatiskt till vanligt sparande
- **Pensionsperiod**: Visuellt markerad från pensionsstart och framåt
- **Interaktiv graf**: Se hur kapitalet utvecklas över tid med detaljerade tooltips
- **Pedagogiska info-ikoner**: Förklaringar för alla reglage och parametrar
- **Justerbara parametrar**: Avkastning, utgifter, pensionsålder (minst 63 år), etc.

#### 5. Sparkalkylator (Integrerad i dashboard)

Sparkalkylatorn hjälper användare att beräkna ränta-på-ränta:

**Funktioner:**
- **Flera sparplaner**: Jämför "trygg", "aggressiv" och "passiv indexfond"
- **"What-if"-scenarier**: Se vad som händer om man ökar sparandet
- **Interaktiv graf**: Hover för detaljer och milstolpar
- **Milstolps-spårning**: "Första miljonen", "100 000 kr i avkastning", etc.
- **Animerad tillväxt**: Visuell representation av kapitalväxt
- **Inflation**: Valfri inkludering av inflation i beräkningar

---

## Fristående kalkylatorer

Utöver huvudappen finns det tre fristående kalkylatorer som kan användas oberoende av om man har registrerat ett hushåll eller inte:

### 1. FIRE-kalkylator (Standalone)

En fristående version av FIRE-simulatorn som kan användas för att experimentera med olika scenarier utan att behöva registrera ett hushåll. Alla funktioner från den integrerade versionen finns här, men användaren anger alla värden manuellt.

### 2. Sparkalkylator (Standalone)

En fristående version av sparkalkylatorn där användare kan experimentera med olika sparplaner och scenarier utan att behöva registrera ett hushåll.

### 3. Lönekalkylator

En kalkylator som hjälper användare att räkna ut:
- Nettoinkomst efter skatt
- Skatteförklaring (kommunal, statlig och public service-avgift)
- Pensionsavsättningar (offentlig och tjänstepension)
- Pension-guide som hjälper användare att hitta rätt pensionsavtal

---

## Tekniska detaljer

### Datalagring

- **Lokal datalagring**: All data sparas lokalt i användarens webbläsare (localStorage)
- **Ingen backend krävs**: Alla funktioner fungerar offline
- **Ingen användarautentisering**: Data är lokal per webbläsare
- **Data försvinner vid**: Rensning av cache/cookies eller inkognito-läge

### Beräkningar

Appen använder avancerade matematiska modeller för att beräkna:
- Nettoförmögenhet
- Månatlig förmögenhetsökning
- Pensionsavsättningar (baserat på svenska regler och kollektivavtal)
- Skatteberäkningar (kommunal, statlig, public service)
- Avkastningsberäkningar (geometrisk månatlig avkastning)
- FIRE-beräkningar (4%-regeln, bridge-period, etc.)
- Ränta-på-ränta för sparplaner

### Viktiga antaganden och begränsningar

- **Åldersbegränsning**: Appen är anpassad för personer 16-64 år. Personer över 64 år kan inte registreras.
- **Riskjustering för pension**: Om hushållets snittålder är under 65 år och avkastningen på en pensionstillgång är över 5%, begränsas avkastningen till max 4% för åren 60-67 för att minska risken närmare pension.
- **Inflationsjustering**: Användare kan välja mellan nominell och real avkastning (2% inflation).
- **Standardavkastningar**: Appen använder rimliga antaganden om avkastning för olika tillgångstyper, men dessa är inga garantier.
- **Historisk avkastning**: Tidigare utveckling är ingen garanti för framtida resultat.

---

## Viktiga disclaimers och ansvarsfriskrivningar

Förmögenhetskollen är ett **informations- och beräkningsverktyg**, inte en finansiell rådgivningstjänst.

- Alla siffror bygger på offentliga data och rimliga antaganden
- Historisk avkastning är ingen garanti för framtida resultat
- Förmögenhetskollen står inte under Finansinspektionens tillsyn
- Använd appen för **insikt och reflektion**, inte för investeringsbeslut
- Verktyget är inte direkt anpassat för personer som aktivt studerar med studielån eller som är pensionerade
- Skaparen är inte en ekonomisk rådgivare och ger inte ekonomisk rådgivning
- All information presenteras som fakta, men användare bör alltid konsultera auktoriserade rådgivare för viktiga ekonomiska beslut

---

## Ytterligare information

### Kommersiell aspekt

Appen kommer att innehålla annonser för att kunna försörja sig själv, men:
- Det är **inte** huvudsyftet att detta ska vara kommersiellt
- Allt ska vara **gratis för användaren**
- Skaparen har inget företag
- Detta är ett **hobby-projekt**

### Inspiration och källor

- **Nick Maggiulli**: "The Wealth Ladder" - konceptet med rikedomsnivåer
- **Rikatillsammans**: Podden som inspirerat till intresset för privatekonomi
- **Svenska pensionssystemet**: Offentliga källor om hur det svenska pensionssystemet fungerar
- **Kollektivavtal**: Information om ITP1, ITP2, SAF-LO, AKAP-KR, PA16, etc.

### Teknisk plattform

- Next.js 16 (React framework)
- TypeScript
- Lokal datalagring (localStorage)
- Ingen backend eller användarautentisering (i nuvarande version)

---

**Dokument skapat:** 2025
**Version:** 1.0
**Status:** Under utveckling

