export default function Privacy() {
  const colors = {
    cream: "#FAF7F0",
    navy: "#2A1F5A",
    purple: "#6244D9",
    purpleBorder: "rgba(98,68,217,0.25)",
    gray: "#6B6B80",
    grayLight: "#9990C5",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif", background: colors.cream, color: colors.navy, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 68, borderBottom: `1px solid ${colors.purpleBorder}`, background: colors.cream, position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: "none", fontSize: 18, letterSpacing: "-0.3px" }}>
          <span style={{ fontWeight: 300, color: colors.navy }}>Code</span>
          <span style={{ fontWeight: 600, color: colors.purple }}>Whisper</span>
        </a>
        <a href="/" style={{ fontSize: 14, color: colors.gray, textDecoration: "none" }}>← Back to home</a>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 48px 96px" }}>

        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 4, color: colors.purple, textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: colors.grayLight, marginBottom: 56 }}>Last updated: April 23, 2026</p>

        {[
          {
            title: "What we collect",
            body: (
              <ul style={{ paddingLeft: 20, color: colors.gray, fontSize: 15, lineHeight: 1.9 }}>
                <li>Your email address (used for account login)</li>
                <li>Coaching session messages (sent to our AI to generate responses)</li>
                <li>License and payment status (to verify your plan)</li>
              </ul>
            ),
          },
          {
            title: "What we do NOT collect",
            body: (
              <ul style={{ paddingLeft: 20, color: colors.gray, fontSize: 15, lineHeight: 1.9 }}>
                <li>Your screen contents or screenshots</li>
                <li>Your keystrokes or clipboard data</li>
                <li>Any personally identifiable information beyond your email</li>
              </ul>
            ),
          },
          {
            title: "How we use your data",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                Your session messages are sent to Anthropic's Claude API solely to generate coaching responses. We do not store, sell, or share your data with third parties for any other purpose.
              </p>
            ),
          },
          {
            title: "Screen capture & OCR",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                CodeWhisper captures your screen locally to read problem text. All screen capture and OCR processing happens entirely on your device. No screenshots or screen data are ever transmitted to our servers.
              </p>
            ),
          },
          {
            title: "Payments",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                Payments are processed securely by Stripe. We never see, store, or have access to your credit card details. Stripe's privacy policy governs the handling of your payment information.
              </p>
            ),
          },
          {
            title: "Data retention",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                We retain your account information for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            ),
          },
          {
            title: "Third-party services",
            body: (
              <ul style={{ paddingLeft: 20, color: colors.gray, fontSize: 15, lineHeight: 1.9 }}>
                <li><strong>Anthropic</strong> — AI coaching responses</li>
                <li><strong>Supabase</strong> — authentication and license management</li>
                <li><strong>Stripe</strong> — payment processing</li>
              </ul>
            ),
          },
          {
            title: "Your rights",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at the email below.
              </p>
            ),
          },
          {
            title: "Contact",
            body: (
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.8 }}>
                Questions about this policy? Email us at{" "}
                <a href="mailto:hello@codewhisper-ai.com" style={{ color: colors.purple, textDecoration: "none" }}>
                  hello@codewhisper-ai.com
                </a>
              </p>
            ),
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: `1px solid ${colors.purpleBorder}` }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: colors.navy, marginBottom: 14 }}>{section.title}</h2>
            {section.body}
          </div>
        ))}

      </main>

      {/* FOOTER */}
      <footer style={{ background: colors.cream, borderTop: `1px solid ${colors.purpleBorder}`, padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 13, color: colors.gray }}>© 2026 CodeWhisper. All rights reserved.</p>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="mailto:hello@codewhisper-ai.com" style={{ color: colors.gray, textDecoration: "none", fontSize: 13 }}>hello@codewhisper-ai.com</a>
          <a href="/privacy" style={{ color: colors.gray, textDecoration: "none", fontSize: 13 }}>Privacy Policy</a>
          <a href="/terms" style={{ color: colors.gray, textDecoration: "none", fontSize: 13 }}>Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}
