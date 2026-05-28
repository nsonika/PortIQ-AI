"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { ChatMessage } from "@/types/portfolio";

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

const QUICK_PROMPTS = [
  "What are the main risk factors in my portfolio?",
  "How can I better balance my sector allocation?",
  "List my winning vs losing assets",
];

export default function AIChat({ messages, onSendMessage, loading }: AIChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages are appended
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    await onSendMessage(text);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (loading) return;
    await onSendMessage(prompt);
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col h-[600px] border border-white/10 overflow-hidden relative">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Berrywise Advisor Chat</h3>
            <p className="text-[10px] text-slate-500">Discuss assets & rebalancing strategies</p>
          </div>
        </div>
        
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] uppercase font-bold tracking-wider">
          <Sparkles className="w-3 h-3" />
          Active Context
        </span>
      </div>

      {/* Message Screen */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6">
            <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            
            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="text-white text-sm font-semibold">Start your Analysis</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Ask about single-stock weights, diversification recommendations, or industry exposures.
              </p>
            </div>

            {/* Quick Prompts Panel */}
            <div className="w-full max-w-sm pt-2 flex flex-col gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleQuickPrompt(p)}
                  className="w-full text-left text-xs bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-violet-950/10 text-slate-300 p-3 rounded-lg transition-all cursor-pointer font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar */}
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
              )}

              {/* Speech bubble */}
              <div
                className={`max-w-[85%] text-xs p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-md shadow-violet-600/10"
                    : "bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-none"
                }`}
              >
                {m.content}
              </div>

              {/* User Avatar */}
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Spinner bubble */}
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 text-slate-400 p-3.5 rounded-xl rounded-tl-none flex items-center gap-2 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              Thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions when history exists */}
      {messages.length > 0 && !loading && (
        <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleQuickPrompt(p)}
              className="text-[10px] bg-white/[0.02] border border-white/5 hover:border-violet-500/30 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md transition-all cursor-pointer inline-block shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about your portfolio..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 text-white p-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
