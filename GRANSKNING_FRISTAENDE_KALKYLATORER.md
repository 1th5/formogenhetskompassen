# Granskning av textinnehåll i fristående kalkylatorer

Detta dokument innehåller all text från de tre fristående kalkylatorerna:
1. Sparkalkylatorn (ränta-på-ränta) - `/savings`
2. FIRE-kalkylatorn (ekonomisk frihet) - `/fire`
3. Lönekalkylatorn (lön efter skatt & pension) - `/salary`

**Notera:** Hjälpsidan för FIRE-kalkylatorn (`/dashboard/fire/info`) har redan granskats och ingår inte här.

---

## 1. SPARKALKYLATORN (Ränta-på-ränta)

### 1.1 Header-sektion

**Huvudrubrik:**
- Sparkalkylator (ränta-på-ränta)

**Undertext:**
- Se hur ditt sparande kan växa över tid med ränta-på-ränta-effekten.

**Minidisclaimer (direkt under undertexten):**
- Observera: Beräkningarna är förenklade simuleringar baserade på dina egna antaganden. De visar exempel på möjliga utfall, inte en prognos eller garanti.

**Generell disclaimer (i anslutning till header/introduktion):**
- Observera: Denna kalkylator visar förenklade simuleringar baserade på dina inmatade antaganden. Resultaten är inte en prognos, garanti eller personlig ekonomisk rådgivning.

### 1.2 Info-sektion: Vad är en ränta-på-ränta-kalkylator?

**Rubrik:**
- Vad är en ränta-på-ränta-kalkylator?

**Innehåll:**
- En ränta-på-ränta-kalkylator (även kallad sammansatt räntekalkylator) hjälper dig förstå hur ditt sparande kan utvecklas över tid när du både sparar regelbundet och får avkastning på ditt kapital.

**Grundprincipen:**
- När du sparar eller investerar pengar får du avkastning – och den avkastningen får i sin tur avkastning. Detta kallas ränta-på-ränta eller sammansatt ränta. Över många år kan det göra stor skillnad, även om du inte sparar enorma belopp varje månad.

**Exempel:**
- Om du börjar med 100 000 kr och sparar 5 000 kr/månad med en årlig avkastning på 7% kan sparandet i detta räkneexempel växa till över 3,5 miljoner kr – varav mer än 1,5 miljoner kr från avkastning. Utfallet beror helt på antagandena och tar inte hänsyn till skatt, avgifter eller förändrade villkor.

**Vad kan du göra här:**
- Jämför olika sparstrategier, testa "vad händer om"-scenarier, och se hur ditt sparande växer år för år med interaktiva grafer och milstolpar.

### 1.3 Inställningar

**Rubrik:**
- Inställningar

#### 1.3.1 Startkapital

**Label:**
- Startkapital

**Undertext:**
- Ange eller justera ditt startbelopp med reglaget.

**Placeholder:**
- 0

**Enhet:**
- kr

**Värde-text (dynamisk):**
- {formatCurrency(effectiveStartCapital)}

#### 1.3.2 Månadssparande

**Label:**
- Månadssparande

**Undertext:**
- Ange hur mycket du sparar varje månad och justera med reglaget.

**Placeholder:**
- 0

**Enhet:**
- kr/mån

**Värde-text (dynamisk):**
- {formatCurrency(effectiveMonthlySavings)}/mån

#### 1.3.3 Årlig avkastning (nominell)

**Label:**
- Årlig avkastning (nominell)

**Undertext:**
- Förväntad årlig avkastning före inflation. Nominell avkastning är före inflation. Den reala avkastningen beräknas automatiskt om inflation är aktiverad.

**Placeholder:**
- 0.0

**Enhet:**
- %

**Värde-text (dynamisk):**
- {useInflation ? 'Real avkastning' : 'Nominell avkastning'}: {useInflation ? (effectiveReturnReal >= 0 ? '+' : '') + (effectiveReturnReal * 100).toFixed(2) : (effectiveReturnNominal * 100).toFixed(2)}%/år

#### 1.3.4 Inflation

**Label:**
- Använd inflation i beräkningen

**Switch-labels:**
- Av / På

**Undertext (när inflation är på):**
- Inflationsjustering används för att beräkna real avkastning. Standard är 2%/år.

**Placeholder:**
- 2.0

**Enhet:**
- %/år

**Värde-text (dynamisk):**
- {sliderInflation[0].toFixed(1)}%/år

**Real avkastning-text (dynamisk):**
- Real avkastning: {effectiveReturnReal >= 0 ? '+' : ''}{(effectiveReturnReal * 100).toFixed(1)}%/år
- {(effectiveReturnReal * 100) < 0 && ' (negativ real avkastning)'}

#### 1.3.5 Tidsperiod

**Label:**
- Tidsperiod

**Undertext:**
- Hur många år framåt vill du simulera utvecklingen?

**Placeholder:**
- 10

**Enhet:**
- år

**Värde-text (dynamisk):**
- {sliderYears[0]} år

### 1.4 Resultat-sektion

**Rubrik:**
- Resultat

**Kort 1: Startkapital**
- Label: STARTKAPITAL
- Värde: {formatCurrency(effectiveStartCapital)}
- Undertext: Inledande belopp

**Kort 2: Total summa**
- Label: TOTAL SUMMA
- Värde: {formatCurrency(Math.round(animatedAmounts['main'] || result.finalAmount))}
- Undertext: Efter {sliderYears[0]} år

**Kort 3: Sparat**
- Label: SPARAT
- Värde: {formatCurrency(result.totalContributed)}
- Undertext: Månadsinsättningar

**Kort 4: Avkastning**
- Label: AVKASTNING
- Värde: {formatCurrency(result.totalInterest)}
- Undertext: Ränta-på-ränta effekt
- Färg: grön om positiv, röd om negativ

### 1.5 Interaktiv graf

**Rubrik:**
- Utveckling över tid

**Graf-tooltip (dynamisk baserat på år):**
- År {year}
- Milstolpe (om tillämpligt): 🎯 Milstolpe: {milestone.milestone}
- För varje linje:
  - {entry.name}: {formatCurrency(entry.value || 0)}
  - Spar per år: {formatCurrency(contributedThisYear)}
  - Avkastning: {formatCurrency(yearData.interest)} | Total: {formatCurrency(yearData.amount)}

**Milstolpar-sektion:**
- Rubrik: Milstolpar
- Undertext: För: **Nuvarande plan**
- Format: År {milestone.year}: {milestone.milestone}
- Total: {formatCurrency(milestone.amount)}

**Milstolpar som kan visas:**
- Första 100 000 kr
- 250 000 kr
- Halv miljon
- Första miljonen!
- 2,5 miljoner
- 5 miljoner
- 10 miljoner!
- År {year}: Dina avkastningar överstiger dina insättningar!

### 1.6 "Vad händer om"-scenario

**Rubrik:**
- Vad händer om-scenario

