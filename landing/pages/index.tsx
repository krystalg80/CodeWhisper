export default function Home() {
  const colors = {
    cream: "#FAF7F0",
    navy: "#2A1F5A",
    purple: "#6244D9",
    purpleLight: "rgba(98,68,217,0.1)",
    purpleBorder: "rgba(98,68,217,0.25)",
    gray: "#6B6B80",
    grayLight: "#9990C5",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif", background: colors.cream, color: colors.navy, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 68, borderBottom: `1px solid ${colors.purpleBorder}`, background: colors.cream, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, letterSpacing: "-0.3px" }}>
            <span style={{ fontWeight: 300, color: colors.navy }}>Code</span>
            <span style={{ fontWeight: 600, color: colors.purple }}>Whisper</span>
          </span>
        </div>
        <ul style={{ display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
          {["Features", "Pricing", "Docs", "Blog"].map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} style={{ textDecoration: "none", fontSize: 15, color: colors.gray }}>{link}</a>
            </li>
          ))}
        </ul>
        <button style={{ background: colors.purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 500, opacity: 0.85, cursor: "default" }}>
          Coming Soon
        </button>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "96px 24px 80px", maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 4, color: colors.purple, textTransform: "uppercase", marginBottom: 24 }}>
          AI Coach · Always On Top
        </p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24 }}>
          Your interview coach,<br />
          <span style={{ color: colors.purple }}>whispering from the corner.</span>
        </h1>
        <p style={{ fontSize: 18, color: colors.gray, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Never gives the answer. Always nudges your thinking. Practice LeetCode with Socratic hints that float invisibly over your screen.
        </p>
        <button style={{ background: colors.purple, color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 500, opacity: 0.85, cursor: "default" }}>
          Coming Soon for Mac
        </button>
        <p style={{ marginTop: 14, fontSize: 13, color: colors.grayLight }}>
          Free 7-day trial · No credit card required · Windows coming soon
        </p>
      </div>

      <hr style={{ border: "none", borderTop: `1px solid ${colors.purpleBorder}`, margin: "0 48px" }} />

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 3, color: colors.purple, textTransform: "uppercase", marginBottom: 16 }}>How It Works</p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>Three steps to better interviews</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {[
            { num: "01", title: "Open a problem", body: "Paste in any LeetCode or interview problem. CodeWhisper reads it and gets ready to coach." },
            { num: "02", title: "Get guided, not spoonfed", body: "Ask for a hint. CodeWhisper nudges your thinking with questions and patterns, the way a great interviewer would." },
            { num: "03", title: "Build real understanding", body: "Walk away knowing why the solution works, not just what it is. That's what gets you the job." },
          ].map((step) => (
            <div key={step.num}>
              <p style={{ fontSize: 13, fontWeight: 700, color: colors.purple, letterSpacing: 2, marginBottom: 12 }}>{step.num}</p>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.7 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: "none", borderTop: `1px solid ${colors.purpleBorder}`, margin: "0 48px" }} />

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 3, color: colors.purple, textTransform: "uppercase", marginBottom: 16 }}>Features</p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>Everything you need to interview with confidence.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { title: "Socratic hints", body: "4 levels of hints that guide without giving it away. Each nudge asks a question, never reveals the answer." },
            { title: "Algorithm pattern library", body: "10 built-in patterns with templates — sliding window, two pointers, BFS/DFS, dynamic programming, and more." },
            { title: "Session history", body: "Review every problem you've worked through. Track your progress and revisit patterns you struggled with." },
            { title: "Always-on-top overlay", body: "Floats over your browser while you code. No alt-tabbing, no distractions — just guidance when you need it." },
            { title: "Invisible during screen share", body: "CodeWhisper is excluded from screen capture — it won't appear in Zoom, OBS, or any recording tool on macOS." },
            { title: "Runs locally", body: "Screen capture and OCR happen entirely on your device. Your code and keystrokes never leave your machine." },
            { title: "macOS now · Windows soon", body: "Native macOS desktop app available now. Windows support is in development and coming soon." },
          ].map((f) => (
            <div key={f.title} style={{ background: colors.cream, border: `1px solid ${colors.purpleBorder}`, borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: colors.gray, lineHeight: 1.7 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: "none", borderTop: `1px solid ${colors.purpleBorder}`, margin: "0 48px" }} />

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 3, color: colors.purple, textTransform: "uppercase", marginBottom: 16 }}>Pricing</p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>Simple pricing</h2>
        <p style={{ fontSize: 16, color: colors.gray, marginBottom: 48 }}>No tricks. No tiers. Just the tool you need.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
          {[
            { name: "Free Trial", price: "$0", period: "/ 7 days", features: ["7 days free", "Unlimited sessions", "Full hint ladder", "No credit card required"], featured: false },
            { name: "Pro", price: "$9", period: "/ month", features: ["Unlimited sessions", "Full hint ladder", "Session history", "Pattern library", "Priority support"], featured: false },
            { name: "Lifetime", price: "$79", period: "one-time", features: ["Everything in Pro", "Lifetime updates", "No recurring fee", "Pay once, own it forever"], featured: true },
          ].map((plan) => (
            <div key={plan.name} style={{ background: colors.cream, border: `${plan.featured ? 2 : 1}px solid ${plan.featured ? colors.purple : colors.purpleBorder}`, borderRadius: 20, padding: "32px 28px", position: "relative" }}>
              {plan.featured && (
                <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: colors.purple, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Most Popular
                </span>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, color: colors.gray, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>{plan.name}</p>
              <p style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 }}>
                {plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: colors.gray, marginLeft: 4 }}>{plan.period}</span>
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 28px" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: colors.gray, padding: "6px 0", borderBottom: `1px solid ${colors.purpleBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: colors.purple, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "block", textAlign: "center", background: colors.purpleLight, border: `1px solid ${colors.purpleBorder}`, color: colors.purple, borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "default" }}>
                Coming Soon
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: colors.grayLight, textAlign: "center" }}>All plans include the full CodeWhisper desktop app for macOS. Windows coming soon. Pricing in USD.</p>
      </section>

      <hr style={{ border: "none", borderTop: `1px solid ${colors.purpleBorder}`, margin: "0 48px" }} />

      {/* FAQ */}
      <section id="faq" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 3, color: colors.purple, textTransform: "uppercase", marginBottom: 16 }}>FAQ</p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>Common questions</h2>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "left" }}>
          {[
            { q: "Does it work during real interviews?", a: "CodeWhisper is a practice tool — use it to build skills before your interviews, not during them. It's designed to make you better, not dependent." },
            { q: "Is my screen recorded or sent anywhere?", a: "No. Screen capture and OCR happen entirely on your device. Nothing is sent to our servers except your coaching messages." },
            { q: "What interview formats does it support?", a: "Any text-based problem — LeetCode, HackerRank, Codewars, or plain text. Just paste it in." },
            { q: "What if I cancel Pro?", a: "You keep access until the end of your billing period. No questions asked." },
          ].map((item) => (
            <details key={item.q} style={{ borderBottom: `1px solid ${colors.purpleBorder}`, padding: "20px 0" }}>
              <summary style={{ fontSize: 16, fontWeight: 600, color: colors.navy, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q} <span style={{ color: colors.purple }}>↓</span>
              </summary>
              <p style={{ fontSize: 15, color: colors.gray, marginTop: 12, lineHeight: 1.7 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

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
