import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, Target, Brain, AlertCircle } from "lucide-react";
import { R as Route, u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { f as formatCurrency } from "./trade-utils-DspPNmfQ.js";
import { b as buttonVariants, B as Button } from "./button-DWfIo_Ug.js";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { c as cn } from "./utils-H80jjgLf.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function TradeDetailPage() {
  const {
    tradeId
  } = Route.useParams();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [screenshotSignedUrl, setScreenshotSignedUrl] = useState(null);
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
      setTrade(data);
      if (data.screenshot_url) {
        const {
          data: signed
        } = await supabase.storage.from("trade-screenshots").createSignedUrl(data.screenshot_url, 3600);
        setScreenshotSignedUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
  }, [tradeId, user]);
  const handleDelete = async () => {
    if (!trade) return;
    const {
      error
    } = await supabase.from("trades").delete().eq("id", trade.id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    if (trade.screenshot_url) {
      await supabase.storage.from("trade-screenshots").remove([trade.screenshot_url]);
    }
    toast.success("Trade deleted");
    navigate({
      to: "/app/trades"
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("p", { className: "px-5 pt-12 text-center text-sm text-muted-foreground", children: "Loading…" });
  }
  if (!trade) {
    return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-12 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Trade not found." }),
      /* @__PURE__ */ jsx(Link, { to: "/app/trades", className: "mt-4 inline-block text-sm font-semibold text-primary", children: "← Back to trades" })
    ] });
  }
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const date = new Date(trade.opened_at);
  return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(Link, { to: "/app/trades", className: "flex h-10 w-10 items-center justify-center rounded-xl bg-surface", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Link, { to: "/app/trades/$tradeId/edit", params: {
          tradeId: trade.id
        }, className: "flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-primary", "aria-label": "Edit trade", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-loss", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxs(AlertDialogContent, { className: "rounded-2xl border-border bg-card", children: [
            /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete this trade?" }),
              /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action can't be undone. The trade and its screenshot will be permanently removed." })
            ] }),
            /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsx(AlertDialogCancel, { className: "rounded-xl", children: "Cancel" }),
              /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, className: "rounded-xl bg-destructive", children: "Delete" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 surface-card rounded-3xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight", style: {
          letterSpacing: "-0.025em"
        }, children: trade.pair }),
        /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${trade.side === "buy" ? "bg-profit/18 text-profit" : "bg-loss/18 text-loss"}`, children: trade.side }),
        trade.result && /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${isWin ? "bg-profit/18 text-profit" : isLoss ? "bg-loss/18 text-loss" : "bg-muted text-muted-foreground"}`, children: trade.result })
      ] }),
      /* @__PURE__ */ jsx("p", { className: `mt-3 text-3xl font-extrabold tracking-tight ${(trade.pnl ?? 0) > 0 ? "text-profit" : (trade.pnl ?? 0) < 0 ? "text-loss" : ""}`, children: trade.pnl !== null ? formatCurrency(Number(trade.pnl)) : "Open" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        trade.pips !== null ? `${Number(trade.pips) > 0 ? "+" : ""}${Number(trade.pips).toFixed(1)} pips` : "—",
        trade.rr_ratio ? ` · 1:${Number(trade.rr_ratio).toFixed(2)} RR` : ""
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
          " ",
          date.toLocaleDateString()
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
          " ",
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        ] })
      ] })
    ] }),
    screenshotSignedUrl && /* @__PURE__ */ jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-border", children: /* @__PURE__ */ jsx("img", { src: screenshotSignedUrl, alt: "Trade chart", className: "w-full" }) }),
    /* @__PURE__ */ jsxs(Section, { title: "Prices", children: [
      /* @__PURE__ */ jsx(Row, { label: "Entry", value: Number(trade.entry_price).toFixed(5) }),
      trade.exit_price !== null && /* @__PURE__ */ jsx(Row, { label: "Exit", value: Number(trade.exit_price).toFixed(5) }),
      trade.stop_loss !== null && /* @__PURE__ */ jsx(Row, { label: "Stop loss", value: Number(trade.stop_loss).toFixed(5) }),
      trade.take_profit !== null && /* @__PURE__ */ jsx(Row, { label: "Take profit", value: Number(trade.take_profit).toFixed(5) }),
      trade.lot_size !== null && /* @__PURE__ */ jsx(Row, { label: "Lot size", value: String(trade.lot_size) }),
      trade.risk_percent !== null && /* @__PURE__ */ jsx(Row, { label: "Risk", value: `${trade.risk_percent}%` })
    ] }),
    (trade.strategy || trade.session || trade.confidence) && /* @__PURE__ */ jsxs(Section, { title: "Context", icon: Target, children: [
      trade.strategy && /* @__PURE__ */ jsx(Row, { label: "Strategy", value: trade.strategy }),
      trade.session && /* @__PURE__ */ jsx(Row, { label: "Session", value: trade.session.replace("_", " "), capitalize: true }),
      trade.confidence && /* @__PURE__ */ jsx(Row, { label: "Confidence", value: `${"●".repeat(trade.confidence)}${"○".repeat(5 - trade.confidence)}` })
    ] }),
    (trade.emotion_before || trade.emotion_after) && /* @__PURE__ */ jsxs(Section, { title: "Psychology", icon: Brain, children: [
      trade.emotion_before && /* @__PURE__ */ jsx(Row, { label: "Before", value: trade.emotion_before }),
      trade.emotion_after && /* @__PURE__ */ jsx(Row, { label: "After", value: trade.emotion_after })
    ] }),
    trade.mistakes && trade.mistakes.length > 0 && /* @__PURE__ */ jsx(Section, { title: "Mistakes", icon: AlertCircle, children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: trade.mistakes.map((m) => /* @__PURE__ */ jsx("span", { className: "rounded-full bg-loss/15 px-2.5 py-1 text-xs font-medium text-loss", children: m }, m)) }) }),
    trade.notes && /* @__PURE__ */ jsx(Section, { title: "Notes", children: /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: trade.notes }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "h-12 flex-1 rounded-xl border-border bg-surface", children: /* @__PURE__ */ jsx(Link, { to: "/app/trades", children: "Back" }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "h-12 flex-1 rounded-xl text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
        background: "var(--gradient-primary)"
      }, children: /* @__PURE__ */ jsxs(Link, { to: "/app/trades/$tradeId/edit", params: {
        tradeId: trade.id
      }, children: [
        /* @__PURE__ */ jsx(Pencil, { className: "mr-2 h-4 w-4" }),
        " Edit Trade"
      ] }) })
    ] })
  ] });
}
function Section({
  title,
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: "mt-4 surface-card rounded-2xl p-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
      Icon && /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      title
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children })
  ] });
}
function Row({
  label,
  value,
  capitalize
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("span", { className: `font-medium ${capitalize ? "capitalize" : ""}`, children: value })
  ] });
}
export {
  TradeDetailPage as component
};
