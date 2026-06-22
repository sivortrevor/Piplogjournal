import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const {
      data
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({
      data: data2
    }) => {
      if (data2.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      toast.success("Password updated. Welcome back!");
      navigate({
        to: "/app"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto flex min-h-screen max-w-md flex-col px-6 py-10", children: [
    /* @__PURE__ */ jsx(Link, { to: "/login", className: "self-start", children: /* @__PURE__ */ jsx(PipLogLogo, { size: 48 }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 flex-1", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: "Set a new password" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Choose a strong password to secure your account." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New password" }),
          /* @__PURE__ */ jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1.5 h-12 rounded-xl bg-input border-border", placeholder: "••••••••", disabled: !ready }),
          !ready && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Verifying your reset link…" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting || !ready, className: "h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
          background: "var(--gradient-primary)"
        }, children: submitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : "Update password" })
      ] })
    ] })
  ] });
}
export {
  ResetPasswordPage as component
};
