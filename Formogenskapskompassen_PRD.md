# 🧭 Förmögenhetskollen – Produktkravdokument (PRD)

## Tagline
**Navigera hushållets ekonomi genom livets olika rikedomsnivåer.**

---

## 🌍 Produktvision
**Förmögenhetskollen** är ett digitalt verktyg som hjälper hushåll att förstå sin totala ekonomiska ställning, följa sin utveckling och utforska livets rikedomsnivåer – utan att värdera någon som bättre eller sämre.  
Den visar hur varje persons inkomster och sparande bidrar till hushållets gemensamma förmögenhet, och hur hushållet rör sig i *Rikedomstrappan* – en karta över ekonomiska nivåer, livsstilar och insikter.

---

## 💡 Grundidé
Varje hushåll består av en eller flera vuxna personer.

För var och en anger man:
- inkomst per månad  
- tjänstepensionsavtal (t.ex. ITP1, SAF-LO, Eget)  
- avsättningar till pension och sparande  
- ålder (för framtida visualiseringar och pensionsprognos)

Hushållet gemensamt anger:
- alla tillgångar (ägodelar, sparande, pensioner, investeringar, kontanter, försäkringar)
- alla skulder (bostadslån, billån, studielån etc.)

Förmögenhetskollen räknar därefter ut:
- nettoförmögenhet för hushållet  
- ökning per månad  
- nuvarande nivå på rikedomskartan  
- hur snabbt hushållet rör sig mot nästa nivå  
- och visualiserar allt detta i en dynamisk dashboard.

---

## 👨‍👩‍👧‍👦 Målgrupp
- Svenskar 25–65 år, ensamhushåll eller familjer  
- Intresserade av sin ekonomi men inte experter  
- Vill få en helhetsbild, utan att behöva bankkopplingar  
- Vill förstå hushållets riktning snarare än bara saldon

---

## 🎯 Syfte
Ge hushåll ett sätt att:
1. Se sin faktiska nettoförmögenhet  
2. Förstå hur varje persons bidrag påverkar hushållet  
3. Se sin plats i rikedomskartan (utan värdering)  
4. Inspireras till ekonomisk balans, trygghet och mål – inte bara mer pengar

---

## 🧱 Kärnfunktioner (MVP)

### 1️⃣ Hushållsstruktur
- Skapa hushåll (standard = 1 vuxen, kan lägga till fler)
- För varje person anges:
  - namn eller alias  
  - ålder  
  - inkomst per månad  
  - typ av pensionsavtal (drop-down med: ITP1, SAF-LO, Statligt, Kommunalt, Eget)  
  - övriga avsättningar/sparande per månad  
  - ev. tillgång till lönväxling
- Systemet beräknar automatiskt:
  - allmän pensionsavsättning (baserat på inkomst + IBB)
  - tjänstepensionsavsättning (beroende på avtalstyp)
  - total månatlig avsättning

### 2️⃣ Tillgångar och skulder
- Gemensam vy (som i Excel-prototypen)
  - tillgångar: ägodelar, pensionssparande, investeringar, kontanter, livförsäkring  
  - skulder: bostadslån, billån, studielån, övriga lån
- Varje post har:
  - namn (t.ex. ”Hus – Östra 84”)  
  - värde  
  - förväntad avkastning (% per år)  
  - standardförslag (bil = –10 %, bostad = +2 %, aktier = +7 %)
- Sammanställning: Summa tillgångar, Summa skulder, Nettoförmögenhet

### 3️⃣ Förmögenhetsdashboard – Hushållets kompass
Visuell, interaktiv startsida som visar:

**A. Huvuddata**
- Total nettoförmögenhet (stort tal i centrum)
- Förmögenhetsökning per månad (highlightad i guld)
- Nuvarande nivå (ex: “Nivå 3 – Restaurangfrihet”)
- Förmögenhetshastighet: “Utmärkt (≤ 5 år till nästa nivå)” → färgad beroende på prestanda

**B. Visualiseringar**
- Förmögenhetsring (progress)
- Förmögenhetsriktning (trendpil)
- Tillgångsfördelning / skuldfördelning
- Månadsökning uppdelad på: avkastning, amortering, pensionssparande, övrigt sparande

**C. Utmärkelser & badges**
- Små ikoner (🏆 🚀 💎 💬)
- Exempel: Första miljonen, Snabbare än snittet, Nivå 4 uppnådd, Balansmästare

**D. Dynamisk design**
Dashboardens tema ändras med nivån:

| Nivå | Tema | Känsla |
|------|------|---------|
| 1 | Röd/varmgrå | Kamp, trygghet |
| 2 | Ljusblå | Stabilitet, balans |
| 3 | Mörkblå/guld | Bekvämlighet, kontroll |
| 4 | Turkos | Frihet, erfarenhet |
| 5 | Lila/silver | Reflektion, mening |
| 6 | Svart/vit | Enkelhet, påverkan |

