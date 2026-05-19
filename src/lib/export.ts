import pptxgenjs from "pptxgenjs";
import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import { templates } from "@/lib/templates";

interface SlideData {
  title: string;
  content: string[];
  speaker_notes?: string | null;
  image_url?: string | null;
}

export type ExportFormat = "pptx" | "pdf" | "docx";

/** Sanitize a presentation title into a safe filename stem. */
export function sanitizeFilename(name: string): string {
  return (name || "presentation")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80) || "presentation";
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    if (url.startsWith("data:")) return url;
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* PPTX                                                                */
/* ------------------------------------------------------------------ */
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
    const isThankYou = slide.title.toLowerCase().includes("thank you");
    const isCenteredSlide = isTitleSlide || isThankYou;
    const hasImage = !!slide.image_url && !isCenteredSlide;

    pptSlide.background = { color: t.exportBg.replace("#", "") };

    if (!isCenteredSlide) {
      pptSlide.addShape(pptxgenjs.ShapeType.rect, {
        x: 0, y: 0, w: "100%", h: 0.06,
        fill: { color: t.exportAccentColor.replace("#", "") },
        line: { color: t.exportAccentColor.replace("#", ""), width: 0 },
      });
    }

    const textWidth = hasImage ? 7.3 : (isCenteredSlide ? 11.33 : 11.73);

    pptSlide.addText(slide.title, {
      x: isCenteredSlide ? 1 : 0.8,
      y: isCenteredSlide ? 2.0 : 0.55,
      w: textWidth,
      h: 1.3,
      fontSize: isCenteredSlide ? 40 : 32,
      fontFace: t.fontFamily,
      color: t.exportTitleColor.replace("#", ""),
      bold: true,
      align: isCenteredSlide ? "center" : "left",
      valign: "middle",
    });

    if (slide.content.length > 0) {
      const bulletText = slide.content.map((b) => {
        const isExample = b.startsWith("Example:");
        const isFormula = b.startsWith("Formula:") || b.startsWith("Equation:");
        const isParagraph = b.length > 120 && !isExample && !isFormula;
        return {
          text: b,
          options: {
            fontSize: isCenteredSlide ? 20 : (isParagraph ? 16 : 18),
            color: isExample ? "B8860B" : t.exportTextColor.replace("#", ""),
            italic: isExample,
            bold: isFormula,
            bullet: isCenteredSlide || isParagraph || isFormula
              ? false
              : { code: "25CF", color: t.exportAccentColor.replace("#", "") },
            paraSpaceBefore: 6,
            paraSpaceAfter: 6,
            align: (isCenteredSlide || isFormula ? "center" : "left") as "center" | "left",
          },
        };
      });
      pptSlide.addText(bulletText as any, {
        x: isCenteredSlide ? 2 : 1.0,
        y: isCenteredSlide ? 3.4 : 1.9,
        w: hasImage ? 6.5 : (isCenteredSlide ? 9.33 : 11.33),
        h: isCenteredSlide ? 3.0 : 5.0,
        fontFace: t.fontFamily,
        valign: "top",
      });
    }

    if (hasImage && slide.image_url) {
      const data = await urlToBase64(slide.image_url);
      if (data) {
        try {
          pptSlide.addImage({ data, x: 8.3, y: 1.2, w: 4.7, h: 4.8, sizing: { type: "contain", w: 4.7, h: 4.8 } });
        } catch {/* skip */}
      }
    }

    if (slide.speaker_notes) pptSlide.addNotes(slide.speaker_notes);

    pptSlide.addText(`${idx + 1} / ${slides.length}`, {
      x: 11.5, y: 7.0, w: 1.5, h: 0.4,
      fontSize: 10, color: t.exportTextColor.replace("#", ""),
      align: "right", transparency: 50,
    });
  }

  await pptx.writeFile({ fileName: `${sanitizeFilename(presentationTitle)}.pptx` });
}

