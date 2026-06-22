import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/AuthForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your PipLog account — Forex Trading Journal" },
      {
        name: "description",
        content:
          "Create a free PipLog account to start logging your forex trades, tracking analytics, and growing as a trader.",
      },
      { property: "og:title", content: "Create your PipLog account" },
      {
        property: "og:description",
        content: "Start your premium forex trading journal — log trades, review data, master discipline.",
      },
      { property: "og:url", content: "https://piplog-pro-journal.lovable.app/register" },
    ],
    links: [{ rel: "canonical", href: "https://piplog-pro-journal.lovable.app/register" }],
  }),
  component: () => <AuthForm mode="register" />,
});
