import { useState } from "react";
import { Zap, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { STRIPE_PLANS, createCheckoutSession, type PlanId } from "@/lib/stripe";
import { open } from "@tauri-apps/plugin-shell";

export function UpgradePrompt() {
  const [loading, setPlanLoading] = useState<PlanId | null>(null);

  const handleUpgrade = async (planId: PlanId) => {
    setPlanLoading(planId);
    try {
      const url = await createCheckoutSession(planId);
      await open(url); // Open Stripe checkout in system browser
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setPlanLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center">
        <Zap size={20} className="text-accent-purple" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white/90">
          You've used 3 free sessions
        </h2>
        <p className="text-xs text-white/40 mt-1 max-w-[240px]">
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
              className="w-full px-4 py-3 rounded-xl border border-accent-purple/30
                         bg-accent-purple/10 hover:bg-accent-purple/20
                         transition-colors text-left group disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white/80">{plan.name}</p>
                  <p className="text-[11px] text-accent-purple mt-0.5">{plan.price}</p>
                </div>
                {loading === planId ? (
                  <Loader2 size={14} className="animate-spin text-white/40" />
                ) : (
                  <ExternalLink
                    size={13}
                    className="text-white/30 group-hover:text-white/60 transition-colors"
                  />
                )}
              </div>
              <ul className="mt-2 space-y-0.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <CheckCircle size={10} className="text-green-400/60" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        )}
      </div>

      <p className="text-[10px] text-white/25">
        Payments processed securely by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
