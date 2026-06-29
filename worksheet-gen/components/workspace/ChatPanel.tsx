"use client";

import { useState, useEffect, useRef } from "react";

const MACRO_PILLS = [
  "Add Step-by-Step Answer Key",
  "Convert to Short Answer",
  "Balance Difficulty",
];

interface Message {
  role: "system" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "system",
    text: "Worksheet loaded. 3 structured questions generated for Cambridge IGCSE Physics — Forces & Newton's Laws.",
  },
];

interface ChatPanelProps {
  onSubmit: (text: string) => void;
}

export function ChatPanel({ onSubmit }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function dispatchMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    onSubmit(trimmed);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          text: "Got it — applying changes to the worksheet now.",
        },
      ]);
    }, 800);
  }

  function handleSend() {
    dispatchMessage(input);
  }

  function handlePill(pill: string) {
    dispatchMessage(pill);
  }

  return (
    <aside
      className="chat-panel flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        width: "30%",
        backgroundColor: "#ffffff",
        borderLeft: "1px solid rgba(71,87,77,0.1)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{ borderBottom: "1px solid #e5e2d9" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#47574d" }}>AI Assistant</p>
        <p className="text-xs mt-0.5" style={{ color: "#6b7b70" }}>
          Chat to modify this worksheet
        </p>
      </div>

      {/* Message log */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 hide-scrollbar"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "#47574d",
                      color: "#ffffff",
                      borderRadius: "16px 16px 4px 16px",
                    }
                  : {
                      backgroundColor: "#f0ede6",
                      color: "#47574d",
                      borderRadius: "16px 16px 16px 4px",
                    }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Lower anchor — macro pills + input */}
      <div
        className="flex-shrink-0 p-4 space-y-3"
        style={{ borderTop: "1px solid #e5e2d9" }}
      >
        {/* Macro pills */}
        <div className="flex flex-wrap gap-2">
          {MACRO_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handlePill(pill)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: "#f0ede6",
                color: "#6b7b70",
                border: "1px solid #e5e2d9",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#e5e2d9";
                (e.currentTarget as HTMLElement).style.color = "#47574d";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#f0ede6";
                (e.currentTarget as HTMLElement).style.color = "#6b7b70";
              }}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Text input row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type mutation prompt..."
            className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: "#faf9f7",
              border: "1px solid #e5e2d9",
              color: "#47574d",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#e8753b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e2d9")}
          />
          <button
            onClick={handleSend}
            aria-label="Send"
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#e8753b" }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 7.5h11M8.5 3l4.5 4.5L8.5 12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
