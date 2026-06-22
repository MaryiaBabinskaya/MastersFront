export const s = {
  page: "min-h-screen bg-stone-50 flex flex-col",
  centeredPage:
    "h-screen w-full flex items-center justify-center bg-stone-100",

  hero: "relative h-[52vh] overflow-hidden bg-stone-900 border-b-4 border-yellow-600 z-30",
  heroImage: "w-full h-full object-cover opacity-40 blur-sm scale-105",
  heroGradient:
    "absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/50",
  heroBottom: "absolute inset-0 text-white",
  heroInner:
    "container mx-auto h-full flex flex-col md:flex-row items-end gap-8 px-8 md:px-16 pb-4 md:pb-6",

  posterCol: "hidden md:block w-64 shrink-0 self-center relative z-50",
  posterFrame:
    "relative aspect-[3/4] drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]",
  posterImageInner:
    "absolute left-[16%] right-[16%] top-[14%] bottom-[14%] overflow-hidden",
  posterImage: "w-full h-full object-cover sepia-[0.1]",
  favBtn:
    "absolute top-3 right-3 p-2 bg-stone-900/60 backdrop-blur-sm rounded-full border border-yellow-500/50 hover:bg-stone-900/80 transition-colors z-20",

  heroMeta: "flex-1 mb-4",
  heroTheaterName:
    "text-yellow-500 font-bold uppercase tracking-widest mb-2",
  heroTitle:
    "text-4xl md:text-6xl font-serif font-bold mb-4 text-shadow-gold",
  heroDetails: "flex flex-wrap gap-6 text-stone-300 font-sans",
  heroScene: "text-yellow-100",
  heroDuration: "flex items-center gap-2",

  content:
    "container mx-auto px-4 py-16 md:pl-[18rem] relative z-10",
  contentGrid: "grid grid-cols-1 lg:grid-cols-3 gap-12",
  mainCol: "lg:col-span-2 space-y-8",

  descCard:
    "bg-white p-8 rounded-sm border-l-4 border-primary shadow-md",
  descTitle:
    "font-serif text-3xl text-primary mb-6 flex items-center gap-3",
  descText:
    "text-lg leading-relaxed text-stone-700 whitespace-pre-line",

  infoCard:
    "bg-gradient-to-br from-yellow-50 to-stone-50 p-6 rounded-sm border-2 border-yellow-200 shadow-md",
  infoTitle:
    "font-serif font-bold text-xl text-primary mb-3 flex items-center gap-2",
  infoText: "leading-relaxed",
  infoAdditional:
    "leading-relaxed whitespace-pre-line mt-4 pt-3 border-t border-yellow-300",

  creditsCard:
    "bg-white p-8 rounded-sm border border-stone-200 shadow-md",
  creditsTitle:
    "font-serif font-bold text-2xl text-primary mb-6 border-b-2 border-stone-200 pb-3",
  creditRow:
    "flex justify-between gap-6 text-stone-700 py-2 border-b border-stone-100 last:border-0",
  creditRole: "font-semibold text-primary",
  creditName: "text-right font-medium",

  sidebar: "space-y-6",
  sidebarCard:
    "bg-gradient-to-br from-white to-stone-50 border-2 border-primary/20 p-6 rounded-sm sticky top-24 shadow-xl",
  sidebarTitle:
    "font-serif text-2xl font-bold text-primary mb-6 flex items-center gap-2 border-b-2 border-yellow-600 pb-3",
  showtimeEmpty: "text-stone-500 italic text-center py-4",
  showtimeList: "space-y-3",
  showtimeItem:
    "flex items-center justify-between bg-white p-4 border-2 border-stone-200 rounded hover:border-yellow-500 hover:shadow-md transition-all",
  showtimeDateLabel: "font-bold text-stone-900 text-base",
  showtimeTimeLabel: "text-sm text-stone-600 font-semibold",
  buyTicketBtn: "mt-1 border-yellow-600 text-yellow-700 hover:bg-yellow-50",

  theaterBlock: "mt-6 pt-6 border-t-2 border-stone-300",
  theaterInfo:
    "flex items-start gap-3 bg-stone-50 p-4 rounded border border-stone-200",
  theaterName: "font-bold block text-stone-900 text-base mb-1",
  theaterLink:
    "text-yellow-600 hover:text-primary hover:underline text-sm font-semibold",
  mapWrapper:
    "w-full h-64 rounded border-2 border-stone-200 overflow-hidden",

  errorContent: "text-center",
  errorTitle: "text-2xl font-bold text-stone-800 mb-2",
  errorSubtext: "text-stone-600",
  frameImg:
    "absolute inset-0 w-full h-full object-contain pointer-events-none z-10",

  sceneValue: "font-bold",

  infoContent: "text-stone-700",
  infoDateGroup: "space-y-2",
  infoLabel: "font-semibold",

  creditsBody: "space-y-3",
  actorName: "font-medium",

  showtimeDateCol: "flex flex-col",

  ticketDialog:
    "sm:max-w-[425px] font-serif bg-stone-50 border-2 border-yellow-600",
  ticketDialogBody: "grid gap-4 py-4",
  ticketFormGroup: "grid gap-2",
  ticketCountInput: "col-span-3 border-stone-300 focus:ring-yellow-500",
  noTicketsWrapper: "py-4 text-center",
  noTicketsText: "text-stone-600 italic",
  confirmTicketBtn: "btn-theater",
  theaterDetails: "space-y-4",
} as const;
