import pptxgenjs from "pptxgenjs";
import { templates } from "@/lib/templates";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
  image_url?: string | null;
}

export async function exportToPptx(
  presentationTitle: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  const t = templates[templateId] || templates.business;
  const pptx = new pptxgenjs();

  pptx.layout = "LAYOUT_WIDE";
  pptx.title = presentationTitle;

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx];
    const pptSlide = pptx.addSlide();
    const isTitleSlide = idx === 0;
    const hasImage = !!slide.image_url && !isTitleSlide;

    pptSlide.background = { color: t.exportBg.replace("#", "") };

    if (!isTitleSlide) {
      pptSlide.addShape(pptxgenjs.ShapeType.rect, {
        x: 0, y: 0, w: "100%", h: 0.06,
        fill: { color: t.exportAccentColor.replace("#", "") },
      });
    }

    const textWidth = hasImage ? 7.5 : (isTitleSlide ? 11.33 : 11.73);

    // Title
    pptSlide.addText(slide.title, {
      x: isTitleSlide ? 1 : 0.8,
      y: isTitleSlide ? 2.0 : 0.6,
      w: textWidth,
      h: 1.2,
      fontSize: isTitleSlide ? 36 : 28,
      fontFace: t.fontFamily,
      color: t.exportTitleColor.replace("#", ""),
      bold: true,
      align: isTitleSlide ? "center" : "left",
      valign: "middle",
    });

    // Content
    if (slide.content.length > 0) {
      const bulletText = slide.content.map((b) => {
        const isExample = b.startsWith("Example:");
        const isParagraph = b.length > 120 && !isExample;
        return {
          text: b,
          options: {
            fontSize: isTitleSlide ? 18 : (isParagraph ? 14 : 15),
            color: isExample ? "B8860B" : t.exportTextColor.replace("#", ""),
            italic: isExample,
            bullet: isTitleSlide || isParagraph ? false : { code: "25CF", color: t.exportAccentColor.replace("#", "") },
            paraSpaceBefore: isParagraph || isExample ? 10 : 6,
            paraSpaceAfter: 4,
            align: isTitleSlide ? ("center" as const) : ("left" as const),
          },
        };
      });

      pptSlide.addText(bulletText as any, {
        x: isTitleSlide ? 2 : 1.2,
        y: isTitleSlide ? 3.4 : 1.8,
        w: hasImage ? 6.5 : (isTitleSlide ? 9.33 : 11.13),
        h: isTitleSlide ? 2.5 : 5.0,
        fontFace: t.fontFamily,
        valign: "top",
      });
    }

    // Image
    if (hasImage && slide.image_url) {
      try {
        pptSlide.addImage({
          data: slide.image_url,
          x: 8.5,
          y: 1.0,
          w: 4.5,
          h: 5.0,
          rounding: true,
        });
      } catch (e) {
        console.warn("Failed to add image to slide", idx, e);
      }
    }

    // Speaker notes
    if (slide.speaker_notes) {
      pptSlide.addNotes(slide.speaker_notes);
    }

    // Slide number
    pptSlide.addText(`${idx + 1} / ${slides.length}`, {
      x: 11.5, y: 7.0, w: 1.5, h: 0.4,
      fontSize: 10,
      color: t.exportTextColor.replace("#", ""),
      align: "right",
      transparency: 50,
    });
  }

  await pptx.writeFile({ fileName: `${presentationTitle}.pptx` });
}

export async function exportToPdf(
  presentationTitle: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  await exportToPptx(presentationTitle, slides, templateId);
}
