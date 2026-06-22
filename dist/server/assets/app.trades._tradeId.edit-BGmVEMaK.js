import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Activity, TrendingUp, TrendingDown, Calculator, Shield, Lightbulb, Brain, FileText, X, Upload, Loader2, Save } from "lucide-react";
import { b as Route, u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { c as calculatePnl, a as calculatePips, e as calculateRR, b as detectOutcome, P as POPULAR_PAIRS, f as formatCurrency, S as STRATEGIES, E as EMOTIONS, C as COMMON_MISTAKES, d as determineResult } from "./trade-utils-DspPNmfQ.js";
import { B as Button } from "./button-DWfIo_Ug.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, T as Textarea } from "./select-B98MpgCE.js";
import { C as Checkbox } from "./checkbox-Bd1q64ph.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
function toLocalInput(iso) {
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 6e4;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}
function EditTradePage() {
  const {
    tradeId
  } = Route.useParams();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [existingScreenshot, setExistingScreenshot] = useState(null);
  const [existingSignedUrl, setExistingSignedUrl] = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data,
        error
      } = await supabase.from("trades").select("*").eq("id", tradeId).maybeSingle();
      if (error || !data) {
        setLoading(false);
        return;
      }
      const lot = Number(data.lot_size) || 0;
      const auto = data.entry_price && data.exit_price && lot ? calculatePnl({
        pair: data.pair,
        side: data.side ?? "buy",
        entry: Number(data.entry_price),
        exit: Number(data.exit_price),
        lotSize: lot
      }) : null;
      const stored = data.pnl != null ? Number(data.pnl) : null;
      const overrideActive = stored != null && (auto == null || Math.abs(stored - auto) > 0.01);
      setForm({
        pair: data.pair,
        side: data.side ?? "buy",
        lotSize: data.lot_size != null ? String(data.lot_size) : "",
        entry: data.entry_price != null ? String(data.entry_price) : "",
        exit: data.exit_price != null ? String(data.exit_price) : "",
        sl: data.stop_loss != null ? String(data.stop_loss) : "",
        tp: data.take_profit != null ? String(data.take_profit) : "",
        riskPercent: data.risk_percent != null ? String(data.risk_percent) : "",
        pnl: data.pnl != null ? String(data.pnl) : "",
        pnlOverride: overrideActive,
        strategy: data.strategy ?? "",
        session: data.session ?? "london",
        confidence: data.confidence ?? 3,
        emotionBefore: data.emotion_before ?? "",
        emotionAfter: data.emotion_after ?? "",
        mistakes: data.mistakes ?? [],
        notes: data.notes ?? "",
        openedAt: toLocalInput(data.opened_at)
      });
      if (data.screenshot_url) {
        setExistingScreenshot(data.screenshot_url);
        const {
          data: signed
        } = await supabase.storage.from("trade-screenshots").createSignedUrl(data.screenshot_url, 3600);
        setExistingSignedUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
  }, [tradeId, user]);
  const calc = useMemo(() => {
    if (!form) return {
      pips: 0,
      rr: null,
      autoPnl: 0,
      outcome: "breakeven"
    };
    const entry = parseFloat(form.entry);
    const exit = parseFloat(form.exit);
    const sl = parseFloat(form.sl);
    const tp = parseFloat(form.tp);
    const lot = parseFloat(form.lotSize);
    const pips = entry && exit ? calculatePips({
      pair: form.pair,
      side: form.side,
      entry,
      exit
    }) : 0;
    const rr = calculateRR({
      entry,
      stopLoss: isNaN(sl) ? null : sl,
      takeProfit: isNaN(tp) ? null : tp,
      side: form.side
    });
    const autoPnl = entry && exit && lot ? calculatePnl({
      pair: form.pair,
      side: form.side,
      entry,
      exit,
      lotSize: lot
    }) : 0;
    const outcome = entry && exit ? detectOutcome({
      side: form.side,
      entry,
      exit
    }) : "breakeven";
    return {
      pips,
      rr,
      autoPnl,
      outcome
    };
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
  const handleScreenshot = (file) => {
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
  const toggleMistake = (m) => {
    if (!form) return;
    setForm({
      ...form,
      mistakes: form.mistakes.includes(m) ? form.mistakes.filter((x) => x !== m) : [...form.mistakes, m]
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !form) return;
    if (!form.pair || !form.entry) {
      toast.error("Pair and entry price are required");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl = existingScreenshot;
      const oldScreenshotToRemove = (removeExisting || screenshot) && existingScreenshot ? existingScreenshot : null;
      if (removeExisting && !screenshot) {
        screenshotUrl = null;
      }
      if (screenshot) {
        const ext = screenshot.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const {
          error: uploadErr
        } = await supabase.storage.from("trade-screenshots").upload(path, screenshot, {
          contentType: screenshot.type
        });
        if (uploadErr) throw uploadErr;
        screenshotUrl = path;
      }
      const result = form.exit ? determineResult(effectivePnl) : "open";
      const {
        error
      } = await supabase.from("trades").update({
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
        closed_at: form.exit ? (/* @__PURE__ */ new Date()).toISOString() : null
      }).eq("id", tradeId);
      if (error) throw error;
      if (oldScreenshotToRemove) {
        await supabase.storage.from("trade-screenshots").remove([oldScreenshotToRemove]);
      }
      toast.success("Trade updated ✓");
      navigate({
        to: "/app/trades/$tradeId",
        params: {
          tradeId
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update trade";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("p", { className: "px-5 pt-12 text-center text-sm text-muted-foreground", children: "Loading…" });
  }
  if (!form) {
    return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-12 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Trade not found." }),
      /* @__PURE__ */ jsx(Link, { to: "/app/trades", className: "mt-4 inline-block text-sm font-semibold text-primary", children: "← Back to trades" })
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "mx-auto flex max-w-6xl items-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/app/trades/$tradeId", params: {
        tradeId
      }, className: "flex h-10 w-10 items-center justify-center rounded-xl bg-surface", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight sm:text-3xl", style: {
          letterSpacing: "-0.025em"
        }, children: "Edit Trade" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Update any field below." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto mt-5 max-w-6xl lg:hidden", children: /* @__PURE__ */ jsx(SummaryStrip, { pair: form.pair, side: form.side, pips: calc.pips, rr: calc.rr, pnl: effectivePnl, outcome: calc.outcome, hasExit: !!form.exit }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-6 grid max-w-6xl gap-5 lg:grid-cols-[1fr_320px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Section, { title: "Trade Details", icon: Activity, description: "Pair, direction, lot size, prices", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Pair", children: /* @__PURE__ */ jsxs(Select, { value: form.pair, onValueChange: (v) => setForm({
              ...form,
              pair: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-11 rounded-xl bg-input border-border", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsx(SelectContent, { children: POPULAR_PAIRS.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p)) })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Direction", children: /* @__PURE__ */ jsx("div", { className: "flex h-11 items-center rounded-xl bg-input p-1", children: ["buy", "sell"].map((s) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setForm({
              ...form,
              side: s
            }), className: `flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold capitalize transition ${form.side === s ? s === "buy" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground" : "text-muted-foreground"}`, children: [
              s === "buy" ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(TrendingDown, { className: "h-3.5 w-3.5" }),
              s
            ] }, s)) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Lot size", children: /* @__PURE__ */ jsx(NumInput, { value: form.lotSize, onChange: (v) => setForm({
              ...form,
              lotSize: v
            }), placeholder: "0.10" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Date & time", children: /* @__PURE__ */ jsx(Input, { type: "datetime-local", value: form.openedAt, onChange: (e) => setForm({
              ...form,
              openedAt: e.target.value
            }), className: "h-11 rounded-xl bg-input border-border" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Entry price", children: /* @__PURE__ */ jsx(NumInput, { value: form.entry, onChange: (v) => setForm({
              ...form,
              entry: v
            }), placeholder: "1.08500" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Exit price", children: /* @__PURE__ */ jsx(NumInput, { value: form.exit, onChange: (v) => setForm({
              ...form,
              exit: v
            }), placeholder: "1.08750" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-input/40 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Calculator, { className: "h-3.5 w-3.5" }),
                " Auto-calculated P/L"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Checkbox, { checked: form.pnlOverride, onCheckedChange: (c) => setForm({
                  ...form,
                  pnlOverride: !!c,
                  pnl: c ? calc.autoPnl ? String(calc.autoPnl) : form.pnl : ""
                }), className: "h-3.5 w-3.5" }),
                "Override"
              ] })
            ] }),
            form.pnlOverride ? /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
              /* @__PURE__ */ jsx(NumInput, { value: form.pnl, onChange: (v) => setForm({
                ...form,
                pnl: v
              }), placeholder: "Exact P/L from broker", allowNegative: true }),
              /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[10px] text-muted-foreground", children: "Use a negative value for losses (e.g. -25.00)." })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
              /* @__PURE__ */ jsx("div", { className: `text-2xl font-extrabold tracking-tight ${effectivePnl == null ? "text-muted-foreground" : effectivePnl > 0 ? "text-profit" : effectivePnl < 0 ? "text-loss" : "text-foreground"}`, style: {
                letterSpacing: "-0.025em"
              }, children: effectivePnl == null ? "—" : formatCurrency(effectivePnl) }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Based on lot × pip × pip-value (USD account approximation)." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Section, { title: "Risk Management", icon: Shield, description: "Stops, targets, R:R and exposure", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Stop loss", children: /* @__PURE__ */ jsx(NumInput, { value: form.sl, onChange: (v) => setForm({
            ...form,
            sl: v
          }), placeholder: "1.08300" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Take profit", children: /* @__PURE__ */ jsx(NumInput, { value: form.tp, onChange: (v) => setForm({
            ...form,
            tp: v
          }), placeholder: "1.09000" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Risk %", children: /* @__PURE__ */ jsx(NumInput, { value: form.riskPercent, onChange: (v) => setForm({
            ...form,
            riskPercent: v
          }), placeholder: "1.0" }) }),
          /* @__PURE__ */ jsx(Field, { label: "R:R (auto)", children: /* @__PURE__ */ jsx("div", { className: "flex h-11 items-center rounded-xl border border-border bg-input/40 px-3 text-sm font-semibold", children: calc.rr !== null ? `1 : ${calc.rr.toFixed(2)}` : "—" }) })
        ] }) }),
        /* @__PURE__ */ jsxs(Section, { title: "Strategy", icon: Lightbulb, description: "What was the setup and context?", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Strategy", children: /* @__PURE__ */ jsxs(Select, { value: form.strategy, onValueChange: (v) => setForm({
              ...form,
              strategy: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-11 rounded-xl bg-input border-border", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose…" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: STRATEGIES.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s)) })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Session", children: /* @__PURE__ */ jsxs(Select, { value: form.session, onValueChange: (v) => setForm({
              ...form,
              session: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-11 rounded-xl bg-input border-border", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "asia", children: "Asia" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "london", children: "London" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "new_york", children: "New York" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "other", children: "Other" })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Confidence (1–5)", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForm({
            ...form,
            confidence: n
          }), className: `flex-1 rounded-xl py-2.5 text-sm font-bold transition ${form.confidence === n ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]" : "bg-input text-muted-foreground"}`, children: n }, n)) }) })
        ] }),
        /* @__PURE__ */ jsxs(Section, { title: "Psychology", icon: Brain, description: "How did you feel before and after?", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Emotion before", children: /* @__PURE__ */ jsxs(Select, { value: form.emotionBefore, onValueChange: (v) => setForm({
              ...form,
              emotionBefore: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-11 rounded-xl bg-input border-border", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "—" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: EMOTIONS.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: e }, e)) })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Emotion after", children: /* @__PURE__ */ jsxs(Select, { value: form.emotionAfter, onValueChange: (v) => setForm({
              ...form,
              emotionAfter: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-11 rounded-xl bg-input border-border", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "—" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: EMOTIONS.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: e }, e)) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Mistakes made", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: COMMON_MISTAKES.map((m) => {
            const active = form.mistakes.includes(m);
            return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleMistake(m), className: `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-destructive/50 bg-destructive/15 text-destructive" : "border-border bg-input text-muted-foreground hover:text-foreground"}`, children: [
              /* @__PURE__ */ jsx(Checkbox, { checked: active, className: "h-3 w-3 pointer-events-none" }),
              m
            ] }, m);
          }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Section, { title: "Notes & Screenshot", icon: FileText, description: "Why this trade? What did you learn?", children: [
          /* @__PURE__ */ jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsx(Textarea, { value: form.notes, onChange: (e) => setForm({
            ...form,
            notes: e.target.value
          }), rows: 4, placeholder: "Setup, reasoning, lessons learned…", className: "rounded-xl bg-input border-border resize-none" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Chart screenshot", children: screenshotPreview ? /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-xl border border-border", children: [
            /* @__PURE__ */ jsx("img", { src: screenshotPreview, alt: "Trade screenshot", className: "w-full" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleScreenshot(null), className: "absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white", "aria-label": "Remove", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }) : existingSignedUrl && !removeExisting ? /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-xl border border-border", children: [
            /* @__PURE__ */ jsx("img", { src: existingSignedUrl, alt: "Current screenshot", className: "w-full" }),
            /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-2 flex gap-2", children: [
              /* @__PURE__ */ jsxs("label", { className: "cursor-pointer rounded-full bg-black/60 p-1.5 text-white", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleScreenshot(e.target.files?.[0] ?? null) })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setRemoveExisting(true), className: "rounded-full bg-black/60 p-1.5 text-white", "aria-label": "Remove existing", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
            ] })
          ] }) : /* @__PURE__ */ jsxs("label", { className: "flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-input/50 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground", children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { children: "Tap to upload chart" }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleScreenshot(e.target.files?.[0] ?? null) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsx("div", { className: "sticky top-6 space-y-4", children: /* @__PURE__ */ jsx(SummaryStrip, { pair: form.pair, side: form.side, pips: calc.pips, rr: calc.rr, pnl: effectivePnl, outcome: calc.outcome, hasExit: !!form.exit, vertical: true }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sticky bottom-24 mt-6 lg:bottom-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl gap-3 pb-2", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", asChild: true, className: "h-12 flex-1 rounded-xl border-border bg-surface", children: /* @__PURE__ */ jsx(Link, { to: "/app/trades/$tradeId", params: {
        tradeId
      }, children: "Cancel" }) }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "h-12 flex-[2] rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
        background: "var(--gradient-primary)"
      }, children: submitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
        " Save Changes"
      ] }) })
    ] }) })
  ] });
}
function Section({
  title,
  description,
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: "surface-card rounded-2xl p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold tracking-tight", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: description })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children })
  ] });
}
function SummaryStrip({
  pair,
  side,
  pips,
  rr,
  pnl,
  outcome,
  hasExit,
  vertical
}) {
  const pnlColor = pnl == null || !hasExit ? "text-muted-foreground" : pnl > 0 ? "text-profit" : pnl < 0 ? "text-loss" : "text-foreground";
  const badgeColor = !hasExit ? "bg-input text-muted-foreground" : outcome === "profit" ? "bg-profit/15 text-profit" : outcome === "loss" ? "bg-loss/15 text-loss" : "bg-input text-muted-foreground";
  if (vertical) {
    return /* @__PURE__ */ jsxs("div", { className: "surface-card rounded-2xl p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Live preview" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-base font-bold", children: [
            pair,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase text-muted-foreground", children: side })
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`, children: !hasExit ? "Open" : outcome })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "P/L" }),
        /* @__PURE__ */ jsx("p", { className: `text-3xl font-extrabold tracking-tight ${pnlColor}`, style: {
          letterSpacing: "-0.025em"
        }, children: pnl == null ? "—" : formatCurrency(pnl) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Pips" }),
          /* @__PURE__ */ jsx("p", { className: `text-base font-bold ${pips > 0 ? "text-profit" : pips < 0 ? "text-loss" : ""}`, children: hasExit ? `${pips > 0 ? "+" : ""}${pips.toFixed(1)}` : "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "R:R" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-bold", children: rr !== null ? `1 : ${rr.toFixed(2)}` : "—" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "surface-card flex items-center justify-between gap-3 rounded-2xl p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: `rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`, children: !hasExit ? "Open" : outcome }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold", children: pair }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: side })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-right", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Pips" }),
        /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${pips > 0 ? "text-profit" : pips < 0 ? "text-loss" : ""}`, children: hasExit ? `${pips > 0 ? "+" : ""}${pips.toFixed(1)}` : "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground", children: "R:R" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: rr !== null ? rr.toFixed(2) : "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground", children: "P/L" }),
        /* @__PURE__ */ jsx("p", { className: `text-sm font-extrabold ${pnlColor}`, children: pnl == null ? "—" : formatCurrency(pnl) })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1.5", children })
  ] });
}
function NumInput({
  value,
  onChange,
  placeholder,
  allowNegative
}) {
  return /* @__PURE__ */ jsx(Input, { inputMode: "decimal", type: "text", value, onChange: (e) => {
    const v = e.target.value;
    const re = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    if (v === "" || re.test(v)) onChange(v);
  }, placeholder, className: "h-11 rounded-xl bg-input border-border" });
}
export {
  EditTradePage as component
};
