# Granskning: Dashboard - Ditt sparande (SavingsCard)

Detta dokument innehåller all text från "Ditt sparande"-kortet som visar månadssparande och sparkvot.

---

## Låst läge (Nivå 0)

### Rubrik
"Ditt sparande"

### Meddelande
- **Ikon:** Lås-ikon
- **Text:** "Lås upp på Nivå 1"

### Beskrivning
"För att se ditt sparande och beräkna framtida tillväxt behöver du först skapa ett hushåll med minst en person."

### Badge
"Baserat på din nettoförmögenhet"

---

## Aktivt läge (Nivå 1-6)

### Rubrik
"Ditt sparande"
**Undertext (dynamisk baserat på nivå):**
- **Nivå 1:** "Bygg din buffert"
- **Nivå 2:** "Mot ekonomisk trygghet"
- **Nivå 3+:** "Mot ekonomisk frihet"

### Huvudvärde
**Stort belopp:** Formaterat månadssparande (t.ex. "5 000 kr")
**Undertext:** "per månad"

### Förklarande text
"Månadsökningen består av amorteringar (som ökar din nettoförmögenhet) och annat sparande som registrerats i hushållet (exklusive pensionsavsättningar)."

### Sparkvot
**Rubrik:** "Sparkvot"
**Värde:** "[Procent]%" (t.ex. "15.5%")

**Badge (beroende på sparkvot):**
- **≥ 30%:** "Utmärkt!"
- **20-29%:** "Mycket bra!"
- **10-19%:** "Bra!"
- **5-9%:** "På väg!"
- **1-4%:** "Början!"
- **0%:** "Kom igång"

### Uppmuntring (dynamisk baserat på nivå och sparkvot)

#### Nivå 1
**Titel:** "Bygg din buffert"
**Meddelande:** "Varje månad du sparar bygger trygghet och ger dig möjlighet till framtida frihet."
**Uppmuntring:**
- **Om totalMonthlySavings = 0:** "Börja med att sätta undan en liten summa varje månad – varje steg räknas!"
- **Om totalMonthlySavings > 0:** "Bra start! Du sparar redan [belopp]/månad."

#### Nivå 2
**Titel:** "Mot ekonomisk trygghet"
**Meddelande:** "Ditt sparande växer och ger dig större möjligheter och valfrihet."
**Uppmuntring:** "Fortsätt spara [belopp]/månad för att nå nästa nivå."

#### Nivå 3+
**Titel:** "Mot ekonomisk frihet"
**Meddelande:** "Ränta-på-ränta-effekten accelererar – ditt sparande får växa allt snabbare över tid."
**Uppmuntring:** "Med [belopp]/månad och ränta-på-ränta bygger du snabbt framtid."

**Ytterligare text (om sparkvot < 5%):**
"Din sparkvot är [procent]% – en målsättning på 10-20% ger snabbare framsteg."

### Tips-banner (visas endast om vissa villkor uppfylls)
**Villkor:** Nivå ≤ 3, sparkvot < 5%, och (likvidkvot < 30% eller totalAssetValue < 100 000 kr)

**Ikon:** 💡
**Text:** "Tips"
**Knapp:** "Kom igång"

**Tooltip (vid hover):**
"Börja spara regelbundet och bygg upp likvida tillgångar – då blir 0,01%-potten mer användbar i vardagen. Små steg räcker för att komma igång."

### Disclaimer
**Text:** "Sparkvotsbedömningarna är förenklade och baserade på allmän praxis — individuell situation kan variera."

### CTA-knapp
**Text:** "Se ränta-på-ränta effekt"

---

## ISK-guide Dialog

**Öppnas:** När användaren klickar på "Kom igång"-knappen i tips-bannern

### Header
**Rubrik:** "Kom igång med sparande (ISK och buffert)"
**Beskrivning:** "En enkel guide för att välja mellan fond (ISK) och sparkonto utifrån din tidshorisont – och hur du startar på några minuter."

### Vad är ISK?
**Rubrik:** "Vad är ISK?"
**Text:** "ISK är ett konto som i många informationskällor förklaras som anpassat för långsiktigt sparande. Skatten tas ut som en årlig schablon i stället för kapitalvinstskatt. Om ISK är lämpligt för dig beror på din totala ekonomi och dina mål."
**Ytterligare text:** "Du kan öppna ISK hos din bank eller en nätbank. Hela processen tar oftast bara några minuter med BankID och du styr månadssparandet själv."

### Fördelar
**Rubrik:** "Fördelar"
**Lista:**
- "Låg, förutsägbar skatt"
- "Ingen vinstskatt vid försäljning"
- "Enkelt att månadsspara"
- "Passar för sparande som inte behövs i närtid"

### Exempel på investeringar
**Rubrik:** "Exempel på investeringar"
**Lista:**
- "Breda indexfonder (global/USA)"
- "Ev. komplettera med Sverige"
- "Låga avgifter kan vara viktigt – avgiften är en säker kostnad"

### Tidshorisont
**Rubrik:** "Tidshorisont – fond eller sparkonto?"
**Text:** "Ett vanligt sätt att resonera i allmänna sparguider är att pengar som inte behövs i närtid ibland placeras i fonder via t.ex. ISK, medan pengar som kan behövas snart ofta ligger kvar på sparkonto. Vad som passar dig beror på din risknivå, buffert och tidshorisont."

### Kom igång – 4 steg
**Rubrik:** "Kom igång – 4 steg"
**Lista:**
1. "Välj bank eller nätbank"
2. "Öppna ISK-konto – det går snabbt med BankID"
3. "Ställ in månadssparande"
4. "Som exempel nämns ofta i sparguider en global indexfond med låg avgift (t.ex. under 0,4 %) som ett alternativ för långsiktigt sparande. Detta är endast ett exempel och inte en rekommendation – välj själv det som passar din situation och risknivå."

### Fondrobot
**Rubrik:** "Fondrobot – ett alternativ"
**Text:** "En fondrobot kan vara ett sätt att komma igång om du vill ha automatisk fördelning och återbalansering. Titta på avgiften och välj ett paket som passar din situation och risknivå."

### Disclaimer
**Text:** "Den här guiden beskriver vanliga sparformer på en generell nivå. Informationen är inte anpassad till din situation och ska inte ses som personlig finansiell rådgivning eller rekommendation att välja en viss bank, fond eller sparprodukt."

### Footer-knappar
- **Stäng:** "Stäng"
- **Lägg till sparande:** "Lägg till sparande" (navigerar till /household)

