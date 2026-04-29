import { useState, useRef, useEffect, useCallback } from "react";
import { streamChat } from "../api/client";
import type { ChatMessage } from "../types";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Props {
  sessionId: string;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ChatPanel({
  sessionId,
  chatHistory,
  setChatHistory,
}: Props) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [chatHistory, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || streaming) return;

    setInput("");
    setStreaming(true);

    // Add user message
    setChatHistory((prev) => [...prev, { role: "user", content: msg }]);

    // Add empty assistant message that will be streamed into
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);

    await streamChat(
      sessionId,
      msg,
      (token) => {
        setChatHistory((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
          }
          return updated;
        });
      },
      () => {
        setStreaming(false);
      },
      (error) => {
        setChatHistory((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: `⚠️ ${error}`,
            };
          }
          return updated;
        });
        setStreaming(false);
      }
    );
  }, [input, streaming, sessionId, setChatHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What are the main patterns in this data?",
    "Show me summary statistics",
    "Which columns are most correlated?",
    "Are there any outliers?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
              <Bot className="text-accent" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-1">
              Ask anything about your data
            </h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
              The AI agent can analyze your dataset, run calculations, and
              provide insights
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-2 rounded-xl bg-surface border border-surface-border text-gray-400 text-xs hover:bg-surface-hover hover:text-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-tr-md"
                  : "bg-surface border border-surface-border text-gray-300 rounded-tl-md"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" &&
                msg.content === "" &&
                streaming && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Loader2 size={12} className="animate-spin" />
                    thinking…
                  </span>
                )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-surface-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data…"
            disabled={streaming}
            className="flex-1 px-4 py-3 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-gray-500 focus:border-accent focus:ring-0 focus:outline-none disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="px-4 py-3 rounded-xl bg-accent text-white hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {streaming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
