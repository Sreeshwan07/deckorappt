import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SlideRenderer from "@/components/SlideRenderer";
import SlideshowMode from "@/components/SlideshowMode";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";

interface Slide {
  id: string;
  slide_order: number;
  title: string;
  content: string[];
  speaker_notes: string | null;
  image_url: string | null;
}

interface PresData {
  id: string;
  title: string;
  template: string;
  topic: string;
}

export default function SharedPresentation() {
  const { token } = useParams<{ token: string }>();
  const [pres, setPres] = useState<PresData | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [slideshow, setSlideshow] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: presData, error: presErr } = await supabase
        .from("presentations")
        .select("id, title, template, topic")
        .eq("share_token", token)
        .eq("is_public", true)
        .maybeSingle();
      if (presErr || !presData) {
        setError("This link is invalid, expired, or no longer public.");
        setLoading(false);
        return;
      }
      const { data: slidesData } = await supabase
        .from("slides")
        .select("*")
        .eq("presentation_id", presData.id)
        .order("slide_order");
      setPres(presData);
      setSlides(
        (slidesData || []).map((s: any) => ({
          ...s,
          content: Array.isArray(s.content) ? s.content : typeof s.content === "string" ? JSON.parse(s.content) : [],
        }))
      );
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pres) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center cosmic-bg p-6 text-center">
        <BrandLogo className="text-2xl mb-4" />
        <h1 className="text-xl font-display font-semibold mb-2">Link unavailable</h1>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Link to="/"><Button variant="outline">Go home</Button></Link>
      </div>
    );
  }

  if (slideshow) {
    return (
      <SlideshowMode
        slides={slides}
        templateId={pres.template}
        startIndex={current}
        onExit={() => setSlideshow(false)}
      />
    );
  }

  const slide = slides[current];

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <header className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo className="text-lg" />
            <span className="text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground hidden sm:inline">
              Shared view
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[200px]">{pres.title}</span>
            <Button size="sm" variant="gradient" onClick={() => setSlideshow(true)} className="glow-purple-sm">
              <Play className="h-4 w-4" /> Present
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 gap-4">
        <div className="w-full max-w-5xl aspect-video bg-card rounded-xl overflow-hidden border border-border shadow-2xl">
          {slide && (
            <SlideRenderer
              slide={{ title: slide.title, content: slide.content, image_url: slide.image_url }}
              templateId={pres.template}
              slideIndex={current}
              totalSlides={slides.length}
              className="w-full h-full"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono-cy text-muted-foreground tabular-nums">
            {current + 1} / {slides.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))}
            disabled={current >= slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground/60">
          Read-only · Created with Deckora
        </p>
      </main>
    </div>
  );
}
