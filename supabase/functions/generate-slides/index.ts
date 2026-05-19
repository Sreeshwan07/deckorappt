import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, numSlides, tone, template } = await req.json();

    if (!topic || typeof topic !== "string" || topic.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid topic" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const slideCount = Math.min(Math.max(numSlides || 8, 5), 20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const modeKey = (tone || "professional").toLowerCase();
    const modeBlock =
      modeKey === "educational"
        ? `MODE: EDUCATIONAL
- Audience: students (school → B.Tech). Goal: deep understanding.
- Content is DETAILED and INFORMATIVE. Use formal definitions, step-by-step explanations, worked examples, formulas, and clear comparisons.
- Bullets 16–22 words. Up to 4 bullets per content slide. Intro paragraph up to 35 words.
- Prefer "formula", "comparison", and "pros_cons" layouts whenever the topic supports them.
- Image prompts MUST be educational diagrams (labeled schematics, charts, architecture diagrams) — never decorative photos.`
        : modeKey === "creative"
        ? `MODE: CREATIVE
- Audience: creative / Gen-Z / storytelling decks. Goal: visual impact.
- Content is SHORT and PUNCHY. 2–3 bullets per slide, 8–14 words each. Intro paragraph ≤ 22 words.
- Use evocative, narrative phrasing. Avoid heavy jargon. Favor "intro", "content", and "summary" layouts; minimize formula/comparison unless essential.
- Image prompts MUST be aesthetic, editorial, modern visuals related to the topic — clean photography, abstract gradients, or stylized illustrations.`
        : `MODE: PROFESSIONAL
- Audience: corporate / startup / investor decks. Goal: clarity and impact.
- Content is CONCISE and EXECUTIVE. 3 bullets per slide, 10–16 words each. Intro paragraph ≤ 28 words.
- Use business terminology, KPIs, frameworks, and outcomes. Prefer "intro", "content", "comparison", and "summary".
- Image prompts MUST be professional business visuals: clean infographics, data charts, modern office or product imagery related to the topic.`;

    const systemPrompt = `You are a senior presentation designer creating ready-to-present decks.

${modeBlock}

Generate exactly ${slideCount} slides about the given topic.

==============================
EDUCATION-LEVEL & SUBJECT DETECTION
==============================
Silently detect both the EDUCATION LEVEL and the SUBJECT TYPE of the topic, then adapt language and depth:

Education levels:
- Class 1–5 (Primary)        → very simple words, short sentences, lots of relatable examples, no jargon.
- Class 6–10 (Middle/High)   → clear definitions, simple diagrams (described), school-textbook tone.
- Class 11–12 / Intermediate → exam-oriented, key points, formulas, NCERT-style structure.
- Diploma / B.Tech / Degree  → formal academic, precise terminology, derivations, complexity, examples.
- MBA / Corporate            → frameworks, case studies, business impact, KPIs.
- Competitive exams / GK     → fact-dense, definitions, dates, summary tables.

Subject-aware coverage:
- DBMS / OS / COA / Networks / Compilers → definitions, architecture (described), working, types, advantages, disadvantages, real example.
- Data Structures / Algorithms → definition, operations, time/space complexity, pseudocode/steps, example, applications.
- Machine Learning / AI → problem definition, intuition, math/formula, algorithm steps, pros/cons, use-cases.
- Mathematics / Physics / Chemistry → formal definition, derivation/formula with variables and units, worked numerical, applications.
- Biology → definition, structure (described), function, classification, diagram-style explanation, examples.
- History / Geography / Civics → background, key events/concepts, timeline, causes/effects, significance.
- Economics / Accounting / Business Studies → concept, formula/principle, example, advantages/limitations, real-world case.
- General theory / GK → concept, key principles, examples, comparisons, conclusion.

The slide deck MUST cover the topic's standard syllabus completely and in logical academic order
(introduction → fundamentals → working/structure → variants/comparisons → advantages/limitations → applications → summary).

==============================
LAYOUT-AWARE SLIDE SYSTEM
==============================
Each slide MUST have a "layout" field. Pick the BEST layout for the content:

- "title"       → Slide 1 only. Big topic + short subtitle.
- "intro"       → Two-column intro/definition. Heading + 2-3 sentence paragraph.
- "content"     → Standard explanation slide. Heading + 3-5 substantive bullets.
- "pros_cons"   → Advantages vs disadvantages. Provide pros[] and cons[] (3-4 each).
- "comparison"  → Side-by-side comparison of two things. Provide left{title, points[]} and right{title, points[]}.
- "formula"     → Formula-centric. Provide formula (string), variables[] (e.g. "F = force in Newtons"), example (worked example string).
- "summary"     → Key takeaways. 3-5 short impactful points.
- "thanks"      → Final slide ONLY. Title "Thank You", subtitle "Questions?".

==============================
STRUCTURE (exactly ${slideCount} slides)
==============================
- Slide 1: layout="title"
- Slide 2: layout="intro" (definition + overview)
- Slides 3 to ${slideCount - 2}: choose from "content", "pros_cons", "comparison", "formula" based on what the sub-topic needs. Mix layouts intelligently — do NOT use "content" for everything.
- Slide ${slideCount - 1}: layout="summary"
- Slide ${slideCount}: layout="thanks"

==============================
CONTENT QUALITY RULES (STRICT — PREVENTS OVERFLOW)
==============================
- Academic, precise, B.Tech standard. No filler, no repetition, no shallow one-liners.
- Bullets MUST be 14-22 words each. NEVER exceed 22 words. NEVER write multi-sentence bullets.
- Provide AT MOST 4 bullets per content slide (3 is ideal). Quality over quantity.
- Intro paragraph: AT MOST 35 words (2 short sentences).
- Use formal definitions and proper terminology. Prefer concrete examples over vague statements.
- For technical topics: include at least ONE "formula" slide whenever any equation, complexity, or quantitative relation applies.
- For evaluative topics or any topic with trade-offs: include a "pros_cons" slide (3-4 pros, 3-4 cons, each ≤ 14 words).
- For "X vs Y", variants, or alternatives: include a "comparison" slide (3-4 points per side, ≤ 12 words each).
- For formula slides: 3-5 variables max, example ≤ 25 words.
- Summary: 3-5 short impactful points (≤ 12 words each).
- Cover the FULL standard syllabus of the detected subject — split across MORE slides instead of cramming.
- If a sub-topic is too large for one slide, SPLIT it into two slides (e.g. "Working of X — Part 1" / "Part 2"). Never overflow a single slide.

==============================
HEADING RULES (STRICT)
==============================
- Titles MUST be clean, professional, academic style.
- NO emojis, NO decorative symbols (★ ✨ 🚀 → • etc.), NO markdown (** __ ##), NO trailing punctuation.
- Title case, max 8 words. Example: "Advantages of DBMS" — NOT "✨ Advantages of DBMS 🚀".

==============================
IMAGE RULES (STRICT — TOPIC-RELEVANT ONLY)
==============================
- Every "intro" and "content" slide must include an image_prompt that is DIRECTLY related to the slide's specific sub-topic and the overall presentation topic.
- The image_prompt must describe a professional, photorealistic or clean-illustration visual SPECIFIC to the subject domain. Examples:
  · DBMS slide → "clean diagram of relational database tables with primary/foreign keys, modern flat illustration"
  · Operating Systems → "schematic of OS kernel layers with process and memory management blocks"
  · Machine Learning → "neural network graph with labeled input, hidden, and output layers"
  · Networking → "network topology diagram with routers, switches and client devices"
- NEVER use generic stock-photo prompts ("business meeting", "people working", "abstract background"). NEVER use cartoonish or decorative imagery unrelated to the topic.
- For pros_cons / comparison / formula / summary / title / thanks slides → omit image_prompt (set to empty/null).

==============================
OUTPUT SCHEMA (per slide)
==============================
{
  "layout": "title" | "intro" | "content" | "pros_cons" | "comparison" | "formula" | "summary" | "thanks",
  "title": string,
  "subtitle": string (optional, for title/intro/thanks),
  "paragraph": string (optional, for intro — the explanation paragraph),
  "bullets": string[] (for content/summary; 3-5 items),
  "pros": string[] (for pros_cons),
  "cons": string[] (for pros_cons),
  "left":  { "title": string, "points": string[] } (for comparison),
  "right": { "title": string, "points": string[] } (for comparison),
  "formula": string (for formula),
  "variables": string[] (for formula — "Symbol = meaning + unit"),
  "example": string (for formula — worked example),
  "notes": string (speaker notes, 2-3 sentences),
  "image_prompt": string (visual description; required for intro/content)
}

Return ONLY valid JSON with a "slides" array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a detailed academic presentation about: ${topic}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_slides",
              description: "Generate structured academic presentation slides with layout types",
              parameters: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        layout: {
                          type: "string",
                          enum: ["title", "intro", "content", "pros_cons", "comparison", "formula", "summary", "thanks"],
                        },
                        title: { type: "string" },
                        subtitle: { type: "string" },
                        paragraph: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        pros: { type: "array", items: { type: "string" } },
                        cons: { type: "array", items: { type: "string" } },
                        left: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            points: { type: "array", items: { type: "string" } },
                          },
                        },
                        right: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            points: { type: "array", items: { type: "string" } },
                          },
                        },
                        formula: { type: "string" },
                        variables: { type: "array", items: { type: "string" } },
                        example: { type: "string" },
                        notes: { type: "string" },
                        image_prompt: { type: "string" },
                      },
                      required: ["layout", "title"],
                    },
                  },
                },
                required: ["slides"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_slides" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", status, text);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    let rawSlides: any[];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      rawSlides = parsed.slides;
    } else {
      const content = aiResult.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      rawSlides = parsed.slides;
    }

    // Normalize to a stable shape: keep `bullets` for backward-compat (array of content strings)
    // but also pass the structured `layout` payload through.
    const cleanHeading = (str: string) =>
      (str || "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/[*_~`#>•●◆◇★☆✦✧✨➤➣➜→←↔»«]/g, "")
        .replace(/[!?.,:;]+$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const slides = rawSlides.map((s: any) => {
      const flat: string[] = [];
      if (s.paragraph) flat.push(s.paragraph);
      if (Array.isArray(s.bullets)) flat.push(...s.bullets);
      if (Array.isArray(s.pros)) flat.push(...s.pros.map((p: string) => `✓ ${p}`));
      if (Array.isArray(s.cons)) flat.push(...s.cons.map((c: string) => `✗ ${c}`));
      if (s.formula) flat.push(`Formula: ${s.formula}`);
      if (Array.isArray(s.variables)) flat.push(...s.variables);
      if (s.example) flat.push(`Example: ${s.example}`);
      if (s.subtitle && (s.layout === "title" || s.layout === "thanks")) flat.push(s.subtitle);

      return {
        layout: s.layout || "content",
        title: cleanHeading(s.title),
        subtitle: s.subtitle ?? null,
        paragraph: s.paragraph ?? null,
        bullets: Array.isArray(s.bullets) ? s.bullets : [],
        pros: Array.isArray(s.pros) ? s.pros : [],
        cons: Array.isArray(s.cons) ? s.cons : [],
        left: s.left ?? null,
        right: s.right ?? null,
        formula: s.formula ?? null,
        variables: Array.isArray(s.variables) ? s.variables : [],
        example: s.example ?? null,
        notes: s.notes ?? null,
        image_prompt: s.image_prompt ?? null,
        // backward-compat for existing renderer/exporter consumers:
        content: flat,
      };
    });

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-slides error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
