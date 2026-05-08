import { memo } from "react";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/templates";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
  image_url?: string | null;
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

function SlideRendererBase({
  slide,
  templateId,
  slideIndex,
  totalSlides,
  isTitle,
  onClick,
  className,
}: SlideRendererProps) {
  const t = templates[templateId] || templates.business;
  const isTitleSlide = isTitle || slideIndex === 0;
  const isThankYou = slide.title.toLowerCase().includes("thank you");
  const isCenteredSlide = isTitleSlide || isThankYou;
  const bg = isCenteredSlide ? t.slideAccentBg : t.slideBg;
  const titleClr = isCenteredSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,100%)]" : t.titleColor;
  const textClr = isCenteredSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,90%)]" : t.textColor;
  const hasImage = !!slide.image_url && !isCenteredSlide;

  return (
    <div
      onClick={onClick}
      className={cn("relative overflow-hidden select-none", className)}
    >
      <div className={cn("w-full h-full flex flex-col justify-center rounded-xl", bg)}>
        {!isCenteredSlide && (
          <div className={cn("absolute top-0 left-0 right-0 h-1", t.accentLine)} />
        )}

        <div className={cn(
          "flex-1 flex",
          hasImage ? "flex-row" : "flex-col justify-center",
          isCenteredSlide ? "p-[8%] text-center items-center flex-col" : "p-[6%]"
        )}>
          <div className={cn(hasImage ? "flex-1 flex flex-col justify-center pr-[4%]" : "w-full")}>
            <h2 className={cn(
              "font-bold leading-[1.15] mb-6 tracking-tight",
              titleClr,
              isCenteredSlide ? "text-[3.2em]" : "text-[2.4em]"
            )}>
              {slide.title}
            </h2>

            {slide.content.length > 0 && (
              <ul className={cn("space-y-4", isCenteredSlide ? "mt-6" : "mt-4")}>
                {slide.content.map((bullet, i) => {
                  const isExample = bullet.startsWith("Example:");
                  const isFormula = bullet.startsWith("Formula:") || bullet.startsWith("Equation:");
                  const isDefinition = bullet.startsWith("Definition:");
                  const isParagraph = bullet.length > 120 && !isExample && !isFormula;
                  const isKeyword = bullet.startsWith("**") || bullet.includes(": ");
                  return (
                    <li key={i} className={cn(
                      "flex items-start gap-3",
                      textClr,
                      isCenteredSlide ? "text-[1.35em] justify-center leading-relaxed" : "text-[1.15em] leading-[1.55]",
                      isExample && "mt-2 italic opacity-90",
                      isFormula && "mt-3 font-mono text-center justify-center text-[1.2em]",
                      isDefinition && "mt-1 font-medium",
                      isParagraph && "mt-2"
                    )}>
                      {!isCenteredSlide && !isParagraph && !isFormula && (
                        <span className={cn(
                          "mt-[0.5em] w-[0.38em] h-[0.38em] rounded-full shrink-0",
                          isExample ? "bg-amber-400" : isDefinition ? "bg-emerald-400" : t.bulletColor
                        )} />
                      )}
                      <span className={cn(
                        isKeyword && "font-medium",
                        isFormula && "px-[8%] py-1 rounded bg-black/5 w-full text-center"
                      )}>{bullet}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasImage && (
            <div className="w-[40%] shrink-0 flex items-center justify-center">
              <img
                src={slide.image_url!}
                alt={slide.title}
                className="w-full h-auto max-h-full rounded-lg object-cover shadow-lg"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className={cn("absolute bottom-3 right-5 text-[0.55em] opacity-30", textClr)}>
          {slideIndex + 1} / {totalSlides}
        </div>
      </div>
    </div>
  );
}

const SlideRenderer = memo(SlideRendererBase);
export default SlideRenderer;
