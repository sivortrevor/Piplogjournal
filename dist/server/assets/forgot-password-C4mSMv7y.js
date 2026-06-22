import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
import { s as supabase } from "./router-BjAoc50q.js";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@supabase/supabase-js";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto flex min-h-screen max-w-md flex-col px-6 py-10", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/login", className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to sign in"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 flex-1", children: [
      /* @__PURE__ */ jsx(PipLogLogo, { size: 48 }),
      /* @__PURE__ */ jsx("h1", { className: "mt-10 text-3xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: "Reset your password" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Enter your email and we'll send you a secure reset link." }),
      sent ? /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl surface-card p-6 text-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Email sent ✓" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-muted-foreground", children: [
          "We sent a password reset link to ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: email }),
          ". Check your inbox."
        ] })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1.5 h-12 rounded-xl bg-input border-border", placeholder: "you@example.com" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
          background: "var(--gradient-primary)"
        }, children: submitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : "Send reset link" })
      ] })
    ] })
  ] });
}
export {
  ForgotPasswordPage as component
};
