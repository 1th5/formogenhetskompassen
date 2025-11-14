# Granskning: Dashboard - Ekonomisk frihet (FIRECard)

Detta dokument innehåller all text från "Ekonomisk frihet"-kortet som visar FIRE-beräkningar.

---

## Låst läge (Nivå 0 eller Nivå < 3)

### Rubrik
"Ekonomisk frihet"
**Undertext:** "baserat på FIRE-principer"

### Meddelande
- **Ikon:** Lås-ikon
- **Text:** "Lås upp på Nivå 3 (≥ 1 000 000 kr)"

### Beskrivning
"Ekonomisk frihet aktiveras när du når Restaurangfrihet och ekonomisk trygghet."

### Ytterligare information (endast om nivå > 0)
"Nivå 1-2 handlar om att bygga buffert och grundläggande trygghet. Fokusera på att skapa en ekonomisk säkerhetsmarginal här."

### Badge
"Baserat på din nettoförmögenhet"

### Information om simulatorn (endast om nivå > 0)
**Rubrik:** "I simulatorn kan du:"
**Lista:**
- "Se interaktiv graf över din väg mot ekonomisk frihet"
- "Justera avkastning, inflation, utgifter och sparande"
- "Simulera Coast FIRE – deltidsarbete under bridge-perioden"
- "Se när kapitalet når 4%-regeln och när uttag kan börja"
- "Testa olika scenarier med "vad händer om"-tänk"

### Testa simulator-knapp (endast om nivå > 0)
**Text:** "Testa simulator"
**Undertext:** "Du kan testa simulatoren även innan du låser upp funktionen"

---

## Aktivt läge (Nivå 3-6)

### Rubrik
"Ekonomisk frihet"
**Undertext:** "baserat på FIRE-principer"

### Badge och progress
**Badge-text (beroende på yearsToFire):**
- **0 år:** "Målet uppnått! 🎉"
- **1-5 år:** "Nästan där!"
- **6-10 år:** "På väg!"
- **11-20 år:** "Bra start!"
- **21+ år:** "Början av resan"

**Progress-text (endast om yearsToFire ≤ 10):**
"[Procent]% av vägen" (t.ex. "75% av vägen")

### Huvudvärde
**Stort årstal:** "[Antal] år" (t.ex. "15 år")

### Beskrivning
**Om yearsToFire = 0:**
"Du når ekonomisk frihet enligt dina antaganden – grymt jobbat!"
**Undertext:** "nu kan du leva på avkastningen utan att behöva arbeta"

**Om yearsToFire > 0:**
"tills du tidigast kan vara ekonomiskt oberoende"
**Undertext:** "om förutsättningarna förblir oförändrade från idag"

### Ytterligare information
"vid [ålder] år • genomsnittlig ålder i hushållet"

### Viktigt-meddelande
"**Viktigt:** Beräkningen förutsätter uttag från 55 år och använder genomsnittliga avkastningar. Börsen är oförutsägbar och verktyget garanterar inget. Om du planerar FIRE, gör egna beräkningar med dina förutsättningar."

**Ytterligare disclaimer:**
"Beräkningen är en simulering baserad på 4 %-regeln och dina antaganden om avkastning och utgifter – inte en garanti eller personlig rekommendation."

### Förklarande ruta

**Om yearsToFire = 0:**
"🎉 **Stort grattis!** Din portfölj bedöms kunna täcka dina utgifter med rimliga antaganden. Nu handlar det om att bevara friheten: håll en sund uttagsnivå, ha buffert och låt avkastningen göra jobbet."

**Om yearsToFire > 0:**
"**Vad betyder det?** När du enligt denna modell är ekonomiskt oberoende skulle ditt kapital kunna täcka dina beräknade utgifter utan arbete, givet antagandena ovan. Det är en teoretisk simulering – inte en uppmaning att sluta arbeta. Modellen visar en **teoretisk frihet att välja** hur du vill leva – oavsett om det är att sluta jobba, byta karriär, eller ha trygghet i vardagen."

### Finansiella nyckeltal

#### Utgifter/mån
**Rubrik:** "Utgifter/mån"
**Värde:** Formaterat belopp (t.ex. "25 000 kr")

**Info-tooltip:**
- **Rubrik:** "Hur beräknas utgifter?"
- **Text:** "Beräknas som: Nettoinkomst - (Sparande + Amortering). Detta värde är en uppskattning baserad på dina registrerade inkomster och sparande."
- **Knapp:** "Stäng"

**Varning (om utgifter < 5000 kr):**
"⚠️ **Låga utgifter:** Dina beräknade utgifter verkar orimligt låga. Kontrollera att allt stämmer under [Redigera hushåll]."

#### Portfölj vid frihet
**Rubrik:** "Portfölj vid frihet"
**Värde:** Formaterat belopp (t.ex. "3 500 000 kr")

**Info-tooltip:**
- **Rubrik:** "Vad är portfölj vid frihet?"
- **Text:** "Det tillgängliga kapitalet (exkl. pension) som du behöver vid ekonomisk frihet för att täcka utgifter fram till pension. Detta är beloppet du behöver ha investerat när du slutar jobba."
- **Bostad:** "I Förmögenhetskollens modell räknas 40 % av bostadens nettovärde som tillgängligt kapital, eftersom allt bostadskapital inte alltid är lätt att frigöra. Avkastningen på tillgängligt kapital beräknas med hänsyn till nettovärden (tillgångar minus relaterade skulder) och proportionell fördelning av övriga skulder."
- **Statlig pension (om tillämpligt):** "[Belopp]/mån från lägsta uttagsålder för din födelseårskull (ca 63 år idag) utbetalas som inkomst och minskar därför behovet av kapital vid pension. Den statliga pensionen växer fram till pensionsstart och utbetalas sedan över flera år (utbetalningstid kan variera beroende på val och regelverk)."
- **Knapp:** "Stäng"

**Ytterligare information (om statlig pension finns):**
"+ Statlig pension: [Belopp]/mån från lägsta uttagsålder (ca 63 år idag)"

### Om FIRE inte är uppnåeligt
**Rubrik:** "Fler år kvar"
**Beskrivning:** "Ekonomisk frihet är inte uppnåelig med nuvarande antaganden."
**Varning (om finns):** Visar första varningen från fireResult.warnings

**Tips-ruta:**
"**Tips:** Öka sparandet, sänk utgifterna, eller justera dina antaganden om avkastning för att se hur det påverkar din väg mot ekonomisk frihet."

### Information om simulatorn
**Rubrik:** "I simulatorn kan du:"
**Lista:**
- "Se interaktiv graf över din väg mot ekonomisk frihet"
- "Justera avkastning, inflation, utgifter och sparande"
- "Simulera Coast FIRE – deltidsarbete under bridge-perioden"
- "Se när kapitalet når 4%-regeln och när uttag kan börja"
- "Testa olika scenarier med "vad händer om"-tänk"

### CTA-knapp
**Text:** "Visa simulator"

---

## Loading-tillstånd

**Text:** "Beräknar din väg mot ekonomisk frihet..."

