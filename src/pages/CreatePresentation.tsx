import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles, Briefcase, Palette, GraduationCap, AlertCircle, ExternalLink, FlaskConical, Megaphone, Rocket, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { templateList } from "@/lib/templates";
import SlideRenderer from "@/components/SlideRenderer";

// Presentation modes — each maps to an internal "tone" + a prompt preset.
const modes = [
  { value: "business",   tone: "professional", label: "Business",   icon: Briefcase,     desc: "KPIs, strategy, ROI" },
  { value: "education",  tone: "educational",  label: "Education",  icon: GraduationCap, desc: "Syllabus, definitions" },
  { value: "research",   tone: "professional", label: "Research",   icon: FlaskConical,  desc: "Methodology, results" },
  { value: "marketing",  tone: "creative",     label: "Marketing",  icon: Megaphone,     desc: "Campaigns, audience" },
  { value: "pitch",      tone: "professional", label: "Startup Pitch", icon: Rocket,    desc: "TAM, traction, ask" },
  { value: "portfolio",  tone: "creative",     label: "Portfolio",  icon: User,          desc: "Projects, impact" },
];

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState(7);
  const [tone, setTone] = useState("professional");
  const [template, setTemplate] = useState("executive-modern");
  const [generating, setGenerating] = useState(false);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const TOPUP_URL = "https://lovable.dev/settings/workspace?tab=usage";

  useEffect(() => {
    const prefill = searchParams.get("topic");
    if (prefill) setTopic(prefill);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!topic.trim() || !user) return;
    setGenerating(true);
    setCreditsError(null);
    let createdPresId: string | null = null;
    try {
      const { data: pres, error: presError } = await supabase
        .from("presentations")
        .insert({ user_id: user.id, title: topic.trim(), topic: topic.trim(), num_slides: numSlides, tone, template, status: "generating" })
        .select()
        .single();
      if (presError) throw presError;
      createdPresId = pres.id;

      const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-slides", {
        body: { topic: topic.trim(), numSlides, tone, template },
      });
      if (aiError) {
        // surface real reason (402 credits / 429 rate-limit / etc.)
        const ctx: any = (aiError as any).context;
        let msg = aiError.message || "Generation failed";
        try {
          const body = ctx && typeof ctx.json === "function" ? await ctx.json() : null;
          if (body?.error) msg = body.error;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (aiData?.error) throw new Error(aiData.error);

      const slides = aiData?.slides || [];
      if (slides.length === 0) throw new Error("AI returned no slides. Please try again.");

      const slideRows = slides.map((s: any, i: number) => ({
        presentation_id: pres.id,
        slide_order: i,
        title: s.title,
        content: JSON.stringify(Array.isArray(s.content) && s.content.length > 0 ? s.content : (s.bullets || [])),
        speaker_notes: s.notes || null,
      }));
      const { error: slidesError } = await supabase.from("slides").insert(slideRows);
      if (slidesError) throw slidesError;
      // NOTE: Images are no longer auto-generated to keep generation under ~10s and save credits.
      // Users add images per slide from the editor.

      await supabase.from("presentations").update({ status: "ready" }).eq("id", pres.id);
      toast({ title: "Presentation generated!" });
      navigate(`/editor/${pres.id}`);
    } catch (err: unknown) {
      // cleanup orphan "generating" row so the dashboard isn't polluted
      if (createdPresId) {
        await supabase.from("presentations").delete().eq("id", createdPresId);
      }
      const message = err instanceof Error ? err.message : "Generation failed";
      const isCredits = /402|credit|exhaust|insufficient.*fund/i.test(message);
      if (isCredits) setCreditsError(message);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold font-display text-foreground mb-1">Create Presentation</h2>
          <p className="text-muted-foreground mb-8">Enter your topic and let AI generate professional slides</p>

          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-semibold">Topic</Label>
              <Textarea
                id="topic"
                placeholder="e.g. Artificial Intelligence in Healthcare: Trends and Future"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[80px] text-base bg-secondary/30 border-border"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{topic.length}/500</p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Number of Slides: <span className="text-primary">{numSlides}</span></Label>
              <Slider value={[numSlides]} onValueChange={([v]) => setNumSlides(v)} min={5} max={20} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Tone</Label>
              <div className="grid grid-cols-3 gap-3">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                      tone === t.value ? "border-primary bg-primary/10 glow-purple-sm" : "border-border bg-secondary/20 hover:border-primary/30"
                    )}
                  >
                    <t.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                    <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Template</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templateList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "rounded-xl border transition-all text-left overflow-hidden",
                      template === t.id ? "border-primary glow-purple-sm" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="slide-preview w-full">
                      <SlideRenderer
                        slide={{ title: t.name, content: [t.description] }}
                        templateId={t.id}
                        slideIndex={0}
                        totalSlides={1}
                        className="w-full h-full text-[3.5px]"
                      />
                    </div>
                    <div className="p-2 bg-card">
                      <span className="text-xs font-semibold text-foreground">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {creditsError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">AI credits exhausted</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Top up your workspace balance to continue generating presentations.</p>
                </div>
                <Button size="sm" variant="default" asChild>
                  <a href={TOPUP_URL} target="_blank" rel="noopener noreferrer">
                    Add credits <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            )}

            <Button variant="gradient" size="lg" className="w-full glow-purple" onClick={handleGenerate} disabled={generating || !topic.trim()}>
              {generating ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Generating slides...</>
              ) : (
                <><Sparkles className="h-5 w-5" />Generate Presentation</>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
