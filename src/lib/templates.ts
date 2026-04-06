export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  // Slide styles
  slideBg: string;
  slideAccentBg: string;
  titleColor: string;
  textColor: string;
  bulletColor: string;
  accentLine: string;
  // For export
  exportBg: string;
  exportTitleColor: string;
  exportTextColor: string;
  exportAccentColor: string;
  fontFamily: string;
}

export const templates: Record<string, TemplateConfig> = {
  business: {
    id: "business",
    name: "Business Professional",
    description: "Clean corporate look",
    slideBg: "bg-gradient-to-br from-[hsl(220,30%,98%)] to-[hsl(220,20%,94%)]",
    slideAccentBg: "gradient-primary",
    titleColor: "text-[hsl(222,47%,11%)]",
    textColor: "text-[hsl(222,20%,30%)]",
    bulletColor: "bg-[hsl(225,65%,52%)]",
    accentLine: "bg-[hsl(225,65%,52%)]",
    exportBg: "#F5F7FA",
    exportTitleColor: "#1A2332",
    exportTextColor: "#374151",
    exportAccentColor: "#3B6DE0",
    fontFamily: "Inter",
  },
  minimal: {
    id: "minimal",
    name: "Minimal Modern",
    description: "Simple elegant typography",
    slideBg: "bg-[hsl(0,0%,100%)]",
    slideAccentBg: "bg-[hsl(0,0%,100%)]",
    titleColor: "text-[hsl(0,0%,10%)]",
    textColor: "text-[hsl(0,0%,40%)]",
    bulletColor: "bg-[hsl(0,0%,70%)]",
    accentLine: "bg-[hsl(0,0%,85%)]",
    exportBg: "#FFFFFF",
    exportTitleColor: "#1A1A1A",
    exportTextColor: "#666666",
    exportAccentColor: "#B3B3B3",
    fontFamily: "Inter",
  },
  startup: {
    id: "startup",
    name: "Startup Pitch Deck",
    description: "Bold and structured",
    slideBg: "bg-gradient-to-br from-[hsl(225,65%,52%)] to-[hsl(255,60%,48%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(255,60%,48%)] to-[hsl(280,60%,45%)]",
    titleColor: "text-[hsl(0,0%,100%)]",
    textColor: "text-[hsl(0,0%,90%)]",
    bulletColor: "bg-[hsl(38,92%,60%)]",
    accentLine: "bg-[hsl(38,92%,60%)]",
    exportBg: "#3B6DE0",
    exportTitleColor: "#FFFFFF",
    exportTextColor: "#E5E5E5",
    exportAccentColor: "#F5A623",
    fontFamily: "Inter",
  },
  creative: {
    id: "creative",
    name: "Creative Visual",
    description: "Colorful & engaging",
    slideBg: "bg-gradient-to-br from-[hsl(340,80%,96%)] to-[hsl(280,80%,96%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(340,70%,55%)] to-[hsl(280,70%,55%)]",
    titleColor: "text-[hsl(340,70%,40%)]",
    textColor: "text-[hsl(280,30%,30%)]",
    bulletColor: "bg-[hsl(340,70%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(340,70%,55%)] to-[hsl(280,70%,55%)]",
    exportBg: "#FDF0F5",
    exportTitleColor: "#9E2B5E",
    exportTextColor: "#4A2B5E",
    exportAccentColor: "#D94B8A",
    fontFamily: "Inter",
  },
  tech: {
    id: "tech",
    name: "Dark Tech Theme",
    description: "Modern dark style",
    slideBg: "bg-gradient-to-br from-[hsl(222,47%,8%)] to-[hsl(222,30%,14%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(222,30%,14%)] to-[hsl(225,40%,18%)]",
    titleColor: "text-[hsl(0,0%,100%)]",
    textColor: "text-[hsl(220,20%,75%)]",
    bulletColor: "bg-[hsl(170,80%,50%)]",
    accentLine: "bg-[hsl(170,80%,50%)]",
    exportBg: "#0F1729",
    exportTitleColor: "#FFFFFF",
    exportTextColor: "#AAB8CF",
    exportAccentColor: "#15CDA8",
    fontFamily: "Inter",
  },
  academic: {
    id: "academic",
    name: "Academic Formal",
    description: "Clean educational layout",
    slideBg: "bg-[hsl(40,30%,97%)]",
    slideAccentBg: "bg-[hsl(220,40%,25%)]",
    titleColor: "text-[hsl(220,40%,20%)]",
    textColor: "text-[hsl(220,20%,35%)]",
    bulletColor: "bg-[hsl(220,40%,25%)]",
    accentLine: "bg-[hsl(220,40%,25%)]",
    exportBg: "#FAF8F5",
    exportTitleColor: "#1E3456",
    exportTextColor: "#3D4F66",
    exportAccentColor: "#1E3456",
    fontFamily: "Inter",
  },
};

export const templateList = Object.values(templates);
