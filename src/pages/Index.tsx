import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { templateList } from "@/lib/templates";
import SlideRenderer from "@/components/SlideRenderer";
import {
  Sparkles,
  Presentation,
  ArrowRight,
  Search,
  Bell,
  Layers,
  LayoutGrid,
  Mountain,
  Image,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  Plus,
  Star,
  Clock,
  FolderOpen,
  Grid3X3,
} from "lucide-react";

const categories = ["Business", "Creative", "Education", "Data Viz"];

const categoryMap: Record<string, string[]> = {
  Business: ["business", "minimal"],
  Creative: ["creative", "startup"],
  Education: ["academic"],
  "Data Viz": ["tech"],
};

const sidebarIcons = [
  { icon: Layers, label: "Templates" },
  { icon: LayoutGrid, label: "Components" },
  { icon: Mountain, label: "Themes" },
  { icon: Image, label: "Media" },
  { icon: Lightbulb, label: "Ideas" },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("gallery");

  const handleGenerate = () => {
    if (user) {
      navigate("/create");
    } else {
      setAuthOpen(true);
    }
  };

  const filteredTemplates = activeCategory
    ? templateList.filter((t) => categoryMap[activeCategory]?.includes(t.id))
    : templateList;

  const templateCards = [
    ...filteredTemplates.map((t, i) => ({
      type: "template" as const,
      template: t,
      title: t.name,
      subtitle: `${categories.find((c) => categoryMap[c]?.includes(t.id)) || "General"} • ${12 + i * 6} Slides`,
      index: i,
    })),
    { type: "scratch" as const, title: "Blank Slate", subtitle: "Customizable Framework", index: filteredTemplates.length },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Icon Sidebar */}
      <aside className="hidden md:flex flex-col items-center w-14 border-r border-border bg-background py-4 gap-1 shrink-0">
        {sidebarIcons.map((item, i) => (
          <button
            key={item.label}
            className={`p-2.5 rounded-xl transition-colors ${i === 0 ? "bg-warning/15 text-warning" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
        <div className="flex-1" />
        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground" title="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground" title="Feedback">
          <MessageSquare className="h-5 w-5" />
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg gradient-primary">
                  <Presentation className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-display tracking-wide text-foreground">DECKORA</span>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                {user && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <button className="px-3 py-1.5 text-sm font-medium text-warning border-b-2 border-warning">
                  Templates
                </button>
                {user && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Projects
                  </button>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40"
                />
              </div>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <Button variant="gradient" size="sm" onClick={handleGenerate}>
                Create New
              </Button>
              {user ? (
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
            {/* Hero Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
                <span className="italic text-foreground">The Editorial </span>
                <span className="italic text-warning">Library.</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl">
                Dismantle the ordinary. Choose from our curated collection of high-end cinematic presentation frameworks.
              </p>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === cat
                      ? "border-warning/50 bg-warning/10 text-warning"
                      : "border-border bg-card/50 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {templateCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                >
                  {card.type === "template" ? (
                    <div
                      className="group rounded-2xl overflow-hidden bg-card/60 border border-border hover:border-muted-foreground/30 transition-all cursor-pointer"
                      onClick={handleGenerate}
                    >
                      <div className="slide-preview w-full overflow-hidden bg-secondary/30">
                        <SlideRenderer
                          slide={{
                            title: card.template!.name,
                            content: [card.template!.description, "Professional layouts with AI content"],
                          }}
                          templateId={card.template!.id}
                          slideIndex={0}
                          totalSlides={1}
                          className="w-full h-full text-[3.5px]"
                        />
                      </div>
                      <div className="p-4 flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
                        </div>
                        <button className="p-1 text-muted-foreground/40 hover:text-warning transition-colors">
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="group rounded-2xl overflow-hidden bg-card/40 border border-dashed border-border hover:border-muted-foreground/30 transition-all cursor-pointer flex flex-col"
                      onClick={handleGenerate}
                    >
                      <div className="slide-preview w-full flex items-center justify-center bg-secondary/10">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-14 w-14 rounded-2xl bg-warning/15 flex items-center justify-center">
                            <Plus className="h-7 w-7 text-warning" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Start from Scratch</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating Tab Bar */}
          <div className="sticky bottom-6 flex justify-center z-30 pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-1 bg-card/90 backdrop-blur-xl border border-border rounded-full px-2 py-1.5 shadow-lg">
              {[
                { id: "gallery", label: "Gallery", icon: Grid3X3 },
                { id: "saved", label: "Saved", icon: FolderOpen },
                { id: "recent", label: "Recent", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>Curated by top editorial designers ✨</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">PRIVACY</a>
              <a href="#" className="hover:text-foreground transition-colors">TERMS</a>
              <a href="#" className="hover:text-foreground transition-colors">SUPPORT</a>
            </div>
          </footer>
        </main>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason="Sign in to generate and save presentations" />
    </div>
  );
}
