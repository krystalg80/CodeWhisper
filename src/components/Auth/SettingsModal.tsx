import { useState } from "react";
import { X, Eye, EyeOff, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { validateLicenseKey } from "@/lib/tauri";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings, isPro, setIsPro } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [validatingLicense, setValidatingLicense] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) return;
    setValidatingLicense(true);
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
      setLicenseStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Validation failed",
      });
    } finally {
      setValidatingLicense(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[360px] max-h-[80vh] glass glass-border rounded-2xl
                      shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white/80">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-5">
          {/* API Key */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <Key size={11} />
              Claude API Key
            </h3>
            <p className="text-xs text-white/30">
              Your key is stored locally and only used to call the Anthropic API.
              It never leaves your device except in that API call.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-dark-600 rounded-lg
                             border border-white/5 focus-within:border-accent-purple/40
                             overflow-hidden">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-white/70
                             outline-none placeholder:text-white/25"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="px-2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <button
                onClick={handleSave}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${saved
                    ? "bg-green-500/20 text-green-400"
                    : "bg-accent-purple text-white hover:bg-accent-purple/80"
                  }`}
              >
                {saved ? <CheckCircle size={14} /> : "Save"}
              </button>
            </div>
          </section>

          {/* Capture settings */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Screen Capture
            </h3>
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60">
                Capture interval (seconds)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                value={settings.captureIntervalSeconds}
                onChange={(e) =>
                  updateSettings({ captureIntervalSeconds: Number(e.target.value) })
                }
                className="w-16 bg-dark-600 rounded px-2 py-1 text-xs text-white/70
                           outline-none border border-white/5 text-right"
              />
            </div>
          </section>

          {/* License */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              License
            </h3>
            {isPro ? (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle size={13} />
                Pro license active
              </div>
            ) : (
              <>
                <p className="text-xs text-white/30">
                  Enter your license key after purchase to unlock unlimited sessions.
                </p>
                <div className="flex gap-2">
                  <input
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="CW-XXXX-XXXX-XXXX"
                    className="flex-1 bg-dark-600 rounded-lg px-3 py-2 text-xs text-white/70
                               border border-white/5 focus:border-accent-purple/40
                               outline-none"
                  />
                  <button
                    onClick={handleValidateLicense}
                    disabled={validatingLicense || !licenseKey.trim()}
                    className="px-3 py-2 bg-accent-purple text-white text-xs rounded-lg
                               hover:bg-accent-purple/80 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validatingLicense ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      "Activate"
                    )}
                  </button>
                </div>
                {licenseStatus && (
                  <div
                    className={`flex items-center gap-1.5 text-xs
                      ${licenseStatus.type === "success" ? "text-green-400" : "text-red-400"}`}
                  >
                    {licenseStatus.type === "success" ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {licenseStatus.message}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
