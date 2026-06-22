import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { f as formatCurrency } from "./trade-utils-DspPNmfQ.js";
import { X, Menu, Settings, LogOut, Sparkles, TrendingUp, TrendingDown, Plus, History, BarChart3, BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { c as cn } from "./utils-H80jjgLf.js";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
import "@supabase/supabase-js";
import "sonner";
import "clsx";
import "tailwind-merge";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
const STARTING_BALANCE = 1e4;
const QUOTES = ["Protect capital first. Profits follow.", "Discipline beats conviction.", "The market rewards patience.", "Risk less, win more.", "Plan the trade, trade the plan."];
const RANGES = [{
  id: "1D",
  days: 1
}, {
  id: "1W",
  days: 7
}, {
  id: "1M",
  days: 30
}, {
  id: "3M",
  days: 90
}, {
  id: "1Y",
  days: 365
}, {
  id: "ALL",
  days: Infinity
}];
const MOCK_MARKET = [{
  pair: "GBPUSD",
  change: 0.25
}, {
  pair: "EURUSD",
  change: -0.12
}, {
  pair: "USDJPY",
  change: 0.08
}, {
  pair: "XAUUSD",
  change: 1.1
}];
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function DashboardPage() {
  const {
    user
  } = useAuth();
  const [trades, setTrades] = useState([]);
  const [displayName, setDisplayName] = useState("Trader");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [range, setRange] = useState("1M");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{
        data: trs
      }, {
        data: prof
      }] = await Promise.all([supabase.from("trades").select("id, pair, pnl, rr_ratio, result, session, opened_at").order("opened_at", {
        ascending: true
      }), supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle()]);
      setTrades(trs ?? []);
      setDisplayName(prof?.display_name ?? user.email?.split("@")[0] ?? "Trader");
      setAvatarUrl(prof?.avatar_url ?? null);
    })();
  }, [user]);
  const quote = useMemo(() => QUOTES[(/* @__PURE__ */ new Date()).getDate() % QUOTES.length], []);
  const greeting = useMemo(() => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
  const metrics = useMemo(() => {
    const closed = trades.filter((t) => t.result && t.result !== "open");
    const wins = closed.filter((t) => t.result === "win");
    closed.filter((t) => t.result === "loss");
    const netPnl = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const balance = STARTING_BALANCE + netPnl;
    const growth = netPnl / STARTING_BALANCE * 100;
    const winRate = closed.length ? wins.length / closed.length * 100 : 0;
    const now = /* @__PURE__ */ new Date();
    const todayPnl = trades.filter((t) => sameDay(new Date(t.opened_at), now)).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    let running = STARTING_BALANCE;
    let peak = STARTING_BALANCE;
    let maxDD = 0;
    const curve = trades.map((t) => {
      running += Number(t.pnl) || 0;
      peak = Math.max(peak, running);
      const dd = (running - peak) / peak * 100;
      if (dd < maxDD) maxDD = dd;
      return {
        t: new Date(t.opened_at).getTime(),
        equity: Math.round(running * 100) / 100
      };
    });
    const currentDD = (running - peak) / peak * 100;
    const rrTrades = closed.filter((t) => t.rr_ratio);
    const avgRR = rrTrades.length ? rrTrades.reduce((s, t) => s + Number(t.rr_ratio), 0) / rrTrades.length : 0;
    let streak = 0;
    let streakType = null;
    for (let i = closed.length - 1; i >= 0; i--) {
      const r = closed[i].result;
      if (r === "breakeven") continue;
      if (streakType === null) streakType = r;
      if (r === streakType) streak++;
      else break;
    }
    const sessions = {
      london: 0,
      "new-york": 0,
      asia: 0
    };
    trades.forEach((t) => {
      const k = (t.session ?? "").toLowerCase();
      if (k in sessions) sessions[k] += Number(t.pnl) || 0;
    });
    const byPair = /* @__PURE__ */ new Map();
    closed.forEach((t) => {
      const e = byPair.get(t.pair) ?? {
        wins: 0,
        total: 0
      };
      e.total += 1;
      if (t.result === "win") e.wins += 1;
      byPair.set(t.pair, e);
    });
    const bestPair = [...byPair.entries()].sort((a, b) => b[1].wins / b[1].total - a[1].wins / a[1].total)[0];
    const wkStart = startOfWeek(now);
    const weekTrades = trades.filter((t) => new Date(t.opened_at) >= wkStart);
    const weekPnl = weekTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const weekDays = new Set(weekTrades.map((t) => new Date(t.opened_at).toDateString())).size;
    return {
      netPnl,
      balance,
      growth,
      todayPnl,
      curve,
      currentDD,
      maxDD,
      avgRR,
      winRate,
      closedCount: closed.length,
      streak,
      streakType,
      sessions,
      bestPair,
      weekPnl,
      weekDays
    };
  }, [trades]);
  const filteredCurve = useMemo(() => {
    const days = RANGES.find((r) => r.id === range).days;
    if (!isFinite(days)) return metrics.curve;
    const cutoff = Date.now() - days * 864e5;
    return metrics.curve.filter((p) => p.t >= cutoff);
  }, [metrics.curve, range]);
  const insights = useMemo(() => {
    const out = [];
    const best = Object.entries(metrics.sessions).sort((a, b) => b[1] - a[1])[0];
    if (best && best[1] > 0) {
      const name = best[0] === "new-york" ? "New York" : best[0][0].toUpperCase() + best[0].slice(1);
      out.push({
        tone: "good",
        text: `${name} session performing best`
      });
    }
    if (metrics.bestPair && metrics.bestPair[1].total >= 2) {
      const wr = metrics.bestPair[1].wins / metrics.bestPair[1].total * 100;
      out.push({
        tone: "good",
        text: `${metrics.bestPair[0]} top win rate (${wr.toFixed(0)}%)`
      });
    }
    if (metrics.avgRR >= 1.5) {
      out.push({
        tone: "good",
        text: `Strong avg R:R of 1:${metrics.avgRR.toFixed(2)}`
      });
    }
    if (metrics.streakType === "loss" && metrics.streak >= 3) {
      out.push({
        tone: "warn",
        text: `Consecutive losses: ${metrics.streak}`
      });
    }
    if (metrics.currentDD <= -5) {
      out.push({
        tone: "warn",
        text: `Drawdown ${metrics.currentDD.toFixed(1)}% — reduce size`
      });
    }
    if (metrics.winRate >= 60 && metrics.closedCount >= 5) {
      out.push({
        tone: "good",
        text: `Win rate ${metrics.winRate.toFixed(0)}% — keep discipline`
      });
    }
    if (out.length === 0) {
      out.push({
        tone: "good",
        text: "Log more trades to unlock personalised insights"
      });
    }
    return out.slice(0, 3);
  }, [metrics]);
  const weeklyGoal = 500;
  const weeklyProgress = Math.max(0, Math.min(100, metrics.weekPnl / weeklyGoal * 100));
  const firstName = displayName.split(" ")[0];
  return /* @__PURE__ */ jsxs("div", { className: "px-4 pt-5", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs(Sheet, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { type: "button", className: "grid h-11 w-11 place-items-center rounded-2xl glass transition active:scale-95", "aria-label": "Open menu", children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) }) }),
        /* @__PURE__ */ jsxs(SheetContent, { side: "left", className: "w-72 border-r border-border bg-card p-0", children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "p-5 pb-3", children: [
            /* @__PURE__ */ jsx(SheetTitle, { className: "sr-only", children: "Account menu" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/15 text-primary", children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-base font-extrabold", children: displayName.slice(0, 1).toUpperCase() }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-left text-sm font-extrabold tracking-tight", children: displayName }),
                /* @__PURE__ */ jsx("p", { className: "truncate text-left text-[11px] text-muted-foreground", children: user?.email })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "px-3 pb-5", children: [
            /* @__PURE__ */ jsxs(Link, { to: "/app/settings", onClick: () => setMenuOpen(false), className: "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-accent", children: [
              /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-primary" }),
              "Settings"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: async () => {
              setMenuOpen(false);
              await supabase.auth.signOut();
            }, className: "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-muted-foreground transition hover:bg-accent", children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
              "Sign out"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-5 left-0 right-0 flex justify-center", children: /* @__PURE__ */ jsx(PipLogLogo, { size: 56 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(PipLogLogo, { size: 40 })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 rounded-3xl glass p-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground", children: today }),
      /* @__PURE__ */ jsxs("h1", { className: "mt-1 text-2xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: [
        greeting,
        ",",
        " ",
        /* @__PURE__ */ jsx("span", { className: "gradient-text", children: firstName.toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-xs italic text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: quote })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 rounded-3xl glass p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold tracking-tight", children: "Market Overview" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground", children: "Live" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: MOCK_MARKET.map((m) => {
        const up = m.change >= 0;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-input/50 px-3 py-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold tracking-tight", children: m.pair }),
          /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1 text-xs font-semibold ${up ? "text-profit" : "text-loss"}`, children: [
            up ? "▲" : "▼",
            " ",
            Math.abs(m.change).toFixed(2),
            "%"
          ] })
        ] }, m.pair);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 overflow-hidden rounded-3xl glass p-5 shadow-[var(--shadow-elevated)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Account Balance" }),
        /* @__PURE__ */ jsxs("span", { className: `flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${metrics.growth >= 0 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`, children: [
          metrics.growth >= 0 ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3" }),
          metrics.growth >= 0 ? "+" : "",
          metrics.growth.toFixed(2),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-4xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.03em"
      }, children: formatCurrency(metrics.balance) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
        "Equity ",
        formatCurrency(metrics.balance)
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsx(StatPill, { label: "Net P/L", value: formatCurrency(metrics.netPnl), tone: metrics.netPnl >= 0 ? "good" : "bad" }),
        /* @__PURE__ */ jsx(StatPill, { label: "Today", value: formatCurrency(metrics.todayPnl), tone: metrics.todayPnl > 0 ? "good" : metrics.todayPnl < 0 ? "bad" : "neutral" }),
        /* @__PURE__ */ jsx(StatPill, { label: "Drawdown", value: `${metrics.currentDD.toFixed(1)}%`, tone: metrics.currentDD <= -5 ? "bad" : "neutral" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 flex gap-1 rounded-2xl bg-input/60 p-1", children: RANGES.map((r) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setRange(r.id), className: `flex-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${range === r.id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]" : "text-muted-foreground hover:text-foreground"}`, children: r.id }, r.id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 h-40", children: filteredCurve.length > 1 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: filteredCurve, margin: {
        top: 5,
        right: 0,
        left: 0,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "eq-grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.65 0.18 256)", stopOpacity: 0.5 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.65 0.18 256)", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "t", hide: true }),
        /* @__PURE__ */ jsx(YAxis, { hide: true, domain: ["auto", "auto"] }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          background: "oklch(0.22 0.035 258)",
          border: "1px solid oklch(0.3 0.025 258)",
          borderRadius: 12,
          fontSize: 12
        }, labelStyle: {
          color: "oklch(0.72 0.02 256)"
        }, formatter: (v) => [formatCurrency(Number(v)), "Equity"], labelFormatter: (l) => new Date(Number(l)).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }) }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "equity", stroke: "oklch(0.65 0.18 256)", strokeWidth: 2.5, fill: "url(#eq-grad)" })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid h-full place-items-center text-xs text-muted-foreground", children: "Log trades to see your equity curve" }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 grid grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsx(QuickAction, { to: "/app/add", icon: Plus, label: "Add", primary: true }),
      /* @__PURE__ */ jsx(QuickAction, { to: "/app/trades", icon: History, label: "History" }),
      /* @__PURE__ */ jsx(QuickAction, { to: "/app/calendar", icon: BarChart3, label: "Calendar" }),
      /* @__PURE__ */ jsx(QuickAction, { to: "/app/journal", icon: BookOpen, label: "Journal" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 mb-4 rounded-3xl glass p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Weekly Goal" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-lg font-extrabold tracking-tight", children: [
            /* @__PURE__ */ jsx("span", { className: metrics.weekPnl >= 0 ? "text-profit" : "text-loss", children: formatCurrency(metrics.weekPnl) }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-muted-foreground", children: [
              " ",
              "/ ",
              formatCurrency(weeklyGoal)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Days" }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-extrabold", children: [
            metrics.weekDays,
            "/7"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-input", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all", style: {
        width: `${weeklyProgress}%`,
        background: "var(--gradient-primary)",
        boxShadow: "var(--shadow-glow-primary)"
      } }) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[11px] text-muted-foreground", children: [
        weeklyProgress.toFixed(0),
        "% to weekly target"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-border pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2.5 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Trading Insights" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: insights.map((i, idx) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${i.tone === "good" ? "border-profit/30 bg-profit/10 text-profit" : "border-warning/30 bg-warning/10 text-warning"}`, children: [
          i.tone === "good" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }),
          i.text
        ] }, idx)) })
      ] })
    ] })
  ] });
}
function StatPill({
  label,
  value,
  tone
}) {
  const color = tone === "good" ? "text-profit" : tone === "bad" ? "text-loss" : "text-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 rounded-2xl bg-input/50 p-2.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-0.5 truncate text-sm font-extrabold ${color}`, children: value })
  ] });
}
function QuickAction({
  to,
  icon: Icon,
  label,
  primary
}) {
  return /* @__PURE__ */ jsxs(Link, { to, className: `flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold transition active:scale-95 ${primary ? "text-primary-foreground shadow-[var(--shadow-glow-primary)]" : "glass text-foreground hover:bg-accent"}`, style: primary ? {
    background: "var(--gradient-primary)"
  } : void 0, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: 2.5 }),
    label
  ] });
}
export {
  DashboardPage as component
};
