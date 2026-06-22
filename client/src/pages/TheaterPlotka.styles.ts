export const s = {
  page: "min-h-screen flex flex-col bg-stone-50",
  main: "flex-1 container mx-auto px-4 py-8",
  title:
    "text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight text-center mb-8",
  loadingWrapper: "flex justify-center py-24",
  grid: "grid grid-cols-1 lg:grid-cols-3 gap-8",

  calendarCol: "lg:col-span-2",
  calendarCard:
    "bg-white rounded-lg shadow-2xl overflow-hidden border-t-8 border-primary",
  calendarNav: "p-6 bg-stone-50 border-b border-stone-200",
  calendarNavInner: "flex items-center justify-between",
  calendarNavBtn: "hover:bg-yellow-100",
  calendarNavTitle:
    "text-2xl font-serif font-bold text-stone-800 capitalize tracking-wide",
  calendarBody: "p-6",
  weekdaysRow: "grid grid-cols-7 gap-2 mb-2",
  weekdayLabel: "text-center font-bold text-stone-600 text-sm",
  daysGrid: "grid grid-cols-7 gap-2",
  dayBtnBase:
    "aspect-square p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center relative",
  dayBtnOtherMonth: "text-stone-300",
  dayBtnCurrentMonth: "text-stone-900",
  dayBtnSelected: "bg-primary text-white ring-primary shadow-lg",
  dayBtnHasEvents: "bg-yellow-50 hover:bg-yellow-100",
  dayBtnEmpty: "hover:bg-stone-50",
  dayBtnToday: "ring-2 ring-yellow-400",
  dayNumber: "text-sm font-bold",
  dayCountBase: "text-xs font-bold mt-1",
  dayCountSelected: "text-yellow-200",
  dayCountDefault: "text-primary",

  sidebarCol: "lg:col-span-1",
  sidebarCard:
    "bg-white rounded-lg shadow-2xl overflow-hidden border-t-8 border-yellow-600 sticky top-4",
  sidebarHeader: "p-6 bg-stone-50 border-b border-stone-200",
  sidebarTitle: "text-xl font-serif font-bold text-primary",
  sidebarCount: "text-sm text-stone-500 mt-1",
  sidebarBody: "p-4 max-h-[600px] overflow-y-auto space-y-3",
  sidebarEmpty: "text-center py-8 text-stone-400 italic",

  eventCard:
    "bg-stone-50 rounded-lg p-3 hover:bg-yellow-50 transition-colors cursor-pointer border border-stone-200 hover:border-yellow-400",
  eventCardInner: "flex gap-3",
  eventPoster: "w-16 h-20 object-cover rounded",
  eventBody: "flex-1 min-w-0",
  eventTitle:
    "font-serif font-bold text-sm text-stone-900 leading-tight mb-1 line-clamp-2",
  eventTheater: "text-xs text-stone-500 mb-2",
  eventTimes: "flex flex-wrap gap-1",
  eventTimeBadge:
    "text-xs px-2 py-1 rounded font-bold bg-primary text-white",
} as const;
