import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ------------------------------------------------------------------ */
/* In-memory LRU cache (module scope — survives warm invocations)      */
/* ------------------------------------------------------------------ */
const CACHE = new Map<string, { slides: unknown[]; ts: number }>();
const CACHE_MAX = 50;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
function cacheGet(k: string) {
  const v = CACHE.get(k);
  if (!v) return null;
  if (Date.now() - v.ts > CACHE_TTL_MS) { CACHE.delete(k); return null; }
  CACHE.delete(k); CACHE.set(k, v); // refresh recency
  return v.slides;
}
function cacheSet(k: string, slides: unknown[]) {
  if (CACHE.size >= CACHE_MAX) { const first = CACHE.keys().next().value; if (first) CACHE.delete(first); }
  CACHE.set(k, { slides, ts: Date.now() });
}

/* ------------------------------------------------------------------ */
/* Topic Intelligence                                                  */
/* ------------------------------------------------------------------ */
const FORMULA_KEYWORDS = [
  "fourier","laplace","bayes","newton","scheduling","algorithm","complexity",
  "derivation","integration","differentiation","matrix","probability","statistics",
  "regression","gradient","neural","theorem","equation","formula","physics","calculus",
  "thermodynamics","kinematics","circuit","ohm","kirchhoff","binary","encoding"
];
const ENGINEERING_KW = ["dbms","operating system","networks","compiler","architecture","ml","machine learning","ai","data structure","algorithm","cloud","devops","kernel","cpu","memory","tcp","ip","kubernetes","docker","react","javascript","python","java"];
const MATH_KW = ["math","calculus","algebra","geometry","trigonometry","probability","statistics","linear algebra","derivative","integral","matrix","vector"];
const SCIENCE_KW = ["physics","chemistry","biology","cell","atom","molecule","photosynthesis","ecosystem","mechanics","optics","wave","gravity"];
const HISTORY_KW = ["history","war","revolution","empire","civilization","ancient","medieval","independence","movement","timeline","dynasty"];
const BUSINESS_KW = ["business","marketing","management","strategy","finance","economy","startup","pitch","brand","sales","investor","leadership","mba"];

type TopicType = "engineering" | "math" | "science" | "history" | "business" | "general";

function classifyTopic(topic: string): { type: TopicType; hasFormula: boolean } {
  const t = topic.toLowerCase();
  const hasFormula = FORMULA_KEYWORDS.some(k => t.includes(k));
  if (ENGINEERING_KW.some(k => t.includes(k))) return { type: "engineering", hasFormula };
  if (MATH_KW.some(k => t.includes(k))) return { type: "math", hasFormula: true };
  if (SCIENCE_KW.some(k => t.includes(k))) return { type: "science", hasFormula };
  if (HISTORY_KW.some(k => t.includes(k))) return { type: "history", hasFormula: false };
  if (BUSINESS_KW.some(k => t.includes(k))) return { type: "business", hasFormula: false };
  return { type: "general", hasFormula };
}