/* ------------------------------------------------------------------ */
/* PDF — renders each on-screen slide via html2canvas for fidelity     */
/* ------------------------------------------------------------------ */
export async function exportToPdf(
  presentationTitle: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { default: SlideRenderer } = await import("@/components/SlideRenderer");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");

  // Off-screen 1920x1080 staging
  const stage = document.createElement("div");
  stage.style.cssText = "position:fixed;left:-99999px;top:0;width:1920px;height:1080px;font-size:32px;";
  document.body.appendChild(stage);
  const root = createRoot(stage);

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080] });

  try {
    for (let i = 0; i < slides.length; i++) {
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(SlideRenderer, {
            slide: slides[i],
            templateId,
            slideIndex: i,
            totalSlides: slides.length,
            className: "w-[1920px] h-[1080px]",
          })
        );
        // wait a frame for layout + images
        setTimeout(resolve, slides[i].image_url ? 500 : 120);
      });

      const canvas = await html2canvas(stage, { scale: 1, backgroundColor: null, useCORS: true, logging: false });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage([1920, 1080], "landscape");
      pdf.addImage(img, "JPEG", 0, 0, 1920, 1080, undefined, "FAST");
    }
    pdf.save(`${sanitizeFilename(presentationTitle)}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(stage);
  }
}

/* ------------------------------------------------------------------ */
/* DOCX — structured handout                                           */
/* ------------------------------------------------------------------ */
export async function exportToDocx(
  presentationTitle: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  const t = templates[templateId] || templates.business;
  const titleColor = t.exportTitleColor.replace("#", "");
  const textColor = t.exportTextColor.replace("#", "");
  const accentColor = t.exportAccentColor.replace("#", "");

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: presentationTitle,
          bold: true,
          size: 56,
          color: titleColor,
          font: t.fontFamily,
        }),
      ],
    }),
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];

    children.push(
      new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({ text: `Slide ${i + 1}`, size: 18, color: accentColor, bold: true, font: t.fontFamily }),
        ],
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: s.title, bold: true, size: 36, color: titleColor, font: t.fontFamily }),
        ],
      })
    );

    if (s.image_url) {
      const data = await urlToBase64(s.image_url);
      if (data && data.startsWith("data:image/")) {
        try {
          const m = data.match(/^data:image\/(\w+);base64,(.+)$/);
          if (m) {
            const ext = m[1].toLowerCase();
            const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
            const type = (ext === "jpg" ? "jpeg" : ext) as "png" | "jpeg" | "gif" | "bmp";
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new ImageRun({
                    type,
                    data: bin,
                    transformation: { width: 400, height: 260 },
                  }) as any,
                ],
              })
            );
          }
        } catch {/* skip image */}
      }
    }

    for (const b of s.content) {
      const isExample = b.startsWith("Example:");
      const isFormula = b.startsWith("Formula:") || b.startsWith("Equation:");
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          bullet: isFormula ? undefined : { level: 0 },
          alignment: isFormula ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: b,
              size: 24,
              italics: isExample,
              bold: isFormula,
              color: isExample ? "B8860B" : textColor,
              font: isFormula ? "Consolas" : t.fontFamily,
            }),
          ],
        })
      );
    }

    if (s.speaker_notes) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 200 },
          children: [
            new TextRun({ text: "Speaker notes: ", bold: true, size: 20, color: accentColor, font: t.fontFamily }),
            new TextRun({ text: s.speaker_notes, italics: true, size: 20, color: textColor, font: t.fontFamily }),
          ],
        })
      );
    }

    if (i < slides.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  const doc = new Document({
    creator: "Deckora",
    title: presentationTitle,
    styles: { default: { document: { run: { font: t.fontFamily, size: 24 } } } },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(presentationTitle)}.docx`);
}

/* ------------------------------------------------------------------ */
/* Unified entry                                                       */
/* ------------------------------------------------------------------ */
export async function exportPresentation(
  format: ExportFormat,
  title: string,
  slides: SlideData[],
  templateId: string
): Promise<void> {
  if (format === "pdf") return exportToPdf(title, slides, templateId);
  if (format === "docx") return exportToDocx(title, slides, templateId);
  return exportToPptx(title, slides, templateId);
}
