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

    const systemPrompt = `You are an expert academic presentation creator specializing in B.Tech and university-level content. Generate exactly ${slideCount} slides for a ${tone || "professional"} presentation about the given topic using a ${template || "business"} style.

CRITICAL CONTENT RULES — follow these strictly:

1. DEFINITIONS: Every concept slide MUST start with a clear, proper definition (1-2 sentences). Use professional academic language.

2. STRUCTURED EXPLANATIONS: After the definition, provide a detailed explanation paragraph (2-3 sentences). Do NOT use only bullet points — mix paragraphs with bullets.

3. KEY POINTS: Use bullet points only for listing distinct items, features, or steps. Each bullet should be substantive (15-30 words), not vague one-liners.

4. EXAMPLES: For technical/academic topics, ALWAYS include at least one real-world or practical example. Prefix it with "Example:" so it stands out.

5. FORMULAS & TERMINOLOGY: For technical topics, include relevant formulas, equations, or proper technical terminology where appropriate.

6. CONTENT DEPTH: Each slide should have 4-7 content items combining paragraphs, bullets, and examples. Avoid shallow or repetitive content.

SLIDE STRUCTURE:
- Slide 1: Title slide with presentation title and a descriptive subtitle
- Slide 2: Introduction/Overview — define the topic and outline what will be covered
- Slides 3 to ${slideCount - 2}: Core content slides, each covering a specific sub-topic with definition → explanation → key points → example
- Slide ${slideCount - 1}: Key Takeaways / Summary — consolidate the main learnings
- Slide ${slideCount}: Thank You slide — title must be "Thank You", with content: ["Thank you for your time and attention.", "Questions are welcome."]

IMPORTANT: The LAST slide MUST always be a "Thank You" slide with exactly that title.

Each content item in the bullets array can be:
- A paragraph (2-3 sentences for explanations)
- A bullet point (for listing features/steps)
- An example prefixed with "Example:"
- A formula or technical note

Return a JSON object with a "slides" array. Each slide must have:
- "title": clear, specific, academic-quality title
- "bullets": array of 4-7 content items (mix of paragraphs, points, and examples as described above)
- "notes": speaker notes with additional context (2-3 sentences)
- "image_prompt": a specific visual description for AI image generation relevant to the slide content (e.g. "detailed diagram showing CPU architecture with labeled components", "infographic comparing different sorting algorithms")

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a detailed academic presentation about: ${topic}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_slides",
              description: "Generate structured academic presentation slides with detailed content",
              parameters: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, specific slide title" },
                        bullets: {
                          type: "array",
                          items: { type: "string" },
                          description: "4-7 content items: mix of explanation paragraphs, bullet points, and examples",
                        },
                        notes: { type: "string", description: "Speaker notes with additional context" },
                        image_prompt: { type: "string", description: "Specific visual description for AI image generation" },
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
