import { useState, useEffect, useRef } from "react";
import { Camera, Sparkles, Loader2, X } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { useAppStore } from "@/stores/appStore";
import { captureScreen, extractTextFromScreenshot } from "@/lib/tauri";

export function ProblemPanel() {
  const { problemText, setProblemText, analyzeProblem, analysis, isAnalyzing, currentSession, startNewSession } =
    useSessionStore();
  const { setLastScreenshot } = useAppStore();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [problemText]);

  const handleScreenCapture = async () => {
    setOcrError(null);
    setOcrLoading(true);
    try {
      const screenshot = await captureScreen();
      setLastScreenshot(screenshot.base64_png);
      const ocrResult = await extractTextFromScreenshot(screenshot.base64_png);
      if (ocrResult.text.trim()) {
        setProblemText(ocrResult.text);
      } else {
        setOcrError("No text detected in screenshot. Try manually pasting the problem.");
      }
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : String(err));
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentSession) {
      await startNewSession();
    }
    await analyzeProblem();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-border/60">
        <button
          onClick={handleScreenCapture}
          disabled={ocrLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                     bg-surface-raised hover:bg-surface-muted text-tx-secondary hover:text-tx-primary
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Capture screen and extract problem via OCR"
        >
          {ocrLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Camera size={12} />
          )}
          {ocrLoading ? "Capturing..." : "Screen OCR"}
        </button>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !problemText.trim()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                     bg-ca-purple/20 hover:bg-ca-purple/30 text-ca-purple
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Analyze problem with AI"
        >
          {isAnalyzing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {isAnalyzing ? "Analyzing..." : "AI Analyze"}
        </button>

        {problemText && (
          <button
            onClick={() => setProblemText("")}
            className="ml-auto text-tx-tertiary hover:text-tx-secondary transition-colors"
            title="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Problem input */}
      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3">
        {ocrError && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {ocrError}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="Paste or capture the problem statement here...

The AI coach will help you think through it — step by step."
          className="w-full bg-transparent text-tx-primary text-xs leading-relaxed
                     resize-none outline-none placeholder:text-tx-tertiary
                     min-h-[120px]"
          style={{ fontFamily: "inherit" }}
        />

        {/* AI Analysis results */}
        {analysis && (
          <div className="mt-4 space-y-3 animate-slide-up">
            <div className="h-px bg-surface-border/60" />

            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-tx-tertiary uppercase tracking-wider">
                Analysis
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${
                    analysis.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400"
                      : analysis.difficulty === "Medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
              >
                {analysis.difficulty}
              </span>
            </div>

            <p className="text-sm text-tx-primary font-medium">{analysis.problem_title}</p>

            {analysis.patterns.length > 0 && (
              <div>
                <p className="text-xs text-tx-tertiary mb-1.5">Patterns detected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.patterns.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 rounded-md bg-ca-blue/20 text-ca-blue"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.key_constraints.length > 0 && (
              <div>
                <p className="text-xs text-tx-tertiary mb-1.5">Key constraints:</p>
                <ul className="space-y-0.5">
                  {analysis.key_constraints.map((c, i) => (
                    <li key={i} className="text-xs text-tx-secondary flex items-start gap-1.5">
                      <span className="text-ca-purple mt-0.5">›</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggested_data_structures.length > 0 && (
              <div>
                <p className="text-xs text-tx-tertiary mb-1.5">Consider using:</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.suggested_data_structures.map((ds) => (
                    <span
                      key={ds}
                      className="text-xs px-2 py-0.5 rounded-md bg-surface-overlay text-tx-secondary"
                    >
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
