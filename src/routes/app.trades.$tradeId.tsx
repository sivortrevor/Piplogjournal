import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Calendar, Clock, Brain, Target, AlertCircle, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/trade-utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/trades/$tradeId")({
  head: () => ({ meta: [{ title: "Trade — PipLog" }] }),
  component: TradeDetailPage,
});

interface FullTrade {
  id: string;
  pair: string;
  side: string;
  lot_size: number | null;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  risk_percent: number | null;
  rr_ratio: number | null;
  pips: number | null;
  pnl: number | null;
  result: string | null;
  strategy: string | null;
  session: string | null;
  confidence: number | null;
  emotion_before: string | null;
  emotion_after: string | null;
  mistakes: string[] | null;
  notes: string | null;
  screenshot_url: string | null;
  opened_at: string;
}

function TradeDetailPage() {
  const { tradeId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<FullTrade | null>(null);
  const [screenshotSignedUrl, setScreenshotSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", tradeId)
        .maybeSingle();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setTrade(data as FullTrade);
      if (data.screenshot_url) {
        const { data: signed } = await supabase.storage
          .from("trade-screenshots")
          .createSignedUrl(data.screenshot_url, 3600);
        setScreenshotSignedUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
  }, [tradeId, user]);

  const handleDelete = async () => {
    if (!trade) return;
    const { error } = await supabase.from("trades").delete().eq("id", trade.id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    if (trade.screenshot_url) {
      await supabase.storage.from("trade-screenshots").remove([trade.screenshot_url]);
    }
    toast.success("Trade deleted");
    navigate({ to: "/app/trades" });
  };

  if (loading) {
    return <p className="px-5 pt-12 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (!trade) {
    return (
      <div className="px-5 pt-12 text-center">
        <p className="text-sm text-muted-foreground">Trade not found.</p>
        <Link to="/app/trades" className="mt-4 inline-block text-sm font-semibold text-primary">
          ← Back to trades
        </Link>
      </div>
    );
  }

  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const date = new Date(trade.opened_at);

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <Link to="/app/trades" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/app/trades/$tradeId/edit"
            params={{ tradeId: trade.id }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-primary"
            aria-label="Edit trade"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-loss">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-border bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
              <AlertDialogDescription>
                This action can't be undone. The trade and its screenshot will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </header>

      <div className="mt-4 surface-card rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
            {trade.pair}
          </h1>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              trade.side === "buy"
                ? "bg-profit/18 text-profit"
                : "bg-loss/18 text-loss"
            }`}
          >
            {trade.side}
          </span>
          {trade.result && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                isWin
                  ? "bg-profit/18 text-profit"
                  : isLoss
                    ? "bg-loss/18 text-loss"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {trade.result}
            </span>
          )}
        </div>

        <p
          className={`mt-3 text-3xl font-extrabold tracking-tight ${
            (trade.pnl ?? 0) > 0 ? "text-profit" : (trade.pnl ?? 0) < 0 ? "text-loss" : ""
          }`}
        >
          {trade.pnl !== null ? formatCurrency(Number(trade.pnl)) : "Open"}
        </p>
        <p className="text-sm text-muted-foreground">
          {trade.pips !== null
            ? `${Number(trade.pips) > 0 ? "+" : ""}${Number(trade.pips).toFixed(1)} pips`
            : "—"}
          {trade.rr_ratio ? ` · 1:${Number(trade.rr_ratio).toFixed(2)} RR` : ""}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {date.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {screenshotSignedUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <img src={screenshotSignedUrl} alt="Trade chart" className="w-full" />
        </div>
      )}

      <Section title="Prices">
        <Row label="Entry" value={Number(trade.entry_price).toFixed(5)} />
        {trade.exit_price !== null && <Row label="Exit" value={Number(trade.exit_price).toFixed(5)} />}
        {trade.stop_loss !== null && <Row label="Stop loss" value={Number(trade.stop_loss).toFixed(5)} />}
        {trade.take_profit !== null && <Row label="Take profit" value={Number(trade.take_profit).toFixed(5)} />}
        {trade.lot_size !== null && <Row label="Lot size" value={String(trade.lot_size)} />}
        {trade.risk_percent !== null && <Row label="Risk" value={`${trade.risk_percent}%`} />}
      </Section>

      {(trade.strategy || trade.session || trade.confidence) && (
        <Section title="Context" icon={Target}>
          {trade.strategy && <Row label="Strategy" value={trade.strategy} />}
          {trade.session && <Row label="Session" value={trade.session.replace("_", " ")} capitalize />}
          {trade.confidence && (
            <Row label="Confidence" value={`${"●".repeat(trade.confidence)}${"○".repeat(5 - trade.confidence)}`} />
          )}
        </Section>
      )}

      {(trade.emotion_before || trade.emotion_after) && (
        <Section title="Psychology" icon={Brain}>
          {trade.emotion_before && <Row label="Before" value={trade.emotion_before} />}
          {trade.emotion_after && <Row label="After" value={trade.emotion_after} />}
        </Section>
      )}

      {trade.mistakes && trade.mistakes.length > 0 && (
        <Section title="Mistakes" icon={AlertCircle}>
          <div className="flex flex-wrap gap-1.5">
            {trade.mistakes.map((m) => (
              <span
                key={m}
                className="rounded-full bg-loss/15 px-2.5 py-1 text-xs font-medium text-loss"
              >
                {m}
              </span>
            ))}
          </div>
        </Section>
      )}

      {trade.notes && (
        <Section title="Notes">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{trade.notes}</p>
        </Section>
      )}

      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline" className="h-12 flex-1 rounded-xl border-border bg-surface">
          <Link to="/app/trades">Back</Link>
        </Button>
        <Button
          asChild
          className="h-12 flex-1 rounded-xl text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Link to="/app/trades/$tradeId/edit" params={{ tradeId: trade.id }}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Trade
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Target;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 surface-card rounded-2xl p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
