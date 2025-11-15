# Granskning: Sparkalkylator och FIRE-simulator

Detta dokument innehåller all text från de integrerade kalkylatorerna på dashboarden: Sparkalkylatorn (ränta-på-ränta) och FIRE-simulatorn (ekonomisk frihet), samt deras tillhörande info-sidor och dialoger.

---

## 1. SPARKALKYLATORN (RÄNTA-PÅ-RÄNTA)

### 1.1 Header och navigation

**Huvudrubrik:**
- Sparkalkylator (ränta-på-ränta)

**Undertext:**
- Se hur ditt sparande kan växa över tid med ränta-på-ränta-effekten

**Tillbaka-knapp:**
- Tillbaka till översikt (desktop)
- Tillbaka (mobil)

---

### 1.2 Info-sektion: Hur fungerar ränta-på-ränta?

**Rubrik:**
- Hur fungerar ränta-på-ränta?

**Text:**
- **Ränta-på-ränta** betyder att din avkastning också genererar avkastning. Med tiden växer inte bara ditt ursprungliga kapital, utan även den avkastning du redan har fått.
- **Beräkningen:** Varje månad läggs ditt månadssparande till. Därefter räknas en månatlig avkastning (omräknad till månatlig ränta: årsränta / 12) på hela beloppet – inklusive tidigare månaders avkastning.
- **Exempel:** Sparar du 1 000 kr i månaden med 6 % årlig avkastning, växer både dina insättningar och den tidigare avkastningen tillsammans över tid.
- Om du väljer att använda inflation i beräkningen visas resultatet i dagens penningvärde (realt), så att du får en bättre bild av köpkraften över tid. Annars visas beloppen i nominella kronor.

**Minidisclaimer (under huvudrubriken):**
- Observera: Sparkalkylatorn är en förenklad simulering baserad på dina inmatade antaganden. Resultaten är inte en prognos och ska inte ses som personlig ekonomisk rådgivning.

---

### 1.3 Auto/Manuell switch

**Rubrik:**
- Använd hushållets värden

**Beskrivning:**
- Auto = hämtar värden från ditt hushåll | Manuell = experimentera fritt med alla reglage

**Obs:**
- Obs: Detta påverkar endast nuvarande plan, inte jämförelseplanerna ovan

**Switch-labels:**
- Manuell (vänster)
- Auto (höger)

**Startkapital-val (endast i Auto-läge):**

**Rubrik:**
- Startkapital

**Beskrivning:**
- Välj om startkapitalet ska vara hela din nettoförmögenhet eller bara ditt investerade kapital på börsen (exklusive pension)

**Switch-labels:**
- Nettoförmögenhet (vänster)
- Investerat kapital (höger)

**Visar-text (dynamisk):**
- Visar: [belopp] (investerat kapital på börsen) - om investerat kapital är valt
- Visar: [belopp] (hela nettoförmögenheten) - om nettoförmögenhet är valt

---

### 1.4 Inställningar

**Rubrik:**
- Inställningar

#### 1.4.1 Startkapital

**Label:**
- Startkapital

**Beskrivning (dynamisk):**
- Auto: [belopp] (investerat kapital på börsen) - om Auto-läge och investerat kapital
- Auto: [belopp] (nettoförmögenhet) - om Auto-läge och nettoförmögenhet
- Ange eller justera beloppet fritt med reglaget - om Manuellt läge

**Input-placeholder:**
- 0

**Enhet:**
- kr

**Värde-text:**
- [formaterat belopp]

#### 1.4.2 Månadssparande

**Label:**
- Månadssparande

**Beskrivning (dynamisk):**
- Auto: [belopp]/mån (inkl. amortering) - om Auto-läge
- Ange eller justera hur mycket du sparar varje månad - om Manuellt läge

**Input-placeholder:**
- 0

**Enhet:**
- kr/mån

**Värde-text:**
- [formaterat belopp]/mån

#### 1.4.3 Årlig avkastning (nominell)

**Label:**
- Årlig avkastning (nominell)

**Beskrivning (dynamisk):**
- Auto: [X]% (viktat snitt från aktier & fonder) - om Auto-läge och investerat kapital
- Auto: [X]% (viktat snitt från alla tillgångar, inkl. pension) - om Auto-läge och nettoförmögenhet
- Justera den förväntade årliga avkastningen - om Manuellt läge

**Förtydligande (endast i Manuellt läge):**
- När inflation är påslagen räknas real avkastning fram genom att justera den nominella avkastningen för vald inflation.

**Input-placeholder:**
- 0.0

**Enhet:**
- %

**Värde-text (dynamisk):**
- Real avkastning: [X]%/år - om inflation är på
- Nominell avkastning: [X]%/år - om inflation är av

#### 1.4.4 Tidsperiod

**Label:**
- Tidsperiod

**Beskrivning:**
- Hur många år framåt vill du simulera utvecklingen?

**Input-placeholder:**
- 10

**Enhet:**
- år

**Värde-text (dynamisk):**
- [X] år (singular)
- [X] år (plural)

#### 1.4.5 Inflation

**Label:**
- Använd inflation i beräkningen

**Switch-labels:**
- Av (vänster)
- På (höger)

**Beskrivning (när påslagen):**
- Inflationsjustering används för att beräkna real avkastning. Standard är 2%/år.

**Input-placeholder:**
- 2.0

**Enhet:**
- %/år

**Värde-text:**
- [X]%/år

**Real avkastning-text:**
- Real avkastning: [X]%/år

---

### 1.5 Resultat-sektion

**Rubrik:**
- Resultat

**Disclaimer (under rubriken):**
- Resultaten nedan är simuleringar baserade på dina aktuella inställningar och historiskt inspirerade antaganden. De visar inte hur ditt sparande faktiskt kommer utvecklas.

#### 1.5.1 Resultat-kort

**Startkapital:**
- Label: STARTKAPITAL
- Värde: [formaterat belopp]
- Undertext: Inledande belopp

**Total summa:**
- Label: TOTAL SUMMA
- Värde: [formaterat belopp] (animerat)
- Undertext: Efter [X] år

**Sparat:**
- Label: SPARAT
- Värde: [formaterat belopp]
- Undertext: Månadsinsättningar

**Avkastning:**
- Label: AVKASTNING
- Värde: [formaterat belopp] (grön om positiv, röd om negativ)
- Undertext: Ränta-på-ränta effekt

---

### 1.6 Interaktiv graf

**Rubrik:**
- Utveckling över tid

**Graf-axlar:**
- X-axel: År
- Y-axel: Belopp (kr)

**Tooltip (dynamisk baserat på år):**

**Format för tooltip:**
- År [X]
- [Plan-namn]: [formaterat belopp]
- Spar per år: [formaterat belopp]
- Avkastning: [formaterat belopp] | Total: [formaterat belopp]

**Milstolpe i tooltip (om tillämpligt):**
- 🎯 Milstolpe: [milstolpe-text]

