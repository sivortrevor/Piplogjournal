import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
import { s as supabase } from "./router-BjAoc50q.js";
import { toast } from "sonner";
function AuthShell({ title, subtitle, children, footer }) {
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto flex min-h-screen max-w-md flex-col px-6 py-10", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", className: "self-start", children: /* @__PURE__ */ jsx(PipLogLogo, { size: 48 }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 flex-1", children: [
      /* @__PURE__ */ jsx(
        "h1",
        {
          className: "text-3xl font-extrabold tracking-tight",
          style: { letterSpacing: "-0.025em" },
          children: title
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: subtitle }),
      /* @__PURE__ */ jsx("div", { className: "mt-8", children })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pt-6 text-center text-sm text-muted-foreground", children: footer })
  ] });
}
function AuthForm({ mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { display_name: name || email.split("@")[0] }
          }
        });
        if (error) throw error;
        toast.success("Account created! Welcome to PipLog.");
        window.location.href = "/app";
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        window.location.href = "/app";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` }
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    AuthShell,
    {
      title: mode === "login" ? "Welcome back" : "Create your account",
      subtitle: mode === "login" ? "Sign in to continue your trading journey." : "Start logging trades and master your edge.",
      footer: mode === "login" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "New to PipLog?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/register", className: "font-semibold text-primary hover:underline", children: "Create an account" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "Sign in" })
      ] }),
      children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          mode === "register" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Display name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "name",
                autoComplete: "name",
                value: name,
                onChange: (e) => setName(e.target.value),
                placeholder: "Trader",
                className: "mt-1.5 h-12 rounded-xl bg-input border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                autoComplete: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "you@example.com",
                className: "mt-1.5 h-12 rounded-xl bg-input border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
              mode === "login" && /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/forgot-password",
                  className: "text-xs font-medium text-primary hover:underline",
                  children: "Forgot?"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "password",
                type: "password",
                autoComplete: mode === "login" ? "current-password" : "new-password",
                required: true,
                minLength: 6,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "••••••••",
                className: "mt-1.5 h-12 rounded-xl bg-input border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: submitting,
              className: "h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]",
              style: { background: "var(--gradient-primary)" },
              children: submitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : mode === "login" ? "Sign in" : "Create account"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
          "or",
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: handleGoogle,
            disabled: submitting,
            className: "h-12 w-full rounded-xl border-border bg-surface text-base font-medium hover:bg-accent",
            children: [
              /* @__PURE__ */ jsx(GoogleIcon, {}),
              " Continue with Google"
            ]
          }
        )
      ]
    }
  );
}
function GoogleIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "mr-2 h-5 w-5", viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "#EA4335",
      d: "M12 11v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C15.9 5.5 14.1 4.5 12 4.5 7.9 4.5 4.5 7.9 4.5 12s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.3 0-.5-.1-.9-.1-1.2H12z"
    }
  ) });
}
export {
  AuthForm as A
};
