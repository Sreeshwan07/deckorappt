import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideRenderer from "@/components/SlideRenderer";
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

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="w-full h-full max-w-[100vw] max-h-[100vh] aspect-video" style={{ fontSize: "clamp(24px, 2.4vw, 44px)" }}>
            <SlideRenderer
              slide={slides[currentSlide]}
              templateId={templateId}
              slideIndex={currentSlide}
              totalSlides={slides.length}
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls - auto-hide */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="p-2 rounded-full bg-white/10 backdrop-blur text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <span className="text-white/60 text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </span>

        <button
          onClick={goNext}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-full bg-white/10 backdrop-blur text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <button
        onClick={onExit}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors opacity-0 hover:opacity-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