**Undertext:**
- Se vad som händer om du ökar månadssparandet efter X år (påverkar alla sparplaner).

**Switch:**
- Av/På

**När aktivt:**

**Fält 1: Öka sparandet efter (år)**
- Label: Öka sparandet efter (år)
- Placeholder: 5
- Enhet: år
- Värde-text: Efter {whatIfIncreaseAfter[0]} år

**Fält 2: Öka med (kr/mån)**
- Label: Öka med (kr/mån)
- Placeholder: 0
- Enhet: kr/mån
- Värde-text: +{formatCurrency(whatIfIncreaseAmount[0])}/månad

**År-för-år tabell (dynamisk):**
- Visar: ⬆ Sparandet ökat med {formatCurrency(row.increasedAmount)}/månad (gäller från detta år)

### 1.7 Jämför sparplaner

**Rubrik:**
- Jämför sparplaner

**Undertext:**
- Skapa flera planer för att jämföra strategier (t.ex. trygg vs aggressiv)

**Knapp:**
- Lägg till plan

**För varje plan:**

**Namnfält:**
- Placeholder: Plan namn (t.ex. Trygg, Aggressiv)

**Fält: Startkapital**
- Label: Startkapital
- Enhet: kr

**Fält: Månadssparande**
- Label: Månadssparande
- Enhet: kr/mån

**Fält: Avkastning (nominell)**
- Label: Avkastning (nominell)
- Enhet: %

**Fält: Tidsperiod (år)**
- Label: Tidsperiod (år)
- Enhet: år

**Resultat-text (dynamisk):**
- Slutsumma efter {plan.years} år: {formatCurrency(planResult.finalAmount)}

### 1.8 År-för-år tabell

**Rubrik:**
- Utveckling per år

**Undertext:**
- Visar: **Nuvarande plan**

**Tabell-kolumner:**
- År
- Total summa
- Insatt totalt
- Avkastning

**Startrad (om startkapital > 0):**
- År: Start
- Total summa: {formatCurrency(effectiveStartCapital)}
- Insatt totalt: {formatCurrency(effectiveStartCapital)}
- Avkastning: -

**År-rad (dynamisk):**
- År: {row.year}
- Total summa: {formatCurrency(row.amount)}
- Insatt totalt: {formatCurrency(totalContributed)}
  - Undertext: (Start: {formatCurrency(effectiveStartCapital)} + Sparat: {formatCurrency(row.contributed)})
  - Om sparandet ökat: ⬆ Sparandet ökat med {formatCurrency(row.increasedAmount)}/månad (gäller från detta år)
- Avkastning: {formatCurrency(row.interest)} (grön om positiv, röd om negativ)

### 1.9 Promotion Banner

**Rubrik:**
- Vill du se hur ditt sparande passar in i din totala förmögenhet?

**Text:**
- Med **Förmögenhetskollen** kan du koppla ihop ditt sparande med hela din ekonomi: bostad, pension, lån och övriga tillgångar. Du kan se en beräknad nettoförmögenhet, en uppskattad nivå i Rikedomstrappan och en simulerad bild av hur din ekonomi förändras varje månad – inte bara hur ett enskilt sparande växer.

**Punktlista:**
- ✓ Få en samlad bild av tillgångar, skulder och pension
- ✓ Se din beräknade nivå i Rikedomstrappan (The Wealth Ladder)
- ✓ Följ hur din nettoförmögenhet förändras månad för månad
- ✓ Helt gratis och sparas lokalt i din webbläsare – ingen registrering

**Knapp:**
- Kom igång med Förmögenhetskollen

### 1.10 Ytterligare verktyg

**Rubrik:**
- Ytterligare verktyg

**Undertext:**
- Ytterligare kalkylatorer som kan vara användbara

**Knapp 1: FIRE-kalkylator**
- Rubrik: FIRE-kalkylator
- Undertext: Ekonomisk frihet

**Knapp 2: Lönekalkylator**
- Rubrik: Lönekalkylator
- Undertext: Efter skatt

**Knapp 3: Förmögenhetskollen**
- Rubrik: Förmögenhetskollen
- Undertext: Dashboard

---

## 2. FIRE-KALKYLATORN (Ekonomisk frihet)

### 2.1 Header-sektion

**Huvudrubrik:**
- FIRE-kalkylator

**Undertext:**
- Simulera en uppskattning av när du kan nå ekonomisk frihet enligt FIRE-principer

**Generell disclaimer (direkt under undertexten):**
- Observera: Denna kalkylator visar förenklade simuleringar baserade på dina inmatade antaganden. Resultaten är inte en prognos, garanti eller personlig ekonomisk rådgivning.

**Knapp:**
- Om beräkningen (länkar till `/dashboard/fire/info`)

### 2.2 Info-sektion: Vad är FIRE?

**Rubrik:**
- Vad är FIRE?

**Innehåll:**

**FIRE-förklaring:**
- **FIRE** (Financial Independence, Retire Early) är ett sätt att resonera kring ekonomisk frihet så att du kan välja när och hur du vill arbeta. Fokus ligger på frihet och valfrihet – inte bara "tidigt pensionerad". När du når FIRE har du tillräckligt kapital för att täcka dina utgifter utan att behöva arbeta heltid.

**Hur fungerar simulatorn?**
- Den gör en förenklad simulering av hur ditt kapital kan utvecklas över tid baserat på sparande, avkastning och utgifter. Den visar en uppskattning av när du kan nå ekonomisk frihet enligt **4 %-regeln** – en tumregel där man ofta utgår från att 4 % av kapitalet per år motsvarar cirka 25 gånger dina årsutgifter. Simulatorn visar också hur kapitalet utvecklas genom både sparande och pension över din livstid.

**Bridge-period:**
- Tiden mellan ekonomisk frihet och pension kallas "bridge-period" – då ditt tillgängliga kapital (exklusive pension) används för att täcka utgifter fram tills pensionen börjar betalas ut. Under denna period växer dina pensionspengar medan du använder ditt övriga kapital. Ju längre bridge-period, desto mer kapital behöver du vid FIRE.

**Coast FIRE:**
- **Coast FIRE** är en variant av FIRE för den som inte vill jobba ihjäl sig i unga år, utan hellre tar det lugnare men fortfarande siktar mot ekonomisk frihet. Idén är att du sparar och investerar tillräckligt tidigt så att du kan "coasta" mot full ekonomisk frihet – du jobbar deltid för att täcka utgifter, slutar spara, och låter ditt redan investerade kapital växa av sig självt.

**Obs:**
- Denna fristående kalkylator har inte stöd för Coast FIRE-simulering. Om du vill testa och simulera Coast FIRE kan du använda Förmögenhetskollen (se länk längre ner på sidan) där det finns fullt stöd för Coast FIRE med möjlighet att välja deltidsperiod och se hur det påverkar din ekonomiska frihet.

### 2.3 Info om Quick vs Avancerat

