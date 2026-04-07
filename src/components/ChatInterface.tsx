"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onFinish: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onFinish,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (content: string) => {
    // Parse special prefixes
    return content.split("\n").map((line, i) => {
      if (line.startsWith("KEY FINDING:")) {
        return (
          <div key={i} className="bg-amber-50 border-l-2 border-amber-400 px-3 py-2 my-2 text-sm">
            <span className="text-[10px] uppercase tracking-widest text-amber-600 font-medium">Key Finding</span>
            <p className="text-stone-700 mt-1">{line.replace("KEY FINDING:", "").trim()}</p>
          </div>
        );
      }
      if (line.startsWith("FOLLOW-UP:")) {
        return (
          <div key={i} className="bg-blue-50 border-l-2 border-blue-400 px-3 py-2 my-2 text-sm">
            <span className="text-[10px] uppercase tracking-widest text-blue-600 font-medium">Follow-up</span>
            <p className="text-stone-700 mt-1">{line.replace("FOLLOW-UP:", "").trim()}</p>
          </div>
        );
      }
      if (line.startsWith("SUGGESTION:")) {
        return (
          <div key={i} className="bg-emerald-50 border-l-2 border-emerald-400 px-3 py-2 my-2 text-sm">
            <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-medium">Suggestion</span>
            <p className="text-stone-700 mt-1">{line.replace("SUGGESTION:", "").trim()}</p>
          </div>
        );
      }
      if (line.startsWith("SUMMARY:")) {
        return (
          <div key={i} className="bg-stone-50 border-l-2 border-stone-400 px-3 py-2 my-2 text-sm">
            <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">Summary</span>
            <p className="text-stone-700 mt-1">{line.replace("SUMMARY:", "").trim()}</p>
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <p key={i} className="pl-4 py-0.5 text-sm text-stone-700">{line}</p>
        );
      }
      return line ? <p key={i} className="text-sm text-stone-700 py-0.5">{line}</p> : <br key={i} />;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg font-serif text-stone-900">AI Guidance Session</h2>
          <p className="text-xs text-stone-400 mt-1">Ask questions and receive step-by-step guidance</p>
        </div>
        <button
          onClick={onFinish}
          className="btn-outline text-[9px]"
        >
          Finish & View Results
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-sm px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-50 border border-stone-100"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm font-light">{msg.content}</p>
                ) : (
                  <div>{formatMessage(msg.content)}</div>
                )}
                <span
                  className={`block text-[9px] mt-2 ${
                    msg.role === "user" ? "text-white/40" : "text-stone-300"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-stone-50 border border-stone-100 rounded-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="loading-spinner text-stone-400" />
                <span className="text-xs text-stone-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-stone-100 pt-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question or response..."
            className="form-textarea flex-1 min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary self-end disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="text-[9px] text-stone-300 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
