# Förmögenhetskollen (MVP) – Cursor Prompt

Bygg en **Next.js 15 + TypeScript** app med **Tailwind**, **shadcn/ui**, **React Hook Form + zod**, **React Query**, **Recharts** och **Supabase**.  
**Namn:** *Förmögenhetskollen*.

---

## 🎯 Mål

MVP där ett **hushåll** kan:

- göra **onboarding** (stegvis indata),  
- få **dashboard** med nettoförmögenhet, ökning/mån, nivå/progress,  
- **spara hushållet → skapa konto direkt** (genererat anonymt användarnamn + eget valt lösenord),  
- **logga in senare** med användarnamn + lösenord för att se/ändra/följa hushållet.

**Fokus:** pedagogiskt, lätt, bra defaults, allt uppdateras i realtid.

---

## 🧭 Sidor & flöde

- `/` → om ej inloggad och ingen lokal draft: redirect **`/onboarding`**; annars **`/dashboard`**.

- **`/onboarding`** (4 steg):

  1) **Personer** (minst 1):  
     Fält: `name`, `age`, `monthly_income`, `pension_type` (`ITP1 | SAF-LO | Kommunal | Statlig | Eget`), `custom_tp_rate` (visas bara om `Eget`), `other_savings_monthly`.  
     *Kort hjälptext under varje fält.*

  2) **Tillgångar**: tabell `category | label | value | expected_apy`.  
     **Förifyllda APY (ändringsbara):**
     - **Ägodelar: Bil** → **-10%**
     - **Ägodelar: Hus** → **+2%**
     - **Investeringar (ISK/KF/aktier/fonder)** → **+7%**
     - **Kontanter** → **0%**
     - **Pensionssparande (fribrev m.m.)** → **+3%**
     
     *Summering visas under tabellen.*

  3) **Skulder**: tabell `label | principal | amortization_rate_apy` (default **2%**), med summering.

  4) **Sammanfattning**: visa beräknad **Nettoförmögenhet**, **Ökning/månad**, **Nivå**, **Progress**.  
     **Knappar:**
     - `Gå till dashboard` *(sparar som lokal draft i localStorage)*
     - `Spara hushåll (skapa konto)` → öppna modal:
       - visa **genererat anonymt användarnamn** (t.ex. `TryggaRav-842`) – går att ändra om ledigt.
       - fält **password**
       - knapp **”Skapa konto & spara”**
       
       *När klart:* skapa Supabase-user + household + relations och redirect till **`/dashboard`**.

- **`/auth/login`** — enkel inloggning: `username` + `password`.  
  Vid lyckad inloggning: ladda hushållet och redirect **`/dashboard`**.

- **`/dashboard`** — visar hushållets KPI:er och länkar till `/household` för redigering:
  - **Nettoförmögenhet** (stort tal)
  - **Ökning per månad** (gul highlight)
  - **Hastighetstext** (Utmärkt/Bra/OK/Långsam) enligt `speedIndex`
  - **Progress-ring** (Recharts) ”Nivå N • mot N+1 (≈ X år)”
  - **Fördelningsdiagram** (tillgångar/skulder)
  - **Komponentsummering per månad:** avkastning, amortering, pensions-/övriga avsättningar
  - **CTA:** `Redigera hushåll` (→ `/household`)

- **`/household`** — flikar **Personer / Tillgångar / Skulder** med samma formulär som i onboarding, live-beräkningar och **Spara ändringar**.

---

## 🗄️ Datamodell (Supabase, med RLS att `owner_id = auth.uid()`)

```sql
-- users
id uuid primary key,
handle text unique,           -- anonymt användarnamn
created_at timestamptz default now()

-- households
id uuid primary key,
owner_id uuid references users(id),
name text default 'Mitt hushåll',
created_at timestamptz default now()

-- persons
id uuid primary key,
household_id uuid references households(id),
name text,
age int,
monthly_income numeric,
pension_type text,            -- 'ITP1'|'SAF-LO'|'Kommunal'|'Statlig'|'Eget'
custom_tp_rate numeric,       -- null om ej 'Eget' (ex 0.11 = 11%)
other_savings_monthly numeric default 0

-- assets
id uuid primary key,
household_id uuid references households(id),
category text,                -- 'Ägodelar: Bil' | 'Ägodelar: Hus' | 'Investeringar' | 'Kontanter' | 'Pensionssparande'
label text,
value numeric,
expected_apy numeric          -- 0.07 = 7%/år

-- liabilities
id uuid primary key,
household_id uuid references households(id),
label text,
principal numeric,
amortization_rate_apy numeric -- 0.02 = 2%/år
```
**Auth-flöde:**
- Vid ”Spara hushåll (skapa konto)”: generera **handle** (adj+substantiv+num), låt användaren justera om ledigt.  
  Skapa Supabase-user (email inte nödvändig i MVP), spara household + data med `owner_id = user.id`.
- **Login** använder **handle + password**.  
  *(Implementera med Supabase email/password under huven: skapa en syntetisk email `handle@local.user` så Supabase Auth kan användas utan riktig e-post. Visa aldrig e-post i UI.)*

---

## 🧮 Beräkningar (lägg i `lib/wealth/calc.ts`)