**Innehåll:**
- **Quick-läge:** Fyll i grundläggande information (ålder, lön, sparande, kapital) och låt kalkylatorn beräkna resten automatiskt. Perfekt för en snabb översikt. **Avancerat läge:** Ange exakta värden för alla pensionshinkar och avsättningar individuellt. Byt läge med knappen nedan.

### 2.4 Dina grundvärden (FIREFormWrapper)

**Rubrik:**
- Dina grundvärden

**Lägesval (Quick vs Avancerat):**
- Snabb uppskattning
- Jag vill fylla i allt själv

**Quick-läge undertext:**
- Fyll i det du vet så fyller vi i rimliga standardvärden åt dig. Du kan alltid öppna avancerat läge senare.

#### 2.4.1 Grunddata

**Ålder:**
- Label: Ålder
- Placeholder: (dynamisk baserat på formValues.age)

**Önskad pensionsålder:**
- Label: Önskad pensionsålder
- Placeholder: (dynamisk baserat på formValues.pensionAge)

#### 2.4.2 Kassaflöde

**Utgifter per månad:**
- Label: Utgifter per månad (kr)
- InfoIcon tooltip:
  - **Titel:** Månadsutgifter
  - **Beskrivning:** Detta är dina totala månadsutgifter som du behöver täcka efter ekonomisk frihet.\n\nJu lägre dina utgifter, desto mindre kapital behöver du för att nå FIRE. Detta är en av de viktigaste faktorerna för att nå ekonomisk frihet tidigt.\n\n4 %-regeln är en tumregel från historiska studier som ofta används i FIRE-sammanhang. Den säger förenklat att uttag på cirka 4 % per år i många historiska perioder inte har tömt kapitalet, men det finns inga garantier för framtiden. Ofta utgår man från att du behöver cirka 25 gånger dina årsutgifter i kapital. Om dina utgifter är 20 000 kr/mån (240 000 kr/år), skulle det enligt denna tumregel innebära cirka 6 miljoner kr.
- Placeholder: 30000

**Sparande per månad:**
- Label: Sparande per månad (kr)
- Placeholder: 10000

**Quick-läge: Bruttolön/mån (för att uppskatta pensionsavsättningar):**
- Label: Bruttolön/mån (för att uppskatta pensionsavsättningar) (kr)
- Placeholder: 40000
- Undertext (dynamisk):
  - Om beräkning finns: Beräknad statlig pension: {formatCurrency(quickPensionCalculations?.statePension || 0)}/mån. Marknadsbaserad pension: {formatCurrency(quickPensionCalculations?.marketPension || 0)}/mån.
  - Om ingen beräkning: Vill du skriva in egna belopp? → avancerat

#### 2.4.3 Tillgångar nu

**Tillgängligt kapital idag:**
- Label: Tillgängligt kapital idag (kr)
- Placeholder: 500000
- Undertext: Fonder, aktier, sparkonton, etc.

**Bostad (valfritt):**

**Quick-läge:**
- Switch-label: Jag äger bostad
- När aktivt:
  - Label: Nettovärde bostad (värde - lån) (kr)
  - Placeholder: 1000000
  - Undertext: 40% av nettovärdet läggs till i ditt tillgängliga kapital och får samma avkastning som övriga tillgångar.

**Avancerat läge:**
- Switch-label: Lägg till bostad i beräkningen
- När aktivt:
  - Label: Bostadens värde (kr)
  - Placeholder: 3000000
  - Label: Bolån (kr)
  - Placeholder: 2000000
  - Undertext (dynamisk): {fireHousing > 0 ? `${formatCurrency(fireHousing)} (40% av nettovärde) läggs till i tillgängligt kapital. Det får samma avkastning som övriga tillgångar.` : ''}

#### 2.4.4 Pension nu (endast Avancerat läge)

**Pensionskapital (låst) totalt:**
- Label: Pensionskapital (låst) totalt (kr)
- Placeholder: 1000000
- Undertext: Tjänstepension, premiepension, IPS

**Pensionsavsättning per månad totalt:**
- Label: Pensionsavsättning per månad totalt (kr)
- Placeholder: 0
- Undertext: Månatlig avsättning till pension
- Länk: Räkna ut (länkar till `/salary`)

**Visa detaljerad fördelning (expanderbar):**
- Knapp-text: Visa detaljerad fördelning
- När expanderad:
  - Undertext: Fördela pensionskapitalet och avsättningarna. Om du inte fyller i detaljer fördelas automatiskt: Tjänstepension 70%, Premiepension 20%, IPS 10%.
  
  **Procentfördelning:**
  - Tjänstepension (%)
  - Premiepension (%)
  - IPS (%)
  
  **Kapital idag (ändra om du vet):**
  - Tjänstepension idag (kr) - Placeholder: {formatCurrency(occPensionAtStart)}
  - Premiepension idag (kr) - Placeholder: {formatCurrency(premiePensionAtStart)}
  - IPS idag (kr) - Placeholder: {formatCurrency(privatePensionAtStart)}
  
  **Avsättning per månad (ändra om du vet):**
  - Tjänstepension/mån (kr) - Placeholder: {formatCurrency(occPensionContribMonthly)}
  - Premiepension/mån (kr) - Placeholder: {formatCurrency(premiePensionContribMonthly)}
  - IPS/mån (kr) - Placeholder: {formatCurrency(privatePensionContribMonthly)}

#### 2.4.5 Statlig pension (endast Avancerat läge)

**Statlig pensionsavsättning/mån (inkomstpension):**
- Label: Statlig pensionsavsättning/mån (inkomstpension) (kr)
- Placeholder: 0
- Undertext: Månatlig inkomstpensionsavsättning. (Detta är en teknisk uppskattning av inbetalningarna till inkomstpensionen. Den dras inte direkt från din lön utan ingår i arbetsgivaravgifterna.)
- Knapp: Beräkna från lön

**När "Beräkna från lön" är aktivt:**
- Undertext: Skriv din bruttolön så räknar vi fram ungefärlig statlig pensionsavsättning
- Fält: Bruttolön/mån (kr) - Placeholder: 30000
- Fält: Ålder - Placeholder: (använder standaloneAge)
- Resultat-text (dynamisk): Beräknad: {formatCurrency(statePensionContribMonthly)}/månad

**Har du redan intjänad statlig pension?**
- Label: Har du redan intjänad statlig pension? (kr)
- Placeholder: 0
- Undertext: Valfritt. Om tomt eller 0 växer pensionen bara med månatlig avsättning.

#### 2.4.6 Snabbstart: Visa avancerat-länk

**Knapp (endast Quick-läge):**
- Visa avancerat

### 2.5 FIRE Result Indicator

**Rubrik:**
- Din väg mot ekonomisk frihet

