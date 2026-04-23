import { useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2, Sun, Moon, LogOut } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { validateLicenseKey } from "@/lib/tauri";
import { signOut } from "@/lib/supabase";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, isPro, setIsPro, theme, toggleTheme, setUser } = useAppStore();
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [validating, setValidating] = useState(false);

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) return;
    setValidating(true);
    setLicenseStatus(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      const result = await validateLicenseKey(licenseKey, supabaseUrl, supabaseAnonKey);
      if (result.valid) {
        setIsPro(true);
        setLicenseStatus({ type: "success", message: result.message });
      } else {
        setLicenseStatus({ type: "error", message: result.message });
      }
    } catch (err) {
      setLicenseStatus({ type: "error", message: err instanceof Error ? err.message : "Validation failed" });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-[340px] max-h-[80vh] rounded-2xl shadow-overlay overflow-hidden animate-slide-up"
        style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h2>
          <button onClick={onClose} style={{ color: "var(--text-tertiary)" }}
            className="hover:opacity-80 transition-opacity">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-5 pb-2">
          {/* Theme */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Appearance
            </h3>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => theme !== t && toggleTheme()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: theme === t ? "color-mix(in srgb, var(--accent-blue) 15%, transparent)" : "var(--bg-raised)",
                    border: `1px solid ${theme === t ? "color-mix(in srgb, var(--accent-blue) 40%, transparent)" : "var(--border)"}`,
                    color: theme === t ? "var(--accent-blue)" : "var(--text-secondary)",
                  }}
                >
                  {t === "dark" ? <Moon size={12} /> : <Sun size={12} />}
                  {t === "dark" ? "Midnight" : "Cream"}
                </button>
              ))}
            </div>
          </section>

          {/* Opacity */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Overlay opacity
              </label>
              <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
                {settings.overlayOpacity}%
              </span>
            </div>
            <input
              type="range" min={30} max={100} step={5}
              value={settings.overlayOpacity}
              onChange={(e) => updateSettings({ overlayOpacity: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "var(--accent-blue)" }}
            />
            <div className="flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              <span>Ghost</span>
              <span>Solid</span>
            </div>
          </section>

          {/* Capture */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Screen Capture
            </h3>
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Capture interval (seconds)
              </label>
              <input
                type="number" min={2} max={60}
                value={settings.captureIntervalSeconds}
                onChange={(e) => updateSettings({ captureIntervalSeconds: Number(e.target.value) })}
                className="w-16 rounded-lg px-2 py-1 text-xs text-right outline-none"
                style={{
                  background: "var(--bg-muted)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </section>

          {/* License */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              License
            </h3>
            {isPro ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-teal)" }}>
                <CheckCircle size={13} />
                Pro license active — unlimited sessions
              </div>
            ) : (
              <>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Enter your license key after purchase to unlock unlimited sessions.
                </p>
                <div className="flex gap-2">
                  <input
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="CW-XXXX-XXXX-XXXX"
                    className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                    style={{
                      background: "var(--bg-muted)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={handleValidateLicense}
                    disabled={validating || !licenseKey.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ background: "var(--accent-purple)", color: "#fff" }}
                  >
                    {validating ? <Loader2 size={13} className="animate-spin" /> : "Activate"}
                  </button>
                </div>
                {licenseStatus && (
                  <div className="flex items-center gap-1.5 text-xs"
                    style={{ color: licenseStatus.type === "success" ? "var(--accent-teal)" : "var(--accent-red)" }}>
                    {licenseStatus.type === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {licenseStatus.message}
                  </div>
                )}
              </>
            )}
          </section>
          {/* Account */}
          <section className="space-y-2 pt-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Account
            </h3>
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
                setIsPro(false);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
