export function getProgressTheme(progress: number) {
  // 90–100%: Varm ljusgul ton, guld/amber accenter
  if (progress >= 0.9) {
    return {
      // Bakgrund – varm ljusguld som tydligt bryter mot appens bakgrund
      wrapper: 'bg-[#F9E8B8] border border-slate-200/60',
      // Progressbar – använd samma bärnstensfärg som i graferna
      bar: 'bg-gradient-to-r from-amber-500 to-yellow-300',
      // Badges
      badge: 'bg-success/10 text-success border-success/30',
      // CTA-kontrast: på tonad (guld) bakgrund använder vi primär knapp i 90%
      ctaVariant: 'default' as const,
      ctaClass: 'bg-primary/90 text-white hover:bg-primary',
    } as const;
  }
  // 60–90%: Ljust bärnstensskimmer
  if (progress >= 0.6) {
    return {
      // Bakgrund – bärnstensskimmer, något djupare för bättre kontrast
      wrapper: 'bg-[#FFE3BF] border border-slate-200/60',
      // Progressbar – gyllenbärnsten (matchar staplar/legender)
      bar: 'bg-amber-500',
      badge: 'bg-accent/10 text-accent border-accent/30',
      // Tonad bakgrund ⇒ primär CTA i hög kontrast
      ctaVariant: 'default' as const,
      ctaClass: 'bg-primary text-white hover:bg-primary/90',
    } as const;
  }
  // 25–60%: Ljusbeige
  if (progress >= 0.25) {
    return {
      // Bakgrund – ljusbeige, förstärkt så den inte flyter ihop med sidan
      wrapper: 'bg-[#EFE2CF] border border-slate-200/60',
      // Progressbar – skogsgrön (samma som i diagram)
      bar: 'bg-[#0E5E4B]',
      // Badge – vit bakgrund, mörk text för tydlig kontrast
      badge: 'bg-white text-black border-secondary/30',
      // Ljus bakgrund ⇒ primär CTA
      ctaVariant: 'default' as const,
      ctaClass: 'bg-primary text-white hover:bg-primary/90',
    } as const;
  }
  // 0–25%: Ljusgrå-blå
  return {
    // Bakgrund – sval gråblå med något mer färg och tydlig kant
    wrapper: 'bg-[#DFE7EC] border border-slate-200/60',
    // Progressbar – dämpad blågrön (startläge)
    bar: 'bg-[var(--level-1)]',
    // Gör badgen tydlig på ljus bakgrund – önskad svart text
    badge: 'bg-white text-black border-primary/30',
    // Något svalare bakgrund ⇒ ljus CTA om bakgrund blir mörkare, annars primär
    ctaVariant: 'default' as const,
    ctaClass: 'bg-primary text-white hover:bg-primary/90',
  } as const;
}


