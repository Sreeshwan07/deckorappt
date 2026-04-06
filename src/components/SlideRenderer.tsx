import { cn } from "@/lib/utils";
import { templates, type TemplateConfig } from "@/lib/templates";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
}

interface SlideRendererProps {
  slide: SlideData;
  templateId: string;
  slideIndex: number;
  totalSlides: number;
  isTitle?: boolean;
  showWatermark?: boolean;
  scale?: number;
  onClick?: () => void;
  className?: string;
}

export default function SlideRenderer({
  slide,
  templateId,
  slideIndex,
  totalSlides,
  isTitle,
  showWatermark,
  scale,
  onClick,
  className,
}: SlideRendererProps) {
  const t = templates[templateId] || templates.business;
  const isTitleSlide = isTitle || slideIndex === 0;
  const bg = isTitleSlide ? t.slideAccentBg : t.slideBg;
  const titleClr = isTitleSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,100%)]" : t.titleColor;
  const textClr = isTitleSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,90%)]" : t.textColor;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden select-none",
        className
      )}
      style={scale ? { transform: `scale(${scale})`, transformOrigin: "top left" } : undefined}
    >
      <div className={cn("w-full h-full flex flex-col justify-center rounded-xl", bg)}>
        {/* Accent line at top */}
        {!isTitleSlide && (
          <div className={cn("absolute top-0 left-0 right-0 h-1", t.accentLine)} />
        )}

        <div className={cn("flex-1 flex flex-col justify-center", isTitleSlide ? "p-[8%] text-center items-center" : "p-[6%]")}>
          <h2 className={cn(
            "font-bold leading-tight mb-4",
            titleClr,
            isTitleSlide ? "text-[2.2em]" : "text-[1.6em]"
          )}>
            {slide.title}
          </h2>

          {slide.content.length > 0 && (
            <ul className={cn("space-y-2", isTitleSlide ? "mt-2" : "mt-3")}>
              {slide.content.map((bullet, i) => (
                <li key={i} className={cn("flex items-start gap-3", textClr, isTitleSlide ? "text-[1em] justify-center" : "text-[0.9em]")}>
                  {!isTitleSlide && (
                    <span className={cn("mt-[0.45em] w-[0.4em] h-[0.4em] rounded-full shrink-0", t.bulletColor)} />
                  )}
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Slide number */}
        <div className={cn("absolute bottom-3 right-5 text-[0.55em] opacity-40", textClr)}>
          {slideIndex + 1} / {totalSlides}
        </div>

        {/* Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[3em] font-bold opacity-[0.06] rotate-[-25deg] select-none text-foreground">
              PREVIEW
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
