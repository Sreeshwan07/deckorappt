import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Presentation,
  Trash2,
  Pencil,
  Clock,
  Sparkles,
  LayoutDashboard,
  Palette,
  Settings,
  LogOut,
  Search,
  LayoutGrid,
  List,
  Copy,
  MoreVertical,
  Menu,
  X,
  Library,
  Download,
  Bell,
  Cpu,
  Activity,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { templates } from "@/lib/templates";
import SlideRenderer from "@/components/SlideRenderer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeSwitcher from "@/components/ThemeSwitcher";

interface PresentationRow {
  id: string;
  title: string;
  topic: string;
  template: string;
  status: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  num_slides: number;
}

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, id: "all" },
  { label: "AI Studio", icon: Sparkles, id: "studio", path: "/create" },
  { label: "Templates", icon: Palette, id: "templates" },
  { label: "Library", icon: Library, id: "library" },
  { label: "Exports", icon: Download, id: "exports" },
  { label: "Settings", icon: Settings, id: "settings" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presentations, setPresentations] = useState<PresentationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPresentations();
  }, [user]);

  const loadPresentations = useCallback(async () => {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading presentations", description: error.message, variant: "destructive" });
    } else {
      setPresentations(data || []);
    }
    setLoading(false);
  }, [toast]);

  const deletePresentation = useCallback(async (id: string) => {
    const { error } = await supabase.from("presentations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPresentations((p) => p.filter((item) => item.id !== id));
      toast({ title: "Presentation deleted" });
    }
  }, [toast]);

  const duplicatePresentation = useCallback(async (pres: PresentationRow) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("presentations")
      .insert({
        user_id: user.id,
        title: `${pres.title} (Copy)`,
        topic: pres.topic,
        num_slides: pres.num_slides,
        template: pres.template,
        tone: "professional",
        status: "ready",
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setPresentations((p) => [data as PresentationRow, ...p]);
      toast({ title: "Presentation duplicated" });
    }
  }, [user, toast]);

  const filtered = useMemo(
    () => presentations.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase())
    ),
    [presentations, search]
  );

  const formatDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString();
  }, []);

  // Synthetic analytics for the command center
  const analytics = useMemo(() => {
    const total = presentations.length;
    const totalSlides = presentations.reduce((s, p) => s + (p.num_slides || 0), 0);
    const last7 = presentations.filter(p => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length;
    return [
      { label: "Decks", value: total, icon: Presentation, hint: "All time" },
      { label: "Slides", value: totalSlides, icon: Activity, hint: "Generated" },
      { label: "This week", value: last7, icon: TrendingUp, hint: "+ created" },
      { label: "AI score", value: total ? 92 : 0, icon: Cpu, hint: "Optimization", suffix: "%" },
    ];
  }, [presentations]);

  return (
    <div className="min-h-screen flex cinematic-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-60 flex flex-col transition-transform duration-300 lg:translate-x-0",
        "bg-sidebar/80 backdrop-blur-2xl border-r border-sidebar-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <BrandLogo className="text-xl" />
          <span className="text-[9px] font-mono-cy uppercase text-muted-foreground ml-auto px-1.5 py-0.5 rounded border border-border/60">
            v2
          </span>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-3">
          <Button
            className="w-full gradient-primary text-primary-foreground rounded-lg h-10 font-semibold hover:brightness-110 transition-all glow-primary-sm"
            onClick={() => navigate("/create")}
          >
            <Plus className="h-4 w-4" />
            New Deck
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <div className="px-3 pb-2 text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground/60">
            Workspace
          </div>
          {sidebarItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  else { setActiveTab(item.id); setSidebarOpen(false); }
                }}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary glow-primary-sm" />
                )}
                <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-sidebar-accent/40">
            <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{user?.email?.split("@")[0]}</div>
              <div className="text-[10px] text-muted-foreground truncate">Pro plan</div>
            </div>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-2xl border-b border-border/60 h-14 flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden mr-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="hidden md:flex items-center gap-2 max-w-md flex-1 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/50 focus-within:border-primary/50 transition-colors">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search decks, templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <kbd className="text-[9px] font-mono-cy text-muted-foreground/60 px-1.5 py-0.5 rounded bg-background/60 border border-border/40">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-1 mr-1 p-0.5 rounded-lg border border-border/50 bg-secondary/30">
              <button
                className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <ThemeSwitcher />
            <button className="relative p-2 rounded-lg hover:bg-secondary/60 transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Hero command-center */}
            {activeTab === "all" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative glass-card-strong rounded-3xl p-6 lg:p-8 overflow-hidden scanline"
              >
                <div className="absolute inset-0 gradient-primary-subtle pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: "hsl(var(--primary) / 0.25)" }} />
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-[10px] font-mono-cy uppercase tracking-widest text-primary">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      Session active · AI engine ready
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display tracking-tight">
                      Welcome back, <span className="gradient-text">{user?.email?.split("@")[0]}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Your creative workspace is online. Start a new deck or jump back into a recent project.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/create")}
                    className="gradient-primary text-primary-foreground rounded-xl h-11 px-6 font-semibold hover:scale-[1.02] hover:brightness-110 transition-all glow-primary-sm self-start lg:self-center"
                  >
                    <Sparkles className="h-4 w-4" />
                    Open AI Studio
                  </Button>
                </div>

                {/* Analytics row */}
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  {analytics.map((a) => (
                    <div key={a.label} className="rounded-xl bg-background/40 border border-border/50 p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground">{a.label}</span>
                        <a.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold font-display text-foreground">
                        {a.value}{a.suffix || ""}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{a.hint}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Section header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-foreground tracking-tight">
                  {activeTab === "all" ? "Recent Decks"
                    : activeTab === "templates" ? "Template Library"
                    : activeTab === "library" ? "Library"
                    : activeTab === "exports" ? "Exports"
                    : "Settings"}
                </h2>
                {activeTab === "all" && (
                  <p className="text-muted-foreground text-xs font-mono-cy uppercase tracking-widest mt-1">
                    {filtered.length} deck{filtered.length !== 1 ? "s" : ""} · sorted by recent
                  </p>
                )}
              </div>
            </div>

            {activeTab === "templates" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(templates).map((t) => (
                  <div
                    key={t.id}
                    className="group rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/40 hover:shadow-[0_0_30px_-10px_hsl(var(--theme-glow)/0.5)] transition-all cursor-pointer"
                    onClick={() => navigate("/create")}
                  >
                    <div className="slide-preview w-full overflow-hidden">
                      <SlideRenderer slide={{ title: t.name, content: [t.description] }} templateId={t.id} slideIndex={0} totalSlides={1} className="w-full h-full text-[3.5px]" />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-foreground">{t.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "settings" ? (
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 max-w-md">
                <h3 className="font-semibold text-foreground mb-4 font-display">Account</h3>
                <p className="text-sm text-muted-foreground mb-4">Email: {user?.email}</p>
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
              </div>
            ) : activeTab === "exports" || activeTab === "library" ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
                <Zap className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            ) : loading ? (
              <div className={cn("gap-4", viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("rounded-2xl bg-card/30 border border-border/40 animate-pulse", viewMode === "grid" ? "h-64" : "h-20")} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 glass-card rounded-3xl">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-6 glow-primary-sm">
                  <Presentation className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-display text-foreground mb-2">
                  {search ? "No results found" : "Your studio is empty"}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
                  {search ? "Try a different search term" : "Generate your first cinematic deck in under a minute."}
                </p>
                {!search && (
                  <Button className="gradient-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all glow-primary-sm" onClick={() => navigate("/create")}>
                    <Sparkles className="h-4 w-4" />
                    Create your first deck
                  </Button>
                )}
              </motion.div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((pres, idx) => (
                  <motion.div
                    key={pres.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="group rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/50 hover:shadow-[0_0_40px_-12px_hsl(var(--theme-glow)/0.6)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    onClick={() => navigate(`/editor/${pres.id}`)}
                  >
                    <div className="slide-preview w-full overflow-hidden relative">
                      <SlideRenderer slide={{ title: pres.title, content: [pres.topic] }} templateId={pres.template} slideIndex={0} totalSlides={pres.num_slides} className="w-full h-full text-[4px]" />
                      <div className="absolute inset-x-0 top-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-background/80 to-transparent">
                        <span className="text-[9px] font-mono-cy uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary">
                          {pres.status === "ready" ? "● Ready" : "● " + pres.status}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => navigate(`/editor/${pres.id}`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicatePresentation(pres)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deletePresentation(pres.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold font-display text-foreground truncate mb-1">{pres.title}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-3">{pres.topic}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-cy uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {templates[pres.template]?.name || pres.template}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono-cy uppercase tracking-wider">
                          <Clock className="h-3 w-3" />
                          {formatDate(pres.created_at)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((pres, idx) => (
                  <motion.div
                    key={pres.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    className="group rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 flex items-center gap-4 hover:border-primary/50 hover:shadow-[0_0_24px_-10px_hsl(var(--theme-glow)/0.5)] transition-all cursor-pointer"
                    onClick={() => navigate(`/editor/${pres.id}`)}
                  >
                    <div className="w-24 shrink-0 slide-preview rounded-lg overflow-hidden border border-border/40">
                      <SlideRenderer slide={{ title: pres.title, content: [] }} templateId={pres.template} slideIndex={0} totalSlides={1} className="w-full h-full text-[2px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold font-display text-foreground truncate">{pres.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{pres.topic}</p>
                    </div>
                    <span className="text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground hidden sm:block">
                      {formatDate(pres.created_at)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/editor/${pres.id}`)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicatePresentation(pres)}>
                          <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deletePresentation(pres.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
