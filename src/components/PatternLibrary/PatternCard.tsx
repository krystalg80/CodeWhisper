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
      className="w-full text-left px-3 py-2.5 rounded-xl bg-dark-700/60
                 hover:bg-dark-600 border border-white/5 hover:border-white/10
                 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-white/80">{pattern.name}</span>
            <span className="text-[10px] text-white/30 bg-dark-500 px-1.5 py-0.5 rounded">
              {pattern.category}
            </span>
          </div>
          <p className="text-[11px] text-white/40 leading-snug truncate">
            {pattern.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-green-400/60">
              T: {pattern.time_complexity}
            </span>
            <span className="text-[10px] text-blue-400/60">
              S: {pattern.space_complexity}
            </span>
          </div>
        </div>
        <ChevronRight
          size={14}
          className="text-white/20 group-hover:text-white/50 transition-colors ml-2 flex-shrink-0"
        />
      </div>
    </button>
  );
}
