import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LineChart, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to PipLog — Get Started" },
      {
        name: "description",
        content:
          "Get started with PipLog, your premium forex trading journal. Learn how to track trades, review your data, and trade with discipline.",
      },
      { property: "og:title", content: "Welcome to PipLog — Get Started" },
      {
        property: "og:description",
        content: "A quick tour of PipLog — the premium forex trading journal for serious traders.",
      },
      { property: "og:url", content: "https://piplog-pro-journal.lovable.app/onboarding" },
    ],
    links: [{ rel: "canonical", href: "https://piplog-pro-journal.lovable.app/onboarding" }],
  }),
  component: OnboardingPage,
});

const SLIDES = [
  {
    icon: BookOpen,
    title: "Track Every Trade",
    text: "Log entries, exits, and outcomes with precision. Never lose a setup again.",
    accent: "primary" as const,
  },
  {
    icon: LineChart,
    title: "Learn From Data",
    text: "Discover your strengths, weaknesses, and patterns with powerful analytics.",
    accent: "success" as const,
  },
  {
    icon: Target,
    title: "Trade Smarter",
    text: "Build consistency, master discipline, and improve performance over time.",
    accent: "primary" as const,
  },
];

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
      navigate({ to: "/register" });
    }
  };

  const skip = () => {
    if (typeof window !== "undefined") localStorage.setItem("piplog_onboarded", "1");
    navigate({ to: "/login" });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <div className="flex justify-end">
        <button
          onClick={skip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <h1 className="sr-only">Welcome to PipLog — Your Premium Forex Trading Journal</h1>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <div
              className="flex h-28 w-28 items-center justify-center rounded-3xl"
              style={{
                background:
                  slide.accent === "success"
                    ? "var(--gradient-success)"
                    : "var(--gradient-primary)",
                boxShadow:
                  slide.accent === "success"
                    ? "var(--shadow-glow-success)"
                    : "var(--shadow-glow-primary)",
              }}
            >
              <Icon className="h-12 w-12 text-white" strokeWidth={2} />
            </div>
            <h2
              className="mt-10 text-3xl font-extrabold tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              {slide.title}
            </h2>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-muted-foreground">
              {slide.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 pb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-8 bg-primary" : "w-1.5 bg-border"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <Button
        size="lg"
        onClick={next}
        className="h-14 w-full rounded-2xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        {step === SLIDES.length - 1 ? "Get Started" : "Next"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </main>
  );
}
