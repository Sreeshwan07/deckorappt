export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  slideBg: string;
  slideAccentBg: string;
  titleColor: string;
  textColor: string;
  bulletColor: string;
  accentLine: string;
  exportBg: string;
  exportTitleColor: string;
  exportTextColor: string;
  exportAccentColor: string;
  fontFamily: string;
  premium?: boolean;
}

// ──────────────────────────────────────────────────────────────────
// PREMIUM TEMPLATES (new 10) — listed first in the picker
// Palettes: Navy+Cyan, Emerald+Slate, Indigo+White, Beige+Charcoal,
// Teal+Midnight, plus modern gradients. All WCAG-AA on body text.
// ──────────────────────────────────────────────────────────────────
const premium: Record<string, TemplateConfig> = {
  "executive-modern": {
    id: "executive-modern",
    name: "Executive Modern",
    description: "Navy + cyan, corporate-clean",
    slideBg: "bg-gradient-to-br from-[hsl(210,40%,98%)] to-[hsl(210,30%,94%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(215,55%,16%)] to-[hsl(200,70%,22%)]",
    titleColor: "text-[hsl(215,55%,18%)]",
    textColor: "text-[hsl(215,20%,28%)]",
    bulletColor: "bg-[hsl(195,80%,42%)]",
    accentLine: "bg-gradient-to-r from-[hsl(215,55%,30%)] to-[hsl(195,80%,45%)]",
    exportBg: "#F4F8FC", exportTitleColor: "#142F4F", exportTextColor: "#3A4A60", exportAccentColor: "#1B8AC4",
    fontFamily: "Calibri", premium: true,
  },
  "academic-elite": {
    id: "academic-elite",
    name: "Academic Elite",
    description: "University research, serif refined",
    slideBg: "bg-gradient-to-br from-[hsl(40,30%,98%)] to-[hsl(35,25%,94%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(220,35%,18%)] to-[hsl(220,40%,12%)]",
    titleColor: "text-[hsl(220,45%,18%)] font-serif",
    textColor: "text-[hsl(220,15%,28%)]",
    bulletColor: "bg-[hsl(220,50%,40%)]",
    accentLine: "bg-[hsl(220,50%,40%)]",
    exportBg: "#FBF8F2", exportTitleColor: "#1A2A4A", exportTextColor: "#374255", exportAccentColor: "#2A4577",
    fontFamily: "Georgia", premium: true,
  },
  "startup-pitch-pro": {
    id: "startup-pitch-pro",
    name: "Startup Pitch Pro",
    description: "Investor deck, indigo gradient",
    slideBg: "bg-gradient-to-br from-[hsl(0,0%,100%)] to-[hsl(235,40%,97%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(245,75%,55%)] to-[hsl(265,70%,45%)]",
    titleColor: "text-[hsl(245,60%,32%)]",
    textColor: "text-[hsl(235,15%,30%)]",
    bulletColor: "bg-[hsl(245,75%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(245,75%,55%)] to-[hsl(280,70%,55%)]",
    exportBg: "#FFFFFF", exportTitleColor: "#312E81", exportTextColor: "#3D3A55", exportAccentColor: "#6366F1",
    fontFamily: "Calibri", premium: true,
  },
  "glassmorphism-pro": {
    id: "glassmorphism-pro",
    name: "Glassmorphism Pro",
    description: "Translucent gradients, modern UI",
    slideBg: "bg-gradient-to-br from-[hsl(230,30%,12%)] to-[hsl(250,35%,20%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(240,45%,22%)] to-[hsl(260,50%,28%)]",
    titleColor: "text-[hsl(0,0%,100%)]",
    textColor: "text-[hsl(230,20%,85%)]",
    bulletColor: "bg-[hsl(195,90%,60%)]",
    accentLine: "bg-gradient-to-r from-[hsl(195,90%,60%)] to-[hsl(265,80%,68%)]",
    exportBg: "#171A35", exportTitleColor: "#FFFFFF", exportTextColor: "#C8CFE6", exportAccentColor: "#3DD0FF",
    fontFamily: "Calibri", premium: true,
  },
  "neo-minimal": {
    id: "neo-minimal",
    name: "Neo Minimal",
    description: "Apple-inspired, ample whitespace",
    slideBg: "bg-[hsl(0,0%,100%)]",
    slideAccentBg: "bg-[hsl(0,0%,8%)]",
    titleColor: "text-[hsl(0,0%,8%)]",
    textColor: "text-[hsl(0,0%,32%)]",
    bulletColor: "bg-[hsl(0,0%,15%)]",
    accentLine: "bg-[hsl(0,0%,88%)]",
    exportBg: "#FFFFFF", exportTitleColor: "#111111", exportTextColor: "#525252", exportAccentColor: "#222222",
    fontFamily: "Calibri", premium: true,
  },
  "luxury-dark": {
    id: "luxury-dark",
    name: "Luxury Dark",
    description: "Black + gold premium",
    slideBg: "bg-[hsl(0,0%,7%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(38,55%,55%)] to-[hsl(38,70%,40%)]",
    titleColor: "text-[hsl(38,75%,68%)]",
    textColor: "text-[hsl(0,0%,88%)]",
    bulletColor: "bg-[hsl(38,75%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(38,75%,55%)] to-[hsl(38,55%,40%)]",
    exportBg: "#0F0F0F", exportTitleColor: "#D6B36A", exportTextColor: "#DEDEDE", exportAccentColor: "#C9A24C",
    fontFamily: "Georgia", premium: true,
  },
  "genz-gradient": {
    id: "genz-gradient",
    name: "Gen Z Gradient",
    description: "Bold modern gradients",
    slideBg: "bg-gradient-to-br from-[hsl(280,45%,96%)] to-[hsl(320,50%,94%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(280,75%,60%)] to-[hsl(330,80%,60%)]",
    titleColor: "text-[hsl(290,55%,28%)]",
    textColor: "text-[hsl(290,15%,30%)]",
    bulletColor: "bg-[hsl(305,75%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(280,75%,60%)] to-[hsl(330,80%,60%)]",
    exportBg: "#FAF1FA", exportTitleColor: "#5A2466", exportTextColor: "#454055", exportAccentColor: "#C53AB5",
    fontFamily: "Calibri", premium: true,
  },
  "tech-blueprint": {
    id: "tech-blueprint",
    name: "Tech Blueprint",
    description: "Engineering, schematic-inspired",
    slideBg: "bg-gradient-to-br from-[hsl(205,55%,12%)] to-[hsl(210,65%,18%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(190,90%,40%)] to-[hsl(200,90%,30%)]",
    titleColor: "text-[hsl(190,90%,75%)]",
    textColor: "text-[hsl(200,30%,82%)]",
    bulletColor: "bg-[hsl(190,90%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(190,90%,55%)] to-[hsl(215,80%,55%)]",
    exportBg: "#0E2236", exportTitleColor: "#7BDFFE", exportTextColor: "#BFD0E0", exportAccentColor: "#15B7E8",
    fontFamily: "Consolas", premium: true,
  },
  "elegant-editorial": {
    id: "elegant-editorial",
    name: "Elegant Editorial",
    description: "Magazine, serif headlines",
    slideBg: "bg-[hsl(36,30%,96%)]",
    slideAccentBg: "bg-[hsl(20,30%,15%)]",
    titleColor: "text-[hsl(20,40%,18%)] font-serif",
    textColor: "text-[hsl(25,20%,30%)]",
    bulletColor: "bg-[hsl(15,55%,40%)]",
    accentLine: "bg-[hsl(15,55%,40%)]",
    exportBg: "#F6EFE3", exportTitleColor: "#2A1F18", exportTextColor: "#3F362E", exportAccentColor: "#9C4F2E",
    fontFamily: "Georgia", premium: true,
  },
  "data-analytics": {
    id: "data-analytics",
    name: "Data Analytics",
    description: "Teal + midnight, chart-friendly",
    slideBg: "bg-gradient-to-br from-[hsl(190,30%,97%)] to-[hsl(195,25%,92%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(195,75%,18%)] to-[hsl(180,70%,22%)]",
    titleColor: "text-[hsl(195,70%,18%)]",
    textColor: "text-[hsl(195,20%,28%)]",
    bulletColor: "bg-[hsl(175,75%,38%)]",
    accentLine: "bg-gradient-to-r from-[hsl(195,75%,30%)] to-[hsl(175,75%,40%)]",
    exportBg: "#EEF6F8", exportTitleColor: "#0E3C4A", exportTextColor: "#324A55", exportAccentColor: "#0FA39A",
    fontFamily: "Calibri", premium: true,
  },
};

