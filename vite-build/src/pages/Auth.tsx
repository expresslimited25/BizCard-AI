import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) window.location.href = "/dashboard";
  }, [loading, user]);

  const signIn = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) { toast.error("Could not sign in. Please try again."); setBusy(false); }
    } catch { toast.error("Something went wrong."); setBusy(false); }
  };

  return (
    <div className="aurora relative flex min-h-screen items-center justify-center bg-subtle-gradient px-4">
      <button onClick={() => (window.location.href = "/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back
      </button>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
        className="glass w-full max-w-md rounded-3xl p-8 text-center shadow-elevated">
        <div className="bg-brand-gradient mx-auto grid size-14 place-items-center rounded-2xl text-white">
          <Sparkles className="size-6" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Welcome to BizCard AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with Google to start your free month. No credit card, no password.
        </p>
        <button onClick={() => void signIn()} disabled={busy}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-elevated disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path fill="#fff" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.1 14.7 2 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.8H12z"/>
            </svg>
          )}
          Continue with Google
        </button>
        <p className="mt-6 text-xs text-muted-foreground">
          By continuing you agree to let BizCard AI create and host a public page for your business.
        </p>
      </motion.div>
    </div>
  );
}
