import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
}

const templateStyles: Record<string, { bg: string; title: string; text: string; accent: string }> = {
  business: { bg: "bg-card", title: "text-primary", text: "text-foreground", accent: "border-l-4 border-primary" },
  minimal: { bg: "bg-card", title: "text-foreground", text: "text-muted-foreground", accent: "" },
  startup: { bg: "gradient-primary", title: "text-primary-foreground", text: "text-primary-foreground/80", accent: "" },
  tech: { bg: "bg-foreground", title: "text-primary-foreground", text: "text-primary-foreground/70", accent: "" },
  academic: { bg: "bg-card", title: "text-foreground", text: "text-foreground/80", accent: "border-b-4 border-primary" },
  creative: { bg: "bg-accent/10", title: "text-accent", text: "text-foreground", accent: "" },
};

export default function PreviewPresentation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

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
        content: Array.isArray(s.content) ? s.content as string[] : typeof s.content === "string" ? JSON.parse(s.content) : [],
      }))
    );
    setLoading(false);
  };

  const startEditing = (idx: number) => {
    const slide = slides[idx];
    setEditingSlide(idx);
    setEditTitle(slide.title);
    setEditContent(slide.content.join("\n"));
  };

  const saveEdit = async () => {
    if (editingSlide === null) return;
    const slide = slides[editingSlide];
    const newContent = editContent.split("\n").filter(Boolean);

    const { error } = await supabase
      .from("slides")
      .update({ title: editTitle, content: JSON.stringify(newContent) })
      .eq("id", slide.id);

    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
      return;
    }

    setSlides((prev) =>
      prev.map((s, i) => (i === editingSlide ? { ...s, title: editTitle, content: newContent } : s))
    );
    setEditingSlide(null);
  };

  const addSlide = async () => {
    if (!id) return;
    const order = slides.length;
    const { data, error } = await supabase
      .from("slides")
      .insert({ presentation_id: id, slide_order: order, title: "New Slide", content: JSON.stringify(["Add content here"]) })
      .select()
      .single();

    if (error || !data) return;
    setSlides([...slides, { ...data, content: ["Add content here"] }]);
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const style = templateStyles[presentation?.template || "business"];
  const slide = slides[currentSlide];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h2 className="text-lg font-semibold text-foreground truncate mx-4">{presentation?.title}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addSlide}>
              <Plus className="h-4 w-4" /> Add Slide
            </Button>
            <Button variant="gradient" size="sm" disabled={!presentation?.is_paid}>
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        {/* Slide preview */}
        {slide && (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "slide-preview rounded-2xl shadow-lg overflow-hidden relative flex flex-col justify-center p-8 md:p-16",
                  style.bg,
                  style.accent
                )}
              >
                {/* Watermark */}
                {!presentation?.is_paid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-6xl font-bold text-foreground/5 rotate-[-30deg] select-none">
                      PREVIEW
                    </span>
                  </div>
                )}

                {editingSlide === currentSlide ? (
                  <div className="space-y-4 relative z-20">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-bold"
                    />
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[120px]"
                      placeholder="One bullet per line"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}><Check className="h-4 w-4" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSlide(null)}><X className="h-4 w-4" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-20">
                    <h3 className={cn("text-2xl md:text-4xl font-bold mb-6", style.title)}>
                      {slide.title}
                    </h3>
                    <ul className="space-y-3">
                      {slide.content.map((bullet, i) => (
                        <li key={i} className={cn("text-base md:text-lg flex items-start gap-3", style.text)}>
                          <span className="mt-2 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Slide number */}
                <div className="absolute bottom-4 right-6 text-xs text-muted-foreground/40">
                  {currentSlide + 1} / {slides.length}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur shadow hover:bg-card transition disabled:opacity-30"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(currentSlide - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur shadow hover:bg-card transition disabled:opacity-30"
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide(currentSlide + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Slide strip */}
        <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "flex-shrink-0 w-40 rounded-lg border-2 p-3 text-left transition-all group relative",
                idx === currentSlide ? "border-primary shadow-md" : "border-border hover:border-primary/30"
              )}
            >
              <p className="text-xs font-semibold text-foreground truncate">{s.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Slide {idx + 1}</p>

              {/* Hover actions */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); startEditing(idx); }} className="p-1 rounded bg-card hover:bg-muted">
                  <Pencil className="h-3 w-3" />
                </button>
                {slides.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }} className="p-1 rounded bg-card hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Speaker notes */}
        {slide?.speaker_notes && (
          <div className="mt-4 p-4 bg-muted rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Speaker Notes</p>
            <p className="text-sm text-foreground">{slide.speaker_notes}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
