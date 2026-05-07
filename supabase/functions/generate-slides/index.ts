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

    const systemPrompt = `You are an expert academic presentation designer creating clean, seminar-ready slides for B.Tech and professional audiences.

Generate exactly ${slideCount} slides about the given topic in a ${tone || "professional academic"} tone.

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
CONTENT QUALITY RULES
==============================
- Academic, precise, B.Tech standard. No filler, no repetition.
- Bullets must be SUBSTANTIVE (15-30 words each), never one-liners.
- Use formal definitions and proper terminology.
- For technical topics: include at least ONE "formula" slide if any equation applies.
- For evaluative topics: include a "pros_cons" slide.
- For "X vs Y" or alternatives: include a "comparison" slide.
- Every "intro" and "content" slide should have an image_prompt for a relevant supporting visual.

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
        title: s.title,
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
