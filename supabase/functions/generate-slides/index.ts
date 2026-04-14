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

    const slideCount = Math.min(Math.max(numSlides || 7, 5), 20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert presentation creator for academic and professional audiences. Generate exactly ${slideCount} slides for a ${tone || "professional"} presentation about the given topic.

CONCEPT-AWARE RULES — analyze the topic type and adapt:

FOR TECHNICAL TOPICS (CS, Engineering, Science):
- Start each concept with "Definition: [formal definition]"
- Follow with a 2-3 sentence explanation paragraph
- Include "Formula: [formula]" when relevant, with variable explanations
- Add "Example: [concrete real-world example]"

FOR THEORETICAL/CONCEPTUAL TOPICS:
- Provide structured explanation with cause-effect relationships
- Include historical context or evolution of the concept
- Add comparison points where applicable

FOR FORMULA-HEAVY TOPICS:
- Present each formula clearly with "Formula: [expression]"
- Explain each variable on the next bullet
- Include a worked "Example: [step-by-step solution]"

SLIDE STRUCTURE (exactly ${slideCount} slides):
- Slide 1: Title slide — presentation title + descriptive subtitle
- Slide 2: Introduction — define the topic, outline coverage
- Slides 3-${slideCount - 2}: Core content — each covering ONE sub-topic deeply:
  * "Definition: ..." (1-2 sentences)
  * Explanation paragraph (2-3 sentences)
  * 2-3 key bullet points (15-30 words each, substantive)
  * "Example: ..." (practical/real-world)
  * "Formula: ..." (if applicable)
- Slide ${slideCount - 1}: Key Takeaways — consolidate main learnings
- Slide ${slideCount}: "Thank You" — title MUST be "Thank You", content: ["Thank you for your time and attention.", "Questions are welcome."]

CONTENT RULES:
- Each slide: 4-6 content items max (no overcrowding)
- Mix paragraphs + bullets + examples (never bullet-only)
- Every definition must be academically precise
- No vague one-liners, no repetition across slides
- Use proper technical terminology

Return ONLY valid JSON with a "slides" array. Each slide object has:
- "title": clear, specific title
- "bullets": array of 4-6 content strings
- "notes": speaker notes (2-3 sentences)
- "image_prompt": specific visual description for the slide`;

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
          { role: "user", content: `Create a detailed presentation about: ${topic}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_slides",
              description: "Generate structured presentation slides",
              parameters: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        notes: { type: "string" },
                        image_prompt: { type: "string" },
                      },
                      required: ["title", "bullets", "image_prompt"],
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

    let slides;
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      slides = parsed.slides;
    } else {
      const content = aiResult.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      slides = parsed.slides;
    }

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
