import { useState } from "react";
import { Zap, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { STRIPE_PLANS, createCheckoutSession, type PlanId } from "@/lib/stripe";
import { open } from "@tauri-apps/plugin-shell";
import { checkUserLicense } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";

export function UpgradePrompt() {
  const [loading, setPlanLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { user, setIsPro } = useAppStore();

  const handleUpgrade = async (planId: PlanId) => {
    setError(null);
    setPlanLoading(planId);
    try {
      const url = await createCheckoutSession(planId);
      await open(url);
      // Poll for license every 3s for up to 5 minutes after browser opens
      setAwaitingPayment(true);
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (!user) { clearInterval(poll); return; }
        const isPro = await checkUserLicense(user.id);
        if (isPro) {
          setIsPro(true);
          clearInterval(poll);
          setAwaitingPayment(false);
        } else if (attempts >= 100) {
          clearInterval(poll);
          setAwaitingPayment(false);
        }
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upgrade failed";
      console.error("[Stripe]", msg);
      setError(msg);
    } finally {
      setPlanLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-ca-purple/20 flex items-center justify-center">
        <Zap size={20} className="text-ca-purple" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-tx-primary">
          Your 7-day trial has ended
        </h2>
        <p className="text-xs text-tx-tertiary mt-1 max-w-[240px]">
          Upgrade to CodeWhisper Pro for unlimited sessions, full hint ladder, and session history.
        </p>
      </div>

      <div className="w-full space-y-2">
        {(Object.entries(STRIPE_PLANS) as [PlanId, (typeof STRIPE_PLANS)[PlanId]][]).map(
          ([planId, plan]) => (
            <button
              key={planId}
              onClick={() => handleUpgrade(planId)}
              disabled={loading !== null}
              className="w-full px-4 py-3 rounded-xl border border-ca-purple/30
                         bg-ca-purple/10 hover:bg-ca-purple/20
                         transition-colors text-left group disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-tx-primary">{plan.name}</p>
                  <p className="text-[11px] text-ca-purple mt-0.5">{plan.price}</p>
                </div>
                {loading === planId ? (
                  <Loader2 size={14} className="animate-spin text-tx-tertiary" />
                ) : (
                  <ExternalLink
                    size={13}
                    className="text-tx-tertiary group-hover:text-tx-secondary transition-colors"
                  />
                )}
              </div>
              <ul className="mt-2 space-y-0.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-tx-secondary">
                    <CheckCircle size={10} className="text-green-400/60" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        )}
      </div>

      {error && (
        <div className="w-full px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-[10px] text-red-400 break-words">{error}</p>
        </div>
      )}

      {awaitingPayment && (
        <div className="flex items-center gap-2 text-[11px] text-ca-purple">
          <Loader2 size={11} className="animate-spin" />
          Waiting for payment confirmation...
        </div>
      )}

      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        Already paid? Visit <strong>Settings → License</strong> to enter your key.
      </p>

      <p className="text-[10px] text-tx-tertiary">
        Payments processed securely by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
