import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SlideRenderer from "@/components/SlideRenderer";
import { templates } from "@/lib/templates";
import { exportToPptx } from "@/lib/export";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Loader2,
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  FileDown,
  Presentation,
  Palette,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Slide {
  id: string;
  slide_order: number;
  title: string;
  content: string[];
  speaker_notes: string | null;
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
  const { signOut, user } = useAuth();
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      (slidesResult.data || []).map((s) => ({
        ...s,
        content: Array.isArray(s.content)
          ? (s.content as string[])
          : typeof s.content === "string"
          ? JSON.parse(s.content)
          : [],
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
    },
    []
  );

  const updateSlideLocal = (idx: number, updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
    const slide = slides[idx];
    if (slide) autoSave(slide.id, updates);
  };

  const addSlide = async () => {
    if (!id) return;
    const order = slides.length;
    const { data, error } = await supabase
      .from("slides")
      .insert({
        presentation_id: id,
        slide_order: order,
        title: "New Slide",
        content: JSON.stringify(["Add your content here"]),
      })
      .select()
      .single();

    if (error || !data) return;
    setSlides([...slides, { ...data, content: ["Add your content here"] }]);
    setCurrentSlide(order);
  };

  const deleteSlide = async (idx: number) => {
    if (slides.length <= 1) return;
    const slide = slides[idx];
    await supabase.from("slides").delete().eq("id", slide.id);
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

    // Save reorder
    await Promise.all(
      newSlides.map((s, i) =>
        supabase.from("slides").update({ slide_order: i }).eq("id", s.id)
      )
    );
  };

  const changeTemplate = async (templateId: string) => {
    if (!presentation) return;
    await supabase.from("presentations").update({ template: templateId }).eq("id", presentation.id);
    setPresentation({ ...presentation, template: templateId });
    setShowTemplates(false);
    toast({ title: `Template changed to ${templates[templateId]?.name}` });
  };

  const handleExport = async () => {
    if (!presentation) return;
    setExporting(true);
    try {
      await exportToPptx(presentation.title, slides, presentation.template);
      toast({ title: "PPTX downloaded!" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const slide = slides[currentSlide];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top toolbar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0 z-20">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Presentation className="h-5 w-5 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate">{presentation?.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Template switcher */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
              <Palette className="h-4 w-4" /> Theme
            </Button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-2">
                {Object.values(templates).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTemplate(t.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      presentation?.template === t.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded", t.slideAccentBg)} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={addSlide}>
            <Plus className="h-4 w-4" /> Slide
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export PPTX
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: slide thumbnails */}
        <aside
          className={cn(
            "w-56 border-r border-border bg-card flex flex-col overflow-y-auto shrink-0 transition-all",
            sidebarOpen ? "translate-x-0" : "-translate-x-full absolute z-10 h-full lg:translate-x-0 lg:relative"
          )}
        >
          <div className="p-3 space-y-2">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={cn(
                  "group relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden",
                  idx === currentSlide ? "border-primary shadow-md" : "border-transparent hover:border-primary/30"
                )}
                onClick={() => setCurrentSlide(idx)}
              >
                {/* Mini thumbnail */}
                <div className="slide-preview w-full">
                  <SlideRenderer
                    slide={s}
                    templateId={presentation?.template || "business"}
                    slideIndex={idx}
                    totalSlides={slides.length}
                    className="w-full h-full text-[4px]"
                  />
                </div>

                {/* Slide number overlay */}
                <div className="absolute bottom-1 left-2 text-[10px] font-medium text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded">
                  {idx + 1}
                </div>

                {/* Hover actions */}
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSlide(idx, "up"); }}
                      className="p-0.5 rounded bg-card/90 hover:bg-muted shadow-sm"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  )}
                  {idx < slides.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSlide(idx, "down"); }}
                      className="p-0.5 rounded bg-card/90 hover:bg-muted shadow-sm"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )}
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                      className="p-0.5 rounded bg-card/90 hover:bg-destructive/10 shadow-sm"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addSlide}
              className="w-full slide-preview rounded-lg border-2 border-dashed border-border hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto bg-muted/50">
            {slide && (
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Editable slide */}
                    <div className="slide-preview w-full rounded-2xl shadow-2xl overflow-hidden relative">
                      <SlideRenderer
                        slide={slide}
                        templateId={presentation?.template || "business"}
                        slideIndex={currentSlide}
                        totalSlides={slides.length}
                        showWatermark={!presentation?.is_paid}
                        className="w-full h-full"
                      />

                      {/* Click-to-edit overlay */}
                      <div className="absolute inset-0 flex flex-col justify-center group cursor-text"
                        onClick={() => {
                          setEditingTitle(true);
                          setEditTitle(slide.title);
                          setEditContent(slide.content.join("\n"));
                        }}
                      >
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors rounded-2xl" />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs bg-card/90 text-foreground px-2 py-1 rounded-full shadow flex items-center gap-1">
                            <Pencil className="h-3 w-3" /> Click to edit
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bottom: speaker notes */}
          <div className="border-t border-border bg-card shrink-0">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNotes ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              Speaker Notes
            </button>
            {showNotes && slide && (
              <div className="px-4 pb-3">
                <Textarea
                  value={slide.speaker_notes || ""}
                  onChange={(e) => updateSlideLocal(currentSlide, { speaker_notes: e.target.value })}
                  placeholder="Add speaker notes..."
                  className="min-h-[60px] text-sm resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline edit modal */}
      {editingTitle && slide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTitle(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Edit Slide {currentSlide + 1}</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content (one bullet per line)</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[140px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingTitle(false)}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  const newContent = editContent.split("\n").filter(Boolean);
                  updateSlideLocal(currentSlide, { title: editTitle, content: newContent });
                  setEditingTitle(false);
                }}
              >
                <Check className="h-4 w-4" /> Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
