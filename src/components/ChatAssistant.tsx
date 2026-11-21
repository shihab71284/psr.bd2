"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WHATSAPP_URL =
  "https://wa.me/8801578367800?text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%2C%20psr.bd%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A7%87%20%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A5%A4";

const UNAVAILABLE_TEXT =
  "AI chat শীঘ্রই আসছে — জরুরি হলে WhatsApp-এ মেসেজ করুন";

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, unavailable, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        error?: string;
      } | null;
      if (res.ok && data?.reply) {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      } else {
        setUnavailable(true);
      }
    } catch {
      setUnavailable(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="PSR.BD AI সহায়ক"
          style={{
            position: "fixed",
            left: "16px",
            bottom: "88px",
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "min(520px, calc(100vh - 120px))",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,.25)",
            overflow: "hidden",
            zIndex: 9999,
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              background: "#059669",
              color: "#ffffff",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "15px" }}>
              PSR.BD AI সহায়ক
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "20px",
                lineHeight: 1,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              ×
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "#f8fafc",
              minHeight: "180px",
            }}
          >
            {messages.length === 0 && (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.5,
                }}
              >
                আসসালামু আলাইকুম! psr.bd সম্পর্কে যেকোনো প্রশ্ন করুন — যেমন
                পিএসআর, ধারা ১০৪ অডিট শিল্ড, ক্লায়েন্ট ব্যবস্থাপনা বা ফ্রি ও Pro
                প্ল্যান। Hello! Ask me anything about psr.bd.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "#059669" : "#ffffff",
                  color: m.role === "user" ? "#ffffff" : "#0f172a",
                  border:
                    m.role === "user" ? "none" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  fontSize: "13px",
                  color: "#64748b",
                  padding: "4px 8px",
                }}
              >
                উত্তর লেখা হচ্ছে…
              </div>
            )}
            {unavailable && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "#92400e",
                }}
              >
                {UNAVAILABLE_TEXT}{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#059669", fontWeight: 700 }}
                >
                  WhatsApp
                </a>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px",
              borderTop: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="আপনার প্রশ্ন লিখুন… / Type your question…"
              aria-label="Chat message"
              maxLength={1000}
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              style={{
                background: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                opacity: sending || !input.trim() ? 0.6 : 1,
              }}
            >
              পাঠান
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open PSR.BD AI chat assistant"
        style={{
          position: "fixed",
          left: "20px",
          bottom: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#059669",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,.25)",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </>
  );
}
