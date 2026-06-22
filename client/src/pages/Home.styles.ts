export const s = {
  page: "min-h-screen flex flex-col bg-stone-50 relative",

  filterSection: "text-white py-20 relative z-40",
  filterContainer: "container mx-auto px-4 text-center relative z-50",
  filterMonthLabel:
    "font-serif italic text-yellow-200/40 text-sm mb-2 uppercase tracking-widest",
  filterRow:
    "flex flex-col md:flex-row items-center justify-center gap-12 relative z-50",

  theaterFilterCol: "flex flex-col items-center gap-2",
  theaterFilterLabel:
    "font-serif italic text-yellow-200/60 text-xs uppercase tracking-widest",
  theaterFilterBtn:
    "w-[288px] border-yellow-600/30 bg-primary/40 text-yellow-100 font-serif text-base rounded-none border-b-2 border-x-0 border-t-0 hover:bg-primary/60 transition",
  theaterFilterPopover:
    "w-[288px] bg-stone-50 border-2 border-yellow-600/50 p-3",
  theaterFilterHeader:
    "flex items-center justify-between mb-3 pb-2 border-b border-stone-300",
  theaterFilterHeaderTitle: "text-sm font-serif font-bold text-stone-700",
  theaterFilterClear:
    "text-xs text-primary hover:text-yellow-600 underline transition-colors",
  theaterFilterSpace: "space-y-2",
  theaterLabel:
    "flex items-center gap-3 p-2 rounded hover:bg-yellow-50 cursor-pointer transition-colors group",
  theaterCheckboxBase:
    "w-5 h-5 border-2 rounded flex items-center justify-center transition-all",
  theaterCheckboxChecked: "bg-primary border-primary",
  theaterCheckboxUnchecked: "border-stone-300 group-hover:border-yellow-600",
  theaterCheckboxHidden: "sr-only",
  theaterNameLabel: "text-sm text-stone-700",

  kidsModeCol:
    "flex flex-col items-center gap-2 relative z-[100] pointer-events-auto",
  kidsModeLabel:
    "font-serif italic text-yellow-200/60 text-xs uppercase tracking-widest pointer-events-none",
  kidsModeBtnBase:
    "btn-theater flex items-center gap-3 px-8 py-3 transition-all duration-700 min-w-[288px] cursor-pointer relative z-[100] pointer-events-auto",
  kidsModeBtnActive:
    "bg-yellow-600 !text-primary border-white scale-105 shadow-[0_0_30px_rgba(217,165,33,0.4)]",
  kidsModeBtnInactive: "bg-primary !text-white border-yellow-600/50",

  main: "flex-1 container mx-auto px-4 py-8 relative z-10 space-y-16 mb-32",
  loadingWrapper: "flex justify-center items-center h-64",

  emptyWrapper: "flex justify-center items-center",
  emptyInner: "relative w-full max-w-6xl aspect-[4/3]",
  emptyFrameImg: "absolute inset-0 w-full h-full object-contain rotate-90",
  emptyTextWrapper: "absolute inset-0 flex items-center justify-center p-12",
  emptyText: "text-3xl md:text-4xl font-serif text-stone-700 text-center",

  theaterSection: "flex flex-col lg:flex-row gap-16 items-start",
  theaterLeft: "w-full lg:w-1/3 lg:sticky lg:top-40",
  theaterLeftInner: "flex flex-col items-center gap-4",
  theaterImgWrapper: "w-full max-w-lg",
  theaterTitle:
    "text-3xl font-serif font-bold text-primary text-center hover:text-yellow-600 transition-colors cursor-pointer",
  playsGrid:
    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6",

  premieresSection:
    "bg-stone-100 py-20 border-t-8 border-primary relative overflow-hidden",
  premieresTexture: "absolute inset-0 opacity-50",
  premieresContainer: "container mx-auto px-4 relative z-10",
  premieresTitle:
    "text-5xl md:text-6xl font-serif font-bold text-primary mb-6 text-center tracking-tight text-shadow-sm uppercase",
  premieresRow:
    "flex flex-row gap-12 items-center justify-center px-4",
  premieresNavBtn:
    "w-20 h-20 rounded-full bg-primary hover:bg-yellow-600 text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 shrink-0",
  premiereCard: "w-72 shrink-0 flex flex-col",
  premiereImageWrapper:
    "relative aspect-[3/4] drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] transform hover:scale-110 hover:-rotate-2 transition-all duration-700 cursor-pointer group mt-4",
  premiereImageInner:
    "absolute left-[16%] right-[16%] top-[14%] bottom-[14%] overflow-hidden",
  premiereImage:
    "w-full h-full object-cover sepia-[0.1] group-hover:sepia-0 transition-all duration-500 scale-100 group-hover:scale-105",
  premiereTextArea: "mt-4 text-center",
  premiereTheaterLabel:
    "text-xs font-bold tracking-widest text-primary uppercase mb-2",
  premiereTitle:
    "font-serif text-xl font-bold text-stone-900 leading-tight line-clamp-2 mb-2",
  premiereDate: "text-primary text-base font-semibold",
  frameImg:
    "absolute inset-0 w-full h-full object-contain pointer-events-none z-10",

  errorPage:
    "min-h-screen flex items-center justify-center p-10 bg-stone-50",
  errorCard:
    "max-w-2xl w-full bg-white rounded-lg p-8 border-4 border-red-500",
  errorTitle: "text-3xl font-serif font-bold text-red-800",
  errorBox: "bg-red-50 p-4 rounded border border-red-200",
  errorPre: "text-stone-500 mt-2 border-t border-stone-200",

  monthSelectWrapper: "flex flex-col items-center mb-10",
  monthSelectTrigger:
    "mx-auto bg-transparent border-none text-4xl md:text-6xl font-serif font-bold text-yellow-100 uppercase focus:ring-0 focus:ring-offset-0 h-auto px-6 transition-all duration-500 text-shadow-gold min-w-[450px] justify-center !overflow-visible",
  monthSelectSpan: "inline-block overflow-visible pr-[0.2em] leading-[1.8]",
  monthSelectContent: "bg-stone-100 border-yellow-600",
  monthSelectItem: "font-serif text-xl",
  filterDropdownArrow: "ml-2",

  kidsEmojiSpan: "text-2xl pointer-events-none",
  kidsLabelSpan: "font-bold tracking-tighter text-lg pointer-events-none",

  theaterImg: "w-full h-auto",
  theaterPlaysCol: "flex-1 w-full",
} as const;

export const filterSectionStyle = {
  background: "#5d0016",
  backgroundImage: "repeating-linear-gradient(90deg, #5d0016 0%, #880020 5%, #5d0016 10%)",
  boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
} as const;

export const premieresTextureStyle = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
} as const;
