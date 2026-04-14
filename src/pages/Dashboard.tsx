import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
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
  { label: "All Presentations", icon: LayoutDashboard, id: "all" },
  { label: "Templates", icon: Palette, id: "templates" },
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card/95 backdrop-blur-xl flex flex-col transition-transform duration-300 lg:translate-x-0 border-r border-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="p-1.5 rounded-lg gradient-primary">
            <Presentation className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display gradient-text">Deckora</span>
          <button className="ml-auto lg:hidden text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <Button className="w-full gradient-primary text-primary-foreground rounded-xl h-10 font-semibold hover:brightness-110 transition-all" onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4" />
            New Presentation
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <div className="px-4 py-2 text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border h-14 flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search presentations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-secondary/30 border-border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">
                  {activeTab === "all" ? "All Presentations" : activeTab === "templates" ? "Templates" : "Settings"}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {activeTab === "all" && `${filtered.length} presentation${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Button className="gradient-primary text-primary-foreground rounded-xl hidden sm:flex hover:brightness-110 transition-all" onClick={() => navigate("/create")}>
                <Sparkles className="h-4 w-4" />
                New Presentation
              </Button>
            </div>

            {activeTab === "templates" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(templates).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate("/create")}
                  >
                    <div className="slide-preview w-full overflow-hidden">
                      <SlideRenderer slide={{ title: t.name, content: [t.description] }} templateId={t.id} slideIndex={0} totalSlides={1} className="w-full h-full text-[3.5px]" />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-foreground">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "settings" ? (
              <div className="rounded-2xl border border-border bg-card p-6 max-w-md">
                <h3 className="font-semibold text-foreground mb-4">Account</h3>
                <p className="text-sm text-muted-foreground mb-2">Email: {user?.email}</p>
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
              </div>
            ) : loading ? (
              <div className={cn("gap-5", viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("rounded-2xl bg-muted/30 animate-pulse", viewMode === "grid" ? "h-64" : "h-20")} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                <div className="p-4 rounded-2xl bg-primary/10 inline-block mb-6">
                  <Presentation className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-display text-foreground mb-2">
                  {search ? "No results found" : "No presentations yet"}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  {search ? "Try a different search term" : "Create your first AI-powered presentation in seconds"}
                </p>
                {!search && (
                  <Button className="gradient-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all" onClick={() => navigate("/create")}>
                    <Sparkles className="h-4 w-4" />
                    Create Presentation
                  </Button>
                )}
              </motion.div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((pres, idx) => (
                  <motion.div
                    key={pres.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
                    onClick={() => navigate(`/editor/${pres.id}`)}
                  >
                    <div className="slide-preview w-full overflow-hidden relative">
                      <SlideRenderer slide={{ title: pres.title, content: [pres.topic] }} templateId={pres.template} slideIndex={0} totalSlides={pres.num_slides} className="w-full h-full text-[4px]" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <h3 className="font-semibold text-foreground truncate mb-1">{pres.title}</h3>
                      <p className="text-sm text-muted-foreground truncate mb-3">{pres.topic}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {templates[pres.template]?.name || pres.template}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    className="group rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/editor/${pres.id}`)}
                  >
                    <div className="w-24 shrink-0 slide-preview rounded-lg overflow-hidden">
                      <SlideRenderer slide={{ title: pres.title, content: [] }} templateId={pres.template} slideIndex={0} totalSlides={1} className="w-full h-full text-[2px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{pres.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{pres.topic}</p>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
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
