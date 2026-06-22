import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, LineChart, Target, ArrowRight } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const SLIDES = [{
  icon: BookOpen,
  title: "Track Every Trade",
  text: "Log entries, exits, and outcomes with precision. Never lose a setup again.",
  accent: "primary"
}, {
  icon: LineChart,
  title: "Learn From Data",
  text: "Discover your strengths, weaknesses, and patterns with powerful analytics.",
  accent: "success"
}, {
  icon: Target,
  title: "Trade Smarter",
  text: "Build consistency, master discipline, and improve performance over time.",
  accent: "primary"
}];
function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[step];
  const Icon = slide.icon;
  const next = () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      if (typeof window !== "undefined") localStorage.setItem("piplog_onboarded", "1");
      navigate({
        to: "/register"
      });
    }
  };
  const skip = () => {
    if (typeof window !== "undefined") localStorage.setItem("piplog_onboarded", "1");
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto flex min-h-screen max-w-md flex-col px-6 py-8", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: skip, className: "text-sm font-medium text-muted-foreground hover:text-foreground", children: "Skip" }) }),
    /* @__PURE__ */ jsx("h1", { className: "sr-only", children: "Welcome to PipLog — Your Premium Forex Trading Journal" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 flex-col items-center justify-center text-center", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      x: 30
    }, animate: {
      opacity: 1,
      x: 0
    }, exit: {
      opacity: 0,
      x: -30
    }, transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }, className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-28 w-28 items-center justify-center rounded-3xl", style: {
        background: slide.accent === "success" ? "var(--gradient-success)" : "var(--gradient-primary)",
        boxShadow: slide.accent === "success" ? "var(--shadow-glow-success)" : "var(--shadow-glow-primary)"
      }, children: /* @__PURE__ */ jsx(Icon, { className: "h-12 w-12 text-white", strokeWidth: 2 }) }),
      /* @__PURE__ */ jsx("h2", { className: "mt-10 text-3xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: slide.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xs text-base leading-relaxed text-muted-foreground", children: slide.text })
    ] }, step) }) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-2 pb-8", children: SLIDES.map((_, i) => /* @__PURE__ */ jsx("button", { onClick: () => setStep(i), className: `h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-1.5 bg-border"}`, "aria-label": `Go to slide ${i + 1}` }, i)) }),
    /* @__PURE__ */ jsxs(Button, { size: "lg", onClick: next, className: "h-14 w-full rounded-2xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
      background: "var(--gradient-primary)"
    }, children: [
      step === SLIDES.length - 1 ? "Get Started" : "Next",
      /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-5 w-5" })
    ] })
  ] });
}
export {
  OnboardingPage as component
};
