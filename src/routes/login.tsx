import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to PipLog — Forex Trading Journal" },
      {
        name: "description",
        content:
          "Sign in to PipLog to access your forex trading journal, review trades, and track your performance.",
      },
      { property: "og:title", content: "Sign in to PipLog" },
      {
        property: "og:description",
        content: "Sign in to your PipLog account to continue journaling your forex trades.",
      },
      { property: "og:url", content: "https://piplog-pro-journal.lovable.app/login" },
    ],
    links: [{ rel: "canonical", href: "https://piplog-pro-journal.lovable.app/login" }],
  }),
  component: () => <AuthForm mode="login" />,
});
