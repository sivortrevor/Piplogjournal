import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Brain,
  Lightbulb,
  FileText,
  Calculator,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import {
  POPULAR_PAIRS,
  STRATEGIES,
  EMOTIONS,
  COMMON_MISTAKES,
  calculatePips,
  calculateRR,
  calculatePnl,
  determineResult,
  detectOutcome,
  formatCurrency,
} from "@/lib/trade-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/app/trades/$tradeId/edit")({
  head: () => ({ meta: [{ title: "Edit Trade — PipLog" }] }),
  component: EditTradePage,
});

type SessionType = "asia" | "london" | "new_york" | "other";

interface FormState {
  pair: string;
  side: "buy" | "sell";
  lotSize: string;
  entry: string;
  exit: string;
  sl: string;
  tp: string;
  riskPercent: string;
  pnl: string;
  pnlOverride: boolean;
  strategy: string;
  session: SessionType;
  confidence: number;
  emotionBefore: string;
  emotionAfter: string;
  mistakes: string[];
  notes: string;
  openedAt: string;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function EditTradePage() {
  const { tradeId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState | null>(null);
  const [existingScreenshot, setExistingScreenshot] = useState<string | null>(null);
  const [existingSignedUrl, setExistingSignedUrl] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
      // Determine if existing P/L was a manual override (differs from auto-calc)
      const lot = Number(data.lot_size) || 0;
      const auto =
        data.entry_price && data.exit_price && lot
          ? calculatePnl({
              pair: data.pair,
              side: (data.side as "buy" | "sell") ?? "buy",
              entry: Number(data.entry_price),
              exit: Number(data.exit_price),
              lotSize: lot,
            })
          : null;
      const stored = data.pnl != null ? Number(data.pnl) : null;
      const overrideActive =
        stored != null && (auto == null || Math.abs(stored - auto) > 0.01);

      setForm({
        pair: data.pair,
        side: (data.side as "buy" | "sell") ?? "buy",
        lotSize: data.lot_size != null ? String(data.lot_size) : "",
        entry: data.entry_price != null ? String(data.entry_price) : "",
        exit: data.exit_price != null ? String(data.exit_price) : "",
        sl: data.stop_loss != null ? String(data.stop_loss) : "",
        tp: data.take_profit != null ? String(data.take_profit) : "",
        riskPercent: data.risk_percent != null ? String(data.risk_percent) : "",
        pnl: data.pnl != null ? String(data.pnl) : "",
        pnlOverride: overrideActive,
        strategy: data.strategy ?? "",
        session: ((data.session as SessionType) ?? "london"),
        confidence: data.confidence ?? 3,
        emotionBefore: data.emotion_before ?? "",
        emotionAfter: data.emotion_after ?? "",
        mistakes: data.mistakes ?? [],
        notes: data.notes ?? "",
        openedAt: toLocalInput(data.opened_at),
      });
      if (data.screenshot_url) {
        setExistingScreenshot(data.screenshot_url);
        const { data: signed } = await supabase.storage
          .from("trade-screenshots")
          .createSignedUrl(data.screenshot_url, 3600);
        setExistingSignedUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
  }, [tradeId, user]);

  const calc = useMemo(() => {
    if (!form) return { pips: 0, rr: null as number | null, autoPnl: 0, outcome: "breakeven" as const };
    const entry = parseFloat(form.entry);
    const exit = parseFloat(form.exit);
    const sl = parseFloat(form.sl);
    const tp = parseFloat(form.tp);
    const lot = parseFloat(form.lotSize);
    const pips = entry && exit ? calculatePips({ pair: form.pair, side: form.side, entry, exit }) : 0;
    const rr = calculateRR({
      entry,
      stopLoss: isNaN(sl) ? null : sl,
      takeProfit: isNaN(tp) ? null : tp,
      side: form.side,
    });
    const autoPnl =
      entry && exit && lot
        ? calculatePnl({ pair: form.pair, side: form.side, entry, exit, lotSize: lot })
        : 0;
    const outcome = entry && exit ? detectOutcome({ side: form.side, entry, exit }) : "breakeven";
    return { pips, rr, autoPnl, outcome };
  }, [form]);

  const effectivePnl = useMemo(() => {
    if (!form) return null;
    if (form.pnlOverride) {
      const v = parseFloat(form.pnl);
      return isNaN(v) ? null : v;
    }
    if (!form.exit) return null;
    return calc.autoPnl;
  }, [form, calc.autoPnl]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const handleScreenshot = (file: File | null) => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    if (!file) {
      setScreenshot(null);
      setScreenshotPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const toggleMistake = (m: string) => {
    if (!form) return;
    setForm({
      ...form,
      mistakes: form.mistakes.includes(m) ? form.mistakes.filter((x) => x !== m) : [...form.mistakes, m],
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !form) return;
    if (!form.pair || !form.entry) {
      toast.error("Pair and entry price are required");
      return;
    }

    setSubmitting(true);
    try {
      let screenshotUrl: string | null = existingScreenshot;
      const oldScreenshotToRemove: string | null =
        (removeExisting || screenshot) && existingScreenshot ? existingScreenshot : null;

      if (removeExisting && !screenshot) {
        screenshotUrl = null;
      }
      if (screenshot) {
        const ext = screenshot.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("trade-screenshots")
          .upload(path, screenshot, { contentType: screenshot.type });
        if (uploadErr) throw uploadErr;
        screenshotUrl = path;
      }

      const result = form.exit ? determineResult(effectivePnl) : "open";

      const { error } = await supabase
        .from("trades")
        .update({
          pair: form.pair,
          side: form.side,
          lot_size: form.lotSize ? parseFloat(form.lotSize) : 0,
          entry_price: parseFloat(form.entry),
          exit_price: form.exit ? parseFloat(form.exit) : null,
          stop_loss: form.sl ? parseFloat(form.sl) : null,
          take_profit: form.tp ? parseFloat(form.tp) : null,
          risk_percent: form.riskPercent ? parseFloat(form.riskPercent) : null,
          rr_ratio: calc.rr,
          pips: form.exit ? calc.pips : null,
          pnl: effectivePnl,
          result,
          strategy: form.strategy || null,
          session: form.session,
          confidence: form.confidence,
          emotion_before: form.emotionBefore || null,
          emotion_after: form.emotionAfter || null,
          mistakes: form.mistakes,
          notes: form.notes || null,
          screenshot_url: screenshotUrl,
          opened_at: new Date(form.openedAt).toISOString(),
          closed_at: form.exit ? new Date().toISOString() : null,
        })
        .eq("id", tradeId);

      if (error) throw error;

      if (oldScreenshotToRemove) {
        await supabase.storage.from("trade-screenshots").remove([oldScreenshotToRemove]);
      }

      toast.success("Trade updated ✓");
      navigate({ to: "/app/trades/$tradeId", params: { tradeId } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update trade";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="px-5 pt-12 text-center text-sm text-muted-foreground">Loading…</p>;
  }
  if (!form) {
    return (
      <div className="px-5 pt-12 text-center">
        <p className="text-sm text-muted-foreground">Trade not found.</p>
        <Link to="/app/trades" className="mt-4 inline-block text-sm font-semibold text-primary">
          ← Back to trades
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <header className="mx-auto flex max-w-6xl items-center gap-3">
        <Link
          to="/app/trades/$tradeId"
          params={{ tradeId }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ letterSpacing: "-0.025em" }}>
            Edit Trade
          </h1>
          <p className="text-xs text-muted-foreground">Update any field below.</p>
        </div>
      </header>

      <div className="mx-auto mt-5 max-w-6xl lg:hidden">
        <SummaryStrip
          pair={form.pair}
          side={form.side}
          pips={calc.pips}
          rr={calc.rr}
          pnl={effectivePnl}
          outcome={calc.outcome}
          hasExit={!!form.exit}
        />
      </div>

      <div className="mx-auto mt-6 grid max-w-6xl gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Section title="Trade Details" icon={Activity} description="Pair, direction, lot size, prices">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Pair">
                <Select value={form.pair} onValueChange={(v) => setForm({ ...form, pair: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_PAIRS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Direction">
                <div className="flex h-11 items-center rounded-xl bg-input p-1">
                  {(["buy", "sell"] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setForm({ ...form, side: s })}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold capitalize transition ${
                        form.side === s
                          ? s === "buy"
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s === "buy" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Lot size">
                <NumInput value={form.lotSize} onChange={(v) => setForm({ ...form, lotSize: v })} placeholder="0.10" />
              </Field>
              <Field label="Date & time">
                <Input
                  type="datetime-local"
                  value={form.openedAt}
                  onChange={(e) => setForm({ ...form, openedAt: e.target.value })}
                  className="h-11 rounded-xl bg-input border-border"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Entry price">
                <NumInput value={form.entry} onChange={(v) => setForm({ ...form, entry: v })} placeholder="1.08500" />
              </Field>
              <Field label="Exit price">
                <NumInput value={form.exit} onChange={(v) => setForm({ ...form, exit: v })} placeholder="1.08750" />
              </Field>
            </div>

            <div className="rounded-xl border border-border bg-input/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calculator className="h-3.5 w-3.5" /> Auto-calculated P/L
                </div>
                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Checkbox
                    checked={form.pnlOverride}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        pnlOverride: !!c,
                        pnl: c ? (calc.autoPnl ? String(calc.autoPnl) : form.pnl) : "",
                      })
                    }
                    className="h-3.5 w-3.5"
                  />
                  Override
                </label>
              </div>

              {form.pnlOverride ? (
                <div className="mt-2">
                  <NumInput
                    value={form.pnl}
                    onChange={(v) => setForm({ ...form, pnl: v })}
                    placeholder="Exact P/L from broker"
                    allowNegative
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Use a negative value for losses (e.g. -25.00).
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <div
                    className={`text-2xl font-extrabold tracking-tight ${
                      effectivePnl == null
                        ? "text-muted-foreground"
                        : effectivePnl > 0
                          ? "text-profit"
                          : effectivePnl < 0
                            ? "text-loss"
                            : "text-foreground"
                    }`}
                    style={{ letterSpacing: "-0.025em" }}
                  >
                    {effectivePnl == null ? "—" : formatCurrency(effectivePnl)}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Based on lot × pip × pip-value (USD account approximation).
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Risk Management" icon={Shield} description="Stops, targets, R:R and exposure">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Stop loss">
                <NumInput value={form.sl} onChange={(v) => setForm({ ...form, sl: v })} placeholder="1.08300" />
              </Field>
              <Field label="Take profit">
                <NumInput value={form.tp} onChange={(v) => setForm({ ...form, tp: v })} placeholder="1.09000" />
              </Field>
              <Field label="Risk %">
                <NumInput value={form.riskPercent} onChange={(v) => setForm({ ...form, riskPercent: v })} placeholder="1.0" />
              </Field>
              <Field label="R:R (auto)">
                <div className="flex h-11 items-center rounded-xl border border-border bg-input/40 px-3 text-sm font-semibold">
                  {calc.rr !== null ? `1 : ${calc.rr.toFixed(2)}` : "—"}
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Strategy" icon={Lightbulb} description="What was the setup and context?">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Strategy">
                <Select value={form.strategy} onValueChange={(v) => setForm({ ...form, strategy: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-input border-border">
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Session">
                <Select
                  value={form.session}
                  onValueChange={(v) => setForm({ ...form, session: v as SessionType })}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="new_york">New York</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Confidence (1–5)">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setForm({ ...form, confidence: n })}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                      form.confidence === n
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]"
                        : "bg-input text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Psychology" icon={Brain} description="How did you feel before and after?">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Emotion before">
                <Select value={form.emotionBefore} onValueChange={(v) => setForm({ ...form, emotionBefore: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-input border-border">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Emotion after">
                <Select value={form.emotionAfter} onValueChange={(v) => setForm({ ...form, emotionAfter: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-input border-border">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Mistakes made">
              <div className="flex flex-wrap gap-2">
                {COMMON_MISTAKES.map((m) => {
                  const active = form.mistakes.includes(m);
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggleMistake(m)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border-destructive/50 bg-destructive/15 text-destructive"
                          : "border-border bg-input text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Checkbox checked={active} className="h-3 w-3 pointer-events-none" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          <Section title="Notes & Screenshot" icon={FileText} description="Why this trade? What did you learn?">
            <Field label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Setup, reasoning, lessons learned…"
                className="rounded-xl bg-input border-border resize-none"
              />
            </Field>

            <Field label="Chart screenshot">
              {screenshotPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img src={screenshotPreview} alt="Trade screenshot" className="w-full" />
                  <button
                    type="button"
                    onClick={() => handleScreenshot(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : existingSignedUrl && !removeExisting ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img src={existingSignedUrl} alt="Current screenshot" className="w-full" />
                  <div className="absolute right-2 top-2 flex gap-2">
                    <label className="cursor-pointer rounded-full bg-black/60 p-1.5 text-white">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleScreenshot(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setRemoveExisting(true)}
                      className="rounded-full bg-black/60 p-1.5 text-white"
                      aria-label="Remove existing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-input/50 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
                  <Upload className="h-5 w-5" />
                  <span>Tap to upload chart</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleScreenshot(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </Field>
          </Section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <SummaryStrip
              pair={form.pair}
              side={form.side}
              pips={calc.pips}
              rr={calc.rr}
              pnl={effectivePnl}
              outcome={calc.outcome}
              hasExit={!!form.exit}
              vertical
            />
          </div>
        </aside>
      </div>

      <div className="sticky bottom-24 mt-6 lg:bottom-6">
        <div className="mx-auto flex max-w-6xl gap-3 pb-2">
          <Button
            type="button"
            variant="outline"
            asChild
            className="h-12 flex-1 rounded-xl border-border bg-surface"
          >
            <Link to="/app/trades/$tradeId" params={{ tradeId }}>
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 flex-[2] rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
          {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SummaryStrip({
  pair,
  side,
  pips,
  rr,
  pnl,
  outcome,
  hasExit,
  vertical,
}: {
  pair: string;
  side: "buy" | "sell";
  pips: number;
  rr: number | null;
  pnl: number | null;
  outcome: "profit" | "loss" | "breakeven";
  hasExit: boolean;
  vertical?: boolean;
}) {
  const pnlColor =
    pnl == null || !hasExit
      ? "text-muted-foreground"
      : pnl > 0
        ? "text-profit"
        : pnl < 0
          ? "text-loss"
          : "text-foreground";
  const badgeColor = !hasExit
    ? "bg-input text-muted-foreground"
    : outcome === "profit"
      ? "bg-profit/15 text-profit"
      : outcome === "loss"
        ? "bg-loss/15 text-loss"
        : "bg-input text-muted-foreground";

  if (vertical) {
    return (
      <div className="surface-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </p>
            <p className="mt-0.5 text-base font-bold">
              {pair} <span className="text-xs font-medium uppercase text-muted-foreground">{side}</span>
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {!hasExit ? "Open" : outcome}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">P/L</p>
          <p className={`text-3xl font-extrabold tracking-tight ${pnlColor}`} style={{ letterSpacing: "-0.025em" }}>
            {pnl == null ? "—" : formatCurrency(pnl)}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pips</p>
            <p className={`text-base font-bold ${pips > 0 ? "text-profit" : pips < 0 ? "text-loss" : ""}`}>
              {hasExit ? `${pips > 0 ? "+" : ""}${pips.toFixed(1)}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">R:R</p>
            <p className="text-base font-bold">{rr !== null ? `1 : ${rr.toFixed(2)}` : "—"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card flex items-center justify-between gap-3 rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
          {!hasExit ? "Open" : outcome}
        </span>
        <div className="text-xs">
          <p className="font-bold">{pair}</p>
          <p className="text-[10px] uppercase text-muted-foreground">{side}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Pips</p>
          <p className={`text-sm font-bold ${pips > 0 ? "text-profit" : pips < 0 ? "text-loss" : ""}`}>
            {hasExit ? `${pips > 0 ? "+" : ""}${pips.toFixed(1)}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">R:R</p>
          <p className="text-sm font-bold">{rr !== null ? rr.toFixed(2) : "—"}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">P/L</p>
          <p className={`text-sm font-extrabold ${pnlColor}`}>
            {pnl == null ? "—" : formatCurrency(pnl)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  allowNegative,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowNegative?: boolean;
}) {
  return (
    <Input
      inputMode="decimal"
      type="text"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        const re = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
        if (v === "" || re.test(v)) onChange(v);
      }}
      placeholder={placeholder}
      className="h-11 rounded-xl bg-input border-border"
    />
  );
}