// ── Legacy templates (kept) ────────────────────────────────────────
const legacy: Record<string, TemplateConfig> = {
  cremeeditorial: {
    id: "cremeeditorial", name: "Crème Editorial", description: "Warm beige with elegant dark serif",
    slideBg: "bg-gradient-to-br from-[hsl(38,40%,96%)] to-[hsl(34,32%,92%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(28,25%,18%)] to-[hsl(24,22%,12%)]",
    titleColor: "text-[hsl(25,28%,16%)] font-serif", textColor: "text-[hsl(25,18%,30%)]",
    bulletColor: "bg-[hsl(28,40%,42%)]", accentLine: "bg-[hsl(28,40%,42%)]",
    exportBg: "#F6EFE3", exportTitleColor: "#2A201A", exportTextColor: "#3F362E", exportAccentColor: "#8C6A45",
    fontFamily: "Georgia",
  },
  seafoam: {
    id: "seafoam", name: "Seafoam", description: "Pale mint with soft gray-blue accents",
    slideBg: "bg-gradient-to-br from-[hsl(165,30%,96%)] to-[hsl(180,25%,93%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(195,30%,22%)] to-[hsl(180,28%,18%)]",
    titleColor: "text-[hsl(195,35%,18%)]", textColor: "text-[hsl(195,18%,32%)]",
    bulletColor: "bg-[hsl(180,40%,40%)]", accentLine: "bg-[hsl(180,40%,40%)]",
    exportBg: "#EEF6F4", exportTitleColor: "#1F3A42", exportTextColor: "#3D5158", exportAccentColor: "#3C8A85",
    fontFamily: "Calibri",
  },
  nebulaesoft: {
    id: "nebulaesoft", name: "Nebulae Soft", description: "Muted navy with soft purple accents",
    slideBg: "bg-gradient-to-br from-[hsl(230,28%,12%)] to-[hsl(245,30%,16%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(245,40%,20%)] to-[hsl(260,35%,24%)]",
    titleColor: "text-[hsl(0,0%,98%)]", textColor: "text-[hsl(235,18%,78%)]",
    bulletColor: "bg-[hsl(260,55%,68%)]",
    accentLine: "bg-gradient-to-r from-[hsl(260,55%,68%)] to-[hsl(220,55%,65%)]",
    exportBg: "#181A2E", exportTitleColor: "#FAFAFB", exportTextColor: "#BCC0D6", exportAccentColor: "#9D87D9",
    fontFamily: "Calibri",
  },
  academicmodern: {
    id: "academicmodern", name: "Academic Modern", description: "Editorial serif, seminar ready",
    slideBg: "bg-gradient-to-br from-[hsl(40,30%,98%)] to-[hsl(35,25%,95%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(25,40%,18%)] to-[hsl(20,35%,12%)]",
    titleColor: "text-[hsl(25,30%,15%)] font-serif", textColor: "text-[hsl(25,15%,32%)]",
    bulletColor: "bg-[hsl(25,55%,45%)]", accentLine: "bg-[hsl(25,55%,45%)]",
    exportBg: "#FAF7F2", exportTitleColor: "#2A1F18", exportTextColor: "#3F362E", exportAccentColor: "#A0653A",
    fontFamily: "Georgia",
  },
  business: {
    id: "business", name: "Corporate Professional", description: "Clean PowerPoint-style",
    slideBg: "bg-gradient-to-br from-[hsl(220,30%,98%)] to-[hsl(220,20%,94%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(222,50%,18%)] to-[hsl(225,55%,25%)]",
    titleColor: "text-[hsl(222,47%,15%)]", textColor: "text-[hsl(222,20%,35%)]",
    bulletColor: "bg-[hsl(225,65%,50%)]", accentLine: "bg-[hsl(225,65%,50%)]",
    exportBg: "#F5F7FA", exportTitleColor: "#1A2332", exportTextColor: "#374151", exportAccentColor: "#3B6DE0",
    fontFamily: "Calibri",
  },
  minimal: {
    id: "minimal", name: "Minimal Modern", description: "Gamma-style clean",
    slideBg: "bg-[hsl(0,0%,100%)]", slideAccentBg: "bg-[hsl(0,0%,100%)]",
    titleColor: "text-[hsl(0,0%,8%)]", textColor: "text-[hsl(0,0%,40%)]",
    bulletColor: "bg-[hsl(0,0%,75%)]", accentLine: "bg-[hsl(0,0%,88%)]",
    exportBg: "#FFFFFF", exportTitleColor: "#141414", exportTextColor: "#666666", exportAccentColor: "#BFBFBF",
    fontFamily: "Calibri",
  },
  tech: {
    id: "tech", name: "Dark Tech", description: "Purple-tinted dark",
    slideBg: "bg-gradient-to-br from-[hsl(260,30%,8%)] to-[hsl(260,20%,13%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(265,50%,18%)] to-[hsl(280,40%,12%)]",
    titleColor: "text-[hsl(0,0%,100%)]", textColor: "text-[hsl(260,15%,70%)]",
    bulletColor: "bg-[hsl(265,85%,65%)]",
    accentLine: "bg-gradient-to-r from-[hsl(265,85%,65%)] to-[hsl(280,75%,55%)]",
    exportBg: "#120E1E", exportTitleColor: "#FFFFFF", exportTextColor: "#A99BC7", exportAccentColor: "#8B5CF6",
    fontFamily: "Calibri",
  },
};

export const templates: Record<string, TemplateConfig> = { ...premium, ...legacy };

// Premium first
export const templateList: TemplateConfig[] = [
  ...Object.values(premium),
  ...Object.values(legacy),
];
