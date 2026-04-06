import pptxgenjs from "pptxgenjs";
import { templates } from "@/lib/templates";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
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

  slides.forEach((slide, idx) => {
    const pptSlide = pptx.addSlide();
    const isTitleSlide = idx === 0;

    pptSlide.background = { color: t.exportBg.replace("#", "") };

    if (!isTitleSlide) {
      // Accent line at top
      pptSlide.addShape(pptxgenjs.ShapeType.rect, {
        x: 0, y: 0, w: "100%", h: 0.06,
        fill: { color: t.exportAccentColor.replace("#", "") },
      });
    }

    // Title
    pptSlide.addText(slide.title, {
      x: isTitleSlide ? 1 : 0.8,
      y: isTitleSlide ? 2.0 : 0.6,
      w: isTitleSlide ? 11.33 : 11.73,
      h: 1.2,
      fontSize: isTitleSlide ? 36 : 28,
      fontFace: t.fontFamily,
      color: t.exportTitleColor.replace("#", ""),
      bold: true,
      align: isTitleSlide ? "center" : "left",
      valign: "middle",
    });

    // Bullets
    if (slide.content.length > 0) {
      const bulletText = slide.content.map((b) => ({
        text: b,
        options: {
          fontSize: isTitleSlide ? 18 : 16,
          color: t.exportTextColor.replace("#", ""),
          bullet: isTitleSlide ? false : { code: "25CF", color: t.exportAccentColor.replace("#", "") },
          paraSpaceBefore: 8,
          paraSpaceAfter: 4,
          align: isTitleSlide ? ("center" as const) : ("left" as const),
        },
      }));

      pptSlide.addText(bulletText as any, {
        x: isTitleSlide ? 2 : 1.2,
        y: isTitleSlide ? 3.4 : 2.0,
        w: isTitleSlide ? 9.33 : 11.13,
        h: isTitleSlide ? 2.5 : 4.5,
        fontFace: t.fontFamily,
        valign: "top",
      });
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
  });

  await pptx.writeFile({ fileName: `${presentationTitle}.pptx` });
}

export async function exportToPdf(
  presentationTitle: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  // For PDF, we generate PPTX and let user convert, or use a simple approach
  // For now, export as PPTX (true PDF would need a server-side converter)
  await exportToPptx(presentationTitle, slides, templateId);
}