/* The full Professional ordering. Trim to slideCount intelligently. */
function buildSlidePlan(slideCount: number, info: { type: TopicType; hasFormula: boolean }): string[] {
  // Each entry maps to a layout slot: title/agenda/intro/content/formula/pros_cons/comparison/summary/thanks
  const full: { slot: string; section: string; required?: boolean }[] = [
    { slot: "title",      section: "Title",                          required: true },
    { slot: "intro",      section: "Agenda / Overview",              required: true },
    { slot: "intro",      section: "Introduction & Definition",      required: true },
    { slot: "content",    section: "Core Concepts" },
    { slot: "content",    section: "Key Components" },
    { slot: "content",    section: "Working / Architecture" },
    { slot: "content",    section: "Examples" },
    { slot: "pros_cons",  section: "Advantages & Disadvantages" },
    { slot: "comparison", section: "Comparison" },
    { slot: "content",    section: "Applications / Use Cases" },
    { slot: "formula",    section: "Important Formulas" },
    { slot: "content",    section: "Case Study" },
    { slot: "summary",    section: "Summary",                        required: true },
    { slot: "thanks",     section: "Thank You",                      required: true },
  ];
  // Topic-aware filtering
  if (info.type === "history") {
    full.splice(full.findIndex(x => x.section === "Important Formulas"), 1);
  }
  if (info.type === "business") {
    const i = full.findIndex(x => x.section === "Important Formulas");
    if (i >= 0) full.splice(i, 1);
  }
  if (!info.hasFormula) {
    const i = full.findIndex(x => x.slot === "formula");
    if (i >= 0) full.splice(i, 1);
  }
  // Now trim/expand to exact slideCount
  const required = full.filter(x => x.required);
  const optional = full.filter(x => !x.required);
  const need = slideCount - required.length;
  const picked = optional.slice(0, Math.max(0, need));
  // Re-assemble respecting original order
  const keepSet = new Set([...required, ...picked]);
  const planned = full.filter(x => keepSet.has(x)).map(x => `${x.slot}::${x.section}`);
  // If still short (deck > full list), pad with extra content slides
  while (planned.length < slideCount) {
    planned.splice(planned.length - 2, 0, `content::Deeper Dive ${planned.length}`);
  }
  return planned.slice(0, slideCount);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth ───────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    // ── Input ──────────────────────────────────────────────────────
    const { topic, numSlides, tone, template } = await req.json();
    if (!topic || typeof topic !== "string" || topic.length > 500)
      return json({ error: "Invalid topic" }, 400);
    const slideCount = Math.min(Math.max(numSlides || 8, 5), 20);
    const modeKey = (tone || "professional").toLowerCase();

    // ── Cache lookup ───────────────────────────────────────────────
    const cacheKey = `${modeKey}|${slideCount}|${topic.trim().toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached) return json({ slides: cached, cached: true });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ── Topic classification & plan ────────────────────────────────
    const info = classifyTopic(topic);
    const plan = buildSlidePlan(slideCount, info);
    const planList = plan.map((p, i) => `  ${i + 1}. [${p.split("::")[0]}] ${p.split("::")[1]}`).join("\n");

    const isEducational = modeKey === "educational";

    const modeBlock = isEducational
      ? `MODE: EDUCATIONAL — comprehensive academic deck for students (school → B.Tech).
   • Aim for DEPTH and clarity, not brevity. Each slide must teach something concrete.
   • Body bullets: 4–6 per content slide, each 18–32 words. Use full sentences, not fragments.
   • Always include a formal Definition where applicable (prefix the bullet with "Definition: ").
   • Use precise academic terminology. Briefly explain jargon the first time it appears.
   • Provide worked examples, real-world applications, and at least one numerical/illustrative example where the topic allows.
   • Prefix illustrative examples with "Example: " and formulas with "Formula: ".`
      : modeKey === "creative"
        ? "MODE: CREATIVE — storytelling deck. Punchy, evocative. 2-3 bullets/slide, 8-14 words each."
        : "MODE: PROFESSIONAL — corporate/investor deck. Executive, KPIs, frameworks. 3-4 bullets/slide, 10-18 words each.";

    const educationalRules = isEducational ? `
EDUCATIONAL MODE — ADDITIONAL REQUIREMENTS:
• The first content slide after the Agenda MUST start with a formal "Definition: ..." bullet.
• Dedicate slides to: Definition, Key Concepts, Working/Process, Examples, Advantages, Disadvantages, Applications, and (where relevant) Formulas.
• Expand important sub-topics into their OWN slides rather than cramming. Better to have 5 deep slides than 8 thin ones.
• Where a formula exists, ALSO include a "variables" list (Symbol = meaning + unit) AND a worked numerical example.
• Avoid one-liner generic bullets ("It is important", "Used widely"). Every bullet must convey a fact, mechanism, value, comparison, or example.
` : "";

    const systemPrompt = `You are a senior presentation engine. You output strictly structured JSON for ${slideCount} slides.

${modeBlock}

TOPIC TYPE detected: ${info.type.toUpperCase()}${info.hasFormula ? " (formula-bearing)" : ""}

SLIDE PLAN — fill EACH slot below with REAL, SUBSTANTIVE content. Do not deviate from order or count.
${planList}
${educationalRules}
LAYOUT SCHEMA per slot:
- title       → { layout:"title", title, subtitle }
- intro       → { layout:"intro", title, paragraph (${isEducational ? "50-80" : "28-40"} words, definition + context) }
- content     → { layout:"content", title, bullets[${isEducational ? "4-6" : "3-5"}] (each ${isEducational ? "18-32" : "12-22"} words, substantive) }
- pros_cons   → { layout:"pros_cons", title, pros[3-4], cons[3-4] (each ${isEducational ? "≤22" : "≤14"} words) }
- comparison  → { layout:"comparison", title, left{title,points[3-4]}, right{title,points[3-4]} }
- formula     → { layout:"formula", title, formula (clean ASCII like "y = mx + c" or "F = G·m₁·m₂/r²"), variables[3-5] ("Symbol = meaning + unit"), example (worked numerical, ${isEducational ? "≤45" : "≤30"} words) }
- summary     → { layout:"summary", title:"Summary", bullets[3-5] (≤${isEducational ? "20" : "14"} words, impactful takeaways) }
- thanks      → { layout:"thanks", title:"Thank You", subtitle:"Questions?" }

ABSOLUTE RULES (failures = bad slide):
1. NEVER produce a slide that contains only the title or only the topic name. Every content/intro/pros_cons/comparison/formula slide MUST have meaningful body content.
2. NO emojis, NO decorative symbols (★ ✨ 🚀 → • ◆), NO markdown (** __ ##), NO trailing punctuation in titles.
3. Bullets are SINGLE-SENTENCE, ZERO filler. Concrete > vague.
4. Titles ≤8 words, Title Case.
5. For formula slot: write the formula as a clean string (use unicode subscripts/superscripts where natural). Provide 3-5 variable definitions with units. Provide a numerical worked example.
6. For pros_cons / comparison: provide BOTH sides with 3-4 substantive points each.
7. Cover the topic's STANDARD academic syllabus thoroughly across the chosen sections.
8. image_query: 1-3 stock-photo keywords directly relevant to the slide sub-topic. Provide for content/intro slides only. Omit for title/summary/thanks/formula/pros_cons/comparison.

Return JSON ONLY: { "slides": [ ... exactly ${slideCount} ... ] } with layouts matching the plan order above.`;

    // ── AI call ────────────────────────────────────────────────────
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create the deck. Topic: ${topic}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_slides",
            description: "Generate structured slides matching the plan order exactly.",
            parameters: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      layout: { type: "string", enum: ["title","intro","content","pros_cons","comparison","formula","summary","thanks"] },
                      title: { type: "string" },
                      subtitle: { type: "string" },
                      paragraph: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                      pros: { type: "array", items: { type: "string" } },
                      cons: { type: "array", items: { type: "string" } },
                      left:  { type: "object", properties: { title: { type: "string" }, points: { type: "array", items: { type: "string" } } } },
                      right: { type: "object", properties: { title: { type: "string" }, points: { type: "array", items: { type: "string" } } } },
                      formula: { type: "string" },
                      variables: { type: "array", items: { type: "string" } },
                      example: { type: "string" },
                      notes: { type: "string" },
                      image_query: { type: "string" },
                    },
                    required: ["layout","title"],
                  },
                },
              },
              required: ["slides"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_slides" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return json({ error: "Rate limited. Please try again in a moment." }, 429);
      if (status === 402) return json({ error: "AI credits exhausted. Please add funds." }, 402);
      const text = await response.text();
      console.error("AI error:", status, text);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let rawSlides: any[] = [];
    if (toolCall?.function?.arguments) {
      rawSlides = JSON.parse(toolCall.function.arguments).slides || [];
    } else {
      const content = aiResult.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      rawSlides = (JSON.parse(cleaned).slides) || [];
    }

    // ── Validation & normalization ─────────────────────────────────
    const cleanHeading = (str: string) =>
      (str || "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/[*_~`#>•●◆◇★☆✦✧✨➤➣➜→←↔»«]/g, "")
        .replace(/[!?.,:;]+$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const isMeaningful = (s: any): boolean => {
      if (s.layout === "title" || s.layout === "thanks") return true;
      if (s.layout === "intro") return !!(s.paragraph && s.paragraph.trim().split(/\s+/).length >= 10);
      if (s.layout === "formula") return !!(s.formula && (s.variables?.length || s.example));
      if (s.layout === "pros_cons") return (s.pros?.length || 0) >= 2 && (s.cons?.length || 0) >= 2;
      if (s.layout === "comparison") return (s.left?.points?.length || 0) >= 2 && (s.right?.points?.length || 0) >= 2;
      return (s.bullets?.filter((b: string) => b && b.trim().length > 8).length || 0) >= 2;
    };

    // Drop empty/weak slides; ensure title & thanks framing
    let cleaned = rawSlides.filter(isMeaningful);

    // Dedupe by title (Jaccard-ish: same lowercase normalized)
    const seen = new Set<string>();
    cleaned = cleaned.filter(s => {
      const key = cleanHeading(s.title).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Force first=title, last=thanks
    if (!cleaned[0] || cleaned[0].layout !== "title") {
      cleaned.unshift({ layout: "title", title: cleanHeading(topic), subtitle: "A Presentation" });
    }
    if (cleaned[cleaned.length - 1]?.layout !== "thanks") {
      cleaned.push({ layout: "thanks", title: "Thank You", subtitle: "Questions?" });
    }

    // Flatten for backward compat with renderer/exporter consumers
    const slides = cleaned.map((s: any) => {
      const flat: string[] = [];
      if (s.paragraph) flat.push(s.paragraph);
      if (Array.isArray(s.bullets)) flat.push(...s.bullets);
      if (Array.isArray(s.pros)) flat.push(...s.pros.map((p: string) => `✓ ${p}`));
      if (Array.isArray(s.cons)) flat.push(...s.cons.map((c: string) => `✗ ${c}`));
      if (s.left?.points) flat.push(`${s.left.title || "Left"}:`, ...s.left.points.map((p: string) => `• ${p}`));
      if (s.right?.points) flat.push(`${s.right.title || "Right"}:`, ...s.right.points.map((p: string) => `• ${p}`));
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
        image_query: s.image_query ?? null,
        content: flat,
      };
    });

    cacheSet(cacheKey, slides);
    return json({ slides });
  } catch (e) {
    console.error("generate-slides error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
