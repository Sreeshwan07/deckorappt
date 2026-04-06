import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Presentation, Trash2, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: "Deleted" });
    }
  };

  const templateColors: Record<string, string> = {
    business: "bg-primary/10 text-primary",
    minimal: "bg-muted text-muted-foreground",
    startup: "bg-accent/10 text-accent",
    tech: "bg-foreground/10 text-foreground",
    academic: "bg-success/10 text-success",
    creative: "bg-warning/10 text-warning",
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Presentations</h2>
            <p className="text-muted-foreground mt-1">Create and manage your AI-generated slides</p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4" />
            New Presentation
          </Button>
        </div>

        {/* Skeleton / Empty / Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Presentation className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No presentations yet</h3>
            <p className="text-muted-foreground mb-6">Create your first AI-powered presentation</p>
            <Button variant="gradient" onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4" />
              Create Presentation
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presentations.map((pres, idx) => (
              <motion.div
                key={pres.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group glass-card rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/editor/${pres.id}`)}
              >
                {/* Slide-shaped thumbnail */}
                <div className="slide-preview rounded-xl bg-muted mb-4 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-4">
                    <Presentation className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">{pres.num_slides} slides</p>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground truncate mb-1">{pres.title}</h3>
                <p className="text-sm text-muted-foreground truncate mb-3">{pres.topic}</p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${templateColors[pres.template] || "bg-muted text-muted-foreground"}`}>
                    {pres.template}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(pres.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/editor/${pres.id}`); }}>
                    <Eye className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deletePresentation(pres.id); }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
