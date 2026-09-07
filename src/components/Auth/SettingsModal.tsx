import { useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2, Sun, Moon, LogOut, Mail, KeyRound, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { useAppStore } from "@/stores/appStore";
import { validateLicenseKey } from "@/lib/tauri";
import { signOut, updatePassword, updateEmail } from "@/lib/supabase";
import { createPortalSession } from "@/lib/stripe";

type Status = { type: "success" | "error"; message: string } | null;

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, isPro, setIsPro, theme, toggleTheme, user, setUser, trialDaysRemaining } = useAppStore();
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<Status>(null);
  const [validating, setValidating] = useState(false);

  const [activeForm, setActiveForm] = useState<"password" | "email" | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [changingEmail, setChangingEmail] = useState(false);

  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const toggleForm = (form: "password" | "email") => {
    setPasswordStatus(null);
    setEmailStatus(null);
    setActiveForm((prev) => (prev === form ? null : form));
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords don't match" });
      return;
    }
    setChangingPassword(true);
    setPasswordStatus(null);
    try {
      await updatePassword(newPassword);
      setPasswordStatus({ type: "success", message: "Password updated" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({ type: "error", message: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setEmailStatus({ type: "error", message: "Enter a valid email address" });
      return;
    }
    setChangingEmail(true);
    setEmailStatus(null);
    try {
      await updateEmail(newEmail.trim());
      setEmailStatus({ type: "success", message: `Confirmation link sent to ${newEmail.trim()}` });
      setNewEmail("");
    } catch (err) {
      setEmailStatus({ type: "error", message: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    setPortalError(null);
    try {
      const url = await createPortalSession();
      await open(url);
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Couldn't open billing portal");
    } finally {
      setOpeningPortal(false);
    }
  };

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
        className="relative w-[340px] max-h-[80vh] rounded-2xl shadow-overlay overflow-hidden animate-slide-up flex flex-col"
        style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h2>
          <button onClick={onClose} style={{ color: "var(--text-tertiary)" }}
            className="hover:opacity-80 transition-opacity">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto min-h-0 flex-1 px-4 py-4 space-y-5 pb-2">
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
                  Your 7-day trial is active. Enter a license key after purchase to unlock unlimited sessions.
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
            {user && (
              <div
                className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail size={13} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
                    {user.email}
                  </span>
                </div>
                <span
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: isPro
                      ? "color-mix(in srgb, var(--accent-teal) 15%, transparent)"
                      : "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                    color: isPro ? "var(--accent-teal)" : "var(--accent-purple)",
                  }}
                >
                  {isPro ? "Pro" : trialDaysRemaining > 0 ? `Trial · ${trialDaysRemaining}d` : "Trial ended"}
                </span>
              </div>
            )}

            {isPro && (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={openingPortal}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {openingPortal ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
                  Manage billing
                </button>
                {portalError && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--accent-red)" }}>
                    <AlertCircle size={12} />
                    {portalError}
                  </div>
                )}
              </>
            )}

            {/* Change password */}
            <button
              onClick={() => toggleForm("password")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <span className="flex items-center gap-2">
                <KeyRound size={13} />
                Change password
              </span>
              {activeForm === "password" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {activeForm === "password" && (
              <div className="space-y-2 pl-1">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ background: "var(--accent-purple)", color: "#fff" }}
                >
                  {changingPassword ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Update password"}
                </button>
                {passwordStatus && (
                  <div className="flex items-center gap-1.5 text-xs"
                    style={{ color: passwordStatus.type === "success" ? "var(--accent-teal)" : "var(--accent-red)" }}>
                    {passwordStatus.type === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {passwordStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* Change email */}
            <button
              onClick={() => toggleForm("email")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <span className="flex items-center gap-2">
                <Mail size={13} />
                Change email
              </span>
              {activeForm === "email" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {activeForm === "email" && (
              <div className="space-y-2 pl-1">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleChangeEmail}
                  disabled={changingEmail || !newEmail.trim()}
                  className="w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ background: "var(--accent-purple)", color: "#fff" }}
                >
                  {changingEmail ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Send confirmation link"}
                </button>
                {emailStatus && (
                  <div className="flex items-center gap-1.5 text-xs"
                    style={{ color: emailStatus.type === "success" ? "var(--accent-teal)" : "var(--accent-red)" }}>
                    {emailStatus.type === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {emailStatus.message}
                  </div>
                )}
              </div>
            )}

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
