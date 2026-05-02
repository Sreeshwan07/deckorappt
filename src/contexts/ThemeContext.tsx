import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeId = "aurora" | "tokyo" | "quantum" | "crimson" | "solar";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string;     // hsl triplet
  accent: string;      // hsl triplet
  glow: string;        // hsl triplet for glow
  ring: string;
  swatch: [string, string]; // for switcher dots (hex/hsl)
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  aurora: {
    id: "aurora",
    name: "Aurora Pulse",
    tagline: "Purple · Electric Blue",
    primary: "265 92% 65%",
    accent: "220 100% 65%",
    glow: "260 100% 70%",
    ring: "265 92% 65%",
    swatch: ["#a855f7", "#3b82f6"],
  },
  tokyo: {
    id: "tokyo",
    name: "Neon Tokyo",
    tagline: "Pink · Cyan",
    primary: "325 95% 62%",
    accent: "190 95% 55%",
    glow: "320 100% 70%",
    ring: "325 95% 62%",
    swatch: ["#ec4899", "#22d3ee"],
  },
  quantum: {
    id: "quantum",
    name: "Quantum Lime",
    tagline: "Neon Green · Aqua",
    primary: "150 90% 55%",
    accent: "175 95% 55%",
    glow: "150 100% 60%",
    ring: "150 90% 55%",
    swatch: ["#22c55e", "#14b8a6"],
  },
  crimson: {
    id: "crimson",
    name: "Crimson Nova",
    tagline: "Red · Magenta",
    primary: "350 92% 60%",
    accent: "315 92% 60%",
    glow: "340 100% 65%",
    ring: "350 92% 60%",
    swatch: ["#f43f5e", "#d946ef"],
  },
  solar: {
    id: "solar",
    name: "Solar Flare",
    tagline: "Orange · Gold",
    primary: "25 95% 58%",
    accent: "42 95% 58%",
    glow: "30 100% 65%",
    ring: "25 95% 58%",
    swatch: ["#f97316", "#facc15"],
  },
};

interface Ctx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  def: ThemeDef;
}

const ThemeContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "deckora-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "aurora";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return stored && THEMES[stored] ? stored : "aurora";
  });

  useEffect(() => {
    const def = THEMES[theme];
    const root = document.documentElement;
    root.style.setProperty("--primary", def.primary);
    root.style.setProperty("--accent", def.accent);
    root.style.setProperty("--ring", def.ring);
    root.style.setProperty("--sidebar-primary", def.primary);
    root.style.setProperty("--sidebar-ring", def.ring);
    root.style.setProperty("--theme-glow", def.glow);
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, def: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