---

### 1.7 Milstolpar

**Rubrik:**
- Milstolpar

**Undertext:**
- För: **Nuvarande plan**

**Milstolpe-format:**
- År [X]: [milstolpe-text]
- Total: [formaterat belopp]

**Milstolpe-belopp (standard):**
- 100 000 kr: "Första 100 000 kr"
- 250 000 kr: "250 000 kr"
- 500 000 kr: "Halv miljon"
- 1 000 000 kr: "Första miljonen!"
- 2 500 000 kr: "2,5 miljoner"
- 5 000 000 kr: "5 miljoner"
- 10 000 000 kr: "10 miljoner!"

**Dynamisk milstolpe:**
- "Avkastning överstiger insättningar" (när avkastningen per år överstiger årsinsättningarna)
- Det kan ses som en vändpunkt där avkastningen börjar bidra mer till ökningen än dina nya insättningar.

---

### 1.8 "Vad händer om"-scenario

**Rubrik:**
- Vad händer om-scenario

**Beskrivning:**
- Se vad som händer om du ökar månadssparandet efter X år (påverkar alla planer)

**Switch:**
- Av/På

**När aktiverat:**

**Öka sparandet efter (år):**
- Label: Öka sparandet efter (år)
- Input-placeholder: 5
- Enhet: år
- Värde-text: Efter [X] år

**Öka med (kr/mån):**
- Label: Öka med (kr/mån)
- Input-placeholder: 0
- Enhet: kr/månad
- Värde-text: +[formaterat belopp]/månad

---

### 1.9 Jämför sparplaner

**Rubrik:**
- Jämför sparplaner

**Beskrivning:**
- Skapa flera planer för att jämföra strategier (t.ex. trygg vs aggressiv)

**Knapp:**
- Lägg till plan

**Plan-redigering:**

**Plan-namn:**
- Input-placeholder: Plan namn (t.ex. Trygg, Aggressiv)

**Startkapital:**
- Label: Startkapital
- Input-placeholder: 0
- Enhet: kr

**Månadssparande:**
- Label: Månadssparande
- Input-placeholder: 0
- Enhet: kr/mån

**Årlig avkastning:**
- Label: Årlig avkastning
- Input-placeholder: 0.0
- Enhet: %

**Tidsperiod:**
- Label: Tidsperiod
- Input-placeholder: 10
- Enhet: år

**Ta bort plan:**
- X-knapp (röd)

---

## 2. FIRE-SIMULATORN (EKONOMISK FRIHET)

### 2.1 FIRECard (på dashboarden)

#### 2.1.1 Header

**Rubrik:**
- Ekonomisk frihet

**Undertext:**
- baserat på FIRE-principer

**Info-knapp:**
- (ikon, öppnar simulatorn)

#### 2.1.2 Innehåll när FIRE är uppnåelig

**Badge (dynamisk baserat på år till FIRE):**
- "Snart där!" - om 0-5 år
- "På rätt väg" - om 6-10 år
- "Bra start" - om 11-20 år
- "Lång väg kvar" - om 21+ år

**Progress-text (om ≤10 år):**
- [X]% av vägen

**År till FIRE:**
- [X] (stort nummer)
- [X] år (singular/plural)

**Beskrivning (dynamisk):**

**Om 0 år:**
- Du når ekonomisk frihet enligt dina antaganden – grymt jobbat!
- enligt den här modellen skulle du kunna leva på avkastningen utan att behöva arbeta

**Om >0 år:**
- tills du tidigast kan vara ekonomiskt oberoende
- givet att dina antaganden om sparande, avkastning och utgifter håller över tid

**Ålder:**
- vid [X] års ålder • baserat på hushållets genomsnittsålder

**Viktigt-meddelande:**
- **Viktigt:** Siffran i kortet bygger på en mycket förenklad simulering där tjänstepension och IPS antas kunna börja tas ut från 55 års ålder och där genomsnittliga avkastningar används. Inne i FIRE-simulatorn kan du själv ändra både uttagsåldrar och avkastningsantaganden. Allmän pension (inkomstpension och premiepension) kan normalt tas ut först från den lägsta uttagsålder som gäller för din årskull (ungefär 63–65 år i dag). Börsen är oförutsägbar och resultatet är inte en garanti. Se detta som en modellbaserad illustration – inte som personlig rådgivning.
- Beräkningen är en förenklad simulering baserad på 4 %-regeln och dina egna antaganden om avkastning och utgifter. Det är ingen prognos, garanti eller personlig rekommendation, utan en teknisk illustration av ett möjligt scenario.

#### 2.1.3 Innehåll när FIRE inte är uppnåelig

**Meddelande:**
- Ekonomisk frihet är inte uppnåelig med nuvarande antaganden.
- I simulatorn kan du testa vad som händer om du till exempel ändrar sparande, utgifter eller avkastningsantaganden.

#### 2.1.4 Information om simulatorn

**Rubrik:**
- I simulatorn kan du:

**Lista:**
- Se interaktiv graf över din väg mot ekonomisk frihet
- Justera avkastning, inflation, utgifter och sparande
- Simulera Coast FIRE – deltidsarbete under bridge-perioden
- Se när kapitalet når 4%-regeln och när uttag kan börja
- Testa olika scenarier med "vad händer om"-tänk

**CTA-knapp:**
- Visa simulator

---

### 2.2 FIRE-simulatorns huvudvy

#### 2.2.1 Header

**Huvudrubrik:**
- Kapital över tid (realt)

**Undertext:**
- Enligt FIRE-principer nås ekonomisk frihet när ditt tillgängliga kapital räcker fram till pension och vid pensionsstart uppfyller 4 %-regeln.

**Tillbaka-knapp:**
- Tillbaka till översikt

**Info-knapp:**
- Om beräkningen

#### 2.2.2 Utgångskapital (mobilversion)

**Rubrik:**
- Utgångskapital

**Tillgängligt:**
- Tillgängligt: [formaterat belopp]

**Marknadsbaserad pension:**
- Marknadsbaserad pension: [formaterat belopp]
- • Tjänste: [formaterat belopp] (om >0)
- • Premie: [formaterat belopp] (om >0)
- • IPS: [formaterat belopp] (om >0)

**Statlig pension:**
- Statlig pension: [formaterat belopp]

#### 2.2.3 Ekonomisk frihet-indikator

**Rubrik:**
- Din väg mot ekonomisk frihet

**Status: Kapital tar slut**

**Huvudtext:**
- Kapitalet tar slut vid [X] år

**Undertext:**
- Ekonomisk frihet nås vid [X] år, men kapitalet räcker inte fram till pension ([X] år).
- ELLER: Kapitalet räcker inte för att nå ekonomisk frihet.

**Portfölj vid frihet:**
- Portfölj vid frihet: [formaterat belopp]
- 4%-krav: [formaterat belopp]

**Status: Ekonomisk frihet uppnådd**

