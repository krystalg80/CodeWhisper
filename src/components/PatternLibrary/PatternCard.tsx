import { ChevronRight } from "lucide-react";
import type { AlgorithmPattern } from "@/types";

interface Props {
  pattern: AlgorithmPattern;
  onClick: () => void;
}

export function PatternCard({ pattern, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-xl bg-surface-raised
                 hover:bg-surface-muted border border-surface-border/30 hover:border-surface-border/60
                 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-tx-primary">{pattern.name}</span>
            <span className="text-[10px] text-tx-tertiary bg-surface-overlay px-1.5 py-0.5 rounded">
              {pattern.category}
            </span>
          </div>
          <p className="text-[11px] text-tx-tertiary leading-snug truncate">
            {pattern.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-green-600">
              T: {pattern.time_complexity}
            </span>
            <span className="text-[10px] text-blue-600">
              S: {pattern.space_complexity}
            </span>
          </div>
        </div>
        <ChevronRight
          size={14}
          className="text-tx-tertiary group-hover:text-tx-secondary transition-colors ml-2 flex-shrink-0"
        />
      </div>
    </button>
  );
}
