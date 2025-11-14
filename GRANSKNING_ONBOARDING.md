# Granskning: Onboarding - All text

Detta dokument innehåller all text från onboardingsprocessen, inklusive alla steg, dialoger, tooltips och varianta texter beroende på användarens val.

---

## Huvudsida (Onboarding Page)

**Plats:** `/onboarding`

### Header (alltid synlig)
**Rubrik:** "Förmögenhetskollen"
**Undertext:** "Vi hjälper dig att skapa en tydlig karta över din ekonomi"

### Global disclaimer (visas direkt efter header)
**Text:** "**Observera:** Alla beräkningar och uppskattningar i onboardingprocessen är förenklade, bygger på generella antaganden och är inte individanpassad rådgivning. Förmögenhetskollen står inte under Finansinspektionens tillsyn och informationen är avsedd för översikt och reflektion – inte som beslutsunderlag för investeringar, lån eller pensionsval."

### Progress-indikator (visas från steg 2 och framåt)
**Text:** "Steg [nummer] av 8: [sektionstitel]"
**Procent:** "[procent]%"

### Navigation
**Tillbaka-knapp (visas från steg 2):**
"← Tillbaka till föregående steg"

### Dialog: Befintligt hushåll hittat

**Öppnas:** Automatiskt när användaren navigerar till onboarding och det redan finns ett hushåll

**Header:**
- **Ikon:** Varningstriangel i box
- **Rubrik:** "Befintligt hushåll hittat"
- **Beskrivning:** "Du har redan registrerat ett hushåll. För att starta en ny onboarding behöver du ta bort ditt nuvarande hushåll."

**Innehåll:**
- **Info-box:**
  - **Rubrik:** "Vill du ta bort ditt nuvarande hushåll och registrera ett nytt?"
  - **Varning:** "All data i ditt nuvarande hushåll kommer att raderas permanent. Detta går inte att ångra."

**Footer-knappar:**
- "Nej, gå till dashboard"
- "Ja, ta bort och starta ny"

**Obs:** Dialogen är modal och kan inte stängas utan att göra ett val.

---

## Steg 1: Välkommen (WelcomeStep)

### Header
**Rubrik:** "Välkommen"
**Undertext:** "Vi hjälper dig att skapa en tydlig bild av din förmögenhet"

### Tillbaka-knapp
"Tillbaka" (länkar till dashboard)

### Huvudfördelar (4 kort)

**1. Tänk om du redan är miljonär**
- **Rubrik:** "Tänk om du redan är miljonär – utan att veta om det."
- **Text:** "När pensionen räknas med blir den totala ekonomiska bilden för många betydligt större än vad man först tror."
- **Microline:** "Vi visar dig en helhetsbild – inte bara saldot på kontot."

**2. Vi gör en förenklad uppskattning av din rikedomsnivå**
- **Rubrik:** "Vi gör en förenklad uppskattning av din rikedomsnivå."
- **Text:** "Baserat på The Wealth Ladder delar vi in förmögenhet i nivåer och visar en beräknad placering."

**3. Du får en dashboard**
- **Rubrik:** "Du får en dashboard som visar hur snabbt du rör dig uppåt."
- **Text:** "Allt räknas i dagens penningvärde – du kan jämföra dig över tid."

**4. Testa olika teoretiska sparscenarier**
- **Rubrik:** "Testa olika teoretiska sparscenarier enligt FIRE-principer."
- **Text:** "Simulera olika scenarier och se en uppskattning av när dina tillgångar kan räcka – helt baserat på dina egna antaganden."

### Info-box: Varför frågar vi om pension?
**Rubrik:** "Varför frågar vi om pension?"
**Text:** "I Sverige ligger en betydande del av hushållens finansiella sparande i pensionstillgångar. Bilden kan bli ofullständig om pension inte räknas in."

### Privacy-info
**Text:** "🔒 **Dina uppgifter är säkra:** All data lagras lokalt i din webbläsare och delas aldrig med någon. Du har full kontroll över dina uppgifter."

### CTA-knapp
**Mobil:** "Kom igång"
**Desktop:** "Här börjar du – Fyll i hushållets personer och inkomster"

---

## Steg 2: Personer (PersonsWizardStep)

### Micro-insight (visas överst)
**Rubrik:** "Tänk om din verkliga förmögenhet är större än du tror?"
**Text 1:** "I Sverige ligger en betydande del av hushållens finansiella sparande i pensionstillgångar. För många blir bilden därför missvisande om pension inte räknas in."
**Text 2:** "Vi börjar med personerna i hushållet för att kunna räkna rätt på pension, ålder och ekonomisk utveckling."

### Intro-steg

**Header:**
- **Ikon:** Användarikon i blå cirkel
- **Rubrik:** "Vem ingår i hushållet?"
- **Undertext:** "Lägg till vuxna i hushållet med inkomst och tillgångar"
- **Progress-glimt:** "När du fyllt i detta steg kan vi göra en modellbaserad pensionsuppskattning."

