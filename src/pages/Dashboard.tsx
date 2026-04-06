import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Presentation, Trash2, Pencil, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { templates } from "@/lib/templates";
import SlideRenderer from "@/components/SlideRenderer";

interface PresentationRow {
  id: string;
  title: string;
  topic: string;
  template: string;
  status: string;
  is_paid: boolean;
  created_at: string;
  num_slides: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presentations, setPresentations] = useState<PresentationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadPresentations();
  }, [user]);

  const loadPresentations = async () => {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading presentations", description: error.message, variant: "destructive" });
    } else {
      setPresentations(data || []);
    }
    setLoading(false);
  };

  const deletePresentation = async (id: string) => {
    const { error } = await supabase.from("presentations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPresentations((p) => p.filter((item) => item.id !== id));
      toast({ title: "Presentation deleted" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">My Presentations</h2>
            <p className="text-muted-foreground mt-1">Create and manage your AI-generated slides</p>
          </div>
          <Button variant="gradient" className="glow-purple-sm" onClick={() => navigate("/create")}>
            <Sparkles className="h-4 w-4" />
            New Presentation
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="p-4 rounded-2xl gradient-primary-subtle inline-block mb-6">
              <Presentation className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-display text-foreground mb-2">No presentations yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Create your first AI-powered presentation in seconds</p>
            <Button variant="gradient" className="glow-purple-sm" onClick={() => navigate("/create")}>
              <Sparkles className="h-4 w-4" />
              Create Presentation
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {presentations.map((pres, idx) => (
              <motion.div
                key={pres.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group glass-card rounded-2xl overflow-hidden hover:glow-purple-sm transition-all cursor-pointer"
                onClick={() => navigate(`/editor/${pres.id}`)}
              >
                <div className="slide-preview w-full overflow-hidden">
                  <SlideRenderer
                    slide={{ title: pres.title, content: [pres.topic] }}
                    templateId={pres.template}
                    slideIndex={0}
                    totalSlides={pres.num_slides}
                    className="w-full h-full text-[4px]"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate mb-1">{pres.title}</h3>
                  <p className="text-sm text-muted-foreground truncate mb-3">{pres.topic}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {templates[pres.template]?.name || pres.template}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(pres.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1 bg-secondary/30" onClick={(e) => { e.stopPropagation(); navigate(`/editor/${pres.id}`); }}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deletePresentation(pres.id); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
