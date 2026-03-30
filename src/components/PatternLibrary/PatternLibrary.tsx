import { useState } from "react";
import { ALGORITHM_PATTERNS } from "@/data/patterns";
import { PatternCard } from "./PatternCard";
import { PatternDetail } from "./PatternDetail";
import type { AlgorithmPattern } from "@/types";
import { Search } from "lucide-react";

export function PatternLibrary() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AlgorithmPattern | null>(null);

  const filtered = ALGORITHM_PATTERNS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.key_signals.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    return <PatternDetail pattern={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 bg-dark-600 rounded-lg px-2.5 py-1.5">
          <Search size={12} className="text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="flex-1 bg-transparent text-xs text-white/70 outline-none
                       placeholder:text-white/25"
          />
        </div>
      </div>

      {/* Pattern list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {filtered.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            onClick={() => setSelected(pattern)}
          />
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-xs text-white/30 py-8">
            No patterns match "{search}"
          </p>
        )}
      </div>
    </div>
  );
}
