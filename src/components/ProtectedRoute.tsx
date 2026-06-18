import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStatus } from "@/hooks/use-user-status";
import { useIsAdmin } from "@/lib/admin";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requireApproved?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireApproved = true, requireAdmin = false }: Props) {
  const { user, loading } = useAuth();
  const { status, loading: statusLoading } = useUserStatus();
  const isAdmin = useIsAdmin();

  if (loading || (user && statusLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireApproved && !isAdmin && status !== "approved") {
    return <Navigate to="/pending" replace />;
  }
  return <>{children}</>;
}
