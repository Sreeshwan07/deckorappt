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

/** Sanitize only filesystem-illegal chars. Keep spaces and topic readability.
 *  e.g. "Machine Learning"  →  "Machine Learning.pptx"
 */
export function sanitizeFilename(name: string): string {
  const cleaned = (name || "presentation")
    .trim()
    .replace(/[\\/:*?"<>|\x00-\x1F]+/g, "") // illegal chars only
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();
  return cleaned || "presentation";
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
  if (!slides || slides.length === 0) throw new Error("No slides to export");

  const t = templates[templateId] || templates["executive-modern"] || templates.business;
  const pptx = new pptxgenjs();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.title = presentationTitle || "Presentation";
  pptx.author = "Deckora";
  pptx.company = "Deckora";

  const hexBg = (t.exportBg || "#FFFFFF").replace("#", "");
  const hexAccent = (t.exportAccentColor || "#F97316").replace("#", "");
  const hexTitle = (t.exportTitleColor || "#0F172A").replace("#", "");
  const hexText = (t.exportTextColor || "#1F2937").replace("#", "");
  const fontFamily = t.fontFamily || "Calibri";

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx];
    const pptSlide = pptx.addSlide();
    const title = (slide.title || `Slide ${idx + 1}`).toString();
    const isTitleSlide = idx === 0;
    const isThankYou = title.toLowerCase().includes("thank you");
    const isCenteredSlide = isTitleSlide || isThankYou;
    const hasImage = !!slide.image_url && !isCenteredSlide;

    pptSlide.background = { color: hexBg };

    if (!isCenteredSlide) {
      // Use string shape name — avoids `pptxgenjs.ShapeType` access issues in some bundlers.
      pptSlide.addShape("rect" as any, {
        x: 0, y: 0, w: 13.33, h: 0.08,
        fill: { color: hexAccent },
        line: { color: hexAccent, width: 0 },
      });
    }

    const textWidth = hasImage ? 7.3 : (isCenteredSlide ? 11.33 : 11.73);

    pptSlide.addText(title, {
      x: isCenteredSlide ? 1 : 0.8,
      y: isCenteredSlide ? 2.0 : 0.4,
      w: textWidth,
      h: 1.4,
      fontSize: isCenteredSlide ? 52 : 38,
      fontFace: fontFamily,
      color: hexTitle,
      bold: true,
      align: isCenteredSlide ? "center" : "left",
      valign: "middle",
    });

    const body = (slide.content || []).filter((b) => b && b.toString().trim()).slice(0, 6);
    if (body.length > 0) {
      const sizeForCount = body.length <= 3 ? 24 : body.length <= 4 ? 22 : body.length <= 5 ? 20 : 18;

      // CRITICAL: each item must set breakLine:true (except the last) so pptxgenjs
      // emits separate paragraphs — otherwise bullets/align/spacing collapse.
      const bulletText = body.map((raw, i) => {
        const b = raw.toString();
        const isExample = b.startsWith("Example:");
        const isFormula = b.startsWith("Formula:") || b.startsWith("Equation:");
        const isParagraph = b.length > 120 && !isExample && !isFormula;
        const useBullet = !isCenteredSlide && !isFormula && !isParagraph;
        return {
          text: b,
          options: {
            fontSize: isCenteredSlide ? 22 : (isParagraph ? Math.min(sizeForCount, 20) : sizeForCount),
            color: isExample ? "B8860B" : hexText,
            italic: isExample,
            bold: isFormula,
            fontFace: isFormula ? "Consolas" : fontFamily,
            bullet: useBullet ? { code: "25CF" } : false,
            paraSpaceBefore: 4,
            paraSpaceAfter: 6,
            align: (isCenteredSlide || isFormula ? "center" : "left") as "center" | "left",
            breakLine: i < body.length - 1,
          },
        };
      });

      pptSlide.addText(bulletText as any, {
        x: isCenteredSlide ? 2 : 0.9,
        y: isCenteredSlide ? 3.6 : 1.8,
        w: hasImage ? 6.5 : (isCenteredSlide ? 9.33 : 11.5),
        h: isCenteredSlide ? 3.0 : 5.2,
        fontFace: fontFamily,
        valign: "top",
      });
    }

    if (hasImage && slide.image_url) {
      try {
        const data = await urlToBase64(slide.image_url);
        if (data && data.startsWith("data:image/")) {
          pptSlide.addImage({ data, x: 8.3, y: 1.2, w: 4.7, h: 4.8, sizing: { type: "contain", w: 4.7, h: 4.8 } });
        }
      } catch (e) {
        console.warn(`[pptx] skipped image on slide ${idx + 1}:`, e);
      }
    }

    if (slide.speaker_notes) {
      try { pptSlide.addNotes(slide.speaker_notes); } catch { /* notes optional */ }
    }

    pptSlide.addText(`${idx + 1} / ${slides.length}`, {
      x: 11.5, y: 7.0, w: 1.5, h: 0.4,
      fontSize: 10, color: hexText,
      align: "right", transparency: 50,
    });
  }

  const fileName = `${sanitizeFilename(presentationTitle)}.pptx`;
  try {
    const result = await pptx.writeFile({ fileName });
    console.info("[pptx] export complete:", result, `(${slides.length} slides)`);
  } catch (err) {
    // Manual fallback: build blob ourselves and save via file-saver.
    console.error("[pptx] writeFile failed, using manual blob fallback:", err);
    const blob = (await pptx.write({ outputType: "blob" })) as Blob;
    if (!blob || blob.size < 1024) {
      throw new Error("PPTX generation produced an empty file. Please retry.");
    }
    saveAs(blob, fileName);
  }
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
        // Wait for layout + image decode
        setTimeout(resolve, slides[i].image_url ? 600 : 150);
      });

      // Ensure any <img> inside the stage is fully decoded
      const imgs = stage.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img => (img as HTMLImageElement).decode().catch(() => undefined)));

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
  const t = templates[templateId] || templates["executive-modern"] || templates.business;
  const titleColor = t.exportTitleColor.replace("#", "");
  const textColor = t.exportTextColor.replace("#", "");
  const accentColor = t.exportAccentColor.replace("#", "");

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: presentationTitle, bold: true, size: 56, color: titleColor, font: t.fontFamily }),
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
          new TextRun({ text: s.title, bold: true, size: 40, color: titleColor, font: t.fontFamily }),
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
            const type = (ext === "jpeg" ? "jpg" : ext) as "png" | "jpg" | "gif" | "bmp";
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new ImageRun({ type, data: bin, transformation: { width: 480, height: 300 } }) as any,
                ],
              })
            );
          }
        } catch { /* skip image */ }
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
