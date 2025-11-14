# Granskning: Dashboard - Huvudsektioner och KPI-kort

Detta dokument innehåller all text från dashboardens huvudsektioner och de fyra huvud-KPI-korten (Nettoförmögenhet, Nuvarande nivå, Månatlig ökning, Hastighet).

---

## Dashboard Header

**Plats:** Överst på dashboard-sidan

### Huvudrubrik
- **Text:** "Förmögenhetskollen"
- **Undertext (dynamisk):**
  - Om inget hushåll: "Du har inte skapat ett hushåll än"
  - Om hushåll finns: "[Hushållets namn]" eller "Mitt hushåll"

### Knappar i header
- **Om inget hushåll:**
  - "Kom igång - Fyll i dina uppgifter →"
- **Om hushåll finns:**
  - "Redigera hushåll"
- **Alltid (dold på mobil):**
  - "Om"

---

## Välkomstbanner (Nivå 0)

**Plats:** Visas endast när inget hushåll är skapat (nivå 0)

### Rubrik
"Välkommen till Förmögenhetskollen!"

### Beskrivning
"För att komma igång och se din ekonomiska position behöver du först fylla i dina uppgifter. Detta inkluderar tillgångar, skulder och personer med inkomster i hushållet."

### Ytterligare information
"När du har fyllt i dina uppgifter kommer du att se din nettoförmögenhet, nuvarande rikedomsnivå och framsteg mot nästa nivå."

---

## KPI-kort 1: Nettoförmögenhet

**Plats:** Första kortet i KPI-gridet

### Rubrik
"Nettoförmögenhet"

### Huvudvärde
- **Om nivå 0:** "—"
- **Om nivå > 0:** Formaterat belopp (t.ex. "2 450 000 kr")

### Låst-text (nivå 0)
"Låses upp på Nivå 1"

### Förklarande text under värdet
**Rubrik:** "Består av"
- "✓ Alla tillgångar (sparkonto, fonder, aktier)"
- "✓ Pensionstillgångar (allmän pension, tjänstepension, IPS m.m.)"
- "✓ Bostad, bil och andra större tillgångar"
- "- Alla skulder (lån, krediter)"

**Obs:** Kortet är klickbart (om inte nivå 0) och öppnar en dialog med förmögenhetsfördelning.

---

## KPI-kort 2: Nuvarande nivå

**Plats:** Andra kortet i KPI-gridet

### Rubrik
"Nuvarande nivå"

### Huvudvärde
- **Om nivå 0:** "Nivå 0"
- **Om nivå > 0:** "Nivå [nummer]" (t.ex. "Nivå 3")

### Undertext
- **Om nivå 0:** "Inget hushåll skapat"
- **Om nivå > 0:** Nivånamnet (t.ex. "Restaurangfrihet")

### Nivåspecifik information (visas endast om nivå > 0)

#### Nivå 1 – Lön till lön
- **Rubrik:** "Nivå 1 – Lön till lön"
- **Punkter:**
  - "✓ Trygghet saknas – buffert är första steget."
  - "✓ Pengarna tar slut före månaden gör det."
  - "✓ Otur förstärks – minsta motgång kan bli kris."
- **Fokus:** "**Fokus:** skapa trygghet och buffert."

#### Nivå 2 – Matvarufrihet (vardagstrygghet)
- **Rubrik:** "Nivå 2 – Matvarufrihet (vardagstrygghet)"
- **Punkter:**
  - "✓ Ekonomin står stadigt – nu kan du börja växa."
  - "✓ Du klarar oväntade utgifter utan stress."
  - "✓ Kan handla fritt i matbutiken utan oro."
- **Fokus:** "**Fokus:** jobba smartare och börja spara långsiktigt."

#### Nivå 3 – Restaurangfrihet
- **Rubrik:** "Nivå 3 – Restaurangfrihet"
- **Punkter:**
  - "✓ Livet flyter – pengarna börjar jobba för dig."
  - "✓ Ekonomin fungerar och du har valfrihet i vardagen."
  - "✓ Du kan unna dig utan oro."
- **Fokus:** "**Fokus:** låta kapitalet växa och hitta balans i livet."

#### Nivå 4 – Resefrihet
- **Rubrik:** "Nivå 4 – Resefrihet"
- **Punkter:**
  - "✓ Fri att resa, fri att välja – men vad vill du egentligen?"
  - "✓ Pengar styr inte längre vardagen."
  - "✓ Du kan resa när och vart du vill."
- **Fokus:** "**Fokus:** meningsfullhet, inte bara tillväxt."

