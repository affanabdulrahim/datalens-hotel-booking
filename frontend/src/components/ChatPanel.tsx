import { FormEvent, useState } from "react";

import { Profile, sendChatQuestion } from "../api";
import { buildDatasetIntelligence } from "../utils/datasetIntelligence";

type ChatPanelProps = {
  datasetId: string;
  profile?: Profile;
};

export function ChatPanel({ datasetId, profile }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const intelligence = profile ? buildDatasetIntelligence(profile) : null;
  const suggestedQuestions = intelligence?.suggestedQuestions || [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Type a question before sending.");
      return;
    }

    setIsSending(true);
    setAnswer(null);
    setError(null);

    try {
      const response = await sendChatQuestion(datasetId, trimmedQuestion);
      setAnswer(response.answer);
      setQuestion("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Chat request failed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              💬 Data Chat
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Ask Your Data</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Use natural language to ask questions about your dataset. The AI will analyze and provide data-driven answers powered by Google Gemini.
            </p>
          </div>
          <div className="text-5xl opacity-30">🔍</div>
        </div>
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Try These Questions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedQuestions.map((suggestedQuestion) => (
              <button
                className="group rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-left transition hover:border-cyan-500/50 hover:bg-slate-700/40"
                key={suggestedQuestion}
                onClick={() => {
                  setQuestion(suggestedQuestion);
                  setError(null);
                }}
                type="button"
              >
                <p className="text-sm text-slate-300 group-hover:text-cyan-300">{suggestedQuestion}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question Input */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="chat-question">
            Your Question
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            id="chat-question"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What is the data about? What patterns do you see? ..."
            value={question}
          />
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSending || !question.trim()}
          type="submit"
        >
          {isSending ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Asking...
            </>
          ) : (
            <>
              <span>Send Question</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

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

      {/* Answer Display */}
      {answer ? (
        <article className="rounded-2xl border border-cyan-700/50 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-300">AI Response</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{answer}</p>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
