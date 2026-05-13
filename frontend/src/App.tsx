import { useState } from "react";
import { UploadForm } from "./components/UploadForm";
import { Dashboard } from "./components/Dashboard";
import { ChatPanel } from "./components/ChatPanel";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { Profile, UploadResponse } from "./api";

export default function App() {
  const [dataset, setDataset] = useState<UploadResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "summary">("dashboard");

  const handleUpload = (response: UploadResponse) => {
    setDataset(response);
    setActiveTab("dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <span className="text-lg font-bold text-white">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DataLens</h1>
                <p className="text-xs text-slate-400">Analytics Dashboard</p>
              </div>
            </div>
          </div>

          {dataset && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2">
              <span className="text-sm text-slate-300">
                📁 {dataset.filename}
              </span>
              <button
                onClick={() => setDataset(null)}
                className="text-xs text-slate-400 hover:text-slate-300 transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!dataset ? (
          <UploadForm onUpload={handleUpload} />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="mb-8 flex gap-2 border-b border-slate-800">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "dashboard"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "chat"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "summary"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                ✨ Summary
              </button>
            </div>

            {/* Content */}
            <div className="animate-fadeIn">
              {activeTab === "dashboard" && (
                <Dashboard profile={dataset.profile} rowCount={dataset.row_count} />
              )}
              {activeTab === "chat" && <ChatPanel datasetId={dataset.dataset_id} />}
              {activeTab === "summary" && <ExecutiveSummary datasetId={dataset.dataset_id} />}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