**Huvudtext:**
- [X] år
- tills du tidigast kan vara ekonomiskt oberoende

**Undertext:**
- Vid ålder [X] år
- (manuellt justerat) - om manuellt justerat
- Med inställda förutsättningar om inget skulle förändras

**Beräknat (om skiljer sig från manuellt):**
- Beräknat: [X] år (vid [X] år)

**4%-regeln:**
- [X] år < FIRE-ålder: 4%-regeln nås vid [X] år (före ekonomisk frihet)
- [X] år = FIRE-ålder: 4%-regeln nås vid [X] år (samtidigt med ekonomisk frihet)
- [X] år ≤ pensionsålder: 4%-regeln nås vid [X] år (under bridge-perioden)
- [X] år > pensionsålder: 4%-regeln nås vid [X] år (efter pensionsstart)

**Portfölj vid frihet:**
- Portfölj vid frihet: [formaterat belopp]
- 4%-krav: [formaterat belopp]

**Status: Ej uppnåelig**

**Huvudtext:**
- Ekonomisk frihet ej uppnåelig med nuvarande antaganden

#### 2.2.4 Graf-analys (dynamisk)

**Rubrik:**
- 📊 Vad ser du i grafen just nu?

**Om bridge-period > 0:**

**Tillgängligt kapital:**
- Den **blå linjen (Tillgängligt)** visar ditt kapital som kan användas före pension.
- Vid [X] år börjar Coast FIRE-perioden där du jobbar deltid. Utag från denna linje börjar vid [X] år (efter hela bridge-perioden). - om Coast FIRE täcker hela bridge-perioden
- Vid [X] år börjar du ta ut från denna linje för att täcka utgifter. - om ingen Coast FIRE eller Coast FIRE täcker inte hela bridge-perioden

**Kapitalutveckling under uttag:**
- Under uttagsperioden (mellan [X]-[X] år, [X] år) växer/minskar ditt tillgängliga kapital med [X]%.
- ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer. - om negativ tillväxt

**Kapitalutveckling under bridge-period:**
- Under bridge-perioden (mellan [X]-[X] år, [X] år) växer/minskar ditt tillgängliga kapital med [X]%.
- ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer. - om negativ tillväxt

**Coast FIRE täcker hela bridge-perioden:**
- Under hela bridge-perioden ([X] år) växer ditt kapital eftersom du täcker utgifter med deltidsarbete istället för uttag.

**Lägsta värde:**
- Kapitalet når sitt lägsta värde vid [X] år ([formaterat belopp]), sedan växer det igen när uttagen minskar eller avkastningen ökar.

**Marknadsbaserad pension:**
- Den **gröna linjen (Marknadsbaserad pension)** växer hela tiden tills den slås ihop med tillgängligt vid [X] år.

**Statlig pension:**
- Den **gula linjen (Statlig pension)** visar inkomstpensionen som minskar ditt behov av uttag efter [X] år. - om statlig pension hjälper

**Total:**
- Den **svarta linjen (Total)** visar summan av allt. Den ska överskrida 4%-kravet ([formaterat belopp]) vid eller före [X] år.

**Om ingen bridge-period:**
- Du når ekonomisk frihet vid eller efter pensionsålder. Alla tillgångar är redan tillgängliga.

#### 2.2.5 Riskvarningar och vad man ska tänka på

**Rubrik:**
- ⚠️ Vad ska du tänka på?

**Coast FIRE-info (om aktivt):**

**Om Coast FIRE täcker hela bridge-perioden:**
- **🌊 Coast FIRE-period ([X] år):** Under de första [X] åren efter [X] år jobbar du deltid för att täcka utgifter. Kapitalet växer utan uttag, vilket hjälper till att nå 4%-kravet.
- ✅ Du täcker hela bridge-perioden med deltidsarbete! Detta eliminerar risken för uttag under bridge-perioden.

**Om Coast FIRE hjälper betydligt:**
- **🌊 Coast FIRE-period ([X] år):** Under de första [X] åren efter [X] år jobbar du deltid för att täcka utgifter. Kapitalet växer utan uttag, vilket hjälper till att nå 4%-kravet.
- 💡 Detta kan minska risken, eftersom kapitalet får växa en period utan uttag innan uttag börjar.

**Om Coast FIRE hjälper:**
- **🌊 Coast FIRE-period ([X] år):** Under de första [X] åren efter [X] år jobbar du deltid för att täcka utgifter. Kapitalet växer utan uttag, vilket hjälper till att nå 4%-kravet.
- 💡 Detta kan minska risken, eftersom kapitalet får växa en period utan uttag.

**Uttagsnivå (om inte Coast FIRE täcker hela bridge-perioden):**

**Om >5%:**
- **Uttagsnivå (mellan [X]-[X] år):** Du tar ut [X]% per år från ditt tillgängliga kapital [efter Coast FIRE-perioden].
- ⚠️ Detta är en hög uttagsnivå. Uttag över cirka 5 % per år förknippas i många studier med ökad risk att kapitalet tar slut. I simulatorn kan du testa hur olika nivåer på sparande, utgifter, arbetsår eller Coast FIRE-period påverkar resultatet.

**Om 4-5%:**
- **Uttagsnivå (mellan [X]-[X] år):** Du tar ut [X]% per år från ditt tillgängliga kapital [efter Coast FIRE-perioden].
- 💡 Detta ligger över den ofta använda 4 %-regeln som riktmärke. Om marknaden utvecklas svagt kan det bli ansträngt. I simulatorn kan du testa effekten av till exempel större buffert, lägre uttag eller längre Coast FIRE-period.

**Om ≤4%:**
- **Uttagsnivå (mellan [X]-[X] år):** Du tar ut [X]% per år från ditt tillgängliga kapital [efter Coast FIRE-perioden].
- 💡 Detta ligger inom den ofta använda 4 %-regeln som riktmärke i FIRE-diskussioner. Det är dock ingen garanti för att kapitalet alltid räcker.

**Kapitalbuffert (om inte Coast FIRE täcker hela bridge-perioden):**

**Om buffert <10%:**
- **Kapitalbuffert vid start:** Du har [X]% buffert över det minsta som behövs för bridge-perioden.
- ⚠️ Detta är en relativt liten buffert. Om marknaden utvecklas svagt kan det bli kännbart. I simulatorn kan du testa hur en större buffert, ändrade utgifter eller längre arbetsliv påverkar utfallet.

**Om buffert 10-20%:**
- **Kapitalbuffert vid start:** Du har [X]% buffert över det minsta som behövs för bridge-perioden.
- 💡 Detta är en mellanstor buffert. En större buffert kan ge mer motståndskraft vid nedgångar, men eliminerar inte risken.

**Om buffert >20%:**
- **Kapitalbuffert vid start:** Du har [X]% buffert över det minsta som behövs för bridge-perioden.
- 💡 Detta är en större buffert som kan ge ökad motståndskraft vid marknadsnedgångar, men den tar inte bort risken helt.

