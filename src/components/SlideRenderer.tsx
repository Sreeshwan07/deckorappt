import { memo } from "react";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/templates";
import { useAutoShrink } from "@/hooks/use-fit-scale";

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
  const cleanTitle = (slide.title || "")
    .replace(/[\p{Extended_Pictographic}\u2600-\u27BF\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[*_~`#>•●◆◇★☆✦✧✨➤➣➜→←↔»«]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const isThankYou = cleanTitle.toLowerCase().includes("thank you");
  const isCenteredSlide = isTitleSlide || isThankYou;
  const bg = isCenteredSlide ? t.slideAccentBg : t.slideBg;
  const titleClr = isCenteredSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,100%)]" : t.titleColor;
  const textClr = isCenteredSlide && t.slideAccentBg !== t.slideBg ? "text-[hsl(0,0%,90%)]" : t.textColor;
  const hasImage = !!slide.image_url && !isCenteredSlide;

  // Auto-shrink wrapper: scales down font when content would overflow the slide box.
  const { ref: fitRef } = useAutoShrink<HTMLDivElement>(
    [cleanTitle, slide.content?.join("|"), hasImage, isCenteredSlide],
    { min: 0.55, max: 1, step: 0.05 }
  );

  return (
    <div
      onClick={onClick}
      className={cn("relative overflow-hidden select-none", className)}
    >
      <div className={cn("w-full h-full flex flex-col rounded-xl overflow-hidden", bg)}>
        {!isCenteredSlide && (
          <div className={cn("absolute top-0 left-0 right-0 h-1 z-10", t.accentLine)} />
        )}

        <div
          ref={fitRef}
          style={{ fontSize: "calc(1em * var(--auto-fs, 1))" }}
          className={cn(
            "flex-1 flex w-full h-full overflow-hidden",
            hasImage ? "flex-row" : "flex-col justify-center",
            isCenteredSlide ? "p-[6%] text-center items-center justify-center flex-col" : "p-[5%]"
          )}
        >
          <div className={cn(
            "flex flex-col justify-center min-w-0 min-h-0",
            hasImage ? "flex-1 pr-[4%]" : "w-full"
          )}>
            <h2 className={cn(
              "font-bold leading-[1.15] mb-[0.5em] tracking-tight break-words",
              titleClr,
              isCenteredSlide ? "text-[3.2em]" : "text-[2.4em]"
            )}>
              {cleanTitle}
            </h2>

            {slide.content.length > 0 && (
              <ul className={cn("space-y-[0.6em] min-h-0", isCenteredSlide && "mt-[0.4em]")}>
                {slide.content.map((bullet, i) => {
                  const isExample = bullet.startsWith("Example:");
                  const isFormula = bullet.startsWith("Formula:") || bullet.startsWith("Equation:");
                  const isDefinition = bullet.startsWith("Definition:");
                  const isParagraph = bullet.length > 120 && !isExample && !isFormula;
                  return (
                    <li key={i} className={cn(
                      "flex items-start gap-[0.6em] font-medium break-words",
                      textClr,
                      isCenteredSlide ? "text-[1.35em] justify-center leading-relaxed" : "text-[1.2em] leading-[1.5]",
                      isExample && "italic opacity-90",
                      isFormula && "font-mono text-center justify-center text-[1.05em]",
                    )}>
                      {!isCenteredSlide && !isFormula && (
                        <span className={cn(
                          "mt-[0.55em] w-[0.35em] h-[0.35em] rounded-full shrink-0",
                          isExample ? "bg-amber-400" : isDefinition ? "bg-emerald-400" : t.bulletColor
                        )} />
                      )}
                      <span className={cn(
                        "min-w-0",
                        isFormula && "px-[6%] py-[0.2em] rounded bg-black/5 w-full text-center"
                      )}>{bullet}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasImage && (
            <div className="w-[38%] shrink-0 flex items-center justify-center min-h-0">
              <img
                src={slide.image_url!}
                alt={slide.title}
                className="max-w-full max-h-full rounded-lg object-cover shadow-lg"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className={cn("absolute bottom-3 right-5 text-[0.5em] opacity-30 z-10", textClr)}>
          {slideIndex + 1} / {totalSlides}
        </div>
      </div>
    </div>
  );
}

const SlideRenderer = memo(SlideRendererBase);
export default SlideRenderer;
