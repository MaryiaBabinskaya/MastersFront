export const s = {
  card: "group flex flex-col h-full bg-stone-50 rounded-sm overflow-hidden hover:-translate-y-1 transition-transform",
  posterWrapper:
    "relative aspect-[3/4] mx-2 mt-6 mb-4 group drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] scale-110",
  posterImageInner:
    "absolute left-[16%] right-[16%] top-[14%] bottom-[14%] overflow-hidden bg-stone-200",
  posterImage:
    "w-full h-full object-cover sepia-[0.1] group-hover:sepia-0 transition-all duration-500",
  favBtn:
    "absolute top-3 right-3 p-2 bg-stone-900/60 backdrop-blur-sm rounded-full border border-yellow-500/50 z-20 hover:bg-stone-800",
  favIconActive: "fill-yellow-500 text-yellow-500",
  favIconInactive: "text-stone-300 hover:text-white",
  infoWrapper:
    "flex-1 px-4 pb-4 flex flex-col text-center cursor-pointer",
  theaterName:
    "text-xs font-bold tracking-widest text-primary uppercase mb-2",
  title:
    "font-serif text-lg font-bold text-stone-900 leading-tight group-hover:text-primary transition-colors break-words",
  frameImg:
    "absolute inset-0 w-full h-full object-contain pointer-events-none z-10",
} as const;
