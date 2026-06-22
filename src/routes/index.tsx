import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PipLogLogo } from "@/components/brand/PipLogLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PipLog — The Premium Forex Trading Journal" },
      {
        name: "description",
        content:
          "PipLog is a premium forex trading journal that helps you log every trade, analyze performance, master your emotions, and grow consistently with data-driven insights.",
      },
      { property: "og:title", content: "PipLog — The Premium Forex Trading Journal" },
      {
        property: "og:description",
        content:
          "Log every trade, analyze performance, and master discipline with PipLog — a premium forex trading journal built for serious traders.",
      },
      { property: "og:url", content: "https://piplog-pro-journal.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://piplog-pro-journal.lovable.app/" }],
  }),
  // Client-side: if already signed in, jump straight to the app
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/app" });
    }
  },
  component: SplashPage,
});

function SplashPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done) {
      // Soft redirect via location to keep splash animation crisp
      const seen = typeof window !== "undefined" && localStorage.getItem("piplog_onboarded");
      window.location.href = seen ? "/login" : "/onboarding";
    }
  }, [done]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <motion.div
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <PipLogLogo size={160} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 text-center text-2xl font-extrabold tracking-tight"
          style={{ letterSpacing: "-0.025em" }}
        >
          PipLog — The Premium Forex Trading Journal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 max-w-sm text-center text-sm font-medium leading-relaxed text-muted-foreground"
        >
          Log every trade, analyze your performance, control your emotions, and grow consistently
          with data-driven insights designed for serious forex traders.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
