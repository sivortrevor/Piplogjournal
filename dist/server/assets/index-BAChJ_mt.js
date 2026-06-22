import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
function SplashPage() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (done) {
      const seen = typeof window !== "undefined" && localStorage.getItem("piplog_onboarded");
      window.location.href = seen ? "/login" : "/onboarding";
    }
  }, [done]);
  return /* @__PURE__ */ jsx("main", { className: "flex min-h-screen items-center justify-center px-6", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
    opacity: 0,
    scale: 0.9
  }, animate: {
    opacity: 1,
    scale: 1
  }, transition: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
  }, className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsx(motion.div, { initial: {
      y: 8
    }, animate: {
      y: 0
    }, transition: {
      duration: 0.8,
      ease: "easeOut"
    }, children: /* @__PURE__ */ jsx(PipLogLogo, { size: 160 }) }),
    /* @__PURE__ */ jsx(motion.h1, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, transition: {
      delay: 0.4,
      duration: 0.6
    }, className: "mt-6 text-center text-2xl font-extrabold tracking-tight", style: {
      letterSpacing: "-0.025em"
    }, children: "PipLog — The Premium Forex Trading Journal" }),
    /* @__PURE__ */ jsx(motion.p, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, transition: {
      delay: 0.5,
      duration: 0.6
    }, className: "mt-3 max-w-sm text-center text-sm font-medium leading-relaxed text-muted-foreground", children: "Log every trade, analyze your performance, control your emotions, and grow consistently with data-driven insights designed for serious forex traders." }),
    /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, transition: {
      delay: 0.8
    }, className: "mt-12 flex gap-1.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(motion.span, { className: "h-1.5 w-1.5 rounded-full bg-primary", animate: {
      opacity: [0.3, 1, 0.3]
    }, transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: i * 0.2
    } }, i)) })
  ] }) });
}
export {
  SplashPage as component
};