**Stor tillväxt krävs:**

**Om >100%:**
- **Stor tillväxt krävs [period-text]:** Ditt kapital behöver växa med [X]% [under uttagsperioden/från nuvarande värde] för att nå 4%-kravet.
- ⚠️ Detta är mycket! Det kräver en genomsnittlig real avkastning på över [X]% per år. I simulatorn kan du testa hur olika nivåer på sparande [eller arbetsår] eller Coast FIRE-period påverkar resultatet.

**Om 50-100%:**
- **Stor tillväxt krävs [period-text]:** Ditt kapital behöver växa med [X]% [under uttagsperioden/från nuvarande värde] för att nå 4%-kravet.
- 💡 Detta kräver en genomsnittlig real avkastning på [X]% per år. Det är möjligt men inte garanterat. I simulatorn kan du testa effekten av till exempel ändrade utgifter [eller längre arbetsliv] eller längre Coast FIRE-period.

**Bra läge (om tillväxt ≤30% och 4%-regeln nås):**
- **Bra läge [period-text]:** Ditt kapital behöver växa med [X]% för att nå 4%-kravet. I många historiska scenarier har detta ansetts vara en försiktigare nivå, men det finns inga garantier.

**Manuell justering (om manuellt justerat och skiljer sig från beräknat):**
- **Manuell justering:** Du har satt FIRE-åldern till [X] år, men beräkningen visar att du kan nå det vid [X] år.
- 💡 Genom att jobba [X] år extra bygger du en större buffert, vilket kan minska risken. - om manuellt är senare
- 💡 Genom att starta [X] år tidigare ökar du risken eftersom du har mindre kapital. - om manuellt är tidigare

#### 2.2.6 Vad händer när du drar i reglagen?

**Rubrik:**
- 🎛️ Vad händer när du drar i reglagen?

**Lista:**
- **Öka månadssparande:** Den blå linjen växer snabbare, FIRE-åldern minskar, och du får mer kapital vid frihet.
- **Öka avkastning:** Alla linjer växer snabbare. Högre avkastning = tidigare FIRE, men också högre risk.
- **Öka utgifter:** Du behöver mer kapital vid frihet, FIRE-åldern ökar, och withdrawal rate blir högre.
- **Öka pensionsålder:** Bridge-perioden blir längre, du behöver mer kapital vid frihet, men pensionstillgångarna hinner växa mer.
- **Justera startålder:** Flytta FIRE framåt = mer kapital men senare start. Flytta bakåt = tidigare start men mindre kapital.
- **Coast FIRE:** Aktivera för att se hur deltidsarbete under bridge-perioden påverkar kapitalutvecklingen. - om Coast FIRE är aktiverat

#### 2.2.7 Graf

**Axlar:**
- X-axel: Ålder
- Y-axel: Belopp (realt)

**Linjer:**
- Tillgängligt (brun, solid)
- Marknadsbaserad pension (blå, streckad)
- Statlig pension (inkomst) (ljusblå, streckad)
- Total (grå, streckad)

**Referenslinjer:**
- Pensionsstart (vertikal, brun)
- 4%-krav (horisontell, grön, streckad)
- Total når 4% (vertikal, grön, streckad) - om tillämpligt
- Tillgängligt når 4% (vertikal, brun, streckad) - om tillämpligt
- FIRE (vertikal, orange) - om FIRE är uppnåelig
- Kapital förbrukat (vertikal, röd, streckad) - om kapital tar slut

**Områden:**
- Bridge-period (orange, transparent) - om FIRE < pensionsålder
- Coast FIRE-period (grön, transparent) - om Coast FIRE är aktiverat
- Pensionsperiod (blå, transparent) - från pensionsstart

**Tooltip (dynamisk baserat på linje och ålder):**

**Tillgängligt:**
- [formaterat belopp]
- Kapital som kan användas före pension
- + Sparande: [formaterat belopp] - om >0
- + Avkastning ([X]%): [formaterat belopp] - om >0
- - Utbetalningar: [formaterat belopp]/år - om >0
- 🌊 Coast FIRE: ingen uttag - om i Coast FIRE-period
- ⭐ Når 4%-kravet - om detta är året när tillgängligt når 4%
- ⚠️ Kapital tar slut - om detta är året när kapital tar slut
- 🔄 [Tjänstepension/IPS] har flyttats över till tillgängligt - om detta är året när pensionsdel flyttas över

**Marknadsbaserad pension:**
- [formaterat belopp]
- [Tjänstepension + Premiepension + IPS] - före pensionsstart
- Alla pensionsdelar har överförts till tillgängligt - efter pensionsstart
- + Avsättningar: [formaterat belopp] - om >0
-   (Tjänste: [belopp], Premie: [belopp], IPS: [belopp]) - om separata avsättningar
- + Avkastning: [formaterat belopp] - om >0
-   (Tjänste: [X]%, Premie: [X]%, IPS: [X]%) - om separata avkastningar
- ℹ️ Slås ihop vid pension - om vid pensionsstart
- ℹ️ Låst tills pension (uttag från 55 år möjligt) - om före pensionsstart

**Statlig pension (inkomst):**
- Före pension: [formaterat belopp]
- Inkomstpension (statlig)
- + Avsättning: [formaterat belopp] - om >0
- + Avkastning ([X]%): [formaterat belopp] - om >0
- Efter pension: [formaterat belopp]/år
- ([formaterat belopp]/mån)
- ℹ️ Utbetalning per år (minskar uttag)

**Total:**
- [formaterat belopp]
- Totalt kapital
- + Insättningar: [formaterat belopp] - om >0
- + Avkastning: [formaterat belopp] - om >0
- - Utbetalningar: [formaterat belopp]/år - om >0
- + Statlig pension: [formaterat belopp]/år - om efter pension
- ⭐ Når 4%-kravet - om detta är året när total når 4%

**Label-formatter:**
- Ålder: [X] år
- ⭐ Total når 4% - om detta är året
- ⭐ Tillgängligt når 4% - om detta är året (och inte samma som total)
- ⚠️ Kapital förbrukat - om detta är året

#### 2.2.8 Startålder för ekonomisk frihet

**Label:**
- Startålder för ekonomisk frihet (simulering)

**Info-icon tooltip:**
- Startålder för ekonomisk frihet
- Detta är åldern när du enligt simuleringen når ekonomisk frihet (FIRE) och teoretiskt skulle kunna sluta jobba om antagandena håller.
- Du kan justera denna ålder för att se vad som händer om du:
- • Väntar längre: Mer kapital vid start, men senare frihet
- • Startar tidigare: Tidigare frihet, men mindre kapital och högre risk
- Om du sätter en tidigare ålder än beräkningen visar, ökar risken eftersom du har mindre kapital. Om du sätter en senare ålder, bygger du en större buffert som kan minska risken.

