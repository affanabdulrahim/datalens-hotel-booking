import { useState } from "react";

import { Profile, SummaryResponse, generateExecutiveSummary } from "../api";
import { buildDatasetIntelligence } from "../utils/datasetIntelligence";

type ExecutiveSummaryProps = {
  datasetId: string;
  filename?: string;
  profile?: Profile;
};

export function ExecutiveSummary({ datasetId, filename, profile }: ExecutiveSummaryProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intelligence = profile ? buildDatasetIntelligence(profile, filename) : null;

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateExecutiveSummary(datasetId);
      setSummary(response);
    } catch (caughtError) {
      setSummary(null);
      setError(caughtError instanceof Error ? caughtError.message : "Summary request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleExport() {
    if (!summary) return;
    const content = `
${intelligence?.typeLabel || "Dataset"} Summary Report
Generated: ${new Date().toLocaleDateString()}

Dataset: ${filename || datasetId}

EXECUTIVE SUMMARY
${summary.summary}

KEY FINDINGS
${summary.key_findings.map((f) => `• ${f}`).join("\n")}

DATA QUALITY NOTES
${summary.data_quality_notes.map((n) => `• ${n}`).join("\n")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DataLens-Summary-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              ✨ Insights
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Executive Summary</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              AI-generated data-driven insights and analysis of your dataset with key findings and data quality metrics.
            </p>
          </div>
          <div className="text-5xl opacity-30">📊</div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
        onClick={handleGenerate}
        type="button"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Generating Summary...
          </>
        ) : (
          <>
            <span>Generate Summary</span>
            <span>→</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error ? (
        <div className="rounded-xl border border-red-700/50 bg-red-950/30 p-4 text-sm text-red-400" role="alert">
          <div className="flex gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Summary Display */}
      {summary ? (
        <article className="space-y-6">
          {/* Main Summary */}
          <div className="rounded-2xl border border-purple-700/50 bg-gradient-to-br from-purple-950/30 to-purple-900/20 p-6 backdrop-blur-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-purple-300">
              <span>📝</span> Summary
            </h3>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-200">{summary.summary}</p>
          </div>

          {/* Key Findings */}
          {summary.key_findings.length > 0 && (
            <div className="rounded-2xl border border-cyan-700/50 bg-gradient-to-br from-cyan-950/30 to-cyan-900/20 p-6 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-300">
                <span>🔍</span> Key Findings
              </h3>
              <div className="mt-4 space-y-3">
                {summary.key_findings.map((finding, idx) => (
                  <div className="flex gap-4" key={idx}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-600/30 text-cyan-300 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="leading-7 text-slate-200 pt-0.5">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality Notes */}
          {summary.data_quality_notes.length > 0 && (
            <div className="rounded-2xl border border-green-700/50 bg-gradient-to-br from-green-950/30 to-green-900/20 p-6 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-green-300">
                <span>✅</span> Data Quality
              </h3>
              <ul className="mt-4 space-y-3">
                {summary.data_quality_notes.map((note, idx) => (
                  <li className="flex gap-3 text-slate-200" key={idx}>
                    <span className="flex-shrink-0 text-green-400 font-bold">✓</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Export Button */}
          <div className="flex gap-3 pt-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-600/50 border border-slate-600"
              onClick={handleExport}
              type="button"
            >
              <span>⬇️</span> Download Summary
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
