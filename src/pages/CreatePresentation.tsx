import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles, Briefcase, Palette, GraduationCap, Rocket, Monitor, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const tones = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "creative", label: "Creative", icon: Palette },
  { value: "educational", label: "Educational", icon: GraduationCap },
];

const templates = [
  { value: "business", label: "Business Professional", icon: Briefcase, desc: "Clean corporate look" },
  { value: "minimal", label: "Minimal Elegant", icon: Palette, desc: "Simple modern slides" },
  { value: "startup", label: "Startup Pitch", icon: Rocket, desc: "Bold headings" },
  { value: "tech", label: "Tech Dark", icon: Monitor, desc: "Modern dark style" },
  { value: "academic", label: "Academic", icon: BookOpen, desc: "Formal structure" },
  { value: "creative", label: "Creative Colorful", icon: Palette, desc: "For students" },
];

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState(7);
  const [tone, setTone] = useState("professional");
  const [template, setTemplate] = useState("business");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || !user) return;
    setGenerating(true);

    try {
      // 1. Create presentation record
      const { data: pres, error: presError } = await supabase
        .from("presentations")
        .insert({
          user_id: user.id,
          title: topic.trim(),
          topic: topic.trim(),
          num_slides: numSlides,
          tone,
          template,
          status: "generating",
        })
        .select()
        .single();

      if (presError) throw presError;

      // 2. Call AI edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-slides", {
        body: { topic: topic.trim(), numSlides, tone, template },
      });

      if (aiError) throw aiError;

      const slides = aiData?.slides || [];

      // 3. Insert slides
      if (slides.length > 0) {
        const slideRows = slides.map((s: { title: string; bullets: string[]; notes?: string }, i: number) => ({
          presentation_id: pres.id,
          slide_order: i,
          title: s.title,
          content: JSON.stringify(s.bullets || []),
          speaker_notes: s.notes || null,
        }));

        const { error: slidesError } = await supabase.from("slides").insert(slideRows);
        if (slidesError) throw slidesError;
      }

      // 4. Update status
      await supabase.from("presentations").update({ status: "ready" }).eq("id", pres.id);

      toast({ title: "Presentation generated!" });
      navigate(`/preview/${pres.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Error", description: message, variant: "destructive" });

    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-foreground mb-1">Create Presentation</h2>
          <p className="text-muted-foreground mb-8">Enter your topic and let AI generate professional slides</p>

          <div className="space-y-8">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-semibold">Topic</Label>
              <Textarea
                id="topic"
                placeholder="e.g. Artificial Intelligence in Healthcare: Trends and Future"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[80px] text-base"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{topic.length}/500</p>
            </div>

            {/* Slide count */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Number of Slides: {numSlides}</Label>
              <Slider
                value={[numSlides]}
                onValueChange={([v]) => setNumSlides(v)}
                min={5}
                max={15}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span><span>10</span><span>15</span>
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tone</Label>
              <div className="grid grid-cols-3 gap-3">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      tone === t.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <t.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Template</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={cn(
                      "flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 transition-all text-left",
                      template === t.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <t.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating slides...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Presentation
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
