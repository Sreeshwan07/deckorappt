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
}

export const templates: Record<string, TemplateConfig> = {
  business: {
    id: "business",
    name: "Corporate Professional",
    description: "Clean PowerPoint-style corporate look",
    slideBg: "bg-gradient-to-br from-[hsl(220,30%,98%)] to-[hsl(220,20%,94%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(222,50%,18%)] to-[hsl(225,55%,25%)]",
    titleColor: "text-[hsl(222,47%,15%)]",
    textColor: "text-[hsl(222,20%,35%)]",
    bulletColor: "bg-[hsl(225,65%,50%)]",
    accentLine: "bg-[hsl(225,65%,50%)]",
    exportBg: "#F5F7FA",
    exportTitleColor: "#1A2332",
    exportTextColor: "#374151",
    exportAccentColor: "#3B6DE0",
    fontFamily: "Calibri",
  },
  minimal: {
    id: "minimal",
    name: "Minimal Modern",
    description: "Gamma-style clean typography",
    slideBg: "bg-[hsl(0,0%,100%)]",
    slideAccentBg: "bg-[hsl(0,0%,100%)]",
    titleColor: "text-[hsl(0,0%,8%)]",
    textColor: "text-[hsl(0,0%,40%)]",
    bulletColor: "bg-[hsl(0,0%,75%)]",
    accentLine: "bg-[hsl(0,0%,88%)]",
    exportBg: "#FFFFFF",
    exportTitleColor: "#141414",
    exportTextColor: "#666666",
    exportAccentColor: "#BFBFBF",
    fontFamily: "Calibri",
  },
  startup: {
    id: "startup",
    name: "Startup Pitch Deck",
    description: "Bold headings with structure",
    slideBg: "bg-[hsl(0,0%,100%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(255,70%,55%)] to-[hsl(280,65%,50%)]",
    titleColor: "text-[hsl(255,60%,40%)]",
    textColor: "text-[hsl(255,15%,35%)]",
    bulletColor: "bg-[hsl(255,70%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(255,70%,55%)] to-[hsl(280,65%,50%)]",
    exportBg: "#FFFFFF",
    exportTitleColor: "#5B34B5",
    exportTextColor: "#4A3F5E",
    exportAccentColor: "#7C4DFF",
    fontFamily: "Calibri",
  },
  tech: {
    id: "tech",
    name: "Dark Tech",
    description: "Purple-tinted modern dark",
    slideBg: "bg-gradient-to-br from-[hsl(260,30%,8%)] to-[hsl(260,20%,13%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(265,50%,18%)] to-[hsl(280,40%,12%)]",
    titleColor: "text-[hsl(0,0%,100%)]",
    textColor: "text-[hsl(260,15%,70%)]",
    bulletColor: "bg-[hsl(265,85%,65%)]",
    accentLine: "bg-gradient-to-r from-[hsl(265,85%,65%)] to-[hsl(280,75%,55%)]",
    exportBg: "#120E1E",
    exportTitleColor: "#FFFFFF",
    exportTextColor: "#A99BC7",
    exportAccentColor: "#8B5CF6",
    fontFamily: "Calibri",
  },
  creative: {
    id: "creative",
    name: "Creative Visual",
    description: "Colorful but balanced",
    slideBg: "bg-gradient-to-br from-[hsl(35,90%,97%)] to-[hsl(20,80%,95%)]",
    slideAccentBg: "bg-gradient-to-br from-[hsl(25,85%,55%)] to-[hsl(350,70%,55%)]",
    titleColor: "text-[hsl(25,70%,30%)]",
    textColor: "text-[hsl(25,30%,35%)]",
    bulletColor: "bg-[hsl(25,85%,55%)]",
    accentLine: "bg-gradient-to-r from-[hsl(25,85%,55%)] to-[hsl(350,70%,55%)]",
    exportBg: "#FFF8F0",
    exportTitleColor: "#7A3D15",
    exportTextColor: "#5E4236",
    exportAccentColor: "#E67E3C",
    fontFamily: "Calibri",
  },
  academic: {
    id: "academic",
    name: "Academic Formal",
    description: "Clean structured educational",
    slideBg: "bg-[hsl(210,20%,97%)]",
    slideAccentBg: "bg-[hsl(210,45%,22%)]",
    titleColor: "text-[hsl(210,45%,18%)]",
    textColor: "text-[hsl(210,20%,35%)]",
    bulletColor: "bg-[hsl(210,45%,30%)]",
    accentLine: "bg-[hsl(210,45%,30%)]",
    exportBg: "#F5F7FA",
    exportTitleColor: "#1C3352",
    exportTextColor: "#3D4F66",
    exportAccentColor: "#1C3352",
    fontFamily: "Calibri",
  },
};

export const templateList = Object.values(templates);
