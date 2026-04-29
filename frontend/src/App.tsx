import { useState, useCallback } from "react";
import type {
  AppView,
  UploadResponse,
  EdaResponse,
  ChartsResponse,
  ChatMessage,
} from "./types";
import { getEda, getCharts } from "./api/client";
import UploadZone from "./components/UploadZone";
import DataPreview from "./components/DataPreview";
import EdaPanel from "./components/EdaPanel";
import ChartsPanel from "./components/ChartsPanel";
import ChatPanel from "./components/ChatPanel";
import { BarChart3, Table2, MessageSquare, Upload, Sparkles } from "lucide-react";

type DashboardTab = "eda" | "charts" | "chat";

export default function App() {
  const [view, setView] = useState<AppView>("upload");
  const [sessionId, setSessionId] = useState<string>("");
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [edaData, setEdaData] = useState<EdaResponse | null>(null);
  const [chartsData, setChartsData] = useState<ChartsResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("eda");
  const [error, setError] = useState<string>("");

  const handleUploadSuccess = useCallback((data: UploadResponse) => {
    setSessionId(data.session_id);
    setUploadData(data);
    setView("preview");
    setError("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!sessionId) return;
    setView("analyzing");
    setError("");

    try {
      const [eda, charts] = await Promise.all([
        getEda(sessionId),
        getCharts(sessionId),
      ]);
      setEdaData(eda);
      setChartsData(charts);
      setView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setView("preview");
    }
  }, [sessionId]);

  const handleNewDataset = useCallback(() => {
    setView("upload");
    setSessionId("");
    setUploadData(null);
    setEdaData(null);
    setChartsData(null);
    setChatHistory([]);
    setActiveTab("eda");
    setError("");
  }, []);

  const tabs: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { key: "eda", label: "Overview", icon: <Table2 size={16} /> },
    { key: "charts", label: "Charts", icon: <BarChart3 size={16} /> },
    { key: "chat", label: "AI Chat", icon: <MessageSquare size={16} /> },
  ];

  /* ─── Upload screen ─── */
  if (view === "upload") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="text-accent" size={22} />
            </div>
            <h1 className="text-3xl font-bold text-white">
              AI Dataset Explorer
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Upload a dataset to get instant analysis, visualizations, and
            AI-powered insights
          </p>
        </div>
        <UploadZone onSuccess={handleUploadSuccess} />
        {error && (
          <p className="mt-4 text-red-400 text-sm animate-fade-in">{error}</p>
        )}
      </div>
    );
  }

  /* ─── Preview screen ─── */
  if (view === "preview" && uploadData) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-5xl animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {uploadData.filename}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {uploadData.info.shape.rows.toLocaleString()} rows ×{" "}
                {uploadData.info.shape.columns} columns
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewDataset}
                className="px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-gray-300 text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                <Upload size={14} className="inline mr-2 -mt-0.5" />
                New Dataset
              </button>
              <button
                onClick={handleAnalyze}
                className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors shadow-lg shadow-accent/25"
              >
                <Sparkles size={14} className="inline mr-2 -mt-0.5" />
                Analyze Dataset
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm animate-fade-in">
              {error}
            </p>
          )}

          <DataPreview preview={uploadData.preview} />
        </div>
      </div>
    );
  }

  /* ─── Analyzing screen ─── */
  if (view === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-accent animate-pulse-soft" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Analyzing your dataset…
          </h2>
          <p className="text-gray-400 text-sm">
            Generating statistics, charts, and insights
          </p>
          <div className="mt-8 flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-accent animate-pulse-soft"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Dashboard screen ─── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-surface-border bg-dark-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles className="text-accent" size={14} />
            </div>
            <span className="font-semibold text-white text-sm">
              {uploadData?.filename}
            </span>
            <span className="text-gray-500 text-xs">
              {uploadData?.info.shape.rows.toLocaleString()} rows ×{" "}
              {uploadData?.info.shape.columns} cols
            </span>
          </div>
          <button
            onClick={handleNewDataset}
            className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-gray-400 text-xs font-medium hover:bg-surface-hover hover:text-white transition-colors"
          >
            <Upload size={12} className="inline mr-1.5 -mt-0.5" />
            New Dataset
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-surface-border bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-accent text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === "eda" && edaData && (
          <div className="animate-fade-in">
            <EdaPanel eda={edaData} />
          </div>
        )}
        {activeTab === "charts" && chartsData && (
          <div className="animate-fade-in">
            <ChartsPanel charts={chartsData.charts} />
          </div>
        )}
        {activeTab === "chat" && (
          <div className="animate-fade-in">
            <ChatPanel
              sessionId={sessionId}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
