export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/50 py-4 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Desktop-version */}
        <p className="hidden sm:block text-xs text-primary/60 leading-relaxed">
          Förmögenhetskollens beräkningar är baserade på generella antaganden och tekniska modeller. 
          De utgör inte ekonomisk rådgivning, investeringsråd, pensionsrådgivning eller en prognos om framtida avkastning. 
          Resultat, tidsangivelser och nivåer är endast simuleringar och kan skilja sig kraftigt från verkligheten. 
          Förmögenhetskollen står inte under Finansinspektionens tillsyn.
        </p>
        
        {/* Mobil-version */}
        <p className="sm:hidden text-xs text-primary/60 leading-tight mt-2">
          Förmögenhetskollen visar förenklade simuleringar, inte rådgivning eller prognoser. 
          Resultaten är illustrationer och Förmögenhetskollen står inte under FI:s tillsyn.
        </p>
      </div>
    </footer>
  );
}