**Värde:**
- [X] år (manuellt justerat) - om manuellt justerat
- [X] år (beräknat) - om inte manuellt justerat

**Slider:**
- Min: [beräknat år - 5] eller [genomsnittlig ålder]
- Max: [pensionsålder]

**Återställ-knapp:**
- Återställ till beräknat

---

### 2.3 FIRE-info-sidan

#### 2.3.1 Header

**Huvudrubrik:**
- Om FIRE-beräkningen

**Disclaimer (längst upp efter huvudrubriken):**
- Observera: FIRE-simulatorn är en förenklad modell. Alla beräkningar bygger på dina inmatade uppgifter och tekniska antaganden. Resultaten är inte en prognos, garanti eller personlig finansiell rådgivning.

**Tillbaka-knapp:**
- Tillbaka

#### 2.3.2 Vad är ekonomisk frihet?

**Rubrik:**
- Vad är ekonomisk frihet?

**Text:**
- Ekonomisk frihet handlar om att ha tillräckligt med kapital för att kunna leva livet på dina egna villkor – utan att behöva vara beroende av din lön eller månadsinkomst.
- Det handlar inte nödvändigtvis om att sluta jobba tidigt, utan om att skapa trygghet, frihet och tid att göra det du verkligen vill. Att kunna välja arbete, byta karriär, eller lägga mer tid på familj, passioner och det som ger dig mening i livet.
- Beräkningen är baserad på FIRE-principer (Financial Independence, Retire Early), men fokus är på frihet och valfrihet – inte bara "tidigt pensionerad".
- Detta verktyg hjälper dig att förstå din faktiska förmögenhet och gör en förenklad uppskattning av när du potentiellt kan uppnå ekonomisk frihet baserat på dina tillgångar, sparande och utgifter.
- Simulatorn passar dig som vill få en känsla för när ditt sparande skulle kunna ge dig större frihet i vardagen.

#### 2.3.3 Grundprinciper

**Rubrik:**
- Grundprinciper

**Kärnan i FIRE:**
- 💡 Kärnan i FIRE
- Kärnan i FIRE är balansen mellan sparande, utgifter och avkastning. Genom att leva under dina tillgångar och investera skillnaden växer ditt kapital över tid genom ränta-på-ränta-effekten.
- När ditt investerade kapital kan täcka dina utgifter – utan att du behöver jobba – har du nått ekonomisk frihet. Det är då du har FIRE: tillräckligt för att leva, oavsett inkomst.

**Allt räknas i dagens penningvärde:**
- 📊 Allt räknas i dagens penningvärde (realt)
- Detta verktyg konverterar nominell avkastning till real avkastning genom att justera för inflation. Detta gör att beräkningarna inte påverkas av penningvärdets förändring över tid.

**Tre + statlig pensionsdelar för kapital:**
- 💰 Tre + statlig pensionsdelar för kapital
- Vi delar upp ditt kapital i tre marknadsbaserade pensionsdelar plus statlig pension som behandlas olika:
- **Tillgängligt kapital:** Övriga tillgångar (fonder, aktier, sparkonton, bostad) som du kan använda före pension. Bostaden räknas med till 40 % av nettovärdet eftersom bostadskapital inte alltid är lätt att frigöra. Andra skulder än bostadslån fördelas först proportionellt över alla positiva tillgångar, sedan räknas 40 % av bostadens nettovärde med.
- **Marknadsbaserad pension (tre separata pensionsdelar):**
  - **Tjänstepension:** Låst tills pensionsåldern (eller tidigare om du väljer att börja ta ut från 55 år)
  - **Premiepension:** Låst tills pensionsåldern
  - **IPS (Privat pensionssparande):** Låst tills pensionsåldern (eller tidigare om du väljer att börja ta ut från 55 år)
- Dessa tre pensionsdelar växer var för sig med sina egna avkastningar och inbetalningar. Vid pensionsstart slås de ihop med tillgängligt kapital.
- **Statlig pension (inkomstpension):** Den statliga inkomstpensionen växer fram till pensionsstart enligt de regler som gäller för inkomst- och balansindex och omvandlas sedan till en årlig inkomst som minskar ditt behov av uttag från portföljen. I modellen används ett försiktigt antagande om real tillväxt. Det är ett tekniskt antagande – inte en prognos eller garanti.

**Viktad avkastning per pensionsdel:**
- 📈 Viktad avkastning per pensionsdel
- Varje pensionsdel har sin egen beräknad avkastning baserat på dina faktiska tillgångar och deras förväntade avkastning. Beräkningen tar hänsyn till:
- **Nettovärden:** För tillgängligt kapital räknas vi med nettovärden (tillgångar minus relaterade skulder). Till exempel: bostad minus bostadslån, bil minus billån.
- **Proportionell fördelning:** Övriga skulder (som inte är kopplade till specifika tillgångar) fördelas proportionellt över alla positiva nettovärden (bostad, bil, övriga tillgångar).
- **Viktat snitt:** Avkastningen beräknas som ett viktat snitt baserat på varje tillgångs värde och förväntad avkastning.
- Detta kan ge en mer nyanserad bild än att använda en enda genomsnittlig avkastning för allt.

**Ränta-på-ränta:**
- ⚡ Ränta-på-ränta – varför tid är din bästa vän
- Ränta-på-ränta är den starkaste kraften i FIRE. När du investerar får du avkastning på både ditt ursprungliga belopp och den avkastning du redan fått. Med tiden växer effekten exponentiellt – varje år växer "snöbollen" snabbare.
- Ju tidigare du börjar, desto mindre behöver du spara varje månad. Tiden gör det mesta av jobbet åt dig.

#### 2.3.4 Hur beräknar vi när du kan nå ekonomisk frihet?

**Rubrik:**
- Hur beräknar vi när du kan nå ekonomisk frihet?

**1. Startvärden:**
- Vi börjar med din nuvarande nettoförmögenhet uppdelad i tre marknadsbaserade pensionsdelar plus statlig pension:
- **Tillgängligt kapital:** Tillgångar som inte är pensionslåsta (fonder, aktier, sparkonton, bostad) minus skulder. Andra skulder än bostadslån fördelas först proportionellt över alla positiva tillgångar, sedan räknas 40 % av bostadens nettovärde med.
- **Marknadsbaserad pension (tre separata pensionsdelar):**
  - **Tjänstepension:** Växer med egen avkastning och inbetalningar tills pensionsåldern (eller tidigare uttag från 55 år)
  - **Premiepension:** Växer med egen avkastning och inbetalningar tills pensionsåldern
  - **IPS (Privat pensionssparande):** Växer med egen avkastning och inbetalningar tills pensionsåldern (eller tidigare uttag från 55 år)
- **Statlig pension (inkomstpension):** Den statliga inkomstpensionen växer fram till pensionsstart enligt de regler som gäller för inkomst- och balansindex och omvandlas sedan till en årlig inkomst som minskar ditt behov av uttag från portföljen. I modellen används ett försiktigt antagande om real tillväxt. Det är ett tekniskt antagande – inte en prognos eller garanti.

