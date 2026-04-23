import { useState, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { signInWithEmail, signUpWithEmail, supabase } from "@/lib/supabase";
import { open } from "@tauri-apps/plugin-shell";

interface Props {
  onSuccess: () => void;
}

export function AuthModal({ onSuccess }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    if (!supabase) return;
    setError(null);
    setOauthLoading(provider);
    try {
      // Use skipBrowserRedirect so the WebView stores the PKCE verifier
      // but we open the URL in the system browser (avoids passkey/WebAuthn issues).
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: true,
          redirectTo: "http://localhost:1420/auth/callback",
        },
      });
      if (err) throw err;
      if (!data.url) throw new Error("No OAuth URL returned");

      // Open in system browser — full passkey/WebAuthn support there
      await open(data.url);

      // Poll the Vite broker for the auth code or tokens
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/auth/poll");
          const payload = await res.json();
          if (!payload.code && !payload.tokens) return;
          clearInterval(pollRef.current!);
          pollRef.current = null;

          if (payload.code) {
            // PKCE flow — exchange code using verifier stored in this WebView
            const { error: exchangeErr } = await supabase!.auth.exchangeCodeForSession(payload.code);
            if (exchangeErr) throw exchangeErr;
          } else if (payload.tokens) {
            // Implicit flow — set session directly
            const { error: setErr } = await supabase!.auth.setSession({
              access_token: payload.tokens.access_token,
              refresh_token: payload.tokens.refresh_token,
            });
            if (setErr) throw setErr;
          }
          setOauthLoading(null);
        } catch (e) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setError(e instanceof Error ? e.message : "Auth failed");
          setOauthLoading(null);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          setOauthLoading(null);
          setError("Sign in timed out. Please try again.");
        }
      }, 5 * 60 * 1000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OAuth failed");
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: err } = await signInWithEmail(email, password);
        if (err) throw err;
        onSuccess();
      } else {
        const { error: err } = await signUpWithEmail(email, password);
        if (err) throw err;
        setConfirmSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center space-y-3">
        <div className="w-full max-w-sm flex flex-col items-center space-y-3">
          <div className="text-3xl">📬</div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Check your email
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
          </p>
          <button
            onClick={() => { setConfirmSent(false); setMode("signin"); }}
            className="text-xs underline"
            style={{ color: "var(--accent-blue)" }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-5 space-y-4 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center space-y-4">
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {mode === "signin" ? "Sign in to start coaching" : "Create your free account"}
      </p>

      {/* OAuth buttons */}
      <div className="w-full space-y-2">
        <OAuthButton
          onClick={() => handleOAuth("google")}
          loading={oauthLoading === "google"}
          disabled={oauthLoading !== null}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
          label="Continue with Google"
        />
        <OAuthButton
          onClick={() => handleOAuth("github")}
          loading={oauthLoading === "github"}
          disabled={oauthLoading !== null}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          }
          label="Continue with GitHub"
        />
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-xl px-3 py-2 text-xs outline-none"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="w-full rounded-xl px-3 py-2 text-xs outline-none"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />

        {error && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--accent-red)" }}>
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--accent-blue)", color: "#fff" }}
        >
          {loading
            ? <Loader2 size={13} className="animate-spin mx-auto" />
            : mode === "signin" ? "Sign in" : "Create account"
          }
        </button>
      </form>

      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {mode === "signin" ? "No account? " : "Already have one? "}
        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="underline"
          style={{ color: "var(--accent-blue)" }}
        >
          {mode === "signin" ? "Sign up free" : "Sign in"}
        </button>
      </p>
      </div>
    </div>
  );
}

function OAuthButton({
  onClick, loading, disabled, icon, label,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
