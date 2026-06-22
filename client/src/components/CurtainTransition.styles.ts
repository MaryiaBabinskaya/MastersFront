export const s = {
  container: "relative min-h-screen overflow-hidden",
  leftCurtain: "fixed top-0 left-0 w-1/2 h-full z-[9999] border-r-8 border-yellow-700/50 shadow-[10px_0_30px_rgba(0,0,0,0.5)]",
  rightCurtain: "fixed top-0 right-0 w-1/2 h-full z-[9999] border-l-8 border-yellow-700/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]",
  leftEdge: "absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-black/40 to-transparent",
  rightEdge: "absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-black/40 to-transparent",
} as const;