**2. Månatliga insättningar tills ekonomisk frihet:**
- Varje månad tills ekonomisk frihet nås:
- **Sparande:** [formaterat belopp]/mån (inkluderar [formaterat belopp]/mån i amortering) går till tillgängligt kapital
- **Marknadsbaserad pensionsavsättning (tre separata pensionsdelar):**
  - **Tjänstepension:** [formaterat belopp]/mån baserat på dina löneinkomster
  - **Premiepension:** [formaterat belopp]/mån (obligatorisk del av allmän pension)
  - **IPS (Privat pensionssparande):** [formaterat belopp]/mån baserat på dina registrerade IPS-inbetalningar
- **Statlig pensionsavsättning:** [formaterat belopp]/mån går till inkomstpensionen (den statliga delen)
- Obs: Amortering räknas både som sparande (ökar nettoförmögenheten) och reducerar utgifter. Pensionsavsättningarna delas automatiskt upp mellan de tre marknadsbaserade pensionskategorierna och statlig pension baserat på dina registrerade inkomster.

**3. Avkastning på kapital:**
- Varje år växer kapitalet med beräknad real avkastning (nominell avkastning minus inflation):
- **Tillgängligt kapital:** [X]% real (tills ekonomisk frihet nås). Beräknas från nettovärden per kategori (bostad, bil, övrigt) med proportionell fördelning av övriga skulder.
- **Marknadsbaserad pension (tre separata avkastningar):**
  - **Tjänstepension:** Beräknas som viktat snitt från dina tjänstepensionstillgångar
  - **Premiepension:** Beräknas som viktat snitt från dina premiepensionstillgångar
  - **IPS (Privat pensionssparande):** Beräknas som viktat snitt från dina IPS-tillgångar
- I manuellt läge kan du justera avkastningen för varje kategori separat i simulatorn.
- **Statlig pension:** [X] % real (defaultvärde motsvarande ca 3 % real om inga egna uppgifter finns). Följer balansindex och är generellt lägre än marknadsbaserad pension.
- I automode räknas avkastning per pensionsdel ut automatiskt. I manuellt läge visas tre separata reglage för tjänstepension, premiepension och IPS – de styr respektive pensionsdel i simuleringen.

**4. Beräknade utgifter:**
- Månadsutgifter beräknas som: **Nettoinkomst − Sparande − Amortering**
- Du kan justera detta manuellt i simulatorn. Just nu: **[formaterat belopp]/mån**

**5. Kriterier för ekonomisk frihet – båda måste uppfyllas:**

**🌉 Bro till pension:**
- Tillgängligt kapital måste räcka att täcka dina årliga utgifter ([formaterat belopp]) varje år från det år du når ekonomisk frihet fram till pensionsåldern [X] år, **utan att ta slut**.
- Detta testas genom att simulera år-för-år med beräknad avkastning och uttag.

**📊 4%-krav vid pension:**
- Vid pensionsstart måste minst **[formaterat belopp]** finnas tillgängligt.
- Detta motsvarar 25 års utgifter ([formaterat belopp]) enligt 4%-regeln, **minus** den statliga pensionen som utbetalas som inkomst. Om du har statlig pension som ger inkomst minskar därför behovet av kapital.

**Fyraprocentregeln – ett riktmärke, inte en garanti:**
- Regeln bygger på forskning som visar att om du tar ut cirka 4% av ditt investerade kapital per år (inflationsjusterat) så har pengarna historiskt räckt i minst 30 år.
- Men – det är just en **tum-regel**, baserad på historiska data från aktie- och obligationsmarknader. Framtida avkastning kan variera, och verkligheten påverkas av inflation, skatter, avgifter och individuella val.
- I denna simulator används regeln för att uppskatta när ditt kapital kan klara sig "för evigt" – men det är bara ett stöd för att förstå din ekonomiska bana, inte ett facit.

#### 2.3.5 Faserna efter att du nått ekonomisk frihet

**Rubrik:**
- Faserna efter att du nått ekonomisk frihet

**🌉 Bridge-period (ekonomisk frihet → Pension):**
- **Pensionsinbetalningar stoppas** – inga nya insättningar till pension (året du når ekonomisk frihet är sista året med inbetalningar)
- **Lever på tillgängligt kapital** – årliga uttag motsvarar dina utgifter
- **Pension växer endast med avkastning** – de tre pensionsdelarna (tjänstepension, premiepension, IPS) fortsätter växa med sina respektive reala avkastningar
- **Tidiga uttag:** Om du väljer att börja ta ut tjänstepension eller IPS från 55 år, flyttas dessa belopp över till tillgängligt kapital vid den åldern. Om du tar ut t.ex. tjänstepension redan vid 55 räknar simulatorn med att du därefter inte fortsätter betala in på just den tjänstepensionen, utan att de pengarna i stället hamnar i ditt vanliga sparande.
- **Avkastning på tillgängligt:** [X]% real (behåller din höga avkastning) - om högre än 7% nominell
- **Avkastning på tillgängligt:** [X]% real (minst 7% nominell) - om lägre än 7% nominell
- **Normal årsövergång:** I själva FIRE-beräkningen används en halvårs-buffert för att hitta året då du kan sluta, men i den år-för-år-grafen efteråt används en normal årsövergång för att den ska bli lättare att läsa.

**🌊 Coast FIRE – en mjukare väg till ekonomisk frihet:**
- Coast FIRE är en variant av FIRE för den som inte vill jobba ihjäl sig i unga år, utan hellre tar det lugnare men fortfarande siktar mot ekonomisk frihet.
- **Idén:**
- Du sparar och investerar tillräckligt tidigt i livet så att du kan "coasta" mot full ekonomisk frihet. Om du slutar spara nytt kapital idag, kommer ditt redan investerade kapital växa av sig självt (tack vare ränta-på-ränta) tills du når FIRE-målet vid pension.
- **I denna simulator:**
- **Inga uttag från kapital** – under Coast FIRE-perioden görs inga uttag från tillgängligt kapital
- **Inget nytt sparande** – allt sparande stoppas under Coast FIRE-perioden
- **Reducerad pensionsavsättning** – pensionsavsättningarna justeras utifrån antagandet att deltidsarbete ger en lägre pensionsgrundande inkomst
- **Deltidsarbete** – du jobbar deltid för att täcka dina utgifter, men behöver inte spara mer
- **Kapitalet växer** – ditt investerade kapital fortsätter växa med avkastning, medan du "coastar" mot målet
- Coast FIRE-perioden visas i grafen som ett markerat område (grön skugga) under bridge-perioden. När Coast FIRE-perioden är slut, återgår du till normala uttag från tillgängligt kapital.

