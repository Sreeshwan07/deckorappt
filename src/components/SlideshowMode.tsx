import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideRenderer from "@/components/SlideRenderer";
import { useFitScale } from "@/hooks/use-fit-scale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
  image_url?: string | null;
}

interface SlideshowModeProps {
  slides: SlideData[];
  templateId: string;
  currentSlide: number;
  onSlideChange: (idx: number) => void;
  onExit: () => void;
}

// Base canvas — true 16:9. Scales to fit any viewport without overflow.
const BASE_W = 1920;
const BASE_H = 1080;

export default function SlideshowMode({ slides, templateId, currentSlide, onSlideChange, onExit }: SlideshowModeProps) {
  const goNext = useCallback(() => {
    if (currentSlide < slides.length - 1) onSlideChange(currentSlide + 1);
  }, [currentSlide, slides.length, onSlideChange]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) onSlideChange(currentSlide - 1);
  }, [currentSlide, onSlideChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onExit]);

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { document.exitFullscreen?.().catch(() => {}); };
  }, []);

  const { containerRef, scale } = useFitScale(BASE_W, BASE_H);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: BASE_W,
              height: BASE_H,
              marginLeft: -BASE_W / 2,
              marginTop: -BASE_H / 2,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              fontSize: 38,
            }}
          >
            <SlideRenderer
              slide={slides[currentSlide]}
              templateId={templateId}
              slideIndex={currentSlide}
              totalSlides={slides.length}
              className="w-full h-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
        <button onClick={goPrev} disabled={currentSlide === 0}
          className="p-2 rounded-full bg-white/10 backdrop-blur text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-white/60 text-sm font-medium">{currentSlide + 1} / {slides.length}</span>
        <button onClick={goNext} disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-full bg-white/10 backdrop-blur text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <button onClick={onExit}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
