import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SlideRenderer from "@/components/SlideRenderer";
import SlideshowMode from "@/components/SlideshowMode";
import { templates } from "@/lib/templates";
import { exportPresentation, type ExportFormat } from "@/lib/export";
import { isAdminUser } from "@/lib/admin";
import {
  ArrowLeft, Plus, Trash2, Download, Loader2, Pencil, Check, X,
  ChevronUp, ChevronDown, Presentation, Palette, Menu, FileText, ImageIcon, RefreshCw, Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  slide_order: number;
  title: string;
  content: string[];
  speaker_notes: string | null;
  image_url: string | null;
}

interface PresentationData {
  id: string;
  title: string;
  template: string;
  is_paid: boolean;
  topic: string;
}

export default function SlideEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = isAdminUser(user?.email);

  useEffect(() => {
    if (!id) return;
    loadPresentation();
  }, [id]);

  const loadPresentation = async () => {
    const [presResult, slidesResult] = await Promise.all([
      supabase.from("presentations").select("*").eq("id", id!).single(),
      supabase.from("slides").select("*").eq("presentation_id", id!).order("slide_order"),
    ]);
    if (presResult.error || slidesResult.error) {
      toast({ title: "Error loading presentation", variant: "destructive" });
      navigate("/dashboard");
      return;
    }
    setPresentation(presResult.data);
    setSlides(
      (slidesResult.data || []).map((s: any) => ({
        ...s,
        content: Array.isArray(s.content) ? (s.content as string[]) : typeof s.content === "string" ? JSON.parse(s.content) : [],
        image_url: s.image_url || null,
      }))
    );
    setLoading(false);
  };

  const autoSave = useCallback(
    (slideId: string, updates: { title?: string; content?: string[]; speaker_notes?: string | null }) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = JSON.stringify(updates.content);
        if (updates.speaker_notes !== undefined) dbUpdates.speaker_notes = updates.speaker_notes;
        await supabase.from("slides").update(dbUpdates).eq("id", slideId);
      }, 800);
    }, []
  );

  const updateSlideLocal = (idx: number, updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
    const slide = slides[idx];
    if (slide) autoSave(slide.id, updates);
  };

  const addSlide = async () => {
    if (!id) return;
    const order = slides.length;
    const { data, error } = await supabase.from("slides")
      .insert({ presentation_id: id, slide_order: order, title: "New Slide", content: JSON.stringify(["Add your content here"]) })
      .select().single();
    if (error || !data) return;
    setSlides([...slides, { ...data, content: ["Add your content here"], image_url: null }]);
    setCurrentSlide(order);
  };

  const deleteSlide = async (idx: number) => {
    if (slides.length <= 1) return;
    await supabase.from("slides").delete().eq("id", slides[idx].id);
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) setCurrentSlide(newSlides.length - 1);
  };

  const moveSlide = async (idx: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[idx], newSlides[newIdx]] = [newSlides[newIdx], newSlides[idx]];
    newSlides.forEach((s, i) => (s.slide_order = i));
    setSlides(newSlides);
    setCurrentSlide(newIdx);
    await Promise.all(newSlides.map((s, i) => supabase.from("slides").update({ slide_order: i }).eq("id", s.id)));
  };

  const changeTemplate = async (templateId: string) => {
    if (!presentation) return;
    await supabase.from("presentations").update({ template: templateId }).eq("id", presentation.id);
    setPresentation({ ...presentation, template: templateId });
    setShowTemplates(false);
    toast({ title: `Theme: ${templates[templateId]?.name}` });
  };

  const generateImageForSlide = async (idx: number) => {
    const slide = slides[idx];
    if (!slide) return;
    setGeneratingImage(slide.id);
    try {
      const prompt = `${slide.title}: ${slide.content.slice(0, 2).join(", ")}`;
      const { data, error } = await supabase.functions.invoke("generate-slide-image", {
        body: { prompt, slideId: slide.id },
      });
      if (error) throw error;
      if (data?.image_url) {
        setSlides((prev) => prev.map((s, i) => i === idx ? { ...s, image_url: data.image_url } : s));
        toast({ title: "Image generated!" });
      }
    } catch (err) {
      toast({ title: "Image generation failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setGeneratingImage(null);
    }
  };

  const removeImage = async (idx: number) => {
    const slide = slides[idx];
    if (!slide) return;
    await supabase.from("slides").update({ image_url: null }).eq("id", slide.id);
    setSlides((prev) => prev.map((s, i) => i === idx ? { ...s, image_url: null } : s));
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: ExportFormat = "pptx") => {
    if (!presentation) return;
    setShowExportMenu(false);
    if (!isAdmin && !presentation.is_paid) {
      toast({ title: "Payment required", description: "₹20 per download. Payment integration coming soon!", variant: "destructive" });
    }
    setExporting(true);
    try {
      await exportPresentation(format, presentation.title, slides, presentation.template);
      toast({ title: `${format.toUpperCase()} downloaded!` });
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const slide = slides[currentSlide];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col cosmic-bg overflow-hidden">
      {/* Top toolbar */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-xl flex items-center px-4 gap-3 shrink-0 z-20">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1 rounded-md gradient-primary">
            <Presentation className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold font-display text-foreground truncate">{presentation?.title}</span>
          {isAdmin && (
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)} className="bg-secondary/30">
              <Palette className="h-4 w-4" /> Theme
            </Button>
            {showTemplates && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                <div className="absolute right-0 top-full mt-2 w-60 glass-card-strong rounded-xl shadow-2xl z-50 p-2">
                  {Object.values(templates).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => changeTemplate(t.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3",
                        presentation?.template === t.id ? "bg-primary/15 text-primary" : "hover:bg-secondary/50 text-foreground"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-md shrink-0", t.slideAccentBg)} />
                      <div>
                        <div className="font-medium text-sm">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground">{t.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={addSlide} className="bg-secondary/30">
            <Plus className="h-4 w-4" /> Slide
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSlideshowActive(true)} className="bg-secondary/30">
            <Play className="h-4 w-4" /> Present
          </Button>

          <Button variant="gradient" size="sm" onClick={handleExport} disabled={exporting} className="glow-purple-sm">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isAdmin ? "Export Free" : "Export PPTX"}
          </Button>

          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside
          className={cn(
            "w-56 border-r border-border bg-card/40 backdrop-blur-lg flex flex-col overflow-y-auto shrink-0 transition-transform",
            "fixed lg:relative z-40 h-[calc(100vh-3.5rem)] lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-3 space-y-2">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={cn(
                  "group relative rounded-xl border cursor-pointer transition-all overflow-hidden",
                  idx === currentSlide ? "border-primary glow-purple-sm" : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => { setCurrentSlide(idx); setSidebarOpen(false); }}
              >
                <div className="slide-preview w-full">
                  <SlideRenderer
                    slide={s}
                    templateId={presentation?.template || "business"}
                    slideIndex={idx}
                    totalSlides={slides.length}
                    className="w-full h-full text-[4px]"
                  />
                </div>
                <div className="absolute bottom-1 left-2 text-[10px] font-medium text-foreground/60 bg-card/80 backdrop-blur px-1.5 py-0.5 rounded">
                  {idx + 1}
                </div>
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, "up"); }} className="p-0.5 rounded bg-card/90 hover:bg-secondary shadow-sm">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  )}
                  {idx < slides.length - 1 && (
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, "down"); }} className="p-0.5 rounded bg-card/90 hover:bg-secondary shadow-sm">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )}
                  {slides.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }} className="p-0.5 rounded bg-card/90 hover:bg-destructive/20 shadow-sm">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addSlide} className="w-full slide-preview rounded-xl border border-dashed border-border/50 hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
            {slide && (
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="slide-preview w-full rounded-2xl shadow-2xl overflow-hidden relative glow-purple-sm">
                      <SlideRenderer
                        slide={slide}
                        templateId={presentation?.template || "business"}
                        slideIndex={currentSlide}
                        totalSlides={slides.length}
                        className="w-full h-full"
                      />
                      <div
                        className="absolute inset-0 flex flex-col justify-center group cursor-pointer"
                        onClick={() => {
                          setEditingTitle(true);
                          setEditTitle(slide.title);
                          setEditContent(slide.content.join("\n"));
                        }}
                      >
                        <div className="absolute inset-0 bg-transparent group-hover:bg-foreground/5 transition-colors rounded-2xl" />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs bg-card/90 backdrop-blur text-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-border/50">
                            <Pencil className="h-3 w-3" /> Click to edit
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image controls below slide */}
                    {currentSlide > 0 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateImageForSlide(currentSlide)}
                          disabled={generatingImage === slide.id}
                          className="bg-secondary/30"
                        >
                          {generatingImage === slide.id ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating image...</>
                          ) : slide.image_url ? (
                            <><RefreshCw className="h-4 w-4" /> Regenerate Image</>
                          ) : (
                            <><ImageIcon className="h-4 w-4" /> Generate Image</>
                          )}
                        </Button>
                        {slide.image_url && (
                          <Button variant="ghost" size="sm" onClick={() => removeImage(currentSlide)} className="text-muted-foreground">
                            <X className="h-4 w-4" /> Remove
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Speaker notes */}
          <div className="border-t border-border bg-card/40 backdrop-blur shrink-0">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-3 w-3" />
              Speaker Notes
              {showNotes ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronUp className="h-3 w-3 ml-auto" />}
            </button>
            {showNotes && slide && (
              <div className="px-4 pb-3">
                <Textarea
                  value={slide.speaker_notes || ""}
                  onChange={(e) => updateSlideLocal(currentSlide, { speaker_notes: e.target.value })}
                  placeholder="Add speaker notes..."
                  className="min-h-[60px] text-sm resize-none bg-secondary/30 border-border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingTitle && slide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setEditingTitle(false); }}>
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass-card-strong rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h3 className="font-semibold font-display text-foreground">Edit Slide {currentSlide + 1}</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-lg font-semibold bg-secondary/30 border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content (one bullet per line)</label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[140px] bg-secondary/30 border-border" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingTitle(false)}><X className="h-4 w-4" /> Cancel</Button>
              <Button variant="gradient" className="glow-purple-sm" onClick={() => {
                const newContent = editContent.split("\n").filter(Boolean);
                updateSlideLocal(currentSlide, { title: editTitle, content: newContent });
                setEditingTitle(false);
              }}><Check className="h-4 w-4" /> Save</Button>
            </div>
          </motion.div>
        </div>
      )}

      {slideshowActive && (
        <SlideshowMode
          slides={slides}
          templateId={presentation?.template || "business"}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
          onExit={() => setSlideshowActive(false)}
        />
      )}
    </div>
  );
}