**🎯 Efter pensionsstart:**
- **Sammanslagning:** Tillgängligt kapital och de tre marknadsbaserade pensionsdelarna (tjänstepension, premiepension, IPS) växer det året och slås sedan ihop till en portfölj vid pensionsstart
- **Statlig pension som inkomst:** Den statliga inkomstpensionen modelleras som en årlig inkomst över ett valt antal år (t.ex. 20 år vid 63 års ålder). I verkligheten betalas allmän pension normalt ut livsvarigt, men här används en förenklad, tidsbegränsad period för att göra beräkningarna hanterbara. Denna inkomst minskar ditt behov av uttag från portföljen.
- **Årliga uttag:** Motsvarar dina utgifter **minus** statlig pension och görs från den sammanfogade portföljen
- **Avkastning:** Hela poolen växer med samma avkastning som tillgängliga tillgångar hade efter ekonomisk frihet ([X]% real eller [X]% real (7% nominell minimum))
- **4%-regeln:** Modellen testar om portföljen skulle klara uttag på 4 % per år under en mycket lång tidsperiod, givet antagandena och med hänsyn till att statlig pension täcker en del av utgifterna

#### 2.3.6 Avkastning efter ekonomisk frihet

**Rubrik:**
- Avkastning efter ekonomisk frihet

**Text:**
- När ekonomisk frihet uppnås använder modellen **minst 7 % nominell avkastning** på tillgängliga tillgångar för att kunna testa 4 %-uttag på ett enhetligt sätt.

**Regler:**
- Om din ursprungliga avkastning är **högre än 7 % nominell** behåller modellen denna högre nivå.
- Om din ursprungliga avkastning är **lägre än 7 % nominell** höjs den i simuleringen till 7 % nominell.
- När en låst pensionsdel blir uttagsbar och flyttas till den vanliga portföljen höjs dess avkastning i simuleringen till minst den nivå som används efter FIRE (7 % nominellt), så att låsta delar med låg avkastning inte drar ned hela portföljen. När kapital slås ihop från flera källor beräknas en gemensam avkastning som ett viktat snitt av delarna.

**Förtydligande:**
- Detta är en teknisk förenkling för att kunna illustrera 4 %-regeln – inte en prognos eller garanti om framtida avkastning.

#### 2.3.7 Det holistiska perspektivet

**Rubrik:**
- Det holistiska perspektivet

**Text:**
- FIRE handlar inte bara om pengar. Det är ett sätt att tänka kring livets resurser – tid, energi och värderingar.
- Målet är inte bara att "inte behöva jobba", utan att leva mer medvetet: att kunna välja arbete, skapa trygghet för familjen, eller ge utrymme åt passioner.
- Ekonomisk frihet ger handlingsfrihet – inte krav på att sluta jobba, utan möjligheten att göra det du verkligen vill.
- Detta verktyg hjälper dig att få en tydlig bild av din ekonomiska verklighet så att du kan fatta medvetna beslut om hur du vill leva ditt liv.

#### 2.3.8 Vad ingår i beräkningen?

**Rubrik:**
- Vad ingår i beräkningen?

**✅ Data från ditt hushåll:**
- Tillgångar (värde + förväntad årlig avkastning (APY))
- Skulder och amortering
- Inkomster
- Pensionsavsättningar
- Ålder för hushållets medlemmar
- Tidiga uttagsåldrar för tjänstepension och IPS

**⚙️ Beräkningar och antaganden:**
- Skatter beräknade utifrån svenska skatteregler i förenklad form
- Nettoinkomst efter skatt
- Viktad avkastning från tillgångar
- Real avkastning (nominell − inflation)
- Konfigurerbar inflation, pensionsålder, utgifter

#### 2.3.9 Varning

**Text:**
- **⚠️ Viktigt:** FIRE bygger på antaganden om avkastning, inflation och livslängd. Historisk avkastning är ingen garanti för framtiden.
- Använd denna simulering som ett verktyg för att förstå och planera, inte som en exakt prognos. Det verkliga målet är att skapa frihet, inte perfektion – se simulatorn som ett sätt att få perspektiv, inte ett facit.

---

## 3. REGLAGE OCH INSTÄLLNINGAR I FIRE-SIMULATORN

### 3.1 Tillgängligt kapital

**Label:**
- Tillgängligt kapital

**Beskrivning:**
- Kapital som kan användas före pension (40% av bostadens nettovärde räknas med)

**Info-icon tooltip:**
- Tillgängligt kapital
- Detta är kapital som inte är pensionslåst och kan användas före pensionsåldern. Bostaden räknas med till 40 % av nettovärdet eftersom bostadskapital inte alltid är lätt att frigöra.

**Avkastning (Auto-läge):**
- Auto: [X]% real (viktat snitt från tillgängliga tillgångar)

**Avkastning (Manuellt läge):**
- Justera fritt med reglaget

### 3.2 Marknadsbaserad pension

**Label:**
- Marknadsbaserad pension

**Beskrivning:**
- Tjänstepension, premiepension och IPS. Tjänstepension och IPS kan i många avtal tas ut från cirka 55 års ålder, medan premiepension följer samma lägsta ålder som allmän pension (kring 63–65 år beroende på födelseår).

**Info-icon tooltip:**
- Marknadsbaserad pension
- Detta är tre separata pensionsdelar: tjänstepension, premiepension och IPS. De växer var för sig med sina egna avkastningar och inbetalningar. Vid pensionsstart slås de ihop med tillgängligt kapital.

**Avkastning (Auto-läge):**
- Auto: [X]% real (viktat snitt från pensionsstillgångar)

**Avkastning (Manuellt läge):**
- Tre separata reglage:
  - Tjänstepension: [X]% real
  - Premiepension: [X]% real
  - IPS: [X]% real

### 3.3 Statlig pension

**Label:**
- Statlig pension (inkomstpension)

**Beskrivning:**
- Växer fram till pensionen och blir sedan årlig inkomst

**Info-icon tooltip:**
- Statlig pension
- Den statliga inkomstpensionen växer fram till pensionsstart enligt de regler som gäller för inkomst- och balansindex och omvandlas sedan till en årlig inkomst som minskar ditt behov av uttag från portföljen. I modellen används ett försiktigt antagande om real tillväxt om du inte anger något annat, men detta är endast ett tekniskt antagande – inte en prognos eller garanti.

**Avkastning:**
- [X] % real (defaultvärde motsvarande ca 3 % real om inga egna uppgifter finns). I modellen används ett försiktigt antagande om real tillväxt, men detta är endast ett tekniskt antagande – inte en prognos eller garanti.

### 3.4 Månadssparande

**Label:**
- Månadssparande

**Beskrivning:**
- Sparande + amortering som går till tillgängligt kapital

**Info-icon tooltip:**
- Månadssparande
- Detta är ditt månatliga sparande plus amortering. Detta belopp går till tillgängligt kapital varje månad tills ekonomisk frihet nås.

**Värde (Auto-läge):**
- Auto: [formaterat belopp]/mån