**Konstanter i `.env` (ingen UI behövs):**
```bash
NEXT_PUBLIC_IBB_ANNUAL=966000
NEXT_PUBLIC_PUBLIC_PENSION_RATE=0.185
NEXT_PUBLIC_ITP1_LOWER_RATE=0.045
NEXT_PUBLIC_ITP1_HIGHER_RATE=0.30
NEXT_PUBLIC_ITP1_CAP_MULTIPLIER=7.5
```
Skapa en `getConfig()` som läser dessa med fallback till samma default.

### 1) Nettoförmögenhet
```
netWorth = Σ assets.value – Σ liabilities.principal
```

### 2) Avkastning per månad (geometrisk)
```
monthlyReturn(asset) = value * ( (1 + expected_apy)^(1/12) - 1 )
assetsMonthlyReturn = Σ monthlyReturn(a)
```

### 3) Amortering per månad
```
monthlyAmort(liab) = principal * amortization_rate_apy / 12
amortizationMonthly = Σ monthlyAmort(l)
```

### 4) Avsättningar per månad (per person)

**Allmän pension:**
```
capAnnual = 7.5 * IBB_ANNUAL
grundande = MIN(monthly_income * 12, capAnnual)
publicPensionMonthly = (grundande * PUBLIC_PENSION_RATE) / 12
```

**Tjänstepension:**

**ITP1:**
```
capMonthly = (ITP1_CAP_MULTIPLIER * IBB_ANNUAL) / 12
if income <= capMonthly:
  tp = income * ITP1_LOWER_RATE
else:
  tp = capMonthly * ITP1_LOWER_RATE + (income - capMonthly) * ITP1_HIGHER_RATE
```

**SAF-LO | Kommunal | Statlig:**  
```
tp = income * 0.045   -- enkelt MVP-antagande
```

**Eget:**  
```
tp = income * custom_tp_rate
```

**Övrigt spar:** `other_savings_monthly`

```
personsMonthlyAllocations = Σ (publicPensionMonthly + tp + other_savings_monthly)
```

### 5) Ökning per månad (KPI)
```
increasePerMonth = assetsMonthlyReturn + amortizationMonthly + personsMonthlyAllocations
```

### 6) Nivå / progress / hastighet (Rikedomstrappan)
```ts
const LEVELS = [
  { level:1, start:0, next:100_000 },
  { level:2, start:100_000, next:1_000_000 },
  { level:3, start:1_000_000, next:10_000_000 },
  { level:4, start:10_000_000, next:100_000_000 },
  { level:5, start:100_000_000, next:1_000_000_000 },
  { level:6, start:1_000_000_000, next:null },
];
```
- hitta aktuell nivå via `start <= netWorth < next` (eller **6** om `next=null`).  
- `progress = clamp((netWorth - start)/(next-start), 0..1)` (level 6 → 1)  
- **Bas-hastighet:** `(next-start)/120` (10 år mellan nivåer; level 6 → 0)  
- `speedIndex = increasePerMonth / baseSpeed` *(skydd mot delning med 0)*  
- Klassificera:
  - `≥ 2` → **”Utmärkt (≤5 år)”**
  - `≥ 1` → **”Bra (≤10 år)”**
  - `≥ 0.5` → **”OK (10–20 år)”**
  - `< 0.5` → **”Långsam (>20 år)”**

---

## 🖼️ UI/UX

- **shadcn/ui**: Cards, Tables, Inputs, Select, Dialog, Tabs.  
- Tydliga sektioner: **Personer**, **Tillgångar**, **Skulder**.  
- Hjälptexter under inputs.  
- **Summeringsrad** under varje tabell.  
- **Progress-ring** (Recharts) + liten text `”Nivå N • mot N+1 (≈ X år)”`.  
- Hastighetstext färgas (grön/gul/orange/röd) enligt `speedIndex`.  
- **Responsivt**, funkar i mobil.

---

## 🧪 Teknik & struktur

```
app/
  layout.tsx
  page.tsx
  onboarding/
    page.tsx  (steg-wizard)
  dashboard/page.tsx
  household/page.tsx
  auth/login/page.tsx
components/
  forms/ (PersonForm, AssetsTable, LiabilitiesTable)
  charts/ (ProgressRing, PieOrBars)
  kpi/
lib/
  supabaseClient.ts
  wealth/config.ts
  wealth/calc.ts
  utils/format.ts
state/
  useHouseholdStore.ts  (Zustand draft i localStorage)
```

- **Supabase**: migrations (SQL) för tabeller + RLS (owner-scoped).  
- **Server Actions** för CRUD.  
- **Auth**: skapa user med syntetisk email `handle@local.user` + password (visa aldrig email). Login med handle+password (mappa till email internt).  
- `.env.local` läser Supabase URL/KEY samt IBB/konstanter (se ovan).

---

## ✅ Definition of Done

- Onboarding går att slutföra med defaultvärden.  
- Dashboard visar korrekta beräkningar i realtid.  
- ”Spara hushåll (skapa konto)” skapar anonymt konto, sparar data och visar genererat användarnamn.  
- `/auth/login` fungerar med samma användarnamn+lösenord och laddar hushållet.  
- `/household` låter mig redigera och spara.  
- Allt är tydligt, snabbt och responsivt.

**Generera koden enligt detta.**
