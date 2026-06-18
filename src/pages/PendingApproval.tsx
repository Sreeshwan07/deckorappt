import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStatus } from "@/hooks/use-user-status";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { Clock, XCircle, ShieldOff, LogOut, RefreshCw, Loader2 } from "lucide-react";

const COPY = {
  pending: {
    icon: Clock,
    title: "Awaiting approval",
    body: "Your account has been created and is waiting for the Super Admin to approve access. You'll be able to generate presentations as soon as it's approved.",
    color: "text-amber-500",
  },
  rejected: {
    icon: XCircle,
    title: "Access denied",
    body: "Your request to use this workspace was rejected. Contact your Super Admin if you believe this is a mistake.",
    color: "text-destructive",
  },
  suspended: {
    icon: ShieldOff,
    title: "Account suspended",
    body: "Your account is currently suspended. Please reach out to your Super Admin to restore access.",
    color: "text-destructive",
  },
} as const;

export default function PendingApproval() {
  const { user, signOut, loading } = useAuth();
  const { status, loading: statusLoading, refresh } = useUserStatus();
  const navigate = useNavigate();

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) { navigate("/auth", { replace: true }); return null; }
  if (status === "approved") { navigate("/dashboard", { replace: true }); return null; }

  const info = COPY[(status ?? "pending") as keyof typeof COPY] ?? COPY.pending;
  const Icon = info.icon;

  return (
    <div className="min-h-screen flex items-center justify-center cosmic-bg p-6">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center space-y-5">
        <BrandLogo className="text-2xl block" />
        <Icon className={`h-12 w-12 mx-auto ${info.color}`} />
        <h1 className="text-2xl font-display font-bold">{info.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{info.body}</p>
        <p className="text-xs text-muted-foreground/70">Signed in as <span className="font-mono">{user.email}</span></p>
        <div className="flex gap-2 justify-center pt-2">
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4" /> Check again
          </Button>
          <Button variant="ghost" onClick={async () => { await signOut(); navigate("/auth", { replace: true }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