### 4️⃣ Rikedomskartan (Trappan)
- Karta/värld med 6 områden (inte linjär trappa)
  1. Lön-till-lön (överlevnadszonen)
  2. Vardagstrygghet (stabilitetens mark)
  3. Restaurangfrihet (komfortens slätt)
  4. Resefrihet (utforskarnas horisont)
  5. Geografisk frihet (gränslöshetens öar)
  6. Påverkansfrihet (ledarskapets topp)
- Varje område har:
  - beskrivning av livsstil, fördelar, utmaningar
  - konsumtionstips för just den nivån
- Hushållets position markeras med ikon
- Ingen nivå visas som bättre – olika livsval

### 5️⃣ Gamification och framsteg
- Badges baserade på:
  - total nettoförmögenhet
  - ökningstakt
  - stabilitet (hållit nivå 12 månader)
  - pensionssparande, skuldförbättring
- Visas i dashboard + på separat “Milstolpar”-sida
- AI-genererade medaljbilder

### 6️⃣ Konto och anonymitet
- Data sparas lokalt tills “Spara hushåll” klickas
- Då skapas:
  - anonymt konto via Supabase Auth
  - genererat användarnamn (ex. TryggaRäv-224)
  - lösenord (e-post valfritt)
- Hushållsdata sparas och laddas vid inloggning

### 7️⃣ Reklam & tips
- Små inspirationskort baserat på nivå
  - Ex: “Nivå 3-hushåll börjar köpa bekvämlighet...”
- Diskreta AdSense-ytor
- Riktad reklam baserat på nivå (senare)

---

## 🔮 Framtida funktioner
- Barn som hushållsmedlemmar (enkla fält)
- Historik över nettoförmögenhet
- AI-baserad “Förmögenhetscoach”
- Delad vy mellan makar
- Nivåbaserade nyhetsbrev
- Notiser (ex: “+5 % sedan i våras!”)
- FIRE-indikator (4%-regeln baserat på hushållets utgifter)

---

## ⚙️ Teknisk specifikation (Approach A)

| Funktion | Teknologi |
|-----------|------------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + lucide-react |
| Diagram | Recharts |
| Formhantering | React Hook Form + zod |
| State | React Query + Zustand |
| Backend/Auth | Supabase (Postgres, Auth, Storage) |
| Hosting | Vercel |
| Ads | Google AdSense (senare: EthicalAds) |

---

## 🗄️ Datamodell (Supabase / Postgres)
### users
- id (uuid, pk)
- handle (text)
- created_at

### households
- id (uuid, pk)
- owner_id (uuid -> users.id)
- name (text)
- created_at

### persons
- id (uuid, pk)
- household_id (uuid -> households.id)
- name (text)
- age (int)
- monthly_income (numeric)
- pension_type (text)
- custom_tp_rate (numeric)
- other_savings_monthly (numeric)

### assets
- id, household_id
- category (text)
- label (text)
- value (numeric)
- expected_apy (numeric)

### liabilities
- id, household_id
- label (text)
- principal (numeric)
- amortization_rate_apy (numeric)

### wealth_levels
- level (int)
- name (text)
- min_value (numeric)
- max_value (numeric)
- description (text)
- pros (text)
- cons (text)

### badges
- id
- name
- description
- icon_url
- criteria_code

---

## 🧭 Beräkningar
- **Nettoförmögenhet:** Σ tillgångar – Σ skulder  
- **Ökning per månad:** Σ avkastning + Σ amortering + Σ pensionsavsättningar + Σ övriga sparanden  
- **Nivå:** lookup i wealth_levels  
- **Progress:** (förmögenhet – min) / (max – min)  
- **Hastighet:** ökning_per_månad / ((max – min)/120)  
- **År till nästa nivå:** (max – förmögenhet) / (ökning_per_månad * 12)

---

## 🎨 Designprinciper
- Metafor: kompass + karta, inte trappa  
- Ton: inspirerande, trygg, reflekterande  
- Layout: luftig dashboard, cirklar, färgförändring med nivå  
- Ikonografi: mjuka former, lugna rörelser  
- Typografi: DM Sans eller Inter

---

## 📈 Mål för MVP

| Typ | Mål |
|------|------|
| Upplevelse | Hushåll ska inom 5 min kunna se nettoförmögenhet, nivå och hastighet |
| Kvalitet | 80 % av testanvändare upplever bättre koll på ekonomin |
| Kvantitet | 500 hushåll testkör första månaden |
| Retention | 30 % återkommer inom 2 veckor |

---

## ❌ Icke-mål (ej MVP)
- Ingen automatisk bankkoppling  
- Ingen investeringsrådgivning  
- Ingen integration med Skatteverket/Pensionsmyndigheten  
- Ingen ranking mellan hushåll

---

## 💬 Kärnberättelse
> "Förmögenhetskollen visar vägen, men det är du och ditt hushåll som bestämmer riktningen.  
Här finns inga rätt eller fel nivåer – bara olika platser på kartan, var och en med sina möjligheter och utmaningar.”
