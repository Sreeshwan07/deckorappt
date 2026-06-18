import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserStatus = "pending" | "approved" | "rejected" | "suspended";

interface State {
  status: UserStatus | null;
  loading: boolean;
}

export function useUserStatus(): State & { refresh: () => void } {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: null, loading: true });

  const load = useCallback(async () => {
    if (!user) {
      setState({ status: null, loading: false });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();
    setState({ status: (data?.status as UserStatus) ?? "pending", loading: false });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
