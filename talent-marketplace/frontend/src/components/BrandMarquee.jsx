import React from 'react';

const brands = [
  'SRI LANKA FASHION WEEK',
  'COLOMBO RUNWAY',
  'KANDY EDITORIAL',
  'GALLE COMMERCIAL CAMPAIGNS',
  'NEGOMBO PAGEANT CIRCUIT',
  'CEYLON RUNWAY COLLECTIVE',
  'SRI LANKAN TALENT DIRECTORY',
  'LANKA BRIDAL & COUTURE',
];

export default function BrandMarquee() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-zinc-950/60 py-5 backdrop-blur-md">
      {/* Left/Right Vignette gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

      <div className="flex select-none">
        <div className="animate-marquee flex items-center space-x-12 whitespace-nowrap">
          {brands.concat(brands).map((brand, idx) => (
            <div key={idx} className="flex items-center space-x-12">
              <span className="text-xs md:text-sm font-semibold tracking-[0.28em] text-zinc-400 hover:text-amber-300 transition-colors uppercase cursor-default">
                {brand}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