**Status 1: Kapitalet tar slut (röd):**
- Text: Kapitalet tar slut vid {simulation.capitalDepletedYear} års ålder
- Undertext: {effectiveFireYear !== null ? `Ekonomisk frihet nås vid ${averageAge + effectiveFireYear} år, men kapitalet räcker inte fram till pension (${sliderPensionAge[0]} år).` : 'Kapitalet räcker inte för att nå ekonomisk frihet.'}
- Varning-box:
  - Rubrik: För att simuleringen ska hålla till minst {sliderPensionAge[0] + 15} år visar denna modell att något av följande kan behöva ändras:
  - Punktlista:
    - Utgifter, sparande eller avkastningsantaganden
    - Planerad pensionsålder
  - Ytterligare text: Du kan testa olika kombinationer i kalkylatorn för att se hur de påverkar resultatet.

**Status 2: Ekonomisk frihet uppnåelig (grön/orange):**
- Text: {effectiveFireYear} år tills du tidigast kan vara ekonomiskt oberoende
- Undertext: Vid ålder {averageAge + effectiveFireYear} år
- Om manuellt justerat: (manuellt justerat)
- Undertext: Med inställda förutsättningar om inget skulle förändras
- Om beräknat skiljer sig: Beräknat: {dynamicFireResult.yearsToFire} år (vid {averageAge + dynamicFireResult.yearsToFire} år)
- 4%-regeln text (dynamisk):
  - Om nås före FIRE: 4%-regeln nås vid {fourPercentRuleMetYear} år (före ekonomisk frihet)
  - Om nås samtidigt: 4%-regeln nås vid {fourPercentRuleMetYear} år (samtidigt med ekonomisk frihet)
  - Om nås under bridge: 4%-regeln nås vid {fourPercentRuleMetYear} år (under bridge-perioden)
  - Om nås efter pension: 4%-regeln nås vid {fourPercentRuleMetYear} år (efter pensionsstart)

**Status 3: Ej uppnåelig (röd):**
- Text: Ekonomisk frihet ej uppnåelig med nuvarande antaganden

**Portfölj vid frihet:**
- Label: Portfölj vid frihet:
- Värde: {effectiveFireYear !== null ? formatCurrency(portfolioAtFire) : 'N/A'}

**4%-krav:**
- Label: 4%-krav: {formatCurrency(requiredAtPensionLive)}
- InfoIcon tooltip:
  - **Titel:** 4%-kravet
  - **Beskrivning:** 4 %-kravet beräknas som: (Årsutgifter – Statlig pension) × 25\n\nDetta är det kapital du behöver vid pensionsstart för att kunna leva på 4 % av kapitalet per år enligt den ofta använda tumregeln. Statlig pension dras av eftersom den minskar dina uttag från övrigt kapital.\n\n4 %-regeln är en tumregel från historiska studier som ofta används i FIRE-sammanhang. Den säger förenklat att uttag på cirka 4 % per år i många historiska perioder inte har tömt kapitalet, men det finns inga garantier för framtiden. Om dina årsutgifter är 240 000 kr och statlig pension ger 60 000 kr/år, skulle det enligt denna tumregel innebära (240 000 - 60 000) × 25 = 4 500 000 kr.

#### 2.5.1 Dynamisk analys av grafen

**Rubrik:**
- 📊 Vad ser du i grafen just nu?

**Innehåll (dynamiskt baserat på bridge-period):**
- Den **blå linjen (Tillgängligt)** visar ditt kapital som kan användas före pension. Vid {fireAge} år börjar du ta ut från denna linje för att täcka utgifter.
- Under bridge-perioden (mellan {fireAge}-{sliderPensionAge[0]} år, {bridgeYears} år) {capitalGrowthDuringBridge > 0 ? 'växer' : 'minskar'} ditt tillgängliga kapital med {Math.abs(capitalGrowthDuringBridge).toFixed(1)}%.
  - Om negativ: ⚠️ Detta är en varning – kapitalet minskar snabbare än det växer.
- Om lägsta värde finns: Kapitalet når sitt lägsta värde vid {minAvailableAge} år ({formatCurrency(minAvailableDuringBridge)}), sedan växer det igen när uttagen minskar eller avkastningen ökar.
- Den **gröna linjen (Marknadsbaserad pension)** växer hela tiden tills den slås ihop med tillgängligt vid {sliderPensionAge[0]} år.
- Om statlig pension finns: Den **blå streckade linjen (Statlig pension)** visar inkomstpensionen som minskar ditt behov av uttag efter {sliderPensionAge[0]} år.
- Den **svarta linjen (Total)** visar summan av allt. Den ska överskrida 4%-kravet ({formatCurrency(requiredAtPensionLive)}) vid eller före {sliderPensionAge[0]} år.

**Rubrik:**
- ⚠️ Vad ska du tänka på?

**Uttagsnivå (dynamisk):**
- **Uttagsnivå (mellan {fireAge}-{sliderPensionAge[0]} år):** Du tar ut {withdrawalRateAtFire.toFixed(1)}% per år från ditt tillgängliga kapital.
  - Om > 5%: ⚠️ Detta är en hög uttagsnivå. Uttag över cirka 5 % per år förknippas i många studier med ökad risk att kapitalet tar slut. I kalkylatorn kan du testa hur olika nivån på sparande, utgifter eller arbetstid påverkar resultatet.
  - Om 4-5%: 💡 Detta ligger över den ofta använda 4 %-regeln som riktmärke. Om marknaden utvecklas svagt kan det bli ansträngt. I kalkylatorn kan du testa effekten av större buffert, lägre uttagsnivå eller förändrade antaganden om avkastning.
  - Om ≤ 4%: ✅ Detta ligger inom den ofta använda 4 %-regeln som riktmärke i FIRE-diskussioner. Det är dock ingen garanti för att kapitalet alltid räcker.

**Stor tillväxt krävs (dynamisk, om kapitalNeededToGrow > 0):**
- **Stor tillväxt krävs (mellan {fireAge}-{sliderPensionAge[0]} år):** Ditt kapital behöver växa med {growthNeededPercent?.toFixed(1)}% under bridge-perioden för att nå 4%-kravet.
  - Om avgReturnNeeded > 10%: ⚠️ Detta är mycket! Det kräver en genomsnittlig real avkastning på över {avgReturnNeeded.toFixed(1)} % per år. I kalkylatorn kan du testa hur olika nivån på sparande, utgifter eller arbetstid påverkar resultatet.
  - Om 7-10%: 💡 Detta kräver en genomsnittlig real avkastning på {avgReturnNeeded.toFixed(1)} % per år. Det är en hög nivå som i vissa historiska perioder har förekommit, men det finns inga garantier för framtiden.
  - Om ≤ 7%: ✅ Detta kräver en genomsnittlig real avkastning på {avgReturnNeeded.toFixed(1)} % per år. Det ligger närmare de nivåer som ofta används i historiska exempel, men utfallet kan avvika kraftigt.

**Buffert (om portfolioAtFire >= requiredAtPensionLive):**
- ✅ **Buffert:** Din portfölj vid frihet överstiger 4 %-kravet med {formatCurrency(portfolioAtFire - requiredAtPensionLive)}. Det kan ge ökad motståndskraft vid marknadsnedgångar, men tar inte bort risken helt.

