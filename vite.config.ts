import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";

// Brokers the OAuth callback from the system browser back to the Tauri WebView.
// Flow: WebView starts OAuth (stores PKCE verifier) → system browser authenticates
// → GitHub redirects to /auth/callback → middleware stores the code → WebView polls
// → WebView exchanges code (has the verifier) → session established.
function oauthBroker(): Plugin {
  let pendingCode: string | null = null;
  let pendingTokens: { access_token: string; refresh_token: string } | null = null;
  let pendingCheckout: boolean = false;
  return {
    name: "oauth-broker",
    configureServer(server) {
      server.middlewares.use("/auth/callback", (req, res) => {
        console.log("[oauth-broker] callback hit:", req.url);
        const url = new URL(req.url!, "http://localhost:1420");
        const code = url.searchParams.get("code");
        if (code) {
          pendingCode = code;
          res.setHeader("Content-Type", "text/html");
          res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <h2>✓ Signed in successfully</h2>
            <p>You can close this tab and return to CodeWhisper.</p>
          </body></html>`);
        } else {
          // Hash-based tokens (implicit flow) can't be read server-side.
          // Serve a page that reads the hash and posts it back.
          res.setHeader("Content-Type", "text/html");
          res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <p>Completing sign in...</p>
            <script>
              const params = new URLSearchParams(window.location.hash.slice(1));
              const code = params.get('code') || new URLSearchParams(window.location.search).get('code');
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');
              const payload = code ? { code } : { access_token, refresh_token };
              fetch('/auth/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(() => {
                document.body.innerHTML = '<h2>✓ Signed in successfully</h2><p>You can close this tab and return to CodeWhisper.</p>';
              });
            </script>
          </body></html>`);
        }
      });
      server.middlewares.use("/checkout/success", (req, res) => {
        pendingCheckout = true;
        const url = new URL(req.url!, "http://localhost:1420");
        const sessionId = url.searchParams.get("session_id") ?? "";
        const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";
        res.setHeader("Content-Type", "text/html");
        res.end(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; background: #0f0f0f; color: #fff;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #1a1a1a; border: 1px solid #333; border-radius: 16px; padding: 40px;
          text-align: center; max-width: 420px; width: 90%; }
  h2 { color: #4ade80; margin: 0 0 8px; }
  p { color: #aaa; margin: 0 0 24px; font-size: 14px; }
  .key-box { background: #0f0f0f; border: 1px solid #444; border-radius: 10px;
             padding: 14px 20px; font-family: monospace; font-size: 18px; letter-spacing: 2px;
             color: #a78bfa; margin: 0 0 12px; }
  .copy-btn { background: #7c3aed; color: #fff; border: none; border-radius: 8px;
              padding: 10px 24px; font-size: 13px; cursor: pointer; }
  .copy-btn:hover { background: #6d28d9; }
  .hint { color: #666; font-size: 12px; margin-top: 20px; }
  .loading { color: #aaa; font-size: 14px; }
</style></head>
<body><div class="card">
  <h2>✓ Payment successful!</h2>
  <p>Copy your license key and paste it in<br>CodeWhisper → Settings → License</p>
  <div id="content"><div class="loading">Fetching your license key...</div></div>
  <div class="hint">Keep this key safe — you can use it to activate CodeWhisper on any device.</div>
</div>
<script>
  fetch('https://pwydsggthnayjxmiiviq.supabase.co/functions/v1/get-license?session_id=${sessionId}', {
    headers: { apikey: '${anonKey}' }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    var el = document.getElementById('content');
    if (data.license_key) {
      var key = data.license_key;
      var box = document.createElement('div');
      box.className = 'key-box';
      box.textContent = key;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy key';
      btn.addEventListener('click', function() {
        navigator.clipboard.writeText(key).then(function() { btn.textContent = 'Copied!'; });
      });
      el.innerHTML = '';
      el.appendChild(box);
      el.appendChild(btn);
    } else {
      el.innerHTML = '<p style="color:#f87171">Could not load key. Contact support.</p>';
    }
  })
  .catch(function() {
    document.getElementById('content').innerHTML = '<p style="color:#f87171">Error loading key. Please try again.</p>';
  });
</script>
</body></html>`);
      });

      server.middlewares.use("/checkout/notify", (_req, res) => {
        pendingCheckout = true;
        console.log("[oauth-broker] checkout success received");
        res.end("ok");
      });

      server.middlewares.use("/checkout/poll", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        if (pendingCheckout) {
          pendingCheckout = false;
          res.end(JSON.stringify({ success: true }));
        } else {
          res.end(JSON.stringify({ success: false }));
        }
      });

      server.middlewares.use("/auth/store", (req, res) => {
        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            if (payload.code) pendingCode = payload.code;
            else if (payload.access_token) pendingTokens = payload;
            console.log("[oauth-broker] stored payload:", Object.keys(payload));
          } catch {}
          res.end("ok");
        });
      });

      server.middlewares.use("/auth/poll", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        if (pendingCode) {
          const code = pendingCode;
          pendingCode = null;
          res.end(JSON.stringify({ code }));
        } else if (pendingTokens) {
          const tokens = pendingTokens;
          pendingTokens = null;
          res.end(JSON.stringify({ tokens }));
        } else {
          res.end(JSON.stringify({ code: null }));
        }
      });
    },
  };
}

export default defineConfig(async () => ({
  plugins: [react(), oauthBroker()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      "/functions": {
        target: "https://pwydsggthnayjxmiiviq.supabase.co",
        changeOrigin: true,
        secure: true,
      },
    },
  },
}));
