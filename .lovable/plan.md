# Deckora Engine Upgrade — Implementation Plan

Doing all 14 items in one pass. Below is what changes and where.

---

## 1. AI Prompt Rewrite — `supabase/functions/generate-slides/index.ts`

Rewrite the system prompt with:

- **Hard-coded Professional slide order** (Title → Agenda → Intro → Core Concepts → Components → Working → Examples → Advantages → Disadvantages → Comparison → Applications → Formulas → Case Study → Summary → Thanks). Mode dynamically picks subset matching `numSlides`.
- **Topic Intelligence**: silent classifier (Engineering / Math / Science / History / Business / General) drives which sections are mandatory.
- **Formula auto-detection**: any topic matching a keyword list (Fourier, Bayes, Newton, scheduling, ML algos, integration, derivation, etc.) forces ≥1 `formula` slide + worked example.
- **No-empty-slide guard**: every slide must have ≥3 substantive bullets OR a formula OR a comparison/pros-cons payload. Title-only slides are rejected post-parse and the deck is patched.
- **Validation pass** (server-side): drop slides missing required fields, dedupe by title similarity, re-number, ensure last slide is `thanks`.

Drop image generation from the auto-pipeline. `image_prompt` becomes `image_query` (1–3 stock-photo keywords).

---

## 2. Stock Image Source (Pexels)

- Replace `generate-slide-image` call from `CreatePresentation.tsx` with a new edge function `fetch-slide-image` that queries Pexels API by keyword and stores the photo URL.
- **Default: NOT called during generation** (per your speed answer). Editor gets an "Add image" button per slide that calls it on demand.
- Requires `PEXELS_API_KEY` secret — I'll request it before deploying that function.

---

## 3. Templates — Add 10 New Premium

Append to `src/lib/templates.ts` (legacy ones kept):

`executive-modern`, `academic-elite`, `startup-pitch-pro`, `glassmorphism-pro`, `neo-minimal`, `luxury-dark`, `genz-gradient`, `tech-blueprint`, `elegant-editorial`, `data-analytics`.

Each uses palettes from your spec (Navy+Cyan, Emerald+Slate, Indigo+White, Beige+Charcoal, Teal+Midnight) with WCAG-AA contrast verified. Default new presentations to `executive-modern`.

---

## 4. Typography & Layout — `src/components/SlideRenderer.tsx`

- Title: `clamp(2.4em → 3.2em)` (≈44–56px at 1080p)
- Body bullets: `1.2em → 1.45em` (≈22–26px)
- Tighten `useAutoShrink` floor to `0.65` (was `0.55`) so text never goes microscopic — instead overflow triggers content trimming at parse time.
- Add `max-bullets` cap per layout and ellipsize gracefully.
- Re-balance spacing tokens (consistent margins: 6% sides, 5% top).

---

## 5. Presentation Mode Overflow Fix — `SlideshowMode.tsx` + `SlideRenderer.tsx`

- Replace fixed `BASE_W/H` scaling with `aspect-ratio: 16/9` container that always fits viewport.
- Auto-shrink runs on every resize.
- Guarantee no horizontal scroll, no clipping.

---

## 6. Export Fixes — `src/lib/export.ts`

- **Filename**: use topic name (already partly done via `sanitizeFilename`), but switch to *spaces preserved* (e.g. `Machine Learning.pptx` not `Machine_Learning.pptx`). Sanitize only illegal chars.
- **PPTX**: bump title to 44pt, body 24pt, fix bullet overflow (max 5 per slide, auto-shrink to 20pt if more). Render `pros_cons` and `comparison` as proper two-column layouts (currently flattened).
- **PDF**: keep html2canvas but pre-await all image decodes; fixes blank-image bug.
- **DOCX**: same content quality pass, 24pt body, proper heading hierarchy.

---

## 7. Caching & Speed

- Add in-memory LRU cache (Deno edge function module scope) keyed by `topic|numSlides|tone|template` → last 50 results. Hits return < 200ms.
- Outline-only fast path: AI now returns structured slides in one call already; just lower `temperature` and drop unused tool fields.
- Skip image generation during create (your choice). Target: outline+slides ≈ 4–7s.

---

## 8. Quality Validation (server-side, before returning slides)

```text
for each slide:
  assert title length 3..80
  assert no duplicate-title pair (Jaccard > 0.7)
  assert layout-required fields present
  assert content count >= 2 (else fill with derived bullet from title)
  assert not just-the-topic-title alone
final:
  ensure slide[0].layout === "title"
  ensure slide[last].layout === "thanks"
  ensure ≥1 formula slide if isFormulaTopic
```

---

## 9. Editor Tweaks — `src/pages/SlideEditor.tsx`

- "Add image" button per slide (calls `fetch-slide-image`).
- Default theme picker prioritizes the 10 new templates at top.

---

## Files Touched

```text
supabase/functions/generate-slides/index.ts        (rewrite)
supabase/functions/fetch-slide-image/index.ts      (NEW — Pexels)
src/lib/templates.ts                                (+10 templates)
src/lib/export.ts                                   (filenames, pptx layouts, body sizes)
src/components/SlideRenderer.tsx                    (typography, layouts, fit)
src/components/SlideshowMode.tsx                    (true fit-to-screen)
src/pages/SlideEditor.tsx                           (per-slide image button)
src/pages/CreatePresentation.tsx                    (drop auto-image call)
```

No DB migrations needed — schema unchanged.

---

## Prerequisite (will request before deploying step 2)

- **PEXELS_API_KEY** — free at https://www.pexels.com/api/ . Without it the "Add image" button stays disabled with a tooltip, but everything else works.

---

## Order of execution

1. Templates + renderer typography (visible immediately)
2. AI prompt + validation rewrite
3. Presentation mode fit fix
4. Export fixes + filenames
5. Pexels function + editor button (after key)

Approve and I'll start.