**Info-box:**
"Vi behöver veta vilka vuxna ni är för att kunna göra en förenklad uppskattning av pension, uppskattad ålder vid ekonomisk frihet (simulerad) och beräknad nivå i Rikedomstrappan. Du behöver inte lägga till barn — de påverkar inte beräkningarna."

**Förklaring under "Lägg till person"-knappen:**
"(Du behöver lägga in någon form av inkomst eller sparande för att kunna beräkna pension och nettoförmögenhet korrekt.)"

**Kvitto (visas när person läggs till):**
- Visas i 3 sekunder efter att person lagts till
- **Text:** "Bra! Detta ingår i den förenklade uppskattning som visas senare."
- **Ikon:** CheckCircle (grön)

**Knappar (om inga personer lagts till än):**
- "Lägg till person"

**Varning (om inga personer lagts till än):**
"**Viktigt:** Du måste lägga till minst en person för att slutföra onboardingen."

**Om personer redan finns:**
- **Text:** "Du har lagt till [antal] person[er]:"
- **Lista:** Visar varje person med:
  - Namn
  - Nettoinkomst: [belopp]/månad
  - **Statlig pension:**
    - Inkomstpension (fördelningssystem): [belopp]/månad
  - **Marknadsbaserad:**
    - Premiepension: [belopp]/månad
    - Tjänstepension: [belopp]/månad
    - Löneväxling: [belopp]/månad (om > 0)
    - IPS: [belopp]/månad (om > 0)
  - Totalt pensionsavsättningar: [belopp]/månad
  - Övrigt sparande och investeringar: [belopp]/månad
  - Totalt sparande: [belopp]/månad

**Hushållets totalsummering (om personer finns):**
- **Rubrik:** "Hushållets totalsummering"
- **Total nettoinkomst:** [belopp]/månad
  - Undertext: "Uppskattning, kan variera"
- **Pensionsavsättningar:** [belopp]/månad
  - Undertext: "Omräknat som månadsbelopp, men tjänas in årsvis"
- **Övrigt sparande:** [belopp]/månad
- **Amortering:** [belopp]/månad (om > 0)
- **Totalt sparande:** [belopp]/månad
- **Uppskattade utgifter:** [belopp]/månad
  - Undertext: "Nettoinkomst − sparande − amortering"

**Knappar (om personer finns):**
- "Lägg till fler personer"
- "Fortsätt till pensionstillgångar →"
  - Disabled om inga personer finns
  - Undertext (om disabled): "Du måste lägga till minst en person för att slutföra onboardingen"

### Person-detaljer (person-details)

**Rubrik:** "Grunduppgifter"

**Fält:**
1. **Namn (valfritt)**
   - Placeholder: "Anna Andersson"

2. **Födelsår**
   - Min: 1900
   - Max: [nuvarande år - 65]
   - Undertext: "Ålder: [ålder] år"
   - **Varning (om ålder > 64):**
     - **Rubrik:** "⚠️ Åldersbegränsning"
     - **Text:** "Appen är anpassad för personer som inte aktivt har pension. Beräkningar och funktioner är designade för personer som vill veta mer om sin framtida pension. Personen får inte vara över 64 år."

**Knappar:**
- "← Tillbaka"
- "Nästa →" (disabled om ålder > 64)

### Inkomst-val (income-choice)

**Om inga inkomster finns än:**
- **Rubrik:** "Inkomster"
- **Fråga:** "Har [namn eller 'personen'] inkomster?"

**Alternativ:**
1. "Ja, huvudjobb eller annat arbete"
2. "Ja, övrig inkomst (t.ex. utdelning, hyresintäkt, bidrag)"
3. "Nej, hoppa över inkomster"

**Om inkomster redan finns:**
- **Rubrik:** "Inkomster"
- **Text:** "Du har lagt till [antal] inkomst[er]:"
- **Lista:** Varje inkomst visar:
  - Beskrivning
  - Typ: "Jobb" eller "Övrig" • [belopp]/mån
  - Knappar: "Redigera" och "Ta bort"

**Knappar:**
- "Lägg till fler inkomster" (med plus-ikon)
- "Fortsätt till sparande →"

### Inkomst-typ-val (income-choice-type)

**Rubrik:** "Lägg till inkomst"
**Fråga:** "Vilken typ av inkomst vill du lägga till?"

**Alternativ:**
1. "Huvudjobb eller annat arbete"
2. "Övrig inkomst (t.ex. utdelning, hyresintäkt, bidrag)"

**Knapp:**
- "← Tillbaka"

### Jobbinkomst (income-job)

**Rubrik:** "Jobbinkomst"
**Undertext:** "Du fyller i: **[namn eller 'Person']**"

