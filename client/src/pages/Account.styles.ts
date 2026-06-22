export const s = {
  loadingPage: "h-screen flex items-center justify-center",

  authPage: "min-h-screen flex items-center justify-center bg-stone-50",
  authCardWrapper: "w-full max-w-md",
  authCard: "bg-white p-8 rounded-lg shadow-lg border-t-4 border-primary",
  authCardHeader: "text-center mb-8",
  authAvatarBadge:
    "w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg",
  authTitle: "font-serif text-3xl font-bold text-stone-800 mb-2",
  authSubtitle: "text-stone-600",
  authForm: "space-y-4",
  formLabel: "text-stone-700 font-medium",
  formInput: "mt-1",
  formActions: "space-y-2",
  loginBtn: "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6",
  authHint: "text-center text-sm text-stone-500 mt-4",
  authSwitchLink:
    "text-primary font-semibold hover:underline cursor-pointer",

  page: "min-h-screen flex flex-col bg-stone-50",
  main: "flex-1 container mx-auto px-4 py-12",
  layout: "flex flex-col md:flex-row gap-8 items-start",

  sidebar: "w-full md:w-80 shrink-0 space-y-6",
  card: "bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary",
  cardInner: "flex flex-col items-center text-center",

  avatarWrapper: "relative w-36 h-48 mb-6 group",
  avatarInner:
    "absolute left-[12%] right-[12%] top-[10%] bottom-[10%] overflow-hidden",
  avatarOverlay:
    "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer",

  displayName: "font-serif text-2xl font-bold text-stone-800",
  emailText: "text-stone-500 text-sm mb-6",
  profileActions: "w-full space-y-2",

  settingsBtn:
    "w-full justify-start gap-2 border-yellow-600 text-yellow-700 hover:bg-yellow-50",
  logoutBtn:
    "w-full justify-start gap-2 mt-4 bg-stone-200 text-stone-700 hover:bg-red-100 hover:text-red-700 border-none",

  infoCardTitle:
    "font-serif text-lg font-bold text-stone-800 mb-4 flex items-center gap-2",
  infoList: "space-y-3 text-sm",
  infoItem: "flex items-start gap-2",
  infoItemLabel: "text-stone-500 text-xs",
  infoItemValue: "text-stone-800",

  contentArea: "flex-1 space-y-12",
  sectionTitle:
    "font-serif text-2xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-stone-200 pb-2",

  statsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  statCard: "bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500",
  statCardInner: "flex items-center gap-3 mb-2",
  statNumber: "text-3xl font-bold font-serif text-stone-800",
  statLabel: "text-sm text-stone-500",

  ticketsEmpty:
    "text-stone-500 p-8 bg-white border border-dashed border-stone-300 rounded-lg text-center",
  ticketGrid: "grid gap-4",
  ticketCard:
    "bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500 flex flex-col sm:flex-row justify-between gap-4",
  ticketBody: "flex gap-4",
  ticketPoster:
    "w-16 h-20 bg-stone-200 rounded shrink-0 overflow-hidden hidden sm:block",
  ticketTitle: "font-bold font-serif text-lg",
  ticketTheater: "text-sm text-stone-500 font-bold uppercase",
  ticketDate: "mt-2 text-sm text-stone-700",
  ticketActions: "flex flex-col items-end justify-center",
  ticketBadge:
    "px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wide",

  favoritesEmpty:
    "text-stone-500 italic p-8 bg-white border border-dashed border-stone-300 rounded-lg text-center",
  favoritesGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",

  avatarImg: "w-full h-full object-cover",
  frameImg:
    "absolute inset-0 w-full h-full object-contain pointer-events-none z-10",

  uploadOverlayContent: "text-white text-center",
  uploadLabel: "text-sm font-medium",
  fileInput: "hidden",

  settingsDialog: "sm:max-w-md",
  settingsDialogTitle: "flex items-center gap-2",
  settingsBody: "space-y-6 py-4",
  settingsSwitchRow: "flex items-center justify-between space-x-4",
  settingsSwitchLabelGroup: "flex-1 space-y-1",
  settingsLabel: "text-base font-medium cursor-pointer",
  settingsDescription: "text-sm text-stone-500",
  settingsDivider: "border-t border-stone-200 pt-6",
  settingsGroup: "space-y-2",
  settingsAvatarLabel: "text-base font-medium",
  settingsAvatarDescription: "text-sm text-stone-500 mb-4",
  resetAvatarBtn:
    "w-full border-stone-300 text-stone-700 hover:bg-stone-50",

  ticketDateSpan: "block",
} as const;