#### Nivå 5 – Geografisk frihet
- **Rubrik:** "Nivå 5 – Geografisk frihet"
- **Punkter:**
  - "✓ Du kan bo var du vill – nu handlar det om mening."
  - "✓ Full kontroll över plats och tid."
  - "✓ Pengar löser sällan problem – de skapar ibland nya."
- **Fokus:** "**Fokus:** bevara, diversifiera och hitta balans."

#### Nivå 6 – Påverkansfrihet
- **Rubrik:** "Nivå 6 – Påverkansfrihet"
- **Punkter:**
  - "✓ Du har allt – nu handlar det om avtrycket du lämnar."
  - "✓ Du kan påverka världen och forma framtiden."
  - "✓ Pengar spelar liten roll – inflytande större."
- **Fokus:** "**Fokus:** ge vidare och skapa bestående värde."

**Obs:** Kortet är klickbart (om inte nivå 0) och öppnar en dialog med detaljerad nivåinformation.

---

## KPI-kort 3: Månatlig ökning

**Plats:** Tredje kortet i KPI-gridet

### Rubrik
"Månatlig ökning"

### Huvudvärde
- **Om nivå 0:** "—"
- **Om nivå > 0:** Formaterat värde med +/- (t.ex. "+6 200 kr/mån" eller "-500 kr/mån")

### Låst-text (nivå 0)
"Låses upp på Nivå 1"

### Förklarande text under värdet
**Rubrik:** "Består av"
- "✓ Avkastning på tillgångar"
- "✓ Pensionsavsättningar (allmän pension + tjänstepension enligt avtal)"
- "✓ Löneväxling (om tillämpligt)"
- "✓ Övrigt månadssparande"
- "✓ Amorteringar på skulder"
- "• Uppskattad månatlig ökning av nettoförmögenheten baserat på avkastning, amorteringar, pensionsavsättningar (beräknade månadsvis utifrån inlagda inkomster) och annat sparande."

**Obs:** Kortet är klickbart (om inte nivå 0) och öppnar en dialog med detaljerad uppdelning.

---

## KPI-kort 4: Hastighet

**Plats:** Fjärde kortet i KPI-gridet

### Rubrik
"Hastighet"

### Huvudvärde (nivå 0)
"—"

### Låst-text (nivå 0)
"Låses upp på Nivå 1"

### Huvudvärde (nivå 1-5)
Hastighetsindex-text (t.ex. "Normal", "Snabb", "Mycket snabb", etc.)

### Förklarande text (nivå 1-5)
Förklaring baserat på hastighetsindex (t.ex. "Du rör dig i genomsnittlig takt mot nästa nivå.")

**Disclaimer (visas endast om nivå 1-5):**
"(Uppskattning baserad på nuvarande tillgångar och antaganden om tillväxt — faktiska värden kan variera.)"

### Ytterligare information (nivå 1-5)
- **Om yearsToNextLevel finns:** "[Formaterat antal år] till nästa nivå"
- **Om nextLevelTarget finns:** "Mål: [Formaterat belopp]"

### Specialfall: Nivå 6
- **Huvudvärde:** "Toppen nådd"
- **Beskrivning:** "Du har nått den högsta nivån. Hastighet är inte längre relevant – nu handlar det om påverkan och avtryck du lämnar."

**Obs:** Kortet är klickbart (om inte nivå 0) och öppnar en dialog med detaljerad hastighetsinformation.

---

## Scroll Up-knapp

**Plats:** Fast position överst på sidan (visas när man är nära toppen av dashboarden)

### Text
"Om Förmögenhetskollen"

**Obs:** Knappen scrollar upp till välkomstsektionen.

---

## Externa verktyg-sektion

**Plats:** Längst ner på dashboarden, efter "Andra nivåer preview"

### Rubrik
"Ytterligare kalkylatorer"

### Beskrivning
"Ytterligare verktyg som kan vara användbara, oberoende av Förmögenhetskollen"

### Verktyg-knappar

#### FIRE-kalkylator
- **Rubrik:** "FIRE-kalkylator"
- **Undertext:** "Ekonomisk frihet"

#### Sparkalkylator
- **Rubrik:** "Sparkalkylator"
- **Undertext:** "Ränta på ränta"

#### Lönekalkylator
- **Rubrik:** "Lönekalkylator"
- **Undertext:** "Efter skatt"

---

## Om-knapp (mobil)

**Plats:** Längst ner på dashboarden (endast mobil)

### Text
"Om"

