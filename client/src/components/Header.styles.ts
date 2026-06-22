export const s = {
  header:
    "sticky top-0 z-50 w-full bg-stone-100/95 backdrop-blur-sm border-b-2 border-yellow-600/30 shadow-sm",
  inner:
    "container mx-auto px-4 h-32 flex items-center justify-between",
  leftNav:
    "flex-1 hidden md:flex items-center justify-end gap-8 mr-12",
  rightNav:
    "flex-1 hidden md:flex items-center justify-start gap-8 ml-12",
  navLinkBase:
    "font-serif text-lg transition-all hover:text-primary relative py-1 hover:scale-105",
  navLinkActive: "text-primary font-bold",
  navLinkInactive: "text-stone-700",
  userSection: "ml-4",
  avatarBtn:
    "rounded-full border border-yellow-600/30 hover:bg-primary transition-all w-20 h-20 p-0 bg-primary",
  avatarBtnActive: "border-yellow-600",
  avatarInner:
    "w-[72px] h-[72px] rounded-full overflow-hidden border border-yellow-600 bg-primary",
  avatarImg: "w-full h-full object-cover",
  avatarImgDefault: "scale-[2] translate-x-0.5 translate-y-1.5",
  guestBtn:
    "rounded-full border border-yellow-600/30 hover:bg-primary transition-all w-20 h-20 p-0 bg-primary",
  guestAvatarInner:
    "w-[72px] h-[72px] rounded-full overflow-hidden border border-yellow-600 bg-white",
  guestAvatarImg: "w-full h-full object-cover scale-[1.1]",
  logoBtn: "group px-4 shrink-0",
  logoImg: "h-32 w-auto group-hover:scale-110 transition-transform",
} as const;