**4%-regeln timing:**
- **4%-regeln nås vid {fourPercentRuleMetYear} år**
  - Om före FIRE: ✅ Redan innan den valda tidpunkten för ekonomisk frihet. Det innebär att modellen visar att kapitalet når 4 %-nivån tidigare, givet antagandena.
  - Om vid FIRE: ✅ Vid den valda tidpunkten för ekonomisk frihet. Det betyder att 4 %-nivån och din valda FIRE-tidpunkt sammanfaller i simuleringen.
  - Om under bridge: ✅ Under bridge-perioden. Ditt kapital växer tillräckligt för hållbara uttag enligt modellen, givet antagandena.
  - Om efter pension: ⚠️ Efter pensionsstart. I kalkylatorn kan du testa hur olika nivån på sparande, utgifter eller arbetstid påverkar resultatet.

**Allmänna beskrivningar:**
- 💡 **Allmänna beskrivningar:**
  - Ju lägre utgifter, desto mindre kapital behöver modellen för att visa ekonomisk frihet. I kalkylatorn kan du testa hur olika utgiftsnivåer påverkar resultatet.
  - Högre antagen avkastning gör att kapitalet växer snabbare i simuleringen, men i verkligheten innebär högre avkastning normalt också högre risk.
  - Om du i modellen lägger in längre arbetsliv eller högre sparande minskar kapitalbehovet vid ekonomisk frihet.
  - Alla beräkningar bygger på antaganden – verkligheten kan skilja sig kraftigt från simuleringen.

### 2.6 Graf

**Axel-labels:**
- X-axel: Ålder
- Y-axel: Belopp (realt)

**Linjer:**
- Tillgängligt (brun, solid)
- Marknadsbaserad pension (blå, streckad)
- Statlig pension (ljusblå, streckad) - "Statlig pension (kapital → inkomst)"
- Total (grå, streckad)

**Reference Lines:**
- Pensionsstart (gul, vid sliderPensionAge[0])
- 4%-krav (grön streckad, horisontell)
- Total når 4% (grön, vertikal vid fourPercentRuleMetYear)
- Tillgängligt når 4% (brun, vertikal vid availableCrossesFIREYear)
- FIRE (orange, vertikal vid fireAge)
- Kapital förbrukat (röd, vertikal vid capitalDepletedYear)

**Reference Areas:**
- Bridge-period (orange skugga, mellan fireAge och sliderPensionAge[0])
- Pensionsperiod (blå skugga, från sliderPensionAge[0] och framåt)

**Tooltip (dynamisk baserat på linje och ålder):**

**För "Tillgängligt":**
- {formatCurrency(value)}
- Om unlock-år: 🔄 {unlockParts.join(' och ')} {unlockParts.length === 1 ? 'har' : 'har'} flyttats över till tillgängligt
- + Sparande: {formatCurrency(payload.savingsContrib)}
- + Avkastning ({effectivePct.toFixed(1)}%): {formatCurrency(availableReturnValue)}
- - Utbetalningar: {formatCurrency(payload.netWithdrawal)}/år
- Om milstolpe: ⭐ Tillgängligt kapital når 4%-kravet vid denna ålder
- Om kapital förbrukat: ⚠️ Tillgängligt kapital tar slut vid denna ålder

**För "Marknadsbaserad pension":**
- {formatCurrency(value)}
- Om efter pensionsstart: Alla pensionsdelar har överförts till tillgängligt
- Om före pensionsstart: {pensionParts.join(' + ')}
- + Avsättning: {formatCurrency(totalContrib)}/år
  - Om flera delar: ({contribParts.join(', ')})
- + Avkastning: {formatCurrency(payload.pensionReturn)}
  - Om separata avkastningar: ({returnParts.join(', ')})

**För "Statlig pension":**
- Om före pension (kapital): {formatCurrency(value)}\nInkomstpension (statlig)\n+ Avsättning: {formatCurrency(payload.statePensionContrib)}\n+ Avkastning ({statePensionPercent}%): {formatCurrency(payload.statePensionReturn)}
- Om efter pension (inkomst): {formatCurrency(annualIncome)}/år\n({formatCurrency(monthlyIncome)}/mån)\nℹ️ Utbetalning per år (minskar uttag)

**För "Total":**
- {formatCurrency(value)}
- + Insättningar: {formatCurrency(savingsTotal)}
- + Avkastning: {formatCurrency(returnsTotal)}
- - Utbetalningar: {formatCurrency(payload.netWithdrawal)}/år
- Om milstolpe: ⭐ Totala kapitalet når 4%-kravet vid denna ålder

**Label formatter:**
- Ålder: {age} år
- Om milstolpe: ⭐ Total når 4% / ⭐ Tillgängligt når 4%
- Om kapital förbrukat: ⚠️ Kapital förbrukat

### 2.7 Startålder-slider (om yearsToFire !== null)

**Label:**
- Startålder för ekonomisk frihet (simulering)

**Värde:**
- {manualFireYear !== null ? manualFireYear : averageAge + dynamicFireResult.yearsToFire} år

**Återställ-knapp (om manuellt justerat):**
- Återställ

**Undertext:**
- Justera startålder för att se vad som händer om du väntar längre eller startar tidigare på din väg mot ekonomisk frihet

### 2.8 Justera antaganden (Controls)

**Rubrik:**
- Justera antaganden

#### 2.8.1 Övriga tillgångar (nominell)

**Label:**
- Övriga tillgångar (nominell)

**InfoIcon tooltip:**
- **Titel:** Avkastning på övriga tillgångar
- **Beskrivning:** Detta är den förväntade årliga avkastningen (före inflation) på dina tillgängliga tillgångar - allt utom pensionssparande.\n\nJu högre avkastning, desto snabbare växer ditt kapital och desto tidigare kan du nå FIRE. Men högre avkastning innebär också högre risk.\n\nStandardvärdet är 7% nominell avkastning, vilket ger cirka 5% real avkastning efter inflation.

**Värde:**
- {sliderReturnAvailable[0].toFixed(1)}%

**Real avkastning:**
- Real: {(realReturns.realReturnAvailable * 100).toFixed(1)}%

#### 2.8.2 Pensionstillgångar (Quick-läge)

**Label:**
- Pensionstillgångar (nominell)

**InfoIcon tooltip:**
- **Titel:** Avkastning på pensionstillgångar
- **Beskrivning:** Detta är den förväntade årliga avkastningen (före inflation) på alla dina pensionssparanden - tjänstepension, premiepension och IPS.\n\nPensionssparanden har ofta lägre avkastning än övriga tillgångar eftersom de ofta är mer konservativt förvaltade. Standardvärdet är 5% nominell avkastning.\n\nDetta reglage sätter avkastningen för alla pensionssparanden samtidigt.

**Värde:**
- {sliderReturnPension[0].toFixed(1)}%

