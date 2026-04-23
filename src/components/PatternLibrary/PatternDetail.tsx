import { ArrowLeft, Clock, Database } from "lucide-react";
import type { AlgorithmPattern } from "@/types";

interface Props {
  pattern: AlgorithmPattern;
  onBack: () => void;
}

export function PatternDetail({ pattern, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-border/60">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-tx-tertiary hover:text-tx-secondary
                     transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <span className="text-xs text-tx-tertiary">/</span>
        <span className="text-xs text-tx-secondary font-medium">{pattern.name}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-tx-primary">{pattern.name}</h2>
            <span className="text-xs text-tx-tertiary bg-surface-overlay px-1.5 py-0.5 rounded">
              {pattern.category}
            </span>
          </div>
          <p className="text-xs text-tx-secondary leading-relaxed">{pattern.description}</p>
        </div>

        {/* Complexity */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock size={11} className="text-green-400/70" />
            <span className="text-tx-tertiary">Time:</span>
            <span className="text-green-400">{pattern.time_complexity}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Database size={11} className="text-blue-400/70" />
            <span className="text-tx-tertiary">Space:</span>
            <span className="text-blue-400">{pattern.space_complexity}</span>
          </div>
        </div>

        {/* When to use */}
        <Section title="When to use">
          <ul className="space-y-1">
            {pattern.when_to_use.map((w, i) => (
              <li key={i} className="text-xs text-tx-secondary flex items-start gap-1.5">
                <span className="text-ca-purple mt-0.5">›</span>
                {w}
              </li>
            ))}
          </ul>
        </Section>

        {/* Key signals */}
        <Section title="Problem signals">
          <div className="flex flex-wrap gap-1.5">
            {pattern.key_signals.map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 rounded-md bg-ca-purple/10 text-ca-purple/80"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        {/* Template */}
        <Section title="Pseudocode template">
          <pre className="text-[11px] bg-surface-raised rounded-lg p-3 overflow-x-auto
                          text-tx-secondary leading-relaxed font-mono whitespace-pre">
            {pattern.template_hint}
          </pre>
        </Section>

        {/* Example problems */}
        <Section title="Classic problems">
          <ul className="space-y-1">
            {pattern.example_problems.map((p, i) => (
              <li key={i} className="text-xs text-tx-secondary flex items-start gap-1.5">
                <span className="text-tx-tertiary mt-0.5">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-tx-tertiary uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
