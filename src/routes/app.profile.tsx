import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Crown, Mail, Calendar, Sparkles, Download, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PipLogLogo } from "@/components/brand/PipLogLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — PipLog" }] }),
  component: ProfilePage,
});

const CSV_COLUMNS = [
  "id",
  "opened_at",
  "closed_at",
  "pair",
  "side",
  "lot_size",
  "entry_price",
  "exit_price",
  "stop_loss",
  "take_profit",
  "risk_percent",
  "rr_ratio",
  "pips",
  "pnl",
  "result",
  "strategy",
  "session",
  "confidence",
  "emotion_before",
  "emotion_after",
  "mistakes",
  "notes",
] as const;

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (Array.isArray(v)) s = v.join("; ");
  else if (v instanceof Date) s = v.toISOString();
  else s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    subscription_plan: string;
    preferred_currency: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, subscription_plan, preferred_currency")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const [exporting, setExporting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const handleExport = async () => {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("trades")
        .select(CSV_COLUMNS.join(","))
        .order("opened_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info("No trades to export yet");
        return;
      }
      const header = CSV_COLUMNS.join(",");
      const rows = (data as unknown as Array<Record<string, unknown>>).map((row) =>
        CSV_COLUMNS.map((c) => escapeCsv(row[c])).join(","),
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `piplog-trades-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} trades`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const initials = (profile?.display_name || user?.email || "U")
    .split(/\s+|@/)[0]
    .slice(0, 2)
    .toUpperCase();

  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  return (
    <div className="px-5 pt-8">
      <header className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {initials}
        </div>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          {profile?.display_name || "Trader"}
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </header>

      {/* Plan card */}
      <section
        className="mt-6 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-glow-primary)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {profile?.subscription_plan === "pro" ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <p className="mt-2 text-lg font-bold">
          {profile?.subscription_plan === "pro"
            ? "Unlimited trades · Full analytics"
            : "Upgrade for unlimited trades"}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {profile?.subscription_plan === "pro"
            ? "Thank you for supporting PipLog."
            : "Get advanced analytics, exports, and cloud backup."}
        </p>
        {profile?.subscription_plan !== "pro" && (
          <button
            disabled
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> Upgrade (coming soon)
          </button>
        )}
      </section>

      <section className="mt-4 surface-card rounded-2xl p-4">
        <Row icon={Mail} label="Email" value={user?.email ?? "—"} />
        <Row icon={Calendar} label="Joined" value={created} />
      </section>

      <section className="mt-4 surface-card rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</p>

        <Link
          to="/app/import"
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-input p-3 text-left transition hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Import from broker</p>
              <p className="text-[11px] text-muted-foreground">
                Upload an MT4, MT5, cTrader or generic CSV
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-2 flex w-full items-center justify-between rounded-xl bg-input p-3 text-left transition hover:bg-accent disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold">Export trades to CSV</p>
              <p className="text-[11px] text-muted-foreground">
                {exporting ? "Preparing your file…" : "Download every trade as a spreadsheet"}
              </p>
            </div>
          </div>
        </button>
      </section>

      <section className="mt-4 surface-card rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coming next</p>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          <li>· Currency selection</li>
          <li>· Risk preferences</li>
          <li>· Notifications</li>
          <li>· PDF export</li>
          <li>· Cloud backup</li>
        </ul>
      </section>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="mt-6 h-12 w-full rounded-xl border-border bg-surface text-loss hover:text-loss"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>

      <div className="mt-8 flex justify-center opacity-60">
        <PipLogLogo size={32} />
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
