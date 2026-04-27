export default function CheckoutSuccess() {
  const colors = {
    cream: "#FAF7F0",
    navy: "#2A1F5A",
    purple: "#6244D9",
    purpleBorder: "rgba(98,68,217,0.25)",
    gray: "#6B6B80",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif", background: colors.cream, color: colors.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>
          You're all set!
        </h1>
        <p style={{ fontSize: 16, color: colors.gray, lineHeight: 1.7, marginBottom: 32 }}>
          Your payment was successful. Switch back to the CodeWhisper app — it should unlock automatically within a few seconds.
        </p>
        <p style={{ fontSize: 14, color: colors.gray, lineHeight: 1.7, padding: "16px 24px", border: `1px solid ${colors.purpleBorder}`, borderRadius: 12 }}>
          If the app doesn't unlock automatically, go to <strong>Settings → License</strong> and enter your license key. Check your email for the key.
        </p>
        <p style={{ marginTop: 32, fontSize: 13, color: colors.gray }}>
          <a href="/" style={{ color: colors.purple, textDecoration: "none" }}>← Back to codewhisper-ai.com</a>
        </p>
      </div>
    </div>
  );
}
