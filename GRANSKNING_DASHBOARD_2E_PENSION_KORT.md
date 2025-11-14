# Granskning: Dashboard - Pensionstillgångar (PensionOverviewCard)

Detta dokument innehåller all text från "Pensionstillgångar"-kortet som visar pensionsöversikt och framtida värden.

---

## Låst läge (Nivå 0)

### Rubrik
"Pensionstillgångar"

### Meddelande
- **Ikon:** Lås-ikon
- **Text:** "Lås upp på Nivå 1"

### Beskrivning
"För att se din pensionsöversikt behöver du först skapa ett hushåll med minst en person."

---

## Aktivt läge (Nivå 1-6)

### Rubrik
"Pensionstillgångar"
**Undertext:** "Din framtida trygghet"

### Info-knapp
**Text:** "Läs mer" (navigerar till /dashboard/pension/info)

### Totalt idag
**Rubrik:** "Totalt idag"
**Värde:** Formaterat belopp (t.ex. "1 500 000 kr")
**Undertext:** "+ [belopp]/mån" (t.ex. "+ 8 500 kr/mån")

### Inflationsjustering switch
**Rubrik:** "Inflationsjustering"
**Beskrivning:**
- **Om av:** "Räknar med nominell avkastning"
- **Om på:** "Räknar med real avkastning (avkastning - 2% inflation)"

### Beräkna alla-knapp
**Text:**
- **Om dold:** "Beräkna alla tillgångar vid 67"
- **Om synlig:** "Dölj"

### Totalberäkning (visas när "Beräkna alla" är klickad)

**Rubrik:** "Total pensionstillgång vid 67 års ålder"
**Värde:** Formaterat belopp (animerat)
**Ytterligare text (om inflationsjustering):** "(Real värde, efter 2% inflation)"

**Månadsutbetalning:**
- **Rubrik:** "Månadsutbetalning över 25 år"
- **Värde:** Formaterat belopp/mån (t.ex. "12 500 kr/mån")
- **Förklaring:** "Om totalbeloppet fördelas jämnt över 25 år (300 månader)"

**Antagande (om riskjustering används):**
"ℹ️ **Antagande:** För tillgångar med avkastning över 5% har vi begränsat avkastningen till max 4% per år för åren 60-67 för att minska risken närmare pension (gäller när hushållets snittålder är under 65 år)."

---

## Pensionstyper

### Tjänstepension
**Rubrik:** "Tjänstepension"
**Nuvarande värde:** Formaterat belopp
**Beräknad månadsvis pensionsrätt:** "+[belopp]/mån (tilldelas årligen)"

**Knapp:** "Visa vid 67" / "Dölj"

**Vid 67 (när expanderat):**
- **Rubrik:** "Uppskattat värde vid 67 års ålder"
- **Värde:** Formaterat belopp (animerat)
- **Förklaring:** "Baserat på [antal] månader med [avkastningsinfo]"
- **Modellantagande (om tillämpligt):** "ℹ️ Modellantagande: För att minska risken begränsar Förmögenhetskollen avkastningen till max 4% per år för åren 60-67"

### Premiepension
**Rubrik:** "Premiepension"
**Nuvarande värde:** Formaterat belopp
**Beräknad månadsvis pensionsrätt:** "+[belopp]/mån (tilldelas årligen)"

**Knapp:** "Visa vid 67" / "Dölj"

**Vid 67 (när expanderat):**
- **Rubrik:** "Uppskattat värde vid 67 års ålder"
- **Värde:** Formaterat belopp (animerat)
- **Förklaring:** "Baserat på [antal] månader med [avkastningsinfo]"
- **Modellantagande (om tillämpligt):** "ℹ️ Modellantagande: För att minska risken begränsar Förmögenhetskollen avkastningen till max 4% per år för åren 60-67"

### IPS
**Rubrik:** "IPS"
**Nuvarande värde:** Formaterat belopp
**Beräknad månadsvis pensionsrätt:** "+[belopp]/mån (tilldelas årligen)"

**Knapp:** "Visa vid 67" / "Dölj"

**Vid 67 (när expanderat):**
- **Rubrik:** "Uppskattat värde vid 67 års ålder"
- **Värde:** Formaterat belopp (animerat)
- **Förklaring:** "Baserat på [antal] månader med [avkastningsinfo]"
- **Modellantagande (om tillämpligt):** "ℹ️ Modellantagande: För att minska risken begränsar Förmögenhetskollen avkastningen till max 4% per år för åren 60-67"

### Statlig pension
**Rubrik:** "Statlig pension"
**Nuvarande värde:** Formaterat belopp
**Beräknad månadsvis pensionsrätt:** "+[belopp]/mån (tilldelas årligen)"

**Knapp:** "Visa vid 67" / "Dölj"

**Vid 67 (när expanderat):**
- **Rubrik:** "Uppskattat värde vid 67 års ålder"
- **Värde:** Formaterat belopp (animerat)
- **Förklaring:** "Baserat på [antal] månader med [avkastningsinfo]"
- **Modellantagande (om tillämpligt):** "ℹ️ Modellantagande: För att minska risken begränsar Förmögenhetskollen avkastningen till max 4% per år för åren 60-67"
- **Förklaring om statlig pension (endast statlig pension):** "(Inkomstpension är inte en fonderad tillgång utan en intjänad rättighet. Beräkningen här är en förenklad uppskattning.)"

---

## Per person-sektion

**Rubrik:** "Per person"

### För varje person

**Rubrik:** "[Namn] ([ålder] år)"

#### Tillgångar (om någon finns)
**Rubrik:** "Tillgångar"
**Lista:**
- "Tjänstepension: [belopp]"
- "Premiepension: [belopp]"
- "IPS: [belopp]"
- "Statlig pension: [belopp]"

#### Avsättning/mån (om någon finns)
**Rubrik:** "Avsättning/mån"
**Lista:**
- "Tjänstepension: [belopp]/mån"
- "Premiepension: [belopp]/mån"
- "IPS: [belopp]/mån"
- "Statlig pension: [belopp]/mån"

#### Pensionsavtal (om några finns)
**Rubrik:** "Pensionsavtal"
**Badges:** Lista med pensionsavtal (t.ex. "ITP1", "SAF-LO", "PA16")

---

## Viktigt-meddelande

**Rubrik:** "Viktigt:"
**Text:** "Dessa beräkningar är förenklingar och baseras på antaganden om avkastning och framtida utveckling. Tidigare utveckling på börsen är ingen garanti för framtida resultat. Verkliga värden kan avvika betydligt beroende på marknadsutveckling, skatter, avgifter och förändringar i pensionssystemet."

**Ytterligare text (beroende på inflationsjustering):**

**Om inflationsjustering är på:**
"Beräkningarna använder real avkastning (nominell avkastning minus 2% inflation per år), vilket ger värden i dagens penningvärde. Nominell avkastning skulle ge högre belopp men dessa skulle ha lägre köpkraft på grund av inflation."

**Om inflationsjustering är av:**
"Beräkningarna använder nominell avkastning, vilket innebär att värdena inte är justerade för inflation. För att se värden i dagens penningvärde, aktivera inflationsjustering."

