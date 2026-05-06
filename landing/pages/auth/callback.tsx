import { useEffect, useState } from "react";

const colors = {
  cream: "#FAF7F0",
  navy: "#2A1F5A",
  purple: "#6244D9",
  purpleBorder: "rgba(98,68,217,0.25)",
  gray: "#6B6B80",
};

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Supabase redirects here with tokens in the URL hash after email confirmation
    // e.g. #access_token=...&refresh_token=...&type=signup
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      // Pass tokens to the app via deep link
      const deepLink = `codewhisper://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}&token_type=bearer`;
      window.location.href = deepLink;
      setStatus("success");
    } else {
      // No tokens — maybe already confirmed or direct visit
      setStatus("success");
    }
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif", background: colors.cream, color: colors.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {status === "loading" ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>⏳</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>Confirming your email…</h1>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>✅</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>Email confirmed!</h1>
            <p style={{ fontSize: 16, color: colors.gray, lineHeight: 1.7, marginBottom: 32 }}>
              Your account is verified. The CodeWhisper app should open automatically.
            </p>
            <p style={{ fontSize: 14, color: colors.gray, lineHeight: 1.7, padding: "16px 24px", border: `1px solid ${colors.purpleBorder}`, borderRadius: 12 }}>
              If the app didn't open, launch <strong>Lens</strong> from your Applications folder and sign in with your email and password.
            </p>
          </>
        )}
        <p style={{ marginTop: 32, fontSize: 13, color: colors.gray }}>
          <a href="/" style={{ color: colors.purple, textDecoration: "none" }}>← Back to codewhisper-ai.com</a>
        </p>
      </div>
    </div>
  );
}
