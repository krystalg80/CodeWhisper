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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70
                     transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <span className="text-xs text-white/20">/</span>
        <span className="text-xs text-white/60 font-medium">{pattern.name}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-white/90">{pattern.name}</h2>
            <span className="text-xs text-white/30 bg-dark-500 px-1.5 py-0.5 rounded">
              {pattern.category}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{pattern.description}</p>
        </div>

        {/* Complexity */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock size={11} className="text-green-400/70" />
            <span className="text-white/40">Time:</span>
            <span className="text-green-400">{pattern.time_complexity}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Database size={11} className="text-blue-400/70" />
            <span className="text-white/40">Space:</span>
            <span className="text-blue-400">{pattern.space_complexity}</span>
          </div>
        </div>

        {/* When to use */}
        <Section title="When to use">
          <ul className="space-y-1">
            {pattern.when_to_use.map((w, i) => (
              <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                <span className="text-accent-purple mt-0.5">›</span>
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
                className="text-[11px] px-2 py-0.5 rounded-md bg-accent-purple/10 text-accent-purple/80"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        {/* Template */}
        <Section title="Pseudocode template">
          <pre className="text-[11px] bg-dark-600 rounded-lg p-3 overflow-x-auto
                          text-white/70 leading-relaxed font-mono whitespace-pre">
            {pattern.template_hint}
          </pre>
        </Section>

        {/* Example problems */}
        <Section title="Classic problems">
          <ul className="space-y-1">
            {pattern.example_problems.map((p, i) => (
              <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                <span className="text-white/20 mt-0.5">{i + 1}.</span>
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
      <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