**Real avkastning:**
- Real: {(realReturns.realReturnPension * 100).toFixed(1)}% (sätter alla pensionsavkastningar)

#### 2.8.3 Separata pensionsavkastningar (Avancerat läge)

**Tjänstepension (nominell):**
- Label: Tjänstepension (nominell)
- InfoIcon tooltip:
  - **Titel:** Avkastning på tjänstepension
  - **Beskrivning:** Detta är den förväntade årliga avkastningen (före inflation) på din tjänstepension.\n\nPensionstillgångar kan vara mer eller mindre aktiebaserade beroende på val och förvaltning. Standardvärdet här är ett exempel – du kan justera avkastningen för varje pensionsdel.
- Värde: {sliderReturnOccPension[0].toFixed(1)}%
- Real: {(realReturns.realReturnOccPension * 100).toFixed(1)}%

**Premiepension (nominell):**
- Label: Premiepension (nominell)
- InfoIcon tooltip:
  - **Titel:** Avkastning på premiepension
  - **Beskrivning:** Detta är den förväntade årliga avkastningen (före inflation) på din premiepension.\n\nPremiepension har ofta lägre avkastning än övriga tillgångar eftersom den ofta är mer konservativt förvaltad. Standardvärdet är 5% nominell avkastning.
- Värde: {sliderReturnPremiePension[0].toFixed(1)}%
- Real: {(realReturns.realReturnPremiePension * 100).toFixed(1)}%

**IPS (nominell):**
- Label: IPS (nominell)
- InfoIcon tooltip:
  - **Titel:** Avkastning på IPS
  - **Beskrivning:** Detta är den förväntade årliga avkastningen (före inflation) på ditt IPS (Individuellt Pensionssparande).\n\nIPS kan ha samma avkastning som övriga tillgångar eftersom du själv väljer hur det ska investeras. Standardvärdet är 7% nominell avkastning.
- Värde: {sliderReturnIpsPension[0].toFixed(1)}%
- Real: {(realReturns.realReturnPrivatePension * 100).toFixed(1)}%

#### 2.8.4 Inflation

**Label:**
- Inflation

**InfoIcon tooltip:**
- **Titel:** Inflation
- **Beskrivning:** Inflation är den årliga prisökningen i samhället. När inflationen är 2% betyder det att samma varor och tjänster kostar 2% mer nästa år.\n\nI FIRE-beräkningen används real avkastning (avkastning minus inflation) för att se din faktiska köpkraft över tid. Om dina tillgångar växer med 7% men inflationen är 2%, är din reala avkastning 5%.\n\nStandardvärdet är 2%, vilket är Riksbankens inflationsmål. Du kan justera detta om du tror inflationen kommer vara högre eller lägre.\n\nReal avkastning = nominell avkastning minus inflation.

**Värde:**
- {sliderInflation[0]}%

#### 2.8.5 Pensionsstartålder

**Label:**
- Pensionsstartålder

**InfoIcon tooltip:**
- **Titel:** Pensionsstartålder
- **Beskrivning:** Detta är åldern när du planerar att börja ta ut din statliga pension och marknadsbaserade pensioner.\n\nBridge-perioden är tiden mellan när du når ekonomisk frihet (FIRE) och när pensionen börjar. Ju längre bridge-period, desto mer kapital behöver du vid FIRE för att täcka utgifterna.\n\nStandardvärdet är 63 år (för nuvarande födelsekullar), men lägsta uttagsålder för statlig pension höjs stegvis och kan vara högre beroende på födelseår. Du kan justera detta reglage om du planerar att arbeta längre.\n\nTjänstepension och IPS kan i många avtal tas ut tidigare (från 55 år) via sliders längre ner. Premiepension är en del av den allmänna pensionen och följer därför samma lägsta uttagsålder (ca 63–65 år beroende på födelseår).

**Värde:**
- {sliderPensionAge[0]} år

#### 2.8.6 Pensionsavsättning/mån (visuell box)

**Label:**
- Pensionsavsättning/mån (från lön)

**Värde:**
- {formatCurrency(occPensionContribMonthly + premiePensionContribMonthly + privatePensionContribMonthly)}

**Undertext:**
- Ange värde i "Dina grundvärden" ovan

#### 2.8.7 Utbetalningsperiod för statlig pension (om statePensionAnnualIncome > 0)

**Label:**
- Utbetalningsperiod för statlig pension

**InfoIcon tooltip:**
- **Titel:** Utbetalningsperiod för statlig pension
- **Beskrivning:** Allmän pension betalas normalt ut livsvarigt.\n\nI denna simulator används en tidsbegränsad period för att göra prognoser enklare att överblicka. Ju längre utbetalningsperiod, desto lägre blir den månatliga utbetalningen men desto längre får du betalningar. Ju kortare period, desto högre månadsutbetalning men kortare tid.\n\nStandardvärdet är 20 år, vilket är en modell-förenkling. Du kan justera detta baserat på din egen situation.

**Värde:**
- {statePensionPayoutYears[0]} år

**Undertext:**
- Antal år statlig inkomstpension betalas ut från pensionsstart

#### 2.8.8 Börja använda tjänstepension från ålder (om occPensionContribMonthly > 0)

**Label:**
- Börja använda tjänstepension från ålder

**InfoIcon tooltip:**
- **Titel:** Tidig uttag av tjänstepension
- **Beskrivning:** Detta är åldern när du börjar ta ut din tjänstepension.\n\nTjänstepension kan i många avtal tas ut från 55 år, men inte i alla. Kontrollera alltid vad som gäller för just ditt avtal. Det gör den användbar för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela tjänstepensionen automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\nNär tjänstepensionen slås ihop med ditt övriga kapital beräknas en viktad avkastning baserat på storleken av varje del. För att simuleringen ska bli jämn höjs avkastningen på tjänstepensionen till minst samma nivå som efter FIRE (7% nominellt) innan viktningen.\n\nOm du väljer att börja använda denna pensionsdel före din pensionsålder flyttas både kapitalet och de löpande inbetalningarna över till din fria portfölj i simuleringen. Det gör vi för att inte fortsätta sätta in pengar i en pensionshink som redan har tagits i bruk.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag.

**Värde:**
- {occPensionEarlyStartAge} år

**Undertext:**
- Tjänstepension kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)

#### 2.8.9 Börja använda IPS från ålder (om privatePensionContribMonthly > 0 || privatePensionAtStart > 0)

**Label:**
- Börja använda IPS från ålder

