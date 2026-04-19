"use client";

import { Loader2, Send, X } from "lucide-react";
import { ChatMessage, type ChatMessageItem } from "@/components/chat/ChatMessage";

interface ChatPanelProps {
  draft: string;
  isOpen: boolean;
  isPending: boolean;
  messages: ChatMessageItem[];
  onChangeDraft: (value: string) => void;
  onClose: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-navy-700 bg-navy-850 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500" />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({
  draft,
  isOpen,
  isPending,
  messages,
  onChangeDraft,
  onClose,
  onKeyDown,
  onSubmit,
}: ChatPanelProps) {
  return (
    <aside
      className={`fixed bottom-6 right-6 z-50 flex h-[min(72vh,720px)] w-[min(calc(100vw-2rem),420px)] flex-col overflow-hidden rounded-[28px] border border-navy-700 bg-white shadow-[0_20px_60px_rgba(26,32,48,0.12)] transition-all duration-300 ${
        isOpen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-start justify-between gap-4 border-b border-navy-800 bg-white px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">
            Contract chat
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy-100">
            Ask about this contract
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 bg-navy-900 text-navy-400 transition-colors hover:border-gold-500 hover:text-gold-700"
          aria-label="Close contract chat"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-navy-900 px-5 py-5">
        <div className="rounded-2xl border border-navy-700 bg-navy-950/70 p-4 text-xs leading-relaxed text-navy-400">
          This chat is informational only and is not legal advice. Consult a lawyer for legal guidance before acting on anything in this document.
        </div>
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-700 bg-navy-850 p-4 text-sm leading-relaxed text-navy-500">
            Ask a follow-up about the clauses, summary, or practical risks in this document.
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isPending ? <TypingIndicator /> : null}
      </div>

      <div className="border-t border-navy-800 bg-white px-4 py-4">
        <div className="rounded-[22px] border border-navy-700 bg-navy-900 p-2">
          <textarea
            value={draft}
            onChange={(event) => onChangeDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about this contract..."
            rows={3}
            className="min-h-[84px] w-full resize-none bg-transparent px-3 py-2 text-sm text-navy-200 outline-none placeholder:text-navy-500"
          />

          <div className="mt-2 flex items-center justify-between px-2 pb-1">
            <p className="text-[11px] text-navy-500">Enter to send, Shift+Enter for newline</p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isPending || draft.trim().length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-navy-500"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