**Info-box:**
"**Viktigt:** Ange bruttolön (före skatt) efter eventuell löneväxling. Om du löneväxlar drar du av det från bruttolönen innan du fyller i den här.

Vi ber om detta eftersom tjänstepensionsavsättningen annars riskerar att beräknas dubbelt.

Vi gör en förenklad skatteberäkning baserad på schabloniserade svenska skatteregler. Nettoinkomsten och pensionsavsättningarna beräknas därefter."

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Huvudjobb", "Deltidsjobb")**
   - Placeholder: "Huvudjobb"

2. **Bruttolön (kr/månad, före skatt, efter löneväxling)**
   - Placeholder: "30000"
   - Undertext: "Ange din bruttolön efter eventuell löneväxling (före skatt). Om du har löneväxling, dra av den från bruttolönen. Vi gör en förenklad nettoberäkning baserad på schabloner."

**Bekräftelse (om belopp > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Jobb X']: [belopp]/mån"

**Knappar:**
- "← Tillbaka"
- "Nästa: Pensionsavtal →" (disabled om belopp saknas eller ≤ 0)

### Övrig inkomst (income-other)

**Rubrik:** "Övrig inkomst"
**Undertext:** "Övrig inkomst är redan efter skatt och anges som månadsbelopp"

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Hyresintäkt", "Bidrag")**
   - Placeholder: "Hyresintäkt"

2. **Månadsinkomst (kr, efter skatt)**
   - Placeholder: "10000"

**Bekräftelse (om belopp > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Inkomst X']: [belopp]/mån"

**Knappar:**
- "← Tillbaka"
- "Lägg till inkomst" (disabled om belopp saknas eller ≤ 0)

### Pensionswizard (pension-wizard)

**Steg 1 av 3: Vilken typ av arbetsgivare har du?**
- **Alternativ:**
  - "Privat företag" - "T.ex. Volvo, IKEA, Spotify, startup"
  - "Kommun eller region" - "T.ex. Göteborgs stad, Region Stockholm"
  - "Statlig myndighet" - "T.ex. Skatteverket, Försäkringskassan"

**Steg 2 av 3: Vad för typ av anställning har du?**
- **Alternativ:**
  - "Tjänsteman" - "Kontorsarbete, chef, specialist, ingenjör"
  - "Arbetare" - "Produktion, lager, service, vård"

**Steg 3 av 3: Vill du använda standardavtalet eller ange ditt eget?**
- **Alternativ:**
  - "Använd standardavtalet" - "Vi föreslår ett standardavtal som brukar passa de flesta i din situation"
  - "Ange mitt eget avtal" - "Jag vet vilket avtal jag har eller vill ange det manuellt"

**Knapp:**
- "← Tillbaka" (går tillbaka ett steg eller till income-job om på steg 1)

**Obs:** Om användaren väljer "Ange mitt eget avtal" går de till "pension-custom" istället för "salary-exchange".

### Anpassa pensionsavtal (pension-custom)

**Rubrik:** "Anpassa pensionsavtal"

**Val: Hur vill du ange pensionsavtalet?**
- **Alternativ:**
  - "Procent (%)"
  - "Belopp (kr/mån)"

**Om Procent valt:**
- **Fält:** "Tjänstepension i % av lön"
  - Placeholder: "4.5"

**Om Belopp valt:**
- **Fält:** "Tjänstepension i kr/månad"
  - Placeholder: "2500"

**Knappar:**
- "← Tillbaka"
- "Nästa →"

### Löneväxling (salary-exchange)

**Rubrik:** "Löneväxling"
**Undertext:** "Om du har löneväxling, ange den här. **OBS:** Bruttolönen du angav tidigare ska vara efter löneväxling (dvs. redan dragen av)."

**Fält:**
- **Löneväxling till pension (kr/månad, valfritt)**
  - Placeholder: "0"

**Knappar:**
- "← Tillbaka" (går tillbaka till pension-wizard eller pension-custom beroende på val)
- "Lägg till inkomst"

### Sparande (savings)

**Rubrik:** "Sparande"
**Undertext:** "Ange hur mycket [namn eller 'personen'] sparar per månad"

**Fält:**
1. **IPS-sparande (kr/månad, valfritt)**
   - Placeholder: "0"
   - Undertext: "Individuellt pensionssparande. Från 2024 finns det ingen skattelättnad för IPS, men om du redan har det kan du ange det här."

2. **Övrigt sparande och investeringar (kr/månad)**
   - Placeholder: "5000"
   - Undertext: "Allt som du lägger på ekonomiska investeringar: ISK, AF, KF, fonder, aktier, ETF:er, obligationer, räntefonder, sparkonto, kapitalförsäkring, fastigheter, crypto m.m. Här anger du värden på investeringar du redan har – detta är inte en rekommendation att köpa vissa typer av tillgångar."

**Sammanfattning för personen (om namn finns):**
- **Rubrik:** "Sammanfattning för [namn eller 'personen']"
- **Nettoinkomst:** [belopp]/mån
- **Pensionsavsättningar:** [belopp]/mån
- **IPS-sparande:** [belopp]/mån (om > 0)
- **Övrigt sparande:** [belopp]/mån
- **Totalt sparande:** [belopp]/mån

**Knappar:**
- "← Tillbaka" (går tillbaka till income-choice eller income-choice-type)
- "Lägg till person" (disabled om inga inkomster, IPS eller övrigt sparande finns)

---

## Steg 3: Pensionstillgångar per person (PensionPerPersonStep)

### Micro-insights (visas överst)
1. "Enligt Nick Maggiulli, skaparen av The Wealth Ladder, tenderar många att underskatta pensionens betydelse i den totala förmögenheten."
2. "Tänk dig att du tror att du har 500 000 kr – men i verkligheten 2,5 miljoner. I många fall kan det se ut så när pensionen räknas in."

### Header
**Text:** "Du fyller i: **[personens namn eller 'Person X']**"
**Rubrik:** "[Aktuellt substeg]"

### Intro-steg

**Ikon:** PiggyBank i gradient-cirkel
**Rubrik:** "Hitta din pension på minpension.se"
**Undertext:** "Nu tar vi det du redan har tjänat in. Vi guidar dig genom att hitta alla delar av din pension. Du kan fylla i pensionen i vilken ordning du vill — allt sparas automatiskt."
- **Progress-glimt:** "När du fyllt i detta steg kan vi göra en modellbaserad pensionsuppskattning."

**Mini-disclaimer (visas direkt efter undertext):**
"Beräkningarna i appen bygger på dina inmatade värden och förenklade antaganden och ska inte ses som personlig pensionsrådgivning."

**Info-box: Vad behöver du?**
- BankID för att logga in på minpension.se
- 10-15 minuter för att hitta alla pensionsdelar
- Dina pensionsvärden från olika källor

**Knapp:**
- "Öppna minpension.se" (öppnar i ny flik)

**Info-box: Varför pensionen är viktig**
- **Rubrik:** "💡 Varför pensionen är viktig"
- **Text 1:** "I genomsnitt ligger en stor del av svenskarnas förmögenhet i pensionssystemet."
- **Text 2:** "Därför blir bilden skev om man bara tittar på sparkontot."
- **Text 3:** "När vi lägger ihop allt – precis som i The Wealth Ladder – får du se din verkliga nivå."

**Knapp:**
- "Börja med inkomstpension"

### Inkomstpension (inkomstpension)

**Info-box:**
- **Ikon:** PiggyBank
- **Rubrik:** "Inkomstpension (Statlig)"
- **Beskrivning:** "Detta är din statliga del – alla som jobbat har den."
- **Var hittar jag detta?**
  - "På minpension.se under 'Allmän pension' → 'Inkomstpension'"
  - Knapp: "Öppna minpension.se"

**Fält:**
- **Belopp (kr)**
  - Placeholder: "0"
  - Visar formaterat belopp om > 0

**Knappar:**
- "← Tillbaka"
- "Nästa" (med pil)

### Premiepension (premiepension)

**Info-box:**
- **Ikon:** PiggyBank
- **Rubrik:** "Premiepension"
- **Beskrivning:** "Detta är den marknadsbaserade delen, där värdet kan variera mer över tid beroende på marknadsutvecklingen. Premiepensionen är en del av den allmänna pensionen och kan tas ut först från den lägsta uttagsålder som gäller för din årskull (idag ofta omkring 63–65 år)."
- **Var hittar jag detta?**
  - "På minpension.se under 'Allmän pension' → 'Premiepension'"
  - Knapp: "Öppna minpension.se"

**Fält:**
- **Belopp (kr)**
  - Placeholder: "0"
  - Visar formaterat belopp om > 0

**Knappar:**
- "← Tillbaka"
- "Nästa" (med pil)

### Tjänstepension (tjanstepension)

**Info-box:**
- **Ikon:** PiggyBank
- **Rubrik:** "Tjänstepension"
- **Beskrivning:** "Din tjänstepension från arbetsgivaren via pensionsbolag."
- **Var hittar jag detta?**
  - "På minpension.se under 'Tjänstepension' eller 'Privat pension'"
  - Knapp: "Öppna minpension.se"

**Fält:**
- **Belopp (kr)**
  - Placeholder: "0"
  - Visar formaterat belopp om > 0

**Knappar:**
- "← Tillbaka"
- "Nästa" (med pil)

### IPS (ips)

**Info-box:**
- **Ikon:** PiggyBank
- **Rubrik:** "IPS (Privat pensionssparande)"
- **Beskrivning:** "Individuellt pensionssparande (IPS) är en äldre sparform som inte längre har avdragsrätt för de flesta. Om du redan har ett IPS-värde kan du ange det här."
- **Var hittar jag detta?**
  - "På minpension.se under 'IPS' eller på din banks webbplats"
  - Knapp: "Öppna minpension.se"

**Fält:**
- **Belopp (kr)**
  - Placeholder: "0"
  - Visar formaterat belopp om > 0

**Knappar:**
- "← Tillbaka"
- "Visa sammanfattning" (med pil)

### Sammanfattning (summary)

**Rubrik:** "✅ Pensionstillgångar för [personens namn eller 'Person X']"

**Lista:** Visar alla pensionsdelar som lagts till:
- [Pensionstyp]: [belopp]
- **Totalt:** [totalt belopp]

**Info-box:**
"💡 Nu kan vi räkna in din dolda förmögenhet."

**Knappar:**
- "← Tillbaka"
- **Om fler personer finns:** "Nästa person" (med pil)
- **Om sista personen:** "Klar" (med CheckCircle)

**Obs:** Om det finns fler personer, går processen tillbaka till intro-steg för nästa person.

---

## Steg 4: Spar och investeringar (SavingsInvestmentWizardStep)

### Micro-insights (visas överst)
1. "För många svenskar är bostaden deras största tillgång – ofta mer värd än allt sparande tillsammans."
2. "En svensk med 500 000 kr i sparande kan i vissa fall ha en liknande ekonomisk trygghet som en amerikan med ett betydligt större privat sparkapital, eftersom mycket av tryggheten i Sverige ligger i pensionssystem och offentliga tjänster."

**Mini-disclaimer (visas efter info-box "Vad behöver du göra?"):**
"Här fyller du i värden på sparande eller investeringar du redan har. Detta är inte en rekommendation att investera i en viss produkt eller tillgångstyp."

### Intro-steg

**Ikon:** Building2 i grön cirkel
**Rubrik:** "Spar och investeringar på börsen"
**Undertext:** "Lägg till dina bankinvesteringar - sparkonton, fonder och aktier."
- **Progress-glimt:** "När du lägger in detta får du en mer komplett bild av din förmögenhet."

**Info-box: Vad behöver du göra?**
- **Rubrik:** "Vad behöver du göra?"
- **Text:** "Logga in på din bank och hitta:"
- **Lista:**
  - Sparkonton och belopp (det går bra att lägga till både sparkonton och lönekonton med överskott)
  - Fonder och deras värde
  - Aktier och deras värde
  - Övriga tillgångar via banken

**Knappar (om inga tillgångar lagts till än):**
- "Börja lägga till"
- "Hoppa över"

**Om tillgångar redan finns:**
- **Text:** "Du har lagt till [antal] tillgång[ar]:"
- **Lista:** Varje tillgång visar:
  - Beskrivning
  - Kategori
  - Värde
- **Knappar:**
  - "Lägg till fler tillgångar"
  - "Fortsätt till boende →"

### Välj typ (choose-type)

**Rubrik:** "Vilken typ av investering?"
**Undertext:** "Välj typen av investering du vill lägga till"

**Alternativ:**
1. **Spar och kontanter**
   - Ikon: 💰
   - Beskrivning: "Sparkonton, lönekonto med överskott, kontanter"

2. **Aktier & Fonder**
   - Ikon: 📈
   - Beskrivning: "Fonder, aktier, ETF:er via banken"

**Knapp:**
- "← Tillbaka"

### Input-steg (input)

**Rubrik:** "Lägg till [spar/kontanter eller aktier & fonder]"

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Nordea sparkonto", "Avanza fonder")**
   - Placeholder: "Nordea sparkonto" (för spar) eller "Avanza fonder" (för aktier)

2. **Värde (kr)**
   - Placeholder: "100000"

**Bekräftelse (om värde > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Investeringar X']: [belopp]"

**Knappar:**
- "← Tillbaka"
- "Lägg till tillgång"

**Om tillgångar redan finns (visas under knapparna):**
- **Text:** "Du har lagt till [antal] tillgång[ar]:"
- **Lista:** Visar alla tillgångar
- **Knappar:**
  - "Lägg till fler tillgångar"
  - "Fortsätt till boende →"

---

## Steg 5: Boende (HousingWizardStep)

### Micro-insight (visas överst)
"💬 Nu tittar vi på allt du äger – ditt hem, bilen, sparandet och andra tillgångar. Många blir förvånade över hur mycket av deras förmögenhet som faktiskt finns i boendet."

### Fråga: Äger du ditt boende?

**Ikon:** Home i lila cirkel
**Rubrik:** "Äger du ditt boende eller annan bostad?"
**Undertext:** "Lägg till bostadsrätt, hus, fritidshus eller annan bostad du äger"

**Alternativ:**
1. "Ja, jag äger mitt boende"
2. "Ja, jag äger annan bostad"
3. "Nej, hoppa över"

### Välj typ av boende

**Rubrik:** "Vilken typ av boende?"
- **Progress-glimt:** "När du lägger in boendet får du se din verkliga förmögenhet."

**Alternativ:**
1. **Bostad** 🏠
   - "Huvudbostad, bostadsrätt, hus"

2. **Semesterbostad** 🏡
   - "Fritidshus, stuga"

**Knapp:**
- "← Tillbaka"

### Lägg till boende

**Rubrik:** "Lägg till [bostad eller semesterbostad]"

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Bostadsrätt på Södermalm", "Fritidshus i Småland")**
   - Placeholder: "Bostadsrätt på Södermalm" (för bostad) eller "Fritidshus i Småland" (för semesterbostad)

2. **Värdering (kr)**
   - Placeholder: "3000000"
   - Undertext: "Använd aktuellt marknadsvärde eller senaste taxeringsvärde"

**Bekräftelse (om värde > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Bostad 1'/'Semesterbostad 1']: [belopp]"

**Knappar:**
- "← Tillbaka"
- "Fortsätt till övriga tillgångar →" (disabled om värde saknas eller ≤ 0)

**Obs:** Om användaren lägger till en bostad, går de automatiskt till "Bostadslån"-steget efter detta.

---

## Steg 5b: Bostadslån (SpecificLiabilityWizardStep)

**Öppnas:** Automatiskt efter att användaren lagt till en bostad

### Fråga: Har du bostadslån?

**Ikon:** CreditCard i röd cirkel
**Rubrik:** "Har du bostadslån på [bostadens namn]?"
**Undertext:** "Värdet på [bostadens namn] är [belopp]"

**Alternativ:**
1. "Ja, jag har bostadslån"
2. "Nej, hoppa över"

### Lägg till bostadslån

**Rubrik:** "Lägg till bostadslån"
**Undertext:** "För [bostadens namn] ([belopp])"

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Bostadslån")**
   - Placeholder: "Bostadslån"

2. **Kvarvarande belopp (kr)**
   - Placeholder: "2000000"
   - **Varning (om belopp > bostadsvärde):**
     "⚠️ Lånebeloppet överstiger tillgångens värde. Detta är tillåtet men kan vara ovanligt."

3. **Amorteringstakt (% per år)**
   - Standard: [DEFAULT_AMORTIZATION_RATE * 100]% per år
   - Undertext: "Standard är [procent]% per år"

**Bekräftelse (om belopp > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Bostadslån 1']: [belopp] ([procent]%/år)"

**Knappar:**
- "← Tillbaka"
- "Fortsätt →" (disabled om belopp saknas eller ≤ 0)

---

## Steg 6: Övriga tillgångar (OtherInvestmentsWizardStep)

### Intro-steg

**Rubrik:** "Övriga tillgångar"
**Undertext:** "Lägg till bil, tomt, maskiner eller andra tillgångar"

**Knappar (om inga tillgångar lagts till än):**
- "Lägg till tillgång"
- "Hoppa över"

**Om tillgångar redan finns:**
- **Text:** "Du har lagt till [antal] tillgång[ar]:"
- **Lista:** Varje tillgång visar:
  - Beskrivning
  - Kategori
  - Värde
- **Knappar:**
  - "Lägg till fler tillgångar"
  - "Fortsätt till lån och skulder →"

### Välj kategori (select-category)

**Rubrik:** "Välj kategori"
**Undertext:** "Vilken typ av investering vill du lägga till?"

**Kategorier:**
1. **Bostad** 🏠 - "Huvudbostad, bostadsrätt, hus"
2. **Semesterbostad** 🏡 - "Fritidshus, stuga"
3. **Bil** 🚗 - "Personbil, lastbil, motorcykel"
4. **Tomt & Mark** 🏞️ - "Tomt, skog, jordbruksmark"
5. **Maskiner & Utrustning** ⚙️ - "Företagsutrustning, maskiner"
6. **Fordon (övrigt)** 🚢 - "Båt, flygplan, övrigt fordon"
7. **Ädelmetaller & Smycken** 💎 - "Guld, silver, smycken"
8. **Annat** 📦 - "Övriga tillgångar"

**Knapp:**
- "← Tillbaka"

### Input-steg (input)

**Rubrik:** "Lägg till [kategori i lowercase]"

**Fält:**
1. **Beskrivning (valfritt)**
   - Placeholder: "T.ex. Volvo V70, Guldmynt, Moped"

2. **Värde (kr)**
   - Placeholder: "50000"

**Bekräftelse (om värde > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Kategori X']: [belopp]"

**Knappar:**
- "← Tillbaka"
- "Lägg till tillgång" (disabled om värde saknas eller ≤ 0)

**Om tillgångar redan finns (visas under knapparna):**
- **Text:** "Du har lagt till [antal] tillgång[ar]:"
- **Lista:** Visar alla tillgångar
- **Knappar:**
  - "Lägg till fler tillgångar"
  - "Fortsätt till lån och skulder →"

**Obs:** Om användaren lägger till en bil, går de automatiskt till "Billån"-steget efter detta.

---

## Steg 6b: Billån (SpecificLiabilityWizardStep)

**Öppnas:** Automatiskt efter att användaren lagt till en bil

### Fråga: Har du billån?

**Ikon:** CreditCard i röd cirkel
**Rubrik:** "Har du billån på [bilens namn]?"
**Undertext:** "Värdet på [bilens namn] är [belopp]"

**Alternativ:**
1. "Ja, jag har billån"
2. "Nej, hoppa över"

### Lägg till billån

**Rubrik:** "Lägg till billån"
**Undertext:** "För [bilens namn] ([belopp])"

**Fält:**
1. **Beskrivning (valfritt, t.ex. "Billån")**
   - Placeholder: "Billån"

2. **Kvarvarande belopp (kr)**
   - Placeholder: "2000000"
   - **Varning (om belopp > bilvärde):**
     "⚠️ Lånebeloppet överstiger tillgångens värde. Detta är tillåtet men kan vara ovanligt."

3. **Amorteringstakt (% per år)**
   - Standard: [DEFAULT_AMORTIZATION_RATE * 100]% per år
   - Undertext: "Standard är [procent]% per år"

**Bekräftelse (om belopp > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller 'Billån 1']: [belopp] ([procent]%/år)"

**Knappar:**
- "← Tillbaka"
- "Fortsätt →" (disabled om belopp saknas eller ≤ 0)

---

## Steg 7: Övriga lån och skulder (LiabilitiesWizardStep)

### Micro-insights (visas överst)
1. "Att ha lån betyder inte att du ligger efter – det handlar om balansen mellan tillgångar och skulder."
2. "I ekonomisk teori kan lån skapa så kallad hävstång."
   - **Förklaring:** "Det innebär att förändringar i värdet på en tillgång kan slå hårdare – både uppåt och nedåt – när en del av köpet är lånefinansierat."
   - **Varning:** "Detta är endast en teoretisk princip och ska inte tolkas som en uppmaning att investera med lån eller belåna tillgångar."

### Intro-steg

**Ikon:** CreditCard i röd cirkel
**Rubrik:** "Övriga lån och skulder"
**Undertext:** "Lägg till övriga lån och skulder - krediter, privatlån, studielån m.m."
- **Progress-glimt:** "Du är snart klar! Detta är sista steget innan du ser din fullständiga förmögenhetsbild."

**"Du är snart klar!"-modal:**
- Visas automatiskt när man börjar steget (efter 1 sekund)
- **Rubrik:** "Du är snart klar!"
- **Text:** "Detta är sista steget innan du ser din fullständiga förmögenhetsbild och din nivå i Rikedomstrappan."
- **Knapp:** "Fortsätt"

**Knappar (om inga lån lagts till än):**
- "Lägg till lån"
- "Hoppa över"

**Kvitto (visas när lån läggs till):**
- Visas i 3 sekunder efter att lån lagts till
- **Text:** "Bra! Detta ingår i den förenklade uppskattning som visas senare."
- **Ikon:** CheckCircle (grön)

**Om lån redan finns:**
- **Text:** "Du har lagt till [antal] lån/skuld[er]:"
- **Lista:** Varje lån visar:
  - Beskrivning
  - Amortering: [procent]% per år
  - Kvarvarande belopp
- **Knappar:**
  - "Lägg till fler lån"
  - "Fortsätt till sammanfattning →"

### Input-steg (input)

**Rubrik:** "Lägg till lån eller skuld"

**Fält:**
1. **Typ av lån**
   - Dropdown med alternativ:
     - "Bostadslån"
     - "Billån"
     - "Annat"

2. **Beskrivning (valfritt, t.ex. "Bostadslån", "Billån", "Kreditkort")**
   - Placeholder: "Bostadslån"

3. **Kvarvarande belopp (kr)**
   - Placeholder: "2000000"

4. **Amorteringstakt (% per år)**
   - Standard: [DEFAULT_AMORTIZATION_RATE * 100]% per år
   - Undertext: "Standard är [procent]% per år"

**Bekräftelse (om belopp > 0):**
- Ikon: CheckCircle
- Text: "[beskrivning eller standardnamn]: [belopp] ([procent]%/år)"

**Knappar:**
- "← Tillbaka"
- "Lägg till lån" (disabled om belopp saknas eller ≤ 0)

---

## Steg 8: Sammanfattning (SummaryStep)

### Sammanfattningskort (3 kort i rad)

**1. Personer**
- Ikon: Checkmark i grön cirkel
- **Rubrik:** "Personer"
- **Värde:** "[antal] st"

**2. Tillgångar & pension**
- Ikon: Checkmark i grön cirkel
- **Rubrik:** "Tillgångar & pension"
- **Värde:** "Inlagda"

**3. Skulder**
- Ikon: Checkmark i grön cirkel
- **Rubrik:** "Skulder"
- **Värde:** "Inlagda"

### Insight-kort

**Rubrik:** "Nu kan vi visa var ditt hushåll befinner sig i The Wealth Ladder – din ekonomiska nivå i verkligheten."

**Text 1:** "I USA uppskattar ekonomer att ungefär 20% av hushållen befinner sig på nivå 1, 20% på nivå 2 och runt 40% på nivå 3 enligt tolkningar av SCF-data. Bara cirka 2% når nivå 5 ("geografisk frihet"). Var hamnar du?"

**Text 2:** "Du är nu redo att se hur din rikedom utvecklas månad för månad – och när din pension börjar bidra på riktigt."

### CTA-knappar

- "Tillbaka"
- **Mobil:** "Klar →"
- **Desktop:** "Klar – Visa min förmögenhetsöversikt →"

### Microcopy

**Text:** "Nu får du se var du ligger på The Wealth Ladder och hur din ekonomi utvecklas över tid.
Här ser du hur din förmögenhet förändras varje månad och när pensionen blir en viktig del av helheten."

### Referenstext

**Text:** "Referenser: The Wealth Ladder (Nick Maggiulli), minpension.se, svenska pensionssystemet"

---

## Progress-indikator (OnboardingSectionProgress)

**Visas:** Från steg 2 och framåt (inte på welcome-steg)

### Sektioner (3 kort i rad)

**1. Personer & inkomster**
- **Ikon:** Users
- **Rubrik:** "Personer & inkomster"
- **Undertext:** "Vi börjar med vilka ni är"
- **Status:**
  - Klar: Grön bakgrund, checkmark-ikon
  - Aktiv: Blå bakgrund, Users-ikon
  - Kommande: Grå bakgrund, Users-ikon

**2. Tillgångar**
- **Ikon:** Home
- **Rubrik:** "Tillgångar"
- **Undertext:** "Bostad, sparande, övrigt"
- **Status:**
  - Klar: Grön bakgrund, checkmark-ikon
  - Aktiv: Blå bakgrund, Home-ikon
  - Kommande: Grå bakgrund, Home-ikon

**3. Skulder & lån**
- **Ikon:** CreditCard
- **Rubrik:** "Skulder & lån"
- **Undertext:** "Bolån, studielån, krediter"
- **Status:**
  - Klar: Grön bakgrund, checkmark-ikon
  - Aktiv: Blå bakgrund, CreditCard-ikon
  - Kommande: Grå bakgrund, CreditCard-ikon

---

## Varianta texter och villkor

### Åldersvalidering
- **Om ålder > 64 år:**
  - Varning visas i person-detaljer
  - "Nästa"-knapp är disabled
  - Användaren kan inte fortsätta

### Inkomst-validering
- **Om inga inkomster, IPS eller övrigt sparande:**
  - "Lägg till person"-knapp är disabled i savings-steg
  - Varning kan visas

### Pensionsavtal-bestämning
- **Automatisk bestämning baserat på:**
  - Arbetsgivare (privat/kommun/statlig)
  - Anställningstyp (tjänsteman/arbetare)
  - Ålder (ITP1 vs ITP2 för tjänstemän ≥ 45 år)
  - Användarens val (standard vs eget avtal)

### Generiska namn
- **Om användaren inte anger namn:**
  - Person: "Person 1", "Person 2", etc.
  - Inkomst: "Jobb 1", "Inkomst 1", etc.
  - Tillgång: "Investeringar 1", "Bostad 1", etc.
  - Lån: "Bostadslån 1", "Billån 1", "Skuld 1", etc.

### Flertal/entalshantering
- "person" / "personer"
- "inkomst" / "inkomster"
- "tillgång" / "tillgångar"
- "pension" / "pensioner"
- "lån" / "lån" (samma form)
- "skuld" / "skulder"

---

## Externa länkar och referenser

### minpension.se
- Länkas till i flera steg för att hitta pensionsvärden
- Öppnas i ny flik

### Referenser (visas i sammanfattning)
- The Wealth Ladder (Nick Maggiulli)
- minpension.se
- svenska pensionssystemet

---

## Obs: AssetWizard-komponenten

**Obs:** AssetWizard-komponenten (`src/components/ui/AssetWizard.tsx`) verkar inte användas i den nya onboarding-processen. Den används troligen i andra delar av appen (t.ex. när man redigerar hushåll). Den innehåller dock relevant text om tillgångskategorier som kan vara användbar för referens.

