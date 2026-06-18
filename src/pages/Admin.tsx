import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, ShieldOff, RotateCcw, Search, Loader2, Users, Clock, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

type UserStatus = "pending" | "approved" | "rejected" | "suspended";

interface ProfileRow {
  id: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

const TABS: { id: UserStatus; label: string; icon: any }[] = [
  { id: "pending",   label: "Pending",   icon: Clock },
  { id: "approved",  label: "Approved",  icon: ShieldCheck },
  { id: "rejected",  label: "Rejected",  icon: ShieldX },
  { id: "suspended", label: "Suspended", icon: ShieldOff },
];

const STATUS_STYLES: Record<UserStatus, string> = {
  pending:   "bg-amber-500/15 text-amber-500 border-amber-500/30",
  approved:  "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected:  "bg-destructive/15 text-destructive border-destructive/30",
  suspended: "bg-muted text-muted-foreground border-border",
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<UserStatus>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, status, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load users", description: error.message, variant: "destructive" });
    else setProfiles((data ?? []) as ProfileRow[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: UserStatus) => {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    setBusyId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setProfiles((p) => p.map((u) => (u.id === id ? { ...u, status } : u)));
    toast({ title: `User ${status}` });
  };

  const counts = useMemo(() => {
    const c: Record<UserStatus, number> = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
    for (const p of profiles) c[p.status]++;
    return c;
  }, [profiles]);

  const filtered = useMemo(
    () => profiles.filter((p) => p.status === tab && p.email.toLowerCase().includes(search.toLowerCase())),
    [profiles, tab, search]
  );

  const actionsFor = (row: ProfileRow) => {
    const isSelf = row.id === user?.id;
    const Btn = (props: { onClick: () => void; icon: any; label: string; variant?: any; disabled?: boolean }) => (
      <Button size="sm" variant={props.variant ?? "outline"} onClick={props.onClick} disabled={props.disabled || busyId === row.id || isSelf}>
        <props.icon className="h-3.5 w-3.5" /> {props.label}
      </Button>
    );
    switch (row.status) {
      case "pending":
        return (
          <div className="flex gap-2 justify-end">
            <Btn icon={Check} label="Approve" variant="default" onClick={() => updateStatus(row.id, "approved")} />
            <Btn icon={X} label="Reject" onClick={() => updateStatus(row.id, "rejected")} />
          </div>
        );
      case "approved":
        return (
          <div className="flex gap-2 justify-end">
            <Btn icon={ShieldOff} label="Suspend" onClick={() => updateStatus(row.id, "suspended")} />
            <Btn icon={X} label="Reject" onClick={() => updateStatus(row.id, "rejected")} />
          </div>
        );
      case "rejected":
      case "suspended":
        return (
          <div className="flex gap-2 justify-end">
            <Btn icon={RotateCcw} label="Reactivate" variant="default" onClick={() => updateStatus(row.id, "approved")} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen cosmic-bg">
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/60 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <BrandLogo className="text-lg" />
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
          Admin
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{profiles.length} users</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve, reject, suspend or reactivate users.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-xl p-4 text-left border transition-all",
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-card/50 hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t.label}</span>
                  <t.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="text-2xl font-bold font-display mt-2">{counts[t.id]}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-w-md px-3 py-2 rounded-lg bg-secondary/40 border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="bg-transparent border-0 h-7 p-0 focus-visible:ring-0"
          />
        </div>

        <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No {tab} users.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.email}
                      {row.id === user?.id && <span className="ml-2 text-[10px] text-muted-foreground">(you)</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[row.status]}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{actionsFor(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