**Värde (Manuellt läge):**
- Justera fritt med reglaget

### 3.5 Månadsutgifter

**Label:**
- Månadsutgifter

**Beskrivning:**
- Beräknas som: Nettoinkomst − Sparande − Amortering

**Info-icon tooltip:**
- Månadsutgifter
- Detta är dina månatliga utgifter. De beräknas automatiskt som nettoinkomst minus sparande minus amortering, men du kan justera dem manuellt.

**Värde:**
- [formaterat belopp]/mån

### 3.6 Pensionsålder

**Label:**
- Pensionsålder

**Beskrivning:**
- Ålder när statlig pension och marknadsbaserad pension blir tillgänglig

**Info-icon tooltip:**
- Pensionsålder
- Detta är åldern när du kan börja ta ut statlig pension och när marknadsbaserad pension slås ihop med tillgängligt kapital.

**Värde:**
- [X] år

### 3.7 Inflation

**Label:**
- Inflation

**Beskrivning:**
- Används för att beräkna real avkastning

**Info-icon tooltip:**
- Inflation
- Detta är den förväntade årliga inflationen. Den används för att konvertera nominell avkastning till real avkastning.

**Värde:**
- [X]%/år

### 3.8 Coast FIRE

**Label:**
- Coast FIRE

**Beskrivning:**
- Simulera deltidsarbete under bridge-perioden

**Info-icon tooltip:**
- Coast FIRE
- Coast FIRE är en variant där du jobbar deltid under bridge-perioden för att täcka utgifter, medan kapitalet växer utan uttag. Detta kan minska risken och kan hjälpa till att nå 4%-kravet.

**Switch:**
- Av/På

**När aktiverat:**

**Coast FIRE-period (år):**
- Label: Coast FIRE-period (år)
- Beskrivning: Hur många år efter FIRE ska du jobba deltid?
- Värde: [X] år

### 3.9 Tidiga uttag

**Tjänstepension:**
- Label: Tjänstepension (tidig uttag)
- Beskrivning: Ålder när tjänstepension kan börja tas ut (ofta 55 år)
- Värde: [X] år

**IPS:**
- Label: IPS (tidig uttag)
- Beskrivning: Ålder när IPS kan börja tas ut (ofta 55 år)
- Värde: [X] år

### 3.10 Statlig pensionsutbetalning

**Label:**
- Statlig pensionsutbetalning (år)

**Beskrivning:**
- Hur många år statlig pension ska modelleras som utbetalning i simuleringen. I verkligheten betalas allmän pension normalt ut livsvarigt, men här används en förenklad, tidsbegränsad period för att göra beräkningarna hanterbara.

**Info-icon tooltip:**
- Utbetalningsperiod för statlig pension
- Detta är antalet år som statlig pension antas utbetalas i modellen (t.ex. 20 år). I verkligheten betalas allmän pension normalt ut så länge du lever. Här använder vi en förenkling där utbetalningen sprids över ett valt antal år.

**Värde:**
- [X] år

---

## 4. VILLKORLIG TEXT OCH DYNAMISKA MEDDELANDEN

### 4.1 Sparkalkylatorn

**Milstolpe-meddelanden (dynamiska):**
- "Första 100 000 kr" - när 100 000 kr nås
- "250 000 kr" - när 250 000 kr nås
- "Halv miljon" - när 500 000 kr nås
- "Första miljonen!" - när 1 000 000 kr nås
- "2,5 miljoner" - när 2 500 000 kr nås
- "5 miljoner" - när 5 000 000 kr nås
- "10 miljoner!" - när 10 000 000 kr nås
- "Avkastning överstiger insättningar" - när årsavkastningen överstiger årsinsättningarna
- Det kan ses som en vändpunkt där avkastningen börjar bidra mer till ökningen än dina nya insättningar.

**Auto/Manuell-läge text:**
- Alla beskrivningar ändras baserat på om Auto eller Manuellt läge är valt
- I Auto-läge: Visar faktiska värden från hushållet
- I Manuellt läge: Mer specifika formuleringar per fält (t.ex. "Ange eller justera beloppet fritt med reglaget", "Ange eller justera hur mycket du sparar varje månad", "Justera den förväntade årliga avkastningen")

**Inflation på/av:**
- När inflation är på: Visar real avkastning
- När inflation är av: Visar nominell avkastning

### 4.2 FIRE-simulatorn

**Status-meddelanden (dynamiska):**

**Om FIRE är uppnåelig:**
- Badge och progress baserat på år till FIRE
- År till FIRE med beskrivning
- Viktigt-meddelande alltid synligt

**Om FIRE inte är uppnåelig:**
- "Ekonomisk frihet är inte uppnåelig med nuvarande antaganden."
- "Överväg att öka sparandet, minska utgifterna eller justera avkastningsförväntningarna."

**Graf-analys (dynamisk):**
- Olika meddelanden baserat på:
  - Om bridge-period finns
  - Om Coast FIRE är aktiverat
  - Om kapitalet växer eller minskar
  - Om 4%-regeln nås
  - Om kapital tar slut

**Riskvarningar (dynamiska):**
- Olika nivåer av varningar baserat på:
  - Uttagsnivå (>5%, 4-5%, ≤4%)
  - Kapitalbuffert (<10%, 10-20%, >20%)
  - Tillväxtkrav (>100%, 50-100%, ≤30%)
  - Om Coast FIRE täcker hela bridge-perioden

**Tooltip-text (dynamisk):**
- Olika detaljer baserat på:
  - Vilken linje som hovras
  - Vilken ålder som hovras
  - Om det är före/efter pension
  - Om det är ett milstolpe-år
  - Om pensionsdelar flyttas över

---

## 5. OBSERVATIONER OCH ANTECKNINGAR

### 5.1 Gemensamma mönster

- Båda kalkylatorerna använder "Auto/Manuell"-läge för att växla mellan faktiska värden och experiment
- Båda visar resultat i "dagens penningvärde" (realt) när inflation är aktiverad
- Båda har interaktiva grafer med tooltips som visar detaljerad information
- Båda har "vad händer om"-funktionalitet för att testa scenarier

### 5.2 Skillnader

- Sparkalkylatorn fokuserar på ränta-på-ränta och milstolpar
- FIRE-simulatorn fokuserar på ekonomisk frihet och komplexa pensionsscenarier
- FIRE-simulatorn har mer avancerad riskanalys och varningar
- FIRE-simulatorn har Coast FIRE-funktionalitet

### 5.3 Disclaimers och varningar

- Båda kalkylatorerna har tydliga disclaimers om att beräkningarna är förenklade och inte garanterar resultat
- FIRE-simulatorn har mer omfattande varningar om risker och antaganden
- Båda betonar att verktygen är för planering, inte exakta prognoser

---

*Detta dokument innehåller all text från sparkalkylatorn och FIRE-simulatorn per denna datum. Text kan variera baserat på användarens val och hushållsdata.*