**InfoIcon tooltip:**
- **Titel:** Tidig uttag av IPS
- **Beskrivning:** Detta är åldern när du börjar ta ut ditt IPS (Individuellt Pensionssparande).\n\nIPS kan tas ut från 55 år, vilket gör det användbart för bridge-perioden innan statlig pension börjar. När du når denna ålder, flyttas hela IPS-kapitalet automatiskt till dina tillgängliga tillgångar.\n\nOm du tar ut tidigt (t.ex. vid 55 år) får du mer kapital tillgängligt tidigt, vilket kan hjälpa dig nå FIRE tidigare eller minska risken under bridge-perioden.\n\nNär IPS slås ihop med ditt övriga kapital beräknas en viktad avkastning baserat på storleken av varje del. För att simuleringen ska bli jämn höjs avkastningen på IPS till minst samma nivå som efter FIRE (7% nominellt) innan viktningen.\n\nOm du väljer att börja använda denna pensionsdel före din pensionsålder flyttas både kapitalet och de löpande inbetalningarna över till din fria portfölj i simuleringen. Det gör vi för att inte fortsätta sätta in pengar i en pensionshink som redan har tagits i bruk.\n\n⚠️ Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag.

**Värde:**
- {ipsEarlyStartAge} år

**Undertext:**
- IPS kan tas ut tidigare än ordinarie pensionsålder (minst 55 år)

#### 2.8.10 Gemensam varning för tidiga uttag

**Varning (om occPensionContribMonthly > 0 || privatePensionContribMonthly > 0):**
- ⚠️ **Antagande:** Detta är ett exempel. Kontrollera ditt pensionsavtal för faktiska regler om tidiga uttag.

#### 2.8.11 Real avkastning (visuell box)

**Label:**
- Real avkastning:

**Värde:**
- {(realReturns.realReturnAvailable * 100).toFixed(2)}%

### 2.9 Förklaringar och förtydliganden

**Insättningar:**
- **Insättningar pågår tills du når ekonomisk frihet.** Året du når ekonomisk frihet är sista året med insättningar, uttag startar året efter. Efter brytet slutar pensionsinbetalningar, och endast avkastningen får pensionstillgångarna att växa.

**Efter pensionsstart:**
- **Efter pensionsstart** slås kapitalet ihop. Årliga uttag motsvarar utgifterna och görs från den sammanfogade portföljen. Hela poolen använder den avkastning som gäller efter att ekonomisk frihet nås (minst 7% nominell eller din ursprungliga om högre).
- *Notera: Detta är en förenkling av pensionsdelen för att göra det generellt och lättare att förstå och jobba med i simulatorn.*
- *Tänk på att pensionsdelen efter pension kan ha en lägre avkastning beroende på hur mycket av den som är inkomstpensionen, som då följer balansindex.*

**Avkastning efter ekonomisk frihet:**
- **Avkastning efter ekonomisk frihet:** När ekonomisk frihet uppnås används en teknisk modellnivå på 7 % nominell avkastning (används för att göra uttagsanalysen jämförbar med historiska 4 %-studier, inte som en prognos eller garanti) för tillgängliga tillgångar i simuleringen. Om din ursprungliga avkastning redan är högre än 7 % används den högre nivån, och om ekonomisk frihet inte är uppnåelig används dina ursprungliga avkastningsantaganden hela vägen till pension.

**Viktad avkastning vid sammanslagning:**
- **Viktad avkastning vid sammanslagning:** När kapital slås ihop från flera källor (t.ex. när pensionsdelar blir uttagsbara eller vid pensionsstart) beräknas en gemensam avkastning som ett viktat snitt av delarna. Pensionsdelar som blir uttagsbara justeras först upp till simulatorns lägsta nivå för avkastning efter frihet (7% nominellt) innan viktningen, så att låga pensionsavkastningar inte drar ner hela portföljen.

**Förklaring av linjer:**
- Tillgängligt = före pension
- Låst = används vid pension
- Total = summan
- Grönt streck = 4%-krav vid pension
- Orange skugga = Bridge-period (FIRE till pension)
- Blå skugga = Pensionsperiod (från pensionsstart)

### 2.10 Varningsbox

**Rubrik:**
- Viktigt: Detta är antaganden och gissningar

**Innehåll:**

**Paragraf 1:**
- **Denna simulator är gjord för att experimentera** med olika antaganden om avkastning, inflation, sparande och utgifter. Alla beräkningar baseras på antaganden, generaliseringar och förenklingar och är inte en garanti för framtida resultat.

**Paragraf 2:**
- **Tidigare utveckling är ingen garanti för framtiden.** Historisk avkastning, inflation och ekonomiska trender kan och kommer att variera. Detta är en förenklad simulering i dagens penningvärde med generaliseringar och förenklingar. Skatt och pension kan avvika från verkligheten.

**Paragraf 3:**
- **Om du funderar på att göra FIRE eller liknande måste du göra egna beräkningar utifrån dina specifika förhållanden.** Använd denna simulator som ett verktyg för att förstå och experimentera, inte som en exakt prognos eller rådgivning.

### 2.11 Promotion Banner

**Rubrik:**
- Vill du se hur din FIRE-plan passar in i hela din ekonomi?

**Text:**
- Med **Förmögenhetskollen** kan du inte bara göra en fristående FIRE-simulering, utan också se hur din ekonomiska frihet hänger ihop med hela hushållets ekonomi: tillgångar, skulder, pension och Rikedomstrappan. Du får en beräknad nivå, hastighet mot nästa nivå och en simulering av hur din nettoförmögenhet kan utvecklas över tid.

**Punktlista:**
- ✓ Se din beräknade nivå i Rikedomstrappan (The Wealth Ladder)
- ✓ Följ hur nettoförmögenheten förändras månad för månad
- ✓ Simulera FIRE, bridge-period och pension i ett sammanhang
- ✓ Helt gratis och sparas lokalt – ingen registrering

**Knapp:**
- Utforska Förmögenhetskollen

### 2.12 Ytterligare verktyg

**Rubrik:**
- Ytterligare verktyg

**Undertext:**
- Ytterligare kalkylatorer som kan vara användbara

**Knapp 1: Sparkalkylator**
- Rubrik: Sparkalkylator
- Undertext: Ränta på ränta

**Knapp 2: Lönekalkylator**
- Rubrik: Lönekalkylator
- Undertext: Efter skatt

**Knapp 3: Förmögenhetskollen**
- Rubrik: Förmögenhetskollen
- Undertext: Dashboard

---

## 3. LÖNEKALKYLATORN (Lön efter skatt & pension)

### 3.1 Header-sektion

**Huvudrubrik:**
- Lön efter skatt & pension

**Undertext:**
- Räkna ut din nettolön och se uppskattade pensionsavsättningar. En enkel kalkylator som visar hur mycket du får ut efter skatt och hur mycket som sätts av till framtida pension.

**Generell disclaimer (direkt under undertexten):**
- Observera: Denna kalkylator visar förenklade simuleringar baserade på dina inmatade antaganden. Resultaten är inte en prognos, garanti eller personlig ekonomisk rådgivning.

### 3.2 Info-sektion: Viktigt att veta

**Rubrik:**
- Viktigt att veta:

**Innehåll:**
- Denna kalkylator ger en **ungefärlig och förenklad** beräkning. Den exakta skatten kan variera beroende på dina personliga omständigheter, kommun, eventuella skattereduktioner och andra faktorer. Använd resultatet som en vägledning, inte som en garanti eller personlig skatte- eller pensionsrådgivning.

