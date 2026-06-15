import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Copy, Link2, Loader2, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentationId: string;
}

export default function ShareDialog({ open, onOpenChange, presentationId }: ShareDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("presentations")
        .select("is_public, share_token")
        .eq("id", presentationId)
        .single();
      if (data) {
        setIsPublic(!!data.is_public);
        setShareToken(data.share_token);
      }
      setLoading(false);
    })();
  }, [open, presentationId]);

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : "";

  const togglePublic = async (next: boolean) => {
    setSaving(true);
    let token = shareToken;
    if (next && !token) {
      token = crypto.randomUUID().replace(/-/g, "");
    }
    const { error } = await supabase
      .from("presentations")
      .update({ is_public: next, share_token: token })
      .eq("id", presentationId);
    setSaving(false);
    if (error) {
      toast({ title: "Could not update sharing", description: error.message, variant: "destructive" });
      return;
    }
    setIsPublic(next);
    setShareToken(token);
    toast({ title: next ? "Link sharing enabled" : "Link sharing disabled" });
  };

  const regenerate = async () => {
    setSaving(true);
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("presentations")
      .update({ share_token: token, is_public: true })
      .eq("id", presentationId);
    setSaving(false);
    if (error) {
      toast({ title: "Could not regenerate link", variant: "destructive" });
      return;
    }
    setShareToken(token);
    setIsPublic(true);
    toast({ title: "New link generated" });
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Share presentation
          </DialogTitle>
          <DialogDescription>
            Anyone with the link can view this presentation in read-only mode.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                {isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <div className="text-sm font-medium">{isPublic ? "Public link" : "Private"}</div>
                  <div className="text-xs text-muted-foreground">
                    {isPublic ? "Anyone with the link can view" : "Only you can see this"}
                  </div>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={togglePublic} disabled={saving} />
            </div>

            {isPublic && shareToken && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="bg-secondary/30 text-xs" />
                  <Button size="icon" variant="outline" onClick={copy} title="Copy link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={regenerate}
                  disabled={saving}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Regenerate link (invalidates the old one)
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