### 3.3 Huvudkalkylatorn

**Rubrik:**
- Räkna ut din lön

#### 3.3.1 Bruttolön Input

**Label:**
- Bruttolön per månad (kr, efter löneväxling)

**Placeholder:**
- 30 000

**Undertext:**
- Ange din bruttolön efter eventuell löneväxling (före skatt). Om du har löneväxling, dra av den från bruttolönen.

#### 3.3.2 Netto Result

**När netSalary !== null:**

**Label:**
- Din nettolön per månad

**Värde:**
- {formatCurrency(netSalary)}

**Undertext:**
- Detta är en ungefärlig beräkning. Din faktiska nettolön kan variera.

#### 3.3.3 Pension Section

**Knapp (när showPension === false):**
- Räkna ut pensionsavsättningar

**När showPension === true:**

**Din ålder:**
- Label: Din ålder
- Placeholder: 30
- Undertext: Ange din ålder för att bestämma rätt pensionsavtal

**Knapp (när ålder angiven):**
- Välj pensionsavtal

**PensionWizardInline (när showPensionWizard === true):**
- (Komponenten hanterar sin egen text)

**Custom TP Input (när pensionType === 'Annat'):**

**Rubrik:**
- Ange ditt tjänstepensionsavtal

**Radio-alternativ:**
- Procent av lönen
- Fast belopp

**Input:**
- Placeholder: '4.5' (om procent) eller '2000' (om belopp)

**Undertext (dynamisk):**
- Om procent: Ange procent (t.ex. 4.5 för 4,5%)
- Om belopp: Ange månadsbelopp i kr

**Pension Results (när pensionType är valt och alla värden finns):**

**Header:**
- Dina pensionsavsättningar
- Knapp: Kör om

**Allmän pension (statlig):**

**Rubrik:**
- Allmän pension (statlig)

**Undertext:**
- Allmän pension är obligatorisk och dras automatiskt från din lön. Den består av två delar:

**Kort 1: Inkomstpension**
- Label: Inkomstpension
- Badge: Trygghetsbaserad
- Värde: {formatCurrency(incomePension)}
- Undertext: 16% av din pensionsgrundande inkomst. Beloppet gäller upp till det så kallade PGI-taket (8,07 inkomstbasbelopp). Inkomst över taket ger inte extra inkomstpension. Denna del följer inkomstindex och justeras med balansindex vid behov. Den är mindre direkt marknadsberoende än premiepensionen, men framtida utveckling kan ändå bli både bättre och sämre än idag.

**Kort 2: Premiepension**
- Label: Premiepension
- Badge: Marknadsbaserad
- Värde: {formatCurrency(premiePension)}
- Undertext: 2,5% av din pensionsgrundande inkomst. Beloppet gäller upp till det så kallade PGI-taket (8,07 inkomstbasbelopp). Inkomst över taket ger inte extra premiepension. Denna del placeras i fonder som följer marknaden. Värdet kan både stiga och sjunka över tid beroende på hur marknaden utvecklas.

**Total allmän pension:**
- Label: Total allmän pension
- Badge: 18,5% totalt
- Värde: {formatCurrency(totalPublicPension)}
- Undertext: Detta är din totala månatliga avsättning till allmän pension. Beloppet är begränsat upp till 8,07 gånger inkomstbasbeloppet (IBB).

**Tjänstepension:**

**Rubrik:**
- Tjänstepension

**Undertext:**
- Tjänstepension är en extra pension som betalas utöver allmän pension, baserat på ditt kollektivavtal eller individuella avtal.

**Kort:**
- Label: Tjänstepension per månad
- Badge (dynamisk):
  - 'ITP1' (om pensionType === 'ITP1')
  - 'ITP2' (om pensionType === 'ITP2')
  - 'SAF-LO' (om pensionType === 'SAF-LO')
  - 'AKAP-KR' (om pensionType === 'AKAP-KR')
  - 'PA16' (om pensionType === 'PA16')
  - 'Eget avtal' (om pensionType === 'Annat')
- Värde: {formatCurrency(occupationalPension)}
- Undertext: Baserat på ditt valda pensionsavtal. Tjänstepensionen betalas normalt av din arbetsgivare och baseras på din lön. Här visas en uppskattad månadsavsättning till tjänstepension.
- Om ITP2: (ITP2 är förmånsbestämd och bygger inte på procent av lönen, men här visas en uppskattad månadsavsättning motsvarande dess värde omräknat till premiebaserad form.)

**Total summary:**

**Label:**
- Total pensionsavsättning per månad

**Värde:**
- {formatCurrency(totalPublicPension + occupationalPension)}

**Undertext:**
- Detta är den totala uppskattade pensionsavsättningen per månad, baserad på din lön och ditt pensionsavtal (allmän pension och tjänstepension). Beloppen dras inte direkt från din nettolön, utan visar hur mycket som sätts av till framtida pension.

**Efter skatt (om netSalary finns):**
- **Efter skatt:** Du får ut cirka **{formatCurrency(netSalary)}** per månad.
- **Pensionsavsättning per månad (allmän pension + tjänstepension):** **{formatCurrency(totalPublicPension + occupationalPension)}**

### 3.4 Promotion Banner

**Rubrik:**
- Vill du se hur din lön och pension påverkar din totala förmögenhet?

**Text:**
- Med **Förmögenhetskollen** kan du koppla ihop din lön, dina pensionsavsättningar och ditt sparande med hela hushållets ekonomi. Du ser hur mycket som sätts av till pension, hur det påverkar din framtida nettoförmögenhet och vilken nivå du ligger på i Rikedomstrappan.

**Punktlista:**
- ✓ Se en beräknad nettoförmögenhet för hela hushållet
- ✓ Få överblick över pensionstillgångar och sparande
- ✓ Följ hur din ekonomi utvecklas månad för månad
- ✓ Helt gratis, ingen inloggning – allt sparas lokalt

**Knapp:**
- Testa Förmögenhetskollen

### 3.5 Ytterligare verktyg

**Rubrik:**
- Ytterligare verktyg

**Undertext:**
- Ytterligare kalkylatorer som kan vara användbara

**Knapp 1: FIRE-kalkylator**
- Rubrik: FIRE-kalkylator
- Undertext: Ekonomisk frihet

**Knapp 2: Sparkalkylator**
- Rubrik: Sparkalkylator
- Undertext: Ränta på ränta

**Knapp 3: Förmögenhetskollen**
- Rubrik: Förmögenhetskollen
- Undertext: Dashboard

---

## Noteringar

- Alla belopp formateras med `formatCurrency()` funktionen
- Alla procentvärden visas med 1-2 decimaler
- Tooltips använder `InfoIcon` komponenten med dynamisk text
- Många textvariationer är dynamiska baserat på användarens val och beräkningar
- Promotion banners och "Ytterligare verktyg"-sektioner är identiska på alla tre sidor
